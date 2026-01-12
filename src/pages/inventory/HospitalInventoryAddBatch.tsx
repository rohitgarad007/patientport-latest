import { useEffect, useState } from "react";
import { Search, Plus, Pencil, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from '@/components/ui/textarea';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import Swal from "sweetalert2";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { fetchInventoryManufacturers, fetchInventoryProducts, addInventoryBatch } from "@/services/HSHospitalInventoryService";

type Option = { value: string; label: string };


interface BatchEntry {
  id: string;
  batchNumber: string;
  mfgDate: string;
  expiryDate: string;
  quantity: string;
  supplier: string;
  purchaseRate: string;
  mrp: string;
  rackPosition: string;
  notes: string;
}

// Removed static lists; will load dynamically via service

export default function HospitalInventoryAddBatch() {

  const [selectedProduct, setSelectedProduct] = useState('');
  const [batches, setBatches] = useState<BatchEntry[]>([
    {
      id: '1',
      batchNumber: '',
      mfgDate: '',
      expiryDate: '',
      quantity: '',
      supplier: '',
      purchaseRate: '',
      mrp: '',
      rackPosition: '',
      notes: '',
    },
  ]);

  // Dynamic options
  const [productOptions, setProductOptions] = useState<Option[]>([]);
  const [supplierOptions, setSupplierOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState({ products: false, suppliers: false });
  const [errors, setErrors] = useState<string | null>(null);

  useEffect(() => {
    // Load products and suppliers on mount
    const loadData = async () => {
      setLoading({ products: true, suppliers: true });
      setErrors(null);
      try {
        // Products
        try {
          const products = await fetchInventoryProducts();
          setProductOptions(
            products.map((p) => ({
              value: p.id,
              label: p.sku ? `${p.sku} - ${p.name}` : p.name,
            }))
          );
        } catch (e: any) {
          toast({
            title: "Product list",
            description: "Unable to load products from API.",
            variant: "destructive",
          });
        } finally {
          setLoading((prev) => ({ ...prev, products: false }));
        }

        // Suppliers (Manufacturers)
        try {
          const manufacturers = await fetchInventoryManufacturers();
          setSupplierOptions(
            manufacturers.map((m) => ({ value: m.id, label: m.name }))
          );
        } catch (e: any) {
          toast({
            title: "Supplier list",
            description: "Unable to load suppliers from API.",
            variant: "destructive",
          });
        } finally {
          setLoading((prev) => ({ ...prev, suppliers: false }));
        }
      } catch (err: any) {
        setErrors("Failed to load dropdown data");
      }
    };
    loadData();
  }, []);

  const addBatch = () => {
    const newBatch: BatchEntry = {
      id: Date.now().toString(),
      batchNumber: '',
      mfgDate: '',
      expiryDate: '',
      quantity: '',
      supplier: '',
      purchaseRate: '',
      mrp: '',
      rackPosition: '',
      notes: '',
    };
    setBatches([...batches, newBatch]);
  };

  const removeBatch = (id: string) => {
    if (batches.length > 1) {
      setBatches(batches.filter(batch => batch.id !== id));
      toast({
        title: "Batch Removed",
        description: "Batch entry has been removed from the form.",
      });
    }
  };

  const updateBatch = (id: string, field: keyof BatchEntry, value: string) => {
    setBatches(batches.map(batch => 
      batch.id === id ? { ...batch, [field]: value } : batch
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProduct) {
      toast({
        title: "Error",
        description: "Please select a product first.",
        variant: "destructive",
      });
      return;
    }

    const validBatches = batches.filter(batch => 
      batch.batchNumber && batch.mfgDate && batch.expiryDate && batch.quantity
    );

    if (validBatches.length === 0) {
      toast({
        title: "Error",
        description: "Please fill in at least one complete batch entry.",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload = {
        productId: selectedProduct,
        batches: validBatches.map((b) => ({
          batchNumber: b.batchNumber.trim(),
          mfgDate: b.mfgDate,
          expiryDate: b.expiryDate,
          quantity: Number(b.quantity || 0),
          supplierId: b.supplier || undefined,
          purchaseRate: b.purchaseRate ? Number(b.purchaseRate) : undefined,
          mrp: b.mrp ? Number(b.mrp) : undefined,
          rackPosition: b.rackPosition || undefined,
          notes: b.notes || undefined,
        })),
      };
      await addInventoryBatch(payload);
      Swal.fire({
        icon: "success",
        title: "Success",
        text: `${validBatches.length} batch(es) added successfully!`,
        timer: 4000,
        timerProgressBar: true,
        showConfirmButton: false,
      });

      // Reset form
      setSelectedProduct('');
      setBatches([{
        id: '1',
        batchNumber: '',
        mfgDate: '',
        expiryDate: '',
        quantity: '',
        supplier: '',
        purchaseRate: '',
        mrp: '',
        rackPosition: '',
        notes: '',
      }]);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Unable to add batch(es).",
        timer: 4000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    }
  };

  return(
    <div className="space-y-6">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-1">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground pb-4">
            Add Medical Batch
          </h1>
        </div>


        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Select Product
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="product">Product *</Label>
                <SearchableSelect
                  id="product"
                  value={selectedProduct}
                  onChange={setSelectedProduct}
                  options={productOptions}
                  placeholder={loading.products ? "Loading products..." : "Select a product"}
                  disabled={loading.products}
                />
              </div>
            </CardContent>
          </Card>

          {/* Batch Entries */}
          {batches.map((batch, index) => (
            <Card key={batch.id} className="relative">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Batch #{index + 1}</CardTitle>
                {batches.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeBatch(batch.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </CardHeader>
              <CardContent className="">
                {/* Batch Number */}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                  <div className="space-y-2">
                    <Label htmlFor={`batch-number-${batch.id}`}>Batch Number *</Label>
                    <Input
                      id={`batch-number-${batch.id}`}
                      value={batch.batchNumber}
                      onChange={(e) => updateBatch(batch.id, 'batchNumber', e.target.value)}
                      placeholder="BATCH-A001"
                      required
                    />
                  </div>

                  {/* Manufacturing Date */}
                  <div className="space-y-2">
                    <Label htmlFor={`mfg-date-${batch.id}`}>Manufacturing Date *</Label>
                    <Input
                      id={`mfg-date-${batch.id}`}
                      type="date"
                      value={batch.mfgDate}
                      onChange={(e) => updateBatch(batch.id, 'mfgDate', e.target.value)}
                      required
                    />
                  </div>

                  {/* Expiry Date */}
                  <div className="space-y-2">
                    <Label htmlFor={`expiry-date-${batch.id}`}>Expiry Date *</Label>
                    <Input
                      id={`expiry-date-${batch.id}`}
                      type="date"
                      value={batch.expiryDate}
                      onChange={(e) => updateBatch(batch.id, 'expiryDate', e.target.value)}
                      required
                    />
                  </div>

                  {/* Quantity */}
                  <div className="space-y-2">
                    <Label htmlFor={`quantity-${batch.id}`}>Quantity *</Label>
                    <Input
                      id={`quantity-${batch.id}`}
                      type="number"
                      value={batch.quantity}
                      onChange={(e) => updateBatch(batch.id, 'quantity', e.target.value)}
                      placeholder="100"
                      min="1"
                      required
                    />
                  </div>

                  {/* Supplier */}
                  <div className="space-y-2">
                    <Label htmlFor={`supplier-${batch.id}`}>Supplier</Label>
                    <SearchableSelect
                      id={`supplier-${batch.id}`}
                      value={batch.supplier}
                      onChange={(value) => updateBatch(batch.id, 'supplier', value)}
                      options={supplierOptions}
                      placeholder={loading.suppliers ? "Loading suppliers..." : "Select supplier"}
                      disabled={loading.suppliers}
                    />
                  </div>

                  {/* Purchase Rate */}
                  <div className="space-y-2">
                    <Label htmlFor={`purchase-rate-${batch.id}`}>Purchase Rate (₹)</Label>
                    <Input
                      id={`purchase-rate-${batch.id}`}
                      type="number"
                      value={batch.purchaseRate}
                      onChange={(e) => updateBatch(batch.id, 'purchaseRate', e.target.value)}
                      placeholder="10.00"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  {/* MRP */}
                  <div className="space-y-2">
                    <Label htmlFor={`mrp-${batch.id}`}>MRP (₹)</Label>
                    <Input
                      id={`mrp-${batch.id}`}
                      type="number"
                      value={batch.mrp}
                      onChange={(e) => updateBatch(batch.id, 'mrp', e.target.value)}
                      placeholder="15.00"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  {/* Storage Location */}
                  <div className="space-y-2">
                    <Label htmlFor={`location-${batch.id}`}>Rack Position</Label>
                    <Input
                      id={`location-${batch.id}`}
                      value={batch.rackPosition}
                      onChange={(e) => updateBatch(batch.id, 'rackPosition', e.target.value)}
                      placeholder="Enter storage location"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="description">Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Enter detailed product note..."
                      rows={3}
                      value={batch.notes}
                      onChange={(e) => updateBatch(batch.id, 'notes', e.target.value)}
                    />
                  </div>
                </div>

              </CardContent>
            </Card>
          ))}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={addBatch}
              className="flex-1"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Another Batch
            </Button>
            <Button type="submit" className="flex-1">
              Submit All Batches
            </Button>
          </div>
        </form>



      </main>
    </div>
  );
}
