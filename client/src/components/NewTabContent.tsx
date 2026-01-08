import { Search, Command, Compass, Zap, Shield } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

interface NewTabContentProps {
  onSearch: (term: string) => void;
}

export function NewTabContent({ onSearch }: NewTabContentProps) {
  const [term, setTerm] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (term.trim()) onSearch(term);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background animate-in fade-in zoom-in duration-500">
      
      {/* Hero Logo */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-accent mb-6 shadow-2xl shadow-primary/30 neon-glow">
          <Zap className="w-12 h-12 text-white fill-white" />
        </div>
        <h1 className="text-5xl font-bold mb-3 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/50">
          AS Web Browser
        </h1>
        <p className="text-lg text-muted-foreground">The future of browsing is fast, private, and secure.</p>
      </motion.div>

      {/* Search Bar */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-2xl relative group"
      >
        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <form onSubmit={handleSearch} className="relative flex items-center bg-secondary/80 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl p-2 pl-6 group-focus-within:border-primary/50 group-focus-within:ring-4 ring-primary/10 transition-all">
          <Search className="w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search the web or type a URL"
            className="flex-1 h-12 bg-transparent border-none outline-none px-4 text-lg placeholder:text-muted-foreground/50"
            autoFocus
          />
          <button type="submit" className="h-10 px-6 rounded-full bg-primary hover:bg-primary/90 text-white font-medium transition-transform active:scale-95 shadow-lg shadow-primary/25">
            Go
          </button>
        </form>
      </motion.div>

      {/* Quick Links */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 w-full max-w-3xl"
      >
        {[
          { icon: Compass, label: "Explore", color: "text-blue-400", bg: "bg-blue-500/10" },
          { icon: Shield, label: "Privacy", color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { icon: Command, label: "Shortcuts", color: "text-purple-400", bg: "bg-purple-500/10" },
          { icon: Zap, label: "Speed Test", color: "text-amber-400", bg: "bg-amber-500/10" },
        ].map((item, i) => (
          <button key={i} className="flex flex-col items-center gap-3 p-6 rounded-2xl glass-panel hover:bg-white/5 hover:scale-105 transition-all duration-300 group">
            <div className={`p-4 rounded-xl ${item.bg} group-hover:bg-opacity-20 transition-colors`}>
              <item.icon className={`w-6 h-6 ${item.color}`} />
            </div>
            <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">{item.label}</span>
          </button>
        ))}
      </motion.div>
    </div>
  );
}
