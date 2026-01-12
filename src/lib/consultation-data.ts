// Consultation Workflow Dummy Data

export interface DiagnosisOption {
  id: string;
  name: string;
  icd10: string;
  specialty: string;
  icon: string;
  suggestedSymptoms: string[];
  suggestedLabTests: string[];
  suggestedMedications: MedicationSuggestion[];
  historyFlags: string[];
}

export interface SymptomOption {
  id: string;
  name: string;
  category: string;
}

export interface PatientHistoryCategory {
  id: string;
  name: string;
  icon: string;
  items: PatientHistoryItem[];
}

export interface PatientHistoryItem {
  id: string;
  name: string;
  description: string;
}

export interface LabTestOption {
  id: string;
  name: string;
  description: string;
  category: string;
  panelName?: string;
}

export interface MedicationSuggestion {
  id: string;
  name: string;
  strength: string;
  frequency: string;
  duration: string;
  instructions: string;
  reason: string;
  isPrimary: boolean;
}

export interface PrescriptionItem {
  id: string;
  name: string;
  dosage: string;
  unit: string;
  frequency: string;
  duration: string;
  instructions: string;
  isAISuggested: boolean;
  timings?: string[];
}

export interface TreatmentTemplate {
  id: string;
  name: string;
  diagnosisId: string;
  diagnosisName: string;
  medications: PrescriptionItem[];
  notes: string;
  createdAt: string;
}

