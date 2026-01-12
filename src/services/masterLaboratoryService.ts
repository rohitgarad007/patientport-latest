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

export const fetchLaboratories = async (page = 1, limit = 10, search = "") => {
  const { apiUrl, headers } = await getAuthHeaders();
  const res = await fetch(`${apiUrl}master_laboratories_list`, {
    method: "POST",
    headers,
    body: JSON.stringify({ page, limit, search }),
  });
  if (!res.ok) throw new Error("Failed to fetch laboratories");
  const json = await res.json();
  if (json.success && json.data) {
    const AES_KEY = await configService.getAesSecretKey();
    const decrypted = decryptAESFromPHP(json.data, AES_KEY);
    return { ...json, data: decrypted ? JSON.parse(decrypted) : [] };
  }
  return json;
};

export const addLaboratory = async (data: any) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();
  const encryptedData: any = {};
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      encryptedData[key] = CryptoJS.AES.encrypt(String(data[key] ?? ""), AES_KEY).toString();
    }
  }
  const res = await fetch(`${apiUrl}master_laboratories_add`, {
    method: "POST",
    headers,
    body: JSON.stringify(encryptedData),
  });
  if (!res.ok) throw new Error("Failed to add laboratory");
  return res.json();
};

export const updateLaboratory = async (id: string, data: any) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();
  const encryptedData: any = { id };
  for (const key in data) {
    if (data.hasOwnProperty(key) && key !== "email" && key !== "password") {
      encryptedData[key] = CryptoJS.AES.encrypt(String(data[key] ?? ""), AES_KEY).toString();
    }
  }
  const res = await fetch(`${apiUrl}master_laboratories_update`, {
    method: "POST",
    headers,
    body: JSON.stringify(encryptedData),
  });
  if (!res.ok) throw new Error("Failed to update laboratory");
  return res.json();
};

export const changeLaboratoryStatus = async (id: string, status: "active" | "inactive") => {
  const { apiUrl, headers } = await getAuthHeaders();
  const res = await fetch(`${apiUrl}master_laboratories_change_status`, {
    method: "POST",
    headers,
    body: JSON.stringify({ id, status }),
  });
  if (!res.ok) throw new Error("Failed to change laboratory status");
  return res.json();
};

export const deleteLaboratory = async (id: string) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const res = await fetch(`${apiUrl}master_laboratories_delete`, {
    method: "POST",
    headers,
    body: JSON.stringify({ id }),
  });
  if (!res.ok) throw new Error("Failed to delete laboratory");
  return res.json();
};

// Laboratory Staff APIs

export const fetchLaboratoryStaff = async (page = 1, limit = 10, search = "") => {
  const { apiUrl, headers } = await getAuthHeaders();
  const res = await fetch(`${apiUrl}master_laboratories_staff_list`, {
    method: "POST",
    headers,
    body: JSON.stringify({ page, limit, search }),
  });
  if (!res.ok) throw new Error("Failed to fetch laboratory staff");
  const json = await res.json();
  if (json.success && json.data) {
    const AES_KEY = await configService.getAesSecretKey();
    const decrypted = decryptAESFromPHP(json.data, AES_KEY);
    return { ...json, data: decrypted ? JSON.parse(decrypted) : [] };
  }
  return json;
};

export const addLaboratoryStaff = async (data: any) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();
  const encryptedData: any = {};
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      encryptedData[key] = CryptoJS.AES.encrypt(String(data[key] ?? ""), AES_KEY).toString();
    }
  }
  const res = await fetch(`${apiUrl}/master_laboratories_staff_add`, {
    method: "POST",
    headers,
    body: JSON.stringify(encryptedData),
  });
  if (!res.ok) throw new Error("Failed to add laboratory staff");
  return res.json();
};

