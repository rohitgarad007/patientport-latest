// services/SfstaffRoomService.ts
import Cookies from "js-cookie";
import { configService } from "./configService";
import CryptoJS from "crypto-js";
import { decryptAESFromPHP } from "@/utils/aesDecrypt";

// Types used by StaffasRoomAvailable page
export type StaffWard = {
  id: string;
  wardName: string;
  floorNo?: string;
  wardType?: string;
  capacity?: number;
};

export type StaffRoom = {
  id: string;
  wardId: string;
  roomNumber: string;
  roomType?: string;
  status?: string; // "Available" | "Occupied" | "Reserved" | "Cleaning" or numeric codes mapped later
};

export type StaffBed = {
  id: string;
  wardId: string;
  roomId: string;
  bedNumber: string;
  status: string; // "Available" | "Occupied" | "Reserved" | "Cleaning" or numeric codes mapped later
  lastCleanedDate?: string;
  assignedPatientId?: string;
  admissionUid?: string;
  patientFirstName?: string | null;
  patientLastName?: string | null;
  patientEmail?: string | null;
  patientPhone?: string | null;
  patientDob?: string | null;
  patientGender?: string | null;
  patientBloodGroup?: string | null;
  patientAddress?: string | null;
  docuid?: string | null;
  admitDate?: string | null;
  activityType?: string | null;
  currentStatus?: string | null;
  priority?: string | null;
  medicalNotes?: string | null;
  permissionStatus?: string | null;
};

// -------------------------------
// 🔐 Get Auth Headers + API URL (same pattern as SfstaffUseService)
// -------------------------------
const getAuthHeaders = async () => {
  const token = Cookies.get("token");
  const apiUrl = await configService.getApiUrl();

  if (!token) {
    throw new Error("No authentication token found");
  }

  return {
    apiUrl,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };
};

// -------------------------------
// 🔒 Helper: Encrypt Data Object (same pattern as SfstaffUseService)
// -------------------------------
const encryptData = async (data: Record<string, any>) => {
  const AES_KEY = await configService.getAesSecretKey();
  const encryptedData: Record<string, string> = {};

  for (const key of Object.keys(data)) {
    encryptedData[key] = CryptoJS.AES.encrypt(String(data[key] ?? ""), AES_KEY).toString();
  }

  return encryptedData;
};

// Optional: map numeric status codes to labels if needed
const mapStatusLabel = (val: any): string => {
  const s = String(val ?? "");
  switch (s) {
    case "1":
      return "Available";
    case "2":
      return "Occupied";
    case "3":
      return "Reserved";
    case "4":
      return "Cleaning";
    default:
      return s || "Available";
  }
};

// -------------------------------
// 🏥 Fetch Ward List
// -------------------------------
export const fetchStaffWards = async () => {
  try {
    const { apiUrl, headers } = await getAuthHeaders();
    const AES_KEY = await configService.getAesSecretKey();

    const encryptedPayload = await encryptData({});

    // Endpoint path assumes staff-specific ward list
    const response = await fetch(`${apiUrl}/sf_staff_getWardList`, {
      method: "POST",
      headers,
      body: JSON.stringify(encryptedPayload),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ward list: ${response.statusText}`);
    }

    const json = await response.json();

    if (json.success && json.data) {
      const decrypted = decryptAESFromPHP(json.data, AES_KEY);
      const parsed = decrypted ? JSON.parse(decrypted) : [];
      const wards: StaffWard[] = Array.isArray(parsed)
        ? parsed.map((w: any) => ({
            // Map according to provided response shape
            //id: String(w.warduid ?? w.id ?? w.ward_id ?? ""),
            id: String(w.id ?? w.ward_id ?? ""),
            wardName: String(w.title ?? w.name ?? w.ward_name ?? ""),
            floorNo: String(w.floor_no ?? w.floorNo ?? ""),
            wardType: String(w.ward_type ?? w.type ?? ""),
            capacity: Number(w.capacity ?? 0),
          }))
        : [];
      return { ...json, data: wards };
    }

    return { ...json, data: [] as StaffWard[] };
  } catch (error: any) {
    console.error("Error fetching ward list:", error);
    return {
      success: false,
      message: error.message || "Unexpected error while fetching ward list",
      data: [] as StaffWard[],
    };
  }
};

// -------------------------------
// 🚪 Fetch Room List for a Ward
// -------------------------------
export const fetchStaffRooms = async (wardId: string) => {
  try {
    const { apiUrl, headers } = await getAuthHeaders();
    const AES_KEY = await configService.getAesSecretKey();

    // Backend expects warduid in payload (not ward_id)
    const encryptedPayload = await encryptData({ warduid: wardId });

    const response = await fetch(`${apiUrl}/sf_staff_getRoomList`, {
      method: "POST",
      headers,
      body: JSON.stringify(encryptedPayload),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch room list: ${response.statusText}`);
    }

    const json = await response.json();

    if (json.success && json.data) {
      const decrypted = decryptAESFromPHP(json.data, AES_KEY);
      const parsed = decrypted ? JSON.parse(decrypted) : [];
      const rooms: StaffRoom[] = Array.isArray(parsed)
        ? parsed.map((r: any) => ({
            //id: String(r.roomuid ?? r.id ?? r.room_id ?? ""),
            id: String(r.id ?? r.room_id ?? ""),
            wardId: String(r.warduid ?? r.ward_id ?? wardId),
            roomNumber: String(r.title ?? r.title ?? r.title ?? ""),
            roomType: String(r.room_type ?? r.type ?? ""),
            status: mapStatusLabel(r.status),
          }))
        : [];
      return { ...json, data: rooms };
    }

    return { ...json, data: [] as StaffRoom[] };
  } catch (error: any) {
    console.error("Error fetching room list:", error);
    return {
      success: false,
      message: error.message || "Unexpected error while fetching room list",
      data: [] as StaffRoom[],
    };
  }
};

