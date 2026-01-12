import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Plus,
  Search,
  Phone,
  Mail,
  UserCog,
  Calendar,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Users,
  Shield,
  Clock,
  Building,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import {
  fetchStaff,
  addStaff,
  updateStaff,
  getStaffRoles,
  getStaffDepartments,
  changeStaffStatus,
  deleteStaff
} from "@/services/HsstaffService";
import HSStaffFormDialog from "@/components/staff/HSStaffFormDialog";
import Swal from "sweetalert2";
import { PaIcons } from "@/components/icons/PaIcons";

import Cookies from "js-cookie";

export default function HSStaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [hospitals, setHospitals] = useState<any[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedHospital, setSelectedHospital] = useState("");

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any | null>(null);
  const [allowStaffCount, setAllowStaffCount] = useState("");
  useEffect(() => {
    loadData();
  }, [searchTerm, selectedRole, selectedHospital]);

  const loadData = async () => {
    try {
      const staffRes = await fetchStaff(1, 50, searchTerm, selectedRole, selectedHospital);
      setStaff(staffRes.data || []);

      const roleRes = await getStaffRoles();
      setRoles(roleRes.data || []);

      const deptRes = await getStaffDepartments();
      setDepartments(deptRes.data || []);

      loadHospitalsFromCookie();
    } catch (err) {
      console.error("Error loading staff:", err);
    }
  };

  

   const loadHospitalsFromCookie = () => {
    try {
      const cookieData = Cookies.get("userInfo"); // name of your cookie
      if (cookieData) {
        const parsed = JSON.parse(cookieData);

        setAllowStaffCount(parsed.staffCount);
        // Only keep logged in hospital
        setHospitals([
          {
            hosuid: parsed.loguid,
            name: parsed.name,
          },
        ]);
      }
    } catch (err) {
      console.error("Failed to load hospital from cookies:", err);
    }
  };


  const handleAddStaff = async (data: any) => {
    await addStaff(data);
    loadData();
  };

  const handleUpdateStaff = async (data: any) => {
    if (editingStaff) {
      await updateStaff(editingStaff.staff_uid, data);
      setEditingStaff(null);
      loadData();
    }
  };

  const avgExperience =
    staff.length > 0
      ? staff.reduce((sum, s) => sum + (s.experience || 0), 0) / staff.length
      : 0;

  const filteredStaff = staff.filter((s) => {
    const matchesSearch =
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.department?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = !selectedRole || s.role === selectedRole;
    const matchesHospital = !selectedHospital || s.hospitalId === selectedHospital;

    return matchesSearch && matchesRole && matchesHospital;
  });

  // Inside HSStaffPage component
  const handleStatusChange = async (id: string, newStatus: "active" | "inactive") => {
    try {
      // Convert status to backend format (0/1)
      const statusValue = newStatus === "active" ? 1 : 0;

      // Call backend API
      await changeStaffStatus(id, statusValue);

      // Update local state
      setStaff((prevStaff) =>
        prevStaff.map((s) =>
          s.staff_uid === id ? { ...s, status: statusValue.toString() } : s
        )
      );
    } catch (err) {
      console.error("Error changing status:", err);
    }
  };



  const handleDeleteStaff = async (id: string) => {
    

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });  

    if (result.isConfirmed) {
      try {
        await deleteStaff(id);
        loadData();

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Doctor has been deleted.",
          timer: 3000,             
          timerProgressBar: true,  
          showConfirmButton: false 
        });
      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Something went wrong while deleting.",
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false
        });
      }
    }

  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Staff Management ({allowStaffCount})</h1>
          
        </div>
        {/*<Button
          className="flex items-center gap-2"
          onClick={() => {
            setEditingStaff(null);
            setIsFormDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4" />
          Add Staff Member
        </Button>*/}

        {staff.length < Number(allowStaffCount) ? (
          <Button
            className="flex items-center gap-2"
            onClick={() => {
              setEditingStaff(null);
              setIsFormDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4" />
            Add Staff Member
          </Button>
        ) : (
          <Button
            variant="destructive"
            disabled
            className="flex items-center gap-2 cursor-not-allowed opacity-70"
          >
            🚫 Add Staff Limit Reached
          </Button>
        )}

      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Staff"
          value={staff.length.toString()}
          description="Active staff members"
          icon={PaIcons.staff}
          trend={{ value: 12, isPositive: true }}
          variant="blue"
        />
        <StatCard
          title="Departments"
          value={departments.length.toString()}
          description="Hospital departments"
          icon={PaIcons.departments}
          trend={{ value: 3, isPositive: true }}
          variant="purple"
        />
        
        <StatCard
          title="Total Experience"
          value={`${
            staff.length > 0
              ? (() => {
                  // sum total months
                  const totalMonths = staff.reduce(
                    (sum, doc) =>
                      sum + (Number(doc.experienceYears || 0) * 12 + Number(doc.experienceMonths || 0)),
                    0
                  );
                  const years = Math.floor(totalMonths / 12);
                  const months = totalMonths % 12;
                  return `${years} years | ${months} months`;
                })()
              : "0 years | 0 months"
          }`}
          description="Professional experience"
          icon={PaIcons.experience}
          trend={{ value: 3, isPositive: true }}
          variant="blue"
        />
        
        <StatCard
          title="Active Today"
          value={staff.filter((s) => s.shift === "Day").length.toString()}
          description="Day shift staff"
          icon={PaIcons.calendar2}
          trend={{ value: 5, isPositive: true }}
          variant="success"
        />
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Staff Directory</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-80"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff Member</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Role & Department</TableHead>
                <TableHead>Hospital</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Shift</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>


              {filteredStaff.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                    No staff records found
                  </TableCell>
                </TableRow>
              ) : (
                filteredStaff.map((s) => {
                const hospital = hospitals.find((h) => h.id === s.hospitalId);
                return (
                  <TableRow key={s.staff_uid}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {s.name?.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-foreground">{s.name}</div>
                          <div className="text-sm text-muted-foreground">ID: {s.staff_uid}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <img src={PaIcons.email} alt="Email" className="w-4 h-4 " />
                          {s.email}
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <img src={PaIcons.phone} alt="Phone" className="w-4 h-4" />
                          {s.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant="secondary">{s.role}</Badge>
                        <div className="text-sm text-muted-foreground">{s.department}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{s.hospitalName || "Unknown"}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <img src={PaIcons.experience} alt="Location" className="w-5 h-5 mt-0.5 flex-shrink-0" />

                        {`${s.experienceYears || '0'} Years ${s.experienceMonths || '0'} Months`}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          s.shift === "Day"
                            ? "border-yellow-500 text-yellow-700"
                            : "border-blue-500 text-blue-700"
                        }
                      >
                        {s.shift}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      

                      <Badge
                        variant="secondary"
                        className={`${
                          s.status == "1"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {s.status == "1" ? "Active" : "Inactive"}
                      </Badge>

                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <img src={PaIcons.setting} alt="More" className="w-6 h-6" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {s.status == "1" ? (
                            <DropdownMenuItem onClick={() => handleStatusChange(s.staff_uid, "inactive")}>
                              <img src={PaIcons.red} alt="Inactive" className="w-3 h-3 mr-2" /> Set Inactive
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleStatusChange(s.staff_uid, "active")}>
                              <img src={PaIcons.green} alt="Active" className="w-3 h-3 mr-2" /> Set Active
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem>
                            <img src={PaIcons.view} alt="Edit" className="w-4 h-4 mr-2" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingStaff(s);
                              setIsFormDialogOpen(true);
                            }}
                          >
                            <img src={PaIcons.edit} alt="Edit" className="w-4 h-4 mr-2" />
                            Edit Staff
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDeleteStaff(s.staff_uid)}
                          >
                            <img src={PaIcons.delete} alt="Edit" className="w-4 h-4 mr-2" />
                            Remove Staff
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })

            )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Staff Dialog */}
      <HSStaffFormDialog
        open={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        onSubmit={editingStaff ? handleUpdateStaff : handleAddStaff}
        roles={roles}
        departments={departments}
        hospitals={hospitals}
        initialData={editingStaff || undefined}
      />
    </div>
  );
}
