import { useEffect, useState } from "react";
import { Search, Plus, Pencil, Trash2, FolderTree, Folders, Building2, Award, Package, Percent  } from "lucide-react";
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
import {
  fetchInventoryCategories,
  addInventoryCategory,
  updateInventoryCategory,
  deleteInventoryCategory,
  fetchInventorySubcategories,
  addInventorySubcategory,
  updateInventorySubcategory,
  deleteInventorySubcategory,
  fetchInventoryManufacturers,
  addInventoryManufacturer,
  updateInventoryManufacturer,
  deleteInventoryManufacturer,
  fetchInventoryBrands,
  addInventoryBrand,
  updateInventoryBrand,
  deleteInventoryBrand,
  fetchInventoryUnitsOfMeasure,
  addInventoryUnitOfMeasure,
  updateInventoryUnitOfMeasure,
  deleteInventoryUnitOfMeasure,
  fetchInventoryTaxes,
  addInventoryTax,
  updateInventoryTax,
  deleteInventoryTax,
} from "@/services/HSHospitalInventoryService";
import type { Category, Subcategory, Manufacturer, Brand, UnitOfMeasure, Tax } from "@/types/master";


import { MasterCard } from "@/pages/inventory/MasterCard";
import { DataTable } from "@/pages/inventory/DataTable";

import { DeleteConfirmDialog } from "@/pages/inventory/DeleteConfirmDialog";
import { ViewDetailsDialog } from "@/pages/inventory/ViewDetailsDialog";

import { CategoryForm } from "@/components/forms/CategoryForm";
import { SubcategoryForm } from "@/components/forms/SubcategoryForm";
import { ManufacturerForm } from "@/components/forms/ManufacturerForm";
import { BrandForm } from "@/components/forms/BrandForm";
import { UnitOfMeasureForm } from "@/components/forms/UnitOfMeasureForm";
import { TaxForm } from "@/components/forms/TaxForm";


