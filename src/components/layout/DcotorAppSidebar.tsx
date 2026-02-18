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

export function DcotorAppSidebar() {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Load doctor info from cookie
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

  // Doctor Menu Structure
  const menuData = [
    {
      title: "Dashboard",
      url: "/doctor-dashboard",
      icon: PaIcons.dashboard,
    },
    {
      title: "Calendar",
      url: "/doctor-calendar",
      icon: PaIcons.calendar2,
    },
    {
      title: "Patients",
      icon: PaIcons.patients,
      children: [
        { title: "Today Visit", url: "/doctor-today-visit", icon: PaIcons.patienthealthIcon },
        { title: "Completed Patient", url: "/doctor-completed-list", icon: PaIcons.patienthealthIcon },
        //{ title: "View Patient", url: "/doctor-view-patient", icon: PaIcons.patienthealthIcon },
        //{ title: "Patient List", url: "/doctor-patient-list", icon: PaIcons.patienthealthIcon },
      ],
    },
    /*{
      title: "Treatment",
      url: "/doctor-treatment",
      icon: PaIcons.PrescriptionsIcon,
    },*/
    {
      title: "Master",
      icon: PaIcons.MastersIcon,
      children: [
        { title: "Medication Sugg", url: "/doctor-medication-sugg", icon: PaIcons.MedicineIcon },
        { title: "Add Medication Sugg", url: "/doctor-medication-add-sugg", icon: PaIcons.AddIcon },
        { title: "Manage Receipts", url: "/doctor-manage-receipts", icon: PaIcons.RolesIcon },
        { title: "Receipt Content", url: "/doctor-receipts-content", icon: PaIcons.RolesIcon },
      ],
    },
    /*{
      title: "Reports",
      url: "/doctor-reports",
      icon: PaIcons.ResultsIcon,
    },*/
    {
      title: "Profile",
      icon: PaIcons.user1,
      children: [
        { title: "Profile Info", url: "/doctor-profile", icon: PaIcons.user1 },
        { title: "Logout", action: "logout", icon: PaIcons.switch },
      ],
    },
  ];

  return (
    <>
      {/* 💻 Desktop Navbar */}
      <header className="hidden md:block fixed top-0 left-0 w-full bg-white border-b border-border shadow-sm z-50">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between px-6 py-3">
          
          {/* Logo + Doctor Name */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <img src={PaIcons.hospital} alt="logo" className="w-5 h-5" />
            </div>

            {currentUser && (
              <div>
                <h2 className="font-bold text-foreground">{currentUser.name}</h2>
                <p className="text-xs text-muted-foreground">{currentUser.department}</p>
              </div>
            )}
          </div>

          {/* Desktop Nav */}
          <nav className="flex items-center gap-6">
            {menuData.map((item: any) =>
              item.children ? (
                <DropdownMenu key={item.title}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center gap-1">
                      <img src={item.icon} alt={item.title} className="w-6 h-6" />
                      <span>{item.title}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-52">
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
                            <img src={child.icon} alt={child.title} className="w-6 h-6" />
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

      {/* 📱 Mobile Bottom Nav */}
      <div className="block md:hidden">
        <nav className="fixed bottom-0 left-0 w-full bg-white dark:bg-neutral-900 shadow-lg border-t border-gray-200 dark:border-gray-800 z-50">
          <ul className="flex justify-around items-center h-16">
            {menuData.map((item) => {
              const hasChildren = !!item.children;
              const isActive =
                (item.url && location.pathname === item.url) ||
                (hasChildren &&
                  item.children?.some((child: any) => child.url && location.pathname === child.url));
              const isOpen = activeCategory === item.title;

              return (
                <li key={item.title}>
                  <button
                    onClick={() =>
                      hasChildren
                        ? setActiveCategory(isOpen ? null : item.title)
                        : (window.location.href = item.url)
                    }
                    className={`flex flex-col items-center justify-center text-xs ${
                      isActive ? "text-violet-600" : "text-gray-400"
                    }`}
                  >
                    <img
                      src={item.icon}
                      alt={item.title}
                      className={`w-6 h-6 mb-1 transition-opacity ${
                        isActive ? "opacity-100" : "opacity-40"
                      }`}
                    />
                    <span className="sr-only">{item.title}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Mobile Sub-Menu */}
        {activeCategory && (
          <div className="fixed bottom-16 left-0 w-full bg-white dark:bg-neutral-900 border-t border-gray-200 p-4 z-40">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold">{activeCategory}</h3>
              <button onClick={() => setActiveCategory(null)} className="text-gray-400 text-sm">
                Close ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {menuData
                .find((m) => m.title === activeCategory)
                ?.children?.map((item: any) =>
                  item.action === "logout" ? (
                    <button
                      key={item.title}
                      onClick={handleLogout}
                      className="flex flex-col items-center justify-center p-3 rounded-lg border border-red-300 text-red-600"
                    >
                      <img src={item.icon} className="w-6 h-6 mb-1" />
                      <span className="text-xs">{item.title}</span>
                    </button>
                  ) : (
                    <NavLink
                      key={item.title}
                      to={item.url}
                      onClick={() => setActiveCategory(null)}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border ${
                        location.pathname === item.url
                          ? "border-violet-600 text-violet-600"
                          : "border-gray-200 text-gray-600"
                      }`}
                    >
                      <img src={item.icon} alt={item.title} className="w-6 h-6 mb-1" />
                      <span className="text-xs">{item.title}</span>
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