// Diagnosis Options with rich data
export const diagnosisOptions: DiagnosisOption[] = [
  {
    id: "DX001",
    name: "Type 2 Diabetes Mellitus",
    icd10: "E11.9",
    specialty: "Endocrinology",
    icon: "🩸",
    suggestedSymptoms: ["Increased thirst", "Frequent urination", "Fatigue", "Blurred vision", "Weight loss"],
    suggestedLabTests: ["HbA1c", "Fasting Blood Glucose", "Lipid Panel", "Kidney Function Tests"],
    suggestedMedications: [
      { id: "SM001", name: "Metformin", strength: "500mg", frequency: "Twice daily", duration: "30 days", instructions: "Take with meals", reason: "First-line therapy for T2DM, improves insulin sensitivity", isPrimary: true },
      { id: "SM002", name: "Glimepiride", strength: "2mg", frequency: "Once daily", duration: "30 days", instructions: "Take before breakfast", reason: "Sulfonylurea to stimulate insulin secretion", isPrimary: false }
    ],
    historyFlags: ["Family history of diabetes", "Obesity", "Sedentary lifestyle"]
  },
  {
    id: "DX002",
    name: "Essential Hypertension",
    icd10: "I10",
    specialty: "Cardiology",
    icon: "❤️",
    suggestedSymptoms: ["Headache", "Dizziness", "Chest pain", "Shortness of breath", "Palpitations"],
    suggestedLabTests: ["Lipid Panel", "ECG", "Kidney Function Tests", "Electrolytes"],
    suggestedMedications: [
      { id: "SM003", name: "Amlodipine", strength: "5mg", frequency: "Once daily", duration: "30 days", instructions: "Take in the morning", reason: "Calcium channel blocker for BP control", isPrimary: true },
      { id: "SM004", name: "Losartan", strength: "50mg", frequency: "Once daily", duration: "30 days", instructions: "May take with or without food", reason: "ARB for cardiovascular protection", isPrimary: false }
    ],
    historyFlags: ["Family history of hypertension", "High salt intake", "Stress"]
  },
  {
    id: "DX003",
    name: "Acute Upper Respiratory Infection",
    icd10: "J06.9",
    specialty: "General Medicine",
    icon: "🤧",
    suggestedSymptoms: ["Cough", "Runny nose", "Sore throat", "Fever", "Body aches", "Sneezing"],
    suggestedLabTests: ["Complete Blood Count", "Throat Swab Culture"],
    suggestedMedications: [
      { id: "SM005", name: "Paracetamol", strength: "500mg", frequency: "Every 6 hours", duration: "5 days", instructions: "Take as needed for fever/pain", reason: "Symptomatic relief for fever and pain", isPrimary: true },
      { id: "SM006", name: "Cetirizine", strength: "10mg", frequency: "Once daily", duration: "7 days", instructions: "Take at bedtime", reason: "Antihistamine for nasal symptoms", isPrimary: false }
    ],
    historyFlags: ["Recent cold exposure", "Contact with sick individuals"]
  },
  {
    id: "DX004",
    name: "Gastroesophageal Reflux Disease",
    icd10: "K21.9",
    specialty: "Gastroenterology",
    icon: "🔥",
    suggestedSymptoms: ["Heartburn", "Acid regurgitation", "Chest pain", "Difficulty swallowing", "Nausea"],
    suggestedLabTests: ["Upper GI Endoscopy", "H. pylori Test"],
    suggestedMedications: [
      { id: "SM007", name: "Omeprazole", strength: "20mg", frequency: "Once daily", duration: "14 days", instructions: "Take 30 mins before breakfast", reason: "PPI for acid suppression", isPrimary: true },
      { id: "SM008", name: "Domperidone", strength: "10mg", frequency: "Three times daily", duration: "14 days", instructions: "Take before meals", reason: "Prokinetic to improve gastric emptying", isPrimary: false }
    ],
    historyFlags: ["Spicy food consumption", "Late-night eating", "Obesity"]
  },
  {
    id: "DX005",
    name: "Migraine without Aura",
    icd10: "G43.909",
    specialty: "Neurology",
    icon: "🧠",
    suggestedSymptoms: ["Severe headache", "Nausea", "Light sensitivity", "Sound sensitivity", "Throbbing pain"],
    suggestedLabTests: ["MRI Brain", "CT Scan"],
    suggestedMedications: [
      { id: "SM009", name: "Sumatriptan", strength: "50mg", frequency: "As needed", duration: "PRN", instructions: "Take at onset of migraine", reason: "Triptan for acute migraine relief", isPrimary: true },
      { id: "SM010", name: "Propranolol", strength: "40mg", frequency: "Twice daily", duration: "30 days", instructions: "For migraine prevention", reason: "Beta-blocker for prophylaxis", isPrimary: false }
    ],
    historyFlags: ["Family history of migraine", "Stress", "Sleep disturbances"]
  },
  {
    id: "DX006",
    name: "Allergic Rhinitis",
    icd10: "J30.9",
    specialty: "ENT/Allergy",
    icon: "👃",
    suggestedSymptoms: ["Sneezing", "Runny nose", "Nasal congestion", "Itchy eyes", "Itchy throat"],
    suggestedLabTests: ["Allergy Skin Tests", "IgE Levels"],
    suggestedMedications: [
      { id: "SM011", name: "Fexofenadine", strength: "180mg", frequency: "Once daily", duration: "30 days", instructions: "Take in the morning", reason: "Non-sedating antihistamine", isPrimary: true },
      { id: "SM012", name: "Fluticasone Nasal Spray", strength: "50mcg", frequency: "2 sprays each nostril daily", duration: "30 days", instructions: "Spray into each nostril", reason: "Intranasal corticosteroid for inflammation", isPrimary: false }
    ],
    historyFlags: ["Seasonal allergies", "Pet exposure", "Dust mite sensitivity"]
  },
  {
    id: "DX007",
    name: "Acute Bronchitis",
    icd10: "J20.9",
    specialty: "Pulmonology",
    icon: "🫁",
    suggestedSymptoms: ["Productive cough", "Chest discomfort", "Fatigue", "Low-grade fever", "Wheezing"],
    suggestedLabTests: ["Chest X-Ray", "Sputum Culture", "Complete Blood Count"],
    suggestedMedications: [
      { id: "SM013", name: "Amoxicillin", strength: "500mg", frequency: "Three times daily", duration: "7 days", instructions: "Complete the full course", reason: "Antibiotic for bacterial infection", isPrimary: true },
      { id: "SM014", name: "Dextromethorphan", strength: "15mg", frequency: "Every 6 hours", duration: "7 days", instructions: "Take for cough relief", reason: "Cough suppressant", isPrimary: false }
    ],
    historyFlags: ["Smoking history", "Recent viral infection"]
  },
  {
    id: "DX008",
    name: "Anxiety Disorder",
    icd10: "F41.9",
    specialty: "Psychiatry",
    icon: "😰",
    suggestedSymptoms: ["Excessive worry", "Restlessness", "Difficulty concentrating", "Sleep problems", "Muscle tension"],
    suggestedLabTests: ["Thyroid Function Tests", "Complete Blood Count"],
    suggestedMedications: [
      { id: "SM015", name: "Escitalopram", strength: "10mg", frequency: "Once daily", duration: "30 days", instructions: "Take in the morning", reason: "SSRI for anxiety management", isPrimary: true },
      { id: "SM016", name: "Alprazolam", strength: "0.25mg", frequency: "As needed", duration: "PRN", instructions: "Use sparingly for acute anxiety", reason: "Benzodiazepine for acute relief", isPrimary: false }
    ],
    historyFlags: ["Stressful life events", "Family history of anxiety", "Caffeine intake"]
  }
];

