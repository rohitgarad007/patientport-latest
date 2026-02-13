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
      <header className="fixed top-0 left-0 w-full bg-white border-b shadow-sm z-50">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between px-6 py-3">
          
          {/* Logo & Welcome */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <img src={PaIcons.hospital} alt="logo" className="w-5 h-5" />
            </div>
            {currentUser && (
              <h2 className="font-semibold">
                Welcome {currentUser.name}
              </h2>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-6">
            {/* Dashboard */}
            <NavLink
              to="/reception-dashboard"
              className={({ isActive }) =>
                isActive
                  ? "text-primary font-semibold"
                  : "text-muted-foreground"
              }
            >
              Dashboard
            </NavLink>

            {/* Screen Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  Screen
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                <DropdownMenuItem asChild>
                  <NavLink to="/reception-screen-design">
                    Screen Design
                  </NavLink>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <NavLink to="/reception-screen-live">
                    Live Screen
                  </NavLink>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Settings */}
            <NavLink
              to="/reception-settings"
              className={({ isActive }) =>
                isActive
                  ? "text-primary font-semibold"
                  : "text-muted-foreground"
              }
            >
              Settings
            </NavLink>
          </nav>

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                Profile
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem asChild>
                <NavLink to="/reception/profile">
                  My Profile
                </NavLink>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-600"
              >
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
            <NavLink to="/reception/dashboard">Dashboard</NavLink>
          </li>
          <li>
            <NavLink to="/reception/screen/live">Live</NavLink>
          </li>
          <li>
            <NavLink to="/reception/screen/split">Split</NavLink>
          </li>
          <li>
            <NavLink to="/reception/settings">Settings</NavLink>
          </li>
        </ul>
      </nav>
    </>
  );
}
