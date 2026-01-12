import Cookies from "js-cookie";
import { configService } from "./configService";
import { decryptAESFromPHP } from "@/utils/aesDecrypt";
import CryptoJS from "crypto-js";

const getAuthHeaders = async () => {
  const apiUrl = await configService.getApiUrl();
  let token = Cookies.get("labToken");
  if (!token) {
    token = Cookies.get("token") || "";
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

export const fetchMasterLabTests = async (page = 1, limit = 10, search = "", department = "all", status = "all") => {
  const { apiUrl, headers } = await getAuthHeaders();
  const res = await fetch(`${apiUrl}laboratories_lab_test_list`, {
    method: "POST",
    headers,
    body: JSON.stringify({ page, limit, search, department, status }),
  });
  if (!res.ok) throw new Error("Failed to fetch master lab tests");
  const json = await res.json();
  if (json.success && json.data) {
    const AES_KEY = await configService.getAesSecretKey();
    const decrypted = decryptAESFromPHP(json.data, AES_KEY);
    return { ...json, data: decrypted ? JSON.parse(decrypted) : [] };
  }
  return json;
};

export const fetchRecentOrders = async () => {
  const { apiUrl, headers } = await getAuthHeaders();
  const res = await fetch(`${apiUrl}laboratories_recent_orders`, {
    method: "POST",
    headers,
  });
  if (!res.ok) throw new Error("Failed to fetch recent orders");
  const json = await res.json();
  if (json.success && json.data) {
    const AES_KEY = await configService.getAesSecretKey();
    const decrypted = decryptAESFromPHP(json.data, AES_KEY);
    return decrypted ? JSON.parse(decrypted) : [];
  }
  return [];
};

export const fetchAllOrders = async () => {
  const { apiUrl, headers } = await getAuthHeaders();
  const res = await fetch(`${apiUrl}laboratories_all_orders`, {
    method: "POST",
    headers,
  });
  if (!res.ok) throw new Error("Failed to fetch all orders");
  const json = await res.json();
  if (json.success && json.data) {
    const AES_KEY = await configService.getAesSecretKey();
    const decrypted = decryptAESFromPHP(json.data, AES_KEY);
    return decrypted ? JSON.parse(decrypted) : [];
  }
  return [];
};

export const fetchDashboardStats = async () => {
  const { apiUrl, headers } = await getAuthHeaders();
  const res = await fetch(`${apiUrl}laboratories_dashboard_stats`, {
    method: "POST",
    headers,
  });
  if (!res.ok) throw new Error("Failed to fetch dashboard stats");
  const json = await res.json();
  if (json.success && json.data) {
    const AES_KEY = await configService.getAesSecretKey();
    const decrypted = decryptAESFromPHP(json.data, AES_KEY);
    return decrypted ? JSON.parse(decrypted) : null;
  }
  return null;
};

export const uploadGeneratedReport = async (formData: FormData) => {
  const { apiUrl, headers } = await getAuthHeaders();
  // Remove Content-Type header to let browser set it with boundary for FormData
  const { "Content-Type": contentType, ...restHeaders } = headers;
  
  const res = await fetch(`${apiUrl}laboratories_upload_report`, {
    method: "POST",
    headers: restHeaders,
    body: formData,
  });
  
  if (!res.ok) throw new Error("Failed to upload report");
  return await res.json();
};

export const fetchProcessingQueue = async () => {
  const { apiUrl, headers } = await getAuthHeaders();
  const res = await fetch(`${apiUrl}laboratories_processing_queue`, {
    method: "POST",
    headers,
  });
  if (!res.ok) throw new Error("Failed to fetch processing queue");
  const json = await res.json();
  if (json.success && json.data) {
    const AES_KEY = await configService.getAesSecretKey();
    const decrypted = decryptAESFromPHP(json.data, AES_KEY);
    return decrypted ? JSON.parse(decrypted) : [];
  }
  return [];
};

export const fetchValidationQueue = async () => {
  const { apiUrl, headers } = await getAuthHeaders();
  const res = await fetch(`${apiUrl}laboratories_validation_queue`, {
    method: "POST",
    headers,
  });
  if (!res.ok) throw new Error("Failed to fetch validation queue");
  const json = await res.json();
  if (json.success && json.data) {
    const AES_KEY = await configService.getAesSecretKey();
    const decrypted = decryptAESFromPHP(json.data, AES_KEY);
    return decrypted ? JSON.parse(decrypted) : [];
  }
  return [];
};

export const fetchCompletedReports = async () => {
  const { apiUrl, headers } = await getAuthHeaders();
  const res = await fetch(`${apiUrl}laboratories_reports_completed`, {
    method: "POST",
    headers,
  });
  if (!res.ok) throw new Error("Failed to fetch completed reports");
  const json = await res.json();
  if (json.success && json.data) {
    const AES_KEY = await configService.getAesSecretKey();
    const decrypted = decryptAESFromPHP(json.data, AES_KEY);
    return decrypted ? JSON.parse(decrypted) : [];
  }
  return [];
};
export const cloneMasterTests = async (ids: string[]) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const res = await fetch(`${apiUrl}laboratories_clone_master`, {
    method: "POST",
    headers,
    body: JSON.stringify({ ids }),
  });
  if (!res.ok) throw new Error("Failed to clone tests");
  return res.json();
};

export const getMasterLabTestById = async (id: string) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const res = await fetch(`${apiUrl}laboratories_testinfo_get`, {
    method: "POST",
    headers,
    body: JSON.stringify({ id }),
  });
  if (!res.ok) throw new Error("Failed to fetch master lab test details");
  const json = await res.json();
  if (json.success && json.data) {
    const AES_KEY = await configService.getAesSecretKey();
    const decrypted = decryptAESFromPHP(json.data, AES_KEY);
    return { ...json, data: decrypted ? JSON.parse(decrypted) : null };
  }
  return json;
};

