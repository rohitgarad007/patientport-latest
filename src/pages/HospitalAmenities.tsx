import { useState, useEffect } from "react";
import { Search, Plus, Pencil } from "lucide-react";
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
import { toast } from "@/hooks/use-toast";
import Swal from "sweetalert2";
import { PaIcons } from "@/components/icons/PaIcons";
import {
  fetchHospitalAmenities,
  addHospitalAmenity,
  updateHospitalAmenity,
  deleteHospitalAmenity,
  HospitalAmenity,
  HospitalAmenityPayload,
} from "@/services/HSHospitalService";

// 🧩 Icon Options
/*const amenityIconOptions = [
  { key: "ac", label: "Air Conditioner", icon: PaIcons.acIcon },
  { key: "fan", label: "Ceiling Fan", icon: PaIcons.fanIcon },
  { key: "tvicon", label: "Television", icon: PaIcons.televisionIcon },
  { key: "cooler", label: "Cooler", icon: PaIcons.coolerIcon },
  { key: "fridge", label: "Refrigerator", icon: PaIcons.refrigeratorIcon },
  { key: "geyser", label: "Hot Water", icon: PaIcons.hotwaterIcon },
  { key: "bathroom", label: "Bathroom", icon: PaIcons.bathroomIcon },
  { key: "water", label: "Drinking Water", icon: PaIcons.drinkingWaterIcon },
  { key: "mattress", label: "Mattress", icon: PaIcons.mattressIcon },
  { key: "pillow", label: "Pillow", icon: PaIcons.pillowIcon },
  { key: "blanket", label: "Blanket", icon: PaIcons.blanketIcon },
  { key: "sofa", label: "Sofa", icon: PaIcons.sofaIcon },
  { key: "chair", label: "Chair", icon: PaIcons.chairIcon },
  { key: "locker", label: "Locker", icon: PaIcons.lockerIcon },
  { key: "phone", label: "Telephone", icon: PaIcons.telephoneIcon },
  { key: "wifi", label: "Wi-Fi", icon: PaIcons.wifaIcon },
  { key: "dustbin", label: "Dustbin", icon: PaIcons.dustbinIcon },
  { key: "oxygen", label: "Oxygen", icon: PaIcons.oxygenIcon },
];*/

const amenityIconOptions = [
  { key: "acIcon", label: "Air Conditioner", icon: PaIcons.acIcon },
  { key: "fanIcon", label: "Ceiling Fan", icon: PaIcons.fanIcon },
  { key: "televisionIcon", label: "Television", icon: PaIcons.televisionIcon },
  { key: "coolerIcon", label: "Cooler", icon: PaIcons.coolerIcon },
  { key: "refrigeratorIcon", label: "Refrigerator", icon: PaIcons.refrigeratorIcon },
  { key: "hotwaterIcon", label: "Hot Water", icon: PaIcons.hotwaterIcon },
  { key: "bathroomIcon", label: "Bathroom", icon: PaIcons.bathroomIcon },
  { key: "drinkingWaterIcon", label: "Drinking Water", icon: PaIcons.drinkingWaterIcon },
  { key: "mattressIcon", label: "Mattress", icon: PaIcons.mattressIcon },
  { key: "pillowIcon", label: "Pillow", icon: PaIcons.pillowIcon },
  { key: "blanketIcon", label: "Blanket", icon: PaIcons.blanketIcon },
  { key: "sofaIcon", label: "Sofa", icon: PaIcons.sofaIcon },
  { key: "chairIcon", label: "Chair", icon: PaIcons.chairIcon },
  { key: "lockerIcon", label: "Locker", icon: PaIcons.lockerIcon },
  { key: "telephoneIcon", label: "Telephone", icon: PaIcons.telephoneIcon },
  { key: "wifiIcon", label: "Wi-Fi", icon: PaIcons.wifiIcon },
  { key: "dustbinIcon", label: "Dustbin", icon: PaIcons.dustbinIcon },
  { key: "oxygenIcon", label: "Oxygen", icon: PaIcons.oxygenIcon },
];


