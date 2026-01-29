// services/HSTokenService.ts
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

export interface Doctor {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "active" | "inactive";
  gender: string;
  image?: string;
  specialization?: string;
}

export const fetchDoctors = async () => {
  const { apiUrl, headers } = await getAuthHeaders();

  const res = await fetch(`${apiUrl.replace(/\/$/, "")}/hs_doctors_list`, {
    method: "POST",
    headers,
    body: JSON.stringify({}),
  });

  if (!res.ok) throw new Error("Failed to fetch doctors");

  const json = await res.json();
  if (json.success && json.data) {
    const AES_KEY = await configService.getAesSecretKey();
    const decrypted = decryptAESFromPHP(json.data, AES_KEY);

    let rawItems: any[] = [];
    try {
      rawItems = decrypted ? JSON.parse(decrypted) : [];
      if (!Array.isArray(rawItems)) rawItems = [];
    } catch {
      rawItems = [];
    }

    const mapped: Doctor[] = rawItems.map((item: any) => ({
      id: item.id,
      name: item.name,
      email: item.email,
      phone: item.phone,
      gender: item.gender,
      status: item.status === "1" ? "active" : "inactive",
      image: "https://github.com/shadcn.png", // Default or fetch if available
      specialization: "General", // Placeholder
    }));

    return { ...json, data: mapped };
  }

  return { ...json, data: [] };
};