// -------------------------------
// 🛏️ Fetch Bed List for a Room
// -------------------------------
export const fetchStaffBeds = async (roomId: string) => {
  try {
    const { apiUrl, headers } = await getAuthHeaders();
    const AES_KEY = await configService.getAesSecretKey();

    // Backend expects roomuid in payload (not room_id)
    const encryptedPayload = await encryptData({ roomuid: roomId });

    const response = await fetch(`${apiUrl}/sf_staff_getBedList`, {
      method: "POST",
      headers,
      body: JSON.stringify(encryptedPayload),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch bed list: ${response.statusText}`);
    }

    const json = await response.json();

  if (json.success && json.data) {
    const decrypted = decryptAESFromPHP(json.data, AES_KEY);
    const parsed = decrypted ? JSON.parse(decrypted) : [];
    const beds: StaffBed[] = Array.isArray(parsed)
      ? parsed.map((b: any) => ({
          id: String(b.beduid ?? b.id ?? b.bed_id ?? ""),
          wardId: String(b.warduid ?? b.ward_id ?? ""),
          roomId: String(b.roomuid ?? b.room_id ?? roomId),
          bedNumber: String(b.title ?? b.bed_number ?? ""),
          status: mapStatusLabel(b.status),
          lastCleanedDate: String(b.last_cleaned_date ?? b.lastCleanedDate ?? ""),
          assignedPatientId: b.assigned_patient_id ?? b.patient_id ?? "",
          admissionUid: b.admission_id ?? "",
          patientFirstName: b.patient_fname ?? null,
          patientLastName: b.patient_lname ?? null,
          patientEmail: b.patient_email ?? null,
          patientPhone: b.patient_phone ?? null,
          patientDob: b.patient_dob ?? null,
          patientGender: b.patient_gender ?? null,
          patientBloodGroup: b.patient_blood_group ?? null,
          patientAddress: b.patient_address ?? null,
          docuid: b.doctor_id ?? null,
          admitDate: b.admit_date ?? null,
          activityType: b.activity_type ?? null,
          currentStatus: b.current_status ?? null,
          priority: b.priority ?? null,
          medicalNotes: b.medical_notes ?? null,
          permissionStatus: b.permission_status ?? null,
        }))
      : [];
    return { ...json, data: beds };
  }

    return { ...json, data: [] as StaffBed[] };
  } catch (error: any) {
    console.error("Error fetching bed list:", error);
    return {
      success: false,
      message: error.message || "Unexpected error while fetching bed list",
      data: [] as StaffBed[],
    };
  }
};

// -------------------------------
// 👤 Patient Options (searchable list)
// -------------------------------
export const fetchStaffPatientOptions = async (search = "", page = 1, limit = 8) => {
  try {
    const { apiUrl, headers } = await getAuthHeaders();
    const AES_KEY = await configService.getAesSecretKey();

    // Skip network call for empty/short queries to avoid duplicate/empty payload calls
    const q = String(search || "").trim();
    if (q.length < 2) {
      return { success: true, data: [] };
    }

    // Primary: staff-side searchable endpoint
    const response = await fetch(`${apiUrl}/sf_patients_list_search`, {
      method: "POST",
      headers,
      body: JSON.stringify({ page, limit, search: q }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch patient options: ${response.statusText}`);
    }

    const json = await response.json();

    if (json.success && json.data) {
      const decrypted = decryptAESFromPHP(json.data, AES_KEY);
      const parsed = decrypted ? JSON.parse(decrypted) : [];
      const options = Array.isArray(parsed)
        ? parsed.map((p: any) => ({
            value: String(p.id ?? p.patuid ?? ""),
            label: String(
              (p.name ?? `${p.fname ?? ""} ${p.lname ?? ""}`.trim()) || "Unknown"
            ),
          }))
        : [];
      return { ...json, data: options };
    }

    return { ...json, data: [] };
  } catch (error: any) {
    console.error("Error fetching patient options:", error);
    return {
      success: false,
      message: error.message || "Unexpected error while fetching patient options",
      data: [],
    };
  }
};

