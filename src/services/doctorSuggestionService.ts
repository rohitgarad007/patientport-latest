import Cookies from "js-cookie";
import CryptoJS from "crypto-js";
import { configService } from "./configService";
import { decryptAESFromPHP } from "@/utils/aesDecrypt";
import type { ConsultationSummary } from "@/data/consultationSummaries";

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

export async function submitTreatmentSuggestion(params: {
  diagnosis: any; // structured object used in UI summary
  labTests: string[];
  historyItemIds: (string | number)[];
  medications: any[];
  instructions?: string;
  doctorId?: number; // optional for staff submissions
}) {
  const { apiUrl, headers } = await getAuthHeaders();
  const url = `${apiUrl}SFDoctorController/submitTreatmentSuggestion`;

  const AES_KEY = "RohitGaradHos@173414";

  const enc = (val: string | number | undefined | null) => {
    if (val === undefined || val === null) return undefined as any;
    const str = typeof val === "string" ? val : String(val);
    const cipher = CryptoJS.AES.encrypt(str, AES_KEY).toString();
    return cipher;
  };

  const encJson = (obj: any) => {
    if (obj === undefined || obj === null) return undefined as any;
    const str = JSON.stringify(obj);
    const cipher = CryptoJS.AES.encrypt(str, AES_KEY).toString();
    return cipher;
  };

  const body = {
    diagnosis: encJson(params.diagnosis ?? {}),
    labTests: encJson(params.labTests ?? []),
    historyItemIds: encJson(params.historyItemIds ?? []),
    medications: encJson(params.medications ?? []),
    instructions: enc(params.instructions ?? ""),
    doctorId: params.doctorId !== undefined ? enc(params.doctorId) : undefined,
  };

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  const response = await res.json();
  if (!response?.success) {
    return { success: false, message: response?.message || "Submission failed" };
  }
  // decrypt suggestion uid payload if provided
  let suggestionUid: string | undefined = undefined;
  if (response?.data) {
    const decrypted = decryptAESFromPHP(response.data, AES_KEY);
    try {
      const obj = JSON.parse(decrypted);
      suggestionUid = obj?.suggestion_uid;
    } catch (e) {
      // ignore parse errors; proceed with success message
    }
  }

  return {
    success: true,
    message: response?.message || "Suggestion saved successfully",
    suggestionUid,
  };
}

export async function fetchTreatmentSuggestions(params?: {
  page?: number;
  limit?: number;
  doctorId?: number; // optional, staff can filter by doctor
}): Promise<{ success: boolean; data: ConsultationSummary[]; message?: string; page?: number; limit?: number; }>{
  const { apiUrl, headers } = await getAuthHeaders();
  const url = `${apiUrl}/SFDoctorController/getTreatmentSuggestions`;

  const AES_KEY = "RohitGaradHos@173414";

  const enc = (val: string | number | undefined | null) => {
    if (val === undefined || val === null) return undefined as any;
    const str = typeof val === "string" ? val : String(val);
    const cipher = CryptoJS.AES.encrypt(str, AES_KEY).toString();
    return cipher;
  };

  const body: any = {
    page: params?.page ?? 1,
    limit: params?.limit ?? 12,
  };
  if (params?.doctorId !== undefined) body.doctorId = enc(params.doctorId);

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const response = await res.json();
  if (!response?.success) {
    return { success: false, data: [], message: response?.message || "Failed to load suggestions" };
  }
  const decrypted = decryptAESFromPHP(response.data, AES_KEY);
  let arr: ConsultationSummary[] = [];
  try {
    const parsed = JSON.parse(decrypted);
    if (Array.isArray(parsed)) arr = parsed as ConsultationSummary[];
  } catch (e) {
    // ignore
  }
  return { success: true, data: arr, page: response?.page, limit: response?.limit };
}

export async function fetchTreatmentSuggestionDetail(suggestionUid: string): Promise<{ success: boolean; data?: { suggestionUid: string; diagnosis: any; labTests: string[]; historyItemIds: (string|number)[]; medications: any[]; instructions?: string; doctorId?: number; }; message?: string }>{
  const { apiUrl, headers } = await getAuthHeaders();
  const url = `${apiUrl}/SFDoctorController/getTreatmentSuggestionDetail`;
  const AES_KEY = "RohitGaradHos@173414";
  const cipher = CryptoJS.AES.encrypt(suggestionUid, AES_KEY).toString();
  const res = await fetch(url, { method: "POST", headers, body: JSON.stringify({ suggestionUid: cipher }) });
  const response = await res.json();
  if (!response?.success) return { success: false, message: response?.message || "Failed to load suggestion" };
  const decrypted = decryptAESFromPHP(response.data, AES_KEY);
  try {
    const obj = JSON.parse(decrypted);
    return { success: true, data: obj };
  } catch (e) {
    return { success: false, message: "Failed to parse suggestion data" };
  }
}

export async function updateTreatmentSuggestion(params: {
  suggestionUid: string;
  diagnosis: any;
  labTests: string[];
  historyItemIds: (string | number)[];
  medications: any[];
  instructions?: string;
}): Promise<{ success: boolean; message?: string }>{
  const { apiUrl, headers } = await getAuthHeaders();
  const url = `${apiUrl}/SFDoctorController/updateTreatmentSuggestion`;
  const AES_KEY = "RohitGaradHos@173414";
  const enc = (val: string | number | undefined | null) => {
    if (val === undefined || val === null) return undefined as any;
    const str = typeof val === "string" ? val : String(val);
    return CryptoJS.AES.encrypt(str, AES_KEY).toString();
  };
  const encJson = (obj: any) => {
    if (obj === undefined || obj === null) return undefined as any;
    const str = JSON.stringify(obj);
    return CryptoJS.AES.encrypt(str, AES_KEY).toString();
  };
  const body = {
    suggestionUid: enc(params.suggestionUid),
    diagnosis: encJson(params.diagnosis ?? {}),
    labTests: encJson(params.labTests ?? []),
    historyItemIds: encJson(params.historyItemIds ?? []),
    medications: encJson(params.medications ?? []),
    instructions: enc(params.instructions ?? ""),
  };
  const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
  const response = await res.json();
  if (!response?.success) return { success: false, message: response?.message || "Failed to update suggestion" };
  return { success: true, message: response?.message || "Suggestion updated successfully" };
}
