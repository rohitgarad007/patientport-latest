// Dummy data for the EMR Auto-Suggestion System

export interface Symptom {
  id: string;
  name: string;
  category: string;
}

export interface Diagnosis {
  id: string;
  name: string;
  confidence: number;
  supportingSymptoms: string[];
  description: string;
}

export interface PatientHistoryItem {
  id: string;
  name: string;
  category: string;
  relevant?: boolean;
}

export interface LabTest {
  id: string;
  name: string;
  purpose: string;
  priority: 'high' | 'medium' | 'low';
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  unit: string;
  frequency: string;
  duration: string;
  instructions: string;
  category: 'first-line' | 'supportive' | 'optional';
}

export const symptomsData: Symptom[] = [
  // General
  { id: 's1', name: 'Fever', category: 'General' },
  { id: 's2', name: 'Fatigue', category: 'General' },
  { id: 's3', name: 'Weakness', category: 'General' },
  { id: 's4', name: 'Weight Loss', category: 'General' },
  { id: 's5', name: 'Night Sweats', category: 'General' },
  { id: 's6', name: 'Chills', category: 'General' },
  
  // Respiratory
  { id: 's7', name: 'Cough', category: 'Respiratory' },
  { id: 's8', name: 'Shortness of Breath', category: 'Respiratory' },
  { id: 's9', name: 'Chest Pain', category: 'Respiratory' },
  { id: 's10', name: 'Wheezing', category: 'Respiratory' },
  { id: 's11', name: 'Sore Throat', category: 'Respiratory' },
  { id: 's12', name: 'Runny Nose', category: 'Respiratory' },
  { id: 's13', name: 'Nasal Congestion', category: 'Respiratory' },
  
  // Gastrointestinal
  { id: 's14', name: 'Nausea', category: 'Gastrointestinal' },
  { id: 's15', name: 'Vomiting', category: 'Gastrointestinal' },
  { id: 's16', name: 'Diarrhea', category: 'Gastrointestinal' },
  { id: 's17', name: 'Abdominal Pain', category: 'Gastrointestinal' },
  { id: 's18', name: 'Loss of Appetite', category: 'Gastrointestinal' },
  { id: 's19', name: 'Bloating', category: 'Gastrointestinal' },
  { id: 's20', name: 'Constipation', category: 'Gastrointestinal' },
  
  // Neurological
  { id: 's21', name: 'Headache', category: 'Neurological' },
  { id: 's22', name: 'Dizziness', category: 'Neurological' },
  { id: 's23', name: 'Confusion', category: 'Neurological' },
  { id: 's24', name: 'Numbness', category: 'Neurological' },
  { id: 's25', name: 'Tingling', category: 'Neurological' },
  
  // Musculoskeletal
  { id: 's26', name: 'Joint Pain', category: 'Musculoskeletal' },
  { id: 's27', name: 'Muscle Pain', category: 'Musculoskeletal' },
  { id: 's28', name: 'Back Pain', category: 'Musculoskeletal' },
  { id: 's29', name: 'Stiffness', category: 'Musculoskeletal' },
  { id: 's30', name: 'Swelling', category: 'Musculoskeletal' },
  
  // Skin
  { id: 's31', name: 'Rash', category: 'Skin' },
  { id: 's32', name: 'Itching', category: 'Skin' },
  { id: 's33', name: 'Skin Discoloration', category: 'Skin' },
  
  // Cardiovascular
  { id: 's34', name: 'Palpitations', category: 'Cardiovascular' },
  { id: 's35', name: 'Rapid Heartbeat', category: 'Cardiovascular' },
  { id: 's36', name: 'Leg Swelling', category: 'Cardiovascular' },
];

