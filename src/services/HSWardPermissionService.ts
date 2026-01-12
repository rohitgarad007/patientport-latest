
// services/HSWardPermissionService.ts
import Cookies from "js-cookie";
import { configService } from "./configService";
import { decryptAESFromPHP } from "@/utils/aesDecrypt";
import CryptoJS from "crypto-js";


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

// Types moved from data/bedPermissions for dynamic service usage
export interface BedPermissionRequest {
  id: string;
  activityType: string;
  activityTypeName: string;
  requestedBy: string;
  requestedByRole: string;
  requestDate: string;
  patientId: string;
  patientName: string;
  currentBed: string;
  targetBed: string;
  currentWard: string;
  targetWard: string;
  status: "pending" | "approved" | "declined" | "under-review" | string;
  priority: "low" | "medium" | "high" | "urgent" | string;
  justification: string;
  attachments?: string[];
  reviewedBy?: string;
  reviewedDate?: string;
  declineReason?: string;
}

export interface ApprovalStep {
  id: string;
  requestId: string;
  stepName: string;
  assignedTo: string;
  status: "pending" | "approved" | "declined" | "skipped" | "under-review" | string;
  timestamp?: string;
  notes?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  userRole: string;
  action: string;
  description: string;
  requestId?: string;
}

export interface PatientStay {
  id: string;
  patientId: string;
  name: string;
  age: number;
  gender: string;
  admissionDate: string;
  department: string;
  currentBed: string;
  currentWard: string;
  attendingPhysician: string;
  status: string;
  diagnosis: string;
  condition: string;
}

// Normalizers
const normalizeStatus = (val: any): BedPermissionRequest["status"] => {
  const s = String(val ?? "").toLowerCase();
  if (["approved", "approve", "1"].includes(s)) return "approved";
  if (["declined", "reject", "rejected", "0"].includes(s)) return "declined";
  if (["under-review", "under_review", "review"].includes(s)) return "under-review";
  return "pending";
};

const normalizePriority = (val: any): BedPermissionRequest["priority"] => {
  const p = String(val ?? "").toLowerCase();
  if (["urgent"].includes(p)) return "urgent";
  if (["high"].includes(p)) return "high";
  if (["medium", "med"].includes(p)) return "medium";
  return "low";
};

// Encryption helper
async function encryptPayload(obj: Record<string, any>) {
  const AES_KEY = await configService.getAesSecretKey();
  const text = JSON.stringify(obj);
  const cipher = CryptoJS.AES.encrypt(text, AES_KEY).toString();
  return { data: cipher };
}

const encryptData = async (data: Record<string, any>) => {
  const AES_KEY = await configService.getAesSecretKey();
  const encryptedData: Record<string, string> = {};

  for (const key of Object.keys(data)) {
    encryptedData[key] = CryptoJS.AES.encrypt(String(data[key] ?? ""), AES_KEY).toString();
  }

  return encryptedData;
};