// -------------------------------
// 👨‍⚕️ Doctor Options (simple list)
// -------------------------------
export const fetchStaffDoctorOptions = async () => {
  try {
    const { apiUrl, headers } = await getAuthHeaders();
    const AES_KEY = await configService.getAesSecretKey();

    // Use hospital-side lightweight options endpoint
    const response = await fetch(`${apiUrl}/sf_doctors_option_list`, {
      method: "POST",
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch doctor options: ${response.statusText}`);
    }

    const json = await response.json();

    if (json.success && json.data) {
      const decrypted = decryptAESFromPHP(json.data, AES_KEY);
      const parsed = decrypted ? JSON.parse(decrypted) : [];
      const options = Array.isArray(parsed)
        ? parsed.map((d: any) => ({
            value: String(d.id ?? d.doc_id ?? ""),
            label: String(d.doctorName ?? `${d.doctorName ?? ""}`.trim()),
          }))
        : [];
      return { ...json, data: options };
    }

    return { ...json, data: [] };
  } catch (error: any) {
    console.error("Error fetching doctor options:", error);
    return {
      success: false,
      message: error.message || "Unexpected error while fetching doctor options",
      data: [],
    };
  }
};

// -------------------------------
// 🗓️ Activity Type List (staff side)
// -------------------------------

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

export const fetchStaffEventTypeList = async () => {
  try {
    const { apiUrl, headers } = await getAuthHeaders();
    const AES_KEY = await configService.getAesSecretKey();

    const encryptedPayload = await encryptData({});

    const response = await fetch(`${apiUrl}/sf_staff_getEventTypeList`, {
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

// -------------------------------
// 📈 Patient Status Options (staff side, with safe fallback)
// -------------------------------
export const fetchStaffPatientStatusOptions = async () => {
  try {
    const { apiUrl, headers } = await getAuthHeaders();
    const AES_KEY = await configService.getAesSecretKey();

    // If backend provides a staff-side status list, call it; otherwise this will 404
    const encryptedPayload = await encryptData({});

    const response = await fetch(`${apiUrl}/sf_patient_current_status_option_list`, {
      method: "POST",
      headers,
      body: JSON.stringify(encryptedPayload),
    });

    if (response.ok) {
      const json = await response.json();
      if (json.success && json.data) {
        const decrypted = decryptAESFromPHP(json.data, AES_KEY);
        const parsed = decrypted ? JSON.parse(decrypted) : [];
        const options = Array.isArray(parsed)
          ? parsed.map((s: any) => ({ value: String(s.value ?? s.id ?? s.key ?? s), label: String(s.title ?? s.name ?? s) }))
          : [];
        if (options.length) return { ...json, data: options };
      }
    }

    // Fallback to sensible defaults
    const fallback = [
      { value: "Stable", label: "Stable" },
      { value: "Critical", label: "Critical" },
      { value: "Under Observation", label: "Under Observation" },
      { value: "Post-Op", label: "Post-Op" },
      { value: "Recovery", label: "Recovery" },
    ];
    return { success: true, data: fallback };
  } catch (error: any) {
    console.error("Error fetching patient status options:", error);
    const fallback = [
      { value: "Stable", label: "Stable" },
      { value: "Critical", label: "Critical" },
      { value: "Under Observation", label: "Under Observation" },
      { value: "Post-Op", label: "Post-Op" },
      { value: "Recovery", label: "Recovery" },
    ];
    return {
      success: false,
      message: error.message || "Unexpected error while fetching status options",
      data: fallback,
    };
  }
};

// -------------------------------
// ✅ Submit Bed Booking (staff side)
// -------------------------------
export const submitStaffBedBooking = async (payload: {
  patientId: string;
  wardId: string;
  roomId: string;
  bedId: string;
  doctorId: string;
  activityTypeId?: string; // optional: Activity/Event type
  currentStatus?: string;  // optional: Patient current status
  priority?: string;       // optional: URGENT/HIGH/MEDIUM/LOW
  medicalNotes?: string;   // optional: Notes
}) => {
  try {
    const { apiUrl, headers } = await getAuthHeaders();
    const AES_KEY = await configService.getAesSecretKey();

    // Map UI payload → backend expected keys; encrypt everything
    const encryptedPayload = await encryptData({
      patientuid: payload.patientId,
      warduid: payload.wardId,
      roomuid: payload.roomId,
      beduid: payload.bedId,
      docuid: payload.doctorId,
      activityType: payload.activityTypeId ?? "",
      currentStatus: payload.currentStatus ?? "",
      priority: payload.priority ?? "MEDIUM",
      medicalNotes: payload.medicalNotes ?? "",
      action: "book", 
    });

    const response = await fetch(`${apiUrl}/sf_staff_bookBedForPatient`, {
      method: "POST",
      headers,
      body: JSON.stringify(encryptedPayload),
    });

    if (!response.ok) {
      throw new Error(`Failed to submit bed booking: ${response.statusText}`);
    }

    const json = await response.json();

    // Some endpoints return encrypted `data`; safely attempt to decrypt
    let data: any = json?.data ?? null;
    try {
      if (data) {
        const decrypted = decryptAESFromPHP(data, AES_KEY);
        if (decrypted) data = JSON.parse(decrypted);
      }
    } catch (_) {
      // ignore decryption errors; return raw json
    }

    return { ...json, data };
  } catch (error: any) {
    console.error("Error submitting bed booking:", error);
    return {
      success: false,
      message: error.message || "Unexpected error while submitting bed booking",
      data: null,
    };
  }
};

// -------------------------------
// 🔄 Submit Bed Change (staff side)
// -------------------------------
export const submitStaffBedChange = async (payload: {
  patientId: string;
  fromWardId: string;
  fromRoomId: string;
  fromBedId: string;
  toWardId: string;
  toRoomId: string;
  toBedId: string;
  doctorId: string;
  activityTypeId?: string;
  currentStatus?: string;
  priority?: string;
  medicalNotes?: string;
}) => {
  try {
    const { apiUrl, headers } = await getAuthHeaders();
    const AES_KEY = await configService.getAesSecretKey();

    const encryptedPayload = await encryptData({
      patientuid: payload.patientId,
      from_warduid: payload.fromWardId,
      from_roomuid: payload.fromRoomId,
      from_beduid: payload.fromBedId,
      to_warduid: payload.toWardId,
      to_roomuid: payload.toRoomId,
      to_beduid: payload.toBedId,
      docuid: payload.doctorId,
      activityType: payload.activityTypeId ?? "",
      currentStatus: payload.currentStatus ?? "",
      priority: payload.priority ?? "MEDIUM",
      medicalNotes: payload.medicalNotes ?? "",
      action: "change",
    });

    const response = await fetch(`${apiUrl}/sf_staff_changePatientBed`, {
      method: "POST",
      headers,
      body: JSON.stringify(encryptedPayload),
    });

    if (!response.ok) {
      throw new Error(`Failed to submit bed change: ${response.statusText}`);
    }

    const json = await response.json();

    let data: any = json?.data ?? null;
    try {
      if (data) {
        const decrypted = decryptAESFromPHP(data, AES_KEY);
        if (decrypted) data = JSON.parse(decrypted);
      }
    } catch (_) {}

    return { ...json, data };
  } catch (error: any) {
    console.error("Error submitting bed change:", error);
    return {
      success: false,
      message: error.message || "Unexpected error while submitting bed change",
      data: null,
    };
  }
};