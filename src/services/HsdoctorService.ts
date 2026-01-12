// services/HsdoctorService.ts
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

// ======================
// Doctor CRUD operations
// ======================

// ✅ Fetch doctors with pagination & filters
export const fetchDoctors = async (
  page = 1,
  limit = 10,
  search = "",
  specialization = ""
) => {
  const { apiUrl, headers } = await getAuthHeaders();

  const res = await fetch(`${apiUrl}/hs_doctors_list`, {
    method: "POST",
    headers,
    body: JSON.stringify({ page, limit, search, specialization }),
  });

  if (!res.ok) throw new Error("Failed to fetch doctors");
  //return res.json();

  const json = await res.json();

  if (json.success && json.data) {
    // Fetch AES key **here**
    const AES_KEY = await configService.getAesSecretKey();

    // Decrypt the data array
    const decrypted = decryptAESFromPHP(json.data, AES_KEY);
    return { ...json, data: decrypted ? JSON.parse(decrypted) : [] };
  }

  return json;
};

export const fetchDoctorList = async () => {
  const { apiUrl, headers } = await getAuthHeaders();

  const res = await fetch(`${apiUrl}/hs_doctorsopt_list`, {
    method: "POST",
    headers, // ✅ only token header, no body params
  });

  if (!res.ok) throw new Error("Failed to fetch doctors");

  const json = await res.json();

  if (json.success && json.data) {
    const AES_KEY = await configService.getAesSecretKey();

    // ✅ Decrypt the array
    const decrypted = decryptAESFromPHP(json.data, AES_KEY);
    return { ...json, data: decrypted ? JSON.parse(decrypted) : [] };
  }

  return { ...json, data: [] };
};

// ✅ Fetch Doctor Access (with encrypted payload)
export const fetchDoctorAccess = async (docuid: string) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  // Encrypt docuid
  const encryptedData = {
    docuid: CryptoJS.AES.encrypt(String(docuid), AES_KEY).toString(),
  };

  const res = await fetch(`${apiUrl}/hs_doctor_access_get`, {
    method: "POST",
    headers,
    body: JSON.stringify(encryptedData),
  });

  if (!res.ok) throw new Error("Failed to fetch doctor access");

  const json = await res.json();

  if (json.success && json.data) {
    const decrypted = decryptAESFromPHP(json.data, AES_KEY);
    return { ...json, data: decrypted ? JSON.parse(decrypted) : {} };
  }

  return { ...json, data: {} };
};

// HsdoctorService.ts
export const updateDoctorAccess = async (docuid: string, permissions: any) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  // Encrypt docuid
  const encryptedData: any = {
    docuid: CryptoJS.AES.encrypt(String(docuid), AES_KEY).toString(),
  };

  // Encrypt permissions
  for (const key in permissions) {
    encryptedData[key] = CryptoJS.AES.encrypt(
      String(permissions[key]),
      AES_KEY
    ).toString();
  }

  const res = await fetch(`${apiUrl}/hs_doctor_access_update`, {
    method: "POST",
    headers,
    body: JSON.stringify(encryptedData),
  });

  if (!res.ok) throw new Error("Failed to update doctor access");
  return res.json();
};




// ✅ Add doctor
export const addDoctor = async (data: any) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();
  const encryptedData: any = {};
  for (const key in data) {
    if (data.hasOwnProperty(key) && key !== "profileImageFile") {
      encryptedData[key] = CryptoJS.AES.encrypt(
        String(data[key] ?? ""),
        AES_KEY
      ).toString();
    }
  }

  const hasFile = data && data.profileImageFile instanceof File;
  let res: Response;
  if (hasFile) {
    const fd = new FormData();
    Object.keys(encryptedData).forEach((k) => fd.append(k, encryptedData[k]));
    fd.append("profile_image", data.profileImageFile);
    const authOnlyHeaders: any = { Authorization: headers.Authorization };
    res = await fetch(`${apiUrl}/hs_doctors_add`, {
      method: "POST",
      headers: authOnlyHeaders,
      body: fd,
    });
  } else {
    res = await fetch(`${apiUrl}/hs_doctors_add`, {
      method: "POST",
      headers,
      body: JSON.stringify(encryptedData),
    });
  }

  if (!res.ok) throw new Error("Failed to add doctor");
  return res.json();

};

