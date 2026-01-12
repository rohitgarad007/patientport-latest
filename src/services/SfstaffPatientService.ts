import Cookies from "js-cookie";
import { configService } from "./configService";
import CryptoJS from "crypto-js";
import { decryptAESFromPHP } from "@/utils/aesDecrypt";

export type StaffPatient = {
  patient_uid: string;
  fullname: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dob?: string;
  gender?: string;
  bloodGroup?: string;
  address?: string;
  emergencyContact?: string;
  status?: string | number;
  hospitalName?: string;
};

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

const encryptData = async (data: Record<string, any>) => {
  const AES_KEY = await configService.getAesSecretKey();
  const encryptedData: Record<string, string> = {};
  for (const key of Object.keys(data)) {
    encryptedData[key] = CryptoJS.AES.encrypt(String(data[key] ?? ""), AES_KEY).toString();
  }
  return encryptedData;
};

export const fetchStaffPatients = async (
  page = 1,
  limit = 10,
  search = ""
) => {
  try {
    const { apiUrl, headers } = await getAuthHeaders();
    const AES_KEY = await configService.getAesSecretKey();

    const payload = await encryptData({ page, limit, search });

    const res = await fetch(`${apiUrl}/sf_staff_getPatientList`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Failed to fetch staff patient list");

    const json = await res.json();

    if (json.success && json.data) {
      const decrypted = decryptAESFromPHP(json.data, AES_KEY);
      const parsed = decrypted ? JSON.parse(decrypted) : { items: [], total: 0 };

      const items: StaffPatient[] = Array.isArray(parsed.items)
        ? parsed.items.map((p: any) => ({
            patient_uid: String(p.patient_uid ?? p.id ?? ""),
            // Backfill full name and individual fields from common backend keys
            firstName: String(p.firstName ?? p.fname ?? ""),
            lastName: String(p.lastName ?? p.lname ?? ""),
            fullname: String(
              p.fullname ?? `${p.firstName ?? p.fname ?? ""} ${p.lastName ?? p.lname ?? ""}`.trim()
            ),
            email: p.email ?? "",
            phone: p.phone ?? "",
            dob: p.dob ?? "",
            gender: p.gender ?? "",
            bloodGroup: p.bloodGroup ?? p.blood_group ?? "",
            address: p.address ?? "",
            emergencyContact: p.emergencyContact ?? p.emergency_contact ?? "",
            status: p.status ?? "",
            hospitalName: p.hospitalName ?? "",
          }))
        : [];

      return { success: true, data: items, total: Number(parsed.total ?? items.length) };
    }

    return { success: false, data: [], total: 0 };
  } catch (error: any) {
    console.error("Error fetching staff patient list:", error);
    return { success: false, data: [], total: 0, message: error.message };
  }
};

// Add new patient under staff's hospital
export const addStaffPatient = async (data: any) => {
  try {
    const { apiUrl, headers } = await getAuthHeaders();
    const encrypted = await encryptData(data);
    const res = await fetch(`${apiUrl}/sf_staff_patients_add`, {
      method: "POST",
      headers,
      body: JSON.stringify(encrypted),
    });
    if (!res.ok) throw new Error("Failed to add patient (staff)");
    return await res.json();
  } catch (error: any) {
    console.error("Error adding staff patient:", error);
    throw error;
  }
};

// Update existing patient (by uid) under staff's hospital
export const updateStaffPatient = async (id: string, data: any) => {
  try {
    const { apiUrl, headers } = await getAuthHeaders();
    const AES_KEY = await configService.getAesSecretKey();
    const encrypted: Record<string, string> = {
      id: CryptoJS.AES.encrypt(String(id), AES_KEY).toString(),
    };
    for (const key of Object.keys(data)) {
      if (key !== "email") {
        encrypted[key] = CryptoJS.AES.encrypt(String(data[key] ?? ""), AES_KEY).toString();
      }
    }
    const res = await fetch(`${apiUrl}/sf_staff_patients_update`, {
      method: "POST",
      headers,
      body: JSON.stringify(encrypted),
    });
    if (!res.ok) throw new Error("Failed to update patient (staff)");
    return await res.json();
  } catch (error: any) {
    console.error("Error updating staff patient:", error);
    throw error;
  }
};

// Change patient status (active/inactive)
export const changeStaffPatientStatus = async (id: string, status: number | string) => {
  try {
    const { apiUrl, headers } = await getAuthHeaders();
    const AES_KEY = await configService.getAesSecretKey();
    const statusLabel = typeof status === "number" ? (status === 1 ? "active" : "inactive") : String(status);
    const encrypted = {
      id: CryptoJS.AES.encrypt(String(id), AES_KEY).toString(),
      status: CryptoJS.AES.encrypt(statusLabel, AES_KEY).toString(),
    };
    const res = await fetch(`${apiUrl}/sf_staff_patients_change_status`, {
      method: "POST",
      headers,
      body: JSON.stringify(encrypted),
    });
    if (!res.ok) throw new Error("Failed to change patient status (staff)");
    return await res.json();
  } catch (error: any) {
    console.error("Error changing staff patient status:", error);
    throw error;
  }
};

// Soft-delete patient
export const deleteStaffPatient = async (id: string) => {
  try {
    const { apiUrl, headers } = await getAuthHeaders();
    const AES_KEY = await configService.getAesSecretKey();
    const encrypted = {
      id: CryptoJS.AES.encrypt(String(id), AES_KEY).toString(),
    };
    const res = await fetch(`${apiUrl}/sf_staff_patients_delete`, {
      method: "POST",
      headers,
      body: JSON.stringify(encrypted),
    });
    if (!res.ok) throw new Error("Failed to delete patient (staff)");
    return await res.json();
  } catch (error: any) {
    console.error("Error deleting staff patient:", error);
    throw error;
  }
};
