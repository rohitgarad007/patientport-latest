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
