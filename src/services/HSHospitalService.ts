// services/HSHospitalService.ts
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

// ✅ Fetch hospitals with pagination & search (POST with body)
export const fetchHospitals = async (page = 1, limit = 10, search = "") => {
  const { apiUrl, headers } = await getAuthHeaders();

  const res = await fetch(`${apiUrl}/hs_hospitals_list`, {
    method: "POST",
    headers,
    body: JSON.stringify({ page, limit, search }),
  });

  if (!res.ok) throw new Error("Failed to fetch hospitals");
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


interface ShiftPayload {
  name: string;
  start_time: string;
  end_time: string;
  status: "1" | "0"; // backend expects 1 or 0
}

interface ShiftTime {
  shiftuid: string;
  name: string;
  start_time: string;
  end_time: string;
  status: "active" | "inactive";
}



// ✅ Fetch Shift Time List
export const fetchShiftTimes = async (page = 1, limit = 20, search = "") => {
  const { apiUrl, headers } = await getAuthHeaders();

  const res = await fetch(`${apiUrl}/hs_shift_time_list`, {
    method: "POST",
    headers,
    body: JSON.stringify({ page, limit, search }),
  });

  if (!res.ok) throw new Error("Failed to fetch shift times");

  const json = await res.json();
  if (json.success && json.data) {
    const AES_KEY = await configService.getAesSecretKey();
    const decrypted = decryptAESFromPHP(json.data, AES_KEY);
    const rawShifts = decrypted ? JSON.parse(decrypted) : [];

    // Map backend fields to frontend
    const mapped: ShiftTime[] = rawShifts.map((shift: any) => ({
      shiftuid: shift.shiftuid,
      name: shift.shift_name,
      start_time: shift.start_time,
      end_time: shift.end_time,
      status: shift.status === "1" ? "active" : "inactive",
    }));

    return { ...json, data: mapped };
  }

  return json;
};

// ✅ Add Shift Time (Encrypted Payload)
export const addShiftTime = async (data: any) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  const encryptedData: any = {};
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      encryptedData[key] = CryptoJS.AES.encrypt(
        String(data[key] ?? ""),
        AES_KEY
      ).toString();
    }
  }

  const res = await fetch(`${apiUrl}/hs_shift_time_add`, {
    method: "POST",
    headers,
    body: JSON.stringify(encryptedData),
  });

  if (!res.ok) throw new Error("Failed to add shift time");
  return res.json();
};

// ✅ Update Shift Time (Encrypted Payload)
export const updateShiftTime = async (id: string, data: any) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  const encryptedData: any = {};
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      encryptedData[key] = CryptoJS.AES.encrypt(
        String(data[key] ?? ""),
        AES_KEY
      ).toString();
    }
  }

  encryptedData["id"] = CryptoJS.AES.encrypt(id, AES_KEY).toString();

  const res = await fetch(`${apiUrl}/hs_shift_time_update`, {
    method: "POST",
    headers,
    body: JSON.stringify(encryptedData),
  });

  if (!res.ok) throw new Error("Failed to update shift time");
  return res.json();
};

// ✅ Delete Shift Time (Encrypted ID)
export const deleteShiftTime = async (id: string) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  const encryptedData = {
    id: CryptoJS.AES.encrypt(id, AES_KEY).toString(),
  };

  const res = await fetch(`${apiUrl}/hs_shift_time_delete`, {
    method: "POST",
    headers,
    body: JSON.stringify(encryptedData),
  });

  if (!res.ok) throw new Error("Failed to delete shift time");
  return res.json();
};

/** -------------------------------
 * Specialization Interfaces
 * ------------------------------- */
export interface Specialization {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive";
}

export interface SpecializationPayload {
  name: string;
  description: string;
  status: "1" | "0"; // backend expects 1 or 0
}

/** -------------------------------
 * Fetch Specializations
 * ------------------------------- */