// Symptom Categories
export const symptomCategories: { category: string; symptoms: SymptomOption[] }[] = [
  {
    category: "General",
    symptoms: [
      { id: "SY001", name: "Fever", category: "General" },
      { id: "SY002", name: "Fatigue", category: "General" },
      { id: "SY003", name: "Weight loss", category: "General" },
      { id: "SY004", name: "Weight gain", category: "General" },
      { id: "SY005", name: "Night sweats", category: "General" },
      { id: "SY006", name: "Chills", category: "General" }
    ]
  },
  {
    category: "Respiratory",
    symptoms: [
      { id: "SY007", name: "Cough", category: "Respiratory" },
      { id: "SY008", name: "Shortness of breath", category: "Respiratory" },
      { id: "SY009", name: "Wheezing", category: "Respiratory" },
      { id: "SY010", name: "Chest tightness", category: "Respiratory" },
      { id: "SY011", name: "Sputum production", category: "Respiratory" }
    ]
  },
  {
    category: "Gastrointestinal",
    symptoms: [
      { id: "SY012", name: "Nausea", category: "Gastrointestinal" },
      { id: "SY013", name: "Vomiting", category: "Gastrointestinal" },
      { id: "SY014", name: "Diarrhea", category: "Gastrointestinal" },
      { id: "SY015", name: "Constipation", category: "Gastrointestinal" },
      { id: "SY016", name: "Abdominal pain", category: "Gastrointestinal" },
      { id: "SY017", name: "Heartburn", category: "Gastrointestinal" }
    ]
  },
  {
    category: "Cardiovascular",
    symptoms: [
      { id: "SY018", name: "Chest pain", category: "Cardiovascular" },
      { id: "SY019", name: "Palpitations", category: "Cardiovascular" },
      { id: "SY020", name: "Dizziness", category: "Cardiovascular" },
      { id: "SY021", name: "Syncope", category: "Cardiovascular" },
      { id: "SY022", name: "Leg swelling", category: "Cardiovascular" }
    ]
  },
  {
    category: "Neurological",
    symptoms: [
      { id: "SY023", name: "Headache", category: "Neurological" },
      { id: "SY024", name: "Numbness", category: "Neurological" },
      { id: "SY025", name: "Tingling", category: "Neurological" },
      { id: "SY026", name: "Weakness", category: "Neurological" },
      { id: "SY027", name: "Memory problems", category: "Neurological" }
    ]
  },
  {
    category: "ENT",
    symptoms: [
      { id: "SY028", name: "Sore throat", category: "ENT" },
      { id: "SY029", name: "Runny nose", category: "ENT" },
      { id: "SY030", name: "Nasal congestion", category: "ENT" },
      { id: "SY031", name: "Ear pain", category: "ENT" },
      { id: "SY032", name: "Hearing loss", category: "ENT" }
    ]
  }
];

