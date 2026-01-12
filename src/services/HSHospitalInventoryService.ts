// services/HSHospitalInventoryService.ts
import Cookies from "js-cookie";
import { configService } from "./configService";
import { decryptAESFromPHP } from "@/utils/aesDecrypt";
import CryptoJS from "crypto-js";
import type {
  Category,
  Subcategory,
  Manufacturer,
  Brand,
  UnitOfMeasure,
  Tax,
} from "@/types/master";
import type { ProductInventory } from "@/data/inventory2Data";

// Product/Medicine create payload
export interface InventoryProductInput {
  name: string;
  sku: string;
  categoryId: string;
  subcategoryId?: string;
  modelNumber?: string;
  uomId: string;
  licenseNo?: string;
  barcode?: string;
  purchasePrice: number;
  sellingPrice: number;
  mrpPrice: number;
  taxId?: string;
  minStock: number;
  maxStock?: number;
  description?: string;
  status: "Active" | "Inactive";
  imageFile?: File; // optional product image
}

// Lightweight product list item for selects
export interface InventoryProductListItem {
  id: string;
  sku?: string;
  name: string;
}

const getAuthHeaders = async () => {
  const token = Cookies.get("token");
  const apiUrl = await configService.getApiUrl();

  if (!token) throw new Error("No auth token found");

  return {
    apiUrl,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };
};

const toUiStatus = (v: any): "Active" | "Inactive" => {
  const s = String(v ?? "").toLowerCase();
  if (["1", "active", "true", "yes"].includes(s)) return "Active";
  return "Inactive";
};

const toApiStatus = (v: "Active" | "Inactive"): "1" | "0" => (v === "Active" ? "1" : "0");

const encObj = async (obj: Record<string, any>) => {
  const AES_KEY = await configService.getAesSecretKey();
  const out: Record<string, string> = {};
  Object.keys(obj).forEach((k) => {
    out[k] = CryptoJS.AES.encrypt(String(obj[k] ?? ""), AES_KEY).toString();
  });
  return out;
};

const decList = async (json: any): Promise<any[]> => {
  if (!json?.success || !json?.data) return [];
  const AES_KEY = await configService.getAesSecretKey();
  const decrypted = decryptAESFromPHP(json.data, AES_KEY);
  let arr: any[] = [];
  try {
    arr = decrypted ? JSON.parse(decrypted) : [];
    if (!Array.isArray(arr)) arr = [];
  } catch {
    arr = [];
  }
  return arr;
};

// utils/formatDate.ts

const formatDateTime = (raw: string | null | undefined): string => {
  // ✅ Return early if no value
  if (!raw || raw === "0000-00-00 00:00:00") return "";

  // ✅ Convert MySQL date to valid ISO format (replace space with 'T')
  const d = new Date(raw.replace(" ", "T"));

  // ✅ If invalid date, return empty string
  if (isNaN(d.getTime())) return "";

  // ✅ Build formatted output
  const day = d.getDate().toString().padStart(2, "0");
  const month = d.toLocaleString("en-US", { month: "long" });
  const year = d.getFullYear();

  const time = d.toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  return `${day}-${month}-${year} ${time}`;
};


// ---------- Category ----------
  export const fetchInventoryCategories = async (): Promise<Category[]> => {
    const { apiUrl, headers } = await getAuthHeaders();
    const res = await fetch(`${apiUrl}/hs_inventory_category_list`, {
      method: "POST",
      headers,
      body: JSON.stringify({}),
    });
    if (!res.ok) throw new Error("Failed to fetch categories");
    const json = await res.json();
    const items = await decList(json);
    const mapped: Category[] = items.map((item: any) => ({
      id: item.id ?? item.categoryuid ?? item.catuid ?? String(item.id ?? ""),
      name: item.name ?? item.category_name ?? "",
      description: item.description ?? item.desc ?? "",
      status: toUiStatus(item.status),
      createdAt: formatDateTime(item.created_at ?? item.updated_at),
    }));
    return mapped;
  };

export const addInventoryCategory = async (
  data: Omit<Category, "id" | "createdAt">
) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const payload = await encObj({
    name: data.name,
    description: data.description ?? "",
    status: toApiStatus(data.status),
  });
  const res = await fetch(`${apiUrl}/hs_inventory_category_add`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to add category");
  return res.json();
};