export const addMasterLabTest = async (data: any) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();
  const encryptedPayload = CryptoJS.AES.encrypt(JSON.stringify(data), AES_KEY).toString();
  
  const res = await fetch(`${apiUrl}laboratories_testInfo_add`, {
    method: "POST",
    headers,
    body: JSON.stringify({ encrypted_payload: encryptedPayload }),
  });
  if (!res.ok) throw new Error("Failed to add master lab test");
  return res.json();
};

export const updateMasterLabTest = async (id: string, data: any) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();
  // Ensure ID is in the data payload as required by the backend
  const payload = { ...data, id };
  const encryptedPayload = CryptoJS.AES.encrypt(JSON.stringify(payload), AES_KEY).toString();

  const res = await fetch(`${apiUrl}laboratories_testInfo_update`, {
    method: "POST",
    headers,
    body: JSON.stringify({ encrypted_payload: encryptedPayload }),
  });
  if (!res.ok) throw new Error("Failed to update master lab test");
  return res.json();
};

export const deleteMasterLabTest = async (id: string) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const res = await fetch(`${apiUrl}laboratories_testInfo_delete`, {
    method: "POST",
    headers,
    body: JSON.stringify({ id }),
  });
  if (!res.ok) throw new Error("Failed to delete master lab test");
  return res.json();
};

export const fetchMasterCatalog = async (search = "", department = "all") => {
  const { apiUrl, headers } = await getAuthHeaders();
  const res = await fetch(`${apiUrl}laboratories_master_catalog`, {
    method: "POST",
    headers,
    body: JSON.stringify({ search, department }),
  });
  if (!res.ok) throw new Error("Failed to fetch master catalog");
  const json = await res.json();
  if (json.success && json.data) {
    const AES_KEY = await configService.getAesSecretKey();
    const decrypted = decryptAESFromPHP(json.data, AES_KEY);
    return { ...json, data: decrypted ? JSON.parse(decrypted) : [] };
  }
  return json;
};

export const collectSample = async (data: any) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();
  const encryptedPayload = CryptoJS.AES.encrypt(JSON.stringify(data), AES_KEY).toString();

  const res = await fetch(`${apiUrl}laboratories_collect_sample`, {
    method: "POST",
    headers,
    body: JSON.stringify({ encrypted_payload: encryptedPayload }),
  });
  if (!res.ok) {
    try {
      const err = await res.json();
      throw new Error(err?.message || "Failed to collect sample");
    } catch {
      throw new Error("Failed to collect sample");
    }
  }
  return res.json();
};

export const saveDraft = async (data: any) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const res = await fetch(`${apiUrl}laboratories_save_draft`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to save draft");
  return res.json();
};

export const getDrafts = async (orderId: string, testId?: string) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const res = await fetch(`${apiUrl}laboratories_get_drafts`, {
    method: "POST",
    headers,
    body: JSON.stringify({ order_id: orderId, test_id: testId }),
  });
  if (!res.ok) throw new Error("Failed to fetch drafts");
  const json = await res.json();
  if (json.success && json.data) {
    const AES_KEY = await configService.getAesSecretKey();
    const decrypted = decryptAESFromPHP(json.data, AES_KEY);
    return decrypted ? JSON.parse(decrypted) : [];
  }
  return [];
};

export const submitValidation = async (orderId: string, testId?: string) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const res = await fetch(`${apiUrl}laboratories_submit_validation`, {
    method: "POST",
    headers,
    body: JSON.stringify({ order_id: orderId, test_id: testId }),
  });
  if (!res.ok) throw new Error("Failed to submit for validation");
  return res.json();
};

export const fetchCollectedSamples = async (orderId: string, testId?: string) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const res = await fetch(`${apiUrl}laboratories_collected_samples`, {
    method: "POST",
    headers,
    body: JSON.stringify({ order_id: orderId, test_id: testId || "" }),
  });
  if (!res.ok) throw new Error("Failed to fetch collected samples");
  const json = await res.json();
  if (json.success && json.data) {
    const AES_KEY = await configService.getAesSecretKey();
    const decrypted = decryptAESFromPHP(json.data, AES_KEY);
    return decrypted ? JSON.parse(decrypted) : [];
  }
  return [];
};

export const updateLabOrderStatus = async (orderId: string, status: string) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const res = await fetch(`${apiUrl}laboratories_update_order_status`, {
    method: "POST",
    headers,
    body: JSON.stringify({ order_id: orderId, status }),
  });
  if (!res.ok) {
    try {
      const err = await res.json();
      throw new Error(err?.message || "Failed to update order status");
    } catch {
      throw new Error("Failed to update order status");
    }
  }
  return res.json();
};

export const approveAndGenerateReport = async (orderId: string, testIds?: string[], comments?: string) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const res = await fetch(`${apiUrl}laboratories_approve_generate_report`, {
    method: "POST",
    headers,
    body: JSON.stringify({ order_id: orderId, test_ids: testIds, comments }),
  });
  if (!res.ok) throw new Error("Failed to approve and generate report");
  return res.json();
};

export const fetchReportDetails = async (orderId: string) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const res = await fetch(`${apiUrl}laboratories_report_details?order_id=${orderId}`, {
    method: "GET",
    headers,
  });
  
  if (!res.ok) throw new Error("Failed to fetch report details");
  const json = await res.json();
  if (json.success && json.data) {
    const AES_KEY = await configService.getAesSecretKey();
    const decrypted = decryptAESFromPHP(json.data, AES_KEY);
    return decrypted ? JSON.parse(decrypted) : null;
  }
  return null;
};