export const diagnosisMapping: Record<string, Diagnosis[]> = {
  's1,s7': [
    {
      id: 'd1',
      name: 'Upper Respiratory Tract Infection',
      confidence: 92,
      supportingSymptoms: ['Fever', 'Cough'],
      description: 'Common viral infection affecting nose, sinuses, and throat',
    },
    {
      id: 'd2',
      name: 'Influenza',
      confidence: 78,
      supportingSymptoms: ['Fever', 'Cough'],
      description: 'Viral respiratory illness caused by influenza viruses',
    },
    {
      id: 'd3',
      name: 'COVID-19',
      confidence: 65,
      supportingSymptoms: ['Fever', 'Cough'],
      description: 'Respiratory illness caused by SARS-CoV-2 virus',
    },
  ],
  's1,s7,s8': [
    {
      id: 'd4',
      name: 'Pneumonia',
      confidence: 85,
      supportingSymptoms: ['Fever', 'Cough', 'Shortness of Breath'],
      description: 'Infection that inflames air sacs in one or both lungs',
    },
    {
      id: 'd5',
      name: 'Bronchitis',
      confidence: 72,
      supportingSymptoms: ['Fever', 'Cough', 'Shortness of Breath'],
      description: 'Inflammation of bronchial tubes in lungs',
    },
  ],
  's14,s15,s16': [
    {
      id: 'd6',
      name: 'Acute Gastroenteritis',
      confidence: 88,
      supportingSymptoms: ['Nausea', 'Vomiting', 'Diarrhea'],
      description: 'Inflammation of stomach and intestines',
    },
    {
      id: 'd7',
      name: 'Food Poisoning',
      confidence: 75,
      supportingSymptoms: ['Nausea', 'Vomiting', 'Diarrhea'],
      description: 'Illness caused by contaminated food or water',
    },
  ],
  's21,s1': [
    {
      id: 'd8',
      name: 'Viral Fever',
      confidence: 80,
      supportingSymptoms: ['Headache', 'Fever'],
      description: 'Fever caused by viral infection',
    },
    {
      id: 'd9',
      name: 'Meningitis',
      confidence: 45,
      supportingSymptoms: ['Headache', 'Fever'],
      description: 'Inflammation of protective membranes covering brain',
    },
  ],
};

export const defaultDiagnoses: Diagnosis[] = [
  {
    id: 'd10',
    name: 'General Viral Infection',
    confidence: 60,
    supportingSymptoms: ['Multiple symptoms'],
    description: 'Non-specific viral illness requiring further evaluation',
  },
];

export const patientHistoryData: PatientHistoryItem[] = [
  // Vital Signs
  { id: 'h1', name: 'High Blood Pressure', category: 'Vital Signs' },
  { id: 'h2', name: 'Low Blood Pressure', category: 'Vital Signs' },
  { id: 'h3', name: 'Irregular Pulse', category: 'Vital Signs' },
  
  // Chronic Conditions
  { id: 'h4', name: 'Diabetes Type 1', category: 'Chronic Conditions' },
  { id: 'h5', name: 'Diabetes Type 2', category: 'Chronic Conditions' },
  { id: 'h6', name: 'Hypertension', category: 'Chronic Conditions' },
  { id: 'h7', name: 'Thyroid Disorder', category: 'Chronic Conditions' },
  
  // Cardiac
  { id: 'h8', name: 'Heart Disease', category: 'Cardiac' },
  { id: 'h9', name: 'Previous Heart Attack', category: 'Cardiac' },
  { id: 'h10', name: 'Arrhythmia', category: 'Cardiac' },
  { id: 'h11', name: 'Heart Failure', category: 'Cardiac' },
  
  // Bone & Joint
  { id: 'h12', name: 'Arthritis', category: 'Bone & Joint' },
  { id: 'h13', name: 'Osteoporosis', category: 'Bone & Joint' },
  { id: 'h14', name: 'Previous Fracture', category: 'Bone & Joint' },
  
  // Infectious
  { id: 'h15', name: 'HIV/AIDS', category: 'Infectious' },
  { id: 'h16', name: 'Hepatitis B', category: 'Infectious' },
  { id: 'h17', name: 'Hepatitis C', category: 'Infectious' },
  { id: 'h18', name: 'Tuberculosis', category: 'Infectious' },
  
  // Allergy
  { id: 'h19', name: 'Drug Allergies', category: 'Allergy' },
  { id: 'h20', name: 'Food Allergies', category: 'Allergy' },
  { id: 'h21', name: 'Environmental Allergies', category: 'Allergy' },
  { id: 'h22', name: 'Penicillin Allergy', category: 'Allergy' },
  
  // Neurological
  { id: 'h23', name: 'Epilepsy', category: 'Neurological' },
  { id: 'h24', name: 'Migraine History', category: 'Neurological' },
  { id: 'h25', name: 'Stroke History', category: 'Neurological' },
  { id: 'h26', name: 'Parkinson\'s Disease', category: 'Neurological' },
  
  // Psychiatric
  { id: 'h27', name: 'Depression', category: 'Psychiatric' },
  { id: 'h28', name: 'Anxiety Disorder', category: 'Psychiatric' },
  { id: 'h29', name: 'Bipolar Disorder', category: 'Psychiatric' },
  
  // Respiratory
  { id: 'h30', name: 'Asthma', category: 'Respiratory' },
  { id: 'h31', name: 'COPD', category: 'Respiratory' },
  { id: 'h32', name: 'Sleep Apnea', category: 'Respiratory' },
  
  // Urinary
  { id: 'h33', name: 'Kidney Disease', category: 'Urinary' },
  { id: 'h34', name: 'Kidney Stones', category: 'Urinary' },
  { id: 'h35', name: 'Urinary Tract Infections', category: 'Urinary' },
  
  // Lifestyle
  { id: 'h36', name: 'Smoker', category: 'Lifestyle' },
  { id: 'h37', name: 'Former Smoker', category: 'Lifestyle' },
  { id: 'h38', name: 'Alcohol Use', category: 'Lifestyle' },
  { id: 'h39', name: 'Sedentary Lifestyle', category: 'Lifestyle' },
  
  // Female Health
  { id: 'h40', name: 'Pregnancy', category: 'Female Health' },
  { id: 'h41', name: 'Menopause', category: 'Female Health' },
  { id: 'h42', name: 'PCOS', category: 'Female Health' },
  
  // Diagnostic
  { id: 'h43', name: 'Recent Surgery', category: 'Diagnostic' },
  { id: 'h44', name: 'Cancer History', category: 'Diagnostic' },
  { id: 'h45', name: 'Immunocompromised', category: 'Diagnostic' },
];

