// pages/HospitalRoleAccess.tsx
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Users,
  Calendar,
  FileText,
  CreditCard,
  Shield,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";
import Select from "react-select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

import {
  fetchDoctorList,
  fetchDoctorAccess,
  updateDoctorAccess,
} from "@/services/HsdoctorService";
import {
  fetchStaffList,
  fetchStaffAccess,
  updateStaffAccess,
} from "@/services/HsstaffService";
import { PaIcons } from "@/components/icons/PaIcons";
import { mockRoles } from "@/data/rolesData";

interface Permission {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  enabled: boolean;
}

interface RoleGroup {
  category: string;
  permissions: Permission[];
}

interface RoleConfig {
  id: string;
  name: string;
  color: string;
  permissions: RoleGroup[];
}

export default function HospitalRoleAccess() {
  const { toast } = useToast();

  const [doctorOptions, setDoctorOptions] = useState<any[]>([]);
  const [staffOptions, setStaffOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);

  // ✅ Grouped permissions template
  const groupedPermissions: RoleGroup[] = [
    {
      category: "Patient Information Access",
      permissions: [
        { id: "patient_list", name: "Patient  Information", description: "Patient list information", icon: PaIcons.patient2, enabled: false },
        { id: "view_patients", name: "View  Information", description: "View patient history", icon: PaIcons.view, enabled: false },
        { id: "add_patients", name: "Add  Information", description: "Add patient information", icon: PaIcons.AddIcon, enabled: false },
        { id: "edit_patients", name: "Edit  Records", description: "Modify patient records", icon: PaIcons.patientEditIcon, enabled: false },
        { id: "view_medical_history", name: "Medical History", description: "Access patient medical history", icon: PaIcons.report, enabled: false },
        
      ],
    },
    {
      category: "Medical Operations",
      permissions: [
        { id: "write_prescriptions", name: "Write Prescriptions", description: "Create medication prescriptions", icon: PaIcons.PrescriptionsIcon, enabled: false },
        { id: "view_lab_results", name: "View Lab Results", description: "Access laboratory test results", icon: PaIcons.ResultsIcon, enabled: false },
        { id: "request_lab_tests", name: "Request Lab Tests", description: "Order diagnostic tests", icon: PaIcons.LabTestsIcon, enabled: false },
        { id: "manage_vitals", name: "Manage Patient Vitals", description: "Record and update vital signs", icon: PaIcons.PatientVitalsIcon, enabled: false },
      ],
    },
    {
      category: "Appointments & Scheduling",
      permissions: [
        { id: "appointment_list", name: "Appointment List", description: "patient appointments List", icon: PaIcons.calendar2, enabled: false },
        { id: "book_appointment", name: "Book Appointment", description: "Create new patient appointments", icon: PaIcons.bookIcon, enabled: false },
        { id: "reschedule_appointment", name: "Reschedule ", description: "Modify existing appointments", icon: PaIcons.RescheduleIcon, enabled: false },
        { id: "cancel_appointment", name: "Cancel Appointment", description: "Cancel patient appointments", icon: PaIcons.CancelAppointmentIcon, enabled: false },
      ],
    },
    {
      category: "Ward & Facility Access",
      permissions: [
        { id: "icu_access", name: "ICU Access", description: "Access intensive care units", icon: PaIcons.ICUIcon, enabled: false },
        { id: "assign_rooms", name: "Assign Patient Rooms", description: "Allocate rooms to patients", icon: PaIcons.AssignIcon, enabled: false },
        { id: "bad_request_approved", name: "Approve Bed Request", description: "Access patient medical history", icon: PaIcons.patientViewIcon, enabled: false },
        { id: "monitor_beds", name: "Monitor Bed Availability", description: "Monitor bed availability", icon: PaIcons.MonitorIcon, enabled: false },
        { id: "emergency_access", name: "Emergency  Access", description: "Access emergency facilities", icon: PaIcons.EmergencyIcon, enabled: false },
      ],
    },
    {
      category: "Pharmacy Management",
      permissions: [
        { id: "view_inventory", name: "View Medicine Inventory", description: "Check medication stock levels", icon: PaIcons.InventoryIcon, enabled: false },
        { id: "dispense_medication", name: "Dispense Medication", description: "Provide medications to patients", icon: PaIcons.DispenseIcon, enabled: false },
        { id: "manage_controlled", name: "Handle Restricted Medications", description: "Handle restricted medications", icon: PaIcons.RestrictedIcon, enabled: false },
        { id: "reorder_stock", name: "Purchase New Inventory", description: "Purchase new inventory", icon: PaIcons.PurchaseIcon, enabled: false },
      ],
    },
    {
      category: "Laboratory & Diagnostics",
      permissions: [
        { id: "perform_lab_tests", name: "Perform Laboratory Tests", description: "Conduct diagnostic procedures", icon: PaIcons.LaboratoryIcon, enabled: false },
        { id: "manage_lab_equipment", name: "Manage Lab Equipment", description: "Operate laboratory machinery", icon: PaIcons.EquipmentIcon, enabled: false },
        { id: "lab_safety", name: "Lab Safety Management", description: "Maintain safety protocols", icon: PaIcons.SafetyIcon, enabled: false },
      ],
    },
    {
      category: "Billing & Finance",
      permissions: [
        { id: "view_billing", name: "View Billing Information", description: "Access patient billing data", icon: PaIcons.BillingIcon, enabled: false },
        { id: "process_payments", name: "Process Payments", description: "Handle payment transactions", icon: PaIcons.ProcessIcon, enabled: false },
        { id: "apply_discounts", name: "Apply Discounts", description: "Provide billing discounts", icon: PaIcons.DiscountsIcon, enabled: false },
        { id: "insurance_claims", name: "Manage Insurance Claims", description: "Process insurance submissions", icon: PaIcons.InsuranceIcon, enabled: false },
        { id: "financial_reports", name: "View Financial Analytics", description: "Access financial analytics", icon: PaIcons.FinancialIcon, enabled: false },
      ],
    },
    {
      category: "IT & System Access",
      permissions: [
        { id: "manage_users", name: "Manage User Accounts", description: "Create and modify user accounts", icon: PaIcons.AccountsIcon, enabled: false },
        { id: "assign_roles", name: "Assign Roles", description: "Grant and revoke user roles", icon: PaIcons.RolesIcon, enabled: false },
        { id: "system_monitoring", name: "System Monitoring", description: "Monitor system performance", icon: PaIcons.MonitoringIcon, enabled: false },
        { id: "emergency_override", name: "Emergency Override Access", description: "Break-glass emergency access", icon: PaIcons.OverrideIcon, enabled: false },
      ],
    },
    {
      category: "HR & Staff Management",
      permissions: [
        { id: "view_staff_profiles", name: "View Staff Profiles", description: "Access employee information", icon: PaIcons.ProfilesIcon, enabled: false },
        { id: "manage_shifts", name: "Manage Staff Assignments", description: "Schedule staff assignments", icon: PaIcons.AssignmentsIcon, enabled: false },
        { id: "performance_reviews", name: "Conduct Staff Evaluations", description: "Conduct staff evaluations", icon: PaIcons.EvaluationsIcon, enabled: false },
      ],
    },
  ];

  const [roles, setRoles] = useState<RoleConfig[]>([
    { id: "doctor", name: "Doctor", color: "bg-blue-500", permissions: groupedPermissions },
    { id: "staff", name: "Staff", color: "bg-green-500", permissions: groupedPermissions },
  ]);

  // 🟢 Load doctors and staff options
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const [doctors, staff] = await Promise.all([
          fetchDoctorList(),
          fetchStaffList(),
        ]);

        setDoctorOptions(
          doctors?.data?.map((doc: any) => ({
            value: doc.docuid,
            label: `${doc.doctorName} (${doc.phone})`,
          })) || []
        );

        setStaffOptions(
          staff?.data?.map((st: any) => ({
            value: st.staff_uid,
            label: `${st.name} (${st.phone})`,
          })) || []
        );
      } catch {
        toast({ title: "Error", description: "Failed to load users", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  // 🟢 Load doctor access
  useEffect(() => {
    if (!selectedDoctor) return;
    const loadDoctorAccess = async () => {
      try {
        const res = await fetchDoctorAccess(selectedDoctor.value);
        const access = res?.data || {};
        setRoles((prev) =>
          prev.map((role) =>
            role.id === "doctor"
              ? {
                  ...role,
                  permissions: role.permissions.map((group) => ({
                    ...group,
                    permissions: group.permissions.map((p) => ({
                      ...p,
                      enabled: access.hasOwnProperty(p.id) ? access[p.id] === "1" : p.enabled,
                    })),
                  })),
                }
              : role
          )
        );
      } catch {
        toast({ title: "Error", description: "Failed to fetch doctor access", variant: "destructive" });
      }
    };
    loadDoctorAccess();
  }, [selectedDoctor]);

  // 🟢 Load staff access
  useEffect(() => {
    if (!selectedStaff) return;
    const loadStaffAccess = async () => {
      try {
        const res = await fetchStaffAccess(selectedStaff.value);
        const access = res?.data || {};
        setRoles((prev) =>
          prev.map((role) =>
            role.id === "staff"
              ? {
                  ...role,
                  permissions: role.permissions.map((group) => ({
                    ...group,
                    permissions: group.permissions.map((p) => ({
                      ...p,
                      enabled: access.hasOwnProperty(p.id) ? access[p.id] === "1" : p.enabled,
                    })),
                  })),
                }
              : role
          )
        );
      } catch {
        toast({ title: "Error", description: "Failed to fetch staff access", variant: "destructive" });
      }
    };
    loadStaffAccess();
  }, [selectedStaff]);

  const togglePermission = (roleId: string, groupIndex: number, permissionId: string) => {
    setRoles((prevRoles) =>
      prevRoles.map((role) =>
        role.id === roleId
          ? {
              ...role,
              permissions: role.permissions.map((group, gIdx) =>
                gIdx === groupIndex
                  ? {
                      ...group,
                      permissions: group.permissions.map((p) =>
                        p.id === permissionId ? { ...p, enabled: !p.enabled } : p
                      ),
                    }
                  : group
              ),
            }
          : role
      )
    );
  };

  const saveChanges = async (roleId: string) => {
    try {
      let response;
      const role = roles.find((r) => r.id === roleId);
      if (!role) return;

      const permissionsObj: Record<string, string> = {};
      role.permissions.forEach((group) =>
        group.permissions.forEach((p) => (permissionsObj[p.id] = p.enabled ? "1" : "0"))
      );

      if (roleId === "doctor" && selectedDoctor) {
        response = await updateDoctorAccess(selectedDoctor.value, permissionsObj);
      } else if (roleId === "staff" && selectedStaff) {
        response = await updateStaffAccess(selectedStaff.value, permissionsObj);
      }

      if (response?.success) {
        toast({ title: "Success", description: `Permissions for ${roleId} updated.` });
      } else throw new Error("Failed to update permissions");
    } catch {
      toast({ title: "Error", description: "Failed to update permissions", variant: "destructive" });
    }
  };

  const renderPermissions = (roleId: string) => {
    const role = roles.find((r) => r.id === roleId);
    if (!role) return null;

    return role.permissions.map((group, gIdx) => (
      <div key={group.category || gIdx} className="mb-6">
        <h4 className="font-medium flex items-center mb-2">
          {group.category}
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {group.permissions.map((p) => (
            <div key={p.id} className="flex items-start justify-between p-2 border rounded-lg hover:bg-muted/50">
              <div className="flex items-start gap-3 flex-1">
                {p.icon && <img src={p.icon} alt={p.name} className="w-6 h-6" />}
                <div>
                  <h3 className="text-[13px] font-medium flex items-center gap-2">
                    {p.name} 
                    {p.enabled ? <Eye className="w-4 h-4 text-green-500" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                  </h3>
                  <p className="text-[11px] text-muted-foreground">{p.description}</p>
                </div>
              </div>
              <Switch checked={p.enabled} onCheckedChange={() => togglePermission(roleId, gIdx, p.id)} />
            </div>
          ))}
        </div>
      </div>
    ));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Shield className="w-8 h-8 text-primary" />
          Role Access Control
        </h1>
        <p className="text-muted-foreground mt-2">Manage permissions and access levels for hospital users</p>
      </div>

      <Tabs defaultValue="doctor" className="w-full">
        <TabsList className="grid grid-cols-2 max-w-sm">
          <TabsTrigger value="doctor">Doctor</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
        </TabsList>

        {/* Doctor Tab */}
        <TabsContent value="doctor">
          <div className="space-y-4 border p-4 rounded-md">
            <Select
              isLoading={loading}
              options={doctorOptions}
              placeholder="Select Doctor"
              value={selectedDoctor}
              onChange={setSelectedDoctor}
            />

            {!selectedDoctor && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {mockRoles.map((role) => (
                  <div key={role.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: role.color }} />
                        <h3 className="font-semibold">{role.name}</h3>
                      </div>
                      <div className="flex gap-2">
                        {role.requiresMFA && <Badge variant="outline" className="text-warning border-warning/20">MFA</Badge>}
                        <Badge variant="outline">{role.permissions.length} permissions</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{role.description}</p>
                  </div>
                ))}
              </div>
            )}

            {selectedDoctor && (
              <div className="space-y-4">
                {renderPermissions("doctor")}
                <div className="flex justify-end">
                  <Button onClick={() => saveChanges("doctor")} className="bg-primary hover:bg-primary/90">
                    <Check className="w-4 h-4 mr-2" /> Save Changes
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Staff Tab */}
        <TabsContent value="staff">
          <div className="space-y-4 border p-4 rounded-md">
            <Select
              isLoading={loading}
              options={staffOptions}
              placeholder="Select Staff"
              value={selectedStaff}
              onChange={setSelectedStaff}
            />

            {!selectedStaff && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {mockRoles.map((role) => (
                  <div key={role.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: role.color }} />
                        <h3 className="font-semibold">{role.name}</h3>
                      </div>
                      <div className="flex gap-2">
                        {role.requiresMFA && <Badge variant="outline" className="text-warning border-warning/20">MFA</Badge>}
                        <Badge variant="outline">{role.permissions.length} permissions</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{role.description}</p>
                  </div>
                ))}
              </div>
            )}

            {selectedStaff && (
              <div className="space-y-4">
                {renderPermissions("staff")}
                <div className="flex justify-end">
                  <Button onClick={() => saveChanges("staff")} className="bg-primary hover:bg-primary/90">
                    <Check className="w-4 h-4 mr-2" /> Save Changes
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
