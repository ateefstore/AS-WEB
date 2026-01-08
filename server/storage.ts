import { db } from "./db";
import {
  feedback,
  type InsertFeedback,
  type Feedback,
  history,
  type History,
  type InsertHistory,
  downloads,
  type Download,
  type InsertDownload
} from "@shared/schema";
import { desc, eq } from "drizzle-orm";

export interface IStorage {
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  // History
  getHistory(): Promise<History[]>;
  createHistory(item: InsertHistory): Promise<History>;
  // Downloads
  getDownloads(): Promise<Download[]>;
  createDownload(item: InsertDownload): Promise<Download>;
  updateDownloadStatus(id: number, status: string): Promise<Download>;
}

export class DatabaseStorage implements IStorage {
  async createFeedback(insertFeedback: InsertFeedback): Promise<Feedback> {
    const [item] = await db.insert(feedback).values(insertFeedback).returning();
    return item;
  }

  async getHistory(): Promise<History[]> {
    return await db.select().from(history).orderBy(desc(history.timestamp)).limit(100);
  }

  async createHistory(item: InsertHistory): Promise<History> {
    const [res] = await db.insert(history).values(item).returning();
    return res;
  }

  async getDownloads(): Promise<Download[]> {
    return await db.select().from(downloads).orderBy(desc(downloads.timestamp));
  }

  async createDownload(item: InsertDownload): Promise<Download> {
    const [res] = await db.insert(downloads).values(item).returning();
    return res;
  }

  async updateDownloadStatus(id: number, status: string, progress?: number): Promise<Download> {
    const [res] = await db.update(downloads)
      .set({ status, progress: progress ?? undefined })
      .where(eq(downloads.id, id))
      .returning();
    return res;
  }
}

export const storage = new DatabaseStorage();
