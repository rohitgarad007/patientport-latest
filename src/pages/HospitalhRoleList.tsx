import { useState, useEffect } from "react";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import Swal from "sweetalert2";
import { toast } from "@/hooks/use-toast";
import {
  fetchRoles,
  addRole,
  updateRole,
  deleteRole,
  fetchDepartments,
} from "@/services/HSHospitalService";

/* ---------------------------------
 * Interfaces
 * --------------------------------- */
interface Role {
  roleuid: string;
  name: string;
  deptuid: string;
  deptName?: string;
  status: "active" | "inactive";
}

interface Department {
  deptuid: string;
  name: string;
  status?: "active" | "inactive";
}

/* ---------------------------------
 * Component
 * --------------------------------- */
const HospitalhRoleList = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    deptuid: "",
    status: "active" as "active" | "inactive",
  });

  /* ---------------------------------
   * Load Roles + Departments
   * --------------------------------- */
  const loadData = async () => {
    try {
      const [roleRes, deptRes] = await Promise.all([
        fetchRoles(),
        fetchDepartments(),
      ]);

      // 🔹 Debug check
      console.log("Departments Loaded:", deptRes.data);

      setRoles(roleRes.data || []);
      setDepartments(deptRes.data || []);
      //console.log(deptRes.data);
    } catch (err) {
      console.error("Error loading data:", err);
      toast({
        title: "Error loading roles or departments",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* ---------------------------------
   * Filters
   * --------------------------------- */
  const filteredItems = roles.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.deptName?.toLowerCase().includes(searchQuery.toLowerCase()) ??
        false);
    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  /* ---------------------------------
   * CRUD Handlers
   * --------------------------------- */
  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ name: "", deptuid: "", status: "active" });
    setIsDialogOpen(true);
  };

  const handleEdit = (item: Role) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      deptuid: item.deptuid,
      status: item.status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (roleuid: string) => {
    const swalRes = await Swal.fire({
      title: "Delete Role?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      
    });
    if (!swalRes.isConfirmed) return;

    try {
      const res = await deleteRole(roleuid);
      if (res.success) {
        Swal.fire({
          icon: "success",
          title: "Role deleted!",
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
        loadData();
      } else {
        toast({ title: "Delete failed", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error deleting role", variant: "destructive" });
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.deptuid) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }

    try {
      let res;
      if (editingItem) {
        res = await updateRole(editingItem.roleuid, formData);
      } else {
        res = await addRole(formData);
      }

      if (res.success) {
        Swal.fire({
          icon: "success",
          title: editingItem ? "Role updated!" : "Role added!",
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
        setIsDialogOpen(false);
        loadData();
      } else {
        toast({ title: "Operation failed", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error saving role", variant: "destructive" });
    }
  };

  /* ---------------------------------
   * JSX
   * --------------------------------- */
  return (
    <div className="space-y-6">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-1">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground pb-4">
            Manage Role List
          </h1>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Role
          </Button>
        </div>

        {/* Search + Filter */}
        <div className="flex gap-4 pt-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search roles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="border rounded-lg mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <TableRow key={item.roleuid}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.deptName || "—"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          item.status === "active" ? "default" : "secondary"
                        }
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(item)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {/*<Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item.roleuid)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>*/}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6">
                    No roles found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Edit Role" : "Add New Role"}
              </DialogTitle>
              <DialogDescription>
                {editingItem
                  ? "Update the role details below"
                  : "Fill in the details to create a new role"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Role Name */}
              <div>
                <Label htmlFor="name">Role Name</Label>
                <Input
                  roleuid="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Surgeon"
                />
              </div>

              {/* Department */}
              <div>
                <Label htmlFor="department">Department</Label>
                <Select
                  value={formData.deptuid}
                  onValueChange={(value) =>
                    setFormData({ ...formData, deptuid: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.length > 0 ? (
                      departments.map((dept) => (
                        <SelectItem key={dept.deptuid} value={dept.deptuid}>
                          {dept.name}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="text-center py-2 text-muted-foreground">
                        No departments found
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "active" | "inactive") =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {editingItem ? "Update" : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default HospitalhRoleList;
