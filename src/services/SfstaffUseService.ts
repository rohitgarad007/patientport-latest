// services/SfstaffUseService.ts
import Cookies from "js-cookie";
import { configService } from "./configService";
import CryptoJS from "crypto-js";
import { decryptAESFromPHP } from "@/utils/aesDecrypt";

// -------------------------------
// 🔐 Get Auth Headers + API URL
// -------------------------------
const getAuthHeaders = async () => {
  const token = Cookies.get("token");
  const apiUrl = await configService.getApiUrl();

  if (!token) {
    throw new Error("No authentication token found");
  }

  return {
    apiUrl,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };
};

// -------------------------------
// 🔒 Helper: Encrypt Data Object
// -------------------------------
const encryptData = async (data: Record<string, any>) => {
  const AES_KEY = await configService.getAesSecretKey();
  const encryptedData: Record<string, string> = {};

  for (const key of Object.keys(data)) {
    encryptedData[key] = CryptoJS.AES.encrypt(
      String(data[key] ?? ""),
      AES_KEY
    ).toString();
  }

  return encryptedData;
};

// -------------------------------
// 👨‍⚕️ Fetch Doctor List (encrypted request)
// -------------------------------
export const fetchDoctorList = async (staff_uid: string) => {
  try {
    const { apiUrl, headers } = await getAuthHeaders();
    const AES_KEY = await configService.getAesSecretKey();

    // Encrypt payload
    const encryptedData = {
      staff_uid: CryptoJS.AES.encrypt(String(staff_uid), AES_KEY).toString(),
    };

    const response = await fetch(`${apiUrl}/sf_staff_doctorList`, {
      method: "POST",
      headers,
      body: JSON.stringify(encryptedData),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch doctor list: ${response.statusText}`);
    }

    const json = await response.json();

    if (json.success && json.data) {
      const decrypted = decryptAESFromPHP(json.data, AES_KEY);
      const parsedData = decrypted ? JSON.parse(decrypted) : {};
      return { ...json, data: parsedData };
    }
    return { ...json, data: {} };
  } catch (error: any) {
    console.error("Error fetching doctor list:", error);
    return {
      success: false,
      message: error.message || "Unexpected error",
      data: {},
    };
  }
};

// -------------------------------
// 💾 Save Doctor Schedule (encrypted request)
// -------------------------------
export const saveDoctorSchedule = async (payload: any) => {
  try {
    const { apiUrl, headers } = await getAuthHeaders();
    const AES_KEY = await configService.getAesSecretKey();

    // ✅ Encrypt the payload (full object)
    const encryptedPayload = await encryptData({
      doctorId: payload.doctorId,
      weekdays: JSON.stringify(payload.weekdays),
      slots: JSON.stringify(payload.slots),
    });

    const response = await fetch(`${apiUrl}/sf_staff_saveDoctorSchedule`, {
      method: "POST",
      headers,
      body: JSON.stringify(encryptedPayload),
    });

    if (!response.ok) {
      throw new Error(`Failed to save schedule: ${response.statusText}`);
    }

    const json = await response.json();

    // ✅ If backend returns encrypted data, decrypt it
    if (json.success && json.data) {
      const decrypted = decryptAESFromPHP(json.data, AES_KEY);
      const parsedData = decrypted ? JSON.parse(decrypted) : {};
      return { ...json, data: parsedData };
    }

    return { ...json, data: {} };
  } catch (error: any) {
    console.error("Error saving doctor schedule:", error);
    return {
      success: false,
      message: error.message || "Unexpected error while saving schedule",
    };
  }
};

// -------------------------------
// 📅 Fetch Today's Appointments
// -------------------------------
export const getTodayAppointments = async () => {
  try {
    const { apiUrl, headers } = await getAuthHeaders();
    const AES_KEY = await configService.getAesSecretKey();

    const response = await fetch(`${apiUrl}/sf_staff_todayAppointments`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch appointments: ${response.statusText}`);
    }

    const json = await response.json();

    if (json.success && json.data) {
      const decrypted = decryptAESFromPHP(json.data, AES_KEY);
      const parsedData = decrypted ? JSON.parse(decrypted) : [];
      return { ...json, data: parsedData };
    }
    return { ...json, data: [] };
  } catch (error: any) {
    console.error("Error fetching today's appointments:", error);
    return {
      success: false,
      message: error.message || "Unexpected error",
      data: [],
    };
  }
};