export const fetchSpecializations = async () => {
  const { apiUrl, headers } = await getAuthHeaders();

  const res = await fetch(`${apiUrl}hs_specialization_list`, {
    method: "POST",
    headers,
    body: JSON.stringify({}),
  });

  if (!res.ok) throw new Error("Failed to fetch specializations");

  const json = await res.json();
  if (json.success && json.data) {
    const AES_KEY = await configService.getAesSecretKey();
    const decrypted = decryptAESFromPHP(json.data, AES_KEY);

    // Ensure rawItems is always an array
    let rawItems: any[] = [];
    try {
      rawItems = decrypted ? JSON.parse(decrypted) : [];
      if (!Array.isArray(rawItems)) rawItems = [];
    } catch {
      rawItems = [];
    }

    const mapped: Specialization[] = rawItems.map((item: any) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      status: item.status === "1" ? "active" : "inactive",
    }));

    return { ...json, data: mapped };
  }

  return { ...json, data: [] }; // return empty array if no data
};


/** -------------------------------
 * Add Specialization (Encrypted Payload)
 * ------------------------------- */
export const addSpecialization = async (data: SpecializationPayload) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  const encryptedData: any = {};
  Object.keys(data).forEach((key) => {
    encryptedData[key] = CryptoJS.AES.encrypt(String(data[key] ?? ""), AES_KEY).toString();
  });

  const res = await fetch(`${apiUrl}/hs_specialization_add`, {
    method: "POST",
    headers,
    body: JSON.stringify(encryptedData),
  });

  if (!res.ok) throw new Error("Failed to add specialization");
  return res.json();
};

/** -------------------------------
 * Update Specialization (Encrypted Payload)
 * ------------------------------- */
export const updateSpecialization = async (id: string, data: SpecializationPayload) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  const encryptedData: any = {};
  Object.keys(data).forEach((key) => {
    encryptedData[key] = CryptoJS.AES.encrypt(String(data[key] ?? ""), AES_KEY).toString();
  });

  // Include encrypted ID
  encryptedData["id"] = CryptoJS.AES.encrypt(id, AES_KEY).toString();

  const res = await fetch(`${apiUrl}/hs_specialization_update`, {
    method: "POST",
    headers,
    body: JSON.stringify(encryptedData),
  });

  if (!res.ok) throw new Error("Failed to update specialization");
  return res.json();
};

/** -------------------------------
 * Delete Specialization (Encrypted ID)
 * ------------------------------- */
export const deleteSpecialization = async (id: string) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  const encryptedData = {
    id: CryptoJS.AES.encrypt(id, AES_KEY).toString(),
  };

  const res = await fetch(`${apiUrl}/hs_specialization_delete`, {
    method: "POST",
    headers,
    body: JSON.stringify(encryptedData),
  });

  if (!res.ok) throw new Error("Failed to delete specialization");
  return res.json();
};



/** -------------------------------
 * Event Type Interfaces
 * ------------------------------- */
export interface EventType {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive";
}

export interface EventTypePayload {
  name: string;
  description: string;
  status: "1" | "0"; // backend expects 1 or 0
}

/** -------------------------------
 * Fetch Event Types
 * ------------------------------- */
export const fetchEventTypes = async () => {
  const { apiUrl, headers } = await getAuthHeaders();

  const res = await fetch(`${apiUrl}/hs_event_type_list`, {
    method: "POST",
    headers,
    body: JSON.stringify({}),
  });

  if (!res.ok) throw new Error("Failed to fetch event types");

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

    const mapped: EventType[] = rawItems.map((item: any) => ({
      id: item.id,
      name: item.name,
      color: item.color,
      description: item.description,
      status: item.status === "1" ? "active" : "inactive",
    }));

    return { ...json, data: mapped };
  }

  return { ...json, data: [] };
};

/** -------------------------------
 * Add Event Type (Encrypted Payload)
 * ------------------------------- */
export const addEventType = async (data: EventTypePayload) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  const encryptedData: any = {};
  Object.keys(data).forEach((key) => {
    encryptedData[key] = CryptoJS.AES.encrypt(String(data[key] ?? ""), AES_KEY).toString();
  });

  const res = await fetch(`${apiUrl}/hs_event_type_add`, {
    method: "POST",
    headers,
    body: JSON.stringify(encryptedData),
  });

  if (!res.ok) throw new Error("Failed to add event type");
  return res.json();
};

/** -------------------------------
 * Update Event Type (Encrypted Payload)
 * ------------------------------- */