export const updateInventoryCategory = async (
  id: string,
  data: Omit<Category, "id" | "createdAt">
) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();
  const payload = await encObj({
    name: data.name,
    description: data.description ?? "",
    status: toApiStatus(data.status),
  });
  (payload as any)["id"] = CryptoJS.AES.encrypt(id, AES_KEY).toString();
  const res = await fetch(`${apiUrl}/hs_inventory_category_update`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update category");
  return res.json();
};

export const deleteInventoryCategory = async (id: string) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();
  const payload = { id: CryptoJS.AES.encrypt(id, AES_KEY).toString() };
  const res = await fetch(`${apiUrl}/hs_inventory_category_delete`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to delete category");
  return res.json();
};

// ---------- Subcategory ----------
export const fetchInventorySubcategories = async (): Promise<Subcategory[]> => {
  const { apiUrl, headers } = await getAuthHeaders();
  const res = await fetch(`${apiUrl}/hs_inventory_subcategory_list`, {
    method: "POST",
    headers,
    body: JSON.stringify({}),
  });
  if (!res.ok) throw new Error("Failed to fetch subcategories");
  const json = await res.json();
  const items = await decList(json);
  const mapped: Subcategory[] = items.map((item: any) => ({
    id: item.id ?? item.subcategoryuid ?? item.subuid ?? String(item.id ?? ""),
    name: item.name ?? item.subcategory_name ?? "",
    categoryId: item.category_id ?? item.categoryId ?? item.catuid ?? item.categoryuid ?? "",
    categoryName: item.category_name ?? item.categoryName ?? "",
    description: item.description ?? item.desc ?? "",
    status: toUiStatus(item.status),
    createdAt: formatDateTime(item.created_at ?? item.updated_at),
  }));
  return mapped;
};

export const addInventorySubcategory = async (
  data: Omit<Subcategory, "id" | "createdAt" | "categoryName">
) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const payload = await encObj({
    name: data.name,
    category_id: data.categoryId,
    description: data.description ?? "",
    status: toApiStatus(data.status),
  });
  const res = await fetch(`${apiUrl}/hs_inventory_subcategory_add`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to add subcategory");
  return res.json();
};

// ---------- Batches ----------
export interface InventoryBatchEntry {
  batchNumber: string;
  mfgDate: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD
  quantity: number;
  supplierId?: string; // manufacturer id
  purchaseRate?: number;
  mrp?: number;
  rackPosition?: string;
  notes?: string;
}

export interface InventoryBatchInput {
  productId: string;
  batches: InventoryBatchEntry[];
}

export const addInventoryBatch = async (input: InventoryBatchInput) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const payload = await encObj({
    product_id: input.productId,
    // Encrypt the entire batches array as a JSON string per our standard
    batches: JSON.stringify(input.batches ?? []),
  });
  const res = await fetch(`${apiUrl}/hs_inventory_batch_add`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to add batches");
  return res.json();
};

export const updateInventorySubcategory = async (
  id: string,
  data: Omit<Subcategory, "id" | "createdAt" | "categoryName">
) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();
  const payload = await encObj({
    name: data.name,
    category_id: data.categoryId,
    description: data.description ?? "",
    status: toApiStatus(data.status),
  });
  (payload as any)["id"] = CryptoJS.AES.encrypt(id, AES_KEY).toString();
  const res = await fetch(`${apiUrl}/hs_inventory_subcategory_update`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update subcategory");
  return res.json();
};

export const deleteInventorySubcategory = async (id: string) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();
  const payload = { id: CryptoJS.AES.encrypt(id, AES_KEY).toString() };
  const res = await fetch(`${apiUrl}/hs_inventory_subcategory_delete`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to delete subcategory");
  return res.json();
};

// ---------- Manufacturer ----------
export const fetchInventoryManufacturers = async (): Promise<Manufacturer[]> => {
  const { apiUrl, headers } = await getAuthHeaders();
  const res = await fetch(`${apiUrl}/hs_inventory_manufacturer_list`, {
    method: "POST",
    headers,
    body: JSON.stringify({}),
  });
  if (!res.ok) throw new Error("Failed to fetch manufacturers");
  const json = await res.json();
  const items = await decList(json);
  const mapped: Manufacturer[] = items.map((item: any) => ({
    id: item.id ?? item.manufactureruid ?? item.mfruid ?? String(item.id ?? ""),
    name: item.name ?? item.company_name ?? "",
    contactPerson: item.contactPerson ?? item.contact_person ?? "",
    address: item.address ?? "",
    phone: item.phone ?? "",
    email: item.email ?? "",
    licenseNo: item.licenseNo ?? item.license_no ?? "",
    status: toUiStatus(item.status),
    createdAt: formatDateTime(item.created_at ?? item.updated_at),
  }));
  return mapped;
};

