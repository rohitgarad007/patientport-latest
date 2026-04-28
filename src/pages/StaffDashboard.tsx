import { useCallback, useEffect, useState } from 'react';
import Cookies from "js-cookie";
import {
  Calendar,
  FileText,
  MessageSquare,
  ClipboardList,
  Wifi,
  Car,
  Coffee,
  Zap,
  Shield,
  Activity,
  Pill,
  TestTube,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreHorizontal,
  Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { connectStaffAppointmentsSocket, fetchDoctorList, getTodayAppointments } from '@/services/SfstaffUseService';

// Mock Data
/*const appointmentsMock = [
  { id: 1, patient: "Emma Wilson", age: 34, doctor: "Dr. Chen", time: "09:00 AM", room: "201", type: "Follow-up", status: "Completed" },
  { id: 2, patient: "James Carter", age: 56, doctor: "Dr. Wilson", time: "09:30 AM", room: "305", consultation: "Consultation", type: "Consultation", status: "Completed" },
  { id: 3, patient: "Sophia Lee", age: 28, doctor: "Dr. Park", time: "10:00 AM", room: "102", type: "Check-up", status: "In Progress" },
  { id: 4, patient: "Oliver Brown", age: 45, doctor: "Dr. Ross", time: "10:30 AM", room: "204", type: "New Visit", status: "Waiting" },
  { id: 5, patient: "Ava Martinez", age: 62, doctor: "Dr. Kim", time: "11:00 AM", room: "301", type: "Follow-up", status: "Pending" },
];*/

/*const doctors = [
  { name: "Dr. Sarah Chen", specialty: "Cardiologist", patients: 12, status: "Available", next: "11:30 AM", initials: "SC", color: "bg-emerald-100 text-emerald-700" },
  { name: "Dr. James Wilson", specialty: "Neurologist", patients: 8, status: "Available", next: "12:00 PM", initials: "JW", color: "bg-emerald-100 text-emerald-700" },
  { name: "Dr. Michael Ross", specialty: "Pediatrician", patients: 15, status: "Available", next: "10:45 AM", initials: "MR", color: "bg-emerald-100 text-emerald-700" },
  { name: "Dr. Lisa Wang", specialty: "Dermatologist", patients: 6, status: "Available", next: "11:00 AM", initials: "LW", color: "bg-emerald-100 text-emerald-700" },
  { name: "Dr. Priya Patel", specialty: "Gynecologist", patients: 9, status: "Available", next: "01:00 PM", initials: "PP", color: "bg-emerald-100 text-emerald-700" },
  { name: "Dr. Emily Park", specialty: "Orthopedic", status: "In Surgery", initials: "EP", color: "bg-red-100 text-red-700" },
  { name: "Dr. Robert Kim", specialty: "General Surgeon", status: "On Break", initials: "RK", color: "bg-yellow-100 text-yellow-700" },
  { name: "Dr. Alan Hughes", specialty: "ENT Specialist", status: "Off Duty", initials: "AH", color: "bg-gray-100 text-gray-700" },
];*/

const bedStats = [
  { name: "ICU", current: 24, total: 30, percent: 80, color: "bg-emerald-500" },
  { name: "General Ward", current: 112, total: 150, percent: 75, color: "bg-emerald-500" },
  { name: "Private Rooms", current: 31, total: 40, percent: 78, color: "bg-emerald-500" },
  { name: "Pediatric", current: 12, total: 18, percent: 67, color: "bg-emerald-500" },
  { name: "Maternity", current: 8, total: 12, percent: 67, color: "bg-emerald-500" },
];

const amenities = [
  { name: "Free Wi-Fi", status: "Active", icon: Wifi, color: "text-emerald-500", bg: "bg-emerald-50" },
  { name: "Parking", status: "138/200 Available", icon: Car, color: "text-emerald-500", bg: "bg-emerald-50" },
  { name: "Cafeteria", status: "Open until 10 PM", icon: Coffee, color: "text-emerald-500", bg: "bg-emerald-50" },
  { name: "Power Backup", status: "Standby", icon: Zap, color: "text-emerald-500", bg: "bg-emerald-50" },
  { name: "24/7 Security", status: "Active", icon: Shield, color: "text-emerald-500", bg: "bg-emerald-50" },
  { name: "Blood Bank", status: "Fully Stocked", icon: Activity, color: "text-emerald-500", bg: "bg-emerald-50" },
  { name: "Pharmacy", status: "Open 24/7", icon: Pill, color: "text-emerald-500", bg: "bg-emerald-50" },
  { name: "Lab Services", status: "Operational", icon: TestTube, color: "text-emerald-500", bg: "bg-emerald-50" },
];

const activities = [
  { text: "Patient Emma Wilson discharged from Room 201", time: "10 min ago", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
  { text: "Dr. Chen requested lab report for Liam Carter", time: "25 min ago", icon: FileText, color: "text-blue-500", bg: "bg-blue-50" },
  { text: "ICU Bed #18 now available", time: "40 min ago", icon: Activity, color: "text-emerald-500", bg: "bg-emerald-50" },
  { text: "New patient Oliver Brown admitted - Room 204", time: "1 hr ago", icon: Users, color: "text-emerald-500", bg: "bg-emerald-50" },
  { text: "Pharmacy restocked - Paracetamol, Amoxicillin", time: "2 hrs ago", icon: Pill, color: "text-emerald-500", bg: "bg-emerald-50" },
];

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    Completed: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
    "In Progress": "bg-blue-100 text-blue-700 hover:bg-blue-100",
    Active: "bg-blue-100 text-blue-700 hover:bg-blue-100",
    Waiting: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
    Pending: "bg-gray-100 text-gray-700 hover:bg-gray-100",
    Booked: "bg-purple-100 text-purple-700 hover:bg-purple-100",
    Arrived: "bg-indigo-100 text-indigo-700 hover:bg-indigo-100",
  };
  
  // Try direct match, or case-insensitive match
  const statusKey = Object.keys(styles).find(key => key.toLowerCase() === status?.toLowerCase()) || "";
  const styleClass = styles[statusKey] || "bg-gray-100 text-gray-700";

  return (
    <Badge className={`${styleClass} border-none font-medium`}>
      {status}
    </Badge>
  );
};