const getStaffHospitalIdFromCookie = (): string | null => {
  const raw = Cookies.get("userInfo");
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const candidates = [
      parsed["hospital_id"],
      parsed["hospitalId"],
      parsed["hospitalID"],
      parsed["hospital"],
    ];
    for (const c of candidates) {
      if (c === null || c === undefined) continue;
      const s = String(c).trim();
      if (!s) continue;
      if (!/^\d+$/.test(s)) continue;
      return s;
    }
    return null;
  } catch {
    return null;
  }
};

export const getLoggedInStaffProfile = async () => {
  try {
    const { apiUrl, headers } = await getAuthHeaders();
    const AES_KEY = await configService.getAesSecretKey();

    const response = await fetch(`${apiUrl}/sf_staff_getLoggedInProfile`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch staff profile: ${response.statusText}`);
    }

    const json = await response.json();
    if (json.success && json.data) {
      const decrypted = decryptAESFromPHP(json.data, AES_KEY);
      const parsedData = decrypted ? JSON.parse(decrypted) : null;
      return parsedData;
    }
    return null;
  } catch (error: any) {
    console.error("Error fetching staff profile:", error);
    return null;
  }
};

export const getTodaysAppointmentsGrouped = async (date?: string) => {
  try {
    const { apiUrl, headers } = await getAuthHeaders();
    const AES_KEY = await configService.getAesSecretKey();

    const payload: Record<string, string> = {};
    if (date) {
      payload.date = CryptoJS.AES.encrypt(String(date), AES_KEY).toString();
    }

    const response = await fetch(`${apiUrl}/sf_staff_getTodaysAppointmentsGrouped`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch today's grouped appointments: ${response.statusText}`);
    }

    const json = await response.json();
    if (json.success && json.data) {
      const decrypted = decryptAESFromPHP(json.data, AES_KEY);
      const parsedData = decrypted
        ? JSON.parse(decrypted)
        : { waiting: [], arrived: [], booked: [] };
      return parsedData;
    }
    return { waiting: [], arrived: [], booked: [] };
  } catch (error: any) {
    console.error("Error fetching today's grouped appointments:", error);
    return { waiting: [], arrived: [], booked: [] };
  }
};

export type StaffAppointmentsWsMessage = {
  event: string;
  hospital_id?: string;
  staff_id?: string;
  payload?: unknown;
};

