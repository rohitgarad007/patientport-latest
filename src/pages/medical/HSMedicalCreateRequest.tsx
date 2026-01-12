import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ArrowLeft, Package } from "lucide-react";
import { toast } from "sonner";
import {
  fetchMedicalStores,
  type MedicalStore,
  fetchMedicalInventory,
  type MedicalInventoryItem,
  createMedicalRequest,
} from "@/services/HSHospitalMedicalService";

// Inventory list now comes from API, not a local constant

type Priority = "low" | "medium" | "high";

export default function HSMedicalCreateRequest() {
  const navigate = useNavigate();

  // form state
  const [stores, setStores] = useState<MedicalStore[]>([]);
  const [loadingStores, setLoadingStores] = useState<boolean>(false);
  const [storeId, setStoreId] = useState<string>("");
  const [requestedBy, setRequestedBy] = useState<string>("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");
  const [selectedItems, setSelectedItems] = useState<Array<{ inventory: any; quantity: number }>>([]);
  const [inventory, setInventory] = useState<MedicalInventoryItem[]>([]);
  const [loadingInventory, setLoadingInventory] = useState<boolean>(false);

  // load medical stores
  useEffect(() => {
    const loadStores = async () => {
      try {
        setLoadingStores(true);
        const data = await fetchMedicalStores(1, 100, "");
        setStores(data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load medical stores");
      } finally {
        setLoadingStores(false);
      }
    };
    loadStores();
  }, []);

  // Load inventory dynamically with debounce on searchTerm
  useEffect(() => {
    let active = true;
    const t = setTimeout(async () => {
      try {
        setLoadingInventory(true);
        const list = await fetchMedicalInventory(searchTerm, { onlyAvailable: true, limit: 50 });
        if (active) setInventory(list);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load inventory");
      } finally {
        if (active) setLoadingInventory(false);
      }
    }, 300);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [searchTerm]);

  const handleAddItem = (inventory: any) => {
    const exists = selectedItems.find((i) => i.inventory.id === inventory.id);
    if (!exists) {
      setSelectedItems([...selectedItems, { inventory, quantity: 1 }]);
      toast.success(`${inventory.name} added`);
    } else {
      toast.info("Item already added");
    }
  };

  const handleQuantityChange = (inventoryId: string, quantity: number) => {
    setSelectedItems((prev) =>
      prev.map((i) => (i.inventory.id === inventoryId ? { ...i, quantity: Math.max(1, quantity) } : i))
    );
  };

  const handleRemoveItem = (inventoryId: string) => {
    setSelectedItems((prev) => prev.filter((i) => i.inventory.id !== inventoryId));
  };

  const validate = () => {
    if (!storeId) {
      toast.error("Please select a medical store");
      return false;
    }
    if (!requestedBy.trim()) {
      toast.error("Please enter Requested By person");
      return false;
    }
    if (selectedItems.length === 0) {
      toast.error("Please add at least one inventory item");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      const payload = {
        store_id: String(storeId).trim() ? Number(storeId) : 0,
        requested_by: requestedBy.trim(),
        priority: priority === "high" ? "High" : priority === "low" ? "Low" : "Normal",
        remarks: remarks.trim(),
        items: selectedItems.map((i) => ({
          product_id: Number(i.inventory.id),
          requested_qty: Number(i.quantity),
          unit: i.inventory.unit ?? "",
        })),
      };
      const res = await createMedicalRequest(payload);
      if (res.success) {
        toast.success("Inventory request created");
        navigate("/hs-medical-inventory-requests");
      } else {
        toast.error(res.message || "Failed to create request");
      }
    } catch (err) {
      console.error(err);
      const msg = (err as any)?.message ?? "Failed to create request";
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-1">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate("/hs-medical-inventory-requests")}> 
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Requests
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Create New Inventory Request</h1>
          </div>
        </div>

        <Card className="p-6 space-y-6">
          {/* Store */}
          <div>
            <Label>Select Medical Store</Label>
            <Select value={storeId} onValueChange={setStoreId}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder={loadingStores ? "Loading stores..." : "Choose a store"} />
              </SelectTrigger>
              <SelectContent>
                {stores.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Requested By */}
          <div>
            <Label>Requested By Person</Label>
            <Input
              className="mt-2"
              placeholder="Enter requester name"
              value={requestedBy}
              onChange={(e) => setRequestedBy(e.target.value)}
            />
          </div>

          {/* Priority */}
          <div>
            <Label>Priority</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          </div>

          {/* Search Inventory */}
          <div>
            <Label>Search Inventory</Label>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Available Inventory */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center"><Package className="w-4 h-4 mr-2" />Available Inventory</h3>
            <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto border rounded-lg p-3">
              {loadingInventory && (
                <div className="text-sm text-muted-foreground">Loading inventory...</div>
              )}
              {!loadingInventory && inventory.length === 0 && (
                <div className="text-sm text-muted-foreground">No items found</div>
              )}
              {!loadingInventory && inventory.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">Code: {item.code} • Available: {item.available} {item.unit}</p>
                  </div>
                  <Button size="sm" onClick={() => handleAddItem(item)}>Add</Button>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Items */}
          {selectedItems.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Selected Items ({selectedItems.length})</h3>
              <div className="space-y-2">
                {selectedItems.map((item) => (
                  <div key={item.inventory.id} className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.inventory.name}</p>
                      <p className="text-sm text-gray-600">Code: {item.inventory.code}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.inventory.id, parseInt(e.target.value))}
                        className="w-20"
                      />
                      <span className="text-sm text-gray-600">{item.inventory.unit}</span>
                    </div>
                    <Button size="sm" variant="destructive" onClick={() => handleRemoveItem(item.inventory.id)}>
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Remarks */}
          <div>
            <Label>Remarks (Optional)</Label>
            <Textarea
              placeholder="Add any special instructions or notes..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="mt-2"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => navigate("/hs-medical-inventory-requests")}>Cancel</Button>
            <Button onClick={handleSubmit} className="bg-gradient-to-r from-blue-600 to-purple-600">Submit Request</Button>
          </div>


        </Card>
      </main>
    </div>
  );
}