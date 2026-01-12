import { useEffect, useState } from "react";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import Swal from "sweetalert2";
import {
  Specialization,
  fetchSpecializations,
  addSpecialization,
  updateSpecialization,
  deleteSpecialization,
} from "@/services/HSHospitalService";

const HospitalSpecializationList = () => {
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Specialization | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "active" as "active" | "inactive",
  });

  const loadSpecializations = async () => {
    setLoading(true);
    try {
      //const data = await fetchSpecializations();
      const response = await fetchSpecializations();
      setSpecializations(response.data || []);
    } catch (error) {
      toast({ title: "Failed to load specializations", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSpecializations();
  }, []);

  const filteredItems = specializations.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ name: "", description: "", status: "active" });
    setIsDialogOpen(true);
  };

  const handleEdit = (item: Specialization) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      status: item.status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
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
        const res = await deleteSpecialization(id);
        if (res.success) {
          // Success message with 3s auto-close and progress bar
          let timerInterval: any;
          await Swal.fire({
            title: "Deleted!",
            text: "Specialization deleted successfully.",
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

          loadSpecializations();
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
    if (!formData.name || !formData.description) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }

    try {
      if (editingItem) {
        // Pass id separately
        const res = await updateSpecialization(editingItem.id, formData);
        if (res.success) {
          toast({ title: "Specialization updated successfully" });
        } else {
          toast({ title: "Update failed", variant: "destructive" });
        }
      } else {
        const res = await addSpecialization(formData);
        if (res.success) {
          toast({ title: "Specialization added successfully" });
        } else {
          toast({ title: "Add failed", variant: "destructive" });
        }
      }

      setIsDialogOpen(false);
      loadSpecializations();
    } catch (error) {
      toast({ title: "Error saving specialization", variant: "destructive" });
      console.error(error);
    }
  };


  return (
    <div className="space-y-6">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-1">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground pb-4">
            Manage Specialization List
          </h1>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Specialization
          </Button>
        </div>

        <div className="flex gap-4 pt-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search specializations..."
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
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="max-w-md">{item.description}</TableCell>
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
                          onClick={() => handleDelete(item.id)}
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
                    No specializations found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Dialog for Add/Edit */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Edit Specialization" : "Add New Specialization"}
              </DialogTitle>
              <DialogDescription>
                {editingItem
                  ? "Update the specialization details below"
                  : "Fill in the details to create a new specialization"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Cardiology"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Brief description of the specialization"
                  rows={3}
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

export default HospitalSpecializationList;