export const connectStaffAppointmentsSocket = async (opts: {
  onMessage: (message: StaffAppointmentsWsMessage) => void;
  onOpen?: () => void;
  onClose?: () => void;
}) => {
  let ws: WebSocket | null = null;
  let closedByUser = false;
  let reconnectAttempt = 0;
  let reconnectTimer: number | null = null;
  let hospitalIdPromise: Promise<string> | null = null;

  const getWsUrl = async () => {
    const env = import.meta.env as unknown as Record<string, string | undefined>;
    const rawBase =
      env.VITE_STAFF_NOTIFICATIONS_WS_URL ||
      env.VITE_WS_NOTIFICATIONS_URL ||
      "";
    const normalizedRawBase = rawBase.startsWith("https://")
      ? rawBase.replace(/^https:/, "wss:")
      : rawBase.startsWith("http://")
        ? rawBase.replace(/^http:/, "ws:")
        : rawBase;
    const base =
      normalizedRawBase ||
      `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.hostname}:8081/ws`;

    const fromCookie = getStaffHospitalIdFromCookie();
    const hospitalId =
      fromCookie ||
      (await (hospitalIdPromise ??
        (hospitalIdPromise = getLoggedInStaffProfile()
          .then((profile) => {
            const id =
              profile?.hospital_id ??
              profile?.hospitalId ??
              profile?.hospitalID ??
              profile?.hospital ??
              null;
            const s = id === null || id === undefined ? "" : String(id).trim();
            if (!s || !/^\d+$/.test(s)) throw new Error("Hospital id not found");
            return s;
          })
          .catch((e) => {
            hospitalIdPromise = null;
            throw e;
          }))));

    if (!hospitalId) throw new Error("Hospital id not found");

    const url = new URL(base);
    url.searchParams.delete("doctor_id");
    url.searchParams.delete("staff_id");
    url.searchParams.set("hospital_id", String(hospitalId));
    return url.toString();
  };

  const scheduleReconnect = () => {
    if (closedByUser) return;
    if (reconnectTimer) window.clearTimeout(reconnectTimer);
    const delay = Math.min(10000, 500 * Math.pow(2, reconnectAttempt));
    reconnectAttempt = Math.min(reconnectAttempt + 1, 6);
    reconnectTimer = window.setTimeout(() => {
      void connect();
    }, delay);
  };

  const connect = async () => {
    try {
      const url = await getWsUrl();
      ws = new WebSocket(url);

      ws.onopen = () => {
        reconnectAttempt = 0;
        opts.onOpen?.();
      };

      ws.onmessage = (ev) => {
        try {
          const parsed: unknown = JSON.parse(String(ev.data || "{}"));
          if (!parsed || typeof parsed !== "object") return;
          const record = parsed as Record<string, unknown>;
          if (typeof record.event !== "string") return;
          opts.onMessage(record as unknown as StaffAppointmentsWsMessage);
        } catch {
          return;
        }
      };

      ws.onclose = () => {
        opts.onClose?.();
        scheduleReconnect();
      };

      ws.onerror = () => {
        try {
          ws?.close();
        } catch {
          scheduleReconnect();
        }
      };
    } catch {
      scheduleReconnect();
    }
  };

  await connect();

  return {
    close: () => {
      closedByUser = true;
      if (reconnectTimer) window.clearTimeout(reconnectTimer);
      try {
        ws?.close();
      } catch {
        return;
      }
    },
  };
};


// -------------------------------
// 🧑‍⚕️ Fetch Doctor Schedule (encrypted request)
// -------------------------------
export const fetchDoctorSchedule = async (doctorId: string) => {
  try {
    const { apiUrl, headers } = await getAuthHeaders();
    const AES_KEY = await configService.getAesSecretKey();

    // ✅ Encrypt the payload
    const encryptedPayload = await encryptData({
      doctorId,
    });

    const response = await fetch(`${apiUrl}/sf_staff_getDoctorSchedule`, {
      method: "POST",
      headers,
      body: JSON.stringify(encryptedPayload),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch doctor schedule: ${response.statusText}`);
    }

    const json = await response.json();

    // ✅ Decrypt backend response if data exists
    if (json.success && json.data) {
      const decrypted = decryptAESFromPHP(json.data, AES_KEY);
      const parsedData = decrypted ? JSON.parse(decrypted) : {};
      return { ...json, data: parsedData };
    }

    return { ...json, data: {} };
  } catch (error: any) {
    console.error("Error fetching doctor schedule:", error);
    return {
      success: false,
      message: error.message || "Unexpected error while fetching schedule",
      data: {},
    };
  }
};


export const fetchDoctorEventSchedule = async (doctorId: string) => {
  try {
    const { apiUrl, headers } = await getAuthHeaders();
    const AES_KEY = await configService.getAesSecretKey();

    // ✅ Encrypt the payload
    const encryptedPayload = await encryptData({
      doctorId,
    });

    const response = await fetch(`${apiUrl}/sf_staff_getDoctorEventSchedule`, {
      method: "POST",
      headers,
      body: JSON.stringify(encryptedPayload),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch doctor schedule: ${response.statusText}`);
    }

    const json = await response.json();

    // ✅ Decrypt backend response if data exists
    if (json.success && json.data) {
      const decrypted = decryptAESFromPHP(json.data, AES_KEY);
      const parsedData = decrypted ? JSON.parse(decrypted) : {};
      return { ...json, data: parsedData };
    }

    return { ...json, data: {} };
  } catch (error: any) {
    console.error("Error fetching doctor schedule:", error);
    return {
      success: false,
      message: error.message || "Unexpected error while fetching schedule",
      data: {},
    };
  }
};


