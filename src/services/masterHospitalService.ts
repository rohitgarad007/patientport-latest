// services/hospitalService.ts
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

// ✅ Fetch hospitals with pagination & search (POST with body)
export const fetchHospitals = async (page = 1, limit = 10, search = "") => {
  const { apiUrl, headers } = await getAuthHeaders();

  const res = await fetch(`${apiUrl}/master_hospitals_list`, {
    method: "POST",
    headers,
    body: JSON.stringify({ page, limit, search }),
  });

  if (!res.ok) throw new Error("Failed to fetch hospitals");
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



/*// ✅ Add hospital
export const addHospital = async (data: any) => {
  const { apiUrl, headers } = await getAuthHeaders();

  const res = await fetch(`${apiUrl}/master_hospitals_add`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to add hospital");
  return res.json();
};*/

// ✅ Add hospital (with encryption)
export const addHospital = async (data: any) => {
  const { apiUrl, headers } = await getAuthHeaders();
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

  const res = await fetch(`${apiUrl}/master_hospitals_add`, {
    method: "POST",
    headers,
    body: JSON.stringify(encryptedData),
  });

  if (!res.ok) throw new Error("Failed to add hospital");
  return res.json();
};


/*// ✅ Edit hospital
export const updateHospital = async (id: string, data: any) => {
  const { apiUrl, headers } = await getAuthHeaders();

  const res = await fetch(`${apiUrl}/master_hospitals_update`, {
    method: "POST",
    headers,
    body: JSON.stringify({ id, ...data }),
  });

  if (!res.ok) throw new Error("Failed to update hospital");
  return res.json();
};*/

// ✅ Edit hospital (with encryption & skip email/password)
export const updateHospital = async (id: string, data: any) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  const encryptedData: any = { id };

  for (const key in data) {
    if (data.hasOwnProperty(key) && key !== "email" && key !== "password") {
      encryptedData[key] = CryptoJS.AES.encrypt(
        String(data[key] ?? ""),
        AES_KEY
      ).toString();
    }
  }

  const res = await fetch(`${apiUrl}/master_hospitals_update`, {
    method: "POST",
    headers,
    body: JSON.stringify(encryptedData),
  });

  if (!res.ok) throw new Error("Failed to update hospital");
  return res.json();
};


// ✅ View hospital details
export const getHospitalById = async (id: string) => {
  const { apiUrl, headers } = await getAuthHeaders();

  const res = await fetch(`${apiUrl}/master_hospitals_details`, {
    method: "POST",
    headers,
    body: JSON.stringify({ id }),
  });

  if (!res.ok) throw new Error("Failed to fetch hospital details");
  return res.json();
};

// ✅ Change status (active/inactive)
export const changeHospitalStatus = async (
  id: string,
  status: "active" | "inactive"
) => {
  const { apiUrl, headers } = await getAuthHeaders();

  const res = await fetch(`${apiUrl}/master_hospitals_change_status`, {
    method: "POST",
    headers,
    body: JSON.stringify({ id, status }),
  });

  if (!res.ok) throw new Error("Failed to change hospital status");
  return res.json();
};

// ✅ Delete hospital
export const deleteHospital = async (id: string) => {
  const { apiUrl, headers } = await getAuthHeaders();

  const res = await fetch(`${apiUrl}/master_hospitals_delete`, {
    method: "POST",
    headers,
    body: JSON.stringify({ id }),
  });

  if (!res.ok) throw new Error("Failed to delete hospital");
  return res.json();
};
