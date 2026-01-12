// services/staffService.ts
import Cookies from "js-cookie";
import { configService } from "./configService";
import CryptoJS from "crypto-js";
import { decryptAESFromPHP } from "@/utils/aesDecrypt";

// -------------------
// Auth & headers
// -------------------
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

// -------------------
// Helper: Encrypt data
// -------------------
const encryptData = async (data: any) => {
  const AES_KEY = await configService.getAesSecretKey();
  const encryptedData: any = {};
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      encryptedData[key] = CryptoJS.AES.encrypt(
        String(data[key] ?? ""),
        AES_KEY
      ).toString();
    }
  }
  return encryptedData;
};

// ======================
// Staff CRUD operations
// ======================

// ✅ Fetch staff list (paginated, filters)
export const fetchStaff = async (
  page = 1,
  limit = 10,
  search = "",
  role = "",
  hospitalId = ""
) => {
  const { apiUrl, headers } = await getAuthHeaders();

  const res = await fetch(`${apiUrl}/ms_staff_list`, {
    method: "POST",
    headers,
    body: JSON.stringify({ page, limit, search, role, hospitalId }),
  });

  if (!res.ok) throw new Error("Failed to fetch staff");
  const json = await res.json();

  if (json.success && json.data) {
    const AES_KEY = await configService.getAesSecretKey();
    const decrypted = decryptAESFromPHP(json.data, AES_KEY);
    return { ...json, data: decrypted ? JSON.parse(decrypted) : [] };
  }

  return json;
};

// ✅ Add staff
export const addStaff = async (data: any) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const encryptedData = await encryptData(data);

  const res = await fetch(`${apiUrl}/ms_staff_add`, {
    method: "POST",
    headers,
    body: JSON.stringify(encryptedData),
  });

  if (!res.ok) throw new Error("Failed to add staff");
  return res.json();
};

export const updateStaff = async (id: string, data: any) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  const encryptedData: any = {};

  // Encrypt all fields including ID, except email and password
  const payload = { id, ...data };
  for (const key in payload) {
    if (payload.hasOwnProperty(key) && key !== "email" && key !== "password") {
      encryptedData[key] = CryptoJS.AES.encrypt(
        String(payload[key] ?? ""),
        AES_KEY
      ).toString();
    }
  }

  const res = await fetch(`${apiUrl}/ms_staff_update`, {
    method: "POST",
    headers,
    body: JSON.stringify(encryptedData),
  });

  if (!res.ok) throw new Error("Failed to update staff");
  return res.json();
};

// ✅ Get staff details by ID
export const getStaffById = async (id: string) => {
  const { apiUrl, headers } = await getAuthHeaders();

  const res = await fetch(`${apiUrl}/ms_staff_details`, {
    method: "POST",
    headers,
    body: JSON.stringify({ id }),
  });

  if (!res.ok) throw new Error("Failed to fetch staff details");
  return res.json();
};

// ✅ Delete staff
export const deleteStaff = async (id: string) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const encryptedData = await encryptData({ id });

  const res = await fetch(`${apiUrl}/ms_staff_delete`, {
    method: "POST",
    headers,
    body: JSON.stringify({ id }),
  });

  if (!res.ok) throw new Error("Failed to delete staff");
  return res.json();
};

// ======================
// Staff Lookup: Roles & Departments
// ======================

// ✅ Get staff roles
export const getStaffRoles = async () => {
  const { apiUrl, headers } = await getAuthHeaders();
  const encryptedBody = await encryptData({}); // empty object encrypted

  const res = await fetch(`${apiUrl}/ms_staff_roles`, {
    method: "POST",
    headers,
    body: JSON.stringify(encryptedBody),
  });

  if (!res.ok) throw new Error("Failed to fetch roles");
  return res.json();
};

// ✅ Get staff departments
export const getStaffDepartments = async () => {
  const { apiUrl, headers } = await getAuthHeaders();
  const encryptedBody = await encryptData({}); // empty object encrypted

  const res = await fetch(`${apiUrl}/ms_staff_departments`, {
    method: "POST",
    headers,
    body: JSON.stringify(encryptedBody),
  });

  if (!res.ok) throw new Error("Failed to fetch departments");
  return res.json();
};


// ✅ Change staff status
export const changeStaffStatus = async (
  id: string,
  status: string
) => {
  const { apiUrl, headers } = await getAuthHeaders();

  const res = await fetch(`${apiUrl}/ms_staff_change_status`, {
    method: "POST",
    headers,
    body: JSON.stringify({ id, status }),
  });

  if (!res.ok) throw new Error("Failed to change doctor status");
  return res.json();
};

let cachedPermissions: string[] | null = null;
let fetchPromise: Promise<string[]> | null = null;

export const fetchStaffPermissions = async (forceRefresh = false) => {
  if (cachedPermissions && !forceRefresh) return cachedPermissions;

  if (fetchPromise && !forceRefresh) return fetchPromise; // return the ongoing promise

  fetchPromise = (async () => {
    try {
      const token = Cookies.get("token");
      if (!token) throw new Error("No auth token found");

      const { apiUrl, headers } = await getAuthHeaders();

      const res = await fetch(`${apiUrl}/sf_staff_permissions`, {
        method: "POST",
        headers,
        body: JSON.stringify({}),
      });

      if (!res.ok) throw new Error("Failed to fetch staff permissions");

      const json = await res.json();
      let permissions: string[] = [];

      if (json.success && json.data) {
        const AES_KEY = await configService.getAesSecretKey();
        const decrypted = decryptAESFromPHP(json.data, AES_KEY);
        permissions = decrypted ? JSON.parse(decrypted) : [];
      }

      cachedPermissions = permissions;
      return permissions;
    } catch (err) {
      console.error("fetchStaffPermissions error:", err);
      cachedPermissions = [];
      return [];
    } finally {
      fetchPromise = null; // clear the promise so future calls can retry if needed
    }
  })();

  return fetchPromise;
};