// Patient History Categories
export const patientHistoryCategories: PatientHistoryCategory[] = [
  {
    id: "HC001",
    name: "Vital Signs",
    icon: "📊",
    items: [
      { id: "HI001", name: "High Blood Pressure", description: "BP > 140/90 mmHg consistently" },
      { id: "HI002", name: "Low Blood Pressure", description: "BP < 90/60 mmHg consistently" },
      { id: "HI003", name: "Tachycardia", description: "Resting HR > 100 bpm" },
      { id: "HI004", name: "Bradycardia", description: "Resting HR < 60 bpm" },
      { id: "HI005", name: "Fever History", description: "Recurrent fever episodes" }
    ]
  },
  {
    id: "HC002",
    name: "Chronic Conditions",
    icon: "🏥",
    items: [
      { id: "HI006", name: "Diabetes", description: "Type 1 or Type 2 diabetes diagnosis" },
      { id: "HI007", name: "Hypertension", description: "Diagnosed high blood pressure" },
      { id: "HI008", name: "Asthma", description: "Chronic respiratory condition" },
      { id: "HI009", name: "COPD", description: "Chronic obstructive pulmonary disease" },
      { id: "HI010", name: "Arthritis", description: "Joint inflammation condition" }
    ]
  },
  {
    id: "HC003",
    name: "Cardiac",
    icon: "❤️",
    items: [
      { id: "HI011", name: "Coronary Artery Disease", description: "Narrowed heart arteries" },
      { id: "HI012", name: "Heart Failure", description: "Reduced heart pumping efficiency" },
      { id: "HI013", name: "Arrhythmia", description: "Irregular heart rhythm" },
      { id: "HI014", name: "Previous MI", description: "History of heart attack" },
      { id: "HI015", name: "Valve Disease", description: "Heart valve abnormality" }
    ]
  },
  {
    id: "HC004",
    name: "Neurological",
    icon: "🧠",
    items: [
      { id: "HI016", name: "Stroke History", description: "Previous cerebrovascular event" },
      { id: "HI017", name: "Epilepsy", description: "Seizure disorder" },
      { id: "HI018", name: "Parkinson's", description: "Movement disorder" },
      { id: "HI019", name: "Migraine", description: "Recurrent severe headaches" },
      { id: "HI020", name: "Neuropathy", description: "Nerve damage condition" }
    ]
  },
  {
    id: "HC005",
    name: "Female Health",
    icon: "♀️",
    items: [
      { id: "HI021", name: "Pregnancy", description: "Currently pregnant" },
      { id: "HI022", name: "Menopause", description: "Post-menopausal status" },
      { id: "HI023", name: "PCOS", description: "Polycystic ovary syndrome" },
      { id: "HI024", name: "Breast Cancer History", description: "Previous breast cancer" },
      { id: "HI025", name: "Endometriosis", description: "Uterine tissue disorder" }
    ]
  },
  {
    id: "HC006",
    name: "Diagnostic",
    icon: "🔬",
    items: [
      { id: "HI026", name: "Abnormal Lab Results", description: "Recent abnormal findings" },
      { id: "HI027", name: "Recent Surgery", description: "Surgery within 6 months" },
      { id: "HI028", name: "Hospitalization", description: "Recent hospital admission" },
      { id: "HI029", name: "Allergy Testing Done", description: "Completed allergy workup" },
      { id: "HI030", name: "Imaging Abnormality", description: "Abnormal X-ray/CT/MRI" }
    ]
  }
];

// Lab Test Options
export const labTestOptions: LabTestOption[] = [
  { id: "LT001", name: "Complete Blood Count (CBC)", description: "Measures different blood cell types", category: "Hematology", panelName: "Basic Panel" },
  { id: "LT002", name: "HbA1c", description: "Average blood sugar over 2-3 months", category: "Chemistry", panelName: "Diabetic Panel" },
  { id: "LT003", name: "Fasting Blood Glucose", description: "Blood sugar after overnight fast", category: "Chemistry", panelName: "Diabetic Panel" },
  { id: "LT004", name: "Lipid Panel", description: "Cholesterol and triglycerides", category: "Chemistry", panelName: "Cardiac Panel" },
  { id: "LT005", name: "Liver Function Tests", description: "Liver enzymes and bilirubin", category: "Chemistry", panelName: "Hepatic Panel" },
  { id: "LT006", name: "Kidney Function Tests", description: "Creatinine and BUN levels", category: "Chemistry", panelName: "Renal Panel" },
  { id: "LT007", name: "Thyroid Function Tests", description: "TSH, T3, T4 levels", category: "Endocrinology", panelName: "Thyroid Panel" },
  { id: "LT008", name: "Urinalysis", description: "Physical and chemical urine exam", category: "Urinalysis" },
  { id: "LT009", name: "ECG", description: "Heart electrical activity recording", category: "Cardiology", panelName: "Cardiac Panel" },
  { id: "LT010", name: "Chest X-Ray", description: "Imaging of chest structures", category: "Radiology" },
  { id: "LT011", name: "Electrolytes Panel", description: "Sodium, potassium, chloride", category: "Chemistry", panelName: "Basic Panel" },
  { id: "LT012", name: "C-Reactive Protein", description: "Inflammation marker", category: "Chemistry" },
  { id: "LT013", name: "Vitamin D Level", description: "25-hydroxy vitamin D", category: "Chemistry" },
  { id: "LT014", name: "Iron Studies", description: "Iron, ferritin, TIBC", category: "Hematology" },
  { id: "LT015", name: "Uric Acid", description: "Gout indicator", category: "Chemistry" }
];

