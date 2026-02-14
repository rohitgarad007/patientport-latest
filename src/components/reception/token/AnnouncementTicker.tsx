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
    <div className={`relative overflow-hidden py-3 ${variantClasses[variant]}`}>
      <div className="flex items-center">
        <div className="flex-shrink-0 px-4 flex items-center gap-2 bg-destructive text-destructive-foreground py-1 px-3 rounded-r-full font-semibold text-sm z-10">
          <Volume2 className="w-4 h-4" />
          ANNOUNCEMENT
        </div>
        <div className="flex-1 overflow-hidden mx-4 announcement-ticker">
          <div className="animate-marquee whitespace-nowrap inline-block">
             {(message || fallback)} • {(message || fallback)} • {(message || fallback)} • 
          </div>
        </div>
        <div className="flex-shrink-0 px-4 flex items-center gap-2 bg-destructive text-destructive-foreground py-2 px-4 rounded-l-full font-semibold text-sm">
          <Phone className="w-4 h-4" />
          Emergency: 911
        </div>
      </div>
    </div>
  );
};