export const updateEventType = async (id: string, data: EventTypePayload) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  const encryptedData: any = {};
  Object.keys(data).forEach((key) => {
    encryptedData[key] = CryptoJS.AES.encrypt(String(data[key] ?? ""), AES_KEY).toString();
  });

  encryptedData["id"] = CryptoJS.AES.encrypt(id, AES_KEY).toString();

  const res = await fetch(`${apiUrl}/hs_event_type_update`, {
    method: "POST",
    headers,
    body: JSON.stringify(encryptedData),
  });

  if (!res.ok) throw new Error("Failed to update event type");
  return res.json();
};

/** -------------------------------
 * Delete Event Type (Encrypted ID)
 * ------------------------------- */
export const deleteEventType = async (id: string) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  const encryptedData = {
    id: CryptoJS.AES.encrypt(id, AES_KEY).toString(),
  };

  const res = await fetch(`${apiUrl}/hs_event_type_delete`, {
    method: "POST",
    headers,
    body: JSON.stringify(encryptedData),
  });

  if (!res.ok) throw new Error("Failed to delete event type");
  return res.json();
};




/** -------------------------------
 * Department Interfaces
 * ------------------------------- */
export interface Department {
  id: string;
  name: string;
  status: "active" | "inactive";
}

export interface DepartmentPayload {
  name: string;
  status: "1" | "0"; // backend expects 1 or 0
}

/** -------------------------------
 * Fetch Departments
 * ------------------------------- */
export const fetchDepartments = async () => {
  const { apiUrl, headers } = await getAuthHeaders();
  const res = await fetch(`${apiUrl}/hs_department_list`, {
    method: "POST",
    headers,
    body: JSON.stringify({}),
  });
  if (!res.ok) throw new Error("Failed to fetch departments");

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

    const mapped: Department[] = rawItems.map((item: any) => ({
      deptuid: item.deptuid,
      name: item.name,
      status: item.status === "1" ? "active" : "inactive",
    }));

    return { ...json, data: mapped };
  }

  return { ...json, data: [] };
};

/** -------------------------------
 * Add Department (Encrypted Payload)
 * ------------------------------- */
export const addDepartment = async (data: DepartmentPayload) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  const encryptedData: any = {};
  Object.keys(data).forEach((key) => {
    encryptedData[key] = CryptoJS.AES.encrypt(String(data[key] ?? ""), AES_KEY).toString();
  });

  const res = await fetch(`${apiUrl}/hs_department_add`, {
    method: "POST",
    headers,
    body: JSON.stringify(encryptedData),
  });

  if (!res.ok) throw new Error("Failed to add department");
  return res.json();
};

/** -------------------------------
 * Update Department (Encrypted Payload)
 * ------------------------------- */
export const updateDepartment = async (deptuid: string, data: DepartmentPayload) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  const encryptedData: any = {};
  Object.keys(data).forEach((key) => {
    encryptedData[key] = CryptoJS.AES.encrypt(String(data[key] ?? ""), AES_KEY).toString();
  });
  encryptedData["id"] = CryptoJS.AES.encrypt(deptuid, AES_KEY).toString();

  const res = await fetch(`${apiUrl}/hs_department_update`, {
    method: "POST",
    headers,
    body: JSON.stringify(encryptedData),
  });

  if (!res.ok) throw new Error("Failed to update department");
  return res.json();
};

/** -------------------------------
 * Delete Department (Encrypted ID)
 * ------------------------------- */
export const deleteDepartment = async (deptuid: string) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  const encryptedData = {
    id: CryptoJS.AES.encrypt(deptuid, AES_KEY).toString(),
  };

  const res = await fetch(`${apiUrl}/hs_department_delete`, {
    method: "POST",
    headers,
    body: JSON.stringify(encryptedData),
  });

  if (!res.ok) throw new Error("Failed to delete department");
  return res.json();
};


export interface Role {
  roleuid: string;
  name: string;
  deptuid: string; // parent department
  department_name?: string;
  status: "active" | "inactive";
}

export interface RolePayload {
  name: string;
  deptuid: string;
  status: "1" | "0";
}

/** -------------------------------
 * Fetch Roles (with Department Relationship)
 * ------------------------------- */
