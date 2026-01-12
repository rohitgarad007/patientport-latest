import { SuggestionItem } from '@/types/medical';

// Mock database for medical suggestions
export const diagnosisDatabase: SuggestionItem[] = [
  { name: 'Type 2 Diabetes Mellitus', code: 'E11.9', description: 'Without complications' },
  { name: 'Hypertension', code: 'I10', description: 'Essential (primary) hypertension' },
  { name: 'Acute Upper Respiratory Infection', code: 'J06.9', description: 'Unspecified' },
  { name: 'Acute Bronchitis', code: 'J20.9', description: 'Due to unspecified organism' },
  { name: 'Gastroesophageal Reflux Disease', code: 'K21.9', description: 'Without esophagitis' },
  { name: 'Migraine', code: 'G43.909', description: 'Unspecified migraine, not intractable' },
  { name: 'Osteoarthritis', code: 'M19.90', description: 'Unspecified, unspecified site' },
  { name: 'Asthma', code: 'J45.909', description: 'Unspecified, uncomplicated' },
  { name: 'Hyperlipidemia', code: 'E78.5', description: 'Hyperlipidemia, unspecified' },
  { name: 'Anxiety Disorder', code: 'F41.9', description: 'Unspecified anxiety disorder' },
];

export const medicationDatabase: SuggestionItem[] = [
  { name: 'Metformin', description: 'Oral diabetes medication' },
  { name: 'Lisinopril', description: 'ACE inhibitor for hypertension' },
  { name: 'Atorvastatin', description: 'Statin for cholesterol management' },
  { name: 'Amlodipine', description: 'Calcium channel blocker' },
  { name: 'Levothyroxine', description: 'Thyroid hormone replacement' },
  { name: 'Omeprazole', description: 'Proton pump inhibitor' },
  { name: 'Albuterol', description: 'Bronchodilator for asthma' },
  { name: 'Ibuprofen', description: 'NSAID for pain and inflammation' },
  { name: 'Amoxicillin', description: 'Antibiotic' },
  { name: 'Aspirin', description: 'Antiplatelet agent' },
];

export const labTestDatabase: SuggestionItem[] = [
  { name: 'HbA1c', code: 'LAB-HBA1C', description: 'Diabetes monitoring' },
  { name: 'Complete Blood Count (CBC)', code: 'LAB-CBC', description: 'General health assessment' },
  { name: 'Lipid Panel', code: 'LAB-LIPID', description: 'Cholesterol levels' },
  { name: 'Basic Metabolic Panel', code: 'LAB-BMP', description: 'Kidney function and electrolytes' },
  { name: 'Thyroid Stimulating Hormone (TSH)', code: 'LAB-TSH', description: 'Thyroid function' },
  { name: 'Urinalysis', code: 'LAB-UA', description: 'Kidney and urinary tract health' },
  { name: 'Liver Function Tests', code: 'LAB-LFT', description: 'Liver health assessment' },
  { name: 'C-Reactive Protein (CRP)', code: 'LAB-CRP', description: 'Inflammation marker' },
  { name: 'Vitamin D', code: 'LAB-VITD', description: 'Vitamin D levels' },
  { name: 'Chest X-Ray', code: 'IMG-CXR', description: 'Lung imaging' },
];

export const procedureDatabase: SuggestionItem[] = [
  { name: 'ECG', code: 'PROC-ECG', description: '12-lead electrocardiogram for baseline cardiac assessment' },
  { name: 'Echocardiogram', code: 'PROC-ECHO', description: 'Ultrasound of the heart' },
  { name: 'Colonoscopy', code: 'PROC-COLO', description: 'Colon examination' },
  { name: 'Stress Test', code: 'PROC-STRESS', description: 'Cardiac stress testing' },
  { name: 'Physical Therapy Consultation', code: 'PROC-PT', description: 'Rehabilitation assessment' },
  { name: 'Wound Care', code: 'PROC-WOUND', description: 'Wound dressing and management' },
  { name: 'Nebulizer Treatment', code: 'PROC-NEB', description: 'Respiratory therapy' },
  { name: 'Blood Pressure Monitoring', code: 'PROC-BP', description: '24-hour ambulatory BP monitoring' },
];

// Simulate AI-generated suggestions (would normally come from ChatGPT)
export const generateAISuggestions = (query: string, type: 'diagnosis' | 'medication' | 'labtest' | 'procedure'): SuggestionItem[] => {
  // Simulate AI response delay
  const aiSuggestions: Record<string, SuggestionItem[]> = {
    diagnosis: [
      { name: 'Chronic Fatigue Syndrome', code: 'G93.3', description: 'AI suggested based on symptoms pattern', isAI: true },
      { name: 'Fibromyalgia', code: 'M79.7', description: 'AI suggested for chronic pain assessment', isAI: true },
      { name: 'Sleep Apnea', code: 'G47.33', description: 'AI suggested for sleep disturbance evaluation', isAI: true },
    ],
    medication: [
      { name: 'Gabapentin', description: 'AI suggested for neuropathic pain', isAI: true },
      { name: 'Duloxetine', description: 'AI suggested for chronic pain management', isAI: true },
      { name: 'Melatonin', description: 'AI suggested for sleep regulation', isAI: true },
    ],
    labtest: [
      { name: 'Sleep Study (Polysomnography)', code: 'LAB-SLEEP', description: 'AI suggested for sleep disorder evaluation', isAI: true },
      { name: 'Vitamin B12 Level', code: 'LAB-B12', description: 'AI suggested for fatigue assessment', isAI: true },
      { name: 'Ferritin', code: 'LAB-FERR', description: 'AI suggested for iron storage evaluation', isAI: true },
    ],
    procedure: [
      { name: 'Sleep Consultation', code: 'PROC-SLEEP', description: 'AI suggested specialist referral', isAI: true },
      { name: 'Pain Management Consultation', code: 'PROC-PAIN', description: 'AI suggested for chronic pain', isAI: true },
      { name: 'Nutrition Counseling', code: 'PROC-NUTR', description: 'AI suggested lifestyle intervention', isAI: true },
    ],
  };

  return aiSuggestions[type] || [];
};

export const searchDatabase = (query: string, database: SuggestionItem[]): SuggestionItem[] => {
  if (!query) return [];
  
  const lowerQuery = query.toLowerCase();
  return database.filter(item => 
    item.name.toLowerCase().includes(lowerQuery) ||
    item.code?.toLowerCase().includes(lowerQuery) ||
    item.description.toLowerCase().includes(lowerQuery)
  ).slice(0, 5);
};
