import { NavLink, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { PaIcons } from "@/components/icons/PaIcons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function ReceptionAppSidebar() {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const userInfo = Cookies.get("userInfo");
    if (userInfo) {
      setCurrentUser(JSON.parse(userInfo));
    }
  }, []);

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("userInfo");
    window.location.href = "/login";
  };

  return (
    <>
      {/* 🖥 Desktop Navbar */}
      <header className="fixed top-0 left-0 w-full bg-white border-b border-border shadow-sm z-50">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between px-6 py-3">
          
          {/* Logo & Welcome */}
          <NavLink to="/reception-dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <img src={PaIcons.hospital} alt="logo" className="w-5 h-5" />
            </div>
            {currentUser && (
              <div className="hidden sm:block">
                <h2 className="font-bold text-foreground">Reception</h2>
                <p className="text-xs text-muted-foreground">Welcome {currentUser.name}</p>
              </div>
            )}
          </NavLink>

          {/* Navigation */}
          <nav className="flex items-center gap-6">
            {/* Dashboard */}
            <NavLink
              to="/reception-dashboard"
              className={({ isActive }) =>
                `flex items-center gap-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "text-primary border-b-2 border-primary pb-1"
                    : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              <img
                src={PaIcons.dashboard}
                alt="Dashboard"
                className="w-6 h-6"
              />
              Dashboard
            </NavLink>

            {/* Appointment List */}
            <NavLink
              to="/reception-appointments"
              className={({ isActive }) =>
                `flex items-center gap-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "text-primary border-b-2 border-primary pb-1"
                    : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              <img
                src={PaIcons.calendar2}
                alt="Appointment"
                className="w-6 h-6"
              />
              Appointment
            </NavLink>

            {/* Screen Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <img src={PaIcons.screenIcon} alt="Screen" className="w-6 h-6" />
                  <span>Screen</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                <DropdownMenuItem asChild>
                  <NavLink to="/reception-screen-design" className="flex items-center gap-2">
                    <img src={PaIcons.manageScreenIcon} alt="Screen Design" className="w-4 h-4" />
                    Screen Design
                  </NavLink>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <NavLink to="/reception-screen-live" className="flex items-center gap-2">
                    <img src={PaIcons.screenIcon} alt="Live Screen" className="w-4 h-4" />
                    Live Screen
                  </NavLink>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Settings */}
            <NavLink
              to="/reception-settings"
              className={({ isActive }) =>
                `flex items-center gap-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "text-primary border-b-2 border-primary pb-1"
                    : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              <img
                src={PaIcons.settings2Icon}
                alt="Settings"
                className="w-6 h-6"
              />
              Settings
            </NavLink>
          </nav>

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <img src={PaIcons.user1} alt="Profile" className="w-5 h-5" />
                <span className="hidden md:inline">Profile</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem asChild>
                <NavLink to="/reception/profile" className="flex items-center gap-2">
                  <img src={PaIcons.user1} alt="My Profile" className="w-4 h-4" />
                  My Profile
                </NavLink>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-600"
              >
                <img src={PaIcons.switch} alt="Logout" className="w-4 h-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* 📱 Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t shadow z-50">
        <ul className="flex justify-around items-center h-14">
          <li>
            <NavLink to="/reception/dashboard">
               <img src={PaIcons.dashboard} alt="Dashboard" className="w-6 h-6 mx-auto" />
            </NavLink>
          </li>
          <li>
            <NavLink to="/reception/screen/live">
               <img src={PaIcons.screenIcon} alt="Live" className="w-6 h-6 mx-auto" />
            </NavLink>
          </li>
          <li>
             {/* Split screen icon not clear, reusing screen */}
            <NavLink to="/reception/screen/split">
               <img src={PaIcons.view} alt="Split" className="w-6 h-6 mx-auto" />
            </NavLink>
          </li>
          <li>
            <NavLink to="/reception/settings">
               <img src={PaIcons.settings2Icon} alt="Settings" className="w-6 h-6 mx-auto" />
            </NavLink>
          </li>
        </ul>
      </nav>
    </>
  );
}
