// services/doctorService.ts
import Cookies from "js-cookie";
import { configService } from "./configService";
import { decryptAESFromPHP } from "@/utils/aesDecrypt";
import CryptoJS from "crypto-js";


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

// ======================
// Doctor CRUD operations
// ======================

// ✅ Fetch doctors with pagination & filters
export const fetchDoctors = async (
  page = 1,
  limit = 10,
  search = "",
  specialization = ""
) => {
  const { apiUrl, headers } = await getAuthHeaders();

  const res = await fetch(`${apiUrl}/ms_doctors_list`, {
    method: "POST",
    headers,
    body: JSON.stringify({ page, limit, search, specialization }),
  });

  if (!res.ok) throw new Error("Failed to fetch doctors");
  //return res.json();

  const json = await res.json();

  if (json.success && json.data) {
    // Fetch AES key **here**
    const AES_KEY = await configService.getAesSecretKey();

    // Decrypt the data array
    const decrypted = decryptAESFromPHP(json.data, AES_KEY);
    return { ...json, data: decrypted ? JSON.parse(decrypted) : [] };
  }

  return json;
};

// ✅ Add doctor
export const addDoctor = async (data: any) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();
  const encryptedData: any = {};
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      encryptedData[key] = CryptoJS.AES.encrypt(
        String(data[key] ?? ""),
        AES_KEY
      ).toString();
    }
  }

  const res = await fetch(`${apiUrl}/ms_doctors_add`, {
    method: "POST",
    headers,
    body: JSON.stringify(encryptedData),
  });

  if (!res.ok) throw new Error("Failed to add doctor");
  return res.json();

};

// ✅ Update doctor
export const updateDoctor = async (id: string, data: any) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  

  const encryptedData: any = { id }; // Keep ID unencrypted if backend expects it unencrypted
  

  for (const key in data) {
    if (data.hasOwnProperty(key) && key !== "email" && key !== "password") {
      encryptedData[key] = CryptoJS.AES.encrypt(
        String(data[key] ?? ""),
        AES_KEY
      ).toString();
    }
  }
  

  const res = await fetch(`${apiUrl}/ms_doctors_update`, {
    method: "POST",
    headers,
    body: JSON.stringify(encryptedData),
  });

  if (!res.ok) throw new Error("Failed to update doctor");
  return res.json();

};

// ✅ Get doctor details
export const getDoctorById = async (id: string) => {
  const { apiUrl, headers } = await getAuthHeaders();

  const res = await fetch(`${apiUrl}/ms_doctors_details`, {
    method: "POST",
    headers,
    body: JSON.stringify({ id }),
  });

  if (!res.ok) throw new Error("Failed to fetch doctor details");
  return res.json();
};

// ✅ Change doctor status
export const changeDoctorStatus = async (
  id: string,
  status: string
) => {
  const { apiUrl, headers } = await getAuthHeaders();

  const res = await fetch(`${apiUrl}/ms_doctors_change_status`, {
    method: "POST",
    headers,
    body: JSON.stringify({ id, status }),
  });

  if (!res.ok) throw new Error("Failed to change doctor status");
  return res.json();
};

// ✅ Delete doctor
export const deleteDoctor = async (id: string) => {
  const { apiUrl, headers } = await getAuthHeaders();

  const res = await fetch(`${apiUrl}/ms_doctors_delete`, {
    method: "POST",
    headers,
    body: JSON.stringify({ id }),
  });

  if (!res.ok) throw new Error("Failed to delete doctor");
  return res.json();
};

// ======================
// Doctor Common Lookups
// ======================

// ✅ Get all doctor specializations
export const getDoctorSpecializations = async () => {
  const { apiUrl, headers } = await getAuthHeaders();

  const res = await fetch(`${apiUrl}/ms_doctor_specializations`, {
    method: "POST",
    headers,
    body: JSON.stringify({}),
  });

  if (!res.ok) throw new Error("Failed to fetch doctor specializations");
  return res.json();
};

// ✅ Get all doctor qualifications
export const getDoctorQualifications = async () => {
  const { apiUrl, headers } = await getAuthHeaders();

  const res = await fetch(`${apiUrl}/ms_doctor_qualifications`, {
    method: "POST",
    headers,
    body: JSON.stringify({}),
  });

  if (!res.ok) throw new Error("Failed to fetch doctor qualifications");
  return res.json();
};