const HospitalAmenities = () => {
  const [amenities, setAmenities] = useState<HospitalAmenity[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HospitalAmenity | null>(null);
  const [formData, setFormData] = useState<HospitalAmenityPayload>({
    name: "",
    icon: "",
    status: "1",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAmenities();
  }, []);

  const loadAmenities = async () => {
    try {
      setLoading(true);
      const res = await fetchHospitalAmenities();
      setAmenities(res.data || []);
    } catch (error) {
      toast({ title: "Failed to load amenities", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = amenities.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ name: "", icon: "", status: "1" });
    setIsDialogOpen(true);
  };

  const handleEdit = (item: HospitalAmenity) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      icon: item.icon,
      status: item.status === "active" ? "1" : "0",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won’t be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const res = await deleteHospitalAmenity(id);
        if (res.success) {
          await Swal.fire({
            title: "Deleted!",
            text: "Amenity deleted successfully.",
            icon: "success",
            timer: 2000,
          });
          loadAmenities();
        } else {
          toast({ title: "Delete failed", variant: "destructive" });
        }
      } catch {
        toast({ title: "Error deleting amenity", variant: "destructive" });
      }
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.icon) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }

    try {
      if (editingItem) {
        const res = await updateHospitalAmenity(editingItem.id, formData);
        if (res.success) {
          toast({ title: "Amenity updated successfully" });
          loadAmenities();
        } else toast({ title: "Update failed", variant: "destructive" });
      } else {
        const res = await addHospitalAmenity(formData);
        if (res.success) {
          toast({ title: "Amenity added successfully" });
          loadAmenities();
        } else toast({ title: "Add failed", variant: "destructive" });
      }
      setIsDialogOpen(false);
    } catch {
      toast({ title: "Error saving amenity", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-1">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground pb-4">
            Manage Hospital Amenities
          </h1>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Amenity
          </Button>
        </div>

        <div className="flex gap-4 pt-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search amenities..."
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
              <SelectItem value="all">All</SelectItem>
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
                <TableHead>Icon</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => {
                  const iconSrc = PaIcons[item.icon]; 
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <img
                          src={iconSrc}
                          alt={item.name}
                          className="w-6 h-6 mb-1 object-contain"
                        />
                      </TableCell>
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
                          {/* Uncomment for delete */}
                          {/* <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button> */}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6">
                    No amenities found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="w-full max-w-2xl mx-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit Amenity" : "Add New Amenity"}</DialogTitle>
              <DialogDescription>
                {editingItem
                  ? "Update the amenity details below."
                  : "Fill in the details to create a new hospital amenity."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Air Conditioner (AC)"
                />
              </div>

              {/* Icon Selector */}
              <div>
                <Label>Choose Icon</Label>
                <div className="grid grid-cols-6 gap-3 mt-2 max-h-[250px] overflow-y-auto p-2 border rounded-lg">
                  {amenityIconOptions.map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      className={`flex flex-col items-center text-xs p-2 border rounded-lg transition ${
                        formData.icon === opt.key
                          ? "border-primary bg-muted"
                          : "border-transparent hover:bg-accent"
                      }`}
                      onClick={() => setFormData({ ...formData, icon: opt.key })}
                    >
                      <img
                        src={opt.icon} 
                        alt={opt.label}
                        className="w-6 h-6 mb-1 object-contain"
                      />
                      <span className="truncate w-20 text-center">{opt.label}</span>
                    </button>
                  ))}


                </div>
              </div>

              {/* Status */}
              <div>
                <Label>Status</Label>
                <Select
                  value={formData.status === "1" ? "active" : "inactive"}
                  onValueChange={(val: "active" | "inactive") =>
                    setFormData({ ...formData, status: val === "active" ? "1" : "0" })
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

export default HospitalAmenities;
