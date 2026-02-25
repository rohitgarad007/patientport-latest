import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import { getMyEventSchedule } from "@/services/doctorService";

export function WeeklyCalendar() {
  const [schedule, setSchedule] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    getMyEventSchedule()
      .then((data) => {
        if (mounted) setSchedule(Array.isArray(data) ? data : []);
      })
      .catch(() => setSchedule([]));
    return () => {
      mounted = false;
    };
  }, []);

  // 👉 Format date to "November 30"
  const formatPrettyDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    });
  };

  // 👉 Convert HEX → rgba() with 65% opacity
  const lightenColor = (hex: string, opacity = 0.65) => {
    if (!hex || !hex.startsWith("#") || hex.length !== 7) return hex;
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  // 👉 Convert "07:00:00" → "7:00 AM"
  const formatTime12 = (timeStr: string) => {
    const [hour, minute] = timeStr.split(":");
    const h = parseInt(hour, 10);
    const suffix = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return `${hour12}:${minute} ${suffix}`;
  };

  // 👉 Get next 7 days
  const next7Days = useMemo(() => {
    if (!schedule || schedule.length === 0) return [];
    const todayStr = new Date().toISOString().slice(0, 10);
    const startIndex = schedule.findIndex((d: any) => d.date === todayStr);
    const start = startIndex >= 0 ? startIndex : 0;
    return schedule.slice(start, start + 7);
  }, [schedule]);

  const todayLabel = useMemo(() => {
    return new Date().toLocaleDateString(undefined, { weekday: "long" });
  }, []);

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-xl">Weekly Schedule</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-7 gap-3">
          {next7Days.map((dayItem, index) => (
            <motion.div
              key={dayItem.date}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{
                scale: 1.04,
                y: -5,
                boxShadow: "0 6px 14px rgba(0,0,0,0.15)",
              }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className={cn(
                "p-2 rounded-xl border-2 transition-all cursor-pointer",
                dayItem.weekday === todayLabel
                  ? "border-primary bg-primary/5 shadow-lg scale-[1.03]"
                  : "border-border bg-card hover:shadow-md"
              )}
            >
              {/* Weekday + Date */}
              <div className="text-center mb-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {String(dayItem.weekday).substring(0, 3)}
                </p>
                <p
                  className={cn(
                    "text-sm font-medium text-foreground/70 mb-1",
                    dayItem.weekday === todayLabel ? "text-primary" : "text-foreground"
                  )}
                >
                  {formatPrettyDate(dayItem.date)}
                </p>
              </div>

              {/* Slots */}
              <div className="space-y-2">
                {dayItem.slots?.map((slot: any, i: number) => (
                  <div
                    key={i}
                    className={cn(
                      "p-2 rounded-lg text-xs backdrop-blur-md shadow-sm border",
                      slot.type_color ? "border-white/40" : "bg-muted border-border"
                    )}
                    style={
                      slot.type_color
                        ? { backgroundColor: lightenColor(slot.type_color, 0.15) }
                        : undefined
                    }
                  >
                    <p className="font-semibold truncate text-xs">
                      {formatTime12(slot.start_time)} - {formatTime12(slot.end_time)}
                    </p>
                    <p className="text-xs opacity-90">
                      {slot.type_name || slot.title || "Slot"}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
