import { configService } from "./configService";

export interface PublicHospitalInfo {
  id: number;
  name: string;
  hosuid?: string;
}

// Fetch hospital details by public hosuid (e.g., HOS_68ce387acd6a3)
export const fetchPublicHospitalInfo = async (hosuid: string): Promise<PublicHospitalInfo> => {
  const apiUrl = await configService.getApiUrl();
  const res = await fetch(`${apiUrl}/public_home_hospital_info`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ hosuid }),
  });
  if (!res.ok) throw new Error("Failed to fetch public hospital info");
  const json = await res.json();
  const item = json.item || json.data || {};
  const id = Number(item.hospital_id ?? item.id ?? 0);
  const rawName = item.hospital_name ?? item.name ?? "";
  const name = typeof rawName === "string" ? rawName : String(rawName ?? "");
  return {
    id,
    name,
    hosuid: String(item.hosuid ?? hosuid),
  };
};

// Persist current hospital info for use across chats
const HOSPITAL_ID_KEY = "currentHospitalId";
const HOSPITAL_NAME_KEY = "currentHospitalName";

export const setCurrentHospital = (info: { id: number; name: string }) => {
  try {
    localStorage.setItem(HOSPITAL_ID_KEY, String(info.id));
    localStorage.setItem(HOSPITAL_NAME_KEY, info.name);
  } catch {
    // ignore storage errors
  }
};

export const getCurrentHospitalId = (): number | null => {
  try {
    const v = localStorage.getItem(HOSPITAL_ID_KEY);
    if (!v) return null;
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
};

export const getCurrentHospitalName = (): string | null => {
  try {
    const v = localStorage.getItem(HOSPITAL_NAME_KEY);
    return v || null;
  } catch {
    return null;
  }
};
