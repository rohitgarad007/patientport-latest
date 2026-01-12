// pages/HospitalRoleAccess.tsx
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
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

import { mockRoles } from "@/data/rolesData";

interface Permission {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  enabled: boolean;
}

interface RoleConfig {
  id: string;
  name: string;
  color: string;
  permissions: Permission[];
}

export default function HospitalRoleAccess() {
  const { toast } = useToast();

  const [doctorOptions, setDoctorOptions] = useState<any[]>([]);
  const [staffOptions, setStaffOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);

  // Shared permission template
  const permissionsTemplate: Permission[] = [
    {
      id: "patient_list",
      name: "Patient List",
      description: "Full access to patient list",
      icon: Users,
      enabled: true,
    },
    {
      id: "view_patients",
      name: "View Patients",
      description: "View patient information",
      icon: Users,
      enabled: true,
    },
    {
      id: "add_patients",
      name: "Add Patients",
      description: "Register new patients",
      icon: Users,
      enabled: false,
    },
    {
      id: "update_patients",
      name: "Update Patients",
      description: "Modify patient records",
      icon: Users,
      enabled: false,
    },
    {
      id: "appointment_list",
      name: "Appointment List",
      description: "See all appointments",
      icon: Calendar,
      enabled: true,
    },
    {
      id: "book_appointment",
      name: "Book Appointment",
      description: "Schedule new appointments",
      icon: Calendar,
      enabled: false,
    },
    {
      id: "process_appointment",
      name: "Process Appointment",
      description: "Confirm/cancel appointments",
      icon: Calendar,
      enabled: false,
    },
    {
      id: "view_bills",
      name: "View Bills",
      description: "Check billing information",
      icon: CreditCard,
      enabled: false,
    },
    {
      id: "medical_records",
      name: "Medical Records",
      description: "View/edit medical history",
      icon: FileText,
      enabled: false,
    },
  ];

  const [roles, setRoles] = useState<RoleConfig[]>([
    {
      id: "doctor",
      name: "Doctor",
      color: "bg-blue-500",
      permissions: [...permissionsTemplate],
    },
    {
      id: "staff",
      name: "Staff",
      color: "bg-green-500",
      permissions: [...permissionsTemplate],
    },
  ]);

  // ✅ Fetch doctors and staff from APIs
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
            label: doc.doctorName + " (" + doc.phone + ")",
          })) || []
        );

        setStaffOptions(
          staff?.data?.map((st: any) => ({
            value: st.staff_uid,
            label: st.name + " (" + st.phone + ")",
          })) || []
        );
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to load doctors/staff",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  // 🟢 Load doctor access when selected
  useEffect(() => {
    const loadDoctorAccess = async () => {
      if (!selectedDoctor) return;

      try {
        const res = await fetchDoctorAccess(selectedDoctor.value);
        const access = res?.data || {};

        setRoles((prev) =>
          prev.map((role) =>
            role.id === "doctor"
              ? {
                  ...role,
                  permissions: role.permissions.map((p) => ({
                    ...p,
                    enabled: access.hasOwnProperty(p.id)
                      ? access[p.id] === "1"
                      : p.enabled,
                  })),
                }
              : role
          )
        );
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to fetch doctor access",
          variant: "destructive",
        });
      }
    };

    loadDoctorAccess();
  }, [selectedDoctor]);

  // 🟢 Load staff access when selected
  useEffect(() => {
    const loadStaffAccess = async () => {
      if (!selectedStaff) return;

      try {
        const res = await fetchStaffAccess(selectedStaff.value);
        const access = res?.data || {};

        setRoles((prev) =>
          prev.map((role) =>
            role.id === "staff"
              ? {
                  ...role,
                  permissions: role.permissions.map((p) => ({
                    ...p,
                    enabled: access.hasOwnProperty(p.id)
                      ? access[p.id] === "1"
                      : p.enabled,
                  })),
                }
              : role
          )
        );
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to fetch staff access",
          variant: "destructive",
        });
      }
    };

    loadStaffAccess();
  }, [selectedStaff]);

  const togglePermission = (roleId: string, permissionId: string) => {
    setRoles((prevRoles) =>
      prevRoles.map((role) =>
        role.id === roleId
          ? {
              ...role,
              permissions: role.permissions.map((permission) =>
                permission.id === permissionId
                  ? { ...permission, enabled: !permission.enabled }
                  : permission
              ),
            }
          : role
      )
    );
  };

  const saveChanges = async (roleId: string) => {
    try {
      let response;

      if (roleId === "doctor" && selectedDoctor) {
        const doctorPermissions = roles
          .find((r) => r.id === "doctor")
          ?.permissions.reduce((acc: any, p) => {
            acc[p.id] = p.enabled ? "1" : "0";
            return acc;
          }, {});

        response = await updateDoctorAccess(
          selectedDoctor.value,
          doctorPermissions
        );
      } else if (roleId === "staff" && selectedStaff) {
        const staffPermissions = roles
          .find((r) => r.id === "staff")
          ?.permissions.reduce((acc: any, p) => {
            acc[p.id] = p.enabled ? "1" : "0";
            return acc;
          }, {});

        response = await updateStaffAccess(
          selectedStaff.value,
          staffPermissions
        );
      }

      if (response?.success) {
        toast({
          title: "Success",
          description: `Permissions for ${roleId} have been updated.`,
        });
      } else {
        throw new Error("Failed to update permissions");
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update permissions",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Shield className="w-8 h-8 text-primary" />
          Role Access Control
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage permissions and access levels for hospital users
        </p>
      </div>

      {/* Tabs */}
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

            {/* Show mockRoles grid BEFORE doctor selection */}
            {!selectedDoctor && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {mockRoles.map((role) => (
                  <div
                    key={role.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: role.color }}
                        />
                        <h3 className="font-semibold">{role.name}</h3>
                      </div>
                      <div className="flex gap-2">
                        
                        <Badge variant="outline">
                          {role.permissions.length} permissions
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {role.description}
                    </p>
                    
                  </div>
                ))}
              </div>
            )}

            {/* Doctor Permissions */}
            {selectedDoctor && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">
                    Doctor Permissions
                  </CardTitle>
                  <CardDescription>
                    Configure access permissions for this doctor
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {roles
                      .find((r) => r.id === "doctor")
                      ?.permissions.map((permission) => (
                        <div
                          key={permission.id}
                          className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50"
                        >
                          <div className="flex items-start gap-3 flex-1">
                            <permission.icon className="w-5 h-5 mt-1 text-muted-foreground" />
                            <div>
                              <h4 className="font-medium flex items-center gap-2">
                                {permission.name}
                                {permission.enabled ? (
                                  <Eye className="w-4 h-4 text-green-500" />
                                ) : (
                                  <EyeOff className="w-4 h-4 text-muted-foreground" />
                                )}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {permission.description}
                              </p>
                            </div>
                          </div>
                          <Switch
                            checked={permission.enabled}
                            onCheckedChange={() =>
                              togglePermission("doctor", permission.id)
                            }
                          />
                        </div>
                      ))}
                  </div>
                  <div className="flex justify-end">
                    <Button
                      onClick={() => saveChanges("doctor")}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
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

            {/* Show mockRoles grid BEFORE staff selection */}
            {!selectedStaff && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {mockRoles.map((role) => (
                  <div
                    key={role.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: role.color }}
                        />
                        <h3 className="font-semibold">{role.name}</h3>
                      </div>
                      <div className="flex gap-2">
                        {role.requiresMFA && (
                          <Badge
                            variant="outline"
                            className="text-warning border-warning/20"
                          >
                            MFA
                          </Badge>
                        )}
                        <Badge variant="outline">
                          {role.permissions.length} permissions
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {role.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Department: {role.department}</span>
                      {role.maxSessionDuration && (
                        <span>
                          Session: {role.maxSessionDuration}
                          min
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Staff Permissions */}
            {selectedStaff && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">
                    Staff Permissions
                  </CardTitle>
                  <CardDescription>
                    Configure access permissions for this staff member
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {roles
                      .find((r) => r.id === "staff")
                      ?.permissions.map((permission) => (
                        <div
                          key={permission.id}
                          className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50"
                        >
                          <div className="flex items-start gap-3 flex-1">
                            <permission.icon className="w-5 h-5 mt-1 text-muted-foreground" />
                            <div>
                              <h4 className="font-medium flex items-center gap-2">
                                {permission.name}
                                {permission.enabled ? (
                                  <Eye className="w-4 h-4 text-green-500" />
                                ) : (
                                  <EyeOff className="w-4 h-4 text-muted-foreground" />
                                )}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {permission.description}
                              </p>
                            </div>
                          </div>
                          <Switch
                            checked={permission.enabled}
                            onCheckedChange={() =>
                              togglePermission("staff", permission.id)
                            }
                          />
                        </div>
                      ))}
                  </div>
                  <div className="flex justify-end">
                    <Button
                      onClick={() => saveChanges("staff")}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