// ✅ Update doctor
export const updateDoctor = async (id: string, data: any) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  

  const encryptedData: any = { id }; // Keep ID unencrypted if backend expects it unencrypted
  

  for (const key in data) {
    if (data.hasOwnProperty(key) && key !== "email" && key !== "password" && key !== "profileImageFile") {
      encryptedData[key] = CryptoJS.AES.encrypt(
        String(data[key] ?? ""),
        AES_KEY
      ).toString();
    }
  }
  
  const hasFile = data && data.profileImageFile instanceof File;
  let res: Response;
  if (hasFile) {
    const fd = new FormData();
    Object.keys(encryptedData).forEach((k) => fd.append(k, (encryptedData as any)[k]));
    fd.append("profile_image", data.profileImageFile);
    const authOnlyHeaders: any = { Authorization: headers.Authorization };
    res = await fetch(`${apiUrl}/hs_doctors_update`, {
      method: "POST",
      headers: authOnlyHeaders,
      body: fd,
    });
  } else {
    res = await fetch(`${apiUrl}/hs_doctors_update`, {
      method: "POST",
      headers,
      body: JSON.stringify(encryptedData),
    });
  }

  if (!res.ok) throw new Error("Failed to update doctor");
  return res.json();

};

// ✅ Get doctor details
export const getDoctorById = async (id: string) => {
  const { apiUrl, headers } = await getAuthHeaders();

  const res = await fetch(`${apiUrl}/ms_doctors_details`, {
    method: "POST",
    headers,
    body: JSON.stringify({ id }),
  });

  if (!res.ok) throw new Error("Failed to fetch doctor details");
  return res.json();
};

// ✅ Change doctor status
export const changeDoctorStatus = async (
  id: string,
  status: string
) => {
  const { apiUrl, headers } = await getAuthHeaders();

  const res = await fetch(`${apiUrl}/hs_doctors_change_status`, {
    method: "POST",
    headers,
    body: JSON.stringify({ id, status }),
  });

  if (!res.ok) throw new Error("Failed to change doctor status");
  return res.json();
};

// ✅ Delete doctor
export const deleteDoctor = async (id: string) => {
  const { apiUrl, headers } = await getAuthHeaders();

  const res = await fetch(`${apiUrl}/hs_doctors_delete`, {
    method: "POST",
    headers,
    body: JSON.stringify({ id }),
  });

  if (!res.ok) throw new Error("Failed to delete doctor");
  return res.json();
};

// ======================
// Doctor Common Lookups
// ======================

// ✅ Get all doctor specializations
export const getDoctorSpecializations = async () => {
  const { apiUrl, headers } = await getAuthHeaders();

  const res = await fetch(`${apiUrl}/ms_doctor_specializations`, {
    method: "POST",
    headers,
    body: JSON.stringify({}),
  });

  if (!res.ok) throw new Error("Failed to fetch doctor specializations");
  return res.json();
};

// ✅ Get all doctor qualifications
export const getDoctorQualifications = async () => {
  const { apiUrl, headers } = await getAuthHeaders();

  const res = await fetch(`${apiUrl}/ms_doctor_qualifications`, {
    method: "POST",
    headers,
    body: JSON.stringify({}),
  });

  if (!res.ok) throw new Error("Failed to fetch doctor qualifications");
  return res.json();
};

// ✅ Get doctor availability slots
export const getDoctorAvailabilitySlots = async () => {
  const { apiUrl, headers } = await getAuthHeaders();

  const res = await fetch(`${apiUrl}/ms_doctor_availability_slots`, {
    method: "POST",
    headers,
    body: JSON.stringify({}),
  });

  if (!res.ok) throw new Error("Failed to fetch availability slots");
  return res.json();
};
