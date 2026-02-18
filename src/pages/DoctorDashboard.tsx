
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Clock, AlertCircle, Scissors, Calendar } from "lucide-react";
import { todaysAppointments } from "@/lib/dummy-data";
import { StatsCard } from "@/components/doctors/StatsCard";
import { WeeklyCalendar } from "@/components/doctors/calendar/WeeklyCalendar";
import { TodaysAppointments } from "@/components/doctors/patient/TodaysAppointments";
import { AttendedPatients } from "@/components/doctors/patient/AttendedPatients";
import { PatientDialog } from "@/components/doctors/patient/PatientDialog";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getMyEventSchedule, getMyTodaysAppointmentsGrouped } from "@/services/doctorService";
import { cn } from "@/lib/utils";

export default function DoctorDashboard() {

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [isPatientDialogOpen, setIsPatientDialogOpen] = useState(false);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [todayStats, setTodayStats] = useState<{ total: number; completed: number; waiting: number }>({
    total: 0,
    completed: 0,
    waiting: 0,
  });

  const handleViewPatient = (patientId: string) => {
    navigate(`/doctor-view-patient/${patientId}`);
  };

  const stats = [
    {
      title: "Total Appointments",
      value: todaysAppointments.length,
      icon: Users,
      trend: "+2 from yesterday",
      color: "bg-gradient-card"
    },
    {
      title: "Pending Patients",
      value: todaysAppointments.filter(a => a.status === "Pending").length,
      icon: Clock,
      trend: "3 remaining",
      color: "bg-gradient-card"
    },
    {
      title: "Emergency Cases",
      value: todaysAppointments.filter(a => a.type === "Emergency").length,
      icon: AlertCircle,
      trend: "1 active",
      color: "bg-gradient-card"
    },
    {
      title: "Surgeries",
      value: 2,
      icon: Scissors,
      trend: "This week",
      color: "bg-gradient-card"
    }
  ];

  // Load doctor info from cookie
  useEffect(() => {
    const userInfo = Cookies.get("userInfo");
    if (userInfo) {
      setCurrentUser(JSON.parse(userInfo));
    }
  }, []);

  // Load weekly schedule for mobile view
  useEffect(() => {
    let mounted = true;
    getMyEventSchedule()
      .then((data) => {
        if (!mounted) return;
        const arr = Array.isArray(data) ? data : [];
        setSchedule(arr);
        const todayStr = new Date().toISOString().slice(0, 10);
        const todayItem = arr.find((d: any) => d.date === todayStr) || arr[0];
        if (todayItem) {
          setSelectedDate(todayItem.date);
        }
      })
      .catch(() => {
        if (!mounted) {
          return;
        }
        setSchedule([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Load today's appointment stats for mobile summary
  useEffect(() => {
    const d = new Date();
    const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;

    let cancelled = false;
    (async () => {
      try {
        const grouped = await getMyTodaysAppointmentsGrouped(todayStr);
        if (cancelled || !grouped) return;
        const total =
          (grouped.active?.length || 0) +
          (grouped.waiting?.length || 0) +
          (grouped.arrived?.length || 0) +
          (grouped.booked?.length || 0) +
          (grouped.completed?.length || 0);
        const completed = grouped.completed?.length || 0;
        const waiting = (grouped.waiting?.length || 0) + (grouped.arrived?.length || 0);
        setTodayStats({ total, completed, waiting });
      } catch {
        if (!cancelled) {
          setTodayStats({ total: 0, completed: 0, waiting: 0 });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Helpers for time and color formatting (mobile schedule)
  const formatTime12 = (timeStr: string) => {
    if (!timeStr) return "";
    const [hour, minute] = timeStr.split(":");
    const h = parseInt(hour, 10);
    if (Number.isNaN(h)) return timeStr;
    const suffix = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return `${hour12}:${minute} ${suffix}`;
  };

  const lightenColor = (hex: string, opacity = 0.7) => {
    if (!hex || !hex.startsWith("#") || hex.length !== 7) return hex;
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const next7Days = useMemo(() => {
    if (!schedule || schedule.length === 0) return [];
    const todayStr = new Date().toISOString().slice(0, 10);
    const startIndex = schedule.findIndex((d: any) => d.date === todayStr);
    const start = startIndex >= 0 ? startIndex : 0;
    return schedule.slice(start, start + 7);
  }, [schedule]);

  const selectedDayItem = useMemo(() => {
    if (!next7Days.length) return null;
    if (selectedDate) {
      const match = next7Days.find((d: any) => d.date === selectedDate);
      if (match) return match;
    }
    return next7Days[0];
  }, [next7Days, selectedDate]);

  const selectedSlots = selectedDayItem?.slots || [];
  const monthLabel = useMemo(() => {
    const baseDate =
      (selectedDayItem && new Date(selectedDayItem.date)) || new Date();
    if (Number.isNaN(baseDate.getTime())) return "";
    return baseDate.toLocaleDateString(undefined, { month: "short", year: "numeric" });
  }, [selectedDayItem]);


  const primaryLine =
    (currentUser && (currentUser.specialization_name || currentUser.department)) || "";
  const secondaryLine =
    (currentUser &&
      (currentUser.qualification || currentUser.qualifications || currentUser.degree)) ||
    "";

  return (
    <div className="space-y-0 md:space-y-4 w-full max-w-full overflow-x-hidden">
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-0 md:pt-6 pb-4 md:pb-6">
        {/* Desktop welcome heading */}
        <div className="hidden md:flex items-center justify-between">
          {currentUser && (
            <h1 className="text-2xl font-bold text-foreground pb-4">
              Welcome {currentUser.name}
            </h1>
          )}
        </div>

        {/* Mobile doctor profile + weekly schedule */}
        {currentUser && (
          <div className="md:hidden space-y-4 mb-6">
            {/* Doctor profile card */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white shadow-md border border-emerald-50 w-full">
              <Avatar className="w-16 h-16 rounded-xl">
                <AvatarImage src={currentUser.profile_image || ""} />
                <AvatarFallback className="rounded-xl">
                  {currentUser &&
                  currentUser.name &&
                  typeof currentUser.name === "string" &&
                  currentUser.name.trim().length > 0
                    ? currentUser.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                    : "DR"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <h2 className="text-base md:text-lg font-semibold text-slate-900 leading-tight">
                  Dr. {currentUser && currentUser.name}
                </h2>
                {primaryLine && (
                  <p className="text-[11px] md:text-xs text-slate-600">
                    {primaryLine}
                  </p>
                )}
                {secondaryLine && (
                  <p className="text-[11px] md:text-xs text-slate-500">
                    {secondaryLine}
                  </p>
                )}
              </div>
            </div>

            {/* Today stats row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-emerald-50 px-3 py-2">
                <p className="text-[10px] text-emerald-700">Today</p>
                <p className="text-lg font-semibold text-emerald-900">
                  {todayStats.total}
                </p>
              </div>
              <div className="rounded-2xl bg-sky-50 px-3 py-2">
                <p className="text-[10px] text-sky-700">Completed</p>
                <p className="text-lg font-semibold text-sky-900">
                  {todayStats.completed}
                </p>
              </div>
              <div className="rounded-2xl bg-amber-50 px-3 py-2">
                <p className="text-[10px] text-amber-700">Waiting</p>
                <p className="text-lg font-semibold text-amber-900">
                  {todayStats.waiting}
                </p>
              </div>
            </div>

            {/* Weekly schedule card */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm md:text-base font-semibold">Weekly Schedule</h3>
                {monthLabel && (
                  <div className="flex items-center gap-1 text-xs text-emerald-700">
                    <Calendar className="w-3 h-3" />
                    <span>{monthLabel}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-7 gap-1 pb-1">
                {next7Days.map((day: any) => {
                  const isSelected = selectedDayItem && day.date === selectedDayItem.date;
                  const dayLabel = String(day.weekday || "").substring(0, 3);
                  const dateObj = new Date(day.date);
                  const dateNum = Number.isNaN(dateObj.getTime())
                    ? ""
                    : dateObj.getDate();
                  const slotsCount = Array.isArray(day.slots) ? day.slots.length : 0;

                  return (
                    <button
                      key={day.date}
                      type="button"
                      onClick={() => setSelectedDate(day.date)}
                      className={cn(
                        "flex flex-col items-center justify-center px-1 py-1.5 rounded-xl text-[10px] leading-tight transition-all border",
                        isSelected
                          ? "bg-emerald-500 text-white border-emerald-500 shadow-md"
                          : "bg-muted text-muted-foreground border-transparent"
                      )}
                    >
                      <span className="text-[10px] uppercase tracking-wide">
                        {dayLabel}
                      </span>
                      <span className="mt-0.5 text-sm font-semibold">{dateNum}</span>
                      <span className="mt-0.5 text-[10px] opacity-80">
                        {slotsCount} slot{slotsCount === 1 ? "" : "s"}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 space-y-2">
                {selectedSlots.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No events scheduled for this day.
                  </p>
                ) : (
                  selectedSlots.map((slot: any, index: number) => (
                    <div
                      key={index}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-2xl text-xs shadow-sm border",
                        slot.type_color ? "" : "bg-muted border-border"
                      )}
                      style={
                        slot.type_color
                          ? { backgroundColor: lightenColor(slot.type_color, 0.7) }
                          : undefined
                      }
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-white/70">
                          <Clock className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold">
                            {formatTime12(slot.start_time)} - {formatTime12(slot.end_time)}
                          </p>
                          <p className="text-[11px] opacity-90">
                            {slot.type_name || slot.title || "Slot"}
                          </p>
                        </div>
                      </div>

                      {typeof slot.max_appointments === "number" && slot.max_appointments > 0 && (
                        <div className="text-right">
                          <p className="text-[10px] font-semibold text-emerald-800">
                            {slot.max_appointments} slots
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

      {/*
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <StatsCard key={stat.title} {...stat} delay={index * 0.1} />
          ))}
        </div>*/}

        {/* Desktop weekly calendar */}
        <div className="hidden md:block mb-8">
          <WeeklyCalendar />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TodaysAppointments onViewPatient={handleViewPatient} />
          </div>
          <div>
            <AttendedPatients />
          </div>
        </div>

      </main>
    </div>
    
  );
}
