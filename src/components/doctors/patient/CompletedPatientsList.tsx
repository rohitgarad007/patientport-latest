import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, isToday, isYesterday, subDays, addDays } from "date-fns";
import {
  CalendarIcon,
  Search,
  Eye,
  Clock,
  User,
  Stethoscope,
  CheckCircle2,
  Phone,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getPatientsByDate } from "@/services/patientTreatmentService";
import type { Appointment } from "@/types/appointment";

const to12Hour = (hhmm: string) => {
  const [hh, mm] = hhmm.split(":");
  let h = parseInt(hh || "0", 10);
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${String(h)}:${String(mm ?? "00").padStart(2, "0")} ${ampm}`;
};

export default function CompletedPatientsList() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("completed");
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const selectedDateStr = useMemo(() => format(selectedDate, "yyyy-MM-dd"), [selectedDate]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const list = await getPatientsByDate(selectedDateStr);
      const mapped: Appointment[] = (Array.isArray(list) ? list : []).map((item: any) => ({
        id: String(item?.id ?? item?.appointmentId ?? ""),
        tokenNumber: Number(item?.tokenNumber ?? item?.token ?? 0),
        patient: {
          id: String(item?.patient?.id ?? item?.patientId ?? ""),
          name: String(item?.patient?.name ?? item?.patientName ?? "Patient"),
          phone: String(item?.patient?.phone ?? item?.patientPhone ?? ""),
          age: Number(item?.patient?.age ?? item?.patientAge ?? 0),
        },
        doctor: {
          id: String(item?.doctor?.id ?? item?.doctorId ?? ""),
          name: String(item?.doctor?.name ?? item?.doctorName ?? "Doctor"),
          specialty: "",
          availableDays: [],
          schedules: [],
        },
        date: String(item?.date ?? selectedDateStr),
        timeSlot: {
          id: String(item?.timeSlot?.id ?? item?.slotId ?? ""),
          startTime: String(item?.timeSlot?.startTime ?? item?.startTime ?? ""),
          endTime: String(item?.timeSlot?.endTime ?? item?.endTime ?? ""),
          totalTokens: 0,
          bookedTokens: 0,
        },
        status: String(item?.status ?? "booked") as any,
        arrivalTime: String(item?.arrivalTime ?? ""),
        consultationStartTime: String(item?.consultationStartTime ?? ""),
        completedTime: String(item?.completedTime ?? ""),
        queuePosition: Number(item?.queuePosition ?? 0),
      }));
      if (mounted) setAppointments(mapped);
    })();
    return () => { mounted = false; };
  }, [selectedDateStr]);

  const filteredAppointments = useMemo(() => {
    return (appointments || []).filter((apt) => {
      const matchesStatus = statusFilter === "all" || apt.status === statusFilter;
      const matchesSearch =
        apt.patient?.name?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
        String(apt.patient?.id || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(apt.patient?.phone || "").includes(searchQuery);
      return matchesStatus && matchesSearch;
    });
  }, [appointments, statusFilter, searchQuery]);

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "EEEE");
  };

  const handlePrevDay = () => setSelectedDate((prev) => subDays(prev, 1));
  const handleNextDay = () => setSelectedDate((prev) => addDays(prev, 1));

  return (
    
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b bg-card">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                  Completed Patients
                </h1>
                <p className="text-muted-foreground mt-1">View attended patients by date</p>
              </div>

              {/* Date Navigation */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={handlePrevDay}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="min-w-[200px] justify-start gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      <span className="font-medium">{getDateLabel(selectedDate)}</span>
                      <span className="text-muted-foreground">• {format(selectedDate, "dd MMM yyyy")}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        if (date) setSelectedDate(date);
                        setCalendarOpen(false);
                      }}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <Button variant="outline" size="icon" onClick={handleNextDay}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

        {/* Search */}
        <div className="mt-4 flex flex-col md:flex-row gap-3 md:items-center">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, ID or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-input rounded-md bg-background"
          >
            <option value="completed">Completed</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="all">All</option>
          </select>
        </div>
      </div>
    </div>

    {/* Content */}
    <div className="container mx-auto px-4 py-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{appointments.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold text-green-600">{appointments.filter(a => a.status === "completed").length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Active/Draft</p>
            <p className="text-2xl font-bold">{appointments.filter(a => a.status === "active" || a.status === "draft").length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Patient List */}
      {filteredAppointments.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <CheckCircle2 className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium">No patients</h3>
            <p className="text-muted-foreground mt-1">
              No patients were completed on {format(selectedDate, "dd MMMM yyyy")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredAppointments.map((apt) => (
            <Card key={apt.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14 border-2 border-green-200">
                    <AvatarImage src="" />
                    <AvatarFallback>{apt.patient.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{apt.patient.name}</h3>
                      <Badge variant="outline" className="text-xs">{apt.patient.id}</Badge>
                      {apt.status === "completed" ? (
                        <Badge className="bg-green-100 text-green-700 border-green-200">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Completed
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">{apt.status}</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1 flex-wrap">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" /> {apt.patient.age ? `${apt.patient.age}Y` : "" }
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {apt.patient.phone}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm mt-2 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Stethoscope className="h-3 w-3 text-primary" /> {apt.doctor?.name || "Doctor"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {to12Hour((apt.timeSlot.startTime || "").slice(0,5))} → {to12Hour((apt.completedTime || apt.timeSlot.endTime || "").slice(0,5))}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="gap-2 shrink-0"
                    onClick={() => navigate(`/doctor-view-patient/${apt.patient.id}`)}
                  >
                    <Eye className="h-4 w-4" /> View
                  </Button>
                </div>
              </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
  );
}
