import { Search, RotateCw, Shield, Star, Lock, Menu, ArrowLeft, ArrowRight, Settings } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface AddressBarProps {
  url: string;
  isLoading: boolean;
  onNavigate: (url: string) => void;
  onRefresh: () => void;
  onBack: () => void;
  onForward: () => void;
  onSettingsClick: () => void;
}

export function AddressBar({ url, isLoading, onNavigate, onRefresh, onBack, onForward, onSettingsClick }: AddressBarProps) {
  const [inputUrl, setInputUrl] = useState(url);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync input with prop changes unless focused
  useEffect(() => {
    if (!isFocused) {
      setInputUrl(url);
    }
  }, [url, isFocused]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let target = inputUrl.trim();
    if (!target) return;
    
    // Basic URL cleanup
    if (!target.startsWith("http://") && !target.startsWith("https://")) {
      target = "https://" + target;
    }
    
    onNavigate(target);
    inputRef.current?.blur();
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-secondary/50 backdrop-blur-md border-b border-white/5 z-20">
      {/* Navigation Controls */}
      <div className="flex items-center gap-1">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button onClick={onForward} className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowRight className="w-4 h-4" />
        </button>
        <button 
          onClick={onRefresh}
          className={cn(
            "p-2 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors",
            isLoading && "animate-spin"
          )}
        >
          <RotateCw className="w-4 h-4" />
        </button>
      </div>

      {/* Omni-box */}
      <form 
        onSubmit={handleSubmit}
        className={cn(
          "flex-1 flex items-center gap-3 px-4 h-10 bg-background/50 rounded-full border transition-all duration-300",
          isFocused 
            ? "border-primary/50 ring-2 ring-primary/20 shadow-[0_0_15px_-5px_hsl(var(--primary)/0.3)]" 
            : "border-transparent hover:bg-background/70 hover:border-white/5"
        )}
      >
        <div className="text-muted-foreground">
          {url.startsWith("https") ? (
            <Lock className="w-3.5 h-3.5 text-green-400" />
          ) : (
            <Search className="w-3.5 h-3.5" />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          onFocus={() => { setIsFocused(true); inputRef.current?.select(); }}
          onBlur={() => setIsFocused(false)}
          className="flex-1 bg-transparent border-none outline-none text-sm font-mono text-foreground placeholder:text-muted-foreground/50"
          placeholder="Search or enter website name"
        />

        <div className="flex items-center gap-2">
           <button type="button" className="p-1 rounded-md hover:bg-white/10 text-muted-foreground hover:text-yellow-400 transition-colors">
            <Star className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>

      {/* Action Menu */}
      <div className="flex items-center gap-1 pl-2 border-l border-white/5">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            <Shield className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary">VPN ON</span>
        </div>
        
        <button onClick={onSettingsClick} className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors">
          <Settings className="w-4 h-4" />
        </button>
        <button className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors">
          <Menu className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