// Medicine Master List
export const medicineMaster = [
  { id: "MED001", name: "Metformin", strengths: ["250mg", "500mg", "850mg", "1000mg"], category: "Antidiabetic" },
  { id: "MED002", name: "Amlodipine", strengths: ["2.5mg", "5mg", "10mg"], category: "Antihypertensive" },
  { id: "MED003", name: "Omeprazole", strengths: ["10mg", "20mg", "40mg"], category: "PPI" },
  { id: "MED004", name: "Paracetamol", strengths: ["325mg", "500mg", "650mg"], category: "Analgesic" },
  { id: "MED005", name: "Amoxicillin", strengths: ["250mg", "500mg", "875mg"], category: "Antibiotic" },
  { id: "MED006", name: "Cetirizine", strengths: ["5mg", "10mg"], category: "Antihistamine" },
  { id: "MED007", name: "Lisinopril", strengths: ["5mg", "10mg", "20mg", "40mg"], category: "ACE Inhibitor" },
  { id: "MED008", name: "Atorvastatin", strengths: ["10mg", "20mg", "40mg", "80mg"], category: "Statin" },
  { id: "MED009", name: "Losartan", strengths: ["25mg", "50mg", "100mg"], category: "ARB" },
  { id: "MED010", name: "Ibuprofen", strengths: ["200mg", "400mg", "600mg"], category: "NSAID" },
  { id: "MED011", name: "Azithromycin", strengths: ["250mg", "500mg"], category: "Antibiotic" },
  { id: "MED012", name: "Pantoprazole", strengths: ["20mg", "40mg"], category: "PPI" },
  { id: "MED013", name: "Montelukast", strengths: ["4mg", "5mg", "10mg"], category: "Anti-asthma" },
  { id: "MED014", name: "Salbutamol Inhaler", strengths: ["100mcg"], category: "Bronchodilator" },
  { id: "MED015", name: "Prednisolone", strengths: ["5mg", "10mg", "20mg"], category: "Corticosteroid" }
];

// Frequency Options
export const frequencyOptions = [
  { value: "once_daily", label: "Once daily" },
  { value: "twice_daily", label: "Twice daily" },
  { value: "thrice_daily", label: "Three times daily" },
  { value: "four_times", label: "Four times daily" },
  { value: "every_6_hours", label: "Every 6 hours" },
  { value: "every_8_hours", label: "Every 8 hours" },
  { value: "before_food", label: "Before food" },
  { value: "after_food", label: "After food" },
  { value: "at_bedtime", label: "At bedtime" },
  { value: "sos", label: "SOS (As needed)" }
];

// Duration Options
export const durationOptions = [
  { value: "3_days", label: "3 days" },
  { value: "5_days", label: "5 days" },
  { value: "7_days", label: "7 days (1 week)" },
  { value: "10_days", label: "10 days" },
  { value: "14_days", label: "14 days (2 weeks)" },
  { value: "21_days", label: "21 days (3 weeks)" },
  { value: "30_days", label: "30 days (1 month)" },
  { value: "60_days", label: "60 days (2 months)" },
  { value: "90_days", label: "90 days (3 months)" },
  { value: "continuous", label: "Continuous" }
];

// Unit Options
export const unitOptions = [
  { value: "mg", label: "mg" },
  { value: "ml", label: "ml" },
  { value: "tablet", label: "Tablet(s)" },
  { value: "capsule", label: "Capsule(s)" },
  { value: "drops", label: "Drops" },
  { value: "puffs", label: "Puff(s)" },
  { value: "teaspoon", label: "Teaspoon" },
  { value: "tablespoon", label: "Tablespoon" }
];

// Saved Templates (dummy)
export const savedTemplates: TreatmentTemplate[] = [
  {
    id: "TPL001",
    name: "Standard Diabetes Management",
    diagnosisId: "DX001",
    diagnosisName: "Type 2 Diabetes Mellitus",
    medications: [
      { id: "PM001", name: "Metformin", dosage: "500", unit: "mg", frequency: "twice_daily", duration: "30_days", instructions: "Take with meals", isAISuggested: false },
      { id: "PM002", name: "Glimepiride", dosage: "2", unit: "mg", frequency: "once_daily", duration: "30_days", instructions: "Take before breakfast", isAISuggested: false }
    ],
    notes: "Standard protocol for newly diagnosed T2DM",
    createdAt: "2023-11-15"
  },
  {
    id: "TPL002",
    name: "Hypertension Protocol",
    diagnosisId: "DX002",
    diagnosisName: "Essential Hypertension",
    medications: [
      { id: "PM003", name: "Amlodipine", dosage: "5", unit: "mg", frequency: "once_daily", duration: "30_days", instructions: "Take in the morning", isAISuggested: false }
    ],
    notes: "First-line therapy for stage 1 hypertension",
    createdAt: "2023-10-20"
  }
];