export const labTestsMapping: Record<string, LabTest[]> = {
  'respiratory': [
    { id: 'l1', name: 'Complete Blood Count (CBC)', purpose: 'Evaluate infection markers and overall blood health', priority: 'high' },
    { id: 'l2', name: 'C-Reactive Protein (CRP)', purpose: 'Measure inflammation levels', priority: 'high' },
    { id: 'l3', name: 'Chest X-Ray', purpose: 'Visualize lung condition and detect pneumonia', priority: 'high' },
    { id: 'l4', name: 'COVID-19 RT-PCR', purpose: 'Rule out COVID-19 infection', priority: 'medium' },
    { id: 'l5', name: 'Influenza A/B Test', purpose: 'Detect influenza virus', priority: 'medium' },
    { id: 'l6', name: 'Sputum Culture', purpose: 'Identify bacterial pathogens', priority: 'low' },
  ],
  'gastrointestinal': [
    { id: 'l7', name: 'Stool Culture', purpose: 'Identify infectious agents', priority: 'high' },
    { id: 'l8', name: 'Complete Blood Count (CBC)', purpose: 'Check for infection and dehydration', priority: 'high' },
    { id: 'l9', name: 'Electrolyte Panel', purpose: 'Assess electrolyte imbalance', priority: 'high' },
    { id: 'l10', name: 'Liver Function Tests', purpose: 'Evaluate liver health', priority: 'medium' },
    { id: 'l11', name: 'Abdominal Ultrasound', purpose: 'Visualize abdominal organs', priority: 'low' },
  ],
  'neurological': [
    { id: 'l12', name: 'Complete Blood Count (CBC)', purpose: 'Basic health screening', priority: 'high' },
    { id: 'l13', name: 'CT Scan Head', purpose: 'Rule out structural abnormalities', priority: 'high' },
    { id: 'l14', name: 'Lumbar Puncture', purpose: 'Analyze cerebrospinal fluid if meningitis suspected', priority: 'medium' },
    { id: 'l15', name: 'MRI Brain', purpose: 'Detailed brain imaging', priority: 'low' },
  ],
  'general': [
    { id: 'l16', name: 'Complete Blood Count (CBC)', purpose: 'Overall health assessment', priority: 'high' },
    { id: 'l17', name: 'Basic Metabolic Panel', purpose: 'Assess kidney function and electrolytes', priority: 'medium' },
    { id: 'l18', name: 'Urinalysis', purpose: 'Screen for various conditions', priority: 'medium' },
  ],
};

