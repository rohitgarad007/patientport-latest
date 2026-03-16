import { NavLink, useLocation, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useCallback, useEffect, useState } from "react";
import { PaIcons } from "@/components/icons/PaIcons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { connectDoctorAppointmentsSocket, getMyTodaysAppointmentsGrouped } from "@/services/doctorService";

type CurrentUser = {
  name?: string;
  department?: string;
};

type SidebarAppointment = {
  id: string;
  tokenNumber: number;
  patient: { id: string; name: string; phone?: string; age?: number };
  date?: string;
  timeSlot?: { id?: string; startTime?: string; endTime?: string };
  status?: string;
  queuePosition?: number | null;
  arrivalTime?: string | null;
  consultationStartTime?: string | null;
  completedTime?: string | null;
  statusTime?: string | null;
};

const asRecord = (v: unknown): Record<string, unknown> =>
  v && typeof v === "object" ? (v as Record<string, unknown>) : {};

const normalizeAppointment = (item: unknown): SidebarAppointment => {
  const it = asRecord(item);
  const patient = asRecord(it["patient"]);
  const timeSlot = asRecord(it["timeSlot"]);

  return {
    id: String(it["id"] ?? it["appointmentId"] ?? ""),
    tokenNumber: Number(it["tokenNumber"] ?? it["token"] ?? it["token_no"] ?? 0),
    patient: {
      id: String(patient["id"] ?? it["patientId"] ?? it["patient_id"] ?? ""),
      name: String(patient["name"] ?? it["patientName"] ?? it["patient_name"] ?? "Unknown"),
      phone: String(patient["phone"] ?? it["patientPhone"] ?? it["phone"] ?? ""),
      age: Number(patient["age"] ?? it["patientAge"] ?? it["age"] ?? 0),
    },
    date: String(it["date"] ?? it["appointmentDate"] ?? ""),
    timeSlot: {
      id: String(timeSlot["id"] ?? it["slotId"] ?? it["slot_id"] ?? ""),
      startTime: String(timeSlot["startTime"] ?? it["startTime"] ?? it["start_time"] ?? ""),
      endTime: String(timeSlot["endTime"] ?? it["endTime"] ?? it["end_time"] ?? ""),
    },
    status: String(it["status"] ?? it["appointmentStatus"] ?? it["appointment_status"] ?? ""),
    queuePosition: (it["queuePosition"] as number | null | undefined) ?? (it["queue_position"] as number | null | undefined) ?? null,
    arrivalTime: (it["arrivalTime"] as string | null | undefined) ?? (it["arrival_time"] as string | null | undefined) ?? null,
    consultationStartTime:
      (it["consultationStartTime"] as string | null | undefined) ??
      (it["consultation_start_time"] as string | null | undefined) ??
      null,
    completedTime: (it["completedTime"] as string | null | undefined) ?? (it["completed_time"] as string | null | undefined) ?? null,
    statusTime: (it["statusTime"] as string | null | undefined) ?? (it["status_time"] as string | null | undefined) ?? null,
  };
};

