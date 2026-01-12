// AdminAppSidebar.tsx
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Hospital,
  Users,
  Stethoscope,
  UserCog,
  Bell,
  Settings,
  LogOut,
  Heart,
} from "lucide-react";
import Cookies from "js-cookie";
import { Button } from '@/components/ui/button';

const superAdminMenuItems = [
  { title: "Dashboard", url: "/super-dashboard", icon: LayoutDashboard },
  { title: "Hospitals", url: "/super-hospitals", icon: Hospital },
  { title: "Doctors", url: "/super-doctors", icon: Stethoscope },
  { title: "Staff", url: "/super-staff", icon: UserCog },
  { title: "Notifications", url: "/super-notifications", icon: Bell },
  { title: "Settings", url: "/super-settings", icon: Settings },
];

export function AdminAppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();

  const adminInfo = Cookies.get("adminInfo");
  const currentUser = adminInfo ? JSON.parse(adminInfo) : null;

  if (!currentUser || currentUser.role !== "super_admin") return null;

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("adminInfo");
    window.location.href = "/sa-login";
  };

  const isCollapsed = state === "collapsed";

  return (
    <Sidebar className={isCollapsed ? "w-16" : "w-64"} collapsible="icon">
      {/* Header */}
      <SidebarHeader className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Heart className="w-5 h-5 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="font-bold text-foreground">Super Admin</h2>
              <p className="text-xs text-muted-foreground">{currentUser.name}</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      {/* Menu */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {!isCollapsed && "Navigation"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {superAdminMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                        }`
                      }
                    >
                      <item.icon className="w-5 h-5" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

            </SidebarMenu>


           

          </SidebarGroupContent>

          

        </SidebarGroup>

        <div className="mt-auto p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4" />
            {!isCollapsed && <span className="ml-2">Sign Out</span>}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