export const medicationSuggestions: Record<string, Medication[]> = {
  'respiratory': [
    // First-line
    { id: 'm1', name: 'Paracetamol', dosage: '500', unit: 'mg', frequency: 'Every 6 hours', duration: '5 days', instructions: 'Take with food if stomach upset', category: 'first-line' },
    { id: 'm2', name: 'Amoxicillin', dosage: '500', unit: 'mg', frequency: 'Three times daily', duration: '7 days', instructions: 'Complete full course', category: 'first-line' },
    { id: 'm3', name: 'Azithromycin', dosage: '500', unit: 'mg', frequency: 'Once daily', duration: '3 days', instructions: 'Take on empty stomach', category: 'first-line' },
    
    // Supportive
    { id: 'm4', name: 'Cetirizine', dosage: '10', unit: 'mg', frequency: 'Once daily', duration: '5 days', instructions: 'May cause drowsiness', category: 'supportive' },
    { id: 'm5', name: 'Dextromethorphan', dosage: '15', unit: 'ml', frequency: 'Every 8 hours', duration: '5 days', instructions: 'Cough suppressant - use as needed', category: 'supportive' },
    { id: 'm6', name: 'Guaifenesin', dosage: '10', unit: 'ml', frequency: 'Every 4 hours', duration: '5 days', instructions: 'Drink plenty of water', category: 'supportive' },
    
    // Optional
    { id: 'm7', name: 'Vitamin C', dosage: '1000', unit: 'mg', frequency: 'Once daily', duration: '14 days', instructions: 'Immune support', category: 'optional' },
    { id: 'm8', name: 'Zinc Supplement', dosage: '50', unit: 'mg', frequency: 'Once daily', duration: '10 days', instructions: 'Take with food', category: 'optional' },
  ],
  'gastrointestinal': [
    // First-line
    { id: 'm9', name: 'ORS (Oral Rehydration Salts)', dosage: '1', unit: 'sachet', frequency: 'After each loose motion', duration: 'As needed', instructions: 'Dissolve in 200ml water', category: 'first-line' },
    { id: 'm10', name: 'Ondansetron', dosage: '4', unit: 'mg', frequency: 'Every 8 hours', duration: '3 days', instructions: 'For nausea/vomiting', category: 'first-line' },
    { id: 'm11', name: 'Loperamide', dosage: '2', unit: 'mg', frequency: 'After each loose motion', duration: '2 days', instructions: 'Max 8 tablets per day', category: 'first-line' },
    
    // Supportive
    { id: 'm12', name: 'Pantoprazole', dosage: '40', unit: 'mg', frequency: 'Once daily before breakfast', duration: '7 days', instructions: 'Take on empty stomach', category: 'supportive' },
    { id: 'm13', name: 'Probiotics', dosage: '1', unit: 'capsule', frequency: 'Twice daily', duration: '7 days', instructions: 'Take after meals', category: 'supportive' },
    
    // Optional
    { id: 'm14', name: 'Dicyclomine', dosage: '10', unit: 'mg', frequency: 'Three times daily', duration: '5 days', instructions: 'For abdominal cramps', category: 'optional' },
  ],
  'general': [
    { id: 'm15', name: 'Paracetamol', dosage: '500', unit: 'mg', frequency: 'Every 6 hours', duration: '3 days', instructions: 'For fever and pain', category: 'first-line' },
    { id: 'm16', name: 'Ibuprofen', dosage: '400', unit: 'mg', frequency: 'Every 8 hours', duration: '5 days', instructions: 'Take with food', category: 'supportive' },
    { id: 'm17', name: 'Multivitamin', dosage: '1', unit: 'tablet', frequency: 'Once daily', duration: '30 days', instructions: 'General health support', category: 'optional' },
  ],
};

