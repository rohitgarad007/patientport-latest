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

const decryptPayload = async <T>(encrypted: string, fallback: T): Promise<T> => {
  if (!encrypted) return fallback;
  const AES_KEY = await configService.getAesSecretKey();
  const decrypted = decryptAESFromPHP(encrypted, AES_KEY);
  if (!decrypted) return fallback;
  try {
    return JSON.parse(decrypted) as T;
  } catch {
    return fallback;
  }
};

export const fetchHospitalDashboardStats = async () => {
  const { apiUrl, headers } = await getAuthHeaders();
  const res = await fetch(`${apiUrl}/HospitalDashboardController/getStats`, {
    method: "POST",
    headers,
  });
  if (!res.ok) throw new Error("Failed to fetch dashboard stats");
  const json = await res.json();
  const data = json?.success ? await decryptPayload(json.data, null) : null;
  return { ...json, data };
};

export const fetchHospitalDashboardLists = async () => {
  const { apiUrl, headers } = await getAuthHeaders();
  const res = await fetch(`${apiUrl}/HospitalDashboardController/getLists`, {
    method: "POST",
    headers,
  });
  if (!res.ok) throw new Error("Failed to fetch dashboard lists");
  const json = await res.json();
  const data = json?.success
    ? await decryptPayload(json.data, { doctors: [], staff: [], patients: [] })
    : { doctors: [], staff: [], patients: [] };
  return { ...json, data };
};

export const fetchHospitalDashboardAppointments = async () => {
  const { apiUrl, headers } = await getAuthHeaders();
  const res = await fetch(`${apiUrl}/HospitalDashboardController/getAppointments`, {
    method: "POST",
    headers,
  });
  if (!res.ok) throw new Error("Failed to fetch dashboard appointments");
  const json = await res.json();
  const data = json?.success ? await decryptPayload(json.data, []) : [];
  return { ...json, data };
};

export const fetchHospitalDashboardBottom = async () => {
  const { apiUrl, headers } = await getAuthHeaders();
  const res = await fetch(`${apiUrl}/HospitalDashboardController/getBottom`, {
    method: "POST",
    headers,
  });
  if (!res.ok) throw new Error("Failed to fetch dashboard bottom data");
  const json = await res.json();
  const data = json?.success
    ? await decryptPayload(json.data, {
        bed: { totalBeds: 0, freeBeds: 0, occupancyPercent: 0 },
        shifts: [],
        departments: [],
        amenities: [],
      })
    : {
        bed: { totalBeds: 0, freeBeds: 0, occupancyPercent: 0 },
        shifts: [],
        departments: [],
        amenities: [],
      };
  return { ...json, data };
};
