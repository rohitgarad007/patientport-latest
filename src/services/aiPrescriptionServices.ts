import Cookies from "js-cookie";
import { configService } from "./configService";
import { decryptAESFromPHP } from "@/utils/aesDecrypt";
import CryptoJS from "crypto-js";

// 🔐 Auth headers
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



// ==============================
// ✅ FETCH LIST
// ==============================
export const fetchAIPrescriptions = async (
  page = 1,
  limit = 10,
  search = ""
) => {
  const { apiUrl, headers } = await getAuthHeaders();

  const res = await fetch(`${apiUrl}/ai_prescription_list`, {
    method: "POST",
    headers,
    body: JSON.stringify({ page, limit, search }),
  });

  if (!res.ok) throw new Error("Failed to fetch prescriptions");

  const json = await res.json();

  if (json.success && json.data) {
    const AES_KEY = await configService.getAesSecretKey();

    const decrypted = decryptAESFromPHP(json.data, AES_KEY);

    return {
      ...json,
      data: decrypted ? JSON.parse(decrypted) : [],
    };
  }

  return json;
};



// ==============================
// ✅ ADD
// ==============================
export const addAIPrescription = async (data: any) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  const encryptedData: any = {};

  for (const key in data) {
    encryptedData[key] = CryptoJS.AES.encrypt(
      String(data[key] ?? ""),
      AES_KEY
    ).toString();
  }

  const res = await fetch(`${apiUrl}/ai_prescription_add`, {
    method: "POST",
    headers,
    body: JSON.stringify(encryptedData),
  });

  if (!res.ok) throw new Error("Failed to add prescription");
  return res.json();
};



// ==============================
// ✅ UPDATE
// ==============================
export const updateAIPrescription = async (
  apuid: string,
  data: any
) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  const encryptedData: any = {
    apuid: CryptoJS.AES.encrypt(apuid, AES_KEY).toString(), // 🔐 id encrypted (optional)
  };

  for (const key in data) {
    encryptedData[key] = CryptoJS.AES.encrypt(
      String(data[key] ?? ""),
      AES_KEY
    ).toString();
  }

  const res = await fetch(`${apiUrl}/ai_prescription_update`, {
    method: "POST",
    headers,
    body: JSON.stringify(encryptedData),
  });

  if (!res.ok) throw new Error("Failed to update prescription");
  return res.json();
};



// ==============================
// ✅ DELETE
// ==============================
export const deleteAIPrescription = async (apuid: string) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  const encryptedData = {
    apuid: CryptoJS.AES.encrypt(apuid, AES_KEY).toString(),
  };

  const res = await fetch(`${apiUrl}/ai_prescription_delete`, {
    method: "POST",
    headers,
    body: JSON.stringify(encryptedData),
  });

  if (!res.ok) throw new Error("Failed to delete prescription");
  return res.json();
};



// ==============================
// ✅ SET DEFAULT
// ==============================
export const setDefaultAIPrescription = async (apuid: string) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  const encryptedData = {
    apuid: CryptoJS.AES.encrypt(apuid, AES_KEY).toString(),
  };

  const res = await fetch(`${apiUrl}/ai_prescription_set_default`, {
    method: "POST",
    headers,
    body: JSON.stringify(encryptedData),
  });

  if (!res.ok) throw new Error("Failed to set default");
  return res.json();
};