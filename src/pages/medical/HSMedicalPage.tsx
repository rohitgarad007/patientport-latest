import { useEffect, useMemo, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { StatCard } from "@/components/dashboard/StatCard";
import { PaIcons } from "@/components/icons/PaIcons";
import { toast } from "sonner";
import { Plus, Search, MoreHorizontal, Edit, Trash2, Shield } from "lucide-react";
import {
  fetchMedicalStores,
  addMedicalStore,
  updateMedicalStore,
  deleteMedicalStore,
  changeMedicalStoreStatus,
  type MedicalStore as ApiMedicalStore,
} from "@/services/HSHospitalMedicalService";

type StoreStatus = "active" | "inactive";

interface MedicalStore {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  licenseNo?: string;
  address?: string;
  status: StoreStatus;
}

// CaptchaCanvas copied from doctor/patient forms for consistency
const CaptchaCanvas: React.FC<{ code: string; width?: number; height?: number }> = ({
  code,
  width = 160,
  height = 50,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Background
    const g = ctx.createLinearGradient(0, 0, width, height);
    g.addColorStop(0, "#f7fafc");
    g.addColorStop(1, "#eef2f7");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);

    // Noise dots
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(
        Math.random() * 255
      )}, ${Math.floor(Math.random() * 255)}, 0.15)`;
      ctx.beginPath();
      const x = Math.random() * width;
      const y = Math.random() * height;
      const r = Math.random() * 2.5;
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Random lines
    for (let i = 0; i < 4; i++) {
      ctx.strokeStyle = `rgba(${Math.floor(Math.random() * 120)}, ${Math.floor(
        Math.random() * 120
      )}, ${Math.floor(Math.random() * 120)}, 0.3)`;
      ctx.lineWidth = 1 + Math.random() * 1.5;
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.lineTo(Math.random() * width, Math.random() * height);
      ctx.stroke();
    }

    // Characters
    for (let i = 0; i < code.length; i++) {
      const ch = code.charAt(i);
      const fontSize = 22 + Math.random() * 6;
      const angle = (Math.random() - 0.5) * 0.6;
      ctx.save();
      ctx.translate(20 + i * (width / (code.length + 1)), height / 2);
      ctx.rotate(angle);
      ctx.font = `${fontSize}px Arial`;
      ctx.fillStyle = `rgba(${50 + Math.floor(Math.random() * 150)}, ${50 + Math.floor(
        Math.random() * 150
      )}, ${50 + Math.floor(Math.random() * 150)}, 0.8)`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(ch, 0, 0);
      ctx.restore();
    }
  }, [code, width, height]);

  return <canvas ref={canvasRef} width={width} height={height} className="rounded border" />;
};

export default function HSMedicalPage() {
  const [stores, setStores] = useState<MedicalStore[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<MedicalStore | null>(null);
  const [formData, setFormData] = useState<MedicalStore & { captcha: string }>({
    id: "",
    name: "",
    email: "",
    phone: "",
    licenseNo: "",
    address: "",
    status: "active",
    captcha: "",
  });
  const [captchaCode, setCaptchaCode] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const generateCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
  };

  useEffect(() => {
    if (editingStore) {
      setFormData({ ...editingStore, captcha: "" });
    } else {
      setFormData({ id: "", name: "", email: "", phone: "", licenseNo: "", address: "", status: "active", captcha: "" });
    }
  }, [editingStore, isDialogOpen]);

  useEffect(() => {
    if (isDialogOpen) generateCaptcha();
  }, [isDialogOpen]);

  const loadStores = async () => {
    try {
      const list = await fetchMedicalStores(1, 50, "");
      // Ensure shape matches local type
      setStores(list as ApiMedicalStore[] as MedicalStore[]);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load medical stores", { description: String(err?.message || err) });
    }
  };

  useEffect(() => {
    loadStores();
  }, []);

  const filteredStores = useMemo(() => {
    if (!searchTerm) return stores;
    const term = searchTerm.toLowerCase();
    return stores.filter((s) =>
      [s.name, s.email, s.phone, s.licenseNo, s.address]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term))
    );
  }, [stores, searchTerm]);

  const totalStores = stores.length;
  const activeStores = stores.filter((s) => s.status === "active").length;

  const resetDialog = () => {
    setEditingStore(null);
    setFormData({ id: "", name: "", email: "", phone: "", licenseNo: "", address: "", status: "active", captcha: "" });
    setIsDialogOpen(false);
    setFormErrors({});
  };
  const validateField = (name: string, value: any) => {
    switch (name) {
      case "name":
        if (!value || String(value).trim().length < 2) return "Store name must be at least 2 characters";
        return "";
      case "licenseNo":
        if (!value || String(value).trim().length < 3) return "License number is required";
        return "";
      case "phone":
        if (value && !/^\d{10}$/.test(String(value))) return "Phone must be 10 digits";
        return "";
      case "email":
        if (value && !/^\S+@\S+\.\S+$/.test(String(value))) return "Invalid email format";
        return "";
      case "captcha":
        if (!value) return "Enter CAPTCHA";
        if (String(value).toUpperCase() !== String(captchaCode).toUpperCase()) return "CAPTCHA does not match";
        return "";
      default:
        return "";
    }
  };

  const requiredFields = ["name", "licenseNo", "captcha"] as const;
  const isFormValid = requiredFields.every((f) => !validateField(f, (formData as any)[f]));

  const handleSaveStore = async () => {
    // Field-level validation
    const newErrors: Record<string, string> = {};
    ["name", "licenseNo", "email", "phone", "captcha"].forEach((f) => {
      const msg = validateField(f, (formData as any)[f]);
      if (msg) newErrors[f] = msg;
    });
    setFormErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const payload = {
        name: formData.name,
        email: formData.email ?? "",
        phone: formData.phone ?? "",
        licenseNo: formData.licenseNo ?? "",
        address: formData.address ?? "",
        status: formData.status,
      };
      if (editingStore) {
        await updateMedicalStore(formData.id, payload);
        toast.success("Medical store updated", { description: `${formData.name} has been updated.` });
      } else {
        await addMedicalStore(payload);
        toast.success("Medical store added", { description: `${formData.name} has been created.` });
      }
      resetDialog();
      await loadStores();
    } catch (err: any) {
      console.error(err);
      toast.error("Action failed", { description: String(err?.message || err) });
    }
  };

  const handleDeleteStore = async (store: MedicalStore) => {
    if (!confirm(`Delete ${store.name}?`)) return;
    try {
      await deleteMedicalStore(store.id);
      toast.success("Medical store deleted", { description: `${store.name} has been removed.` });
      await loadStores();
    } catch (err: any) {
      console.error(err);
      toast.error("Delete failed", { description: String(err?.message || err) });
    }
  };

  const handleToggleStatus = async (store: MedicalStore) => {
    const next = store.status === "active" ? "inactive" : "active";
    try {
      await changeMedicalStoreStatus(store.id, next);
      toast.success("Status updated", { description: `${store.name} is now ${next}.` });
      await loadStores();
    } catch (err: any) {
      console.error(err);
      toast.error("Status update failed", { description: String(err?.message || err) });
    }
  };

  return (

    <div className="space-y-6">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-1">

        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Manage Medical Stores</h1>
              <p className="text-muted-foreground">Add, edit, and manage hospital medical stores</p>
            </div>
            <Button
              className="flex items-center gap-2"
              onClick={() => {
                setEditingStore(null);
                setIsDialogOpen(true);
              }}
            >
              <Plus className="w-4 h-4" />
              Add Medical Store
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Total Stores"
              value={totalStores}
              description="Registered medical stores"
              icon={PaIcons.InventoryIcon}
              variant="blue"
            />
            <StatCard
              title="Active Stores"
              value={activeStores}
              description="Currently operational"
              icon={PaIcons.MedicineIcon}
              variant="success"
            />
            <StatCard
              title="Compliance"
              value={`${Math.round((activeStores / Math.max(totalStores, 1)) * 100)}%`}
              description="License validity ratio"
              icon={Shield}
              variant="teal"
            />
          </div>

          {/* Directory */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Medical Store Directory</CardTitle>
                  <CardDescription>Overview of hospital medical stores</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search stores..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-80"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Store</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>License</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStores.map((store) => (
                    <TableRow key={store.id}>
                      <TableCell>
                        <div className="font-medium text-foreground">{store.name}</div>
                        <div className="text-sm text-muted-foreground">{store.email || "—"}</div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-1">
                            <img src={PaIcons.email} alt="Email" className="w-4 h-4" />
                            {store.email || "—"}
                          </div>
                          <div className="flex items-center gap-1">
                            <img src={PaIcons.phone} alt="Phone" className="w-4 h-4" />
                            {store.phone || "—"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{store.licenseNo || "—"}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <img src={PaIcons.location} alt="Location" className="w-4 h-4" />
                          {store.address || "—"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={store.status === "active" ? "default" : "secondary"}>
                          {store.status === "active" ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingStore(store);
                                setIsDialogOpen(true);
                              }}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Store
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(store)}>
                              {store.status === "active" ? "Mark Inactive" : "Mark Active"}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteStore(store)}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredStores.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No medical stores found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Add/Edit Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={(open) => setIsDialogOpen(open)}>
            <DialogContent className="w-full max-w-2xl mx-auto">
              <DialogHeader>
                <DialogTitle className="text-center">{editingStore ? "Edit Medical Store" : "Add New Medical Store"}</DialogTitle>
                <DialogDescription className="text-center">
                  {editingStore ? "Update medical store details" : "Enter medical store details"}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Store Name</Label>
                  <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="CityCare Pharmacy" />
                  {formErrors.name && <p className="text-red-600 text-sm mt-1">{formErrors.name}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="store@hospital.com" />
                    {formErrors.email && <p className="text-red-600 text-sm mt-1">{formErrors.email}</p>}
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="0000000000" />
                    {formErrors.phone && <p className="text-red-600 text-sm mt-1">{formErrors.phone}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="licenseNo">License Number</Label>
                    <Input id="licenseNo" value={formData.licenseNo} onChange={(e) => setFormData({ ...formData, licenseNo: e.target.value })} placeholder="LIC-12345" />
                    {formErrors.licenseNo && <p className="text-red-600 text-sm mt-1">{formErrors.licenseNo}</p>}
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      className="border rounded px-3 py-2 w-full"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as StoreStatus })}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Address / Location</Label>
                  <Input id="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Ground Floor, East Wing" />
                </div>

                {/* CAPTCHA */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  <div className="md:col-span-2 flex items-center gap-2">
                    <CaptchaCanvas code={captchaCode} width={160} height={50} />
                    <Button size="sm" onClick={generateCaptcha}>Refresh</Button>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="captcha">Enter CAPTCHA</Label>
                    <Input id="captcha" value={formData.captcha} onChange={(e) => setFormData({ ...formData, captcha: e.target.value.toUpperCase() })} placeholder="Enter CAPTCHA" className="uppercase" />
                    {formErrors.captcha && <p className="text-red-600 text-sm mt-1">{formErrors.captcha}</p>}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button className="flex-1" onClick={handleSaveStore} disabled={!isFormValid}>
                    {editingStore ? "Update Store" : "Add Store"}
                  </Button>
                  <Button variant="outline" onClick={resetDialog}>Cancel</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
}