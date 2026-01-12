import { useEffect, useState } from "react";
import { Search, Plus, Pencil, Trash2, Building2 } from "lucide-react";
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
  Department,
  DepartmentPayload,
  fetchDepartments,
  addDepartment,
  updateDepartment,
  deleteDepartment,
} from "@/services/HSHospitalService";



const HospitalDepartmentList = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    status: "active" as "active" | "inactive",
  });

  const loadDepartments = async () => {
    try {
      const res = await fetchDepartments();
      setDepartments(res.data || []);
    } catch {
      toast({ title: "Failed to fetch departments", variant: "destructive" });
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const filteredItems = departments.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ name: "", status: "active" });
    setIsDialogOpen(true);
  };

  const handleEdit = (item: Department) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      status: item.status,
    });
    setIsDialogOpen(true);
  };

 

  const handleDelete = async (deptuid: string) => {
    // Show confirmation
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const res = await deleteDepartment(deptuid);
        if (res.success) {
          // Success message with 3s auto-close and progress bar
          let timerInterval: any;
          await Swal.fire({
            title: "Deleted!",
            text: "Department deleted successfully.",
            icon: "success",
            timer: 3000,
            timerProgressBar: true,
            didOpen: () => {
              Swal.showLoading();
              timerInterval = setInterval(() => {}, 100);
            },
            willClose: () => {
              clearInterval(timerInterval);
            },
          });

          loadDepartments();
        } else {
          Swal.fire({
            title: "Failed!",
            text: "Delete failed",
            icon: "error",
            timer: 3000,
            timerProgressBar: true,
          });
        }
      } catch (error) {
        Swal.fire({
          title: "Error!",
          text: "Something went wrong",
          icon: "error",
          timer: 3000,
          timerProgressBar: true,
        });
      }
    }
  };

  const handleSave = async () => {
    if (!formData.name) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }

    const payload: DepartmentPayload = {
      name: formData.name,
      status: formData.status === "active" ? "1" : "0",
    };

    try {
      if (editingItem) {
        const res = await updateDepartment(editingItem.deptuid, payload);
        if (res.success) {
          toast({ title: "Department updated successfully" });
          loadDepartments();
        }
      } else {
        const res = await addDepartment(payload);
        if (res.success) {
          toast({ title: "Department added successfully" });
          loadDepartments();
        }
      }
      setIsDialogOpen(false);
    } catch {
      toast({ title: "Error saving department", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-1">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground pb-4">
            Manage Department List
          </h1>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Department
          </Button>
        </div>

        <div className="flex gap-4 pt-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search departments..."
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

        <div className="border rounded-lg mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length ? (
                filteredItems.map((item) => (
                  <TableRow key={item.deptuid}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    
                    <TableCell>
                      <Badge variant={item.status === "active" ? "default" : "secondary"}>
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
                          onClick={() => handleDelete(item.deptuid)}
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
                    No departments found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Edit Department" : "Add New Department"}
              </DialogTitle>
              <DialogDescription>
                {editingItem
                  ? "Update the department details below"
                  : "Fill in the details to create a new department"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Department Name</Label>
                <Input
                  deptuid="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Emergency Department"
                />
              </div>
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

export default HospitalDepartmentList;