export const addInventoryManufacturer = async (
  data: Omit<Manufacturer, "id" | "createdAt">
) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const payload = await encObj({
    name: data.name,
    contact_person: data.contactPerson,
    address: data.address ?? "",
    phone: data.phone,
    email: data.email,
    license_no: data.licenseNo ?? "",
    status: toApiStatus(data.status),
  });
  const res = await fetch(`${apiUrl}/hs_inventory_manufacturer_add`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to add manufacturer");
  return res.json();
};

export const updateInventoryManufacturer = async (
  id: string,
  data: Omit<Manufacturer, "id" | "createdAt">
) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();
  const payload = await encObj({
    name: data.name,
    contact_person: data.contactPerson,
    address: data.address ?? "",
    phone: data.phone,
    email: data.email,
    license_no: data.licenseNo ?? "",
    status: toApiStatus(data.status),
  });
  (payload as any)["id"] = CryptoJS.AES.encrypt(id, AES_KEY).toString();
  const res = await fetch(`${apiUrl}/hs_inventory_manufacturer_update`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update manufacturer");
  return res.json();
};

export const deleteInventoryManufacturer = async (id: string) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();
  const payload = { id: CryptoJS.AES.encrypt(id, AES_KEY).toString() };
  const res = await fetch(`${apiUrl}/hs_inventory_manufacturer_delete`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to delete manufacturer");
  return res.json();
};

// ---------- Brand ----------
export const fetchInventoryBrands = async (): Promise<Brand[]> => {
  const { apiUrl, headers } = await getAuthHeaders();
  const res = await fetch(`${apiUrl}/hs_inventory_brand_list`, {
    method: "POST",
    headers,
    body: JSON.stringify({}),
  });
  if (!res.ok) throw new Error("Failed to fetch brands");
  const json = await res.json();
  const items = await decList(json);
  const mapped: Brand[] = items.map((item: any) => ({
    id: item.id ?? item.branduid ?? String(item.id ?? ""),
    name: item.name ?? item.brand_name ?? "",
    manufacturerId: item.manufacturer_id ?? item.mfruid ?? item.manufacturerId ?? "",
    manufacturerName: item.manufacturer_name ?? item.manufacturerName ?? "",
    description: item.description ?? item.desc ?? "",
    status: toUiStatus(item.status),
    createdAt: formatDateTime(item.created_at ?? item.updated_at),
  }));
  return mapped;
};

export const addInventoryBrand = async (
  data: Omit<Brand, "id" | "createdAt" | "manufacturerName">
) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const payload = await encObj({
    name: data.name,
    manufacturer_id: data.manufacturerId,
    description: data.description ?? "",
    status: toApiStatus(data.status),
  });
  const res = await fetch(`${apiUrl}/hs_inventory_brand_add`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to add brand");
  return res.json();
};

export const updateInventoryBrand = async (
  id: string,
  data: Omit<Brand, "id" | "createdAt" | "manufacturerName">
) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();
  const payload = await encObj({
    name: data.name,
    manufacturer_id: data.manufacturerId,
    description: data.description ?? "",
    status: toApiStatus(data.status),
  });
  (payload as any)["id"] = CryptoJS.AES.encrypt(id, AES_KEY).toString();
  const res = await fetch(`${apiUrl}/hs_inventory_brand_update`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update brand");
  return res.json();
};

export const deleteInventoryBrand = async (id: string) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();
  const payload = { id: CryptoJS.AES.encrypt(id, AES_KEY).toString() };
  const res = await fetch(`${apiUrl}/hs_inventory_brand_delete`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to delete brand");
  return res.json();
};