export const fetchRoles = async (): Promise<{ success: boolean; data: Role[] }> => {
  const { apiUrl, headers } = await getAuthHeaders();

  const res = await fetch(`${apiUrl}/hs_role_list`, {
    method: "POST",
    headers,
    body: JSON.stringify({}),
  });

  if (!res.ok) throw new Error("Failed to fetch roles");

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

    const mapped: Role[] = rawItems.map((item: any) => ({
      roleuid: item.roleuid,
      name: item.name,
      deptuid: item.deptuid,
      deptName: item.deptName || "",
      status: item.status === "1" ? "active" : "inactive",
    }));

    return { ...json, data: mapped };
  }

  return { ...json, data: [] };
};

/** -------------------------------
 * Add Role (with Department Parent)
 * ------------------------------- */
export const addRole = async (data: RolePayload) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  const encryptedData: Record<string, string> = {};
  Object.keys(data).forEach((key) => {
    encryptedData[key] = CryptoJS.AES.encrypt(String(data[key] ?? ""), AES_KEY).toString();
  });

  const res = await fetch(`${apiUrl}/hs_role_add`, {
    method: "POST",
    headers,
    body: JSON.stringify(encryptedData),
  });

  if (!res.ok) throw new Error("Failed to add role");
  return res.json();
};

/** -------------------------------
 * Update Role (with Department Parent)
 * ------------------------------- */
export const updateRole = async (roleuid: string, data: RolePayload) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  const encryptedData: Record<string, string> = {};
  Object.keys(data).forEach((key) => {
    encryptedData[key] = CryptoJS.AES.encrypt(String(data[key] ?? ""), AES_KEY).toString();
  });
  encryptedData["id"] = CryptoJS.AES.encrypt(roleuid, AES_KEY).toString();

  const res = await fetch(`${apiUrl}/hs_role_update`, {
    method: "POST",
    headers,
    body: JSON.stringify(encryptedData),
  });

  if (!res.ok) throw new Error("Failed to update role");
  return res.json();
};

/** -------------------------------
 * Delete Role (Encrypted ID)
 * ------------------------------- */
export const deleteRole = async (roleuid: string) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  const encryptedData = {
    id: CryptoJS.AES.encrypt(roleuid, AES_KEY).toString(),
  };

  const res = await fetch(`${apiUrl}/hs_role_delete`, {
    method: "POST",
    headers,
    body: JSON.stringify(encryptedData),
  });

  if (!res.ok) throw new Error("Failed to delete role");
  return res.json();
};



/* ================================
   🏥 Hospital Amenities Types
================================ */
export interface HospitalAmenity {
  id: string;
  name: string;
  icon: string;
  status: "active" | "inactive";
}

export interface HospitalAmenityPayload {
  name: string;
  icon: string;
  status: string; // "1" or "0"
}

/* ================================
   🔹 Fetch Hospital Amenities
================================ */
export const fetchHospitalAmenities = async () => {
  const { apiUrl, headers } = await getAuthHeaders();

  const res = await fetch(`${apiUrl}/hs_amenity_list`, {
    method: "POST",
    headers,
    body: JSON.stringify({}),
  });

  if (!res.ok) throw new Error("Failed to fetch hospital amenities");

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

    const mapped: HospitalAmenity[] = rawItems.map((item: any) => ({
      id: item.amenityuid,
      name: item.name,
      icon: item.icon, // e.g., "PaIcons.tvicon"
      status: item.status === "1" ? "active" : "inactive",
    }));

    return { ...json, data: mapped };
  }

  return { ...json, data: [] };
};

/* ================================
   🔹 Add Hospital Amenity
================================ */
export const addHospitalAmenity = async (data: HospitalAmenityPayload) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  const encryptedData: any = {};
  Object.keys(data).forEach((key) => {
    encryptedData[key] = CryptoJS.AES.encrypt(String(data[key] ?? ""), AES_KEY).toString();
  });

  const res = await fetch(`${apiUrl}/hs_amenity_add`, {
    method: "POST",
    headers,
    body: JSON.stringify(encryptedData),
  });

  if (!res.ok) throw new Error("Failed to add hospital amenity");
  return res.json();
};

