import Cookies from "js-cookie";
import { configService } from "./configService";
import { decryptAESFromPHP } from "@/utils/aesDecrypt";

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

export const fetchPreferredLaboratories = async () => {
  const { apiUrl, headers } = await getAuthHeaders();

  const res = await fetch(`${apiUrl}hs_hospital_laboratory_preferred_list`, {
    method: "GET",
    headers,
  });

  if (!res.ok) throw new Error("Failed to fetch preferred laboratories");

  const json = await res.json();

  if (json.success && json.data) {
    const AES_KEY = await configService.getAesSecretKey();
    const decrypted = decryptAESFromPHP(json.data, AES_KEY);
    return { ...json, data: decrypted ? JSON.parse(decrypted) : [] };
  }

  return { ...json, data: [] };
};

export const fetchAvailableLaboratories = async () => {
  const { apiUrl, headers } = await getAuthHeaders();

  const res = await fetch(`${apiUrl}hs_hospital_laboratory_available_list`, {
    method: "GET",
    headers,
  });

  if (!res.ok) throw new Error("Failed to fetch available laboratories");

  const json = await res.json();

  if (json.success && json.data) {
    const AES_KEY = await configService.getAesSecretKey();
    const decrypted = decryptAESFromPHP(json.data, AES_KEY);
    return { ...json, data: decrypted ? JSON.parse(decrypted) : [] };
  }

  return { ...json, data: [] };
};

export const addPreferredLaboratory = async (laboratory_id: string) => {
  const { apiUrl, headers } = await getAuthHeaders();

  const res = await fetch(`${apiUrl}hs_hospital_laboratory_add`, {
    method: "POST",
    headers,
    body: JSON.stringify({ laboratory_id }),
  });

  if (!res.ok) throw new Error("Failed to add preferred laboratory");

  return res.json();
};

export const removePreferredLaboratory = async (laboratory_id: string) => {
  const { apiUrl, headers } = await getAuthHeaders();

  const res = await fetch(`${apiUrl}hs_hospital_laboratory_remove`, {
    method: "POST",
    headers,
    body: JSON.stringify({ laboratory_id }),
  });

  if (!res.ok) throw new Error("Failed to remove preferred laboratory");

  return res.json();
};
