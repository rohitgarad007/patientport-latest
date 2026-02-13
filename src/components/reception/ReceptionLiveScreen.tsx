import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Monitor, 
  Search, 
  Grid3X3, 
  List,
  Wifi,
  WifiOff,
  Settings,
  Eye,
  MoreHorizontal,
  MapPin,
  Users,
  Clock,
  Activity,
  RefreshCw,
  Filter,
  Layers,
  User,
  ExternalLink
} from "lucide-react";
import { PaIcons } from "@/components/icons/PaIcons";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScreenPreviewDialog } from "@/components/tokenScreen/ScreenPreviewDialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { receptionService } from "@/services/ReceptionService";

interface MultiDoctorScreen {
  id: string;
  name: string;
  location: string;
  doctors: {
    id: string;
    name: string;
    specialization: string;
    department: string;
    specialty: string;
    avatar: string;
    gender: string;
    room: string;
    avgTime: string;
    status: string;
  }[];
  currentPatients: {
    doctor: any;
    patient: { token: string } | null;
  }[];
  totalQueue: number;
  status: string;
  resolution: string;
  lastUpdated: string;
  layout: string;
  screenType: "single" | "multi";
}

const screenTypeFilters = [
  { id: "all", label: "All Types" },
  { id: "single", label: "Single Doctor" },
  { id: "multi", label: "Multi Doctor" },
];

export default function ReceptionLiveScreen() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedScreen, setSelectedScreen] = useState<any>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [screens, setScreens] = useState<MultiDoctorScreen[]>([]);
  const [loading, setLoading] = useState(true);

  const screenGroups = [
    { id: "all", label: "All Screens", count: screens.length },
    { id: "active", label: "Active", count: screens.filter(s => s.status === 'active').length },
    { id: "idle", label: "Idle", count: screens.filter(s => s.status === 'idle').length },
    { id: "offline", label: "Offline", count: screens.filter(s => s.status === 'offline').length },
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await receptionService.fetchReceptionScreens();
      if (res && Array.isArray(res)) {
         const mapped: MultiDoctorScreen[] = res.map((s: any) => ({
           id: s.id,
           name: s.name,
           location: s.location,
           doctors: s.doctors.map((d: any) => ({
             id: d.id,
             name: d.name,
             specialization: d.specialization || "General",
             department: d.specialization || "General",
             specialty: d.specialization || "General",
             avatar: d.image,
             gender: d.gender,
             room: d.room_number || d.room || "101",
             avgTime: d.avg_consultation_time || d.avgTime || "10 min",
             status: d.status === "1" ? "active" : "offline"
           })),
           currentPatients: s.doctors.map((d: any, idx: number) => ({
             doctor: d,
             patient: { token: `A-00${idx + 1}` } // Mock token - ideally fetch real active token
           })), 
           totalQueue: 0, 
           status: s.status === "1" ? "active" : "offline",
           resolution: s.resolution || "1920x1080",
           lastUpdated: "Just now",
           layout: s.layout,
           screenType: (s.doctors && s.doctors.length > 1) ? "multi" : "single" as "single" | "multi"
         }));
         setScreens(mapped);
      }
    } catch (error) {
      console.error("Failed to fetch screens:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredScreens = screens.filter(screen => {
    const matchesSearch = screen.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      screen.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === "all" || screen.status === activeFilter;
    const matchesType = typeFilter === "all" || screen.screenType === typeFilter;
    return matchesSearch && matchesFilter && matchesType;
  });

  const handlePreview = (screen: MultiDoctorScreen) => {
    // Pass the entire screen object including doctors, settings, layout etc.
    setSelectedScreen(screen);
    setPreviewOpen(true);
  };

  const handleOpenLive = (screen: MultiDoctorScreen) => {
    window.open(`/reception-screen-live/${screen.id}`, '_blank');
  };

  const handleSettings = (screen: MultiDoctorScreen) => {
    navigate(`/reception-settings?screen=${screen.id}`);
  };

  return (
    <div>
      <TooltipProvider>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Live Screens Control Center</h1>
              <p className="text-muted-foreground mt-1">Monitor and manage your active reception screens</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="gap-2" onClick={() => loadData()}>
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {screenGroups.map((group) => (
              <Card 
                key={group.id}
                className={cn(
                  "p-4 cursor-pointer transition-all border-2",
                  activeFilter === group.id 
                    ? "border-primary bg-primary/5" 
                    : "border-transparent hover:border-muted"
                )}
                onClick={() => setActiveFilter(group.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{group.label}</p>
                    <p className="text-2xl font-bold mt-1">{group.count}</p>
                  </div>
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    group.id === "all" && "bg-primary/10 text-primary",
                    group.id === "active" && "bg-success/10 text-success",
                    group.id === "idle" && "bg-warning/10 text-warning",
                    group.id === "offline" && "bg-destructive/10 text-destructive"
                  )}>
                    {group.id === "offline" ? <WifiOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Search & Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search screens by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              {/* Screen Type Filter */}
              <div className="flex items-center rounded-lg border p-1">
                {screenTypeFilters.map((filter) => (
                  <Button
                    key={filter.id}
                    variant={typeFilter === filter.id ? "secondary" : "ghost"}
                    size="sm"
                    className="h-7 px-3 text-xs"
                    onClick={() => setTypeFilter(filter.id)}
                  >
                    {filter.id === "single" && <User className="w-3 h-3 mr-1" />}
                    {filter.id === "multi" && <Users className="w-3 h-3 mr-1" />}
                    {filter.label}
                  </Button>
                ))}
              </div>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Filter className="w-4 h-4" />
              </Button>
              <div className="flex items-center rounded-lg border p-1">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Screens Grid/List */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredScreens.map((screen) => (
                <MultiDoctorScreenCard 
                  key={screen.id} 
                  screen={screen}
                  onPreview={() => handlePreview(screen)}
                  onOpenLive={() => handleOpenLive(screen)}
                  onSettings={() => handleSettings(screen)}
                />
              ))}
            </div>
          ) : (
            <Card className="divide-y">
              {filteredScreens.map((screen) => (
                <MultiDoctorScreenListItem 
                  key={screen.id} 
                  screen={screen}
                  onPreview={() => handlePreview(screen)}
                  onOpenLive={() => handleOpenLive(screen)}
                  onSettings={() => handleSettings(screen)}
                />
              ))}
            </Card>
          )}

          {filteredScreens.length === 0 && !loading && (
            <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed">
              <Monitor className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-slate-900">No Active Screens</h3>
              <p className="text-slate-500 mb-4">There are no screens currently active to display.</p>
            </div>
          )}
        </div>
      </TooltipProvider>

      {/* Preview Dialog */}
      <ScreenPreviewDialog 
        open={previewOpen} 
        onOpenChange={setPreviewOpen}
        screen={selectedScreen}
      />
    </div>
  );
}

