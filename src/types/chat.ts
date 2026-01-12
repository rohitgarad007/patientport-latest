export type Sender = "user" | "bot";

export interface ChatButton {
  label: string;
  action: () => void;
}

export interface ChatMessage {
  sender: Sender;
  content: string;
  // Optional UI helpers
  quickReplies?: string[];
  onQuickReply?: (option: string) => void;
  buttons?: ChatButton[];
}

export interface ConversationUserData {
  name?: string;
  phone?: string;
  gender?: string;
  dob?: string;
  department?: string;
  doctor?: string;
  date?: string;
  time?: string;
}

export interface ConversationContext {
  history: string[];
  hospitalId?: number;
  currentIntent?: "appointment" | "find_doctor" | "register_patient" | "emergency" | "hospital_info" | "feedback" | "general";
  currentStep?: number;
  userData?: ConversationUserData;
  // Mapping from shown date label -> ISO date (YYYY-MM-DD)
  dateLabelMap?: Record<string, string>;
  // Slots per ISO date for selected doctor
  slotsByDate?: Record<string, Array<{ title?: string; start_time?: string; end_time?: string }>>;
}