export default function HospitalInventoryMasters() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [unitsOfMeasure, setUnitsOfMeasure] = useState<UnitOfMeasure[]>([]);
  const [taxes, setTaxes] = useState<Tax[]>([]);

  // Search state
  const [categorySearch, setCategorySearch] = useState("");
  const [subcategorySearch, setSubcategorySearch] = useState("");
  const [manufacturerSearch, setManufacturerSearch] = useState("");
  const [brandSearch, setBrandSearch] = useState("");
  const [uomSearch, setUomSearch] = useState("");
  const [taxSearch, setTaxSearch] = useState("");

  // Filter state for Subcategory and Brand
  const [subcategoryCategoryFilter, setSubcategoryCategoryFilter] = useState<string | undefined>(undefined);
  const [brandManufacturerFilter, setBrandManufacturerFilter] = useState<string | undefined>(undefined);

  // Form state
  const [categoryForm, setCategoryForm] = useState<{ open: boolean; mode: "add" | "edit"; data?: Category }>({ open: false, mode: "add" });
  const [subcategoryForm, setSubcategoryForm] = useState<{ open: boolean; mode: "add" | "edit"; data?: Subcategory }>({ open: false, mode: "add" });
  const [manufacturerForm, setManufacturerForm] = useState<{ open: boolean; mode: "add" | "edit"; data?: Manufacturer }>({ open: false, mode: "add" });
  const [brandForm, setBrandForm] = useState<{ open: boolean; mode: "add" | "edit"; data?: Brand }>({ open: false, mode: "add" });
  const [uomForm, setUomForm] = useState<{ open: boolean; mode: "add" | "edit"; data?: UnitOfMeasure }>({ open: false, mode: "add" });
  const [taxForm, setTaxForm] = useState<{ open: boolean; mode: "add" | "edit"; data?: Tax }>({ open: false, mode: "add" });

  // View state
  const [viewDialog, setViewDialog] = useState<{ open: boolean; data: any; type: string }>({ open: false, data: null, type: "" });

  // Delete state
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; item: any; type: string; onConfirm: () => void }>({
    open: false,
    item: null,
    type: "",
    onConfirm: () => {},
  });

  // Filter function
  const filterData = (data: any[], searchQuery: string) => {
    if (!searchQuery) return data;
    return data.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  };

  const filterSubcategories = (
    data: Subcategory[],
    searchQuery: string,
    categoryId?: string
  ) => {
    let filtered = data;
    if (categoryId) {
      filtered = filtered.filter((item) => item.categoryId === categoryId);
    }
    return filterData(filtered, searchQuery);
  };

  const filterBrandsByManufacturer = (
    data: Brand[],
    searchQuery: string,
    manufacturerId?: string
  ) => {
    let filtered = data;
    if (manufacturerId) {
      filtered = filtered.filter((item) => item.manufacturerId === manufacturerId);
    }
    return filterData(filtered, searchQuery);
  };

  // Generate ID
  const generateId = (prefix: string) => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Initial load
  useEffect(() => {
    const loadAll = async () => {
      try {
        /*const [catRes, mfrRes, uomRes, taxRes] = await Promise.all([
          fetchInventoryCategories(),
          fetchInventoryManufacturers(),
          fetchInventoryUnitsOfMeasure(),
          fetchInventoryTaxes(),
        ]);*/

        const [catRes, mfrRes, uomRes, taxRes] = await Promise.all([
          fetchInventoryCategories(),
          fetchInventoryManufacturers(),
          fetchInventoryUnitsOfMeasure(),
          fetchInventoryTaxes(),
        ]);
        setCategories(catRes);

        setManufacturers(mfrRes);
        setUnitsOfMeasure(uomRes);
        setTaxes(taxRes);

        const subRes = await fetchInventorySubcategories();
        setSubcategories(subRes);

        const brandRes = await fetchInventoryBrands();
        setBrands(brandRes);
      } catch (err) {
        console.error("Failed to load inventory masters", err);
        toast.success("Load Error", { description: "Failed to load inventory masters" });
      }
    };
    loadAll();
  }, []);

  // Category handlers
  const handleAddCategory = async (data: Omit<Category, "id" | "createdAt">) => {
    try {
      await addInventoryCategory(data);
      const list = await fetchInventoryCategories();
      setCategories(list);
      setCategoryForm((prev) => ({ ...prev, open: false }));
      toast.success("Category Added", { description: `${data.name} has been successfully added` });
    } catch (err) {
      console.error(err);
      toast.success("Add Error", { description: "Unable to add category" });
    }
  };

  const handleEditCategory = async (data: Omit<Category, "id" | "createdAt">) => {
    if (!categoryForm.data) return;
    try {
      await updateInventoryCategory(categoryForm.data.id, data);
      const list = await fetchInventoryCategories();
      setCategories(list);
      setCategoryForm((prev) => ({ ...prev, open: false, data: undefined }));
      toast.success("Category Updated", { description: `${data.name} has been successfully updated` });
    } catch (err) {
      console.error(err);
      toast.success("Update Error", { description: "Unable to update category" });
    }
  };

  const handleDeleteCategory = (item: Category) => {
    setDeleteDialog({
      open: true,
      item,
      type: "Category",
      onConfirm: async () => {
        try {
          await deleteInventoryCategory(item.id);
          const list = await fetchInventoryCategories();
          setCategories(list);
          toast.success("Category Deleted", { description: `${item.name} has been successfully deleted` });
        } catch (err) {
          console.error(err);
          toast.success("Delete Error", { description: "Unable to delete category" });
        }
      },
    });
  };

  // Subcategory handlers
  const handleAddSubcategory = async (data: Omit<Subcategory, "id" | "createdAt" | "categoryName">) => {
    try {
      await addInventorySubcategory(data);
      const list = await fetchInventorySubcategories();
      setSubcategories(list);
      setSubcategoryForm((prev) => ({ ...prev, open: false }));
      toast.success("Subcategory Added", { description: `${data.name} has been successfully added` });
    } catch (err) {
      console.error(err);
      toast.success("Add Error", { description: "Unable to add subcategory" });
    }
  };

  const handleEditSubcategory = async (data: Omit<Subcategory, "id" | "createdAt" | "categoryName">) => {
    if (!subcategoryForm.data) return;
    try {
      await updateInventorySubcategory(subcategoryForm.data.id, data);
      const list = await fetchInventorySubcategories();
      setSubcategories(list);
      setSubcategoryForm((prev) => ({ ...prev, open: false, data: undefined }));
      toast.success("Subcategory Updated", { description: `${data.name} has been successfully updated` });
    } catch (err) {
      console.error(err);
      toast.success("Update Error", { description: "Unable to update subcategory" });
    }
  };

  const handleDeleteSubcategory = (item: Subcategory) => {
    setDeleteDialog({
      open: true,
      item,
      type: "Subcategory",
      onConfirm: async () => {
        try {
          await deleteInventorySubcategory(item.id);
          const list = await fetchInventorySubcategories();
          setSubcategories(list);
          toast.success("Subcategory Deleted", { description: `${item.name} has been successfully deleted` });
        } catch (err) {
          console.error(err);
          toast.success("Delete Error", { description: "Unable to delete subcategory" });
        }
      },
    });
  };

  // Manufacturer handlers
  const handleAddManufacturer = async (data: Omit<Manufacturer, "id" | "createdAt">) => {
    try {
      await addInventoryManufacturer(data);
      const list = await fetchInventoryManufacturers();
      setManufacturers(list);
      setManufacturerForm((prev) => ({ ...prev, open: false }));
      toast.success("Manufacturer Added", { description: `${data.name} has been successfully added` });
    } catch (err) {
      console.error(err);
      toast.success("Add Error", { description: "Unable to add manufacturer" });
    }
  };

  const handleEditManufacturer = async (data: Omit<Manufacturer, "id" | "createdAt">) => {
    if (!manufacturerForm.data) return;
    try {
      await updateInventoryManufacturer(manufacturerForm.data.id, data);
      const list = await fetchInventoryManufacturers();
      setManufacturers(list);
      setManufacturerForm((prev) => ({ ...prev, open: false, data: undefined }));
      toast.success("Manufacturer Updated", { description: `${data.name} has been successfully updated` });
    } catch (err) {
      console.error(err);
      toast.success("Update Error", { description: "Unable to update manufacturer" });
    }
  };

  const handleDeleteManufacturer = (item: Manufacturer) => {
    setDeleteDialog({
      open: true,
      item,
      type: "Manufacturer",
      onConfirm: async () => {
        try {
          await deleteInventoryManufacturer(item.id);
          const list = await fetchInventoryManufacturers();
          setManufacturers(list);
          toast.success("Manufacturer Deleted", { description: `${item.name} has been successfully deleted` });
        } catch (err) {
          console.error(err);
          toast.success("Delete Error", { description: "Unable to delete manufacturer" });
        }
      },
    });
  };

  // Brand handlers
  const handleAddBrand = async (data: Omit<Brand, "id" | "createdAt" | "manufacturerName">) => {
    try {
      await addInventoryBrand(data);
      const list = await fetchInventoryBrands();
      setBrands(list);
      setBrandForm((prev) => ({ ...prev, open: false }));
      toast.success("Brand Added", { description: `${data.name} has been successfully added` });
    } catch (err) {
      console.error(err);
      toast.success("Add Error", { description: "Unable to add brand" });
    }
  };

  const handleEditBrand = async (data: Omit<Brand, "id" | "createdAt" | "manufacturerName">) => {
    if (!brandForm.data) return;
    try {
      await updateInventoryBrand(brandForm.data.id, data);
      const list = await fetchInventoryBrands();
      setBrands(list);
      setBrandForm((prev) => ({ ...prev, open: false, data: undefined }));
      toast.success("Brand Updated", { description: `${data.name} has been successfully updated` });
    } catch (err) {
      console.error(err);
      toast.success("Update Error", { description: "Unable to update brand" });
    }
  };

  const handleDeleteBrand = (item: Brand) => {
    setDeleteDialog({
      open: true,
      item,
      type: "Brand",
      onConfirm: async () => {
        try {
          await deleteInventoryBrand(item.id);
          const list = await fetchInventoryBrands();
          setBrands(list);
          toast.success("Brand Deleted", { description: `${item.name} has been successfully deleted` });
        } catch (err) {
          console.error(err);
          toast.success("Delete Error", { description: "Unable to delete brand" });
        }
      },
    });
  };

  // UOM handlers
  const handleAddUOM = async (data: Omit<UnitOfMeasure, "id" | "createdAt">) => {
    try {
      await addInventoryUnitOfMeasure(data);
      const list = await fetchInventoryUnitsOfMeasure();
      setUnitsOfMeasure(list);
      setUomForm((prev) => ({ ...prev, open: false }));
      toast.success("Unit Added", { description: `${data.name} has been successfully added` });
    } catch (err) {
      console.error(err);
      toast.success("Add Error", { description: "Unable to add unit" });
    }
  };

  const handleEditUOM = async (data: Omit<UnitOfMeasure, "id" | "createdAt">) => {
    if (!uomForm.data) return;
    try {
      await updateInventoryUnitOfMeasure(uomForm.data.id, data);
      const list = await fetchInventoryUnitsOfMeasure();
      setUnitsOfMeasure(list);
      setUomForm((prev) => ({ ...prev, open: false, data: undefined }));
      toast.success("Unit Updated", { description: `${data.name} has been successfully updated` });
    } catch (err) {
      console.error(err);
      toast.success("Update Error", { description: "Unable to update unit" });
    }
  };

  const handleDeleteUOM = (item: UnitOfMeasure) => {
    setDeleteDialog({
      open: true,
      item,
      type: "Unit of Measure",
      onConfirm: async () => {
        try {
          await deleteInventoryUnitOfMeasure(item.id);
          const list = await fetchInventoryUnitsOfMeasure();
          setUnitsOfMeasure(list);
          toast.success("Unit Deleted", { description: `${item.name} has been successfully deleted` });
        } catch (err) {
          console.error(err);
          toast.success("Delete Error", { description: "Unable to delete unit" });
        }
      },
    });
  };

  // Tax handlers
  const handleAddTax = async (data: Omit<Tax, "id" | "createdAt">) => {
    try {
      await addInventoryTax(data);
      const list = await fetchInventoryTaxes();
      setTaxes(list);
      setTaxForm((prev) => ({ ...prev, open: false }));
      toast.success("Tax Added", { description: `${data.name} has been successfully added` });
    } catch (err) {
      console.error(err);
      toast.success("Add Error", { description: "Unable to add tax" });
    }
  };

  const handleEditTax = async (data: Omit<Tax, "id" | "createdAt">) => {
    if (!taxForm.data) return;
    try {
      await updateInventoryTax(taxForm.data.id, data);
      const list = await fetchInventoryTaxes();
      setTaxes(list);
      setTaxForm((prev) => ({ ...prev, open: false, data: undefined }));
      toast.success("Tax Updated", { description: `${data.name} has been successfully updated` });
    } catch (err) {
      console.error(err);
      toast.success("Update Error", { description: "Unable to update tax" });
    }
  };

  const handleDeleteTax = (item: Tax) => {
    setDeleteDialog({
      open: true,
      item,
      type: "Tax",
      onConfirm: async () => {
        try {
          await deleteInventoryTax(item.id);
          const list = await fetchInventoryTaxes();
          setTaxes(list);
          toast.success("Tax Deleted", { description: `${item.name} has been successfully deleted` });
        } catch (err) {
          console.error(err);
          toast.success("Delete Error", { description: "Unable to delete tax" });
        }
      },
    });
  };

  // Column definitions
  const categoryColumns = [
    { key: "name", label: "Category Name" },
    { key: "description", label: "Description" },
    { key: "status", label: "Status" },
    //{ key: "createdAt", label: "Created Date" },
  ];

  const subcategoryColumns = [
    { key: "name", label: "Subcategory Name" },
    { key: "categoryName", label: "Category" },
    //{ key: "description", label: "Description" },
    { key: "status", label: "Status" },
  ];

  const manufacturerColumns = [
    { key: "name", label: "Name" },
    { key: "contactPerson", label: "Contact Person" },
    { key: "phone", label: "Phone" },
    { key: "email", label: "Email" },
    { key: "status", label: "Status" },
  ];

  const brandColumns = [
    { key: "name", label: "Brand Name" },
    { key: "manufacturerName", label: "Manufacturer" },
    { key: "description", label: "Description" },
    { key: "status", label: "Status" },
  ];

  const uomColumns = [
    { key: "name", label: "Unit Name" },
    { key: "symbol", label: "Symbol" },
    { key: "conversionRate", label: "Conversion Rate" },
    { key: "status", label: "Status" },
  ];

  const taxColumns = [
    { key: "name", label: "Tax Name" },
    { 
      key: "percentage", 
      label: "Rate",
      render: (value: number) => `${value}%`
    },
    { key: "type", label: "Type" },
    //{ key: "region", label: "Region" },
    { key: "status", label: "Status" },
  ];

  return(
    <>
      <div className="space-y-6">
        <main className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-1">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground pb-4">
              Manage Inventory Masters
            </h1>
          </div>


          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category */}
            <MasterCard
              title="Category"
              description="Manage product categories"
              icon={<FolderTree className="h-5 w-5" />}
              onAdd={() => setCategoryForm({ open: true, mode: "add" })}
              onSearch={setCategorySearch}
            >
              <DataTable
                columns={categoryColumns}
                data={filterData(categories, categorySearch)}
                onView={(item) => setViewDialog({ open: true, data: item, type: "Category" })}
                onEdit={(item) => setCategoryForm({ open: true, mode: "edit", data: item })}
                //onDelete={handleDeleteCategory}
              />
            </MasterCard>

            {/* Subcategory */}
            <MasterCard
              title="Subcategory"
              description="Manage product subcategories"
              icon={<Folders className="h-5 w-5" />}
              onAdd={() => setSubcategoryForm({ open: true, mode: "add" })}
              customFilters={
                <div className="flex items-center gap-3">
                  <Select
                    onValueChange={(val) =>
                      setSubcategoryCategoryFilter(val === "" ? undefined : val)
                    }
                  >
                    <SelectTrigger className="w-[220px]">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search subcategory..."
                      value={subcategorySearch}
                      onChange={(e) => setSubcategorySearch(e.target.value)}
                      className="pl-10 bg-background border-border focus:border-primary transition-colors"
                    />
                  </div>
                </div>
              }
            >
              <DataTable
                columns={subcategoryColumns}
                data={filterSubcategories(
                  subcategories,
                  subcategorySearch,
                  subcategoryCategoryFilter
                )}
                onView={(item) => setViewDialog({ open: true, data: item, type: "Subcategory" })}
                onEdit={(item) => setSubcategoryForm({ open: true, mode: "edit", data: item })}
               // onDelete={handleDeleteSubcategory}
              />
            </MasterCard>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 pt-4">

            {/* Manufacturer */}
            <MasterCard
              title="Manufacturer / Supplier"
              description="Manage manufacturers and suppliers"
              icon={<Building2 className="h-5 w-5" />}
              onAdd={() => setManufacturerForm({ open: true, mode: "add" })}
              onSearch={setManufacturerSearch}
            >
              <DataTable
                columns={manufacturerColumns}
                data={filterData(manufacturers, manufacturerSearch)}
                onView={(item) => setViewDialog({ open: true, data: item, type: "Manufacturer" })}
                onEdit={(item) => setManufacturerForm({ open: true, mode: "edit", data: item })}
                //onDelete={handleDeleteManufacturer}
              />
            </MasterCard>

            {/* Brand */}
            <MasterCard
              title="Brand Name"
              description="Manage product brands"
              icon={<Award className="h-5 w-5" />}
              onAdd={() => setBrandForm({ open: true, mode: "add" })}
              customFilters={
                <div className="flex items-center gap-3">
                  <Select
                    onValueChange={(val) =>
                      setBrandManufacturerFilter(val === "" ? undefined : val)
                    }
                  >
                    <SelectTrigger className="w-[260px]">
                      <SelectValue placeholder="Filter by manufacturer" />
                    </SelectTrigger>
                    <SelectContent>
                      {manufacturers.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search brand name..."
                      value={brandSearch}
                      onChange={(e) => setBrandSearch(e.target.value)}
                      className="pl-10 bg-background border-border focus:border-primary transition-colors"
                    />
                  </div>
                </div>
              }
            >
              <DataTable
                columns={brandColumns}
                data={filterBrandsByManufacturer(
                  brands,
                  brandSearch,
                  brandManufacturerFilter
                )}
                onView={(item) => setViewDialog({ open: true, data: item, type: "Brand" })}
                onEdit={(item) => setBrandForm({ open: true, mode: "edit", data: item })}
                //onDelete={handleDeleteBrand}
              />
            </MasterCard>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
          {/* Unit of Measure */}
          <MasterCard
            title="Unit of Measure"
            description="Manage measurement units"
            icon={<Package className="h-5 w-5" />}
            onAdd={() => setUomForm({ open: true, mode: "add" })}
            onSearch={setUomSearch}
          >
            <DataTable
              columns={uomColumns}
              data={filterData(unitsOfMeasure, uomSearch)}
              onView={(item) => setViewDialog({ open: true, data: item, type: "Unit of Measure" })}
              onEdit={(item) => setUomForm({ open: true, mode: "edit", data: item })}
              //onDelete={handleDeleteUOM}
            />
          </MasterCard>

          {/* Tax */}
          <MasterCard
            title="Tax (GST / VAT)"
            description="Manage tax rates and types"
            icon={<Percent className="h-5 w-5" />}
            onAdd={() => setTaxForm({ open: true, mode: "add" })}
            onSearch={setTaxSearch}
          >
            <DataTable
              columns={taxColumns}
              data={filterData(taxes, taxSearch)}
              onView={(item) => setViewDialog({ open: true, data: item, type: "Tax" })}
              onEdit={(item) => setTaxForm({ open: true, mode: "edit", data: item })}
              //onDelete={handleDeleteTax}
            />
          </MasterCard>
        </div>



        {/* Forms */}
        <CategoryForm
          open={categoryForm.open}
          onOpenChange={(open) => setCategoryForm({ ...categoryForm, open })}
          onSubmit={categoryForm.mode === "add" ? handleAddCategory : handleEditCategory}
          initialData={categoryForm.data}
          mode={categoryForm.mode}
        />

        <SubcategoryForm
          open={subcategoryForm.open}
          onOpenChange={(open) => setSubcategoryForm({ ...subcategoryForm, open })}
          onSubmit={subcategoryForm.mode === "add" ? handleAddSubcategory : handleEditSubcategory}
          initialData={subcategoryForm.data}
          mode={subcategoryForm.mode}
          categories={categories}
        />

        <ManufacturerForm
          open={manufacturerForm.open}
          onOpenChange={(open) => setManufacturerForm({ ...manufacturerForm, open })}
          onSubmit={manufacturerForm.mode === "add" ? handleAddManufacturer : handleEditManufacturer}
          initialData={manufacturerForm.data}
          mode={manufacturerForm.mode}
        />

        <BrandForm
          open={brandForm.open}
          onOpenChange={(open) => setBrandForm({ ...brandForm, open })}
          onSubmit={brandForm.mode === "add" ? handleAddBrand : handleEditBrand}
          initialData={brandForm.data}
          mode={brandForm.mode}
          manufacturers={manufacturers}
        />

        <UnitOfMeasureForm
          open={uomForm.open}
          onOpenChange={(open) => setUomForm({ ...uomForm, open })}
          onSubmit={uomForm.mode === "add" ? handleAddUOM : handleEditUOM}
          initialData={uomForm.data}
          mode={uomForm.mode}
        />

        <TaxForm
          open={taxForm.open}
          onOpenChange={(open) => setTaxForm({ ...taxForm, open })}
          onSubmit={taxForm.mode === "add" ? handleAddTax : handleEditTax}
          initialData={taxForm.data}
          mode={taxForm.mode}
        />

        {/* View Dialog 
        <ViewDetailsDialog
          open={viewDialog.open}
          onOpenChange={(open) => setViewDialog({ ...viewDialog, open })}
          data={viewDialog.data}
          title={viewDialog.type}
          fields={
            viewDialog.type === "Category" ? categoryColumns :
            viewDialog.type === "Subcategory" ? subcategoryColumns :
            viewDialog.type === "Manufacturer" ? [
              ...manufacturerColumns,
              { key: "address", label: "Address" },
              { key: "licenseNo", label: "License Number" },
              { key: "createdAt", label: "Created Date" },
            ] :
            viewDialog.type === "Brand" ? brandColumns :
            viewDialog.type === "Unit of Measure" ? [...uomColumns, { key: "createdAt", label: "Created Date" }] :
            viewDialog.type === "Tax" ? [...taxColumns, { key: "createdAt", label: "Created Date" }] :
            []
          }
        />*/}

        <ViewDetailsDialog
          open={viewDialog.open}
          onOpenChange={(open) => setViewDialog({ ...viewDialog, open })}
          data={viewDialog.data}
          title={viewDialog.type}
          fields={
            viewDialog.type === "Category" ? [
              ...categoryColumns,
              { key: "createdAt", label: "Updated Date" },
            ] :
            viewDialog.type === "Subcategory" ? [
              ...subcategoryColumns,
              { key: "createdAt", label: "Updated Date" },
            ] :
            viewDialog.type === "Manufacturer" ? [
              ...manufacturerColumns,
              { key: "address", label: "Address" },
              { key: "licenseNo", label: "License Number" },
              { key: "createdAt", label: "Updated Date" },
            ] :
            viewDialog.type === "Brand" ? [
              ...brandColumns,
              { key: "createdAt", label: "Updated Date" },
            ] :
            viewDialog.type === "Unit of Measure" ? [
              ...uomColumns,
              { key: "createdAt", label: "Updated Date" },
            ] :
            viewDialog.type === "Tax" ? [
              ...taxColumns,
              { key: "createdAt", label: "Updated Date" },
            ] :
            []
          }
        />


        {/* Delete Confirmation Dialog */}
        <DeleteConfirmDialog
          open={deleteDialog.open}
          onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
          onConfirm={() => {
            deleteDialog.onConfirm();
            setDeleteDialog({ open: false, item: null, type: "", onConfirm: () => {} });
          }}
          itemName={deleteDialog.item?.name || ""}
          itemType={deleteDialog.type}
        />

        </main>
      </div>
    </>
  );
}