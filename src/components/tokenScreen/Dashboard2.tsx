import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Monitor, 
  Users, 
  Clock, 
  TrendingUp, 
  Activity,
  Zap,
  Bell,
  ArrowUpRight,
  PlayCircle,
  MoreVertical,
  RefreshCw,
  Wifi,
  WifiOff,
  Volume2,
  ChevronRight,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { dashboardStats, screens, patients, doctors, recentActivity } from "@/data/dummyData-2";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components//tokenScreen/StatusBadge";
import { ScreenPreviewCard } from "@/components/tokenScreen/ScreenPreviewCard";

const liveTokens = [
  { id: 1, token: "A-003", patient: "Robert Kim", doctor: "Dr. Sarah Mitchell", room: "Room 101", status: "current", department: "Internal Medicine" },
  { id: 2, token: "B-001", patient: "Emma Thompson", doctor: "Dr. James Wilson", room: "Room 205", status: "current", department: "Cardiology" },
  { id: 3, token: "C-015", patient: "Alex Rivera", doctor: "Dr. Emily Chen", room: "Room 102", status: "current", department: "Pediatrics" },
];

const upcomingTokens = [
  { token: "A-004", patient: "Jennifer Brown", time: "2 min", priority: "normal" },
  { token: "A-005", patient: "Michael Davis", time: "5 min", priority: "normal" },
  { token: "B-002", patient: "James Wilson Jr.", time: "3 min", priority: "high" },
  { token: "A-006", patient: "Sarah Johnson", time: "8 min", priority: "normal" },
];