// ✅ Get doctor availability slots
export const getDoctorAvailabilitySlots = async () => {
  const { apiUrl, headers } = await getAuthHeaders();

  const res = await fetch(`${apiUrl}/ms_doctor_availability_slots`, {
    method: "POST",
    headers,
    body: JSON.stringify({}),
  });

  if (!res.ok) throw new Error("Failed to fetch availability slots");
  return res.json();
};

// ======================
// Doctor Self APIs
// ======================

// Fetch logged-in doctor event schedule (encrypted)
export const getLoggedInDoctorProfile = async () => {
  const { apiUrl, headers } = await getAuthHeaders();
  
  const res = await fetch(`${apiUrl}/dc_doctor_getLoggedInProfile`, {
    method: "POST",
    headers,
    body: JSON.stringify({}),
  });

  if (!res.ok) throw new Error("Failed to fetch doctor profile");

  const json = await res.json();
  if (json.success && json.data) {
    const AES_KEY = await configService.getAesSecretKey();
    const decrypted = decryptAESFromPHP(json.data, AES_KEY);
    return decrypted ? JSON.parse(decrypted) : null;
  }
  return null;
};

export const getMyEventSchedule = async () => {
  const { apiUrl, headers } = await getAuthHeaders();

  const res = await fetch(`${apiUrl}/dc_doctor_getEventSchedule`, {
    method: "POST",
    headers,
    body: JSON.stringify({}),
  });

  if (!res.ok) throw new Error("Failed to fetch doctor schedule");

  const json = await res.json();
  if (json.success && json.data) {
    const AES_KEY = await configService.getAesSecretKey();
    const decrypted = decryptAESFromPHP(json.data, AES_KEY);
    return decrypted ? JSON.parse(decrypted) : [];
  }
  return [];
};

// Fetch logged-in doctor appointments by date (encrypted)
export const getMyAppointmentsByDate = async (date: string) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  const payload = {
    date: CryptoJS.AES.encrypt(String(date), AES_KEY).toString(),
  };

  const res = await fetch(`${apiUrl}/dc_doctor_getAppointmentsByDate`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Failed to fetch appointments");

  const json = await res.json();
  if (json.success && json.data) {
    const decrypted = decryptAESFromPHP(json.data, AES_KEY);
    return decrypted ? JSON.parse(decrypted) : [];
  }
  return [];
};

// Fetch logged-in doctor grouped today's appointments (encrypted)
export const getMyTodaysAppointmentsGrouped = async (date?: string) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  const payload: any = {};
  if (date) {
    payload.date = CryptoJS.AES.encrypt(String(date), AES_KEY).toString();
  }

  const res = await fetch(`${apiUrl}/dc_doctor_getTodaysAppointmentsGrouped`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Failed to fetch today's grouped appointments");

  const json = await res.json();
  if (json.success && json.data) {
    const decrypted = decryptAESFromPHP(json.data, AES_KEY);
    return decrypted ? JSON.parse(decrypted) : { active: [], waiting: [], arrived: [], booked: [], completed: [], draft: [] };
  }
  return { active: [], waiting: [], arrived: [], booked: [], completed: [], draft: [] };
};

// Fetch logged-in doctor upcoming appointments (encrypted)
export const getMyUpcomingAppointments = async (limitDays: number = 30) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  const payload: any = {};
  if (limitDays && Number.isFinite(limitDays)) {
    payload.limitDays = CryptoJS.AES.encrypt(String(limitDays), AES_KEY).toString();
  }

  const res = await fetch(`${apiUrl}/dc_doctor_getUpcomingAppointments`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Failed to fetch upcoming appointments");

  const json = await res.json();
  if (json.success && json.data) {
    const decrypted = decryptAESFromPHP(json.data, AES_KEY);
    return decrypted ? JSON.parse(decrypted) : [];
  }
  return [];
};

