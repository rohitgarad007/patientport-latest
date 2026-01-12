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

type StatusNum = "1" | "0";
type StatusStr = "active" | "inactive";

interface TreatmentItem {
  id: number;
  name: string;
  description?: string;
  status: StatusStr;
}

interface ListResponse {
  items: TreatmentItem[];
  total: number;
  page: number;
  limit: number;
}

const encryptPayload = async (data: Record<string, any>) => {
  const AES_KEY = await configService.getAesSecretKey();
  const encrypted: any = {};
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      encrypted[key] = CryptoJS.AES.encrypt(String(data[key] ?? ""), AES_KEY).toString();
    }
  }
  return encrypted;
};

const decryptList = async (json: any): Promise<ListResponse> => {
  const AES_KEY = await configService.getAesSecretKey();
  const decrypted = decryptAESFromPHP(json.data, AES_KEY);
  const parsed = decrypted ? JSON.parse(decrypted) : { items: [], total: 0, page: 1, limit: 10 };
  const items: TreatmentItem[] = (parsed.items || []).map((row: any) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    status: row.status === 1 || row.status === "1" ? "active" : "inactive",
  }));
  return { items, total: parsed.total || 0, page: parsed.page || 1, limit: parsed.limit || 10 };
};

// Generic list
const fetchList = async (endpoint: string, page = 1, limit = 10, search = "") => {
  const { apiUrl, headers } = await getAuthHeaders();
  const encrypted = await encryptPayload({ page, limit, search });
  const res = await fetch(`${apiUrl}/${endpoint}`, { method: "POST", headers, body: JSON.stringify(encrypted) });
  if (!res.ok) throw new Error(`Failed to fetch list: ${endpoint}`);
  const json = await res.json();
  if (json.success && json.data) return decryptList(json);
  return { items: [], total: 0, page, limit } as ListResponse;
};

// Generic add
const addItem = async (endpoint: string, data: { name: string; description?: string; status: StatusNum }) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const encrypted = await encryptPayload(data);
  const res = await fetch(`${apiUrl}/${endpoint}`, { method: "POST", headers, body: JSON.stringify(encrypted) });
  if (!res.ok) throw new Error(`Failed to add item: ${endpoint}`);
  return res.json();
};

// Generic update
const updateItem = async (endpoint: string, id: number, data: { name: string; description?: string; status: StatusNum }) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const encrypted = await encryptPayload({ id, ...data });
  const res = await fetch(`${apiUrl}/${endpoint}`, { method: "POST", headers, body: JSON.stringify(encrypted) });
  if (!res.ok) throw new Error(`Failed to update item: ${endpoint}`);
  return res.json();
};

// Generic delete
const deleteItem = async (endpoint: string, id: number) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const encrypted = await encryptPayload({ id });
  const res = await fetch(`${apiUrl}/${endpoint}`, { method: "POST", headers, body: JSON.stringify(encrypted) });
  if (!res.ok) throw new Error(`Failed to delete item: ${endpoint}`);
  return res.json();
};

// Diagnosis
export const fetchDiagnosis = (page = 1, limit = 10, search = "") => fetchList("hs_treatment_diagnosis_list", page, limit, search);
export const addDiagnosis = (payload: { name: string; description?: string; status: StatusNum }) => addItem("hs_treatment_diagnosis_add", payload);
export const updateDiagnosis = (id: number, payload: { name: string; description?: string; status: StatusNum }) => updateItem("hs_treatment_diagnosis_update", id, payload);
export const deleteDiagnosis = (id: number) => deleteItem("hs_treatment_diagnosis_delete", id);

// Medication Name
export const fetchMedicationNames = (page = 1, limit = 10, search = "") => fetchList("hs_treatment_medication_name_list", page, limit, search);
export const addMedicationName = (payload: { name: string; description?: string; status: StatusNum }) => addItem("hs_treatment_medication_name_add", payload);
export const updateMedicationName = (id: number, payload: { name: string; description?: string; status: StatusNum }) => updateItem("hs_treatment_medication_name_update", id, payload);
export const deleteMedicationName = (id: number) => deleteItem("hs_treatment_medication_name_delete", id);

