import { useEffect, useMemo, useState } from 'react';
import {
  Users,
  UserCheck,
  Stethoscope,
  Calendar,
  Bed,
  TrendingUp,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  fetchHospitalDashboardAppointments,
  fetchHospitalDashboardBottom,
  fetchHospitalDashboardLists,
  fetchHospitalDashboardStats,
} from '@/services/HospitalDashboardService';

type DashboardStats = {
  totalDoctors: number;
  activeDoctors: number;
  totalStaff: number;
  staffOnDuty: number;
  totalPatients: number;
  appointmentsToday: number;
  appointmentsRemaining: number;
  totalBeds: number;
  freeBeds: number;
  bedOccupancyPercent: number;
};

type DashboardDoctor = {
  id: number;
  name: string;
  specialization: string;
  status: string | number;
  patientCountToday?: number;
};

type DashboardStaff = {
  id: number;
  name: string;
  role?: string;
  department?: string;
  status: string | number;
};

type DashboardPatient = {
  id: number;
  name: string;
  status?: string | number;
};

type DashboardAppointment = {
  id: number;
  patient: string;
  doctor: string;
  time: string;
  type: string;
  status: string;
};

type BottomData = {
  bed: { totalBeds: number; freeBeds: number; occupancyPercent: number };
  shifts: Array<{ name: string; time: string; staff: string }>;
  departments: Array<{ name: string; info: string }>;
  amenities: Array<{ name: string; status: string }>;
};

const getInitials = (name: string) => {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  const out = (first + last).toUpperCase();
  return out || "NA";
};

const avatarColors = [
  "bg-emerald-100 text-emerald-700",
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-orange-100 text-orange-700",
  "bg-indigo-100 text-indigo-700",
  "bg-gray-100 text-gray-700",
];

const statusToBadge = (statusRaw: string) => {
  const status = statusRaw.trim().toLowerCase();
  if (status === "completed") return "bg-emerald-100 text-emerald-700";
  if (status === "in progress" || status === "in_progress" || status === "active")
    return "bg-blue-100 text-blue-700";
  if (status === "waiting") return "bg-orange-100 text-orange-700";
  if (status === "scheduled" || status === "booked") return "bg-gray-100 text-gray-700";
  return "bg-gray-100 text-gray-700";
};

