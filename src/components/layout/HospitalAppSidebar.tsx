// src/components/HospitalAppSidebar.tsx

import { NavLink, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
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
  //{ title: "Profile", url: "/hs-profile", icon: PaIcons.user1 },
  //{ title: "Notification", url: "/hs-notifications", icon: PaIcons.notification },
  //{ title: "Settings", url: "/hs-settings", icon: PaIcons.setting },
  { title: "Logout", action: "logout", icon: PaIcons.switch },
];

export function HospitalAppSidebar() {
  const location = useLocation();
  const userInfo = Cookies.get("userInfo");
  const currentUser = userInfo ? JSON.parse(userInfo) : null;

  if (!currentUser || currentUser.role !== "hospital_admin") return null;

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("userInfo");
    window.location.href = "/login";
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-white border-b border-border shadow-sm z-50">
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
  );
}
