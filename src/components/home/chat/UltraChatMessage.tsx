import { Check, Calendar, Clock, Phone, User, Star, Award, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Language, getTranslation } from "@/utils/translations";
import { PaIcons } from "@/components/icons/PaIcons";
import { useEffect, useState } from "react";
import { configService } from "@/services/configService";
// UltraChatMessage component
export interface UltraMessage {
  id: string;
  text: string;
  sender: "user" | "assistant";
  timestamp: Date;
  type?: "text" | "language_selector" | "menu_options" | "patient_list" | "doctor_list" | "date_picker" | "time_slots" | "no_slots" | "confirmation";
  data?: any;
}

interface UltraChatMessageProps {
  message: UltraMessage;
  language: Language;
  onSelectLanguage?: (lang: Language) => void;
  onSelectMenuOption?: (opt: "book_appointment" | "find_doctor" | "hospital_info" | "contact_info") => void;
  onSelectPatient?: (patient: any) => void;
  onSelectNewUser?: () => void;
  onSelectDoctor?: (doctorId: string) => void;
  onSelectDate?: (date: string) => void;
  onSelectTimeSlot?: (slot: any, period: string) => void;
}

const UltraChatMessage = ({ 
  message, 
  language,
  onSelectLanguage,
  onSelectMenuOption,
  onSelectPatient,
  onSelectNewUser,
  onSelectDoctor,
  onSelectDate,
  onSelectTimeSlot,
}: UltraChatMessageProps) => {
  const formatTime12h = (t: string) => {
    const m = t?.match?.(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
    if (!m) return t;
    let h = parseInt(m[1], 10);
    const min = m[2];
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12;
    if (h === 0) h = 12;
    return `${h}:${min} ${ampm}`;
  };

  const formatTimeRange12h = (raw?: string) => {
    if (!raw) return "";
    const parts = raw.split(/\s*-\s*/);
    if (parts.length === 2) {
      return `${formatTime12h(parts[0].trim())} - ${formatTime12h(parts[1].trim())}`;
    }
    return formatTime12h(raw);
  };
  const isUser = message.sender === "user";
  const [apiUrl, setApiUrl] = useState<string>("");
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const url = await configService.getApiUrl();
        if (mounted) setApiUrl(url);
      } catch (e) {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (message.type === "language_selector") {
    return (
      <div className="flex justify-center my-6 animate-in fade-in zoom-in">
        <Card className="p-6 max-w-md w-full bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/5 border-2 shadow-xl">
          <div className="text-center mb-2">
            <div className="w-16 h-16  flex items-center justify-center mx-auto mb-3 ">
              <img src={PaIcons.hospital1} alt="Email" className="w-12 h-12 " />
            </div>
          </div>
          <p className="text-center font-bold mb-6 text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {message.text}
          </p>
          <div className="grid grid-cols-1 gap-3">
            {(['english', 'hindi', 'marathi'] as Language[]).map((lang, index) => (
              <Button
                key={lang}
                onClick={() => onSelectLanguage?.(lang)}
                variant="outline"
                className="h-16 text-lg font-semibold hover:bg-primary hover:text-primary-foreground transition-all border-2 hover:scale-105 rounded-2xl animate-in slide-in-from-left"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <span className="text-2xl mr-3">
                  {lang === 'english' ? '🇬🇧' : '🇮🇳'}
                </span>
                {lang === 'english' ? 'English' : lang === 'hindi' ? 'हिंदी (Hindi)' : 'मराठी (Marathi)'}
              </Button>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (message.type === "menu_options") {
    return (
      <div className="flex justify-center my-6 animate-in fade-in zoom-in">
        <Card className="p-6 max-w-md w-full bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/5 border-2 shadow-xl">
          <p className="text-center font-bold mb-6 text-lg">
            {message.text}
          </p>
          <div className="grid grid-cols-1 gap-3">
            <Button
              variant="outline"
              className="h-12 text-sm font-semibold hover:bg-primary hover:text-primary-foreground transition-all border-2 rounded-2xl"
              onClick={() => onSelectMenuOption?.("book_appointment")}
            >
              {getTranslation(language, 'bookAppointment')}
            </Button>
            {/* Removed Find Doctor option */}
            <Button
              variant="outline"
              className="h-12 text-sm font-semibold hover:bg-primary hover:text-primary-foreground transition-all border-2 rounded-2xl"
              onClick={() => onSelectMenuOption?.("hospital_info")}
            >
              {getTranslation(language, 'hospitalInfo')}
            </Button>
            <Button
              variant="outline"
              className="h-12 text-sm font-semibold hover:bg-primary hover:text-primary-foreground transition-all border-2 rounded-2xl"
              onClick={() => onSelectMenuOption?.("contact_info")}
            >
              {getTranslation(language, 'contactInfo')}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (message.type === "patient_list") {
    return (
      <div className="flex justify-center my-6 animate-in fade-in zoom-in">
        <div className="max-w-3xl w-full">
          <p className="text-center font-semibold mb-6 text-base text-foreground">
            {message.text}
          </p>
          <div className="grid grid-cols-3 gap-6 justify-items-center">
            {(message.data?.patients ?? []).map((patient: any, index: number) => {
               // Initials
               const name = patient.name || "Patient";
               const parts = name.trim().split(/\s+/);
               const initial = (parts[0]?.[0] || "") + (parts[1]?.[0] || "");
               const displayInitial = initial.toUpperCase() || "P";
               
               // Label logic
               const label = index === 0 ? "Him Self" : "Another Patient";

               return (
                <div 
                  key={patient.id}
                  className="flex flex-col items-center gap-2 cursor-pointer group w-full max-w-[100px]"
                  onClick={() => onSelectPatient?.(patient)}
                >
                  <div className="w-[45px] h-[45px] rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 group-hover:scale-110 transition-all duration-300 border-2 border-white ring-2 ring-blue-50">
                    <span className="text-sm font-bold text-white tracking-wide">{displayInitial}</span>
                  </div>
                  <div className="text-center space-y-0.5 w-full">
                    <p className="font-semibold text-xs leading-tight line-clamp-2 text-foreground">{name}</p>
                    <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider opacity-70">{label}</p>
                  </div>
                </div>
               );
            })}

            {/* Add New User */}
            {(!message.data?.limit_reached && (message.data?.patients?.length || 0) < 5) && (
            <div 
              className="flex flex-col items-center gap-2 cursor-pointer group w-full max-w-[100px]"
              onClick={() => onSelectNewUser?.()}
            >
              <div className="w-[45px] h-[45px] rounded-full bg-slate-50 flex items-center justify-center border-2 border-dashed border-slate-300 group-hover:border-primary group-hover:bg-primary/5 group-hover:scale-110 transition-all duration-300">
                <span className="text-xl font-light text-slate-400 group-hover:text-primary">+</span>
              </div>
              <div className="text-center space-y-0.5 w-full">
                <p className="font-semibold text-xs text-foreground">Add New</p>
                <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider opacity-70">Patient</p>
              </div>
            </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // FIX: render doctor_list directly; remove nested UltraChatMessage() function
  if (message.type === "doctor_list") {
    return (
      <div className="flex justify-start my-4">
        <div className="max-w-xl">
          <p className="text-sm text-muted-foreground mb-4 font-medium">{message.text}</p>
         <div className="grid grid-cols-2 gap-3">
            {(message.data?.doctors ?? message.data?.items ?? []).map((doctor, index) => {
              const idStr = String(doctor.id ?? doctor.docuid ?? index);
              const isSelected = selectedDoctorId === idStr;

              const name = doctor.name ?? doctor.doctor_name ?? "Doctor";

              const rawPath = doctor.profile_image ?? doctor.image_url ?? doctor.image;
              const toDoctorImageUrl = (p?: string) => {
                const s = typeof p === "string" ? p : "";
                if (!s) return "";
                const isAbs = /^https?:\/\//.test(s);
                if (isAbs) {
                  const normalized = s.replace(
                    /assets\/images\/doctors\/assets\/images\/doctors\//,
                    "assets/images/doctors/"
                  );
                  const m = normalized.match(/\/assets\/images\/doctors\/([^\/]+)$/);
                  if (m && apiUrl) return `${apiUrl}/assets/images/doctors/${m[1]}`;
                  return normalized;
                }
                return apiUrl ? `${apiUrl}/${s.replace(/^\/+/, "")}` : "";
              };
              const src = toDoctorImageUrl(rawPath);

              const initial = name.trim().charAt(0).toUpperCase() || "D";

              return (
                <Card
                  key={idStr}
                  onClick={() => {
                    setSelectedDoctorId(idStr);
                    onSelectDoctor?.(idStr);
                  }}
                  className={cn(
                    "cursor-pointer p-2 rounded-2xl hover:shadow-xl hover:scale-[1.03] transition-all border",
                    isSelected ? "border-green-600" : "border-transparent"
                  )}
                >
                  <div className="flex flex-col items-center gap-2">

                    {/* IMAGE SECTION */}
                    <div
                      className={cn(
                        "relative w-[60px] h-[60px] bg-gray-200 rounded-xl overflow-hidden flex items-center justify-center",
                        isSelected && "ring-2 ring-green-600"
                      )}
                    >
                      {/* Fallback Initial */}
                      {!src && (
                        <span className="text-lg font-semibold text-gray-500">
                          {initial}
                        </span>
                      )}

                      {/* Profile Image */}
                      {src && (
                        <img
                          src={src}
                          alt={name}
                          className="w-[60px] h-[60px] object-cover rounded-xl"
                          onError={(e) => {
                            // Prevent infinite loop and set a visible fallback image served by frontend
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/placeholder.svg';
                          }}
                        />
                      )}

                      {/* Selection Indicator */}
                      {isSelected ? (
                        <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow">
                          <Check className="w-3 h-3 text-green-600" />
                        </div>
                      ) : (
                        <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-gray-300"></div>
                      )}
                    </div>

                    {/* NAME */}
                    <p className="font-semibold text-sm text-center leading-tight max-w-[120px] truncate">
                      {name}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>


        </div>
      </div>
    );
  }

  if (message.type === "date_picker") {
    const today = new Date();
    const dates = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      return date;
    });

    return (
      <div className="flex justify-start my-4">
        <div className="max-w-2xl">
          <p className="text-sm text-muted-foreground mb-4">{message.text}</p>
          {/* 7-day row, pill-style cards (responsive: 2 rows on small screens) */}
          <div className="grid grid-cols-4 gap-1 md:grid-cols-7">
            {dates.map((date, index) => {
              const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
              const dayNum = date.getDate();
              const dateStr = date.toISOString().split('T')[0];
              const isToday = date.toDateString() === today.toDateString();

              return (
                <Button
                  key={index}
                  variant="outline"
                  className={cn(
                    // Shape & size
                    "group h-20 w-14 flex flex-col items-center justify-center rounded-2xl px-0",

                    // Unselected state (same as screenshot)
                    "bg-[#E8ECE9] border-0 text-foreground/80",

                    // Hover subtle highlight
                    "hover:bg-[#DDE2E0] transition-all duration-200",

                    // Selected (today) state – white with shadow like image
                    isToday &&
                      "bg-white border border-[#C4CAC6] shadow-sm",

                    // Smooth animation
                    "duration-150"
                  )}
                  onClick={() => onSelectDate?.(dateStr)}
                >
                  {/* Day Name */}
                  <span
                    className={cn(
                      "text-[12px] font-medium mb-[2px]", // ← reduced gap
    "text-muted-foreground group-hover:text-foreground"
                    )}
                  >
                    {dayName}
                  </span>

                  {/* Day Number — EXACT 15px */}
                  <span
                    className={cn(
                      "text-[15px] font-bold leading-none",
                      "group-hover:scale-105 transition-transform"
                    )}
                  >
                    {dayNum}
                  </span>
                </Button>


              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (message.type === "time_slots") {
    const periods = ['morning', 'afternoon', 'evening'];
    const periodLabels = {
      morning: getTranslation(language, 'morning'),
      afternoon: getTranslation(language, 'afternoon'),
      evening: getTranslation(language, 'evening'),
    };

    const formatTime12 = (t?: string) => {
      if (!t) return "";
      const parts = t.split(":");
      let h = parseInt(parts[0] || "0", 10);
      const m = parseInt(parts[1] || "0", 10);
      const ampm = h >= 12 ? "pm" : "am";
      h = h % 12;
      if (h === 0) h = 12;
      const mm = String(m).padStart(2, "0");
      return `${h}.${mm} ${ampm}`;
    };

    return (
      <div className="flex justify-start my-4">
        <div className="max-w-xl">
          <p className="text-sm text-muted-foreground mb-4">{message.text}</p>
          <div className="space-y-4">
            {periods.map((period) => {
              const slots = message.data?.slots?.filter((s: any) => s.period === period) || [];
              
              if (slots.length === 0) return null;
              
              return (
                <div key={period}>
                  <p className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider">
                    {periodLabels[period as keyof typeof periodLabels]}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {slots.map((slot: any, idx: number) => {
                      const start = formatTime12h(slot.start_time);
                      const end = formatTime12h(slot.end_time);
                      const countVal =
                        typeof slot.available_count === "number"
                          ? slot.available_count
                          : typeof slot.max_appointments === "number"
                          ? slot.max_appointments
                          : null;
                      const count = countVal !== null ? ` (${countVal})` : "";
                      const label = `${start} - ${end}${count}`;
                      const key = slot.id ?? `${slot.start_time}-${slot.end_time}-${idx}`;
                      const annotatedSlot = { ...slot, source: message.data?.source, date: message.data?.date };
                      return (
                        <Button
                          key={key}
                          disabled={!slot.available}
                          variant="outline"
                          className="px-6 gap-3 h-14 hover:bg-primary hover:text-primary-foreground hover:border-primary 
             transition-all rounded-2xl font-semibold text-base border-2 flex items-center justify-center"
                          onClick={() => onSelectTimeSlot?.(annotatedSlot, period)}
                        >
                          <Clock className="h-5 w-5" />
                          <span className="max-w-[140px] text-center break-words text-[13px] block">{label}</span>
                        </Button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (message.type === "no_slots") {
    return (
      <div className="flex justify-center my-6">
        <Card className="p-6 max-w-md text-center bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border-2 border-red-200 dark:border-red-800">
          <div className="mb-4">
            <Calendar className="h-16 w-16 mx-auto text-red-500" />
          </div>
          <p className="font-semibold text-lg mb-2">{getTranslation(language, 'noSlots')}</p>
          <p className="text-sm text-muted-foreground mb-4">{message.data?.doctorName}</p>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => message.data?.onTryAgain?.()}
          >
            {getTranslation(language, 'tryAnotherDoctor')}
          </Button>
        </Card>
      </div>
    );
  }

  if (message.type === "confirmation") {
    return (
      <div className="flex justify-center my-6">
        <Card className="p-6 max-w-md bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-2 border-green-200 dark:border-green-800">
          <div className="text-center mb-4">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Check className="h-8 w-8 text-white" />
            </div>
            <p className="font-bold text-lg">{getTranslation(language, 'confirmationMessage')}</p>
          </div>
          <div className="space-y-3 text-sm">
            {message.data?.hospital && (
              <div className="flex items-center gap-2 p-2 bg-background/50 rounded">
                <Award className="h-4 w-4 text-primary" />
                <span className="font-medium">{message.data?.hospital}</span>
              </div>
            )}
            <div className="flex items-center gap-2 p-2 bg-background/50 rounded">
              <User className="h-4 w-4 text-primary" />
              <span className="font-medium">{message.data?.name}</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-background/50 rounded">
              <User className="h-4 w-4 text-primary" />
              <span>{message.data?.doctor}</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-background/50 rounded">
              <Calendar className="h-4 w-4 text-primary" />
              <span>{message.data?.date}</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-background/50 rounded">
              <Clock className="h-4 w-4 text-primary" />
              <span>{formatTimeRange12h(message.data?.time)}</span>
            </div>
            {typeof message.data?.token_no !== 'undefined' && message.data?.token_no !== null && (
              <div className="flex items-center gap-2 p-2 bg-background/50 rounded">
                <Star className="h-4 w-4 text-primary" />
                <span>Token #{message.data?.token_no}</span>
              </div>
            )}
            {message.data?.appointment_uid && (
              <div className="flex items-center gap-2 p-2 bg-background/50 rounded">
                <Globe className="h-4 w-4 text-primary" />
                <a
                  href={`/track-appointment/${message.data.appointment_uid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Track Appointment
                </a>
              </div>
            )}
            <div className="flex items-center gap-2 p-2 bg-background/50 rounded">
              <Phone className="h-4 w-4 text-primary" />
              <span>{message.data?.phone}</span>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Regular text message
  return (
    <div className={cn("flex my-3", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 shadow-md transition-all hover:shadow-lg",
          isUser
            ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground ml-12"
            : "bg-gradient-to-br from-muted to-muted/80 mr-12 border-2 border-border/50"
        )}
      >
        <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>
        <span className={cn(
          "text-xs opacity-70 mt-2 block",
          isUser ? "text-right" : "text-left"
        )}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};

export default UltraChatMessage;
