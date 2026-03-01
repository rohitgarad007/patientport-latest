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

  const res = await fetch(`${apiUrl}/hs_staff_list`, {
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

export const fetchStaffList = async () => {
  const { apiUrl, headers } = await getAuthHeaders();

  const res = await fetch(`${apiUrl}/hs_staffopt_list`, {
    method: "POST",
    headers,
  });

  if (!res.ok) throw new Error("Failed to fetch staff");

  const json = await res.json();

  if (json.success && json.data) {
    const AES_KEY = await configService.getAesSecretKey();
    const decrypted = decryptAESFromPHP(json.data, AES_KEY);
    return { ...json, data: decrypted ? JSON.parse(decrypted) : [] };
  }

  return { ...json, data: [] };
};

// ✅ Staff Access Fetcher (with encrypted payload)
export const fetchStaffAccess = async (staff_uid: string) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  // Encrypt staff_uid
  const encryptedData = {
    staff_uid: CryptoJS.AES.encrypt(String(staff_uid), AES_KEY).toString(),
  };

  const res = await fetch(`${apiUrl}/hs_staff_access_get`, {
    method: "POST",
    headers,
    body: JSON.stringify(encryptedData),
  });

  if (!res.ok) throw new Error("Failed to fetch staff access");

  const json = await res.json();

  if (json.success && json.data) {
    const decrypted = decryptAESFromPHP(json.data, AES_KEY);
    return { ...json, data: decrypted ? JSON.parse(decrypted) : {} };
  }

  return { ...json, data: {} };
};

// ======================
// Staff Profile Operations
// ======================

export interface StaffProfile {
  staff_uid?: string;
  name: string;
  email: string;
  phone: string;
  profile_image: string;
  gender: string;
  specialization: string;
  role: string;
  role_name?: string; // Display only
  department: string;
  department_name?: string; // Display only
  experience_years: string;
  experience_months: string;
  screen_lock_pin?: string;
  screen_sleep_time?: string;

  // For updates
  current_password?: string;
  new_password?: string;
  confirm_password?: string; // Frontend use
}

export const fetchStaffProfile = async (): Promise<StaffProfile | null> => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  try {
    const response = await fetch(`${apiUrl}/staff_profile_get`, {
      method: "GET",
      headers,
    });

    if (!response.ok) throw new Error("Failed to fetch staff profile");
    const result = await response.json();

    if (result.status && result.data) {
      const decryptedJson = decryptAESFromPHP(result.data, AES_KEY);
      if (decryptedJson) {
        const profile = JSON.parse(decryptedJson);

        // Prepend API URL to profile_image if it's a relative path (not base64 and not http)
        if (
          profile.profile_image &&
          !profile.profile_image.startsWith("data:") &&
          !profile.profile_image.startsWith("http")
        ) {
          const baseUrl = apiUrl.endsWith("/") ? apiUrl : apiUrl + "/";
          profile.profile_image = `${baseUrl}${profile.profile_image}`;
        }
        return profile;
      }
    }
    return null;
  } catch (error) {
    console.error("Error fetching staff profile:", error);
    return null;
  }
};

export const updateStaffProfile = async (
  data: Partial<StaffProfile>,
  imageFile?: File
): Promise<{ status: boolean; message: string }> => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();
  const { "Content-Type": _, ...headersWithoutContentType } = headers; // Remove Content-Type for FormData

  try {
    const { encryptAESForPHP } = await import("@/utils/aesDecrypt");
    
    const encryptedData = encryptAESForPHP(JSON.stringify(data), AES_KEY);

    const formData = new FormData();
    formData.append("data", encryptedData);

    if (imageFile) {
      formData.append("profile_image", imageFile);
    }

    const response = await fetch(`${apiUrl}/staff_profile_update`, {
      method: "POST",
      headers: headersWithoutContentType,
      body: formData,
    });

    if (!response.ok) throw new Error("Failed to update profile");
    return await response.json();
  } catch (error) {
    console.error("Error updating profile:", error);
    return { status: false, message: "Failed to update profile" };
  }
};

export const changeStaffPassword = async (
  data: { currentPassword: string; newPassword: string }
): Promise<{ status: boolean; message: string }> => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();
  const { encryptAESForPHP } = await import("@/utils/aesDecrypt");

  try {
    const encryptedData = encryptAESForPHP(JSON.stringify(data), AES_KEY);

    const response = await fetch(`${apiUrl}/staff_profile_change_password`, {
      method: "POST",
      headers,
      body: JSON.stringify({ data: encryptedData }),
    });

    if (!response.ok) throw new Error("Failed to change password");
    return await response.json();
  } catch (error) {
    console.error("Error changing password:", error);
    return { status: false, message: "Failed to change password" };
  }
};

export const updateStaffAccess = async (staff_uid: string, permissions: any) => {

  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  // Encrypt staff_uid
  const encryptedData: any = {
    staff_uid: CryptoJS.AES.encrypt(String(staff_uid), AES_KEY).toString(),
  };

  // Encrypt permissions
  for (const key in permissions) {
    encryptedData[key] = CryptoJS.AES.encrypt(
      String(permissions[key]),
      AES_KEY
    ).toString();
  }

  const res = await fetch(`${apiUrl}/hs_staff_access_update`, {
    method: "POST",
    headers,
    body: JSON.stringify(encryptedData),
  });

  if (!res.ok) throw new Error("Failed to update staff access");
  return res.json();
};


// ✅ Add staff
export const addStaff = async (data: any) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const encryptedData = await encryptData(data);

  const res = await fetch(`${apiUrl}/hs_staff_add`, {
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

  const res = await fetch(`${apiUrl}/hs_staff_update`, {
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
  const json = await res.json();

  if (json.success && json.data) {
    const AES_KEY = await configService.getAesSecretKey();
    const decrypted = decryptAESFromPHP(json.data, AES_KEY);
    return { ...json, data: decrypted ? JSON.parse(decrypted) : {} };
  }

  return json;
};

// ✅ Fetch Staff Permissions
export const fetchStaffPermissions = async () => {
   // Implementation to be restored or updated
   return [];
};

// ✅ Delete staff
export const deleteStaff = async (id: string) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const encryptedData = await encryptData({ id });

  const res = await fetch(`${apiUrl}/hs_staff_delete`, {
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

  const res = await fetch(`${apiUrl}/hs_staff_change_status`, {
    method: "POST",
    headers,
    body: JSON.stringify({ id, status }),
  });

  if (!res.ok) throw new Error("Failed to change doctor status");
  return res.json();
};


