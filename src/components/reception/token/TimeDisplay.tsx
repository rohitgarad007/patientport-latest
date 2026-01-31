import { useState, useEffect } from "react";
import { Calendar } from "lucide-react";

interface TimeDisplayProps {
  variant?: "default" | "large" | "compact" | "minimal";
}

export const TimeDisplay = ({ variant = "default" }: TimeDisplayProps) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatShortDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  if (variant === "large") {
    return (
      <div className="text-center">
        <div className="token-number text-6xl font-bold text-foreground">{formatTime(time)}</div>
        <p className="text-lg text-muted-foreground mt-2">{formatDate(time)}</p>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-3 text-sm">
        <span className="font-semibold">{formatTime(time)}</span>
        <span className="opacity-80">{formatShortDate(time)}</span>
      </div>
    );
  }

  if (variant === "minimal") {
    return (
      <span className="token-number text-lg font-bold">{formatTime(time)}</span>
    );
  }

  return (
    <div className="flex items-center gap-4 bg-card p-4 rounded-xl shadow-md">
      <div className="p-3 rounded-lg bg-primary/10">
        <Calendar className="w-6 h-6 text-primary" />
      </div>
      <div>
        <div className="token-number text-2xl font-bold text-foreground">{formatTime(time)}</div>
        <p className="text-sm text-muted-foreground">{formatShortDate(time)}</p>
      </div>
    </div>
  );
};
