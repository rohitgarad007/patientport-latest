import { useState, useEffect } from "react";
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
import { toast } from "@/hooks/use-toast";
import Swal from "sweetalert2";
import {
  fetchEventTypes,
  addEventType,
  updateEventType,
  deleteEventType,
  EventType,
  EventTypePayload,
} from "@/services/HSHospitalService";

const predefinedColors = [
  "#EF4444", "#F97316", "#FACC15", "#22C55E", "#10B981",
  "#06B6D4", "#3B82F6", "#6366F1", "#8B5CF6", "#D946EF",
  "#EC4899", "#F43F5E", "#14B8A6", "#84CC16", "#A855F7",
];

const HospitalEventTypeList = () => {
  const [events, setEvents] = useState<EventType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EventType | null>(null);
  const [formData, setFormData] = useState<EventTypePayload>({
    name: "",
    description: "",
    status: "1",
    color: "#3B82F6", // default color (blue)
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEventTypes();
  }, []);

  const loadEventTypes = async () => {
    try {
      setLoading(true);
      const res = await fetchEventTypes();
      setEvents(res.data || []);
    } catch (error) {
      toast({ title: "Failed to load event types", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = events.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ name: "", description: "", status: "1", color: "#3B82F6" });
    setIsDialogOpen(true);
  };

  const handleEdit = (item: EventType) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      status: item.status === "active" ? "1" : "0",
      color: item.color || "#3B82F6",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
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
        const res = await deleteEventType(id);
        if (res.success) {
          await Swal.fire({
            title: "Deleted!",
            text: "Event Type deleted successfully.",
            icon: "success",
            timer: 3000,
            timerProgressBar: true,
          });
          loadEventTypes();
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
        const res = await updateEventType(editingItem.id, formData);
        if (res.success) {
          toast({ title: "Event type updated successfully" });
          loadEventTypes();
        } else {
          toast({ title: "Update failed", variant: "destructive" });
        }
      } else {
        const res = await addEventType(formData);
        if (res.success) {
          toast({ title: "Event type added successfully" });
          loadEventTypes();
        } else {
          toast({ title: "Add failed", variant: "destructive" });
        }
      }
      setIsDialogOpen(false);
    } catch {
      toast({ title: "Error saving event type", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-1">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground pb-4">
            Manage Event Type List
          </h1>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Event Type
          </Button>
        </div>

        <div className="flex gap-4 pt-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search event types..."
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
                <TableHead>Color</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div
                        className="w-6 h-6 rounded-full border borderRound2"
                        style={{ backgroundColor: item.color || "#ccc" }}
                      ></div>
                    </TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="max-w-md">{item.description}</TableCell>
                    <TableCell>
                      <Badge
                        variant={item.status === "active" ? "default" : "secondary"}
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
                  <TableCell colSpan={5} className="text-center py-6">
                    No event types found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Edit Event Type" : "Add New Event Type"}
              </DialogTitle>
              <DialogDescription>
                {editingItem
                  ? "Update the event type details below"
                  : "Fill in the details to create a new event type"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Consultation"
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
                  placeholder="Brief description of the event type"
                  rows={3}
                />
              </div>

              {/* 🎨 Color Picker */}
              <div>
                <Label>Color Code</Label>
                <div className="grid grid-cols-8 gap-2 mt-2">
                  {predefinedColors.map((color) => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded-full border-2 borderRound2 transition ${
                        formData.color === color
                          ? "border-black scale-110"
                          : "border-transparent"
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, color })}
                    />

                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status === "1" ? "active" : "inactive"}
                  onValueChange={(value: "active" | "inactive") =>
                    setFormData({
                      ...formData,
                      status: value === "active" ? "1" : "0",
                    })
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

export default HospitalEventTypeList;