/* ================================
   🔹 Update Hospital Amenity
================================ */
export const updateHospitalAmenity = async (id: string, data: HospitalAmenityPayload) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  const encryptedData: any = {};
  Object.keys(data).forEach((key) => {
    encryptedData[key] = CryptoJS.AES.encrypt(String(data[key] ?? ""), AES_KEY).toString();
  });

  encryptedData["id"] = CryptoJS.AES.encrypt(id, AES_KEY).toString();

  const res = await fetch(`${apiUrl}/hs_amenity_update`, {
    method: "POST",
    headers,
    body: JSON.stringify(encryptedData),
  });

  if (!res.ok) throw new Error("Failed to update hospital amenity");
  return res.json();
};

/* ================================
   🔹 Delete Hospital Amenity
================================ */
export const deleteHospitalAmenity = async (id: string) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  const encryptedData = {
    id: CryptoJS.AES.encrypt(id, AES_KEY).toString(),
  };

  const res = await fetch(`${apiUrl}/hs_amenity_delete`, {
    method: "POST",
    headers,
    body: JSON.stringify(encryptedData),
  });

  if (!res.ok) throw new Error("Failed to delete hospital amenity");
  return res.json();
};


/* ================================
   🏥 Hospital Room Types Types
================================ */
export interface RoomType {
  id: string;
  title: string;
  status: "active" | "inactive";
}

export interface RoomTypePayload {
  title: string;
  status: string; // "1" for active, "0" for inactive
}

/* ================================
   🔹 Fetch Room Types
================================ */
export const fetchRoomTypes = async () => {
  const { apiUrl, headers } = await getAuthHeaders();

  const res = await fetch(`${apiUrl}/hs_room_type_list`, {
    method: "POST",
    headers,
    body: JSON.stringify({}),
  });

  if (!res.ok) throw new Error("Failed to fetch room types");

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

    const mapped: RoomType[] = rawItems.map((item: any) => ({
      id: item.roomtypeuid,
      title: item.title,
      status: item.status === "1" ? "active" : "inactive",
    }));

    return { ...json, data: mapped };
  }

  return { ...json, data: [] };
};

/* ================================
   🔹 Add Room Type
================================ */
export const addRoomType = async (data: RoomTypePayload) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  const encryptedData: any = {};
  Object.keys(data).forEach((key) => {
    encryptedData[key] = CryptoJS.AES.encrypt(String(data[key] ?? ""), AES_KEY).toString();
  });

  const res = await fetch(`${apiUrl}/hs_room_type_add`, {
    method: "POST",
    headers,
    body: JSON.stringify(encryptedData),
  });

  if (!res.ok) throw new Error("Failed to add room type");
  return res.json();
};

/* ================================
   🔹 Update Room Type
================================ */
export const updateRoomType = async (id: string, data: RoomTypePayload) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  const encryptedData: any = {};
  Object.keys(data).forEach((key) => {
    encryptedData[key] = CryptoJS.AES.encrypt(String(data[key] ?? ""), AES_KEY).toString();
  });

  encryptedData["id"] = CryptoJS.AES.encrypt(id, AES_KEY).toString();

  const res = await fetch(`${apiUrl}/hs_room_type_update`, {
    method: "POST",
    headers,
    body: JSON.stringify(encryptedData),
  });

  if (!res.ok) throw new Error("Failed to update room type");
  return res.json();
};

/* ================================
   🔹 Delete Room Type
================================ */
export const deleteRoomType = async (id: string) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  const encryptedData = {
    id: CryptoJS.AES.encrypt(id, AES_KEY).toString(),
  };

  const res = await fetch(`${apiUrl}/hs_room_type_delete`, {
    method: "POST",
    headers,
    body: JSON.stringify(encryptedData),
  });

  if (!res.ok) throw new Error("Failed to delete room type");
  return res.json();
};


/* ================================
   🏥 Hospital Ward Types
================================ */
export interface WardType {
  id: string;
  title: string;
  status: "active" | "inactive";
}

export interface WardTypePayload {
  title: string;
  status: string; // "1" for active, "0" for inactive
}