// -------------------------------
// 🔄 Update Appointment Status (doctor side, encrypted)
// -------------------------------
export const updateMyAppointmentStatus = async (payload: {
  appointmentId: string;
  date: string; // YYYY-MM-DD
  status: 'booked' | 'arrived' | 'waiting' | 'active' | 'completed';
  doctorId?: string | null; // optional: inferred from token if omitted
  queuePosition?: number | null;
}) => {
  try {
    const { apiUrl, headers } = await getAuthHeaders();
    const AES_KEY = await configService.getAesSecretKey();

    const encryptedPayload: Record<string, string> = {
      appointmentId: CryptoJS.AES.encrypt(String(payload.appointmentId), AES_KEY).toString(),
      date: CryptoJS.AES.encrypt(String(payload.date), AES_KEY).toString(),
      status: CryptoJS.AES.encrypt(String(payload.status), AES_KEY).toString(),
    };
    if (payload.doctorId) {
      encryptedPayload.doctorId = CryptoJS.AES.encrypt(String(payload.doctorId), AES_KEY).toString();
    }
    if (payload.queuePosition !== undefined) {
      encryptedPayload.queuePosition = CryptoJS.AES.encrypt(String(payload.queuePosition ?? ''), AES_KEY).toString();
    }

    // Use existing staff endpoint for updates (works for doctor auth tokens)
    const res = await fetch(`${apiUrl}sf_staff_updateAppointmentStatus`, {
      method: 'POST',
      headers,
      body: JSON.stringify(encryptedPayload),
    });

    if (!res.ok) throw new Error('Failed to update appointment status');
    const json = await res.json();
    if (json.success && json.data) {
      const decrypted = decryptAESFromPHP(json.data, AES_KEY);
      const parsed = decrypted ? JSON.parse(decrypted) : { item: null };
      return { ...json, data: parsed.item };
    }
    return { ...json, data: null };
  } catch (error: any) {
    console.error('Error updating appointment status (doctor):', error);
    return {
      success: false,
      message: error.message || 'Unexpected error while updating appointment status',
      data: null,
    };
  }
};

