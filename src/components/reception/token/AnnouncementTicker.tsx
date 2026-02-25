import { useEffect, useState } from "react";
import { Phone, Volume2 } from "lucide-react";
import { announcements } from "@/data/hospitalData-2";
import { receptionService } from "@/services/ReceptionService";

interface AnnouncementTickerProps {
  variant?: "default" | "dark" | "minimal";
  doctorId?: string;
}

export const AnnouncementTicker = ({ variant = "default", doctorId }: AnnouncementTickerProps) => {
  const [message, setMessage] = useState<string>("");
  const fallback = announcements.map(a => a.message).join(' • ');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const msg = await receptionService.fetchAnnouncementMessage(doctorId);
        if (!cancelled) setMessage(msg || "Now Coming...");
      } catch {
        if (!cancelled) setMessage("Now Coming...");
      }
    };
    load();
    return () => { cancelled = true; };
  }, [doctorId]);
  
  const variantClasses = {
    default: "bg-warning/10 text-warning-foreground border-t border-warning/20",
    dark: "bg-card/50 text-foreground border-t border-border",
    minimal: "bg-muted text-muted-foreground",
  };

  return (
    <div className="relative overflow-hidden bg-white/95 backdrop-blur-sm border-t border-slate-200 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
      <div className="flex items-center py-1.5 px-2">
        <div className="flex-shrink-0 flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 py-1 px-3 rounded-full font-bold text-[10px] uppercase tracking-wider shadow-sm mr-3">
          <Volume2 className="w-3 h-3" />
          Announcement
        </div>
        
        <div className="flex-1 overflow-hidden relative h-6 flex items-center">
          <div className="animate-marquee whitespace-nowrap inline-block text-sm font-medium text-slate-600">
             {(message || fallback)} • {(message || fallback)} • {(message || fallback)} • 
          </div>
          {/* Gradients for smooth fade effect */}
          <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-white/95 to-transparent z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-white/95 to-transparent z-10"></div>
        </div>

        <div className="flex-shrink-0 ml-3 flex items-center gap-2 bg-destructive/5 text-destructive border border-destructive/10 py-1 px-3 rounded-full font-bold text-[10px] shadow-sm hover:bg-destructive/10 transition-colors">
          <Phone className="w-3 h-3" />
          Emergency: 911
        </div>
      </div>
    </div>
  );
};
