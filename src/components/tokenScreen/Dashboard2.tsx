import { useEffect, useState } from "react";
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
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components//tokenScreen/StatusBadge";
import { ScreenPreviewCard } from "@/components/tokenScreen/ScreenPreviewCard";
import { fetchDashboardStats, TokenDashboardStats } from "@/services/HSTokenService";
// import { doctors, recentActivity } from "@/data/dummyData-2"; // Keep for fallback parts not yet dynamic

export default function Dashboard2() {
  const [stats, setStats] = useState<TokenDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await fetchDashboardStats();
      if (data) {
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to load dashboard stats", error);
    } finally {
      setLoading(false);
    }
  };

  const activeScreensList = stats?.activeScreensList || [];
  const upcomingTokens = stats?.upcomingTokens || [];
  const activeDoctors = stats?.activeDoctors || [];
  const recentActivity = stats?.recentActivity || [];

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
            <Button variant="outline" size="sm" className="gap-2" onClick={loadStats}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
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
            value={stats?.activeScreens || 0}
            total={stats?.totalScreens || 0}
            icon={Monitor}
            color="primary"
            trend="+2 today"
          />
          <GlassStatCard
            title="Patients Served"
            value={stats?.todayTokens || 0}
            icon={Users}
            color="success"
            trend="+12% vs yesterday"
          />
          <GlassStatCard
            title="Avg Wait Time"
            value={stats?.avgWaitTime || "0 min"}
            icon={Clock}
            color="warning"
            trend="-3 min improvement"
          />
          <GlassStatCard
            title="Queue Length"
            value={stats?.pendingQueue || 0}
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
              {activeScreensList.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground bg-card rounded-lg border border-dashed">
                  No active screens found
                </div>
              ) : (
                activeScreensList.map((screen) => (
                  <div key={screen.id} className="relative bg-card rounded-xl p-4 border shadow-sm">
                    <div className="absolute top-4 right-4 z-10">
                      <StatusBadge status={screen.status === "1" ? "active" : "active"} />
                    </div>
                    {/* Simplified Preview for now as we don't have full doctor/patient data in list */}
                    <div className="h-40 bg-muted/30 rounded-lg flex items-center justify-center mb-3">
                        <Monitor className="w-12 h-12 text-muted-foreground/50" />
                    </div>
                    
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">{screen.name}</span>
                      <span className="text-muted-foreground">{screen.location}</span>
                    </div>
                  </div>
                ))
              )}
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
                {upcomingTokens.length === 0 ? (
                  <div className="text-sm text-muted-foreground text-center py-4">No upcoming tokens</div>
                ) : (
                  upcomingTokens.map((item, i) => (
                    <div 
                      key={i} 
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
                          {item.token_no}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{item.patient_name}</p>
                          <p className="text-xs text-muted-foreground">Doctor: {item.doctor_name}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <PlayCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Screen Status Grid */}
            <Card className="p-5 border-0 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Screen Status</h3>
                <Badge variant="outline" className="text-xs gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  {stats?.activeScreens || 0} Online
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-3">
                 {/* Simplified Status Grid */}
                 <div className="p-3 rounded-lg border border-success/30 bg-success/5 flex flex-col items-center justify-center text-center">
                    <Wifi className="w-5 h-5 text-success mb-1" />
                    <span className="text-xs font-medium">Online</span>
                    <span className="text-lg font-bold">{stats?.activeScreens || 0}</span>
                 </div>
                 <div className="p-3 rounded-lg border border-muted bg-muted/10 flex flex-col items-center justify-center text-center">
                    <WifiOff className="w-5 h-5 text-muted-foreground mb-1" />
                    <span className="text-xs font-medium">Offline</span>
                    <span className="text-lg font-bold">{(stats?.totalScreens || 0) - (stats?.activeScreens || 0)}</span>
                 </div>
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
              {recentActivity.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">No recent activity</div>
              ) : (
                recentActivity.slice(0, 5).map((activity, i) => (
                  <div key={activity.id || i} className="flex items-start gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-primary/10 text-primary"
                    )}>
                      <Activity className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Active Doctors */}
          <Card className="p-5 border-0 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Active Doctors</h3>
              <Badge variant="secondary" className="text-xs">
                {activeDoctors.length} On Duty
              </Badge>
            </div>
            <div className="space-y-3">
              {activeDoctors.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">No active doctors</div>
              ) : (
                activeDoctors.map((doctor) => (
                  <div key={doctor.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={doctor.profile_image || ""} alt={doctor.name} />
                          <AvatarFallback>{doctor.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className={cn(
                          "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card",
                          (doctor.status === "1" || doctor.status === "active") ? "bg-success" : "bg-muted"
                        )} />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{doctor.name}</p>
                        <p className="text-xs text-muted-foreground">{doctor.department} • {doctor.room}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="text-xs">
                        {doctor.avgTime}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
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
