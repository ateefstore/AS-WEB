import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import https from 'https';
import http from 'http';
import { URL } from 'url';
import OpenAI from "openai";

// AI Integrations OpenAI setup
const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || "dummy",
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Proxy Endpoint
  app.get(api.proxy.fetch.path, async (req, res) => {
    const rawUrl = req.query.url as string;

    if (!rawUrl) {
      return res.status(400).send("URL is required");
    }

    let targetUrl: string;
    try {
      // Basic validation and protocol addition
      if (!rawUrl.startsWith('http')) {
        // If it's a domain-like string, prefix it
        if (rawUrl.includes('.') && !rawUrl.includes(' ')) {
          targetUrl = `https://${rawUrl}`;
        } else {
          // Otherwise treat as search query
          targetUrl = `https://www.google.com/search?q=${encodeURIComponent(rawUrl)}`;
        }
      } else {
        targetUrl = rawUrl;
      }
      new URL(targetUrl); // Validate URL
    } catch (e) {
      return res.status(400).send("Invalid URL");
    }

    // Simple fetch-based proxy
    try {
      const fetchResponse = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          'Accept-Language': 'en-US,en;q=0.9',
        }
      });

      // Forward status
      res.status(fetchResponse.status);

      // Forward headers (filtering out security policies that block iframes)
      fetchResponse.headers.forEach((value, key) => {
        const lowerKey = key.toLowerCase();
        if (
          lowerKey !== 'content-encoding' && // Let express handle encoding
          lowerKey !== 'content-length' &&
          lowerKey !== 'x-frame-options' && // Allow iframe
          lowerKey !== 'content-security-policy' && // Allow iframe/scripts
          lowerKey !== 'frame-options'
        ) {
          res.setHeader(key, value);
        }
      });

      // Basic HTML rewriting to fix relative links (very naive implementation)
      const contentType = fetchResponse.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        let text = await fetchResponse.text();
        const origin = new URL(targetUrl).origin;
        
        // Simple regex to rewrite src="/..." and href="/..." to absolute URLs
        // This is a basic "Proxy" feature. For a full browser, this is complex.
        // We will do a best-effort rewrite for the demo.
        // Note: For a true proxy browser, we'd route these back through the proxy, 
        // but for now let's just make them absolute so they load directly if possible,
        // or through proxy if we prepend the proxy url.
        // Let's rewrite them to go through the proxy for better "browser" feel.
        
        const proxyBase = `/api/proxy?url=`;
        
        // Helper to rewrite URL
        const rewriteUrl = (match: string, attr: string, link: string) => {
            if (link.startsWith('http')) {
                // External link -> Proxy it
                return `${attr}="${proxyBase}${encodeURIComponent(link)}"`;
            } else if (link.startsWith('//')) {
                 // Protocol relative -> Proxy it
                 return `${attr}="${proxyBase}${encodeURIComponent('https:' + link)}"`;
            } else if (link.startsWith('/')) {
                // Absolute path -> Proxy with origin
                return `${attr}="${proxyBase}${encodeURIComponent(origin + link)}"`;
            } else {
                // Relative path -> Try to resolve (simplified)
                return `${attr}="${proxyBase}${encodeURIComponent(origin + '/' + link)}"`;
            }
        };

        // Rewrite hrefs (links)
        text = text.replace(/(href)=["']([^"']*)["']/gi, (match, attr, link) => {
           if (link.startsWith('#') || link.startsWith('javascript:')) return match;
           return rewriteUrl(match, attr, link);
        });
        
        // Rewrite srcs (images, scripts) - OPTIONAL: might break some things if we proxy heavy assets
        // Let's try to just resolve them to absolute URLs so they load from source 
        // to save our bandwidth, UNLESS it's a script that needs to run in context.
        // For simplicity in this 'Quick Edit' mode, let's just return the text with base tag.
        
        const baseTag = `<base href="${origin}/">`;
        text = text.replace('<head>', `<head>${baseTag}`);
        
        res.send(text);

      } else {
        // Stream other content types directly
        const arrayBuffer = await fetchResponse.arrayBuffer();
        res.send(Buffer.from(arrayBuffer));
      }

    } catch (error) {
      console.error("Proxy error:", error);
      res.status(500).send(`Error fetching url: ${error}`);
    }
  });

  app.get(api.proxy.fetch.path, async (req, res) => {
    // ... existing proxy code ...
  });

  app.post(api.proxy.search.path, async (req, res) => {
    try {
      const { query } = api.proxy.search.input.parse(req.body);
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an ultra-advanced search engine. Provide a comprehensive, accurate, and insightful response. Also provide 5 highly relevant URLs with titles and short descriptions. Format as JSON: { \"answer\": \"...\", \"results\": [{ \"title\": \"...\", \"url\": \"...\", \"snippet\": \"...\" }] }"
          },
          { role: "user", content: query }
        ],
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      res.json(JSON.parse(content || "{}"));
    } catch (err) {
      console.error("Search error:", err);
      res.status(500).json({ message: "Search failed" });
    }
  });

  app.get(api.history.list.path, async (req, res) => {
    const items = await storage.getHistory();
    res.json(items);
  });

  app.post(api.history.create.path, async (req, res) => {
    try {
      const input = api.history.create.input.parse(req.body);
      const item = await storage.createHistory(input);
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
        return;
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.downloads.list.path, async (req, res) => {
    const items = await storage.getDownloads();
    res.json(items);
  });

  app.post(api.downloads.create.path, async (req, res) => {
    try {
      const input = api.downloads.create.input.parse(req.body);
      const item = await storage.createDownload(input);
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
        return;
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch(api.downloads.update.path, async (req, res) => {
    try {
      const { status, progress } = api.downloads.update.input.parse(req.body);
      const id = parseInt(req.params.id);
      const item = await storage.updateDownloadStatus(id, status, progress);
      res.json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
        return;
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.feedback.create.path, async (req, res) => {
    try {
      const input = api.feedback.create.input.parse(req.body);
      const item = await storage.createFeedback(input);
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
         res.status(400).json({ message: err.errors[0].message });
         return;
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}
