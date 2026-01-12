export interface PatientInfo {
  name: string;
  age: number;
  gender: string;
  phone: string;
  address: string;
  patientId: string;
  bloodGroup: string;
  weight: string;
  height: string;
}

export interface DoctorInfo {
  name: string;
  qualification: string;
  specialization: string;
  registrationNo: string;
  hospital: string;
  address: string;
  phone: string;
  email: string;
}

export interface PrescriptionMedication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  timing: string;
}

export interface PrescriptionData {
  receiptNo: string;
  date: string;
  patient: PatientInfo;
  doctor: DoctorInfo;
  symptoms: string[];
  diagnosis: string[];
  patientHistory: string[];
  labTests: { name: string; priority: string }[];
  medications: PrescriptionMedication[];
  followUpDate: string;
  notes: string;
  appointmentId?: string;
}

export const dummyPrescriptionData: PrescriptionData = {
  receiptNo: "RX-2024-001547",
  date: "December 9, 2024",
  patient: {
    name: "Rahul Sharma",
    age: 35,
    gender: "Male",
    phone: "+91 98765 43210",
    address: "42, Green Park Colony, New Delhi - 110016",
    patientId: "PAT-2024-8845",
    bloodGroup: "B+",
    weight: "72 kg",
    height: "175 cm"
  },
  doctor: {
    name: "Dr. Priya Mehta",
    qualification: "MBBS, MD (Internal Medicine)",
    specialization: "General Physician",
    registrationNo: "DMC-45678",
    hospital: "City Care Hospital",
    address: "15, Medical Plaza, Connaught Place, New Delhi",
    phone: "+91 11 2345 6789",
    email: "dr.priya@citycare.com"
  },
  symptoms: ["High Fever", "Persistent Cough", "Body Aches", "Fatigue", "Sore Throat"],
  diagnosis: ["Acute Upper Respiratory Tract Infection", "Viral Fever"],
  patientHistory: ["Hypertension (Controlled)", "No Known Drug Allergies"],
  labTests: [
    { name: "Complete Blood Count (CBC)", priority: "High" },
    { name: "C-Reactive Protein (CRP)", priority: "High" },
    { name: "Chest X-Ray PA View", priority: "Medium" }
  ],
  medications: [
    {
      name: "Paracetamol 650mg",
      dosage: "1 Tablet",
      frequency: "Three times a day",
      duration: "5 Days",
      instructions: "Take after meals",
      timing: "Morning, Afternoon, Night"
    },
    {
      name: "Azithromycin 500mg",
      dosage: "1 Tablet",
      frequency: "Once daily",
      duration: "3 Days",
      instructions: "Take on empty stomach",
      timing: "Morning"
    },
    {
      name: "Cetirizine 10mg",
      dosage: "1 Tablet",
      frequency: "Once daily",
      duration: "5 Days",
      instructions: "Take at bedtime",
      timing: "Night"
    },
    {
      name: "Cough Syrup (Dextromethorphan)",
      dosage: "10ml",
      frequency: "Three times a day",
      duration: "5 Days",
      instructions: "Shake well before use",
      timing: "Morning, Afternoon, Night"
    },
    {
      name: "Vitamin C 500mg",
      dosage: "1 Tablet",
      frequency: "Once daily",
      duration: "10 Days",
      instructions: "Take with breakfast",
      timing: "Morning"
    }
  ],
  followUpDate: "December 14, 2024",
  notes: "Complete bed rest advised. Drink plenty of warm fluids. Avoid cold drinks and exposure to AC. Return immediately if symptoms worsen or fever persists beyond 3 days."
};
