import { NavLink, useLocation, Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { PaIcons } from "@/components/icons/PaIcons";
import { fetchStaffPermissions } from "@/services/staffService";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Users, FileText, Calendar, CreditCard } from "lucide-react";


interface Permission {
  id: string;
  name: string;
  description: string;
  icon: any;
  enabled: boolean;
}

interface RoleGroup {
  category: string;
  permissions: Permission[];
}

export function StaffAppSidebar() {
  const location = useLocation();
  const [permissions, setPermissions] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);


  const categoryIcons: Record<string, any> = {
    "Patient": PaIcons.patients,
    "Medical": PaIcons.PrescriptionsIcon,
    "Appointments": PaIcons.calendar2,
    "Ward": PaIcons.ICUIcon,
    "Pharmacy": PaIcons.InventoryIcon,
    "Laboratory": PaIcons.LaboratoryIcon,
    "Billing": PaIcons.BillingIcon,
    "IT Access": PaIcons.AccountsIcon,
    "HR-Staff M.": PaIcons.AssignmentsIcon,
  };

  const groupedPermissions: RoleGroup[] = [
    {
      category: "Patient",
      permissions: [
        { id: "patient_list", name: "Patient List ", description: "Patient list information", icon: PaIcons.patients, enabled: false },
        //{ id: "view_patients", name: "View Patient ", description: "View patient history", icon: PaIcons.patientViewIcon, enabled: false },
        //{ id: "add_patients", name: "Add Patient ", description: "Add patient information", icon: PaIcons.AddIcon, enabled: false },
        //{ id: "edit_patients", name: "Edit Patient Records", description: "Modify patient records", icon: PaIcons.patientEditIcon, enabled: false },
        //{ id: "view_medical_history", name: "View Medical History", description: "Access patient medical history", icon: PaIcons.PrescriptionsIcon, enabled: false },
      ],
    },
    {
      category: "Medical",
      permissions: [
        { id: "write_prescriptions", name: "Write Prescriptions", description: "Create medication prescriptions", icon: PaIcons.PrescriptionsIcon, enabled: false },
        { id: "view_lab_results", name: "View Lab Results", description: "Access laboratory test results", icon: PaIcons.ResultsIcon, enabled: false },
        { id: "request_lab_tests", name: "Request Lab Tests", description: "Order diagnostic tests", icon: PaIcons.LabTestsIcon, enabled: false },
        { id: "manage_vitals", name: "Manage Patient Vitals", description: "Record and update vital signs", icon: PaIcons.PatientVitalsIcon, enabled: false },
      ],
    },
    {
      category: "Appointments",
      permissions: [
        { id: "appointment_list", name: "Appointment List", description: "patient appointments List", icon: PaIcons.patienthealthIcon, enabled: false },
        { id: "book_appointment", name: "Book Appointment", description: "Create new patient appointments", icon: PaIcons.calendar2, enabled: false },
        //{ id: "reschedule_appointment", name: "Reschedule Appointment", description: "Modify existing appointments", icon: PaIcons.RescheduleIcon, enabled: false },
        //{ id: "cancel_appointment", name: "Cancel Appointment", description: "Cancel patient appointments", icon: PaIcons.CancelAppointmentIcon, enabled: false },
      ],
    },
    {
      category: "Ward",
      permissions: [
        { id: "icu_access", name: "ICU Access", description: "Access intensive care units", icon: PaIcons.ICUIcon, enabled: false },
        { id: "assign_rooms", name: "Assign Patient Rooms", description: "Allocate rooms to patients", icon: PaIcons.AssignIcon, enabled: false },
        { id: "monitor_beds", name: "Monitor Bed ", description: "Monitor bed availability", icon: PaIcons.MonitorIcon, enabled: false },
        { id: "emergency_access", name: "Emergency Facilities", description: "Access emergency facilities", icon: PaIcons.EmergencyIcon, enabled: false },
      ],
    },
    {
      category: "Pharmacy",
      permissions: [
        { id: "view_inventory", name: "Medicine Inventory", description: "Check medication stock levels", icon: PaIcons.InventoryIcon, enabled: false },
        { id: "dispense_medication", name: "Dispense Medication", description: "Provide medications to patients", icon: PaIcons.DispenseIcon, enabled: false },
        { id: "manage_controlled", name: "Handle Restricted Medications", description: "Handle restricted medications", icon: PaIcons.RestrictedIcon, enabled: false },
        { id: "reorder_stock", name: "Purchase Inventory", description: "Purchase new inventory", icon: PaIcons.PurchaseIcon, enabled: false },
      ],
    },
    {
      category: "Laboratory",
      permissions: [
        { id: "perform_lab_tests", name: "Perform Lab. Tests", description: "Conduct diagnostic procedures", icon: PaIcons.LaboratoryIcon, enabled: false },
        { id: "manage_lab_equipment", name: "Manage Lab Equipment", description: "Operate laboratory machinery", icon: PaIcons.EquipmentIcon, enabled: false },
        { id: "lab_safety", name: "Lab Safety Management", description: "Maintain safety protocols", icon: PaIcons.SafetyIcon, enabled: false },
      ],
    },
    {
      category: "Billing",
      permissions: [
        { id: "view_billing", name: "View Billing Information", description: "Access patient billing data", icon: PaIcons.BillingIcon, enabled: false },
        { id: "process_payments", name: "Process Payments", description: "Handle payment transactions", icon: PaIcons.ProcessIcon, enabled: false },
        { id: "apply_discounts", name: "Apply Discounts", description: "Provide billing discounts", icon: PaIcons.DiscountsIcon, enabled: false },
        { id: "insurance_claims", name: "Manage Insurance Claims", description: "Process insurance submissions", icon: PaIcons.InsuranceIcon, enabled: false },
        { id: "financial_reports", name: "View Financial Analytics", description: "Access financial analytics", icon: PaIcons.FinancialIcon, enabled: false },
      ],
    },
    {
      category: "IT Access",
      permissions: [
        { id: "manage_users", name: "Manage User Accounts", description: "Create and modify user accounts", icon: PaIcons.AccountsIcon, enabled: false },
        { id: "assign_roles", name: "Assign Roles", description: "Grant and revoke user roles", icon: PaIcons.RolesIcon, enabled: false },
        { id: "system_monitoring", name: "System Monitoring", description: "Monitor system performance", icon: PaIcons.MonitoringIcon, enabled: false },
        { id: "emergency_override", name: "Emergency Override Access", description: "Break-glass emergency access", icon: PaIcons.OverrideIcon, enabled: false },
      ],
    },
    {
      category: "HR-Staff M.",
      permissions: [
        { id: "view_staff_profiles", name: "View Staff Profiles", description: "Access employee information", icon: PaIcons.ProfilesIcon, enabled: false },
        { id: "manage_shifts", name: "Manage Staff Assignments", description: "Schedule staff assignments", icon: PaIcons.AssignmentsIcon, enabled: false },
        { id: "performance_reviews", name: "Conduct Staff Evaluations", description: "Conduct staff evaluations", icon: PaIcons.EvaluationsIcon, enabled: false },
      ],
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const userInfo = Cookies.get("userInfo");
        const token = Cookies.get("token");
        if (!userInfo || !token) return;

        const parsedUser = JSON.parse(userInfo);
        //console.log(parsedUser);
        if (parsedUser.role !== "staff") return;

        setCurrentUser(parsedUser);

        const response = await fetchStaffPermissions();
        setPermissions(response); // API returns { patient_list: "1", view_patients: "0", ... }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  //if (!currentUser) return <Navigate to="/login" replace />;

  if (loading) return <div>Loading menu...</div>;

  // Build filtered menu from groupedPermissions based on enabled API flags
  const filteredMenu = groupedPermissions
    .map(group => {
      const items = group.permissions
        .filter(p => permissions[p.id] === "1")
        .map(p => ({
          title: p.name,
          url: `/sf-${p.id.replace(/_/g, "-")}`,
          icon: p.icon,
        }));

      if (items.length === 0) return null;

      return { 
        title: group.category, 
        children: items, 
        icon: categoryIcons[group.category] || PaIcons.patient2 // fallback icon
      };
    })
    .filter(Boolean);

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("userInfo");
    window.location.href = "/login";
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-white border-b border-border shadow-sm z-50">
      <div className="max-w-screen-2xl mx-auto flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
            <img src={PaIcons.hospital} alt="logo" className="w-5 h-5" />
          </div>
          <div className="hidden sm:block">
            <h2 className="font-bold text-foreground">Welcome {currentUser.name}</h2>
            <p className="text-xs text-muted-foreground"></p>
          </div>
        </div>

        <nav className="flex items-center gap-6">
          {filteredMenu.map((item: any) =>
            item.children && item.children.length ? (
              <DropdownMenu key={item.title}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-1">
                    <img src={item.icon} alt={item.title} className="w-6 h-6" />
                    <span>{item.title}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-52">
                  {item.children.map((child: any) => (
                    <DropdownMenuItem asChild key={child.title}>
                      <NavLink
                        to={child.url}
                        className={`flex items-center gap-2 ${
                          location.pathname === child.url ? "text-primary font-medium" : "text-muted-foreground"
                        }`}
                      >
                        <img src={child.icon} alt={child.title} className="w-6 h-6" />
                        {child.title}
                      </NavLink>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null
          )}
        </nav>

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
            <DropdownMenuItem asChild>
              <NavLink to="/hs-profile" className="flex items-center gap-2">
                <img src={PaIcons.user1} alt="Profile" className="w-4 h-4" /> Profile
              </NavLink>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <NavLink to="/hs-settings" className="flex items-center gap-2">
                <img src={PaIcons.setting} alt="Settings" className="w-4 h-4" /> Settings
              </NavLink>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 text-red-600">
              <img src={PaIcons.switch} alt="Logout" className="w-4 h-4" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