export default function HospitalDashboard() {
  const [statsData, setStatsData] = useState<DashboardStats | null>(null);
  const [lists, setLists] = useState<{
    doctors: DashboardDoctor[];
    staff: DashboardStaff[];
    patients: DashboardPatient[];
  }>({ doctors: [], staff: [], patients: [] });
  const [appointments, setAppointments] = useState<DashboardAppointment[]>([]);
  const [bottom, setBottom] = useState<BottomData | null>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const statsRes = await fetchHospitalDashboardStats();
        if (!alive) return;
        if (statsRes?.success && statsRes.data) {
          setStatsData(statsRes.data);
        }

        const listsRes = await fetchHospitalDashboardLists();
        if (!alive) return;
        if (listsRes?.success && listsRes.data) {
          setLists(listsRes.data);
        }

        const apptRes = await fetchHospitalDashboardAppointments();
        if (!alive) return;
        if (apptRes?.success && Array.isArray(apptRes.data)) {
          setAppointments(apptRes.data);
        }

        const bottomRes = await fetchHospitalDashboardBottom();
        if (!alive) return;
        if (bottomRes?.success && bottomRes.data) {
          setBottom(bottomRes.data);
        }
      } catch {
        if (!alive) return;
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const statsUi = useMemo(() => {
    const totalDoctors = statsData?.totalDoctors ?? 0;
    const activeDoctors = statsData?.activeDoctors ?? 0;
    const totalStaff = statsData?.totalStaff ?? 0;
    const staffOnDuty = statsData?.staffOnDuty ?? 0;
    const totalPatients = statsData?.totalPatients ?? 0;
    const apptsToday = statsData?.appointmentsToday ?? 0;
    const apptsRemaining = statsData?.appointmentsRemaining ?? 0;
    const totalBeds = statsData?.totalBeds ?? 0;
    const freeBeds = statsData?.freeBeds ?? 0;
    const bedOccPct = statsData?.bedOccupancyPercent ?? 0;

    return [
      {
        label: "Total Doctors",
        value: statsData ? String(totalDoctors) : "—",
        icon: Stethoscope,
        status: statsData ? `${activeDoctors} active` : "—",
        statusColor: "text-emerald-600 bg-emerald-50",
        iconColor: "text-emerald-600",
        bgColor: "bg-emerald-50",
      },
      {
        label: "Total Staff",
        value: statsData ? String(totalStaff) : "—",
        icon: Users,
        status: statsData ? `${staffOnDuty} on duty` : "—",
        statusColor: "text-emerald-600 bg-emerald-50",
        iconColor: "text-emerald-600",
        bgColor: "bg-emerald-50",
      },
      {
        label: "Total Patients",
        value: statsData ? String(totalPatients) : "—",
        icon: UserCheck,
        status: "—",
        statusColor: "text-emerald-600 bg-emerald-50",
        iconColor: "text-emerald-600",
        bgColor: "bg-emerald-50",
      },
      {
        label: "Today's Appointments",
        value: statsData ? String(apptsToday) : "—",
        icon: Calendar,
        status: statsData ? `${apptsRemaining} remaining` : "—",
        statusColor: "text-emerald-600 bg-emerald-50",
        iconColor: "text-emerald-600",
        bgColor: "bg-emerald-50",
      },
      {
        label: "Total Beds",
        value: statsData ? String(totalBeds) : "—",
        icon: Bed,
        status: statsData ? `${freeBeds} free` : "—",
        statusColor: "text-emerald-600 bg-emerald-50",
        iconColor: "text-emerald-600",
        bgColor: "bg-emerald-50",
      },
      {
        label: "Active Doctors",
        value: statsData ? String(activeDoctors) : "—",
        icon: Clock,
        status: "—",
        statusColor: "text-emerald-600 bg-emerald-50",
        iconColor: "text-emerald-600",
        bgColor: "bg-emerald-50",
      },
      {
        label: "Bed Occupancy",
        value: statsData ? `${bedOccPct}%` : "—",
        icon: TrendingUp,
        status: statsData ? (bedOccPct >= 85 ? "High" : "Normal") : "—",
        statusColor:
          statsData && bedOccPct >= 85
            ? "text-orange-700 bg-orange-50"
            : "text-emerald-600 bg-emerald-50",
        iconColor: statsData && bedOccPct >= 85 ? "text-orange-700" : "text-emerald-600",
        bgColor: statsData && bedOccPct >= 85 ? "bg-orange-50" : "bg-emerald-50",
      },
    ];
  }, [statsData]);

  // bottom grid removed

  return (
    <div className="p-4 md:p-6 pb-24 space-y-6 bg-gray-100 min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Welcome back, Admin</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2 md:gap-4 md:grid-cols-4">
        {statsUi.map((stat, index) => (
          <Card key={index} className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-3 md:p-4">
              <div className="flex justify-between items-start mb-2">
                <div className={`p-1.5 md:p-2 rounded-full ${stat.bgColor} shrink-0`}>
                  <stat.icon className={`w-4 h-4 md:w-5 md:h-5 ${stat.iconColor}`} />
                </div>
                <Badge variant="secondary" className={`${stat.statusColor} hover:${stat.statusColor} border-none font-normal text-[10px] md:text-xs px-1.5 md:px-2.5`}>
                  {stat.status}
                </Badge>
              </div>
              <div className="mt-2 md:mt-4">
                <h3 className="text-lg md:text-2xl font-bold text-gray-900">{stat.value}</h3>
                <p className="text-[10px] md:text-sm text-gray-500 font-medium truncate">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Lists Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Doctors List */}
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg font-bold">Doctors</CardTitle>
              <p className="text-sm text-gray-500">{statsData ? `${statsData.totalDoctors} registered` : "—"}</p>
            </div>
            <Button variant="ghost" className="text-emerald-600 hover:text-emerald-700 text-sm h-auto p-0 font-medium hover:bg-transparent">
              View All <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-1 md:gap-4">
            {lists.doctors.map((doctor, index) => (
              <div key={index} className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg border border-gray-100 md:border-none md:bg-transparent md:p-0 md:rounded-none md:flex-row md:justify-between md:items-center transition-colors hover:bg-white hover:shadow-sm md:hover:bg-transparent md:hover:shadow-none">
                <div className="flex flex-col items-center gap-2 md:flex-row md:gap-3 w-full md:w-auto">
                  <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback className={`${avatarColors[index % avatarColors.length]} font-medium text-sm`}>{getInitials(doctor.name)}</AvatarFallback>
                    </Avatar>
                    <div className="text-center md:text-left min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">{doctor.name}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {doctor.specialization || "Doctor"}
                        {typeof doctor.patientCountToday === "number" ? ` · ${doctor.patientCountToday} patients` : ""}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`mt-2 md:mt-0 ${
                      String(doctor.status) === "1" || String(doctor.status).toLowerCase() === "active"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-orange-50 text-orange-700"
                    } border-none font-normal text-xs shrink-0`}
                  >
                    {String(doctor.status) === "1" ? "Active" : String(doctor.status)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Staff List */}
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg font-bold">Staff</CardTitle>
              <p className="text-sm text-gray-500">{statsData ? `${statsData.totalStaff} members` : "—"}</p>
            </div>
            <Button variant="ghost" className="text-emerald-600 hover:text-emerald-700 text-sm h-auto p-0 font-medium hover:bg-transparent">
              View All <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {lists.staff.map((member, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className={`${avatarColors[index % avatarColors.length]} font-medium text-sm`}>{getInitials(member.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{member.name}</p>
                    <p className="text-xs text-gray-500">
                      {(member.role || "Staff") + (member.department ? ` · ${member.department}` : "")}
                    </p>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className={`${
                    String(member.status) === "1" || String(member.status).toLowerCase() === "on duty"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-gray-100 text-gray-600"
                  } border-none font-normal text-xs`}
                >
                  {String(member.status) === "1" ? "On Duty" : String(member.status)}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Patients List */}
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg font-bold">Current Patients</CardTitle>
              <p className="text-sm text-gray-500">{statsData ? `${statsData.totalPatients} admitted` : "—"}</p>
            </div>
            <Button variant="ghost" className="text-emerald-600 hover:text-emerald-700 text-sm h-auto p-0 font-medium hover:bg-transparent">
              View All <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {lists.patients.map((patient, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className={`${avatarColors[index % avatarColors.length]} font-medium text-sm`}>{getInitials(patient.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{patient.name}</p>
                    <p className="text-xs text-gray-500">Patient</p>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className={`${String(patient.status).toLowerCase() === "critical" ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"} border-none font-normal text-xs`}
                >
                  {patient.status ? String(patient.status) : "Stable"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Appointments Table */}
      <Card className="border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold">Today's Appointments</CardTitle>
            <p className="text-sm text-gray-500">{statsData ? `${statsData.appointmentsToday} scheduled` : "—"}</p>
          </div>
          <Button variant="ghost" className="text-emerald-600 hover:text-emerald-700 text-sm h-auto p-0 font-medium hover:bg-transparent">
            View All <ArrowUpRight className="w-4 h-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          {/* Mobile View: Grid of Cards */}
          <div className="grid grid-cols-2 gap-3 md:hidden">
            {appointments.map((apt, index) => (
              <div key={index} className="flex flex-col p-3 bg-gray-50 rounded-lg border border-gray-100 transition-colors hover:bg-white hover:shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <Badge
                    variant="secondary"
                    className={`${statusToBadge(apt.status)} border-none font-normal text-[10px] px-1.5`}
                  >
                    {apt.status}
                  </Badge>
                  <span className="text-[10px] font-medium text-gray-500">{apt.time}</span>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-sm text-gray-900 truncate">{apt.patient}</p>
                  <div className="flex flex-col gap-0.5">
                    <p className="text-xs text-gray-500 truncate">Dr: {apt.doctor}</p>
                    <p className="text-xs text-gray-400 truncate">{apt.type}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View: Table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Patient</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Doctor</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((apt, index) => (
                  <TableRow key={index} className="border-gray-100 hover:bg-gray-50/50">
                    <TableCell className="font-medium text-gray-900">{apt.patient}</TableCell>
                    <TableCell className="text-gray-600">{apt.doctor}</TableCell>
                    <TableCell className="text-gray-600">{apt.time}</TableCell>
                    <TableCell className="text-gray-600">{apt.type}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`${statusToBadge(apt.status)} border-none font-normal text-xs`}>
                        {apt.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Grid removed */}
    </div>
  );
}
