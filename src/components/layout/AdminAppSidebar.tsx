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

export function AdminAppSidebar() {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  /** Load Super Admin Info */
  useEffect(() => {
    const adminInfo = Cookies.get("adminInfo");
    if (adminInfo) {
      setCurrentUser(JSON.parse(adminInfo));
    }
  }, []);

  if (!currentUser || currentUser.role !== "super_admin") return null;

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("adminInfo");
    window.location.href = "/sa-login";
  };

  /** 🔐 Super Admin Menu */
  const superAdminMenuItems = [
    {
      title: "Dashboard",
      url: "/super-dashboard",
      icon: PaIcons.dashboard,
    },
    /*{
      title: "Hospitals",
      url: "/super-hospitals",
      icon: PaIcons.hospital,
    },
    {
      title: "Doctors",
      url: "/super-doctors",
      icon: PaIcons.doctors,
    },
    {
      title: "Staff",
      url: "/super-staff",
      icon: PaIcons.staff,
    },*/
    {
      title: "Hierarchy",
      icon: PaIcons.LaboratoryIcon,
      children: [
        {
          title: "Hospitals",
          url: "/super-hospitals",
          icon: PaIcons.hospital,
        },
        {
          title: "Doctors",
          url: "/super-doctors",
          icon: PaIcons.doctors,
        },
        {
          title: "Staff",
          url: "/super-staff",
          icon: PaIcons.staff,
        },
      ],
    },
    {
      title: "Labs",
      icon: PaIcons.LaboratoryIcon,
      children: [
        {
          title: "Laboratories",
          url: "/super-laboratories",
          icon: PaIcons.LaboratoryIcon,
        },
        {
          title: "Lab Staff",
          url: "/super-lab-staff",
          icon: PaIcons.LaboratoryIcon,
        },
        {
          title: "Test Master",
          url: "/super-lab-test-master",
          icon: PaIcons.MastersIcon,
        },
      ],
    },
    {
      title: "Notifications",
      url: "/super-notifications",
      icon: PaIcons.notification,
    },
    {
      title: "Profile",
      icon: PaIcons.user1,
      children: [
        {
          title: "Profile",
          url: "/super-profile",
          icon: PaIcons.user1,
        },
        {
          title: "Settings",
          url: "/super-settings",
          icon: PaIcons.setting,
        },
        {
          title: "Logout",
          action: "logout",
          icon: PaIcons.switch,
        },
      ],
    },
  ];

  return (
    <>
      {/* ================= 💻 DESKTOP NAVBAR ================= */}
      <header className="hidden md:block fixed top-0 left-0 w-full bg-white border-b border-border shadow-sm z-50">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between px-6 py-3">
          
          {/* Logo + Admin Info */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <img src={PaIcons.hospital} alt="logo" className="w-5 h-5" />
            </div>

            {currentUser && (
              <div>
                <h2 className="font-bold text-foreground">Super Admin</h2>
                <p className="text-xs text-muted-foreground">{currentUser.name}</p>
              </div>
            )}
          </div>

          {/* Desktop Menu */}
          <nav className="flex items-center gap-6">
            {superAdminMenuItems.map((item: any) =>
              item.children ? (
                <DropdownMenu key={item.title}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center gap-1">
                      <img src={item.icon} alt={item.title} className="w-6 h-6" />
                      <span>{item.title}</span>
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent className="w-56">
                    {item.children.map((child: any) =>
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
                            to={child.url}
                            className={`flex items-center gap-2 ${
                              location.pathname === child.url
                                ? "text-primary font-medium"
                                : "text-muted-foreground"
                            }`}
                          >
                            <img src={child.icon} className="w-5 h-5" />
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

      {/* ================= 📱 MOBILE BOTTOM NAV ================= */}
      <div className="block md:hidden">
        <nav className="fixed bottom-0 left-0 w-full bg-white shadow-lg border-t z-50">
          <ul className="flex justify-around items-center h-16">
            {superAdminMenuItems.map((item) => {
              const active = activeCategory === item.title;
              return (
                <li key={item.title}>
                  <button
                    onClick={() =>
                      item.children
                        ? setActiveCategory(active ? null : item.title)
                        : (window.location.href = item.url)
                    }
                    className={`flex flex-col items-center text-xs ${
                      active ? "text-violet-600 font-semibold" : "text-gray-500"
                    }`}
                  >
                    <img src={item.icon} className="w-6 h-6 mb-1" />
                    {item.title}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Mobile Sub Menu */}
        {activeCategory && (
          <div className="fixed bottom-16 left-0 w-full bg-white border-t p-4 z-40">
            <div className="flex justify-between mb-2">
              <h3 className="text-sm font-semibold">{activeCategory}</h3>
              <button onClick={() => setActiveCategory(null)}>✕</button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {superAdminMenuItems
                .find((m) => m.title === activeCategory)
                ?.children?.map((item: any) =>
                  item.action === "logout" ? (
                    <button
                      key={item.title}
                      onClick={handleLogout}
                      className="border border-red-400 text-red-600 rounded-lg p-3 text-xs flex flex-col items-center"
                    >
                      <img src={item.icon} className="w-6 h-6 mb-1" />
                      {item.title}
                    </button>
                  ) : (
                    <NavLink
                      key={item.title}
                      to={item.url}
                      onClick={() => setActiveCategory(null)}
                      className={`border rounded-lg p-3 text-xs flex flex-col items-center ${
                        location.pathname === item.url
                          ? "border-violet-600 text-violet-600"
                          : "border-gray-200 text-gray-600"
                      }`}
                    >
                      <img src={item.icon} className="w-6 h-6 mb-1" />
                      {item.title}
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
