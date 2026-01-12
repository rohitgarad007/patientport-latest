// services/HSHospitalMedicalService.ts
import Cookies from "js-cookie";
import { configService } from "./configService";
import { decryptAESFromPHP } from "@/utils/aesDecrypt";
import CryptoJS from "crypto-js";

export type MedicalStoreStatus = "active" | "inactive";

export interface MedicalStore {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  licenseNo?: string;
  address?: string;
  status: MedicalStoreStatus;
  createdAt?: string;
}

export interface MedicalStoreInput {
  name: string;
  email?: string;
  phone?: string;
  licenseNo?: string;
  address?: string;
  status: MedicalStoreStatus;
}

// Inventory item shape for request-creation search list
export interface MedicalInventoryItem {
  id: string;
  code: string; // SKU / Code
  name: string;
  unit?: string;
  available: number;
}

// ======================
// Medical Request Types
// ======================
export interface MedicalRequestSummary {
  id: string;
  code: string;
  store: string;
  items: number;
  status: string;
  date: string;
  requestedBy: string;
  priority: string;
  remarks?: string;
}

export interface MedicalRequestItemDetail {
  code: string;
  name: string;
  requestedQty: number;
  unit?: string;
  approvedQty?: number | null;
  dispatchedQty?: number | null;
  batchNo?: string | null;
}

export interface MedicalRequestDetails extends MedicalRequestSummary {
  itemDetails: MedicalRequestItemDetail[];
}

export interface MedicalRequestCreatePayload {
  store_id: string;
  requested_by: string;
  priority: string;
  remarks?: string;
  items: Array<{ product_id: string; requested_qty: number; unit?: string }>;
}

export interface MedicalRequestItemBatchOption {
  batchNo: string;
  expDate?: string;
  mfgDate?: string;
  qty: number;
  location?: string;
  supplier?: string;
}

export interface MedicalRequestItemWithBatches {
  id: string;
  code: string;
  name: string;
  requestedQty: number;
  unit?: string;
  availableQty: number;
  batches: MedicalRequestItemBatchOption[];
}

export interface AllocationPayloadItemBatch { batchNo: string; qty: number; }
export interface AllocationPayloadItem {
  item_id: string;
  approved: number;
  selectedBatches: AllocationPayloadItemBatch[];
}
export interface AllocationPayload {
  request_id: string;
  items: AllocationPayloadItem[];
  courier?: string;
  trackingNumber?: string;
}

export interface ReceiptItem {
  id: string;
  name: string;
  category?: string;
  batchNumber: string;
  dispatchedQty: number;
  unit?: string;
  expiryDate?: string;
}

export interface ReceiptListItem {
  id: string; // dispatch id
  status: string;
  requestId: string;
  store: string;
  dispatchDate?: string;
  courier?: string;
  trackingNumber?: string;
  items: ReceiptItem[];
}

