// src/components/HospitalAppSidebar.tsx

import { NavLink, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import { useState } from "react";
import { PaIcons } from "@/components/icons/PaIcons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const menuItems = [
  { title: "Dashboard", url: "/hospital-dashboard", icon: PaIcons.dashboard },
  {
    title: "People's",
    icon: PaIcons.hierarchyIcon,
    children: [
      { title: "Doctors List", url: "/hs-doctors", icon: PaIcons.doctors },
      { title: "Staff List", url: "/hs-staff", icon: PaIcons.staff },
      { title: "Patients List", url: "/hs-patients-list", icon: PaIcons.patient2 },
    ],
  },
  {
    title: "Screen's",
    icon: PaIcons.screenIcon,
    children: [
      { title: "Dashboard", url: "/hs-screen-dashboard", icon: PaIcons.dashboard },
      { title: "Manage Screens", url: "/hs-manage-screens", icon: PaIcons.manageScreenIcon },
      { title: "Add Screens", url: "/hs-add-screen", icon: PaIcons.AddIcon },
      { title: "Screen Settings", url: "/hs-screen-settings", icon: PaIcons.settings2Icon },
    ],
  },
  /*{ title: "Doctors", url: "/hs-doctors", icon: PaIcons.doctors },
  { title: "Staff", url: "/hs-staff", icon: PaIcons.staff },
  {
    title: "Patients",
    icon: PaIcons.patient2,
    children: [
      { title: "Patients List", url: "/hs-patients-list", icon: PaIcons.healthCheck },
     // { title: "Appointments", url: "/hs-patients-appointments", icon: PaIcons.calendar2 },
    ],
  },*/
  {
    title: "Ward",
    icon: PaIcons.patientViewIcon,
    children: [
      { title: "Manage Ward", url: "/hs-manage-ward-info", icon: PaIcons.healthCheck },
      { title: "Bed Permission", url: "/hs-manage-bed-permission", icon: PaIcons.patientViewIcon },
    ],
  },
  {
    title: "Inventory",
    icon: PaIcons.hierarchyIcon,
    children: [
      { title: "Medical Stores", url: "/hs-medical", icon: PaIcons.InventoryIcon },
      { title: "Medical I. Requests", url: "/hs-medical-inventory-requests", icon: PaIcons.InventoryIcon },
      { title: "Medical R. Approvals", url: "/hs-medical-inv-request-approvals", icon: PaIcons.approve2Icon },
      //{ title: "Approve Request list", url: "/hs-medical-inv-request-approved", icon: PaIcons.approve2Icon },
      //{ title: "Decline Request list", url: "/hs-medical-inv-request-declined", icon: PaIcons.approve2Icon },

      { title: "Receipt Verification", url: "/hs-medical-inv-receipt-verification", icon: PaIcons.approve3Icon },

      { title: "Inventory List", url: "/hs-inventory-list", icon: PaIcons.InventoryListIcon },
      { title: "Inventory Masters", url: "/hs-inventory-masters", icon: PaIcons.MastersIcon },
      { title: "Add Medicine", url: "/hs-inventory-add-medicine", icon: PaIcons.MedicineIcon },
      { title: "Add Batch", url: "/hs-inventory-add-batch", icon: PaIcons.BatchIcon },
    ],
  },
  {
    title: "Access",
    icon: PaIcons.permission,
    children: [
      { title: "Role Access", url: "/hs-role-access", icon: PaIcons.roleAccessIcon },
      { title: "OTP Access", url: "/hs-employee-opt-access", icon: PaIcons.otpIcon },
      { title: "Laboratory Pryority", url: "/hs-laboratory-pryority", icon: PaIcons.laboratoryIcon },
      { title: "Share Patient Info", url: "/hs-share-patient-info", icon: PaIcons.patientEditIcon },
    ],
  },
  {
    title: "Masters",
    icon: PaIcons.settings2Icon,
    children: [
      { title: "Shift Time", url: "/hs-shift-time-list", icon: PaIcons.shift2Icon },
      { title: "Specialization", url: "/hs-specialization-list", icon: PaIcons.proofIcon },
      { title: "Event Type", url: "/hs-event-type-list", icon: PaIcons.party1Icon },
      { title: "Department", url: "/hs-department-list", icon: PaIcons.hierarchyIcon },
      { title: "Role", url: "/hs-role-list", icon: PaIcons.roleIcon },
      { title: "Amenities", url: "/hs-amenities-list", icon: PaIcons.amenitiesIcon },
      { title: "Room Type", url: "/hs-room-type-list", icon: PaIcons.amenitiesIcon },
      { title: "Ward Type", url: "/hs-ward-type-list", icon: PaIcons.amenitiesIcon },
      { title: "Treatments", url: "/hs-doctor-treatment", icon: PaIcons.MastersIcon },
    ],
  },
];

const profileItems = [
  { title: "Profile", url: "/hospital-profile", icon: PaIcons.user1 },
  //{ title: "Notification", url: "/hs-notifications", icon: PaIcons.notification },
  //{ title: "Settings", url: "/hs-settings", icon: PaIcons.setting },
  { title: "Logout", action: "logout", icon: PaIcons.switch },
];

