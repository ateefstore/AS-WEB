import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useSubmitFeedback } from "@/hooks/use-browser";
import { Loader2, Send } from "lucide-react";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [adBlock, setAdBlock] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [feedback, setFeedback] = useState("");
  const feedbackMutation = useSubmitFeedback();

  const handleFeedbackSubmit = async () => {
    if (!feedback.trim()) return;
    try {
      await feedbackMutation.mutateAsync({ message: feedback, rating: 5 });
      setFeedback("");
      onOpenChange(false);
    } catch (e) {
      // handled by hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md glass-panel bg-secondary/90 border-white/10 text-foreground">
        <DialogHeader>
          <DialogTitle className="text-xl">Browser Settings</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Configure your browsing experience.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="ad-block" className="flex flex-col space-y-1">
              <span>Ad Blocker</span>
              <span className="font-normal text-xs text-muted-foreground">Block intrusive ads and trackers</span>
            </Label>
            <Switch id="ad-block" checked={adBlock} onCheckedChange={setAdBlock} />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="dark-mode" className="flex flex-col space-y-1">
              <span>Dark Mode</span>
              <span className="font-normal text-xs text-muted-foreground">Always use dark theme</span>
            </Label>
            <Switch id="dark-mode" checked={darkMode} onCheckedChange={setDarkMode} />
          </div>

          <div className="space-y-3 pt-4 border-t border-white/5">
            <Label>Send Feedback</Label>
            <Textarea 
              placeholder="Tell us what you think..." 
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="resize-none bg-background/50 border-white/10 focus:border-primary/50"
            />
            <Button 
              onClick={handleFeedbackSubmit}
              disabled={feedbackMutation.isPending || !feedback.trim()}
              className="w-full bg-primary hover:bg-primary/90 text-white"
            >
              {feedbackMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              Submit Feedback
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
