import Cookies from "js-cookie";
import { configService } from "./configService";
import { decryptAESFromPHP, encryptAESForPHP } from "@/utils/aesDecrypt";

// Helper to get auth headers
const getAuthHeaders = async () => {
  const token = Cookies.get("token");
  if (!token) throw new Error("No auth token found");

  const apiUrl = await configService.getApiUrl();
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    apiUrl,
  };
};

export interface ReceptionStats {
  totalPatients: number;
  completedToday: number;
  doctorsAvailable: number;
  emergencyCases: number;
  avgWaitTime: number;
}

export interface ActiveConsultation {
  id: string;
  token_no: string;
  patient_name: string;
  doctor_id?: string;
  doctor_name: string;
  doctor_image?: string;
  specialization?: string;
}

export interface WaitingQueueItem {
  id: string;
  token_no: string;
  patient_name: string;
  doctor_id?: string;
  doctor_name: string;
  start_time?: string;
  created_at?: string;
  source?: string;
}

export interface DashboardDoctor {
  id: string;
  name: string;
  profile_image?: string;
  status: string; // "1" for active/online, "0" for inactive/offline
  specialization?: string;
  room_number?: string;
  avg_consultation_time?: string;
}

export interface ReceptionDashboardData {
  stats: ReceptionStats;
  activeConsultations: ActiveConsultation[];
  waitingQueue: WaitingQueueItem[];
  doctors: DashboardDoctor[];
}

export const receptionService = {
  fetchDashboardStats: async (): Promise<ReceptionDashboardData> => {
    const { headers, apiUrl } = await getAuthHeaders();
    
    const response = await fetch(`${apiUrl.replace(/\/$/, "")}/reception_dashboard_stats`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch reception stats: ${response.statusText}`);
    }

    const json = await response.json();

    if (!json.success || !json.data) {
      throw new Error(json.message || "Failed to fetch reception stats");
    }

    // Decrypt data
    const AES_KEY = await configService.getAesSecretKey();
    const decryptedString = decryptAESFromPHP(json.data, AES_KEY);
    
    if (!decryptedString) {
      throw new Error("Failed to decrypt reception data");
    }

    try {
      const parsedData = JSON.parse(decryptedString);
      return parsedData as ReceptionDashboardData;
    } catch (e) {
      throw new Error("Failed to parse reception data");
    }
  },

  saveScreenSettings: async (settings: any) => {
    const { headers, apiUrl } = await getAuthHeaders();
    const AES_KEY = await configService.getAesSecretKey();
    
    // Encrypt payload
    const payload = JSON.stringify(settings);
    const encryptedData = encryptAESForPHP(payload, AES_KEY);

    const response = await fetch(`${apiUrl.replace(/\/$/, "")}/save_screen_settings`, {
      method: "POST",
      headers,
      body: JSON.stringify({ data: encryptedData }),
    });

    if (!response.ok) {
        throw new Error(`Failed to save settings: ${response.statusText}`);
    }

    const json = await response.json();
    
    if (json.data) {
        const decryptedResponse = decryptAESFromPHP(json.data, AES_KEY);
        try {
            return JSON.parse(decryptedResponse);
        } catch (e) {
            return { success: false, message: "Failed to parse response" };
        }
    }
    
    return json;
  },

  fetchScreenSettings: async () => {
    const { headers, apiUrl } = await getAuthHeaders();
    
    const response = await fetch(`${apiUrl.replace(/\/$/, "")}/get_screen_settings`, {
        method: "GET",
        headers,
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch settings: ${response.statusText}`);
    }

    const json = await response.json();
    
    if (json.data) {
        const AES_KEY = await configService.getAesSecretKey();
        const decryptedString = decryptAESFromPHP(json.data, AES_KEY);
        try {
             return JSON.parse(decryptedString);
        } catch (e) {
             console.error("Parse error", e);
             return null;
        }
    }
    return null;
  },

  fetchScreensList: async () => {
    const { headers, apiUrl } = await getAuthHeaders();
    const response = await fetch(`${apiUrl.replace(/\/$/, "")}/hs_screens_list`, {
      method: "GET",
      headers,
    });

    if (!response.ok) throw new Error("Failed to fetch screens list");

    const json = await response.json();
    if (json.success && json.data) {
      const AES_KEY = await configService.getAesSecretKey();
      const decrypted = decryptAESFromPHP(json.data, AES_KEY);
      try {
        return decrypted ? JSON.parse(decrypted) : [];
      } catch (e) {
        console.error("Parse error", e);
        return [];
      }
    }
    return [];
  },

  fetchReceptionScreens: async () => {
    const { headers, apiUrl } = await getAuthHeaders();
    const response = await fetch(`${apiUrl.replace(/\/$/, "")}/reception_screens_list`, {
      method: "GET",
      headers,
    });

    if (!response.ok) throw new Error("Failed to fetch reception screens list");

    const json = await response.json();
    if (json.success && json.data) {
      const AES_KEY = await configService.getAesSecretKey();
      const decrypted = decryptAESFromPHP(json.data, AES_KEY);
      try {
        return decrypted ? JSON.parse(decrypted) : [];
      } catch (e) {
        console.error("Parse error", e);
        return [];
      }
    }
    return [];
  }
};