/* ================================
   🔹 Fetch Ward Types
================================ */
export const fetchWardTypes = async () => {
  const { apiUrl, headers } = await getAuthHeaders();

  const res = await fetch(`${apiUrl}/hs_ward_type_list`, {
    method: "POST",
    headers,
    body: JSON.stringify({}),
  });

  if (!res.ok) throw new Error("Failed to fetch ward types");

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

    const mapped: WardType[] = rawItems.map((item: any) => ({
      id: item.wardtypeuid,
      title: item.title,
      status: item.status === "1" ? "active" : "inactive",
    }));

    return { ...json, data: mapped };
  }

  return { ...json, data: [] };
};

/* ================================
   🔹 Add Ward Type
================================ */
export const addWardType = async (data: WardTypePayload) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  const encryptedData: any = {};
  Object.keys(data).forEach((key) => {
    encryptedData[key] = CryptoJS.AES.encrypt(String(data[key] ?? ""), AES_KEY).toString();
  });

  const res = await fetch(`${apiUrl}/hs_ward_type_add`, {
    method: "POST",
    headers,
    body: JSON.stringify(encryptedData),
  });

  if (!res.ok) throw new Error("Failed to add ward type");
  return res.json();
};

/* ================================
   🔹 Update Ward Type
================================ */
export const updateWardType = async (id: string, data: WardTypePayload) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  const encryptedData: any = {};
  Object.keys(data).forEach((key) => {
    encryptedData[key] = CryptoJS.AES.encrypt(String(data[key] ?? ""), AES_KEY).toString();
  });

  encryptedData["id"] = CryptoJS.AES.encrypt(id, AES_KEY).toString();

  const res = await fetch(`${apiUrl}/hs_ward_type_update`, {
    method: "POST",
    headers,
    body: JSON.stringify(encryptedData),
  });

  if (!res.ok) throw new Error("Failed to update ward type");
  return res.json();
};

/* ================================
   🔹 Delete Ward Type
================================ */
export const deleteWardType = async (id: string) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  const encryptedData = {
    id: CryptoJS.AES.encrypt(id, AES_KEY).toString(),
  };

  const res = await fetch(`${apiUrl}/hs_ward_type_delete`, {
    method: "POST",
    headers,
    body: JSON.stringify(encryptedData),
  });

  if (!res.ok) throw new Error("Failed to delete ward type");
  return res.json();
};




/* ================================
   🏥 Hospital Wards
================================ */
export interface Ward {
  id: string;
  ward_name: string;
  ward_type: string;
  floor_no: string;
  status: "active" | "inactive";
}

export interface WardPayload {
  ward_name: string;
  ward_type: string;
  floor_no: string;
  status: string; // "1" active | "0" inactive
}

export const fetchWards = async () => {
  const { apiUrl, headers } = await getAuthHeaders();

  const res = await fetch(`${apiUrl}/hs_ward_list`, {
    method: "POST",
    headers,
    body: JSON.stringify({}),
  });

  if (!res.ok) throw new Error("Failed to fetch wards");
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

    const mapped: Ward[] = rawItems.map((item: any) => ({
      id: item.id ?? item.id,
      ward_name: item.title ?? item.title ?? "",
      ward_type: item.ward_type ?? item.ward_type ?? "General",
      floor_no: item.floor_no ?? item.floor_no ?? "1",
      status: item.status === "1" ? "active" : item.status === "0" ? "inactive" : (item.status ?? "active"),
    }));

    return { ...json, data: mapped };
  }
  return { ...json, data: [] };
};

export const addWard = async (data: WardPayload) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  const encryptedData: any = {};
  Object.keys(data).forEach((key) => {
    encryptedData[key] = CryptoJS.AES.encrypt(String((data as any)[key] ?? ""), AES_KEY).toString();
  });

  const res = await fetch(`${apiUrl}/hs_ward_add`, {
    method: "POST",
    headers,
    body: JSON.stringify(encryptedData),
  });
  if (!res.ok) throw new Error("Failed to add ward");
  return res.json();
};