// -------------------------------
// 🕒 Fetch Shift List (encrypted request)
// -------------------------------
export const fetchShiftList = async () => {
  try {
    const { apiUrl, headers } = await getAuthHeaders();
    const AES_KEY = await configService.getAesSecretKey();

    // For shifts, no payload required, but we send empty encrypted object
    const encryptedPayload = await encryptData({});

    const response = await fetch(`${apiUrl}/sf_staff_getShiftList`, {
      method: "POST",
      headers,
      body: JSON.stringify(encryptedPayload),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch shift list: ${response.statusText}`);
    }

    const json = await response.json();

    // ✅ Decrypt backend response if data exists
    if (json.success && json.data) {
      const decrypted = decryptAESFromPHP(json.data, AES_KEY);
      const parsedData = decrypted ? JSON.parse(decrypted) : [];
      return { ...json, data: parsedData };
    }

    return { ...json, data: [] };
  } catch (error: any) {
    console.error("Error fetching shift list:", error);
    return {
      success: false,
      message: error.message || "Unexpected error while fetching shift list",
      data: [],
    };
  }
};

// -------------------------------
// 📋 Fetch Event Type List (encrypted request)
// -------------------------------

interface EventType {
  id: string;
  name: string;
  description?: string;
}

export const fetchEventTypeList = async () => {
  try {
    const { apiUrl, headers } = await getAuthHeaders();
    const AES_KEY = await configService.getAesSecretKey();

    // If API doesn't require payload, we still send an encrypted empty object
    const encryptedPayload = await encryptData({});

    const response = await fetch(`${apiUrl}/sf_staff_getEventTypeList`, {
      method: "POST",
      headers,
      body: JSON.stringify(encryptedPayload),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch event type list: ${response.statusText}`);
    }

    const json = await response.json();

    // ✅ Decrypt backend response if data exists
    if (json.success && json.data) {
      const decrypted = decryptAESFromPHP(json.data, AES_KEY);
      const parsedData = decrypted ? JSON.parse(decrypted) : [];
      return { ...json, data: parsedData };
    }

    return { ...json, data: [] };
  } catch (error: any) {
    console.error("Error fetching event type list:", error);
    return {
      success: false,
      message: error.message || "Unexpected error while fetching event type list",
      data: [],
    };
  }
};

// -------------------------------
// 💾 Save Doctor Event Schedule (encrypted request)
// -------------------------------
export const saveDoctorEventSchedule = async (payload: { doctorId: string; date: string; events: any[] }) => {
  try {
    const { apiUrl, headers } = await getAuthHeaders();
    const AES_KEY = await configService.getAesSecretKey();

    const encryptedPayload = await encryptData({
      doctorId: payload.doctorId,
      selDate: payload.date,
      events: JSON.stringify(payload.events),
    });

    

    const response = await fetch(`${apiUrl}/sf_staff_saveDoctorEventSchedule`, {
      method: "POST",
      headers,
      body: JSON.stringify(encryptedPayload),
    });

    if (!response.ok) {
      throw new Error(`Failed to save doctor event schedule: ${response.statusText}`);
    }

    const json = await response.json();

    if (json.success && json.data) {
      const decrypted = decryptAESFromPHP(json.data, AES_KEY);
      const parsedData = decrypted ? JSON.parse(decrypted) : {};
      return { ...json, data: parsedData };
    }

    return { ...json, data: {} };
  } catch (error: any) {
    console.error("Error saving doctor event schedule:", error);
    return {
      success: false,
      message: error.message || "Unexpected error while saving doctor event schedule",
      data: {},
    };
  }
};