export default function Dashboard2() {

  const activeScreens = screens.filter(s => s.status === "active");

  return (
   
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              <span className="text-sm text-muted-foreground">Live Dashboard</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground">Token Command Center</h1>
            <p className="text-muted-foreground mt-1">Real-time monitoring & control</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Sync All
            </Button>
            <Button size="sm" className="gap-2 bg-gradient-to-r from-primary to-accent text-white">
              <Volume2 className="w-4 h-4" />
              Announce
            </Button>
          </div>
        </div>

        {/* Stats Grid - Glassmorphism Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <GlassStatCard
            title="Active Screens"
            value={dashboardStats.activeScreens}
            total={dashboardStats.totalScreens}
            icon={Monitor}
            color="primary"
            trend="+2 today"
          />
          <GlassStatCard
            title="Patients Served"
            value={dashboardStats.todayTokens}
            icon={Users}
            color="success"
            trend="+12% vs yesterday"
          />
          <GlassStatCard
            title="Avg Wait Time"
            value={dashboardStats.avgWaitTime}
            icon={Clock}
            color="warning"
            trend="-3 min improvement"
          />
          <GlassStatCard
            title="Queue Length"
            value={dashboardStats.pendingQueue}
            icon={Activity}
            color="info"
            trend="5 priority cases"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Live Token Display - Large */}
          <div className="xl:col-span-2 space-y-4">
            
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Active Screens</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/hs-manage-screens" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                  View All
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
            <div className="space-y-4">
              {activeScreens.slice(0, 2).map((screen) => (
                <div key={screen.id} className="relative">
                  <div className="absolute top-4 right-4 z-10">
                    <StatusBadge status={screen.status as any} />
                  </div>
                  <ScreenPreviewCard
                    doctor={screen.doctor}
                    currentPatient={screen.currentPatient}
                    queue={screen.queue}
                  />
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{screen.name}</span>
                    <span className="text-muted-foreground">{screen.location}</span>
                  </div>
                </div>
              ))}
            </div>
            
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Queue */}
            <Card className="p-5 border-0 shadow-lg bg-gradient-to-br from-card to-muted/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  Upcoming Queue
                </h3>
                <Badge variant="secondary" className="text-xs">
                  {upcomingTokens.length} waiting
                </Badge>
              </div>
              <div className="space-y-3">
                {upcomingTokens.map((item, i) => (
                  <div 
                    key={item.token} 
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg transition-all hover:bg-muted/50",
                      item.priority === "high" && "bg-warning/5 border border-warning/20"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm",
                        item.priority === "high" 
                          ? "bg-warning/10 text-warning" 
                          : "bg-primary/10 text-primary"
                      )}>
                        {item.token}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{item.patient}</p>
                        <p className="text-xs text-muted-foreground">ETA: {item.time}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <PlayCircle className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            {/* Screen Status Grid */}
            <Card className="p-5 border-0 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Screen Status</h3>
                <Badge variant="outline" className="text-xs gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  {screens.filter(s => s.status === "active").length} Online
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {screens.slice(0, 4).map((screen) => (
                  <div 
                    key={screen.id}
                    className={cn(
                      "p-3 rounded-lg border transition-all cursor-pointer hover:shadow-md",
                      screen.status === "active" && "border-success/30 bg-success/5",
                      screen.status === "idle" && "border-warning/30 bg-warning/5",
                      screen.status === "offline" && "border-destructive/30 bg-destructive/5 opacity-60"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {screen.status === "offline" ? (
                        <WifiOff className="w-3 h-3 text-destructive" />
                      ) : (
                        <Wifi className="w-3 h-3 text-success" />
                      )}
                      <span className="text-xs font-medium truncate">{screen.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{screen.location}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-5 border-0 shadow-lg bg-gradient-to-br from-primary/5 to-accent/5">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="h-auto py-3 flex-col gap-1">
                  <Bell className="w-4 h-4" />
                  <span className="text-xs">Alert All</span>
                </Button>
                <Button variant="outline" className="h-auto py-3 flex-col gap-1">
                  <RefreshCw className="w-4 h-4" />
                  <span className="text-xs">Refresh</span>
                </Button>
                <Button variant="outline" className="h-auto py-3 flex-col gap-1">
                  <Monitor className="w-4 h-4" />
                  <span className="text-xs">Add Screen</span>
                </Button>
                <Button variant="outline" className="h-auto py-3 flex-col gap-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs">Reports</span>
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Bottom Section - Activity & Doctors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card className="p-5 border-0 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Recent Activity</h3>
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                View All
              </Button>
            </div>
            <div className="space-y-4">
              {recentActivity.slice(0, 5).map((activity, i) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                    activity.type === "token_called" && "bg-success/10 text-success",
                    activity.type === "screen_online" && "bg-primary/10 text-primary",
                    activity.type === "patient_added" && "bg-info/10 text-info",
                    activity.type === "screen_offline" && "bg-destructive/10 text-destructive",
                    activity.type === "settings_changed" && "bg-warning/10 text-warning"
                  )}>
                    <Activity className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Active Doctors */}
          <Card className="p-5 border-0 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Active Doctors</h3>
              <Badge variant="secondary" className="text-xs">
                {doctors.filter(d => d.status !== "offline").length} On Duty
              </Badge>
            </div>
            <div className="space-y-3">
              {doctors.map((doctor) => (
                <div key={doctor.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={doctor.avatar} alt={doctor.name} />
                        <AvatarFallback>{doctor.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                      </Avatar>
                      <div className={cn(
                        "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card",
                        doctor.status === "online" && "bg-success",
                        doctor.status === "busy" && "bg-warning",
                        doctor.status === "offline" && "bg-muted"
                      )} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{doctor.name}</p>
                      <p className="text-xs text-muted-foreground">{doctor.department} • {doctor.room}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={doctor.status === "online" ? "default" : "secondary"} className="text-xs">
                      {doctor.avgTime}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    
  );
}

// Glass Stat Card Component
function GlassStatCard({ 
  title, 
  value, 
  total, 
  icon: Icon, 
  color, 
  trend 
}: { 
  title: string; 
  value: string | number; 
  total?: number; 
  icon: any; 
  color: "primary" | "success" | "warning" | "info"; 
  trend: string;
}) {
  const colorClasses = {
    primary: "from-primary/20 to-primary/5 border-primary/20",
    success: "from-success/20 to-success/5 border-success/20",
    warning: "from-warning/20 to-warning/5 border-warning/20",
    info: "from-info/20 to-info/5 border-info/20",
  };
  
  const iconClasses = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    info: "bg-info/10 text-info",
  };

  return (
    <Card className={cn(
      "relative overflow-hidden border p-5 bg-gradient-to-br backdrop-blur-sm",
      colorClasses[color]
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-bold">{value}</span>
            {total && <span className="text-muted-foreground">/{total}</span>}
          </div>
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-success" />
            {trend}
          </p>
        </div>
        <div className={cn("p-3 rounded-xl", iconClasses[color])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {total && (
        <Progress 
          value={(Number(value) / total) * 100} 
          className="h-1 mt-4" 
        />
      )}
    </Card>
  );
}

// Live Token Card Component
function LiveTokenCard({ token, index }: { token: typeof liveTokens[0]; index: number }) {
  return (
    <Card className={cn(
      "p-5 border-0 shadow-lg transition-all hover:shadow-xl",
      "bg-gradient-to-r from-card via-card to-primary/5",
      "animate-fade-in"
    )} style={{ animationDelay: `${index * 100}ms` }}>
      <div className="flex items-center gap-6">
        {/* Token Display */}
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
            <span className="text-2xl font-bold text-white">{token.token}</span>
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-success animate-pulse" />
        </div>

        {/* Patient Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold">{token.patient}</h3>
            <Badge variant="secondary" className="text-xs">Now Serving</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{token.doctor}</p>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-xs bg-muted px-2 py-1 rounded">{token.room}</span>
            <span className="text-xs text-muted-foreground">{token.department}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="gap-1">
            <Volume2 className="w-4 h-4" />
            Recall
          </Button>
          <Button size="sm" variant="ghost">
            <ArrowUpRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
