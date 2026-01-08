import { X, Globe, ShieldCheck, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface BrowserTabProps {
  id: string;
  title: string;
  isActive: boolean;
  onActivate: () => void;
  onClose: (e: React.MouseEvent) => void;
  isLoading?: boolean;
}

export function BrowserTab({ id, title, isActive, onActivate, onClose, isLoading }: BrowserTabProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      onClick={onActivate}
      className={cn(
        "group relative flex items-center gap-2 px-3 py-2 pr-2 min-w-[160px] max-w-[240px] rounded-t-lg cursor-pointer transition-all duration-200 select-none",
        isActive 
          ? "bg-secondary/80 text-foreground border-t border-x border-white/5 shadow-[0_-4px_10px_-2px_rgba(0,0,0,0.2)] z-10" 
          : "text-muted-foreground hover:bg-white/5 hover:text-foreground z-0"
      )}
    >
      {/* Favicon / Status Icon */}
      <div className="flex-shrink-0">
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
        ) : (
          <Globe className={cn("w-4 h-4", isActive ? "text-primary neon-glow" : "opacity-50")} />
        )}
      </div>

      {/* Title */}
      <span className="flex-1 text-sm font-medium truncate">
        {title || "New Tab"}
      </span>

      {/* Close Button */}
      <button
        onClick={onClose}
        className={cn(
          "p-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/20 hover:text-red-400",
          isActive && "opacity-100"
        )}
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Active Indicator Line */}
      {isActive && (
        <motion.div
          layoutId="activeTabIndicator"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary neon-glow"
        />
      )}
    </motion.div>
  );
}
