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

// ✅ Fetch OpenAI list
export const fetchOpenAIList = async (page = 1, limit = 10, search = "") => {
  const { apiUrl, headers } = await getAuthHeaders();

  const res = await fetch(`${apiUrl}/ai_manage_list`, {
    method: "POST",
    headers,
    body: JSON.stringify({ page, limit, search }),
  });

  if (!res.ok) throw new Error("Failed to fetch OpenAI list");

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

// ✅ Add OpenAI (Encrypted)
export const addOpenAI = async (data: any) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  const encryptedData: any = {};

  for (const key in data) {
    encryptedData[key] = CryptoJS.AES.encrypt(
      String(data[key] ?? ""),
      AES_KEY
    ).toString();
  }

  const res = await fetch(`${apiUrl}/ai_manage_add`, {
    method: "POST",
    headers,
    body: JSON.stringify(encryptedData),
  });

  if (!res.ok) throw new Error("Failed to add OpenAI");
  return res.json();
};

// ✅ Update OpenAI
export const updateOpenAI = async (id: string, data: any) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  const encryptedData: any = { id };

  for (const key in data) {
    encryptedData[key] = CryptoJS.AES.encrypt(
      String(data[key] ?? ""),
      AES_KEY
    ).toString();
  }

  const res = await fetch(`${apiUrl}/ai_manage_update`, {
    method: "POST",
    headers,
    body: JSON.stringify(encryptedData),
  });

  if (!res.ok) throw new Error("Failed to update OpenAI");
  return res.json();
};

// ✅ Delete
export const deleteOpenAI = async (aiuid: string) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  const encryptedData: any = {
    aiuid: CryptoJS.AES.encrypt(aiuid, AES_KEY).toString(), // ✅ encrypt
  };

  const res = await fetch(`${apiUrl}/ai_manage_delete`, {
    method: "POST",
    headers,
    body: JSON.stringify(encryptedData),
  });

  if (!res.ok) throw new Error("Failed to delete OpenAI");
  return res.json();
};

// ✅ Status change
export const changeOpenAIStatus = async (
  aiuid: string,
  status: "active" | "inactive"
) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  const encryptedData: any = {
    aiuid: CryptoJS.AES.encrypt(aiuid, AES_KEY).toString(),
    status: CryptoJS.AES.encrypt(status, AES_KEY).toString(),
  };

  const res = await fetch(`${apiUrl}/ai_manage_status`, {
    method: "POST",
    headers,
    body: JSON.stringify(encryptedData),
  });

  if (!res.ok) throw new Error("Failed to change status");
  return res.json();
};