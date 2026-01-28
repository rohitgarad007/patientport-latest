import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Monitor, 
  Search, 
  Plus, 
  Grid3X3, 
  List,
  Wifi,
  WifiOff,
  Settings,
  Eye,
  Edit3,
  Trash2,
  MoreHorizontal,
  MapPin,
  Users,
  Clock,
  Activity,
  RefreshCw,
  Power,
  Volume2,
  Maximize2,
  ChevronRight,
  Filter,
  Download,
  Upload
} from "lucide-react";
import { screens, doctors } from "@/data/dummyData-2";
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
import { EditScreenDialog } from "@/components/tokenScreen/EditScreenDialog";
import { DeleteScreenDialog } from "@/components/tokenScreen/DeleteScreenDialog";

const screenGroups = [
  { id: "all", label: "All Screens", count: 12 },
  { id: "active", label: "Active", count: 8 },
  { id: "idle", label: "Idle", count: 2 },
  { id: "offline", label: "Offline", count: 2 },
];

export default function ManageScreens2() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedScreen, setSelectedScreen] = useState<typeof screens[0] | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const filteredScreens = screens.filter(screen => {
    const matchesSearch = screen.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      screen.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === "all" || screen.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const handlePreview = (screen: typeof screens[0]) => {
    setSelectedScreen(screen);
    setPreviewOpen(true);
  };

  const handleEdit = (screen: typeof screens[0]) => {
    setSelectedScreen(screen);
    setEditOpen(true);
  };

  const handleDelete = (screen: typeof screens[0]) => {
    setSelectedScreen(screen);
    setDeleteOpen(true);
  };

  const handleSettings = (screen: typeof screens[0]) => {
    navigate(`/hs-screen-settings?screen=${screen.id}`);
  };

  return (
    <div>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Screen Management</h1>
            <p className="text-muted-foreground mt-1">Monitor, configure, and control all display screens</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Upload className="w-4 h-4" />
              Import
            </Button>
            <Button size="sm" className="gap-2" onClick={() => navigate("/add-screen-2")}>
              <Plus className="w-4 h-4" />
              Add Screen
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
              <ScreenCard 
                key={screen.id} 
                screen={screen}
                onPreview={() => handlePreview(screen)}
                onEdit={() => handleEdit(screen)}
                onDelete={() => handleDelete(screen)}
                onSettings={() => handleSettings(screen)}
              />
            ))}
          </div>
        ) : (
          <Card className="divide-y">
            {filteredScreens.map((screen) => (
              <ScreenListItem 
                key={screen.id} 
                screen={screen}
                onPreview={() => handlePreview(screen)}
                onEdit={() => handleEdit(screen)}
                onDelete={() => handleDelete(screen)}
                onSettings={() => handleSettings(screen)}
              />
            ))}
          </Card>
        )}

        {/* Empty State */}
        {filteredScreens.length === 0 && (
          <Card className="p-12 text-center">
            <Monitor className="w-12 h-12 mx-auto text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mt-4">No screens found</h3>
            <p className="text-muted-foreground mt-1">Try adjusting your search or filter criteria</p>
          </Card>
        )}
      </div>

      {/* Dialogs */}
      <ScreenPreviewDialog
        screen={selectedScreen}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />
      <EditScreenDialog
        screen={selectedScreen}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSave={() => {}}
      />
      <DeleteScreenDialog
        screen={selectedScreen}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={() => {}}
      />
    </div>
  );
}

// Screen Card Component
function ScreenCard({ 
  screen, 
  onPreview, 
  onEdit, 
  onDelete, 
  onSettings 
}: { 
  screen: typeof screens[0];
  onPreview: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onSettings: () => void;
}) {
  const statusConfig = {
    active: { color: "bg-success", text: "Online", icon: Wifi },
    idle: { color: "bg-warning", text: "Idle", icon: Clock },
    offline: { color: "bg-destructive", text: "Offline", icon: WifiOff },
  };
  
  const config = statusConfig[screen.status as keyof typeof statusConfig];

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-xl border-0 shadow-lg">
      {/* Preview Area */}
      <div className="relative h-40 bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
        {/* Mock Screen Display */}
        <div className="absolute inset-4 rounded-lg bg-card shadow-inner overflow-hidden">
          {screen.currentPatient ? (
            <div className="h-full flex flex-col p-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className={cn("w-1.5 h-1.5 rounded-full", config.color)} />
                Now Serving
              </div>
              <div className="flex-1 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">{screen.currentPatient.token}</span>
              </div>
              <div className="text-xs text-center text-muted-foreground truncate">
                {screen.doctor.room}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <span className="text-sm text-muted-foreground">No active token</span>
            </div>
          )}
        </div>
        
        {/* Status Badge */}
        <div className="absolute top-2 right-2">
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
          <Button size="sm" variant="secondary" onClick={onSettings}>
            <Settings className="w-4 h-4 mr-1" />
            Configure
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
              <DropdownMenuItem onClick={onEdit}>
                <Edit3 className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onSettings}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Power className="w-4 h-4 mr-2" />
                {screen.status === "offline" ? "Turn On" : "Turn Off"}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <RefreshCw className="w-4 h-4 mr-2" />
                Restart
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={onDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Doctor Info */}
        <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
          <Avatar className="w-8 h-8">
            <AvatarImage src={screen.doctor.avatar} alt={screen.doctor.name} />
            <AvatarFallback className="text-xs">{screen.doctor.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{screen.doctor.name}</p>
            <p className="text-xs text-muted-foreground">{screen.doctor.department}</p>
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Activity className="w-3 h-3" />
            {screen.resolution}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {screen.queue.length} in queue
          </span>
          <span>Updated {screen.lastUpdated}</span>
        </div>
      </div>
    </Card>
  );
}

// Screen List Item Component
function ScreenListItem({ 
  screen, 
  onPreview, 
  onEdit, 
  onDelete, 
  onSettings 
}: { 
  screen: typeof screens[0];
  onPreview: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onSettings: () => void;
}) {
  const statusConfig = {
    active: { color: "bg-success", text: "Online" },
    idle: { color: "bg-warning", text: "Idle" },
    offline: { color: "bg-destructive", text: "Offline" },
  };
  
  const config = statusConfig[screen.status as keyof typeof statusConfig];

  return (
    <div className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
      {/* Status & Name */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className={cn("w-3 h-3 rounded-full", config.color)} />
        <div className="min-w-0">
          <h3 className="font-semibold truncate">{screen.name}</h3>
          <p className="text-sm text-muted-foreground truncate">{screen.location}</p>
        </div>
      </div>

      {/* Doctor */}
      <div className="hidden md:flex items-center gap-2 w-48">
        <Avatar className="w-8 h-8">
          <AvatarImage src={screen.doctor.avatar} alt={screen.doctor.name} />
          <AvatarFallback className="text-xs">{screen.doctor.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
        </Avatar>
        <span className="text-sm truncate">{screen.doctor.name}</span>
      </div>

      {/* Current Token */}
      <div className="hidden lg:block w-24 text-center">
        {screen.currentPatient ? (
          <Badge variant="outline" className="font-mono font-bold">
            {screen.currentPatient.token}
          </Badge>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        )}
      </div>

      {/* Queue */}
      <div className="hidden lg:block w-20 text-center">
        <span className="text-sm">{screen.queue.length} waiting</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onPreview}>
          <Eye className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
          <Edit3 className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onSettings}>
          <Settings className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={onDelete}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
