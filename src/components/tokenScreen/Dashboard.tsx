import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { ScreenPreviewCard } from "@/components/ScreenPreviewCard";
import { StatusBadge } from "@/components/StatusBadge";
import { dashboardStats, screens, recentActivity } from "@/data/dummyData";
import { 
  Monitor, 
  Users, 
  Clock, 
  Ticket, 
  Bell, 
  MonitorCheck,
  UserPlus,
  MonitorX,
  Settings,
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const activityIcons: Record<string, any> = {
  bell: Bell,
  monitor: MonitorCheck,
  "user-plus": UserPlus,
  "monitor-off": MonitorX,
  settings: Settings,
};

const Dashboard = () => {
  const activeScreens = screens.filter(s => s.status === "active");

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Monitor your token announcement system</p>
          </div>
          <Button asChild>
            <Link to="/add-screen" className="flex items-center gap-2">
              <Monitor className="w-4 h-4" />
              Add New Screen
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Screens"
            value={dashboardStats.totalScreens}
            icon={Monitor}
            variant="primary"
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Active Screens"
            value={dashboardStats.activeScreens}
            icon={MonitorCheck}
            variant="success"
          />
          <StatCard
            title="Today's Tokens"
            value={dashboardStats.todayTokens}
            icon={Ticket}
            variant="info"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Avg Wait Time"
            value={dashboardStats.avgWaitTime}
            icon={Clock}
            variant="warning"
            trend={{ value: 5, isPositive: false }}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Active Screens Preview */}
          <div className="xl:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Active Screens</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/manage-screens" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
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

          {/* Recent Activity */}
          <div>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivity.map((activity) => {
                  const IconComponent = activityIcons[activity.icon] || Bell;
                  return (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-muted">
                        <IconComponent className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">{activity.message}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Quick Stats Card */}
            <Card className="mt-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold">Queue Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Patients Today</span>
                    <span className="font-semibold text-foreground">{dashboardStats.totalPatients}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Pending in Queue</span>
                    <span className="font-semibold text-foreground">{dashboardStats.pendingQueue}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Tokens Served</span>
                    <span className="font-semibold text-foreground">
                      {dashboardStats.todayTokens - dashboardStats.pendingQueue}
                    </span>
                  </div>
                  <div className="pt-2">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary rounded-full h-2 transition-all" 
                        style={{ 
                          width: `${((dashboardStats.todayTokens - dashboardStats.pendingQueue) / dashboardStats.todayTokens) * 100}%` 
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      {Math.round(((dashboardStats.todayTokens - dashboardStats.pendingQueue) / dashboardStats.todayTokens) * 100)}% completed
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