type StaffTodayAppointment = {
  id: string | number;
  patient_name?: string;
  patient_dob?: string;
  patient_gender?: string;
  doctor_image?: string;
  doctor_name?: string;
  created_at?: string;
  start_time?: string;
  type?: string;
  status?: string;
};

type DashboardDoctor = {
  name: string;
  specialty: string;
  status: string;
  color: string;
  initials: string;
  patients: number;
  next: string;
  profile_image?: string;
};

type CurrentUser = {
  name?: string;
};

const asRecord = (value: unknown): Record<string, unknown> => {
  if (value && typeof value === "object") return value as Record<string, unknown>;
  return {};
};

export default function StaffDashboard() {
  const [appointments, setAppointments] = useState<StaffTodayAppointment[]>([]);
  const [doctors, setDoctors] = useState<DashboardDoctor[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  const refreshAppointments = useCallback(async () => {
    const apptResponse = await getTodayAppointments();
    if (apptResponse.success && Array.isArray(apptResponse.data)) {
      setAppointments(apptResponse.data as StaffTodayAppointment[]);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get User Info
        const userInfo = Cookies.get("userInfo");
        if (userInfo) {
            const parsed: unknown = JSON.parse(userInfo);
            const u = asRecord(parsed);
            setCurrentUser({ name: typeof u["name"] === "string" ? u["name"] : undefined });
        }

        await refreshAppointments();

        // Fetch Doctors
        // We pass a dummy ID because the controller uses the token to identify the user/hospital
        const docResponse = await fetchDoctorList("current");
        if (docResponse.success && Array.isArray(docResponse.data)) {
           // Map backend data to frontend structure
           const mappedDoctors: DashboardDoctor[] = (docResponse.data as unknown[]).map((docUnknown) => {
              const doc = asRecord(docUnknown);
              const name = String(doc["name"] ?? "Unknown");
              const statusRaw = doc["status"];

              let status = "Offline";
              let color = "bg-gray-100 text-gray-700";

              if (statusRaw === "1" || statusRaw === "Available" || statusRaw === 1 || statusRaw === "Active") {
                status = "Available";
                color = "bg-emerald-100 text-emerald-700";
              }

              return {
                name,
                specialty: String(doc["specialty"] ?? ""),
                status,
                color,
                initials: name
                  .split(" ")
                  .filter(Boolean)
                  .map((n) => n[0])
                  .join("")
                  .substring(0, 2)
                  .toUpperCase(),
                patients: Number(doc["patients_today"] ?? 0) || 0,
                next: doc["next_appointment"] ? formatTime(String(doc["next_appointment"])) : "N/A",
                profile_image: typeof doc["profile_image"] === "string" ? doc["profile_image"] : undefined,
              };
           });
           setDoctors(mappedDoctors);
        }

      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refreshAppointments]);

  useEffect(() => {
    let closed = false;
    let socket: { close: () => void } | null = null;
    let refreshTimer: number | null = null;

    const scheduleRefresh = () => {
      if (refreshTimer) window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => {
        if (closed) return;
        void refreshAppointments();
      }, 250);
    };

    (async () => {
      socket = await connectStaffAppointmentsSocket({
        onMessage: (message) => {
          if (closed) return;
          if (message?.event === "staff_appointments_changed") {
            scheduleRefresh();
          }
        },
      }).catch(() => null);
    })();

    return () => {
      closed = true;
      if (refreshTimer) window.clearTimeout(refreshTimer);
      socket?.close();
    };
  }, [refreshAppointments]);

  const calculateAge = (dob: string) => {
    if (!dob) return "N/A";
    const birthDate = new Date(dob);
    const difference = Date.now() - birthDate.getTime();
    const ageDate = new Date(difference);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const formatTime = (value: string) => {
    if (!value) return "";
    const raw = String(value);
    const timePart = raw.includes(" ")
      ? raw.split(" ")[1] ?? ""
      : raw.includes("T")
        ? raw.split("T")[1] ?? ""
        : raw;
    const clean = timePart.replace("Z", "");
    const [hours, minutes] = clean.split(":");
    if (!hours || !minutes) return "";
    const h = parseInt(hours, 10);
    if (!Number.isFinite(h)) return "";
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  const filteredAppointments = activeTab === "all" 
    ? appointments 
    : appointments.filter(apt => apt.status?.toLowerCase() === activeTab.toLowerCase());

  const getCount = (status: string) => {
    if (status === "all") return appointments.length;
    return appointments.filter(apt => apt.status?.toLowerCase() === status.toLowerCase()).length;
  };

  const tabs = [
    { value: "all", label: "Total" },
    { value: "Booked", label: "Booked" },
    { value: "Arrived", label: "Arrived" },
    { value: "Waiting", label: "Waiting" },
    { value: "Active", label: "Active" },
    { value: "Completed", label: "Completed" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6 space-y-8">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Staff Dashboard</p>
        <h1 className="text-3xl font-bold text-gray-900">
            {currentUser ? `Welcome, ${currentUser.name}` : 'Welcome, Staff'}
        </h1>
      </div>

      {/* Quick Actions Removed */}

      {/* Appointments Section */}
      <Card className="border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-lg font-bold">Today's Appointments</CardTitle>
            <p className="text-sm text-gray-500">{appointments.length} total appointments</p>
          </div>
          <Button variant="ghost" className="text-emerald-600 hover:text-emerald-700 text-sm h-auto p-0 font-medium hover:bg-transparent">
            View All <MoreHorizontal className="w-4 h-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="bg-transparent p-0 mb-6 gap-2 justify-start h-auto flex-wrap">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-medium text-gray-600 data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 data-[state=active]:border-emerald-200 shadow-sm"
                >
                  <span className="font-bold mr-1.5">{getCount(tab.value)}</span> {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-gray-100">
                    <TableHead className="w-[50px] text-xs font-semibold text-gray-500 uppercase">#</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase">Patient</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase">Doctor</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase">Time</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase">Room</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase">Type</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        Loading appointments...
                      </TableCell>
                    </TableRow>
                  ) : filteredAppointments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center">
                            <Calendar className="h-6 w-6 text-emerald-600" />
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-semibold text-gray-900">No appointments today</p>
                            <p className="text-sm text-gray-500">There are no appointments scheduled for today. Enjoy your day!</p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAppointments.map((apt) => (
                      <TableRow key={apt.id} className="hover:bg-gray-50/50">
                        <TableCell>
                          <div className="font-medium text-gray-900">{apt.id}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-gray-900">{apt.patient_name}</div>
                          <div className="text-xs text-gray-500">{calculateAge(apt.patient_dob)} yrs, {apt.patient_gender}</div>
                        </TableCell>
                        <TableCell className="text-gray-600">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={apt.doctor_image} />
                              <AvatarFallback>{apt.doctor_name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{apt.doctor_name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600">{formatTime(apt.created_at || apt.start_time)}</TableCell>
                        <TableCell className="text-gray-600">-</TableCell>
                        <TableCell className="text-gray-600">
                          <Badge variant="outline" className="font-normal bg-gray-50">
                            {apt.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={apt.status} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Doctors */}
        <Card className="border-none shadow-sm h-full">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg font-bold">Today's Available Doctors</CardTitle>
              <p className="text-sm text-gray-500">
                  {doctors.filter(d => d.status === "Available").length} of {doctors.length} available
              </p>
            </div>
            <Button variant="ghost" className="text-emerald-600 hover:text-emerald-700 text-sm h-auto p-0 font-medium hover:bg-transparent">
              View All <MoreHorizontal className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
             {doctors.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No doctors found.</div>
             ) : (
                doctors.map((doc, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-gray-100">
                        <AvatarImage src={doc.profile_image} />
                        <AvatarFallback className={`${doc.color} text-xs font-bold`}>{doc.initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm text-gray-900">{doc.name}</p>
                          {doc.status === "Available" && <div className="h-2 w-2 rounded-full bg-emerald-500" />}
                        </div>
                        <p className="text-xs text-gray-500">
                          {doc.specialty} {doc.patients ? `• ${doc.patients} patients` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={`${doc.color} border-none font-medium mb-1`}>
                        {doc.status}
                      </Badge>
                      <p className="text-xs text-gray-500">
                         {doc.status === 'Available' && doc.next !== 'N/A' ? `Next: ${doc.next}` : ''}
                      </p>
                    </div>
                  </div>
                ))
             )}
          </CardContent>
        </Card>

        {/* Bed Management */}
        <Card className="border-none shadow-sm h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold">Bed Management</CardTitle>
            <p className="text-sm text-gray-500">63 of 250 beds available</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-emerald-600">250</p>
                <p className="text-xs text-gray-500 font-medium mt-1">Total Beds</p>
              </div>
              <div className="bg-red-50/50 border border-red-100 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-red-600">187</p>
                <p className="text-xs text-gray-500 font-medium mt-1">Occupied</p>
              </div>
              <div className="bg-gray-50/50 border border-gray-100 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-gray-700">63</p>
                <p className="text-xs text-gray-500 font-medium mt-1">Available</p>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 font-medium">Overall Occupancy</span>
                <span className="font-bold text-gray-900">75%</span>
              </div>
              <Progress value={75} className="h-2 bg-gray-100" indicatorClassName="bg-emerald-500" />
            </div>

            <div className="space-y-4">
              {bedStats.map((dept, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <Activity className="w-3 h-3 text-emerald-500" />
                      <span className="font-medium text-gray-700">{dept.name}</span>
                    </div>
                    <span className="text-gray-500">{dept.current}/{dept.total} ({dept.percent}%)</span>
                  </div>
                  <Progress value={dept.percent} className="h-1.5 bg-gray-100" indicatorClassName={dept.color} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hospital Amenities */}
        <Card className="border-none shadow-sm h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold">Hospital Amenities</CardTitle>
            <p className="text-sm text-gray-500">Current availability</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {amenities.map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-gray-50/50 rounded-lg border border-gray-100">
                  <div className={`p-2 rounded-lg ${item.bg}`}>
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{item.name}</p>
                    <p className="text-xs text-emerald-600 font-medium">{item.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-none shadow-sm h-full">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg font-bold">Recent Activity</CardTitle>
              <p className="text-sm text-gray-500">Latest hospital updates</p>
            </div>
            <Button variant="ghost" className="text-emerald-600 hover:text-emerald-700 text-sm h-auto p-0 font-medium hover:bg-transparent">
              View All <MoreHorizontal className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {activities.map((act, i) => (
                <div key={i} className="flex gap-3">
                  <div className={`mt-0.5 p-1.5 rounded-full ${act.bg} h-fit`}>
                    <act.icon className={`w-3.5 h-3.5 ${act.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-700 font-medium leading-tight">{act.text}</p>
                    <p className="text-xs text-gray-400 mt-1">{act.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
