export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface ConsultationSummary {
  id: string;
  diagnosis: string;
  diagnosisCode: string;
  labTests: string[];
  patientHistory: string[];
  prescription: Medication[];
  createdOn: string;
  patientName: string;
}

export const dummyConsultations: ConsultationSummary[] = [
  {
    id: "1",
    diagnosis: "Gastroesophageal Reflux Disease",
    diagnosisCode: "K21.9",
    labTests: ["Complete Blood Count (CBC)", "HbA1c"],
    patientHistory: ["Tachycardia", "High Blood Pressure"],
    prescription: [
      { name: "Metformin", dosage: "250mg", frequency: "twice_daily", duration: "7_days" },
      { name: "Prednisolone", dosage: "5mg", frequency: "after_food", duration: "21_days" },
    ],
    createdOn: "2024-11-28",
    patientName: "John Smith",
  },
  {
    id: "2",
    diagnosis: "Type 2 Diabetes Mellitus",
    diagnosisCode: "E11.9",
    labTests: ["Fasting Blood Sugar", "HbA1c", "Lipid Profile"],
    patientHistory: ["Obesity", "Family History of Diabetes"],
    prescription: [
      { name: "Glimepiride", dosage: "2mg", frequency: "once_daily", duration: "30_days" },
      { name: "Metformin", dosage: "500mg", frequency: "twice_daily", duration: "30_days" },
    ],
    createdOn: "2024-11-25",
    patientName: "Sarah Johnson",
  },
  {
    id: "3",
    diagnosis: "Essential Hypertension",
    diagnosisCode: "I10",
    labTests: ["ECG", "Renal Function Test", "Electrolytes"],
    patientHistory: ["Smoking", "Sedentary Lifestyle", "Stress"],
    prescription: [
      { name: "Amlodipine", dosage: "5mg", frequency: "once_daily", duration: "30_days" },
      { name: "Losartan", dosage: "50mg", frequency: "once_daily", duration: "30_days" },
    ],
    createdOn: "2024-11-22",
    patientName: "Michael Brown",
  },
  {
    id: "4",
    diagnosis: "Acute Bronchitis",
    diagnosisCode: "J20.9",
    labTests: ["Chest X-Ray", "Sputum Culture"],
    patientHistory: ["Chronic Cough", "Recent Cold"],
    prescription: [
      { name: "Amoxicillin", dosage: "500mg", frequency: "three_times_daily", duration: "7_days" },
      { name: "Bromhexine", dosage: "8mg", frequency: "twice_daily", duration: "5_days" },
    ],
    createdOn: "2024-11-20",
    patientName: "Emily Davis",
  },
  {
    id: "5",
    diagnosis: "Migraine without Aura",
    diagnosisCode: "G43.0",
    labTests: ["MRI Brain"],
    patientHistory: ["Chronic Headaches", "Photophobia"],
    prescription: [
      { name: "Sumatriptan", dosage: "50mg", frequency: "as_needed", duration: "10_days" },
      { name: "Propranolol", dosage: "40mg", frequency: "twice_daily", duration: "30_days" },
    ],
    createdOn: "2024-11-18",
    patientName: "David Wilson",
  },
  {
    id: "6",
    diagnosis: "Allergic Rhinitis",
    diagnosisCode: "J30.4",
    labTests: ["Allergy Panel", "IgE Levels"],
    patientHistory: ["Seasonal Allergies", "Asthma"],
    prescription: [
      { name: "Cetirizine", dosage: "10mg", frequency: "once_daily", duration: "14_days" },
      { name: "Fluticasone Nasal Spray", dosage: "50mcg", frequency: "twice_daily", duration: "14_days" },
    ],
    createdOn: "2024-11-15",
    patientName: "Lisa Anderson",
  },
];
