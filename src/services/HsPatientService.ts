// services/PatientService.ts
import Cookies from "js-cookie";
import { configService } from "./configService";
import { decryptAESFromPHP } from "@/utils/aesDecrypt";
import CryptoJS from "crypto-js";

const getAuthHeaders = async () => {
  const token = Cookies.get("token");
  const apiUrl = await configService.getApiUrl();
  if (!token) throw new Error("No auth token found");
  return { apiUrl, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } };
};

// ======================
// Patient CRUD operations
// ======================

export const fetchPatients = async (page = 1, limit = 10, search = "") => {
  const { apiUrl, headers } = await getAuthHeaders();
  const res = await fetch(`${apiUrl}hs_patients_list`, {
    method: "POST",
    headers,
    body: JSON.stringify({ page, limit, search }),
  });
  if (!res.ok) throw new Error("Failed to fetch patients");
  const json = await res.json();

  if (json.success && json.data) {
    const AES_KEY = await configService.getAesSecretKey();
    const decrypted = decryptAESFromPHP(json.data, AES_KEY);
    return { ...json, data: decrypted ? JSON.parse(decrypted) : [] };
  }
  return json;
};

export const addPatient = async (data: any) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();
  const encryptedData: any = {};
  for (const key in data) encryptedData[key] = CryptoJS.AES.encrypt(String(data[key] ?? ""), AES_KEY).toString();
  const res = await fetch(`${apiUrl}hs_patients_add`, { method: "POST", headers, body: JSON.stringify(encryptedData) });
  if (!res.ok) throw new Error("Failed to add patient");
  return res.json();
};

/*export const updatePatient = async (id: string, data: any) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();
  const encryptedData: any = { id };
  for (const key in data) if (data.hasOwnProperty(key)) encryptedData[key] = CryptoJS.AES.encrypt(String(data[key] ?? ""), AES_KEY).toString();
  const res = await fetch(`${apiUrl}hs_patients_update`, { method: "POST", headers, body: JSON.stringify(encryptedData) });
  if (!res.ok) throw new Error("Failed to update patient");
  return res.json();
};*/

export const updatePatient = async (id: string, data: any) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  // Encrypt all fields including id, except email
  const encryptedData: any = {};
  encryptedData.id = CryptoJS.AES.encrypt(String(id), AES_KEY).toString();

  for (const key in data) {
    if (data.hasOwnProperty(key) && key !== "email") {
      encryptedData[key] = CryptoJS.AES.encrypt(String(data[key] ?? ""), AES_KEY).toString();
    }
  }

  const res = await fetch(`${apiUrl}hs_patients_update`, {
    method: "POST",
    headers,
    body: JSON.stringify(encryptedData),
  });

  if (!res.ok) throw new Error("Failed to update patient");

  return res.json();
};

export const getPatientDetails = async (id: string) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();
  const encryptedId = CryptoJS.AES.encrypt(String(id), AES_KEY).toString();
  
  const res = await fetch(`${apiUrl}/hs_patients_details`, { 
    method: "POST", 
    headers, 
    body: JSON.stringify({ id: encryptedId }) 
  });
  
  if (!res.ok) throw new Error("Failed to fetch patient details");
  const json = await res.json();

  if (json.success && json.data) {
    const decrypted = decryptAESFromPHP(json.data, AES_KEY);
    return { ...json, data: decrypted ? JSON.parse(decrypted) : null };
  }
  return json;
};

export const changePatientStatus = async (id: string, status: string) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  // Encrypt both id and status
  const encryptedData = {
    id: CryptoJS.AES.encrypt(String(id), AES_KEY).toString(),
    status: CryptoJS.AES.encrypt(String(status), AES_KEY).toString(),
  };

  const res = await fetch(`${apiUrl}ms_patients_change_status`, {
    method: "POST",
    headers,
    body: JSON.stringify(encryptedData),
  });

  if (!res.ok) throw new Error("Failed to change patient status");

  return res.json();
};

export const deletePatient = async (id: string) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  // Encrypt both id and status
  const encryptedData = {
    id: CryptoJS.AES.encrypt(String(id), AES_KEY).toString(),
  };

  const res = await fetch(`${apiUrl}hs_patients_change_status`, {
    method: "POST",
    headers,
    body: JSON.stringify(encryptedData),
  });

  if (!res.ok) throw new Error("Failed to change patient status");

  return res.json();
};

export const getPatientVisitHistory = async (id: string) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();
  const encryptedId = CryptoJS.AES.encrypt(String(id), AES_KEY).toString();

  const res = await fetch(`${apiUrl}hs_patients_visit_history`, {
    method: "POST",
    headers,
    body: JSON.stringify({ id: encryptedId }),
  });

  if (!res.ok) throw new Error("Failed to fetch visit history");
  const json = await res.json();

  if (json.success && json.data) {
    const decrypted = decryptAESFromPHP(json.data, AES_KEY);
    return { ...json, data: decrypted ? JSON.parse(decrypted) : [] };
  }
  return json;
};

export const getTreatment = async (id: string) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();
  const encryptedId = CryptoJS.AES.encrypt(String(id), AES_KEY).toString();

  const res = await fetch(`${apiUrl}hs_patients_treatment_details`, {
    method: "POST",
    headers,
    body: JSON.stringify({ id: encryptedId }),
  });

  if (!res.ok) throw new Error("Failed to fetch treatment details");
  const json = await res.json();

  if (json.success && json.data) {
    const decrypted = decryptAESFromPHP(json.data, AES_KEY);
    return { ...json, data: decrypted ? JSON.parse(decrypted) : null };
  }
  return json;
};
