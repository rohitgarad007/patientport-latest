import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Plus, Pencil, Trash2, Package, 
  FileText, 
  DollarSign, 
  Warehouse, 
  ShieldCheck,
  Upload,
  Save,
  X
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
import SearchableSelect from "@/components/ui/searchable-select";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import Swal from "sweetalert2";
import type { Category, Subcategory, UnitOfMeasure, Tax } from "@/types/master";
import {
  fetchInventoryCategories,
  fetchInventorySubcategories,
  fetchInventoryUnitsOfMeasure,
  fetchInventoryTaxes,
  addInventoryProduct,
  type InventoryProductInput,
} from "@/services/HSHospitalInventoryService";

  

export default function HospitalInventoryAddMedicine() {
  const [isActive] = useState(true);
  const [productImage, setProductImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Master data
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [units, setUnits] = useState<UnitOfMeasure[]>([]);
  const [taxes, setTaxes] = useState<Tax[]>([]);

  // Form state
  const [form, setForm] = useState({
    productName: "",
    productCode: "",
    categoryId: "",
    subcategoryId: "",
    modelNumber: "",
    unitId: "",
    drugLicense: "",
    barcode: "",
    purchasePrice: "",
    sellingPrice: "",
    mrpPrice : "",
    taxId: "",
    minStock: "",
    maxStock: "",
    description: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadMasters = async () => {
      try {
        const [cats, subs, uoms, tx] = await Promise.all([
          fetchInventoryCategories(),
          fetchInventorySubcategories(),
          fetchInventoryUnitsOfMeasure(),
          fetchInventoryTaxes(),
        ]);
        setCategories(cats);
        setSubcategories(subs);
        setUnits(uoms);
        setTaxes(tx);
      } catch (err) {
        console.error(err);
        toast.success("Load Error", { description: "Failed to load master data for the form." });
      }
    };
    loadMasters();
  }, []);

  const filteredSubcategories = useMemo(() => {
    if (!form.categoryId) return subcategories;
    return subcategories.filter((s) => s.categoryId === form.categoryId);
  }, [form.categoryId, subcategories]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setProductImage(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  };

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const clearImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setProductImage(null);
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.productName.trim()) next.productName = "Product Name is required";
    if (!form.productCode.trim()) next.productCode = "Product Code / SKU is required";
    if (!form.categoryId) next.categoryId = "Category is required";
    if (!form.unitId) next.unitId = "Unit of Measure is required";
    if (!form.purchasePrice) next.purchasePrice = "Purchase Price is required";
    if (!form.sellingPrice) next.sellingPrice = "Selling Price is required";
    if (!form.mrpPrice) next.mrpPrice = "mrp_price Price is required";
    if (!form.minStock) next.minStock = "Minimum Stock Level is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const resetForm = () => {
    setForm({
      productName: "",
      productCode: "",
      categoryId: "",
      subcategoryId: "",
      modelNumber: "",
      unitId: "",
      drugLicense: "",
      barcode: "",
      purchasePrice: "",
      sellingPrice: "",
      mrpPrice: "",
      taxId: "",
      minStock: "",
      maxStock: "",
      description: "",
    });
    setErrors({});
    clearImage();
  };

  const submitProduct = async () => {
    const payload: InventoryProductInput = {
      name: form.productName.trim(),
      sku: form.productCode.trim(),
      categoryId: form.categoryId,
      subcategoryId: form.subcategoryId || undefined,
      modelNumber: form.modelNumber || undefined,
      uomId: form.unitId,
      licenseNo: form.drugLicense || undefined,
      barcode: form.barcode || undefined,
      purchasePrice: Number(form.purchasePrice || 0),
      sellingPrice: Number(form.sellingPrice || 0),
      mrpPrice: Number(form.mrpPrice || 0),
      taxId: form.taxId || undefined,
      minStock: Number(form.minStock || 0),
      maxStock: form.maxStock ? Number(form.maxStock) : undefined,
      description: form.description || undefined,
      status: "Active",
      imageFile: productImage || undefined,
    };
    await addInventoryProduct(payload);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await submitProduct();
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Product added successfully",
        timer: 4000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      resetForm();
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Unable to add product",
        timer: 4000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    }
  };

  const handleSaveAndNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await submitProduct();
      Swal.fire({
        icon: "success",
        title: "Saved",
        text: "Product saved! Ready to add another",
        timer: 4000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      resetForm();
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Unable to save product",
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
            Add Medical Inforamtion
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
           
            
            {/* Product Information */}
            <Card>
              
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="productName">Product Name *</Label>
                    <Input
                      id="productName"
                      placeholder="e.g., Paracetamol 500mg"
                      value={form.productName}
                      onChange={(e) => setForm({ ...form, productName: e.target.value })}
                    />
                    {errors.productName && (
                      <p className="text-red-500 text-sm">{errors.productName}</p>
                    )}
                  </div>
                  
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="productCode">Product Code / SKU *</Label>
                    <Input
                      id="productCode"
                      placeholder="e.g., MED-001"
                      value={form.productCode}
                      onChange={(e) => setForm({ ...form, productCode: e.target.value })}
                    />
                    {errors.productCode && (
                      <p className="text-red-500 text-sm">{errors.productCode}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <SearchableSelect
                      id="category"
                      value={form.categoryId}
                      onChange={(val) => setForm({ ...form, categoryId: val, subcategoryId: "" })}
                      options={categories.map((cat) => ({ value: cat.id, label: cat.name }))}
                      placeholder="Select category"
                    />
                    {errors.categoryId && (
                      <p className="text-red-500 text-sm">{errors.categoryId}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subcategory">Subcategory</Label>
                    <SearchableSelect
                      id="subcategory"
                      value={form.subcategoryId}
                      onChange={(val) => setForm({ ...form, subcategoryId: val })}
                      options={filteredSubcategories.map((sub) => ({ value: sub.id, label: sub.name }))}
                      placeholder="Select subcategory"
                    />
                  </div>
                </div>

                

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="modelNumber">Model Number</Label>
                    <Input
                      id="modelNumber"
                      placeholder="e.g., PM-500"
                      value={form.modelNumber}
                      onChange={(e) => setForm({ ...form, modelNumber: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit of Measure *</Label>
                    <SearchableSelect
                      id="unit"
                      value={form.unitId}
                      onChange={(val) => setForm({ ...form, unitId: val })}
                      options={units.map((unit) => ({ value: unit.id, label: unit.symbol ? `${unit.name} (${unit.symbol})` : unit.name }))}
                      placeholder="Select unit"
                    />
                    {errors.unitId && (
                      <p className="text-red-500 text-sm">{errors.unitId}</p>
                    )}
                  </div>

                 
                  <div className="space-y-2">
                    <Label htmlFor="drugLicense">Drug License Number</Label>
                    <Input
                      id="drugLicense"
                      placeholder="e.g., DL-12345"
                      value={form.drugLicense}
                      onChange={(e) => setForm({ ...form, drugLicense: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="barcode">Barcode / QR Code</Label>
                    <Input
                      id="barcode"
                      placeholder="e.g., 8901234567890"
                      value={form.barcode}
                      onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                    />
                  </div>
                  

                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="purchasePrice">Purchase Price *</Label>
                    <Input
                      id="purchasePrice"
                      type="number"
                      placeholder="0.00"
                      value={form.purchasePrice}
                      onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })}
                    />
                    {errors.purchasePrice && (
                      <p className="text-red-500 text-sm">{errors.purchasePrice}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sellingPrice">Selling Price </Label>
                    <Input
                      id="sellingPrice"
                      type="number"
                      placeholder="0.00"
                      value={form.sellingPrice}
                      onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })}
                    />
                    {errors.sellingPrice && (
                      <p className="text-red-500 text-sm">{errors.sellingPrice}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sellingPrice">mrp_price Price </Label>
                    <Input
                      id="sellingPrice"
                      type="number"
                      placeholder="0.00"
                      value={form.mrpPrice}
                      onChange={(e) => setForm({ ...form, mrpPrice: e.target.value })}
                    />
                    {errors.mrpPrice && (
                      <p className="text-red-500 text-sm">{errors.mrpPrice}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tax">Tax (GST / VAT) %</Label>
                    <SearchableSelect
                      id="tax"
                      value={form.taxId}
                      onChange={(val) => setForm({ ...form, taxId: val })}
                      options={taxes.map((t) => ({ value: t.id, label: `${t.name} (${t.percentage}%)` }))}
                      placeholder="Select tax"
                    />
                  </div>

                   
                  <div className="space-y-2">
                    <Label htmlFor="minStock">Minimum Stock Level *</Label>
                    <Input
                      id="minStock"
                      type="number"
                      placeholder="0"
                      value={form.minStock}
                      onChange={(e) => setForm({ ...form, minStock: e.target.value })}
                    />
                    {errors.minStock && (
                      <p className="text-red-500 text-sm">{errors.minStock}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxStock">Maximum Stock Capacity</Label>
                    <Input
                      id="maxStock"
                      type="number"
                      placeholder="0"
                      value={form.maxStock}
                      onChange={(e) => setForm({ ...form, maxStock: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="productImage">Product Image</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        id="productImage"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        ref={fileInputRef}
                      />
                      {imagePreview && (
                        <div className="flex items-center gap-2">
                          <img
                            src={imagePreview}
                            alt="Product Preview"
                            className="w-20 h-20 rounded border object-cover"
                          />
                          <Button type="button" variant="ghost" size="sm" onClick={clearImage}>
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  

                </div>


                <div className="space-y-2">
                  <Label htmlFor="description">Description / Specifications</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter detailed product description and specifications..."
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Button type="submit" className="w-full" size="lg">
                    <Save className="mr-2 h-4 w-4" />
                    Submit Product
                  </Button>
                  <Button type="button" variant="ghost" className="w-full" onClick={resetForm}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </div>

              </CardContent>
            </Card>

            

            
          </div>
        </form>





      </main>
    </div>

  );
}