// ---------- Unit of Measure ----------
export const fetchInventoryUnitsOfMeasure = async (): Promise<UnitOfMeasure[]> => {
  const { apiUrl, headers } = await getAuthHeaders();
  const res = await fetch(`${apiUrl}/hs_inventory_uom_list`, {
    method: "POST",
    headers,
    body: JSON.stringify({}),
  });
  if (!res.ok) throw new Error("Failed to fetch units of measure");
  const json = await res.json();
  const items = await decList(json);
  const mapped: UnitOfMeasure[] = items.map((item: any) => ({
    id: item.id ?? item.uomuid ?? String(item.id ?? ""),
    name: item.name ?? item.uom_name ?? "",
    symbol: item.symbol ?? item.uom_symbol ?? "",
    conversionRate: Number(item.conversion_rate ?? item.conversionRate ?? 1),
    status: toUiStatus(item.status),
    createdAt: formatDateTime(item.created_at ?? item.updated_at),
  }));
  return mapped;
};

export const addInventoryUnitOfMeasure = async (
  data: Omit<UnitOfMeasure, "id" | "createdAt">
) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const payload = await encObj({
    name: data.name,
    symbol: data.symbol,
    conversion_rate: data.conversionRate,
    status: toApiStatus(data.status),
  });
  const res = await fetch(`${apiUrl}/hs_inventory_uom_add`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to add unit of measure");
  return res.json();
};

export const updateInventoryUnitOfMeasure = async (
  id: string,
  data: Omit<UnitOfMeasure, "id" | "createdAt">
) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();
  const payload = await encObj({
    name: data.name,
    symbol: data.symbol,
    conversion_rate: data.conversionRate,
    status: toApiStatus(data.status),
  });
  (payload as any)["id"] = CryptoJS.AES.encrypt(id, AES_KEY).toString();
  const res = await fetch(`${apiUrl}/hs_inventory_uom_update`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update unit of measure");
  return res.json();
};

export const deleteInventoryUnitOfMeasure = async (id: string) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();
  const payload = { id: CryptoJS.AES.encrypt(id, AES_KEY).toString() };
  const res = await fetch(`${apiUrl}/hs_inventory_uom_delete`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to delete unit of measure");
  return res.json();
};

// ---------- Tax ----------
export const fetchInventoryTaxes = async (): Promise<Tax[]> => {
  const { apiUrl, headers } = await getAuthHeaders();
  const res = await fetch(`${apiUrl}/hs_inventory_tax_list`, {
    method: "POST",
    headers,
    body: JSON.stringify({}),
  });
  if (!res.ok) throw new Error("Failed to fetch taxes");
  const json = await res.json();
  const items = await decList(json);
  const mapped: Tax[] = items.map((item: any) => ({
    id: item.id ?? item.taxuid ?? String(item.id ?? ""),
    name: item.name ?? item.tax_name ?? "",
    percentage: Number(item.percentage ?? item.tax_rate ?? 0),
    type: item.type ?? item.tax_type ?? "",
    region: item.region ?? "",
    status: toUiStatus(item.status),
    createdAt: formatDateTime(item.created_at ?? item.updated_at),
  }));
  return mapped;
};

export const addInventoryTax = async (
  data: Omit<Tax, "id" | "createdAt">
) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const payload = await encObj({
    name: data.name,
    percentage: data.percentage,
    type: data.type,
    region: data.region ?? "",
    status: toApiStatus(data.status),
  });
  const res = await fetch(`${apiUrl}/hs_inventory_tax_add`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to add tax");
  return res.json();
};

export const updateInventoryTax = async (
  id: string,
  data: Omit<Tax, "id" | "createdAt">
) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();
  const payload = await encObj({
    name: data.name,
    percentage: data.percentage,
    type: data.type,
    region: data.region ?? "",
    status: toApiStatus(data.status),
  });
  (payload as any)["id"] = CryptoJS.AES.encrypt(id, AES_KEY).toString();
  const res = await fetch(`${apiUrl}/hs_inventory_tax_update`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update tax");
  return res.json();
};

export const deleteInventoryTax = async (id: string) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();
  const payload = { id: CryptoJS.AES.encrypt(id, AES_KEY).toString() };
  const res = await fetch(`${apiUrl}/hs_inventory_tax_delete`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to delete tax");
  return res.json();
};

// ---------- Product / Medicine ----------
// Fetch product list for selects
export const fetchInventoryProducts = async (): Promise<InventoryProductListItem[]> => {
  const { apiUrl, headers } = await getAuthHeaders();
  const res = await fetch(`${apiUrl}/hs_inventory_product_list`, {
    method: "POST",
    headers,
    body: JSON.stringify({}),
  });
  if (!res.ok) throw new Error("Failed to fetch products");
  const json = await res.json();
  const items = await decList(json);
  const mapped: InventoryProductListItem[] = items.map((item: any) => ({
    id: item.id ?? item.productuid ?? item.prodid ?? String(item.id ?? ""),
    sku: item.sku ?? item.product_code ?? item.code ?? "",
    name: item.name ?? item.product_name ?? item.title ?? "",
  }));
  return mapped;
};