// -------------------------------
// 📚 Update Queue Positions (doctor side, encrypted)
// -------------------------------
export const updateMyQueuePositions = async (payload: {
  date: string; // YYYY-MM-DD
  orderedIds: string[]; // ordered list of appointment_uids in waiting queue
  doctorId?: string | null; // optional
}) => {
  try {
    const { apiUrl, headers } = await getAuthHeaders();
    const AES_KEY = await configService.getAesSecretKey();

    const encryptedPayload: Record<string, string> = {
      date: CryptoJS.AES.encrypt(String(payload.date), AES_KEY).toString(),
      orderedIds: CryptoJS.AES.encrypt(JSON.stringify(payload.orderedIds), AES_KEY).toString(),
    };
    if (payload.doctorId) {
      encryptedPayload.doctorId = CryptoJS.AES.encrypt(String(payload.doctorId), AES_KEY).toString();
    }

    // Use existing staff endpoint for queue reordering (works for doctor auth tokens)
    const res = await fetch(`${apiUrl}sf_staff_updateQueuePositions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(encryptedPayload),
    });

    if (!res.ok) throw new Error('Failed to update queue positions');
    const json = await res.json();
    if (json.success && json.data) {
      const decrypted = decryptAESFromPHP(json.data, AES_KEY);
      const parsed = decrypted ? JSON.parse(decrypted) : { items: [] };
      return { ...json, data: parsed.items ?? [] };
    }
    return { ...json, data: [] };
  } catch (error: any) {
    console.error('Error updating queue positions (doctor):', error);
    return {
      success: false,
      message: error.message || 'Unexpected error while updating queue positions',
      data: [],
    };
  }
};

// ======================
// Diagnosis Suggestions
// ======================

// Search hospital diagnosis masters (encrypted)
export const searchDiagnosisSuggestions = async (
  search: string,
  page: number = 1,
  limit: number = 8
) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  const res = await fetch(`${apiUrl}dc_doctor_getDiagnosisSuggestions`, {
    method: "POST",
    headers,
    body: JSON.stringify({ search, page, limit }),
  });

  if (!res.ok) throw new Error("Failed to fetch diagnosis suggestions");
  const json = await res.json();
  if (json.success && json.data) {
    const decrypted = decryptAESFromPHP(json.data, AES_KEY);
    return decrypted ? JSON.parse(decrypted) : [];
  }
  return [];
};

// AI-powered diagnosis suggestions (encrypted)
export const searchDiagnosisAISuggestions = async (search: string) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  const res = await fetch(`${apiUrl}dc_doctor_getDiagnosisAISuggestions`, {
    method: "POST",
    headers,
    body: JSON.stringify({ search }),
  });

  if (!res.ok) throw new Error("Failed to fetch AI diagnosis suggestions");
  const json = await res.json();
  if (json.success && json.data) {
    const decrypted = decryptAESFromPHP(json.data, AES_KEY);
    return decrypted ? JSON.parse(decrypted) : [];
  }
  return [];
};

// ======================
// Medication/Lab/Procedure Suggestions
// ======================

// Search hospital medication masters (encrypted)
export const searchMedicationSuggestions = async (
  search: string,
  page: number = 1,
  limit: number = 8
) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  const res = await fetch(`${apiUrl}dc_doctor_getMedicationSuggestions`, {
    method: "POST",
    headers,
    body: JSON.stringify({ search, page, limit }),
  });

  if (!res.ok) throw new Error("Failed to fetch medication suggestions");
  const json = await res.json();
  if (json.success && json.data) {
    const decrypted = decryptAESFromPHP(json.data, AES_KEY);
    return decrypted ? JSON.parse(decrypted) : [];
  }
  return [];
};

// Search hospital lab test masters (encrypted)
export const searchLabTestSuggestions = async (
  search: string,
  page: number = 1,
  limit: number = 8
) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  const res = await fetch(`${apiUrl}dc_doctor_getLabTestSuggestions`, {
    method: "POST",
    headers,
    body: JSON.stringify({ search, page, limit }),
  });

  if (!res.ok) throw new Error("Failed to fetch lab test suggestions");
  const json = await res.json();
  if (json.success && json.data) {
    const decrypted = decryptAESFromPHP(json.data, AES_KEY);
    return decrypted ? JSON.parse(decrypted) : [];
  }
  return [];
};

// Search hospital procedure masters (encrypted)
export const searchProcedureSuggestions = async (
  search: string,
  page: number = 1,
  limit: number = 8
) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  const res = await fetch(`${apiUrl}dc_doctor_getProcedureSuggestions`, {
    method: "POST",
    headers,
    body: JSON.stringify({ search, page, limit }),
  });

  if (!res.ok) throw new Error("Failed to fetch procedure suggestions");
  const json = await res.json();
  if (json.success && json.data) {
    const decrypted = decryptAESFromPHP(json.data, AES_KEY);
    return decrypted ? JSON.parse(decrypted) : [];
  }
  return [];
};

// Combined treatment suggestions by diagnosis (encrypted)
export const fetchTreatmentSuggestionsByDiagnosis = async (
  diagnosis: string,
  medLimit: number = 8,
  labLimit: number = 8
) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  const res = await fetch(`${apiUrl}dc_doctor_getTreatmentSuggestionsByDiagnosis`, {
    method: "POST",
    headers,
    body: JSON.stringify({ diagnosis, medLimit, labLimit }),
  });

  if (!res.ok) throw new Error("Failed to fetch diagnosis-based suggestions");
  const json = await res.json();
  if (json.success && json.data) {
    const decrypted = decryptAESFromPHP(json.data, AES_KEY);
    return decrypted ? JSON.parse(decrypted) : { medications: [], labTests: [] };
  }
  return { medications: [], labTests: [] };
};

// ======================
// Medication Meta (Unit/Frequency/Duration)
// ======================

export const searchMedicationUnitOptions = async (
  search: string = "",
  page: number = 1,
  limit: number = 20
) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  const res = await fetch(`${apiUrl}dc_doctor_getMedicationUnitSuggestions`, {
    method: "POST",
    headers,
    body: JSON.stringify({ search, page, limit }),
  });

  if (!res.ok) throw new Error("Failed to fetch medication units");
  const json = await res.json();
  if (json.success && json.data) {
    const decrypted = decryptAESFromPHP(json.data, AES_KEY);
    return decrypted ? JSON.parse(decrypted) : [];
  }
  return [];
};

export const searchMedicationFrequencyOptions = async (
  search: string = "",
  page: number = 1,
  limit: number = 20
) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  const res = await fetch(`${apiUrl}dc_doctor_getMedicationFrequencySuggestions`, {
    method: "POST",
    headers,
    body: JSON.stringify({ search, page, limit }),
  });

  if (!res.ok) throw new Error("Failed to fetch medication frequencies");
  const json = await res.json();
  if (json.success && json.data) {
    const decrypted = decryptAESFromPHP(json.data, AES_KEY);
    return decrypted ? JSON.parse(decrypted) : [];
  }
  return [];
};

export const searchMedicationDurationOptions = async (
  search: string = "",
  page: number = 1,
  limit: number = 20
) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  const res = await fetch(`${apiUrl}dc_doctor_getMedicationDurationSuggestions`, {
    method: "POST",
    headers,
    body: JSON.stringify({ search, page, limit }),
  });

  if (!res.ok) throw new Error("Failed to fetch medication durations");
  const json = await res.json();
  if (json.success && json.data) {
    const decrypted = decryptAESFromPHP(json.data, AES_KEY);
    return decrypted ? JSON.parse(decrypted) : [];
  }
  return [];
};

// AI-powered medication suggestions (encrypted)
export const searchMedicationAISuggestions = async (search: string) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  const res = await fetch(`${apiUrl}dc_doctor_getMedicationAISuggestions`, {
    method: "POST",
    headers,
    body: JSON.stringify({ search }),
  });

  if (!res.ok) throw new Error("Failed to fetch AI medication suggestions");
  const json = await res.json();
  if (json.success && json.data) {
    const decrypted = decryptAESFromPHP(json.data, AES_KEY);
    return decrypted ? JSON.parse(decrypted) : [];
  }
  return [];
};

// AI-powered lab test suggestions (encrypted)
export const searchLabTestAISuggestions = async (search: string) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  const res = await fetch(`${apiUrl}dc_doctor_getLabTestAISuggestions`, {
    method: "POST",
    headers,
    body: JSON.stringify({ search }),
  });

  if (!res.ok) throw new Error("Failed to fetch AI lab test suggestions");
  const json = await res.json();
  if (json.success && json.data) {
    const decrypted = decryptAESFromPHP(json.data, AES_KEY);
    return decrypted ? JSON.parse(decrypted) : [];
  }
  return [];
};

// AI-powered procedure suggestions (encrypted)
export const searchProcedureAISuggestions = async (search: string) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  const res = await fetch(`${apiUrl}dc_doctor_getProcedureAISuggestions`, {
    method: "POST",
    headers,
    body: JSON.stringify({ search }),
  });

  if (!res.ok) throw new Error("Failed to fetch AI procedure suggestions");
  const json = await res.json();
  if (json.success && json.data) {
    const decrypted = decryptAESFromPHP(json.data, AES_KEY);
    return decrypted ? JSON.parse(decrypted) : [];
  }
  return [];
};

// ======================
// Patient History
// ======================

// Fetch grouped patient history categories and items (encrypted)
export const fetchPatientHistoryCategories = async () => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  const res = await fetch(`${apiUrl}dc_doctor_getPatientHistoryCategories`, {
    method: "POST",
    headers,
    body: JSON.stringify({}),
  });

  if (!res.ok) throw new Error("Failed to fetch patient history categories");
  const json = await res.json();
  if (json.success && json.data) {
    const decrypted = decryptAESFromPHP(json.data, AES_KEY);
    return decrypted ? JSON.parse(decrypted) : [];
  }
  return [];
};

// ======================
// Common Complaints (Purpose of Visit)
// ======================

// Fetch grouped common complaints from ms_hospital_common_complaints_master (encrypted)
export const fetchCommonComplaintsGrouped = async () => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  const res = await fetch(`${apiUrl}dc_doctor_getCommonComplaintsGrouped`, {
    method: "POST",
    headers,
    body: JSON.stringify({}),
  });

  if (!res.ok) throw new Error("Failed to fetch common complaints");
  const json = await res.json();
  if (json.success && json.data) {
    const decrypted = decryptAESFromPHP(json.data, AES_KEY);
    return decrypted ? JSON.parse(decrypted) : [];
  }
  return [];
};

// Search hospital medication timing masters (encrypted)
export const searchMedicationTimingSuggestions = async (
  search: string = ""
) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  const res = await fetch(`${apiUrl}/SFDoctorController/getMedicationTimings`, {
    method: "POST",
    headers,
    body: JSON.stringify({ search }),
  });

  if (!res.ok) throw new Error("Failed to fetch medication timing suggestions");
  const json = await res.json();
  if (json.success && json.data) {
    const decrypted = decryptAESFromPHP(json.data, AES_KEY);
    return decrypted ? JSON.parse(decrypted) : [];
  }
  return [];
};