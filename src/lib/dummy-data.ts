export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  contact: string;
  photo: string;
  allergies: string[];
  pastVisits: number;
  medicalHistory: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  time: string;
  type: string;
  status: "Pending" | "Attended" | "Cancelled";
  duration: number;
}

export interface ScheduleSlot {
  day: string;
  date: string;
  slots: {
    time: string;
    type: string;
    patientName?: string;
    color: string;
  }[];
}

export interface Diagnosis {
  id: string;
  condition: string;
  date: string;
  notes: string;
}

export interface Prescription {
  id: string;
  medicine: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface LabTest {
  id: string;
  testName: string;
  urgent: boolean;
  status: "Pending" | "Completed";
  date: string;
  results?: string;
}

export interface Procedure {
  id: string;
  name: string;
  status: "Scheduled" | "Completed";
  date: string;
  notes: string;
}

export const patients: Patient[] = [
  {
    id: "P001",
    name: "Sarah Johnson",
    age: 34,
    gender: "Female",
    contact: "+1 (555) 123-4567",
    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    allergies: ["Penicillin", "Peanuts"],
    pastVisits: 12,
    medicalHistory: "Hypertension, Type 2 Diabetes"
  },
  {
    id: "P002",
    name: "Michael Chen",
    age: 45,
    gender: "Male",
    contact: "+1 (555) 234-5678",
    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    allergies: [],
    pastVisits: 8,
    medicalHistory: "Asthma"
  },
  {
    id: "P003",
    name: "Emma Davis",
    age: 28,
    gender: "Female",
    contact: "+1 (555) 345-6789",
    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
    allergies: ["Latex"],
    pastVisits: 5,
    medicalHistory: "No significant history"
  },
  {
    id: "P004",
    name: "James Wilson",
    age: 62,
    gender: "Male",
    contact: "+1 (555) 456-7890",
    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
    allergies: ["Aspirin"],
    pastVisits: 24,
    medicalHistory: "Coronary artery disease, High cholesterol"
  },
  {
    id: "P005",
    name: "Lisa Anderson",
    age: 38,
    gender: "Female",
    contact: "+1 (555) 567-8901",
    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa",
    allergies: [],
    pastVisits: 15,
    medicalHistory: "Thyroid disorder"
  }
];

export const todaysAppointments: Appointment[] = [
  {
    id: "A001",
    patientId: "P001",
    patientName: "Sarah Johnson",
    time: "09:00 AM",
    type: "Regular Checkup",
    status: "Attended",
    duration: 30
  },
  {
    id: "A002",
    patientId: "P002",
    patientName: "Michael Chen",
    time: "09:45 AM",
    type: "Follow-up",
    status: "Attended",
    duration: 30
  },
  {
    id: "A003",
    patientId: "P003",
    patientName: "Emma Davis",
    time: "10:30 AM",
    type: "Consultation",
    status: "Pending",
    duration: 45
  },
  {
    id: "A004",
    patientId: "P004",
    patientName: "James Wilson",
    time: "02:00 PM",
    type: "Regular Checkup",
    status: "Pending",
    duration: 30
  },
  {
    id: "A005",
    patientId: "P005",
    patientName: "Lisa Anderson",
    time: "03:30 PM",
    type: "Emergency",
    status: "Pending",
    duration: 60
  }
];

export const weeklySchedule: ScheduleSlot[] = [
  {
    day: "Monday",
    date: "Dec 2",
    slots: [
      { time: "7:00 AM - 2:30 PM", type: "Patient Visits", color: "bg-primary" },
      { time: "3:30 PM - 4:50 PM", type: "Surgery", patientName: "John Doe", color: "bg-destructive" }
    ]
  },
  {
    day: "Tuesday",
    date: "Dec 3",
    slots: [
      { time: "8:00 AM - 12:00 PM", type: "Patient Visits", color: "bg-primary" },
      { time: "1:00 PM - 3:00 PM", type: "Consultations", color: "bg-secondary" }
    ]
  },
  {
    day: "Wednesday",
    date: "Dec 4",
    slots: [
      { time: "7:00 AM - 11:30 AM", type: "Patient Visits", color: "bg-primary" },
      { time: "2:00 PM - 5:00 PM", type: "Surgery", patientName: "Jane Smith", color: "bg-destructive" }
    ]
  },
  {
    day: "Thursday",
    date: "Dec 5",
    slots: [
      { time: "9:00 AM - 1:00 PM", type: "Patient Visits", color: "bg-primary" },
      { time: "2:00 PM - 4:00 PM", type: "Research", color: "bg-accent" }
    ]
  },
  {
    day: "Friday",
    date: "Dec 6",
    slots: [
      { time: "7:00 AM - 2:00 PM", type: "Patient Visits", color: "bg-primary" },
      { time: "3:00 PM - 4:00 PM", type: "Team Meeting", color: "bg-muted" }
    ]
  },
  {
    day: "Saturday",
    date: "Dec 7",
    slots: [
      { time: "9:00 AM - 12:00 PM", type: "Patient Visits", color: "bg-primary" }
    ]
  },
  {
    day: "Sunday",
    date: "Dec 8",
    slots: [
      { time: "OFF", type: "Day Off", color: "bg-muted" }
    ]
  }
];

export const patientDiagnoses: Record<string, Diagnosis[]> = {
  P001: [
    { id: "D001", condition: "Type 2 Diabetes", date: "2023-06-15", notes: "Controlled with medication" },
    { id: "D002", condition: "Hypertension", date: "2023-08-20", notes: "Stage 1, lifestyle modifications recommended" }
  ],
  P002: [
    { id: "D003", condition: "Asthma", date: "2023-05-10", notes: "Mild persistent, controlled with inhaler" }
  ]
};

export const patientPrescriptions: Record<string, Prescription[]> = {
  P001: [
    { id: "PR001", medicine: "Metformin", dosage: "500mg", frequency: "Twice daily", duration: "30 days" },
    { id: "PR002", medicine: "Lisinopril", dosage: "10mg", frequency: "Once daily", duration: "30 days" }
  ],
  P002: [
    { id: "PR003", medicine: "Albuterol Inhaler", dosage: "2 puffs", frequency: "As needed", duration: "90 days" }
  ]
};

export const patientLabTests: Record<string, LabTest[]> = {
  P001: [
    { id: "L001", testName: "HbA1c", urgent: false, status: "Completed", date: "2023-11-15", results: "7.2%" },
    { id: "L002", testName: "Blood Pressure Monitor", urgent: true, status: "Pending", date: "2023-12-01" }
  ]
};

export const patientProcedures: Record<string, Procedure[]> = {
  P004: [
    { id: "PR001", name: "Cardiac Catheterization", status: "Scheduled", date: "2023-12-15", notes: "Pre-op consultation completed" }
  ]
};

// Extended patient list for directory
export const allPatients: Patient[] = [
  ...patients,
  {
    id: "P006",
    name: "Robert Martinez",
    age: 52,
    gender: "Male",
    contact: "+1 (555) 678-9012",
    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Robert",
    allergies: ["Shellfish"],
    pastVisits: 18,
    medicalHistory: "Diabetes Type 2, High blood pressure"
  },
  {
    id: "P007",
    name: "Jennifer Lee",
    age: 41,
    gender: "Female",
    contact: "+1 (555) 789-0123",
    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jennifer",
    allergies: [],
    pastVisits: 9,
    medicalHistory: "Migraine disorder"
  },
  {
    id: "P008",
    name: "David Thompson",
    age: 67,
    gender: "Male",
    contact: "+1 (555) 890-1234",
    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    allergies: ["Sulfa drugs"],
    pastVisits: 31,
    medicalHistory: "COPD, Arthritis"
  }
];

// Calendar appointments data
export interface CalendarAppointment {
  id: string;
  date: string;
  time: string;
  duration: number;
  patientName: string;
  patientId: string;
  type: string;
  status: "Confirmed" | "Pending" | "Cancelled";
}

export const calendarAppointments: CalendarAppointment[] = [
  { id: "CA001", date: "2023-12-01", time: "09:00", duration: 30, patientName: "Sarah Johnson", patientId: "P001", type: "Checkup", status: "Confirmed" },
  { id: "CA002", date: "2023-12-01", time: "10:00", duration: 45, patientName: "Michael Chen", patientId: "P002", type: "Follow-up", status: "Confirmed" },
  { id: "CA003", date: "2023-12-01", time: "14:00", duration: 30, patientName: "Emma Davis", patientId: "P003", type: "Consultation", status: "Pending" },
  { id: "CA004", date: "2023-12-02", time: "09:30", duration: 30, patientName: "James Wilson", patientId: "P004", type: "Checkup", status: "Confirmed" },
  { id: "CA005", date: "2023-12-02", time: "11:00", duration: 60, patientName: "Lisa Anderson", patientId: "P005", type: "Surgery Consult", status: "Confirmed" },
  { id: "CA006", date: "2023-12-03", time: "08:00", duration: 30, patientName: "Robert Martinez", patientId: "P006", type: "Follow-up", status: "Confirmed" },
  { id: "CA007", date: "2023-12-04", time: "10:30", duration: 45, patientName: "Jennifer Lee", patientId: "P007", type: "Consultation", status: "Pending" },
  { id: "CA008", date: "2023-12-04", time: "15:00", duration: 30, patientName: "David Thompson", patientId: "P008", type: "Checkup", status: "Confirmed" },
  { id: "CA009", date: "2023-12-05", time: "09:00", duration: 30, patientName: "Sarah Johnson", patientId: "P001", type: "Lab Review", status: "Confirmed" },
  { id: "CA010", date: "2023-12-06", time: "13:00", duration: 45, patientName: "Michael Chen", patientId: "P002", type: "Treatment", status: "Confirmed" }
];

// Analytics data for reports
export const monthlyStats = [
  { month: "Jun", appointments: 124, revenue: 18600, patients: 89 },
  { month: "Jul", appointments: 142, revenue: 21300, patients: 102 },
  { month: "Aug", appointments: 158, revenue: 23700, patients: 115 },
  { month: "Sep", appointments: 135, revenue: 20250, patients: 98 },
  { month: "Oct", appointments: 167, revenue: 25050, patients: 121 },
  { month: "Nov", appointments: 189, revenue: 28350, patients: 138 }
];

export const patientDemographics = [
  { name: "18-30", value: 15 },
  { name: "31-45", value: 35 },
  { name: "46-60", value: 28 },
  { name: "61+", value: 22 }
];

export const appointmentTypes = [
  { name: "Regular Checkup", value: 42, color: "hsl(var(--primary))" },
  { name: "Follow-up", value: 28, color: "hsl(var(--secondary))" },
  { name: "Consultation", value: 18, color: "hsl(var(--accent))" },
  { name: "Emergency", value: 8, color: "hsl(var(--destructive))" },
  { name: "Surgery", value: 4, color: "hsl(var(--warning))" }
];

// AI Suggestion Data (Dummy)
export const diagnosisSuggestions = [
  { id: "DS001", name: "Type 2 Diabetes Mellitus", icd10: "E11.9", confidence: 95 },
  { id: "DS002", name: "Essential Hypertension", icd10: "I10", confidence: 92 },
  { id: "DS003", name: "Acute Upper Respiratory Infection", icd10: "J06.9", confidence: 88 },
  { id: "DS004", name: "Gastroesophageal Reflux Disease", icd10: "K21.9", confidence: 85 },
  { id: "DS005", name: "Migraine without Aura", icd10: "G43.909", confidence: 82 },
  { id: "DS006", name: "Allergic Rhinitis", icd10: "J30.9", confidence: 80 },
  { id: "DS007", name: "Acute Bronchitis", icd10: "J20.9", confidence: 78 },
  { id: "DS008", name: "Anxiety Disorder", icd10: "F41.9", confidence: 75 }
];

export const medicineSuggestions = [
  { id: "MS001", name: "Metformin", type: "Oral Tablet", strength: "500mg", category: "Antidiabetic" },
  { id: "MS002", name: "Lisinopril", type: "Oral Tablet", strength: "10mg", category: "ACE Inhibitor" },
  { id: "MS003", name: "Amoxicillin", type: "Capsule", strength: "500mg", category: "Antibiotic" },
  { id: "MS004", name: "Omeprazole", type: "Capsule", strength: "20mg", category: "Proton Pump Inhibitor" },
  { id: "MS005", name: "Ibuprofen", type: "Oral Tablet", strength: "400mg", category: "NSAID" },
  { id: "MS006", name: "Cetirizine", type: "Oral Tablet", strength: "10mg", category: "Antihistamine" },
  { id: "MS007", name: "Albuterol Inhaler", type: "Inhaler", strength: "90mcg", category: "Bronchodilator" },
  { id: "MS008", name: "Atorvastatin", type: "Oral Tablet", strength: "20mg", category: "Statin" }
];

export const labTestSuggestions = [
  { id: "LT001", name: "Complete Blood Count (CBC)", category: "Hematology", turnaround: "Same day" },
  { id: "LT002", name: "HbA1c", category: "Chemistry", turnaround: "1-2 days" },
  { id: "LT003", name: "Lipid Panel", category: "Chemistry", turnaround: "1-2 days" },
  { id: "LT004", name: "Thyroid Function Tests", category: "Endocrinology", turnaround: "2-3 days" },
  { id: "LT005", name: "Urinalysis", category: "Urinalysis", turnaround: "Same day" },
  { id: "LT006", name: "Chest X-Ray", category: "Radiology", turnaround: "Same day" },
  { id: "LT007", name: "ECG", category: "Cardiology", turnaround: "Immediate" },
  { id: "LT008", name: "Blood Glucose (Fasting)", category: "Chemistry", turnaround: "Same day" }
];

export const procedureSuggestions = [
  { id: "PS001", name: "Minor Wound Suturing", duration: "30 min", anesthesia: "Local" },
  { id: "PS002", name: "Joint Injection", duration: "15 min", anesthesia: "Local" },
  { id: "PS003", name: "Abscess Drainage", duration: "20 min", anesthesia: "Local" },
  { id: "PS004", name: "Ear Irrigation", duration: "10 min", anesthesia: "None" },
  { id: "PS005", name: "Skin Biopsy", duration: "15 min", anesthesia: "Local" },
  { id: "PS006", name: "Nebulizer Treatment", duration: "20 min", anesthesia: "None" },
  { id: "PS007", name: "IV Fluid Administration", duration: "45 min", anesthesia: "None" },
  { id: "PS008", name: "Catheterization", duration: "15 min", anesthesia: "Local" }
];

// Today's Patients Data
export interface TodayPatient {
  id: string;
  patientId: string;
  name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  photo: string;
  appointmentTime: string;
  visitReason: string;
  status: "Waiting" | "Arrived" | "Booked" | "Completed";
  contact: string;
}

export const todayPatients: TodayPatient[] = [
  {
    id: "TP001",
    patientId: "P001",
    name: "Sarah Johnson",
    age: 34,
    gender: "Female",
    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    appointmentTime: "09:00",
    visitReason: "Regular Checkup",
    status: "Completed",
    contact: "+1 (555) 123-4567"
  },
  {
    id: "TP002",
    patientId: "P002",
    name: "Michael Chen",
    age: 45,
    gender: "Male",
    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    appointmentTime: "09:45",
    visitReason: "Follow-up Visit",
    status: "Completed",
    contact: "+1 (555) 234-5678"
  },
  {
    id: "TP003",
    patientId: "P003",
    name: "Emma Davis",
    age: 28,
    gender: "Female",
    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
    appointmentTime: "10:30",
    visitReason: "Consultation for Allergies",
    status: "Arrived",
    contact: "+1 (555) 345-6789"
  },
  {
    id: "TP004",
    patientId: "P004",
    name: "James Wilson",
    age: 62,
    gender: "Male",
    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
    appointmentTime: "11:15",
    visitReason: "Cardiac Follow-up",
    status: "Waiting",
    contact: "+1 (555) 456-7890"
  },
  {
    id: "TP005",
    patientId: "P005",
    name: "Lisa Anderson",
    age: 38,
    gender: "Female",
    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa",
    appointmentTime: "14:00",
    visitReason: "Thyroid Check",
    status: "Booked",
    contact: "+1 (555) 567-8901"
  },
  {
    id: "TP006",
    patientId: "P006",
    name: "Robert Martinez",
    age: 52,
    gender: "Male",
    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Robert",
    appointmentTime: "14:45",
    visitReason: "Diabetes Management",
    status: "Booked",
    contact: "+1 (555) 678-9012"
  },
  {
    id: "TP007",
    patientId: "P007",
    name: "Jennifer Lee",
    age: 41,
    gender: "Female",
    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jennifer",
    appointmentTime: "15:30",
    visitReason: "Migraine Consultation",
    status: "Booked",
    contact: "+1 (555) 789-0123"
  },
  {
    id: "TP008",
    patientId: "P008",
    name: "David Thompson",
    age: 67,
    gender: "Male",
    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    appointmentTime: "16:00",
    visitReason: "COPD Review",
    status: "Waiting",
    contact: "+1 (555) 890-1234"
  }
];

// Visited Patient History Data
export interface VisitHistory {
  id: string;
  patientId: string;
  patientName: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  photo: string;
  visitDate: string;
  diagnosisSummary: string;
  doctorNotes: string;
  doctor: string;
  visitType: string;
  contact: string;
}

export const visitHistory: VisitHistory[] = [
  {
    id: "VH001",
    patientId: "P001",
    patientName: "Sarah Johnson",
    age: 34,
    gender: "Female",
    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    visitDate: "2023-11-28",
    diagnosisSummary: "Type 2 Diabetes - Stable",
    doctorNotes: "Patient shows good glycemic control. Continue current medication. Follow-up in 3 months.",
    doctor: "Dr. Smith",
    visitType: "Follow-up",
    contact: "+1 (555) 123-4567"
  },
  {
    id: "VH002",
    patientId: "P002",
    patientName: "Michael Chen",
    age: 45,
    gender: "Male",
    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    visitDate: "2023-11-27",
    diagnosisSummary: "Asthma - Controlled",
    doctorNotes: "No recent exacerbations. Inhaler technique reviewed. Patient educated on trigger management.",
    doctor: "Dr. Smith",
    visitType: "Regular Checkup",
    contact: "+1 (555) 234-5678"
  },
  {
    id: "VH003",
    patientId: "P003",
    patientName: "Emma Davis",
    age: 28,
    gender: "Female",
    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
    visitDate: "2023-11-25",
    diagnosisSummary: "Allergic Rhinitis",
    doctorNotes: "Prescribed antihistamines. Advised to avoid known allergens. Consider allergy testing.",
    doctor: "Dr. Smith",
    visitType: "Consultation",
    contact: "+1 (555) 345-6789"
  },
  {
    id: "VH004",
    patientId: "P004",
    patientName: "James Wilson",
    age: 62,
    gender: "Male",
    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
    visitDate: "2023-11-24",
    diagnosisSummary: "Coronary Artery Disease",
    doctorNotes: "ECG shows normal rhythm. Blood pressure within target range. Continue statins and beta-blockers.",
    doctor: "Dr. Smith",
    visitType: "Follow-up",
    contact: "+1 (555) 456-7890"
  },
  {
    id: "VH005",
    patientId: "P005",
    patientName: "Lisa Anderson",
    age: 38,
    gender: "Female",
    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa",
    visitDate: "2023-11-23",
    diagnosisSummary: "Hypothyroidism",
    doctorNotes: "TSH levels normalized. Continue levothyroxine. Repeat labs in 6 months.",
    doctor: "Dr. Smith",
    visitType: "Lab Review",
    contact: "+1 (555) 567-8901"
  },
  {
    id: "VH006",
    patientId: "P006",
    patientName: "Robert Martinez",
    age: 52,
    gender: "Male",
    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Robert",
    visitDate: "2023-11-22",
    diagnosisSummary: "Type 2 Diabetes, Hypertension",
    doctorNotes: "HbA1c at 7.8%, needs adjustment. Blood pressure elevated. Modified treatment plan.",
    doctor: "Dr. Smith",
    visitType: "Regular Checkup",
    contact: "+1 (555) 678-9012"
  },
  {
    id: "VH007",
    patientId: "P007",
    patientName: "Jennifer Lee",
    age: 41,
    gender: "Female",
    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jennifer",
    visitDate: "2023-11-20",
    diagnosisSummary: "Migraine without Aura",
    doctorNotes: "Frequency decreased with preventive medication. Continue current regimen. Maintain headache diary.",
    doctor: "Dr. Smith",
    visitType: "Follow-up",
    contact: "+1 (555) 789-0123"
  },
  {
    id: "VH008",
    patientId: "P008",
    patientName: "David Thompson",
    age: 67,
    gender: "Male",
    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    visitDate: "2023-11-19",
    diagnosisSummary: "COPD - Moderate",
    doctorNotes: "Spirometry stable. Continue bronchodilators. Referred for pulmonary rehabilitation.",
    doctor: "Dr. Smith",
    visitType: "Regular Checkup",
    contact: "+1 (555) 890-1234"
  },
  {
    id: "VH009",
    patientId: "P001",
    patientName: "Sarah Johnson",
    age: 34,
    gender: "Female",
    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    visitDate: "2023-11-15",
    diagnosisSummary: "Annual Physical Exam",
    doctorNotes: "Overall health good. Lab work ordered. Discussed lifestyle modifications for diabetes management.",
    doctor: "Dr. Smith",
    visitType: "Annual Checkup",
    contact: "+1 (555) 123-4567"
  },
  {
    id: "VH010",
    patientId: "P002",
    patientName: "Michael Chen",
    age: 45,
    gender: "Male",
    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    visitDate: "2023-11-10",
    diagnosisSummary: "Acute Upper Respiratory Infection",
    doctorNotes: "Prescribed antibiotics. Advised rest and hydration. Follow-up if symptoms persist.",
    doctor: "Dr. Smith",
    visitType: "Urgent Care",
    contact: "+1 (555) 234-5678"
  }
];