const formatTo12hr = (time?: string | null) => {
  if (!time) return "";
  let hhmm = "";
  if (/^\d{2}:\d{2}/.test(time)) hhmm = time.substring(0, 5);
  else if (time.includes(" ")) hhmm = time.split(" ")[1]?.substring(0, 5) ?? "";
  if (!hhmm) return "";
  const [HH, MM] = hhmm.split(":");
  let h = Number(HH);
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${MM} ${ampm}`;
};

const deriveStatusTime = (apt: SidebarAppointment) => {
  const status = String(apt.status ?? "");
  const raw =
    apt.statusTime ||
    (status === "arrived" || status === "waiting"
      ? apt.arrivalTime
      : status === "active"
        ? apt.consultationStartTime
        : status === "completed"
          ? apt.completedTime
          : apt.timeSlot?.startTime) ||
    "";
  return formatTo12hr(raw);
};

const NotificationPopover = ({
  item,
  onItemClick,
  onViewAll,
}: {
  item: { title: string; icon: string; badge: number; data: SidebarAppointment[] };
  onItemClick?: (apt: SidebarAppointment) => void;
  onViewAll?: () => void;
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-muted">
          <img src={item.icon} alt={item.title} className="w-6 h-6" />
          {item.badge > 0 ? (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 rounded-full bg-red-500 hover:bg-red-600 text-[10px] text-white">
              {item.badge}
            </Badge>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 shadow-lg border-border">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h4 className="font-semibold text-sm">{item.title}</h4>
          <Badge variant="secondary" className="bg-blue-50 text-blue-600 hover:bg-blue-100">
            {item.badge} Today
          </Badge>
        </div>
        <ScrollArea className="h-[300px]">
          <div className="flex flex-col">
            {item.data && item.data.length > 0 ? (
              item.data.slice(0, 20).map((apt, index) => (
                <div
                  key={apt.id || index}
                  onClick={() => onItemClick?.(apt)}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors border-b last:border-0 cursor-pointer"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground line-clamp-1">{apt.patient?.name}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      Token #{apt.tokenNumber}
                      {apt.timeSlot?.startTime ? ` • ${formatTo12hr(apt.timeSlot.startTime)}` : ""}
                      {deriveStatusTime(apt) ? ` • ${deriveStatusTime(apt)}` : ""}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">No patients</div>
            )}
          </div>
        </ScrollArea>
        <div className="px-4 py-3 border-t">
          <Button variant="ghost" className="w-full" onClick={onViewAll}>
            View All
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export function DcotorAppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [todaysGrouped, setTodaysGrouped] = useState<{
    waiting: SidebarAppointment[];
    arrived: SidebarAppointment[];
    draft: SidebarAppointment[];
  }>({ waiting: [], arrived: [], draft: [] });

  const refreshTodaysGrouped = useCallback(async () => {
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(
      2,
      "0"
    )}`;
    const data: unknown = await getMyTodaysAppointmentsGrouped(today);
    const root = asRecord(data);
    const waitingRaw = root["waiting"];
    const arrivedRaw = root["arrived"];
    const draftRaw = root["draft"];
    const waiting = (Array.isArray(waitingRaw) ? waitingRaw : []).map(normalizeAppointment);
    const arrived = (Array.isArray(arrivedRaw) ? arrivedRaw : []).map(normalizeAppointment);
    const draft = (Array.isArray(draftRaw) ? draftRaw : []).map(normalizeAppointment);

    setTodaysGrouped({
      waiting: waiting.sort((a, b) => Number(a.queuePosition ?? 0) - Number(b.queuePosition ?? 0)),
      arrived,
      draft,
    });
  }, []);

  useEffect(() => {
    const userInfo = Cookies.get("userInfo");
    if (userInfo) {
      try {
        const parsed = JSON.parse(userInfo) as unknown;
        const obj = asRecord(parsed);
        setCurrentUser({
          name: typeof obj["name"] === "string" ? obj["name"] : undefined,
          department: typeof obj["department"] === "string" ? obj["department"] : undefined,
        });
      } catch {
        setCurrentUser(null);
      }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    let attempt = 0;
    let timer: number | null = null;

    const run = async () => {
      try {
        await refreshTodaysGrouped();
      } catch (e) {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : String(e || "");
        if (msg.includes("No auth token found") && attempt < 6) {
          const delay = Math.min(2500, 250 * Math.pow(2, attempt));
          attempt += 1;
          timer = window.setTimeout(() => void run(), delay);
          return;
        }
        setTodaysGrouped({ waiting: [], arrived: [], draft: [] });
      }
    };

    void run();

    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [refreshTodaysGrouped]);

  useEffect(() => {
    let closed = false;
    let socket: { close: () => void } | null = null;

    (async () => {
      socket = await connectDoctorAppointmentsSocket({
        onMessage: (message) => {
          if (closed) return;
          if (message?.event === "doctor_appointments_changed") {
            void refreshTodaysGrouped();
          }
        },
      });
    })();

    return () => {
      closed = true;
      socket?.close();
    };
  }, [refreshTodaysGrouped]);

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("userInfo");
    window.location.href = "/login";
  };


  // Doctor Menu Structure
  type MenuChild = { title: string; url?: string; icon: string; action?: "logout" };
  type MenuItem =
    | { title: string; url: string; icon: string }
    | { title: string; icon: string; children: MenuChild[] }
    | {
        title: string;
        type: "notification";
        icon: string;
        badge: number;
        data: SidebarAppointment[];
        onItemClick?: (apt: SidebarAppointment) => void;
        onViewAll?: () => void;
      };

  const menuData: MenuItem[] = [
    {
      title: "Dashboard",
      url: "/doctor-dashboard",
      icon: PaIcons.dashboard,
    },
    {
      title: "Calendar",
      url: "/doctor-calendar",
      icon: PaIcons.calendar2,
    },
    {
      title: "Patients",
      icon: PaIcons.patients,
      children: [
        { title: "Today Visit", url: "/doctor-today-visit", icon: PaIcons.patienthealthIcon },
        { title: "Completed Patient", url: "/doctor-completed-list", icon: PaIcons.patienthealthIcon },
        //{ title: "View Patient", url: "/doctor-view-patient", icon: PaIcons.patienthealthIcon },
        //{ title: "Patient List", url: "/doctor-patient-list", icon: PaIcons.patienthealthIcon },
      ],
    },
    {
      title: "Arrived",
      type: "notification",
      icon: PaIcons.approve2Icon,
      badge: todaysGrouped.arrived.length,
      data: todaysGrouped.arrived,
      onItemClick: (apt: SidebarAppointment) => (apt.patient?.id ? navigate(`/doctor-view-patient/${apt.patient.id}`) : undefined),
      onViewAll: () => navigate("/doctor-today-visit"),
    },
    {
      title: "Waiting",
      type: "notification",
      icon: PaIcons.patients,
      badge: todaysGrouped.waiting.length,
      data: todaysGrouped.waiting,
      onItemClick: (apt: SidebarAppointment) => (apt.patient?.id ? navigate(`/doctor-view-patient/${apt.patient.id}`) : undefined),
      onViewAll: () => navigate("/doctor-today-visit"),
    },
    {
      title: "Draft",
      type: "notification",
      icon: PaIcons.patientEditIcon,
      badge: todaysGrouped.draft.length,
      data: todaysGrouped.draft,
      onItemClick: (apt: SidebarAppointment) => (apt.patient?.id ? navigate(`/doctor-view-patient/${apt.patient.id}`) : undefined),
      onViewAll: () => navigate("/doctor-today-visit"),
    },
    /*{
      title: "Treatment",
      url: "/doctor-treatment",
      icon: PaIcons.PrescriptionsIcon,
    },*/
    {
      title: "Master",
      icon: PaIcons.MastersIcon,
      children: [
        { title: "Medication Sugg", url: "/doctor-medication-sugg", icon: PaIcons.MedicineIcon },
        { title: "Add Medication Sugg", url: "/doctor-medication-add-sugg", icon: PaIcons.AddIcon },
        { title: "Manage Receipts", url: "/doctor-manage-receipts", icon: PaIcons.RolesIcon },
        { title: "Receipt Content", url: "/doctor-receipts-content", icon: PaIcons.RolesIcon },
      ],
    },
    /*{
      title: "Reports",
      url: "/doctor-reports",
      icon: PaIcons.ResultsIcon,
    },*/
    {
      title: "Profile",
      icon: PaIcons.user1,
      children: [
        { title: "Profile Info", url: "/doctor-profile", icon: PaIcons.user1 },
        { title: "Logout", action: "logout", icon: PaIcons.switch },
      ],
    },
  ];

  return (
    <>
      {/* 💻 Desktop Navbar */}
      <header className="hidden md:block fixed top-0 left-0 w-full bg-white border-b border-border shadow-sm z-50">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between px-6 py-3">
          
          {/* Logo + Doctor Name */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <img src={PaIcons.hospital} alt="logo" className="w-5 h-5" />
            </div>

            {currentUser && (
              <div>
                <h2 className="font-bold text-foreground">{currentUser.name}</h2>
                <p className="text-xs text-muted-foreground">{currentUser.department}</p>
              </div>
            )}
          </div>

          {/* Desktop Nav */}
          <nav className="flex items-center gap-6">
            {menuData.map((item) =>
              "type" in item && item.type === "notification" ? (
                <NotificationPopover
                  key={item.title}
                  item={item}
                  onItemClick={item.onItemClick}
                  onViewAll={item.onViewAll}
                />
              ) : "children" in item ? (
                <DropdownMenu key={item.title}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center gap-1">
                      <img src={item.icon} alt={item.title} className="w-6 h-6" />
                      <span>{item.title}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-52">
                    {item.children.map((child) =>
                      child.action === "logout" ? (
                        <DropdownMenuItem
                          key={child.title}
                          onClick={handleLogout}
                          className="flex items-center gap-2 text-red-600"
                        >
                          <img src={child.icon} className="w-4 h-4" />
                          {child.title}
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem asChild key={child.title}>
                          <NavLink
                            to={child.url ?? ""}
                            className={`flex items-center gap-2 ${
                              location.pathname === child.url
                                ? "text-primary font-medium"
                                : "text-muted-foreground"
                            }`}
                          >
                            <img src={child.icon} alt={child.title} className="w-6 h-6" />
                            {child.title}
                          </NavLink>
                        </DropdownMenuItem>
                      )
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <NavLink
                  key={item.title}
                  to={item.url}
                  className={`flex items-center gap-2 px-2 py-1 ${
                    location.pathname === item.url
                      ? "text-primary font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  <img src={item.icon} className="w-6 h-6" />
                  {item.title}
                </NavLink>
              )
            )}
          </nav>
        </div>
      </header>

      {/* 📱 Mobile Bottom Nav */}
      <div className="block md:hidden">
        <nav className="fixed bottom-0 left-0 w-full bg-white dark:bg-neutral-900 shadow-lg border-t border-gray-200 dark:border-gray-800 z-50">
          <ul className="flex justify-around items-center h-16">
            {menuData.filter((item) => !("type" in item && item.type === "notification")).map((item) => {
              const hasChildren = "children" in item;
              const isActive =
                ("url" in item && item.url && location.pathname === item.url) ||
                (hasChildren &&
                  item.children?.some((child) => child.url && location.pathname === child.url));
              const isOpen = activeCategory === item.title;

              return (
                <li key={item.title}>
                  <button
                    onClick={() =>
                      hasChildren
                        ? setActiveCategory(isOpen ? null : item.title)
                        : ("url" in item ? (window.location.href = item.url) : undefined)
                    }
                    className={`flex flex-col items-center justify-center text-xs ${
                      isActive ? "text-violet-600" : "text-gray-400"
                    }`}
                  >
                    <img
                      src={item.icon}
                      alt={item.title}
                      className={`w-6 h-6 mb-1 transition-opacity ${
                        isActive ? "opacity-100" : "opacity-85"
                      }`}
                    />
                    <span className="sr-only">{item.title}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Mobile Sub-Menu */}
        {activeCategory && (
          <div className="fixed bottom-16 left-0 w-full bg-white dark:bg-neutral-900 border-t border-gray-200 p-4 z-40">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold">{activeCategory}</h3>
              <button onClick={() => setActiveCategory(null)} className="text-gray-400 text-sm">
                Close ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {(menuData.find((m) => m.title === activeCategory) &&
              "children" in (menuData.find((m) => m.title === activeCategory) as MenuItem)
                ? (menuData.find((m) => m.title === activeCategory) as { children: MenuChild[] }).children
                : []
              ).map((item) =>
                item.action === "logout" ? (
                    <button
                      key={item.title}
                      onClick={handleLogout}
                      className="flex flex-col items-center justify-center p-3 rounded-lg border border-red-300 text-red-600"
                    >
                      <img src={item.icon} className="w-6 h-6 mb-1" />
                      <span className="text-xs">{item.title}</span>
                    </button>
                  ) : (
                    <NavLink
                      key={item.title}
                      to={item.url}
                      onClick={() => setActiveCategory(null)}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border ${
                        location.pathname === item.url
                          ? "border-violet-600 text-violet-600"
                          : "border-gray-200 text-gray-600"
                      }`}
                    >
                      <img src={item.icon} alt={item.title} className="w-6 h-6 mb-1" />
                      <span className="text-xs">{item.title}</span>
                    </NavLink>
                  )
                )}
            </div>
          </div>
        )}
      </div>

    </>
  );
}