export const updateWard = async (id: string, data: WardPayload) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  const encryptedData: any = {};
  Object.keys(data).forEach((key) => {
    encryptedData[key] = CryptoJS.AES.encrypt(String((data as any)[key] ?? ""), AES_KEY).toString();
  });
  encryptedData["id"] = CryptoJS.AES.encrypt(id, AES_KEY).toString();

  const res = await fetch(`${apiUrl}/hs_ward_update`, {
    method: "POST",
    headers,
    body: JSON.stringify(encryptedData),
  });
  if (!res.ok) throw new Error("Failed to update ward");
  return res.json();
};

export const deleteWard = async (id: string) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();
  const encryptedData = { id: CryptoJS.AES.encrypt(id, AES_KEY).toString() };

  const res = await fetch(`${apiUrl}/hs_ward_delete`, {
    method: "POST",
    headers,
    body: JSON.stringify(encryptedData),
  });
  if (!res.ok) throw new Error("Failed to delete ward");
  return res.json();
};


/* ================================
   🚪 Hospital Rooms (child of ward)
================================ */
export interface Room {
  id: string;
  ward_id: string;
  room_name: string;
  room_type: string;
  floor_no: string;
  bed_count: string;
  amenities: string[];
  status: "Available" | "Occupied" | "Cleaning" | "Maintenance";
}

export interface RoomPayload {
  ward_id: string;
  room_name: string;
  room_type: string;
  bed_count: string;
  amenities: string[];
  status: string;
}

export const fetchRooms = async (ward_id: string) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  const encryptedData = {
    ward_id: CryptoJS.AES.encrypt(ward_id, AES_KEY).toString(),
  };

  const res = await fetch(`${apiUrl}/hs_room_list`, {
    method: "POST",
    headers,
    body: JSON.stringify(encryptedData),
  });

  if (!res.ok) throw new Error("Failed to fetch rooms");
  const json = await res.json();
  if (json.success && json.data) {
    const decrypted = decryptAESFromPHP(json.data, AES_KEY);
    let rawItems: any[] = [];
    try {
      rawItems = decrypted ? JSON.parse(decrypted) : [];
      if (!Array.isArray(rawItems)) rawItems = [];
    } catch {
      rawItems = [];
    }

    const mapped: Room[] = rawItems.map((item: any) => ({
      id: item.id ?? item.id,
      ward_id: item.ward_id ?? item.ward_id ?? ward_id,
      room_name: item.title ?? item.title ?? title,
      room_type: item.room_type ?? item.room_type ?? "General",
      bed_count: item.bed_count ?? item.bed_count ?? "0",
      amenities: Array.isArray(item.amenities)
        ? item.amenities
        : typeof item.amenities === "string"
        ? item.amenities.split(",").map((s: string) => s.trim()).filter(Boolean)
        : [],
      status: (item.status as any) ?? "Available",
    }));

    return { ...json, data: mapped };
  }
  return { ...json, data: [] };
};

export const addRoom = async (data: RoomPayload) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  const encryptedData: any = {};
  Object.keys(data).forEach((key) => {
    const value = (data as any)[key];
    // amenities as CSV
    const v = Array.isArray(value) ? value.join(",") : String(value ?? "");
    encryptedData[key] = CryptoJS.AES.encrypt(v, AES_KEY).toString();
  });

  const res = await fetch(`${apiUrl}/hs_room_add`, {
    method: "POST",
    headers,
    body: JSON.stringify(encryptedData),
  });
  if (!res.ok) throw new Error("Failed to add room");
  return res.json();
};

export const updateRoom = async (id: string, data: RoomPayload) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  const encryptedData: any = {};
  Object.keys(data).forEach((key) => {
    const value = (data as any)[key];
    const v = Array.isArray(value) ? value.join(",") : String(value ?? "");
    encryptedData[key] = CryptoJS.AES.encrypt(v, AES_KEY).toString();
  });
  encryptedData["id"] = CryptoJS.AES.encrypt(id, AES_KEY).toString();

  const res = await fetch(`${apiUrl}/hs_room_update`, {
    method: "POST",
    headers,
    body: JSON.stringify(encryptedData),
  });
  if (!res.ok) throw new Error("Failed to update room");
  return res.json();
};