export function HospitalAppSidebar() {
  const location = useLocation();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const userInfo = Cookies.get("userInfo");
  const currentUser = userInfo ? JSON.parse(userInfo) : null;

  if (!currentUser || currentUser.role !== "hospital_admin") return null;

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("userInfo");
    window.location.href = "/login";
  };

  const mobileMenuData = [
    ...menuItems,
    {
      title: "Profile",
      icon: PaIcons.user1,
      children: [
        { title: "Profile", url: "/hospital-profile", icon: PaIcons.user1 },
        { title: "Logout", action: "logout", icon: PaIcons.switch },
      ],
    },
  ];

  return (
    <>
    <header className="hidden md:block fixed top-0 left-0 w-full bg-white border-b border-border shadow-sm z-50">
      <div className="max-w-screen-2xl mx-auto flex items-center justify-between px-6 py-3">
        {/* Logo & Admin Info */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
            <img src={PaIcons.hospital} alt="logo" className="w-5 h-5" />
          </div>
          <div className="hidden sm:block">
            <h2 className="font-bold text-foreground">Hospital Admin</h2>
            <p className="text-xs text-muted-foreground">{currentUser.name}</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex items-center gap-6">
          {menuItems.map((item) =>
            item.children ? (
              <DropdownMenu key={item.title}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-1">
                    {item.icon && <img src={item.icon} alt={item.title} className="w-6 h-6" />}
                    <span>{item.title}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-52">
                  {item.children.map((child) => (
                    <DropdownMenuItem asChild key={child.title}>
                      <NavLink
                        to={child.url}
                        className={`flex items-center gap-2 ${
                          location.pathname === child.url
                            ? "text-primary font-medium"
                            : "text-muted-foreground"
                        }`}
                      >
                        {child.icon && <img src={child.icon} alt={child.title} className="w-6 h-6" />}
                        {child.title}
                      </NavLink>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <NavLink
                key={item.title}
                to={item.url}
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                  location.pathname === item.url
                    ? "text-primary border-b-2 border-primary pb-1"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.icon && <img src={item.icon} alt={item.title} className="w-6 h-6" />}
                <span className="hidden md:inline">{item.title}</span>
              </NavLink>
            )
          )}
        </nav>

        {/* Profile / Settings Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <img src={PaIcons.setting} alt="profile" className="w-5 h-5" />
              <span className="hidden md:inline">Profile</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {profileItems.map((item) =>
              item.action === "logout" ? (
                <DropdownMenuItem
                  key={item.title}
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-red-600"
                >
                  <img src={item.icon} alt={item.title} className="w-4 h-4" />
                  {item.title}
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem asChild key={item.title}>
                  <NavLink to={item.url} className="flex items-center gap-2">
                    <img src={item.icon} alt={item.title} className="w-4 h-4" />
                    {item.title}
                  </NavLink>
                </DropdownMenuItem>
              )
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>

    {/* 📱 Mobile Bottom Nav */}
    <div className="block md:hidden">
      <nav className="fixed bottom-0 left-0 w-full bg-white dark:bg-neutral-900 shadow-lg border-t border-gray-200 dark:border-gray-800 z-50">
        <ul className="flex justify-around items-center h-16 overflow-x-auto no-scrollbar">
          {mobileMenuData.map((item) => {
            const hasChildren = !!item.children;
            const isActive =
              (item.url && location.pathname === item.url) ||
              (hasChildren &&
                item.children?.some((child: any) => child.url && location.pathname === child.url));
            const isOpen = activeCategory === item.title;

            return (
              <li key={item.title} className="flex-shrink-0 px-2">
                <button
                  onClick={() =>
                    hasChildren
                      ? setActiveCategory(isOpen ? null : item.title)
                      : (window.location.href = item.url)
                  }
                  className={`flex flex-col items-center justify-center text-xs w-16 ${
                    isActive ? "text-violet-600" : "text-gray-400"
                  }`}
                >
                  <img
                    src={item.icon}
                    alt={item.title}
                    className={`w-6 h-6 mb-1 transition-opacity ${
                      isActive ? "opacity-100" : "opacity-85"
                    }`}
                  />
                  <span className="truncate w-full text-center text-[10px]">{item.title}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Mobile Sub-Menu */}
      {activeCategory && (
        <div className="fixed bottom-16 left-0 w-full bg-white dark:bg-neutral-900 border-t border-gray-200 p-4 z-40 max-h-[60vh] overflow-y-auto shadow-2xl rounded-t-xl">
          <div className="flex justify-between items-center mb-4 sticky top-0 bg-white dark:bg-neutral-900 pb-2 border-b border-gray-100 z-10">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">{activeCategory}</h3>
            <button 
              onClick={() => setActiveCategory(null)} 
              className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="sr-only">Close</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 pb-2">
            {mobileMenuData
              .find((m) => m.title === activeCategory)
              ?.children?.map((item: any) =>
                item.action === "logout" ? (
                  <button
                    key={item.title}
                    onClick={handleLogout}
                    className="flex flex-col items-center justify-center p-3 rounded-lg border border-red-200 bg-red-50 text-red-600 active:scale-95 transition-transform"
                  >
                    <img src={item.icon} className="w-6 h-6 mb-2" />
                    <span className="text-xs font-medium">{item.title}</span>
                  </button>
                ) : (
                  <NavLink
                    key={item.title}
                    to={item.url}
                    onClick={() => setActiveCategory(null)}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border active:scale-95 transition-all ${
                      location.pathname === item.url
                        ? "border-violet-200 bg-violet-50 text-violet-700 shadow-sm"
                        : "border-gray-100 bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <img src={item.icon} alt={item.title} className="w-6 h-6 mb-2 opacity-80" />
                    <span className="text-xs font-medium text-center line-clamp-2">{item.title}</span>
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
