// services/HSTokenService.ts
import Cookies from "js-cookie";
import { configService } from "./configService";
import { decryptAESFromPHP, encryptAESForPHP } from "@/utils/aesDecrypt";

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

export interface ScreenDoctor {
  id: string;
  name: string;
  specialization: string;
  gender: string;
  image?: string;
}

export interface ScreenData {
  id: string;
  screenuid: string;
  name: string;
  location: string;
  description: string;
  resolution: string;
  layout: string;
  theme: string;
  status: "active" | "inactive";
  auto_refresh: string;
  refresh_interval: string;
  doctors: ScreenDoctor[];
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

export const fetchScreens = async () => {
  const { apiUrl, headers } = await getAuthHeaders();

  const res = await fetch(`${apiUrl.replace(/\/$/, "")}/hs_screens_list`, {
    method: "GET",
    headers,
  });

  if (!res.ok) throw new Error("Failed to fetch screens");

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

    const mapped: ScreenData[] = rawItems.map((item: any) => ({
      id: item.id,
      screenuid: item.screenuid,
      name: item.name,
      location: item.location,
      description: item.description,
      resolution: item.resolution,
      layout: item.layout,
      theme: item.theme,
      status: item.status,
      auto_refresh: item.auto_refresh,
      refresh_interval: item.refresh_interval,
      doctors: (item.doctors || []).map((doc: any) => ({
        ...doc,
        image: doc.image ? `${apiUrl.replace(/\/api\/?$/, "")}/${doc.image}` : null
      }))
    }));

    return { ...json, data: mapped };
  }

  return { ...json, data: [] };
};

export const saveScreen = async (screenData: any) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  // Encrypt all fields
  const payload: Record<string, string> = {};
  for (const [key, value] of Object.entries(screenData)) {
    if (typeof value === "object") {
      payload[key] = encryptAESForPHP(JSON.stringify(value), AES_KEY) || "";
    } else {
      payload[key] = encryptAESForPHP(String(value), AES_KEY) || "";
    }
  }

  const res = await fetch(`${apiUrl.replace(/\/$/, "")}/hs_save_screen`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Failed to save screen");

  return await res.json();
};

export interface AppointmentPreview {
  id: string;
  token: number;
  name: string;
  status: string;
  time: string;
  created_at?: string;
}

export const fetchScreenAppointments = async (doctorIds: string[]) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  const payload = {
    doctorIds: encryptAESForPHP(JSON.stringify(doctorIds), AES_KEY) || ""
  };

  const res = await fetch(`${apiUrl.replace(/\/$/, "")}/hs_screens_appointments`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Failed to fetch appointments");

  const json = await res.json();
  if (json.success && json.data) {
    const decrypted = decryptAESFromPHP(json.data, AES_KEY);
    try {
      return decrypted ? JSON.parse(decrypted) : {};
    } catch {
      return {};
    }
  }
  return {};
};

export interface UpcomingToken {
  token_no: string;
  patient_name: string;
  status: string;
  start_time: string;
  doctor_name: string;
  priority: string;
}

export interface ActiveDoctor {
  id: string;
  name: string;
  department: string;
  room: string;
  avgTime: string;
  profile_image: string | null;
  status: string;
}

export interface ActivityItem {
  id: string;
  message: string;
  time: string;
}

export interface TokenDashboardStats {
  activeScreens: number;
  totalScreens: number;
  todayTokens: number;
  avgWaitTime: string;
  pendingQueue: number;
  upcomingTokens: UpcomingToken[];
  activeScreensList: any[]; // Using any to avoid complex mapping for now, or match ScreenData structure
  activeDoctors: ActiveDoctor[];
  recentActivity: ActivityItem[];
}

export const fetchDashboardStats = async () => {
  const { apiUrl, headers } = await getAuthHeaders();

  const res = await fetch(`${apiUrl.replace(/\/$/, "")}/hs_token_dashboard_stats`, {
    method: "GET",
    headers,
  });

  if (!res.ok) throw new Error("Failed to fetch dashboard stats");

  const json = await res.json();
  if (json.success && json.data) {
    const AES_KEY = await configService.getAesSecretKey();
    const decrypted = decryptAESFromPHP(json.data, AES_KEY);
    try {
      return decrypted ? JSON.parse(decrypted) : null;
    } catch {
      return null;
    }
  }
  return null;
};