export interface ReceiptConfirmItemPayload {
  allocation_id: string;
  received_qty: number;
  has_issue?: number;
  issue_description?: string;
}
export interface ReceiptConfirmPayload {
  dispatch_id: string;
  received_by: string;
  remarks?: string;
  items: ReceiptConfirmItemPayload[];
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

// Map various backend status representations to UI status
const toUiStatus = (v: any): MedicalStoreStatus => {
  const s = String(v ?? "").toLowerCase();
  if (["1", "active", "true", "yes"].includes(s)) return "active";
  return "inactive";
};

// Convert UI status to API representation
const toApiStatus = (v: MedicalStoreStatus): "1" | "0" => (v === "active" ? "1" : "0");

// Encrypt all values of an object using app AES key
const encObj = async (obj: Record<string, any>) => {
  const AES_KEY = await configService.getAesSecretKey();
  const out: Record<string, string> = {};
  Object.keys(obj).forEach((k) => {
    out[k] = CryptoJS.AES.encrypt(String(obj[k] ?? ""), AES_KEY).toString();
  });
  return out;
};

// Decrypt AES list payload from backend `{ success, data }`
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

// Format date if provided (safe guard against invalid formats)
const formatDateTime = (raw: string | null | undefined): string => {
  if (!raw || raw === "0000-00-00 00:00:00") return "";
  const d = new Date(String(raw).replace(" ", "T"));
  if (isNaN(d.getTime())) return "";
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

// ======================
// Medical Store Services
// ======================

// Fetch medical stores with optional pagination and search
export const fetchMedicalStores = async (page = 1, limit = 10, search = ""): Promise<MedicalStore[]> => {
  const { apiUrl, headers } = await getAuthHeaders();
  const res = await fetch(`${apiUrl}/hs_medical_store_list`, {
    method: "POST",
    headers,
    body: JSON.stringify({ page, limit, search }),
  });
  if (!res.ok) throw new Error("Failed to fetch medical stores");
  const json = await res.json();
  const items = await decList(json);
  const mapped: MedicalStore[] = items.map((item: any) => ({
    id: item.id ?? item.storeuid ?? item.stuid ?? String(item.id ?? ""),
    name: item.name ?? item.store_name ?? item.shop_name ?? "",
    email: item.email ?? item.mail ?? "",
    phone: item.phone ?? item.mobile ?? item.contact_no ?? "",
    licenseNo: item.license_no ?? item.licenseNo ?? item.lic ?? "",
    address: item.address ?? item.location ?? item.addr ?? "",
    status: toUiStatus(item.status),
    createdAt: formatDateTime(item.created_at ?? item.updated_at),
  }));
  return mapped;
};

// Add a new medical store
export const addMedicalStore = async (data: MedicalStoreInput) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const payload = await encObj({
    name: data.name,
    email: data.email ?? "",
    phone: data.phone ?? "",
    license_no: data.licenseNo ?? "",
    address: data.address ?? "",
    status: toApiStatus(data.status),
  });
  const res = await fetch(`${apiUrl}/hs_medical_store_add`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to add medical store");
  return res.json();
};

// Update existing medical store
export const updateMedicalStore = async (id: string, data: MedicalStoreInput) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();
  const payload = await encObj({
    name: data.name,
    email: data.email ?? "",
    phone: data.phone ?? "",
    license_no: data.licenseNo ?? "",
    address: data.address ?? "",
    status: toApiStatus(data.status),
  });
  (payload as any)["id"] = CryptoJS.AES.encrypt(String(id), AES_KEY).toString();
  const res = await fetch(`${apiUrl}/hs_medical_store_update`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update medical store");
  return res.json();
};

// Change status (active/inactive)
export const changeMedicalStoreStatus = async (id: string, status: MedicalStoreStatus) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();
  const payload = {
    id: CryptoJS.AES.encrypt(String(id), AES_KEY).toString(),
    status: CryptoJS.AES.encrypt(toApiStatus(status), AES_KEY).toString(),
  };
  const res = await fetch(`${apiUrl}/hs_medical_store_change_status`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to change medical store status");
  return res.json();
};

// Delete medical store
export const deleteMedicalStore = async (id: string) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();
  const payload = { id: CryptoJS.AES.encrypt(String(id), AES_KEY).toString() };
  const res = await fetch(`${apiUrl}/hs_medical_store_delete`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to delete medical store");
  return res.json();
};

// ======================
// Medical Inventory List
// ======================
export const fetchMedicalInventory = async (
  search = "",
  options?: { onlyAvailable?: boolean; page?: number; limit?: number }
): Promise<MedicalInventoryItem[]> => {
  const { apiUrl, headers } = await getAuthHeaders();
  const body = {
    search,
    only_available: options?.onlyAvailable === false ? 0 : 1,
    page: options?.page ?? 1,
    limit: options?.limit ?? 50,
  };
  const res = await fetch(`${apiUrl}/hs_medical_inventory_list`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to fetch medical inventory");
  const json = await res.json();
  const items = await decList(json);
  const mapped: MedicalInventoryItem[] = items.map((it: any) => ({
    id: String(it.id ?? it.product_id ?? it.productuid ?? ""),
    code: it.code ?? it.sku ?? "",
    name: it.name ?? it.productName ?? "",
    unit: it.unit ?? it.uom ?? it.uom_symbol ?? it.uom_name ?? undefined,
    available: Number(it.available ?? it.totalStock ?? 0) || 0,
  }));
  return mapped;
};

// ======================
// Medical Requests APIs
// ======================
export const fetchMedicalRequests = async (
  page = 1,
  limit = 10,
  search = "",
  status = ""
): Promise<{ items: MedicalRequestSummary[]; total: number; page: number; limit: number }> => {
  const { apiUrl, headers } = await getAuthHeaders();
  const res = await fetch(`${apiUrl}/hs_medical_requests_list`, {
    method: "POST",
    headers,
    body: JSON.stringify({ page, limit, search, status }),
  });
  if (!res.ok) throw new Error("Failed to fetch medical requests");
  const json = await res.json();
  const arr = await decList(json);
  const items: MedicalRequestSummary[] = arr.map((r: any) => ({
    id: String(r.id ?? r.reqid ?? r.request_id ?? ""),
    code: String(r.code ?? r.request_code ?? ""),
    store: String(r.store ?? r.store_name ?? ""),
    items: Number(r.items ?? 0) || 0,
    status: String(r.status ?? "Pending"),
    date: String(r.date ?? r.created_at ?? ""),
    requestedBy: String(r.requestedBy ?? r.requested_by ?? ""),
    priority: String(r.priority ?? "Normal"),
    remarks: String(r.remarks ?? ""),
  }));
  return { items, total: Number(json.total ?? items.length) || 0, page: Number(json.page ?? page), limit: Number(json.limit ?? limit) };
};

// Convenience wrappers for explicit approved/declined lists
export const fetchApprovedRequests = async (page = 1, limit = 10, search = "") => {
  return fetchMedicalRequests(page, limit, search, "Approved");
};

export const fetchDeclinedRequests = async (page = 1, limit = 10, search = "") => {
  return fetchMedicalRequests(page, limit, search, "Declined");
};

export const createMedicalRequest = async (
  payload: MedicalRequestCreatePayload
): Promise<{ success: boolean; request_id?: string; code?: string; message?: string }> => {
  const { apiUrl, headers } = await getAuthHeaders();
  const res = await fetch(`${apiUrl}/hs_medical_request_create`, {
    method: "POST",
    headers: { ...headers, Accept: "application/json" },
    body: JSON.stringify(payload),
  });
  let json: any = null;
  try {
    json = await res.json();
  } catch (e) {
    // fall through with null json
  }
  if (!res.ok) {
    const msg = (json && (json.message || json.error)) || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return json || { success: false, message: "Empty response" };
};

export const fetchMedicalRequestDetails = async (request_id: string): Promise<MedicalRequestDetails | null> => {
  const { apiUrl, headers } = await getAuthHeaders();
  const res = await fetch(`${apiUrl}/hs_medical_request_details`, {
    method: "POST",
    headers,
    body: JSON.stringify({ request_id }),
  });
  if (!res.ok) throw new Error("Failed to fetch request details");
  const json = await res.json();
  const arr = await decList(json);
  const obj = Array.isArray(arr) && arr.length ? arr[0] : null;
  if (!obj) return null;
  const det: MedicalRequestDetails = {
    id: String(obj.id ?? ""),
    code: String(obj.code ?? ""),
    store: String(obj.store ?? ""),
    items: Number(obj.items ?? 0) || 0,
    status: String(obj.status ?? "Pending"),
    date: String(obj.date ?? ""),
    requestedBy: String(obj.requestedBy ?? ""),
    priority: String(obj.priority ?? "Normal"),
    remarks: String(obj.remarks ?? ""),
    itemDetails: Array.isArray(obj.itemDetails) ? obj.itemDetails.map((it: any) => ({
      code: String(it.code ?? ""),
      name: String(it.name ?? ""),
      requestedQty: Number(it.requestedQty ?? 0) || 0,
      unit: String(it.unit ?? ""),
      approvedQty: it.approvedQty ?? null,
      dispatchedQty: it.dispatchedQty ?? null,
      batchNo: it.batchNo ?? null,
    })) : [],
  };
  return det;
};

export const fetchRequestItemsWithBatches = async (request_id: string): Promise<MedicalRequestItemWithBatches[]> => {
  const { apiUrl, headers } = await getAuthHeaders();
  const res = await fetch(`${apiUrl}/hs_medical_request_items_with_batches`, {
    method: "POST",
    headers,
    body: JSON.stringify({ request_id }),
  });
  if (!res.ok) throw new Error("Failed to fetch request items batches");
  const json = await res.json();
  const arr = await decList(json);
  const items: MedicalRequestItemWithBatches[] = arr.map((it: any) => ({
    id: String(it.id ?? it.item_id ?? ""),
    code: String(it.code ?? it.sku ?? ""),
    name: String(it.name ?? ""),
    requestedQty: Number(it.requestedQty ?? 0) || 0,
    unit: String(it.unit ?? ""),
    availableQty: Number(it.availableQty ?? 0) || 0,
    batches: Array.isArray(it.batches) ? it.batches.map((b: any) => ({
      batchNo: String(b.batchNo ?? b.batch_no ?? ""),
      expDate: String(b.expDate ?? b.expiry_date ?? ""),
      mfgDate: String(b.mfgDate ?? b.manufacture_date ?? ""),
      qty: Number(b.qty ?? b.quantity ?? 0) || 0,
      location: String(b.location ?? ""),
      supplier: String(b.supplier ?? ""),
    })) : [],
  }));
  return items;
};

export const allocateRequestItems = async (payload: AllocationPayload): Promise<{ success: boolean; dispatch_id?: string }> => {
  const { apiUrl, headers } = await getAuthHeaders();
  const res = await fetch(`${apiUrl}/hs_medical_request_allocate_items`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to allocate request items");
  return res.json();
};

// Decline a medical request (status-only update)
export const declineMedicalRequest = async (request_id: string, reason: string = ""): Promise<{ success: boolean }> => {
  const { apiUrl, headers } = await getAuthHeaders();
  const res = await fetch(`${apiUrl}/hs_medical_request_decline`, {
    method: "POST",
    headers,
    body: JSON.stringify({ request_id, reason }),
  });
  if (!res.ok) throw new Error("Failed to decline medical request");
  return res.json();
};

export const approveMedicalRequest = async (request_id: string): Promise<{ success: boolean }> => {
  const { apiUrl, headers } = await getAuthHeaders();
  const res = await fetch(`${apiUrl}/hs_medical_request_approve`, {
    method: "POST",
    headers,
    body: JSON.stringify({ request_id }),
  });
  if (!res.ok) throw new Error("Failed to approve request");
  return res.json();
};

// ======================
// Receipts APIs
// ======================
export const fetchPendingReceipts = async (
  page = 1,
  limit = 10
): Promise<{ items: ReceiptListItem[]; total: number; page: number; limit: number }> => {
  const { apiUrl, headers } = await getAuthHeaders();
  const res = await fetch(`${apiUrl}/hs_medical_receipts_list`, {
    method: "POST",
    headers,
    body: JSON.stringify({ page, limit }),
  });
  if (!res.ok) throw new Error("Failed to fetch receipts");
  const json = await res.json();
  const arr = await decList(json);
  const items: ReceiptListItem[] = arr.map((rc: any) => ({
    id: String(rc.id ?? rc.dispatch_id ?? ""),
    status: String(rc.status ?? "In Transit"),
    requestId: String(rc.requestId ?? rc.request_code ?? rc.request_id ?? ""),
    store: String(rc.store ?? ""),
    dispatchDate: String(rc.dispatchDate ?? rc.dispatched_at ?? ""),
    courier: String(rc.courier ?? ""),
    trackingNumber: String(rc.trackingNumber ?? rc.tracking_no ?? ""),
    items: Array.isArray(rc.items) ? rc.items.map((it: any) => ({
      id: String(it.id ?? ""),
      name: String(it.name ?? ""),
      category: String(it.category ?? ""),
      batchNumber: String(it.batchNumber ?? it.batch_no ?? ""),
      dispatchedQty: Number(it.dispatchedQty ?? it.qty ?? 0) || 0,
      unit: String(it.unit ?? ""),
      expiryDate: String(it.expiryDate ?? it.expiry_date ?? ""),
    })) : [],
  }));
  return { items, total: Number(json.total ?? items.length) || 0, page: Number(json.page ?? page), limit: Number(json.limit ?? limit) };
};

export const confirmReceiptVerification = async (payload: ReceiptConfirmPayload): Promise<{ success: boolean }> => {
  const { apiUrl, headers } = await getAuthHeaders();
  const res = await fetch(`${apiUrl}/hs_medical_receipt_verify`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to confirm receipt verification");
  return res.json();
};