export const updateLaboratoryStaff = async (data: any) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();
  const encryptedData: any = {};
  if (data.id) {
    encryptedData.id = data.id;
  }
  for (const key in data) {
    if (data.hasOwnProperty(key) && key !== "id") {
      encryptedData[key] = CryptoJS.AES.encrypt(String(data[key] ?? ""), AES_KEY).toString();
    }
  }
  const res = await fetch(`${apiUrl}/master_laboratories_staff_update`, {
    method: "POST",
    headers,
    body: JSON.stringify(encryptedData),
  });
  if (!res.ok) throw new Error("Failed to update laboratory staff");
  return res.json();
};

export const changeLaboratoryStaffStatus = async (id: string, status: "active" | "inactive") => {
  const { apiUrl, headers } = await getAuthHeaders();
  const res = await fetch(`${apiUrl}/master_laboratories_staff_change_status`, {
    method: "POST",
    headers,
    body: JSON.stringify({ id, status }),
  });
  if (!res.ok) throw new Error("Failed to change laboratory staff status");
  return res.json();
};

export const deleteLaboratoryStaff = async (id: string) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const res = await fetch(`${apiUrl}master_laboratories_staff_delete`, {
    method: "POST",
    headers,
    body: JSON.stringify({ id }),
  });
  if (!res.ok) throw new Error("Failed to delete laboratory staff");
  return res.json();
};

export const fetchActiveLaboratories = async () => {
  const { apiUrl, headers } = await getAuthHeaders();
  const res = await fetch(`${apiUrl}master_laboratories_active_list`, {
    method: "GET",
    headers,
  });
  if (!res.ok) throw new Error("Failed to fetch active laboratories");
  return res.json();
};

// Master Lab Test APIs

export const fetchMasterLabTests = async (page = 1, limit = 10, search = "", department = "all", status = "all") => {
  const { apiUrl, headers } = await getAuthHeaders();
  const res = await fetch(`${apiUrl}master_lab_test_list`, {
    method: "POST",
    headers,
    body: JSON.stringify({ page, limit, search, department, status }),
  });
  if (!res.ok) throw new Error("Failed to fetch master lab tests");
  const json = await res.json();
  if (json.success && json.data) {
    const AES_KEY = await configService.getAesSecretKey();
    const decrypted = decryptAESFromPHP(json.data, AES_KEY);
    return { ...json, data: decrypted ? JSON.parse(decrypted) : [] };
  }
  return json;
};

export const getMasterLabTestById = async (id: string) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const res = await fetch(`${apiUrl}master_lab_test_get`, {
    method: "POST",
    headers,
    body: JSON.stringify({ id }),
  });
  if (!res.ok) throw new Error("Failed to fetch master lab test details");
  const json = await res.json();
  if (json.success && json.data) {
    const AES_KEY = await configService.getAesSecretKey();
    const decrypted = decryptAESFromPHP(json.data, AES_KEY);
    return { ...json, data: decrypted ? JSON.parse(decrypted) : null };
  }
  return json;
};

export const addMasterLabTest = async (data: any) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();
  const encryptedPayload = CryptoJS.AES.encrypt(JSON.stringify(data), AES_KEY).toString();
  
  const res = await fetch(`${apiUrl}master_lab_test_add`, {
    method: "POST",
    headers,
    body: JSON.stringify({ encrypted_payload: encryptedPayload }),
  });
  if (!res.ok) throw new Error("Failed to add master lab test");
  return res.json();
};

export const updateMasterLabTest = async (id: string, data: any) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();
  // Ensure ID is in the data payload as required by the backend
  const payload = { ...data, id };
  const encryptedPayload = CryptoJS.AES.encrypt(JSON.stringify(payload), AES_KEY).toString();

  const res = await fetch(`${apiUrl}master_lab_test_update`, {
    method: "POST",
    headers,
    body: JSON.stringify({ encrypted_payload: encryptedPayload }),
  });
  if (!res.ok) throw new Error("Failed to update master lab test");
  return res.json();
};

export const deleteMasterLabTest = async (id: string) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const res = await fetch(`${apiUrl}master_lab_test_delete`, {
    method: "POST",
    headers,
    body: JSON.stringify({ id }),
  });
  if (!res.ok) throw new Error("Failed to delete master lab test");
  return res.json();
};