// Medication Unit
export const fetchMedicationUnits = (page = 1, limit = 10, search = "") => fetchList("hs_treatment_medication_unit_list", page, limit, search);
export const addMedicationUnit = (payload: { name: string; description?: string; status: StatusNum }) => addItem("hs_treatment_medication_unit_add", payload);
export const updateMedicationUnit = (id: number, payload: { name: string; description?: string; status: StatusNum }) => updateItem("hs_treatment_medication_unit_update", id, payload);
export const deleteMedicationUnit = (id: number) => deleteItem("hs_treatment_medication_unit_delete", id);

// Medication Frequency
export const fetchMedicationFrequencies = (page = 1, limit = 10, search = "") => fetchList("hs_treatment_medication_frequency_list", page, limit, search);
export const addMedicationFrequency = (payload: { name: string; description?: string; status: StatusNum }) => addItem("hs_treatment_medication_frequency_add", payload);
export const updateMedicationFrequency = (id: number, payload: { name: string; description?: string; status: StatusNum }) => updateItem("hs_treatment_medication_frequency_update", id, payload);
export const deleteMedicationFrequency = (id: number) => deleteItem("hs_treatment_medication_frequency_delete", id);

// Medication Duration
export const fetchMedicationDurations = (page = 1, limit = 10, search = "") => fetchList("hs_treatment_medication_duration_list", page, limit, search);
export const addMedicationDuration = (payload: { name: string; description?: string; status: StatusNum }) => addItem("hs_treatment_medication_duration_add", payload);
export const updateMedicationDuration = (id: number, payload: { name: string; description?: string; status: StatusNum }) => updateItem("hs_treatment_medication_duration_update", id, payload);
export const deleteMedicationDuration = (id: number) => deleteItem("hs_treatment_medication_duration_delete", id);

// Lab Tests
export const fetchLabTests = (page = 1, limit = 10, search = "") => fetchList("hs_treatment_lab_tests_list", page, limit, search);
export const cloneLabTests = async (ids: number[]) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const encrypted = await encryptPayload({ ids: JSON.stringify(ids) });
  const res = await fetch(`${apiUrl}/hs_treatment_lab_tests_clone`, { method: "POST", headers, body: JSON.stringify(encrypted) });
  if (!res.ok) throw new Error("Failed to clone lab tests");
  return res.json();
};

export const fetchMasterCatalog = async (search = "") => {
  const { apiUrl, headers } = await getAuthHeaders();
  const encrypted = await encryptPayload({ search });
  const res = await fetch(`${apiUrl}/hs_treatment_master_catalog`, { method: "POST", headers, body: JSON.stringify(encrypted) });
  if (!res.ok) throw new Error("Failed to fetch master catalog");
  const json = await res.json();
  if (json.success && json.data) {
    const AES_KEY = await configService.getAesSecretKey();
    const decrypted = decryptAESFromPHP(json.data, AES_KEY);
    return { ...json, data: decrypted ? JSON.parse(decrypted) : [] };
  }
  return json;
};

export const addLabTest = (payload: { name: string; description?: string; status: StatusNum }) => addItem("hs_treatment_lab_tests_add", payload);
export const updateLabTest = (id: number, payload: { name: string; description?: string; status: StatusNum }) => updateItem("hs_treatment_lab_tests_update", id, payload);
export const deleteLabTest = (id: number) => deleteItem("hs_treatment_lab_tests_delete", id);

// Procedure
export const fetchProcedures = (page = 1, limit = 10, search = "") => fetchList("hs_treatment_procedure_list", page, limit, search);
export const addProcedure = (payload: { name: string; description?: string; status: StatusNum }) => addItem("hs_treatment_procedure_add", payload);
export const updateProcedure = (id: number, payload: { name: string; description?: string; status: StatusNum }) => updateItem("hs_treatment_procedure_update", id, payload);
export const deleteProcedure = (id: number) => deleteItem("hs_treatment_procedure_delete", id);

