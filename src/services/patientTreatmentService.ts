import Cookies from "js-cookie";
import { configService } from "./configService";
import { encryptAESForPHP, decryptAESFromPHP } from "../utils/aesDecrypt";

const getAuthHeaders = async () => {
  const token = Cookies.get("token");
  let apiUrl = await configService.getApiUrl();
  
  if (apiUrl.endsWith('/')) {
    apiUrl = apiUrl.slice(0, -1);
  }

  if (!token) throw new Error("No auth token found");

  return {
    apiUrl,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };
};

export const saveTreatment = async (data: any) => {
    const { apiUrl, headers } = await getAuthHeaders();
    const aesKey = await configService.getAesSecretKey();
    
    // Encrypt payload
    const payload = encryptAESForPHP(JSON.stringify(data), aesKey);
    if (!payload) throw new Error("Encryption failed");

    const res = await fetch(`${apiUrl}/patient_treatment_save`, {
        method: "POST",
        headers,
        body: JSON.stringify({ payload }),
    });
    
    if (!res.ok) {
        throw new Error("Failed to save treatment");
    }
    
    const response = await res.json();
    
    if (response.success && response.data) {
        const decrypted = decryptAESFromPHP(response.data, aesKey);
        if (decrypted) {
            return JSON.parse(decrypted);
        }
    }
    
    return response;
}

export const getTreatment = async (appointmentId: string | number) => {
    const { apiUrl, headers } = await getAuthHeaders();
    const aesKey = await configService.getAesSecretKey();
    
    // Encrypt payload
    const payload = encryptAESForPHP(JSON.stringify({ appointment_id: appointmentId }), aesKey);
    if (!payload) throw new Error("Encryption failed");

    const res = await fetch(`${apiUrl}/patient_treatment_get`, {
        method: "POST",
        headers,
        body: JSON.stringify({ payload }),
    });
    
    if (!res.ok) {
        throw new Error("Failed to get treatment");
    }
    
    const response = await res.json();

    if (response.success && response.data) {
        // If data is string, it's encrypted. If it's object (unlikely with new backend), it's raw.
        if (typeof response.data === 'string') {
            const decrypted = decryptAESFromPHP(response.data, aesKey);
            if (decrypted) {
                // The decrypted content is { success: true, data: { ...treatment } } or similar?
                // Backend: json_encode(['success' => true, 'data' => $treatment])
                const innerResponse = JSON.parse(decrypted);
                return innerResponse;
            }
        }
    }
    
    return response;
}

export const uploadReport = async (
  file: File,
  treatmentId: string,
  additionalData?: { isCombined?: boolean; coveredTestIds?: string[]; labTestId?: string }
) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const { "Content-Type": contentType, ...uploadHeaders } = headers;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("treatment_id", treatmentId);

  if (additionalData) {
    if (additionalData.isCombined !== undefined) {
      formData.append("is_combined", additionalData.isCombined ? "1" : "0");
    }
    
    // Add lab_test_id if provided
    if (additionalData.labTestId) {
        formData.append("lab_test_id", additionalData.labTestId);
    }

    const ids =
      additionalData.coveredTestIds && additionalData.coveredTestIds.length
        ? additionalData.coveredTestIds
        : additionalData.labTestId
        ? [additionalData.labTestId]
        : [];
    if (ids.length) {
      formData.append("covered_tests", JSON.stringify(ids));
    }
  }

  const res = await fetch(`${apiUrl}/patient_treatment_upload_report`, {
    method: "POST",
    headers: uploadHeaders,
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Failed to upload report");
  }

  const response = await res.json();
  return response;
}

export const deleteReport = async (reportId: string | number) => {
  const { apiUrl, headers } = await getAuthHeaders();
  
  const formData = new FormData();
  formData.append("report_id", String(reportId));

  const res = await fetch(`${apiUrl}/patient_treatment_delete_report`, {
    method: "POST",
    headers: {
        Authorization: headers.Authorization
        // Do not set Content-Type for FormData, let browser set boundary
    },
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Failed to delete report");
  }

  return res.json();
}

export const getPatientDetails = async (patientId: string | number) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const aesKey = await configService.getAesSecretKey();

  const encryptedId = encryptAESForPHP(String(patientId), aesKey);
  if (!encryptedId) throw new Error("Encryption failed");

  const res = await fetch(`${apiUrl}/dc_doctor_getPatientDetails`, {
    method: "POST",
    headers,
    body: JSON.stringify({ id: encryptedId }),
  });
  if (!res.ok) throw new Error("Failed to get patient details");
  
  const response = await res.json();
  if (response.success && response.data && typeof response.data === 'string') {
      const decrypted = decryptAESFromPHP(response.data, aesKey);
      if (decrypted) {
          return { success: true, data: JSON.parse(decrypted) };
      }
  }
  return response;
}

export const getPatientVisitHistory = async (patientId: string | number) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const aesKey = await configService.getAesSecretKey();

  const encryptedId = encryptAESForPHP(String(patientId), aesKey);
  if (!encryptedId) throw new Error("Encryption failed");

  const res = await fetch(`${apiUrl}/dc_doctor_getPatientVisitHistory`, {
    method: "POST",
    headers,
    body: JSON.stringify({ id: encryptedId }),
  });
  if (!res.ok) throw new Error("Failed to get visit history");
  
  const response = await res.json();
  if (response.success && response.data && typeof response.data === 'string') {
      const decrypted = decryptAESFromPHP(response.data, aesKey);
      if (decrypted) {
          return { success: true, data: JSON.parse(decrypted) };
      }
  }
  return response;
}

export const getPatientsByDate = async (date: string) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const aesKey = await configService.getAesSecretKey();

  const payload = {
    date: encryptAESForPHP(String(date), aesKey),
  };

  const res = await fetch(`${apiUrl}/dc_doctor_getAppointmentsByDate`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Failed to fetch patients for date");
  const json = await res.json();
  if (json.success && json.data) {
    const decrypted = decryptAESFromPHP(json.data, aesKey);
    return decrypted ? JSON.parse(decrypted) : [];
  }
  return [];
}
