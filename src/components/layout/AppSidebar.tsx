import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  CreditCard,
  Settings,
  Hospital,
  UserCog,
  Stethoscope,
  Heart,
  Bell,
  LogOut,
  Shield,
  BarChart3,
} from 'lucide-react';
import { UserRole } from '@/types';
import { getCurrentUser, logout } from '@/data/mockData';
import { Button } from '@/components/ui/button';

interface MenuItem {
  title: string;
  url: string;
  icon: React.ComponentType<any>;
  roles: UserRole[];
}

const menuItems: MenuItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
    roles: ['super_admin', 'hospital_admin', 'doctor', 'staff', 'patient'],
  },
  {
    title: 'Hospitals',
    url: '/hospitals',
    icon: Hospital,
    roles: ['super_admin'],
  },
  {
    title: 'Patients',
    url: '/patients',
    icon: Users,
    roles: ['hospital_admin', 'doctor', 'staff'],
  },
  {
    title: 'Doctors',
    url: '/doctors',
    icon: Stethoscope,
    roles: ['super_admin', 'hospital_admin', 'staff'],
  },
  {
    title: 'Staff',
    url: '/staff',
    icon: UserCog,
    roles: ['super_admin', 'hospital_admin'],
  },
  {
    title: 'Appointments',
    url: '/appointments',
    icon: Calendar,
    roles: ['hospital_admin', 'doctor', 'staff', 'patient'],
  },
  {
    title: 'Medical Records',
    url: '/medical-records',
    icon: FileText,
    roles: ['doctor', 'patient'],
  },
  {
    title: 'Billing',
    url: '/billing',
    icon: CreditCard,
    roles: ['hospital_admin', 'staff', 'patient'],
  },
  {
    title: 'Role Access',
    url: '/role-access',
    icon: Shield,
    roles: ['hospital_admin'],
  },
  {
    title: 'Reports',
    url: '/reports',
    icon: BarChart3,
    roles: ['hospital_admin'],
  },
  {
    title: 'Notifications',
    url: '/notifications',
    icon: Bell,
    roles: ['super_admin', 'hospital_admin', 'doctor', 'staff', 'patient'],
  },
  {
    title: 'Settings',
    url: '/settings',
    icon: Settings,
    roles: ['super_admin', 'hospital_admin', 'doctor', 'staff', 'patient'],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentUser = getCurrentUser();
  
  if (!currentUser) return null;

  const userMenuItems = menuItems.filter(item => 
    item.roles.includes(currentUser.role)
  );

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar className={isCollapsed ? 'w-16' : 'w-64'} collapsible="icon">
      <SidebarHeader className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Heart className="w-5 h-5 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="font-bold text-foreground">HealthCare Pro</h2>
              <p className="text-xs text-muted-foreground capitalize">
                {currentUser.role.replace('_', ' ')}
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {!isCollapsed && 'Main Navigation'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {userMenuItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                            isActive
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                          }`
                        }
                      >
                        <item.icon className="w-5 h-5" />
                        {!isCollapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
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