function MultiDoctorScreenCard({ 
  screen, 
  onPreview, 
  onOpenLive,
  onSettings 
}: { 
  screen: MultiDoctorScreen;
  onPreview: () => void;
  onOpenLive: () => void;
  onSettings: () => void;
}) {
  const statusConfig = {
    active: { color: "bg-success", text: "Online", icon: Wifi },
    idle: { color: "bg-warning", text: "Idle", icon: Clock },
    offline: { color: "bg-destructive", text: "Offline", icon: WifiOff },
  };
  
  const config = statusConfig[screen.status as keyof typeof statusConfig] || statusConfig.offline;
  const isMultiDoctor = screen.doctors.length > 1;

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-xl border-0 shadow-lg">
      {/* Preview Area */}
      <div className="relative h-44 bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
        {/* Mock Screen Display */}
        <div className="absolute inset-3 rounded-lg bg-card shadow-inner overflow-hidden">
           <div className={cn(
            "h-full grid gap-1 p-1",
            screen.doctors.length === 1 && "grid-cols-1",
            screen.doctors.length === 2 && "grid-cols-2",
            screen.doctors.length === 3 && "grid-cols-3",
            screen.doctors.length >= 4 && "grid-cols-2 grid-rows-2"
          )}>
            {screen.doctors.slice(0, 4).map((doctor, idx) => {
              const patientInfo = screen.currentPatients.find(
                p => p.doctor?.id === doctor.id || (p.doctor as any)?.id === doctor.id
              ) || screen.currentPatients[idx];

              return (
                <div 
                  key={doctor.id} 
                  className="rounded bg-muted/30 p-2 flex flex-col items-center justify-center text-center"
                >
                  <Avatar className="w-6 h-6 mb-1">
                    <AvatarImage src={doctor.avatar} />
                    <AvatarFallback className="bg-muted p-0.5">
                      <img 
                        src={(doctor.gender || "").toLowerCase() === 'female' ? PaIcons.femaleDcotorIcon : PaIcons.maleDcotorIcon} 
                        alt="Doc"
                        className="w-full h-full object-contain"
                      />
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-[9px] font-medium truncate w-full">{doctor.name.split(" ")[1] || doctor.name}</p>
                  {patientInfo?.patient ? (
                    <Badge variant="secondary" className="text-[8px] h-4 px-1 mt-1 font-bold">
                      {patientInfo.patient.token}
                    </Badge>
                  ) : (
                    <span className="text-[8px] text-muted-foreground mt-1">—</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Status Badge */}
        <div className="absolute top-2 right-2 flex items-center gap-1">
          {isMultiDoctor && (
            <Badge variant="outline" className="gap-1 bg-background/80 backdrop-blur-sm">
              <Layers className="w-3 h-3" />
              {screen.doctors.length} Doctors
            </Badge>
          )}
          <Badge 
            variant={screen.status === "active" ? "default" : "secondary"}
            className={cn(
              "gap-1",
              screen.status === "active" && "bg-success text-success-foreground"
            )}
          >
            <config.icon className="w-3 h-3" />
            {config.text}
          </Badge>
        </div>

        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
          <Button size="sm" variant="secondary" onClick={onPreview}>
            <Eye className="w-4 h-4 mr-1" />
            Preview
          </Button>
          <Button size="sm" variant="secondary" onClick={onOpenLive}>
            <ExternalLink className="w-4 h-4 mr-1" />
            Live
          </Button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold">{screen.name}</h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3" />
              {screen.location}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onPreview}>
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onOpenLive}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Live
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onSettings}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Doctors Info */}
        <div className="space-y-2">
          {isMultiDoctor ? (
            <div className="p-2 rounded-lg bg-muted/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">Assigned Doctors</span>
                <Badge variant="secondary" className="text-xs h-5">
                  {screen.doctors.length} doctors
                </Badge>
              </div>
              <div className="flex items-center -space-x-2">
                {screen.doctors.slice(0, 4).map((doctor, idx) => (
                  <Tooltip key={doctor.id}>
                    <TooltipTrigger asChild>
                      <Avatar className="w-8 h-8 border-2 border-background cursor-pointer hover:z-10 transition-transform hover:scale-110">
                        <AvatarImage src={doctor.avatar} alt={doctor.name} />
                        <AvatarFallback className="bg-muted p-0.5">
                          <img 
                            src={(doctor.gender || "").toLowerCase() === 'female' ? PaIcons.femaleDcotorIcon : PaIcons.maleDcotorIcon} 
                            alt="Doc"
                            className="w-full h-full object-contain"
                          />
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                      <p className="font-medium">{doctor.name}</p>
                      <p className="text-muted-foreground">{doctor.department}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
                {screen.doctors.length > 4 && (
                  <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                    <span className="text-xs font-medium">+{screen.doctors.length - 4}</span>
                  </div>
                )}
              </div>
              {/* Active tokens summary */}
              <div className="flex flex-wrap gap-1 mt-2">
                {screen.currentPatients.filter(cp => cp.patient).slice(0, 3).map((cp, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs font-mono">
                    {cp.patient?.token}
                  </Badge>
                ))}
                {screen.currentPatients.filter(cp => cp.patient).length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{screen.currentPatients.filter(cp => cp.patient).length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
              <Avatar className="w-8 h-8">
                <AvatarImage src={screen.doctors[0]?.avatar} alt={screen.doctors[0]?.name} />
                <AvatarFallback className="bg-muted p-0.5">
                  <img 
                    src={(screen.doctors[0]?.gender || "").toLowerCase() === 'female' ? PaIcons.femaleDcotorIcon : PaIcons.maleDcotorIcon} 
                    alt="Doc"
                    className="w-full h-full object-contain"
                  />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{screen.doctors[0]?.name}</p>
                <p className="text-xs text-muted-foreground">{screen.doctors[0]?.department}</p>
              </div>
              {screen.currentPatients[0]?.patient && (
                <Badge variant="secondary" className="font-mono font-bold">
                  {screen.currentPatients[0].patient.token}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Meta */}
        <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Activity className="w-3 h-3" />
            {screen.resolution}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {screen.totalQueue} in queue
          </span>
          <span>Updated {screen.lastUpdated}</span>
        </div>
      </div>
    </Card>
  );
}

function MultiDoctorScreenListItem({ 
  screen, 
  onPreview, 
  onOpenLive,
  onSettings 
}: { 
  screen: MultiDoctorScreen;
  onPreview: () => void;
  onOpenLive: () => void;
  onSettings: () => void;
}) {
  const statusConfig = {
    active: { color: "bg-success", text: "Online" },
    idle: { color: "bg-warning", text: "Idle" },
    offline: { color: "bg-destructive", text: "Offline" },
  };
  
  const config = statusConfig[screen.status as keyof typeof statusConfig] || statusConfig.offline;
  const isMultiDoctor = screen.doctors.length > 1;

  return (
    <div className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
      {/* Status & Name */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className={cn("w-3 h-3 rounded-full shrink-0", config.color)} />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold truncate">{screen.name}</h3>
            {isMultiDoctor && (
              <Badge variant="outline" className="text-xs shrink-0">
                <Layers className="w-3 h-3 mr-1" />
                {screen.doctors.length} Doctors
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground truncate">{screen.location}</p>
        </div>
      </div>

      {/* Doctors */}
      <div className="hidden md:flex items-center gap-2 w-56">
        <div className="flex items-center -space-x-2">
          {screen.doctors.slice(0, 3).map((doctor) => (
            <Tooltip key={doctor.id}>
              <TooltipTrigger asChild>
                <Avatar className="w-7 h-7 border-2 border-background">
                  <AvatarImage src={doctor.avatar} alt={doctor.name} />
                  <AvatarFallback className="bg-muted p-0.5">
                    <img 
                      src={(doctor.gender || "").toLowerCase() === 'female' ? PaIcons.femaleDcotorIcon : PaIcons.maleDcotorIcon} 
                      alt="Doc"
                      className="w-full h-full object-contain"
                    />
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                <p className="font-medium">{doctor.name}</p>
                <p className="text-muted-foreground">{doctor.specialty}</p>
              </TooltipContent>
            </Tooltip>
          ))}
          {screen.doctors.length > 3 && (
            <div className="w-7 h-7 rounded-full bg-muted border-2 border-background flex items-center justify-center">
              <span className="text-[10px] font-medium">+{screen.doctors.length - 3}</span>
            </div>
          )}
        </div>
        {!isMultiDoctor && screen.doctors[0] && (
          <span className="text-sm truncate ml-2">{screen.doctors[0].name}</span>
        )}
      </div>

      {/* Current Tokens */}
      <div className="hidden lg:flex items-center gap-1 w-32">
        {screen.currentPatients.filter(cp => cp.patient).slice(0, 2).map((cp, idx) => (
          <Badge key={idx} variant="outline" className="font-mono font-bold text-xs">
            {cp.patient?.token}
          </Badge>
        ))}
        {screen.currentPatients.filter(cp => cp.patient).length > 2 && (
          <span className="text-xs text-muted-foreground">
            +{screen.currentPatients.filter(cp => cp.patient).length - 2}
          </span>
        )}
        {screen.currentPatients.filter(cp => cp.patient).length === 0 && (
          <span className="text-sm text-muted-foreground">—</span>
        )}
      </div>

      {/* Queue */}
      <div className="hidden lg:block w-20 text-center">
        <span className="text-sm">{screen.totalQueue} waiting</span>
      </div>

      {/* Layout */}
      <div className="hidden xl:block w-20 text-center">
        <Badge variant="secondary" className="text-xs capitalize">
          {screen.layout}
        </Badge>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onPreview}>
          <Eye className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onOpenLive}>
          <ExternalLink className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onSettings}>
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