// Note: Endpoint name follows existing convention; adjust if backend differs.
export const addInventoryProduct = async (data: InventoryProductInput) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const payload = await encObj({
    name: data.name,
    sku: data.sku,
    category_id: data.categoryId,
    subcategory_id: data.subcategoryId ?? "",
    model_number: data.modelNumber ?? "",
    uom_id: data.uomId,
    license_no: data.licenseNo ?? "",
    barcode: data.barcode ?? "",
    purchase_price: data.purchasePrice,
    selling_price: data.sellingPrice,
    mrp_price: data.mrpPrice,
    tax_id: data.taxId ?? "",
    min_stock: data.minStock,
    max_stock: data.maxStock ?? "",
    description: data.description ?? "",
    status: toApiStatus(data.status),
  });

  // If image file provided, send as multipart/form-data
  if (data.imageFile) {
    const fd = new FormData();
    Object.keys(payload).forEach((k) => {
      fd.append(k, (payload as any)[k]);
    });
    fd.append("product_image", data.imageFile);
    const multipartHeaders = { ...headers } as any;
    // Let the browser set content-type boundary
    delete multipartHeaders["Content-Type"];
    const res = await fetch(`${apiUrl}/hs_inventory_product_add`, {
      method: "POST",
      headers: multipartHeaders,
      body: fd,
    });
    if (!res.ok) throw new Error("Failed to add product");
    return res.json();
  }

  // Otherwise, send JSON
  const res = await fetch(`${apiUrl}/hs_inventory_product_add`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to add product");
  return res.json();
};

// ---------- Inventory Overview (Products + Batches) ----------
export const fetchInventoryOverview = async (
  search: string = "",
  page: number = 1,
  limit: number = 10
): Promise<ProductInventory[]> => {
  const { items } = await fetchInventoryOverviewPaged(search, page, limit);
  return items;
};

export interface ProductInventoryPage {
  items: ProductInventory[];
  total: number;
  page: number;
  limit: number;
}

export const fetchInventoryOverviewPaged = async (
  search: string = "",
  page: number = 1,
  limit: number = 10
): Promise<ProductInventoryPage> => {
  const { apiUrl, headers } = await getAuthHeaders();
  const payload = { search, page, limit };
  const res = await fetch(`${apiUrl}/hs_inventory_overview_list`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to fetch inventory overview");
  const json = await res.json();
  const items = await decList(json);
  const mapped: ProductInventory[] = items.map((item: any) => ({
    id: String(item.id ?? ""),
    productImage:
      item.image_url ?? item.product_image ?? item.productImage ?? "",
    productName: item.productName ?? item.name ?? "",
    sku: item.sku ?? "",
    category: item.category ?? "",
    brand: item.brand ?? "",
    totalStock: Number(item.totalStock ?? 0),
    minLevel: Number(item.minLevel ?? 0),
    maxLevel: Number(item.maxLevel ?? 0),
    status: (item.status ?? "in-stock") as ProductInventory["status"],
    batches: Array.isArray(item.batches)
      ? item.batches.map((b: any) => ({
          batchNumber: b.batchNumber ?? b.batch_no ?? "",
          manufactureDate: b.manufactureDate ?? b.mfg_date ?? "",
          expiryDate: b.expiryDate ?? b.exp_date ?? "",
          quantity: Number(b.quantity ?? 0),
          warehouse: b.warehouse ?? "",
          rackPosition: b.rackPosition ?? b.storage_location ?? "",
          unitCost: Number(b.unitCost ?? b.purchase_price ?? 0),
          supplier: b.supplier ?? "",
          lastUpdated: b.lastUpdated ?? b.updated_at ?? "",
          status: (b.status ?? "fresh") as ProductInventory["batches"][number]["status"],
        }))
      : [],
  }));
  const total = Number((json as any).total ?? 0) || mapped.length;
  const currentPage = Number((json as any).page ?? page) || page;
  const currentLimit = Number((json as any).limit ?? limit) || limit;
  return { items: mapped, total, page: currentPage, limit: currentLimit };
};