//activityType List get
export const fetchStaffActivityTypeList = async () => {
  try {
    const { apiUrl, headers } = await getAuthHeaders();
    const AES_KEY = await configService.getAesSecretKey();

    const encryptedPayload = await encryptData({});

    const response = await fetch(`${apiUrl}/sf_activity_option_list`, {
      method: "POST",
      headers,
      body: JSON.stringify(encryptedPayload),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch event type list: ${response.statusText}`);
    }

    const json = await response.json();
    if (json.success && json.data) {
      const decrypted = decryptAESFromPHP(json.data, AES_KEY);
      const parsed = decrypted ? JSON.parse(decrypted) : [];
      const options = Array.isArray(parsed)
        ? parsed.map((et: any) => ({ value: String(et.id), label: String(et.name ?? et.title ?? "") }))
        : [];
      return { ...json, data: options };
    }
    return { ...json, data: [] };
  } catch (error: any) {
    console.error("Error fetching event type list:", error);
    return {
      success: false,
      message: error.message || "Unexpected error while fetching event type list",
      data: [],
    };
  }
};

// Fetch: Bed Permission Requests
export const fetchBedPermissionRequests = async (
  page = 1,
  limit = 20,
  search = ""
): Promise<{ success: boolean; data: BedPermissionRequest[] }> => {
  const { apiUrl, headers } = await getAuthHeaders();

  const encryptedPayload = await encryptData({ page, limit, search });
  
  const res = await fetch(`${apiUrl}/hs_bed_permission_requests_list`, {
    method: "POST",
    headers,
    body: JSON.stringify(encryptedPayload),
  });
  if (!res.ok) throw new Error("Failed to fetch bed permission requests");
  const json = await res.json();
  if (json.success && json.data) {
    const AES_KEY = await configService.getAesSecretKey();
    const decrypted = decryptAESFromPHP(json.data, AES_KEY);
    let raw: any[] = [];
    try {
      raw = decrypted ? JSON.parse(decrypted) : [];
      if (!Array.isArray(raw)) raw = [];
    } catch {
      raw = [];
    }
    const mapped: BedPermissionRequest[] = raw.map((it: any) => ({
      id: String(it.id ?? it.req_id ?? it.request_id ?? ""),
      activityType: String(it.activity_type ?? it.type ?? ""),
      activityTypeName: String(it.activity_type_name ?? it.activity_type_name ?? ""),
      requestedBy: String(it.requested_by ?? it.staff_name ?? ""),
      requestedByRole: String(it.requested_by_role ?? it.staff_role ?? ""),
      requestDate: String(it.request_date ?? it.created_on ?? it.created_at ?? new Date().toISOString()),
      patientId: String(it.patient_id ?? it.pid ?? ""),
      patientName: String(it.patient_name ?? it.pname ?? ""),
      currentBed: String(it.current_bed ?? it.from_bed ?? ""),
      targetBed: String(it.target_bed ?? it.to_bed ?? ""),
      currentWard: String(it.current_ward ?? it.from_ward ?? ""),
      targetWard: String(it.target_ward ?? it.to_ward ?? ""),
      status: normalizeStatus(it.status),
      priority: normalizePriority(it.priority),
      justification: String(it.justification ?? it.reason ?? ""),
      attachments: Array.isArray(it.attachments)
        ? it.attachments.map((f: any) => String(f))
        : String(it.attachments ?? "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
      reviewedBy: it.reviewed_by ? String(it.reviewed_by) : undefined,
      reviewedDate: it.reviewed_date ? String(it.reviewed_date) : undefined,
      declineReason: it.decline_reason ? String(it.decline_reason) : undefined,
    }));
    return { success: true, data: mapped };
  }
  return { success: false, data: [] };
};

// Fetch: Approval Steps for a Request
export const fetchBedApprovalSteps = async (
  requestId?: string
): Promise<{ success: boolean; data: ApprovalStep[] }> => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();
  const payload: any = {};
  if (requestId) {
    payload.request_id = CryptoJS.AES.encrypt(String(requestId), AES_KEY).toString();
  }
  const res = await fetch(`${apiUrl}/hs_bed_permission_approval_steps_list`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to fetch approval steps");
  const json = await res.json();
  if (json.success && json.data) {
    const decrypted = decryptAESFromPHP(json.data, AES_KEY);
    let raw: any[] = [];
    try {
      raw = decrypted ? JSON.parse(decrypted) : [];
      if (!Array.isArray(raw)) raw = [];
    } catch {
      raw = [];
    }
    const steps: ApprovalStep[] = raw.map((it: any) => ({
      id: String(it.id ?? it.step_id ?? ""),
      requestId: String(it.request_id ?? it.req_id ?? ""),
      stepName: String(it.step_name ?? it.name ?? ""),
      assignedTo: String(it.assigned_to ?? it.assignee ?? ""),
      status: String(it.status ?? "pending") as ApprovalStep["status"],
      timestamp: it.timestamp ? String(it.timestamp) : undefined,
      notes: it.notes ? String(it.notes) : undefined,
    }));
    return { success: true, data: steps };
  }
  return { success: false, data: [] };
};

// Fetch: Audit Logs
export const fetchBedAuditLogs = async (
  page = 1,
  limit = 50,
  search = ""
): Promise<{ success: boolean; data: AuditLog[] }> => {
  const { apiUrl, headers } = await getAuthHeaders();
  const res = await fetch(`${apiUrl}/hs_bed_permission_audit_logs_list`, {
    method: "POST",
    headers,
    body: JSON.stringify({ page, limit, search }),
  });
  if (!res.ok) throw new Error("Failed to fetch audit logs");
  const json = await res.json();
  if (json.success && json.data) {
    const AES_KEY = await configService.getAesSecretKey();
    const decrypted = decryptAESFromPHP(json.data, AES_KEY);
    let raw: any[] = [];
    try {
      raw = decrypted ? JSON.parse(decrypted) : [];
      if (!Array.isArray(raw)) raw = [];
    } catch {
      raw = [];
    }
    const logs: AuditLog[] = raw.map((it: any) => ({
      id: String(it.id ?? it.log_id ?? ""),
      timestamp: String(it.timestamp ?? it.logged_at ?? new Date().toISOString()),
      user: String(it.user ?? it.username ?? ""),
      userRole: String(it.user_role ?? it.role ?? ""),
      action: String(it.action ?? ""),
      description: String(it.description ?? it.details ?? ""),
      requestId: it.request_id ? String(it.request_id) : undefined,
    }));
    return { success: true, data: logs };
  }
  return { success: false, data: [] };
};

// Fetch: Patient Stays Overview
export const fetchPatientStaysOverview = async (): Promise<{
  success: boolean;
  data: PatientStay[];
}> => {
  const { apiUrl, headers } = await getAuthHeaders();
  const res = await fetch(`${apiUrl}/hs_patient_stays_overview`, {
    method: "POST",
    headers,
    body: JSON.stringify({}),
  });
  if (!res.ok) throw new Error("Failed to fetch patient stays");
  const json = await res.json();
  if (json.success && json.data) {
    const AES_KEY = await configService.getAesSecretKey();
    const decrypted = decryptAESFromPHP(json.data, AES_KEY);
    let raw: any[] = [];
    try {
      raw = decrypted ? JSON.parse(decrypted) : [];
      if (!Array.isArray(raw)) raw = [];
    } catch {
      raw = [];
    }
    const stays: PatientStay[] = raw.map((it: any) => ({
      id: String(it.id ?? it.stay_id ?? ""),
      patientId: String(it.patient_id ?? it.pid ?? ""),
      name: String(it.name ?? it.patient_name ?? ""),
      age: Number(it.age ?? 0),
      gender: String(it.gender ?? ""),
      admissionDate: String(it.admission_date ?? it.admitted_on ?? ""),
      department: String(it.department ?? it.dept_name ?? ""),
      currentBed: String(it.current_bed ?? it.bed_name ?? ""),
      currentWard: String(it.current_ward ?? it.ward_name ?? ""),
      attendingPhysician: String(it.attending_physician ?? it.doctor_name ?? ""),
      status: String(it.status ?? "admitted"),
      diagnosis: String(it.diagnosis ?? ""),
      condition: String(it.condition ?? "stable"),
    }));
    return { success: true, data: stays };
  }
  return { success: false, data: [] };
};

// ---------------------------------------------
// Mutations: Approve / Decline Bed Permission
// ---------------------------------------------
export const approveBedPermission = async (
  requestId: string,
  notes?: string
): Promise<{ success: boolean; message?: string; data?: any }> => {
  try {
    const { apiUrl, headers } = await getAuthHeaders();
    const AES_KEY = await configService.getAesSecretKey();

    const payload = await encryptData({
      request_id: requestId,
      notes: notes ?? "",
    });

    const res = await fetch(`${apiUrl}/hs_bed_permission_request_approve`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Failed to approve bed permission");

    const json = await res.json();
    let data: any = json?.data ?? null;
    try {
      if (data) {
        const decrypted = decryptAESFromPHP(data, AES_KEY);
        if (decrypted) data = JSON.parse(decrypted);
      }
    } catch (_) {}

    return { success: !!json?.success, message: json?.message, data };
  } catch (error: any) {
    console.error("Error approving bed permission:", error);
    return { success: false, message: error.message };
  }
};

export const declineBedPermission = async (
  requestId: string,
  reason: string
): Promise<{ success: boolean; message?: string; data?: any }> => {
  try {
    const { apiUrl, headers } = await getAuthHeaders();
    const AES_KEY = await configService.getAesSecretKey();

    const payload = await encryptData({
      request_id: requestId,
      reason,
    });

    const res = await fetch(`${apiUrl}/hs_bed_permission_request_decline`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Failed to decline bed permission");

    const json = await res.json();
    let data: any = json?.data ?? null;
    try {
      if (data) {
        const decrypted = decryptAESFromPHP(data, AES_KEY);
        if (decrypted) data = JSON.parse(decrypted);
      }
    } catch (_) {}

    return { success: !!json?.success, message: json?.message, data };
  } catch (error: any) {
    console.error("Error declining bed permission:", error);
    return { success: false, message: error.message };
  }
};