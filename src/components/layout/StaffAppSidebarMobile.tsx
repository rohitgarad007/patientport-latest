import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { PaIcons } from "@/components/icons/PaIcons";
import { fetchStaffPermissions } from "@/services/staffService";

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
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // --- category icons ---
  const categoryIcons: Record<string, any> = {
    Patient: PaIcons.patients,
    Medical: PaIcons.PrescriptionsIcon,
    Appointments: PaIcons.calendar2,
    Ward: PaIcons.ICUIcon,
    Pharmacy: PaIcons.InventoryIcon,
    Laboratory: PaIcons.LaboratoryIcon,
    Billing: PaIcons.BillingIcon,
    "IT Access": PaIcons.AccountsIcon,
    "HR-Staff M.": PaIcons.AssignmentsIcon,
  };

  // --- grouped permissions ---
  const groupedPermissions: RoleGroup[] = [
    {
      category: "Patient",
      permissions: [
        { id: "patient_list", name: "Patient List", description: "Patient list information", icon: PaIcons.patients, enabled: false },
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
        { id: "appointment_list", name: "Appointment List", description: "Patient appointments list", icon: PaIcons.patienthealthIcon, enabled: false },
        { id: "book_appointment", name: "Book Appointment", description: "Create new patient appointments", icon: PaIcons.calendar2, enabled: false },
      ],
    },
    {
      category: "Ward",
      permissions: [
        { id: "icu_access", name: "ICU Access", description: "Access intensive care units", icon: PaIcons.ICUIcon, enabled: false },
        { id: "assign_rooms", name: "Assign Patient Rooms", description: "Allocate rooms to patients", icon: PaIcons.AssignIcon, enabled: false },
        { id: "monitor_beds", name: "Monitor Beds", description: "Monitor bed availability", icon: PaIcons.MonitorIcon, enabled: false },
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
        { id: "perform_lab_tests", name: "Perform Lab Tests", description: "Conduct diagnostic procedures", icon: PaIcons.LaboratoryIcon, enabled: false },
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

  // --- fetch staff permissions dynamically ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetchStaffPermissions();
        setPermissions(response);
      } catch (err) {
        console.error("Error fetching staff permissions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;

  // --- filter categories by permissions ---
  const categories = groupedPermissions
    .map((group) => {
      const allowed = group.permissions.filter((p) => permissions[p.id] === "1");
      return allowed.length > 0 ? { ...group, permissions: allowed } : null;
    })
    .filter(Boolean) as RoleGroup[];

  return (
    <>
      {/* Bottom Nav Bar (categories only) */}
      <nav className="fixed bottom-0 left-0 w-full bg-white dark:bg-neutral-900 shadow-lg border-t border-gray-200 dark:border-gray-800 z-50">
        <ul className="flex justify-around items-center h-16">
          {categories.map((cat) => {
            const active = activeCategory === cat.category;
            return (
              <li key={cat.category}>
                <button
                  onClick={() => setActiveCategory(active ? null : cat.category)}
                  className={`flex flex-col items-center justify-center text-xs transition-all ${
                    active ? "text-violet-600 font-semibold" : "text-gray-500"
                  }`}
                >
                  <img
                    src={categoryIcons[cat.category]}
                    alt={cat.category}
                    className={`w-6 h-6 mb-1 transition-transform ${
                      active ? "scale-110" : ""
                    }`}
                  />
                  {cat.category}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Submenu Panel (if category clicked) */}
      {activeCategory && (
        <div className="fixed bottom-16 left-0 w-full bg-white dark:bg-neutral-900 shadow-lg border-t border-gray-200 dark:border-gray-800 z-40 animate-slide-up p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold">{activeCategory}</h3>
            <button
              onClick={() => setActiveCategory(null)}
              className="text-gray-400 text-sm"
            >
              Close ✕
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {categories
              .find((cat) => cat.category === activeCategory)
              ?.permissions.map((item) => {
                const active =
                  location.pathname === `/sf-${item.id.replace(/_/g, "-")}`;
                return (
                  <NavLink
                    key={item.id}
                    to={`/sf-${item.id.replace(/_/g, "-")}`}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                      active
                        ? "border-violet-600 text-violet-600"
                        : "border-gray-200 text-gray-600"
                    }`}
                    onClick={() => setActiveCategory(null)}
                  >
                    <img
                      src={item.icon}
                      alt={item.name}
                      className="w-6 h-6 mb-1"
                    />
                    <span className="text-xs">{item.name}</span>
                  </NavLink>
                );
              })}
          </div>
        </div>
      )}
    </>
  );
}