export const medicationOptions = {
  units: ['mg', 'ml', 'tablet', 'capsule', 'sachet', 'drops', 'puff', 'IU'],
  frequencies: [
    'Once daily',
    'Twice daily',
    'Three times daily',
    'Four times daily',
    'Every 4 hours',
    'Every 6 hours',
    'Every 8 hours',
    'Every 12 hours',
    'As needed',
    'Before meals',
    'After meals',
    'At bedtime',
  ],
  durations: [
    '1 day',
    '3 days',
    '5 days',
    '7 days',
    '10 days',
    '14 days',
    '21 days',
    '30 days',
    '3 months',
    '6 months',
    'Continuous',
  ],
};

export const commonMedications = [
  'Paracetamol',
  'Ibuprofen',
  'Amoxicillin',
  'Azithromycin',
  'Ciprofloxacin',
  'Metronidazole',
  'Omeprazole',
  'Pantoprazole',
  'Cetirizine',
  'Loratadine',
  'Salbutamol',
  'Montelukast',
  'Metformin',
  'Glimepiride',
  'Amlodipine',
  'Losartan',
  'Atorvastatin',
  'Aspirin',
  'Diclofenac',
  'Tramadol',
  'Prednisone',
  'Dexamethasone',
  'Ondansetron',
  'Domperidone',
  'Ranitidine',
  'Vitamin D3',
  'Vitamin B12',
  'Folic Acid',
  'Iron Supplement',
  'Calcium Supplement',
];

export function getSymptomCategories(): string[] {
  return [...new Set(symptomsData.map(s => s.category))];
}

export function getPatientHistoryCategories(): string[] {
  return [...new Set(patientHistoryData.map(h => h.category))];
}

export function getDiagnosisForSymptoms(symptomIds: string[]): Diagnosis[] {
  const sortedIds = [...symptomIds].sort().join(',');
  
  // Check for exact matches
  if (diagnosisMapping[sortedIds]) {
    return diagnosisMapping[sortedIds];
  }
  
  // Check for partial matches
  for (const key of Object.keys(diagnosisMapping)) {
    const keyIds = key.split(',');
    if (keyIds.every(id => symptomIds.includes(id))) {
      return diagnosisMapping[key];
    }
  }
  
  return defaultDiagnoses;
}

export function getLabTestsForCondition(symptoms: string[]): LabTest[] {
  const symptomNames = symptoms.map(id => 
    symptomsData.find(s => s.id === id)?.category.toLowerCase() || ''
  );
  
  const tests: LabTest[] = [];
  const addedIds = new Set<string>();
  
  if (symptomNames.some(c => c.includes('respiratory') || c === 'respiratory')) {
    labTestsMapping['respiratory'].forEach(test => {
      if (!addedIds.has(test.id)) {
        tests.push(test);
        addedIds.add(test.id);
      }
    });
  }
  
  if (symptomNames.some(c => c.includes('gastrointestinal'))) {
    labTestsMapping['gastrointestinal'].forEach(test => {
      if (!addedIds.has(test.id)) {
        tests.push(test);
        addedIds.add(test.id);
      }
    });
  }
  
  if (symptomNames.some(c => c.includes('neurological'))) {
    labTestsMapping['neurological'].forEach(test => {
      if (!addedIds.has(test.id)) {
        tests.push(test);
        addedIds.add(test.id);
      }
    });
  }
  
  // Add general tests if no specific matches
  if (tests.length === 0) {
    labTestsMapping['general'].forEach(test => {
      if (!addedIds.has(test.id)) {
        tests.push(test);
        addedIds.add(test.id);
      }
    });
  }
  
  return tests;
}

export function getMedicationsForCondition(symptoms: string[]): Medication[] {
  const symptomCategories = symptoms.map(id => 
    symptomsData.find(s => s.id === id)?.category.toLowerCase() || ''
  );
  
  if (symptomCategories.some(c => c.includes('respiratory'))) {
    return medicationSuggestions['respiratory'];
  }
  
  if (symptomCategories.some(c => c.includes('gastrointestinal'))) {
    return medicationSuggestions['gastrointestinal'];
  }
  
  return medicationSuggestions['general'];
}