// -------------------------------
// 🗑️ Delete Doctor Event (encrypted request)
// -------------------------------
export const deleteDoctorEvent = async (payload: { doctorId: string; id: string }) => {
  try {
    const { apiUrl, headers } = await getAuthHeaders();
    const AES_KEY = await configService.getAesSecretKey();

    const encryptedPayload = await encryptData({
      doctorId: payload.doctorId,
      id: payload.id,
    });

    const response = await fetch(`${apiUrl}/sf_staff_deleteDoctorEvent`, {
      method: "POST",
      headers,
      body: JSON.stringify(encryptedPayload),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete doctor event: ${response.statusText}`);
    }

    const json = await response.json();

    if (json.success && json.data) {
      const decrypted = decryptAESFromPHP(json.data, AES_KEY);
      const parsedData = decrypted ? JSON.parse(decrypted) : {};
      return { ...json, data: parsedData };
    }

    return { ...json };
  } catch (error: any) {
    console.error("Error deleting doctor event:", error);
    return {
      success: false,
      message: error.message || "Unexpected error while deleting doctor event",
    };
  }
};

// -------------------------------
// 📅 Fetch Appointments By Date (encrypted request)
// -------------------------------
export const fetchAppointmentsByDate = async (doctorId: string, date: string) => {
  try {
    const { apiUrl, headers } = await getAuthHeaders();
    const AES_KEY = await configService.getAesSecretKey();

    const encryptedPayload = await encryptData({
      doctorId,
      date,
    });

    const response = await fetch(`${apiUrl}/sf_staff_getAppointmentsByDate`, {
      method: "POST",
      headers,
      body: JSON.stringify(encryptedPayload),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch appointments: ${response.statusText}`);
    }

    const json = await response.json();

    if (json.success && json.data) {
      const decrypted = decryptAESFromPHP(json.data, AES_KEY);
      const parsed = decrypted ? JSON.parse(decrypted) : { items: [] };
      return { ...json, data: parsed.items ?? [] };
    }

    return { ...json, data: [] };
  } catch (error: any) {
    console.error("Error fetching appointments by date:", error);
    return {
      success: false,
      message: error.message || "Unexpected error while fetching appointments",
      data: [],
    };
  }
};

// -------------------------------
// 🔄 Update Appointment Status (encrypted request)
// -------------------------------
export const updateAppointmentStatus = async (payload: {
  appointmentId: string; // appointment_uid
  doctorId: string;
  date: string; // YYYY-MM-DD
  status: 'booked' | 'arrived' | 'waiting' | 'active' | 'completed';
  queuePosition?: number | null;
}) => {
  try {
    const { apiUrl, headers } = await getAuthHeaders();
    const AES_KEY = await configService.getAesSecretKey();

    const encryptedPayload = await encryptData({
      appointmentId: payload.appointmentId,
      doctorId: payload.doctorId,
      date: payload.date,
      status: payload.status,
      queuePosition: payload.queuePosition ?? null,
    });

    const response = await fetch(`${apiUrl}/sf_staff_updateAppointmentStatus`, {
      method: 'POST',
      headers,
      body: JSON.stringify(encryptedPayload),
    });

    if (!response.ok) {
      throw new Error(`Failed to update appointment status: ${response.statusText}`);
    }

    const json = await response.json();
    if (json.success && json.data) {
      const decrypted = decryptAESFromPHP(json.data, AES_KEY);
      const parsed = decrypted ? JSON.parse(decrypted) : { item: null };
      return { ...json, data: parsed.item };
    }
    return { ...json, data: null };
  } catch (error: any) {
    console.error('Error updating appointment status:', error);
    return {
      success: false,
      message: error.message || 'Unexpected error while updating appointment status',
      data: null,
    };
  }
};

// -------------------------------
// 📚 Update Queue Positions (encrypted request)
// -------------------------------
export const updateQueuePositions = async (payload: {
  doctorId: string;
  date: string; // YYYY-MM-DD
  orderedIds: string[]; // ordered list of appointment_uids in waiting queue
}) => {
  try {
    const { apiUrl, headers } = await getAuthHeaders();
    const AES_KEY = await configService.getAesSecretKey();

    const encryptedPayload = await encryptData({
      doctorId: payload.doctorId,
      date: payload.date,
      orderedIds: JSON.stringify(payload.orderedIds),
    });

    const response = await fetch(`${apiUrl}/sf_staff_updateQueuePositions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(encryptedPayload),
    });

    if (!response.ok) {
      throw new Error(`Failed to update queue positions: ${response.statusText}`);
    }

    const json = await response.json();
    if (json.success && json.data) {
      const decrypted = decryptAESFromPHP(json.data, AES_KEY);
      const parsed = decrypted ? JSON.parse(decrypted) : { items: [] };
      return { ...json, data: parsed.items ?? [] };
    }
    return { ...json, data: [] };
  } catch (error: any) {
    console.error('Error updating queue positions:', error);
    return {
      success: false,
      message: error.message || 'Unexpected error while updating queue positions',
      data: []
    };
  }
};