export const deleteRoom = async (id: string) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();
  const encryptedData = { id: CryptoJS.AES.encrypt(id, AES_KEY).toString() };

  const res = await fetch(`${apiUrl}/hs_room_delete`, {
    method: "POST",
    headers,
    body: JSON.stringify(encryptedData),
  });
  if (!res.ok) throw new Error("Failed to delete room");
  return res.json();
};


/* ================================
   🛏️ Hospital Beds (child of room)
================================ */
export interface BedType {
  id: string;
  ward_id: string;
  room_id: string;
  bed_number: string;
  status: "Available" | "Occupied" | "Reserved" | "Cleaning";
  assigned_patient_id?: string;
  patient_fname?: string;
  patient_lname?: string;
  patient_email?: string;
  patient_phone?: string;
  patient_gender?: string;
  patient_blood_group?: string;
  patient_dob?: string;
  patient_address?: string;
  last_cleaned_date?: string;
}

export interface BedPayload {
  ward_id: string;
  room_id: string;
  status: string;
}

export const fetchBeds = async (room_id: string) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  const encryptedData = {
    room_id: CryptoJS.AES.encrypt(room_id, AES_KEY).toString(),
  };

  const res = await fetch(`${apiUrl}/hs_bed_list`, {
    method: "POST",
    headers,
    body: JSON.stringify(encryptedData),
  });

  if (!res.ok) throw new Error("Failed to fetch beds");
  const json = await res.json();
  if (json.success && json.data) {
    const decrypted = decryptAESFromPHP(json.data, AES_KEY);
    let rawItems: any[] = [];
    try {
      rawItems = decrypted ? JSON.parse(decrypted) : [];
      if (!Array.isArray(rawItems)) rawItems = [];
    } catch {
      rawItems = [];
    }

    const mapped: BedType[] = rawItems.map((item: any) => ({
      id: item.id ?? item.id,
      ward_id: item.ward_id ?? item.ward_id ?? "",
      room_id: item.room_id ?? item.room_id ?? '',
      bed_number: item.title ?? item.title ?? '',
      status: (item.status as any) ?? "Available",
      assigned_patient_id: item.assigned_patient_id ?? undefined,
      patient_fname: item.patient_fname ?? undefined,
      patient_lname: item.patient_lname ?? undefined,
      patient_email: item.patient_email ?? undefined,
      patient_phone: item.patient_phone ?? undefined,
      patient_dob: item.patient_dob ?? undefined,
      patient_gender: item.patient_gender ?? undefined,
      patient_blood_group: item.patient_blood_group ?? undefined,
      patient_address: item.patient_address ?? undefined,
      last_cleaned_date: item.last_cleaned_date ?? undefined,
    }));

    return { ...json, data: mapped };
  }
  return { ...json, data: [] };
};

export const addBed = async (data: BedPayload) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  const encryptedData: any = {};
  Object.keys(data).forEach((key) => {
    encryptedData[key] = CryptoJS.AES.encrypt(String((data as any)[key] ?? ""), AES_KEY).toString();
  });

  const res = await fetch(`${apiUrl}/hs_bed_add`, {
    method: "POST",
    headers,
    body: JSON.stringify(encryptedData),
  });
  if (!res.ok) throw new Error("Failed to add bed");
  return res.json();
};

export const updateBed = async (id: string, data: BedPayload) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();

  const encryptedData: any = {};
  Object.keys(data).forEach((key) => {
    encryptedData[key] = CryptoJS.AES.encrypt(String((data as any)[key] ?? ""), AES_KEY).toString();
  });
  encryptedData["id"] = CryptoJS.AES.encrypt(id, AES_KEY).toString();

  const res = await fetch(`${apiUrl}/hs_bed_update`, {
    method: "POST",
    headers,
    body: JSON.stringify(encryptedData),
  });
  if (!res.ok) throw new Error("Failed to update bed");
  return res.json();
};

export const deleteBed = async (id: string) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();
  const encryptedData = { id: CryptoJS.AES.encrypt(id, AES_KEY).toString() };

  const res = await fetch(`${apiUrl}/hs_bed_delete`, {
    method: "POST",
    headers,
    body: JSON.stringify(encryptedData),
  });
  if (!res.ok) throw new Error("Failed to delete bed");
  return res.json();
};




// ====================
// Bed Permission Module
// ====================





