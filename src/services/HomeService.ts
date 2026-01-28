import { configService } from "./configService";

export interface HomeDoctor {
  id: string;
  name: string;
  specialty?: string;
  qualification?: string;
  rating?: number;
  experience?: string; // e.g., "12+ years"
  image?: string;
  profile_image?: string;
  image_url?: string;
  reviews?: number;
  availability?: string;
  specialization?: string;
  consultationFees?: string;
}

export const fetchHomeDoctors = async (hospitalId?: number): Promise<HomeDoctor[]> => {
  const apiUrl = await configService.getApiUrl();
  const query = hospitalId ? `?hospital_id=${hospitalId}` : "";
  const res = await fetch(`${apiUrl}home_doctors_list${query}`, {
    method: "GET",
    headers: { "Accept": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to fetch home doctors");
  const json = await res.json();
  const items = json.items || json.data || [];
  return items.map((row: any) => ({
    id: String(row.id ?? ""),
    name: row.name || row.doctor_name || "Doctor",
    specialty: row.specialization || row.specialty || "",
    qualification: row.qualification || "MBBS",
    rating: Number(row.rating ?? 4.8),
    experience: row.experience ? `${row.experience}` : "10+ years",
    // Normalize image fields so UI can use either key
    image: row.image || row.profile_image || row.image_url || "/placeholder.svg",
    profile_image: row.profile_image || row.image || row.image_url || "/placeholder.svg",
    image_url: row.image_url || undefined,
    reviews: Number(row.reviews ?? 0),
    availability: row.availability || "Mon, Wed, Fri",
    specialization: row.specialization_name || "",
    consultationFees: row.consultation_fee || "0.00",
  }));
};

export interface HomeHospitalInfo {
  id: number;
  name: string;
  short_name?: string | null;
  appointment_day_limit?: number;
}

export const fetchHomeHospital = async (hospitalId?: number): Promise<HomeHospitalInfo> => {
  const apiUrl = await configService.getApiUrl();
  const query = hospitalId ? `?hospital_id=${hospitalId}` : "";
  const res = await fetch(`${apiUrl}home_hospital_info${query}`, {
    method: "GET",
    headers: { "Accept": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to fetch hospital info");
  const json = await res.json();
  const item = json.item || json.data || {};
  return {
    id: Number(item.id ?? 2),
    name: String(item.name ?? "Hospital"),
    short_name: item.short_name ?? null,
    appointment_day_limit: Number(item.appointment_day_limit ?? 7),
  };
};

export interface SubmitAppointmentPayload {
  name: string;
  mobile: string;
  hospital_id: number;
  doctor_id?: number | null;
  department?: string;
  date?: string;
  time?: string;
}

export const submitHomeAppointment = async (payload: SubmitAppointmentPayload): Promise<{ success: boolean; appointment_id?: number; booking_code?: string; message?: string; }> => {
  const apiUrl = await configService.getApiUrl();
  const res = await fetch(`${apiUrl}home_submit_appointment`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  return json;
};

export interface SubmitPatientPayload {
  name: string;
  phone: string;
  hospital_id: number;
  email?: string;
  gender?: string;
  dob?: string; // YYYY-MM-DD
  blood_group?: string;
  emergency_contact?: string;
  address?: string;
}

export interface SubmitPatientResponse {
  success: boolean;
  patient_id?: number;
  patient_uid?: string;
  message?: string;
  exists?: boolean;
}

export const submitHomePatient = async (payload: SubmitPatientPayload): Promise<SubmitPatientResponse> => {
  const apiUrl = await configService.getApiUrl();
  const res = await fetch(`${apiUrl}home_submit_patient`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  return json as SubmitPatientResponse;
}

// Unified chat assistant
export type ChatIntent = "find_doctor" | "appointment" | "appointment_slots" | "register_patient" | "hospital_info" | "emergency" | "general";

export interface ChatAssistantRequest {
  intent: ChatIntent;
  hospital_id?: number;
  payload?: Record<string, any>;
}

export interface ChatAssistantResponse {
  success: boolean;
  intent: ChatIntent;
  message?: string;
  items?: any[];
  count?: number;
  // For appointment_slots intent
  days?: any[];
  booking_code?: string;
  appointment_id?: number;
  patient_id?: number;
  patient_uid?: string;
  exists?: boolean;
  next?: string; // phone | name | email | gender | age | ask_appointment
  patient?: any;
  patient_name?: string;
}

export const chatAssistant = async (req: ChatAssistantRequest): Promise<ChatAssistantResponse> => {
  const apiUrl = await configService.getApiUrl();
  const res = await fetch(`${apiUrl}home_chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify(req),
  });
  const json = await res.json();
  return json as ChatAssistantResponse;
};

export interface CheckUserResponse {
  success: boolean;
  exists: boolean;
  name?: string;
  age?: number;
  location?: string;
  message?: string;
  patients?: any[];
}

export const checkUser = async (phone: string, hospital_id: number = 2): Promise<CheckUserResponse> => {
  const apiUrl = await configService.getApiUrl();
  const res = await fetch(`${apiUrl}check_user`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify({ phone, hospital_id }),
  });
  const json = await res.json();
  return json as CheckUserResponse;
}

export interface RegisterUserPayload {
  phone: string;
  name: string;
  age: number;
  location: string;
}

export interface RegisterUserResponse {
  success: boolean;
  user_id?: number;
  message?: string;
}

export const registerUser = async (payload: RegisterUserPayload): Promise<RegisterUserResponse> => {
  const apiUrl = await configService.getApiUrl();
  const res = await fetch(`${apiUrl}register_user`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  return json as RegisterUserResponse;
};

export interface GetDoctorsResponse {
  success: boolean;
  items?: Array<any>;
  doctors?: Array<any>;
  message?: string;
}

export const getDoctors = async (): Promise<GetDoctorsResponse> => {
  const apiUrl = await configService.getApiUrl();
  const res = await fetch(`${apiUrl}get_doctors`, {
    method: "GET",
    headers: { "Accept": "application/json" },
  });
  const json = await res.json();
  const items = (json.items || json.doctors || []) as any[];
  const normalized = items.map((d: any) => ({
    ...d,
    // Normalize display name and specialization keys expected by UI
    name: d.name ?? d.doctor_name ?? d.full_name ?? "Doctor",
    specialty: d.specialty ?? d.specialization ?? d.specialization_name ?? d.department ?? undefined,
    // Normalize image key
    profile_image: d.profile_image ?? d.image_url ?? d.image ?? d.photo ?? undefined,
  }));
  return { ...(json as GetDoctorsResponse), items: normalized, doctors: normalized };
};

export interface SearchDoctorResponse {
  success: boolean;
  items?: Array<any>;
  doctors?: Array<any>;
  message?: string;
}

export const searchDoctor = async (query: string): Promise<SearchDoctorResponse> => {
  const apiUrl = await configService.getApiUrl();
  const res = await fetch(`${apiUrl}search_doctor`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify({ query }),
  });
  const json = await res.json();
  return json as SearchDoctorResponse;
};

export interface BookAppointmentPayload {
  phone: string;
  doctor_id: string | number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
}

export interface BookAppointmentResponse {
  success: boolean;
  appointment_id?: number;
  message?: string;
}

export const bookAppointment = async (payload: BookAppointmentPayload): Promise<BookAppointmentResponse> => {
  const apiUrl = await configService.getApiUrl();
  const res = await fetch(`${apiUrl}book_appointment`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  return json as BookAppointmentResponse;
};

// Add available slots types and API
export interface AvailableSlot {
  id?: number;
  title?: string;
  start_time?: string;
  end_time?: string;
  type?: string | number | null;
  notes?: string | null;
  max_appointments?: number | null;
  book_slot?: number | null;
  available_count?: number | null;
  available?: boolean;
  time?: string | null;
  period?: "morning" | "afternoon" | "evening" | null;
}

export interface GetAvailableSlotsResponse {
  success: boolean;
  hospital_id: number;
  doctor_id: number;
  doctor?: any;
  date: string;
  weekday?: string;
  source: "event" | "master" | "none";
  count: number;
  slots: AvailableSlot[];
  message?: string;
  booked?: boolean;
  appointment?: AppointmentDetailsData;
}

export const getAvailableSlots = async (
  hospital_id: number,
  doctor_id: number,
  date: string,
  phone?: string,
  patient_id?: number
): Promise<GetAvailableSlotsResponse> => {
  const apiUrl = await configService.getApiUrl();
  const res = await fetch(`${apiUrl}get_available_slots`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ hospital_id, doctor_id, date, phone, patient_id }),
  });
  const json = await res.json();
  return json as GetAvailableSlotsResponse;
};

// Book patient appointment into ms_patient_appointment and increment slot book count
export interface BookAppointmentRequest {
  hospital_id: number;
  doctor_id: number;
  date: string; // YYYY-MM-DD
  slot_id: number;
  patient_name: string;
  phone: string;
  patient_id?: number;
  source?: "event" | "master"; // proxy for slot origin
}
export interface BookAppointmentResponse {
  success: boolean;
  appointment_id?: number;
  appointment_uid?: string;
  token_no?: number;
  max_appointments?: number;
  book_slot?: number;
  available_count?: number;
  message?: string;
}

export const bookPatientAppointment = async (
  payload: BookAppointmentRequest
): Promise<BookAppointmentResponse> => {
  const apiUrl = await configService.getApiUrl();
  const res = await fetch(`${apiUrl}book_patient_appointment`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  return json as BookAppointmentResponse;
};

// Appointment details for confirmation display
export interface AppointmentDetailsData {
  appointment_id: number;
  appointment_uid?: string;
  hospital_id?: number;
  hospital_name?: string;
  hospital_phone?: string | null;
  hospital_address?: string | null;
  doctor_id?: number;
  doctor_name?: string;
  patient_id?: number | null;
  patient_name?: string;
  phone?: string;
  date?: string;
  start_time?: string | null;
  end_time?: string | null;
  time_label?: string | null;
  token_no?: number | null;
  slot_id?: number | null;
  source?: "event" | "master" | null;
}

export interface GetAppointmentDetailsResponse {
  success: boolean;
  data?: AppointmentDetailsData;
  message?: string;
}

export const getAppointmentDetails = async (
  params: { appointment_uid?: string; appointment_id?: number }
): Promise<GetAppointmentDetailsResponse> => {
  const apiUrl = await configService.getApiUrl();
  const res = await fetch(`${apiUrl}get_appointment_details`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify(params),
  });
  const json = await res.json();
  return json as GetAppointmentDetailsResponse;
};

// --- Cancel Appointment ---
export interface CancelAppointmentRequest {
  appointment_uid?: string;
  appointment_id?: number;
  reason?: string;
}

export interface CancelAppointmentResponse {
  success: boolean;
  data?: AppointmentDetailsData;
  message?: string;
}

export const cancelAppointment = async (
  params: CancelAppointmentRequest
): Promise<CancelAppointmentResponse> => {
  const apiUrl = await configService.getApiUrl();
  const res = await fetch(`${apiUrl}cancel_appointment`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify(params),
  });
  const json = await res.json();
  return json as CancelAppointmentResponse;
};
