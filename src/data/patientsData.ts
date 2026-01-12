export interface Patient {
  id: string;
  name: string;
  photo?: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  phone: string;
  email: string;
  address: string;
  patientId: string;
  status: 'Active' | 'Inactive' | 'Critical';
  lastVisit: string;
  bloodType: string;
  maritalStatus: string;
  language: string;
  insurance: string;
  allergies: string[];
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  medicalConditions?: string[];
}

export interface Vitals {
  temperature: string;
  bloodPressure: string;
  heartRate: string;
  oxygenLevel: string;
  weight: string;
  height: string;
  recordedAt: string;
}

export interface Appointment {
  id: string;
  date: string;
  time: string;
  doctor: string;
  department: string;
  reason: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  prescribedBy: string;
  status: 'Active' | 'Completed';
}

export interface MedicalVisit {
  id: string;
  date: string;
  doctor: string;
  department: string;
  reason: string;
  diagnosis: string;
  prescription: string[];
  followUp?: string;
  notes: string;
}

export interface LabReport {
  id: string;
  date: string;
  testType: string;
  orderedBy: string;
  results: string;
  status: 'Pending' | 'Completed';
  reportUrl?: string;
}

export interface Surgery {
  id: string;
  date: string;
  procedure: string;
  surgeon: string;
  outcome: string;
  notes: string;
}

export interface Vaccination {
  id: string;
  name: string;
  date: string;
  nextDue?: string;
  administeredBy: string;
}

export const mockPatients: Patient[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    age: 34,
    gender: 'Female',
    dob: '1990-05-15',
    phone: '+1-555-0123',
    email: 'sarah.j@email.com',
    address: '123 Maple Street, Boston, MA 02101',
    patientId: 'PAT-2024-001',
    status: 'Active',
    lastVisit: '2024-09-15',
    bloodType: 'O+',
    maritalStatus: 'Married',
    language: 'English',
    insurance: 'Blue Cross Blue Shield',
    allergies: ['Penicillin', 'Peanuts'],
    emergencyContact: {
      name: 'Michael Johnson',
      phone: '+1-555-0124',
      relation: 'Spouse'
    },
    medicalConditions: ['Hypertension', 'Type 2 Diabetes']
  },
  {
    id: '2',
    name: 'Michael Chen',
    age: 45,
    gender: 'Male',
    dob: '1979-08-22',
    phone: '+1-555-0125',
    email: 'michael.chen@email.com',
    address: '456 Oak Avenue, Boston, MA 02102',
    patientId: 'PAT-2024-002',
    status: 'Critical',
    lastVisit: '2024-10-02',
    bloodType: 'A+',
    maritalStatus: 'Single',
    language: 'English, Mandarin',
    insurance: 'Aetna',
    allergies: ['Aspirin'],
    emergencyContact: {
      name: 'Lisa Chen',
      phone: '+1-555-0126',
      relation: 'Sister'
    },
    medicalConditions: ['Coronary Artery Disease']
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    age: 28,
    gender: 'Female',
    dob: '1996-12-10',
    phone: '+1-555-0127',
    email: 'emily.r@email.com',
    address: '789 Pine Road, Boston, MA 02103',
    patientId: 'PAT-2024-003',
    status: 'Active',
    lastVisit: '2024-09-28',
    bloodType: 'B+',
    maritalStatus: 'Single',
    language: 'English, Spanish',
    insurance: 'United Healthcare',
    allergies: [],
    emergencyContact: {
      name: 'Maria Rodriguez',
      phone: '+1-555-0128',
      relation: 'Mother'
    }
  },
  {
    id: '4',
    name: 'David Wilson',
    age: 52,
    gender: 'Male',
    dob: '1972-03-18',
    phone: '+1-555-0129',
    email: 'david.w@email.com',
    address: '321 Elm Street, Boston, MA 02104',
    patientId: 'PAT-2024-004',
    status: 'Active',
    lastVisit: '2024-09-20',
    bloodType: 'AB-',
    maritalStatus: 'Married',
    language: 'English',
    insurance: 'Cigna',
    allergies: ['Latex'],
    emergencyContact: {
      name: 'Jennifer Wilson',
      phone: '+1-555-0130',
      relation: 'Spouse'
    },
    medicalConditions: ['Asthma']
  },
  {
    id: '5',
    name: 'Priya Patel',
    age: 31,
    gender: 'Female',
    dob: '1993-07-25',
    phone: '+1-555-0131',
    email: 'priya.p@email.com',
    address: '567 Birch Lane, Boston, MA 02105',
    patientId: 'PAT-2024-005',
    status: 'Active',
    lastVisit: '2024-10-01',
    bloodType: 'O-',
    maritalStatus: 'Married',
    language: 'English, Hindi, Gujarati',
    insurance: 'Kaiser Permanente',
    allergies: ['Sulfa drugs'],
    emergencyContact: {
      name: 'Rajesh Patel',
      phone: '+1-555-0132',
      relation: 'Spouse'
    }
  },
  {
    id: '6',
    name: 'James Anderson',
    age: 67,
    gender: 'Male',
    dob: '1957-11-05',
    phone: '+1-555-0133',
    email: 'james.a@email.com',
    address: '890 Cedar Court, Boston, MA 02106',
    patientId: 'PAT-2024-006',
    status: 'Active',
    lastVisit: '2024-09-12',
    bloodType: 'A-',
    maritalStatus: 'Widowed',
    language: 'English',
    insurance: 'Medicare',
    allergies: ['Iodine'],
    emergencyContact: {
      name: 'Robert Anderson',
      phone: '+1-555-0134',
      relation: 'Son'
    },
    medicalConditions: ['Arthritis', 'High Cholesterol']
  },
  {
    id: '7',
    name: 'Olivia Martinez',
    age: 22,
    gender: 'Female',
    dob: '2002-04-30',
    phone: '+1-555-0135',
    email: 'olivia.m@email.com',
    address: '234 Willow Way, Boston, MA 02107',
    patientId: 'PAT-2024-007',
    status: 'Inactive',
    lastVisit: '2024-06-15',
    bloodType: 'B-',
    maritalStatus: 'Single',
    language: 'English, Spanish',
    insurance: 'Parent Plan - Humana',
    allergies: [],
    emergencyContact: {
      name: 'Carlos Martinez',
      phone: '+1-555-0136',
      relation: 'Father'
    }
  },
  {
    id: '8',
    name: 'Daniel Kim',
    age: 39,
    gender: 'Male',
    dob: '1985-09-14',
    phone: '+1-555-0137',
    email: 'daniel.k@email.com',
    address: '678 Spruce Drive, Boston, MA 02108',
    patientId: 'PAT-2024-008',
    status: 'Active',
    lastVisit: '2024-09-25',
    bloodType: 'O+',
    maritalStatus: 'Married',
    language: 'English, Korean',
    insurance: 'Blue Cross Blue Shield',
    allergies: ['Shellfish'],
    emergencyContact: {
      name: 'Susan Kim',
      phone: '+1-555-0138',
      relation: 'Spouse'
    }
  }
];

export const mockVitals: Record<string, Vitals> = {
  '1': {
    temperature: '98.6°F',
    bloodPressure: '120/80 mmHg',
    heartRate: '72 bpm',
    oxygenLevel: '98%',
    weight: '145 lbs',
    height: '5\'6"',
    recordedAt: '2024-09-15 10:30 AM'
  },
  '2': {
    temperature: '99.1°F',
    bloodPressure: '145/95 mmHg',
    heartRate: '88 bpm',
    oxygenLevel: '94%',
    weight: '180 lbs',
    height: '5\'10"',
    recordedAt: '2024-10-02 02:15 PM'
  },
  '3': {
    temperature: '98.4°F',
    bloodPressure: '115/75 mmHg',
    heartRate: '68 bpm',
    oxygenLevel: '99%',
    weight: '130 lbs',
    height: '5\'4"',
    recordedAt: '2024-09-28 09:00 AM'
  }
};

export const mockAppointments: Record<string, Appointment[]> = {
  '1': [
    {
      id: 'apt1',
      date: '2024-10-15',
      time: '10:00 AM',
      doctor: 'Dr. Sarah Johnson',
      department: 'Cardiology',
      reason: 'Regular Checkup',
      status: 'Scheduled'
    },
    {
      id: 'apt2',
      date: '2024-09-15',
      time: '02:30 PM',
      doctor: 'Dr. Michael Chen',
      department: 'General Medicine',
      reason: 'Diabetes Follow-up',
      status: 'Completed'
    }
  ],
  '2': [
    {
      id: 'apt3',
      date: '2024-10-10',
      time: '11:00 AM',
      doctor: 'Dr. Emily Rodriguez',
      department: 'Cardiology',
      reason: 'Cardiac Assessment',
      status: 'Scheduled'
    },
    {
      id: 'apt4',
      date: '2024-10-02',
      time: '03:00 PM',
      doctor: 'Dr. Sarah Johnson',
      department: 'Emergency',
      reason: 'Chest Pain',
      status: 'Completed'
    }
  ]
};

export const mockMedications: Record<string, Medication[]> = {
  '1': [
    {
      id: 'med1',
      name: 'Metformin',
      dosage: '500mg',
      frequency: 'Twice daily',
      startDate: '2024-01-15',
      prescribedBy: 'Dr. Michael Chen',
      status: 'Active'
    },
    {
      id: 'med2',
      name: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Once daily',
      startDate: '2024-03-20',
      prescribedBy: 'Dr. Sarah Johnson',
      status: 'Active'
    }
  ],
  '2': [
    {
      id: 'med3',
      name: 'Atorvastatin',
      dosage: '20mg',
      frequency: 'Once daily at bedtime',
      startDate: '2024-05-10',
      prescribedBy: 'Dr. Emily Rodriguez',
      status: 'Active'
    },
    {
      id: 'med4',
      name: 'Aspirin',
      dosage: '81mg',
      frequency: 'Once daily',
      startDate: '2024-06-01',
      endDate: '2024-08-01',
      prescribedBy: 'Dr. Sarah Johnson',
      status: 'Completed'
    }
  ]
};

export const mockMedicalVisits: Record<string, MedicalVisit[]> = {
  '1': [
    {
      id: 'visit1',
      date: '2024-09-15',
      doctor: 'Dr. Michael Chen',
      department: 'General Medicine',
      reason: 'Diabetes Follow-up',
      diagnosis: 'Type 2 Diabetes - Well Controlled',
      prescription: ['Metformin 500mg - Continue'],
      followUp: 'Schedule follow-up in 3 months',
      notes: 'Patient reports good adherence to medication. Blood sugar levels stable.'
    },
    {
      id: 'visit2',
      date: '2024-06-20',
      doctor: 'Dr. Sarah Johnson',
      department: 'Cardiology',
      reason: 'Hypertension Check',
      diagnosis: 'Essential Hypertension',
      prescription: ['Lisinopril 10mg - New prescription'],
      followUp: 'Return in 6 weeks for BP monitoring',
      notes: 'Blood pressure elevated at 145/90. Started on ACE inhibitor.'
    }
  ],
  '2': [
    {
      id: 'visit3',
      date: '2024-10-02',
      doctor: 'Dr. Sarah Johnson',
      department: 'Emergency',
      reason: 'Chest Pain',
      diagnosis: 'Acute Coronary Syndrome',
      prescription: ['Aspirin 325mg', 'Nitroglycerin as needed'],
      followUp: 'Immediate cardiology consultation',
      notes: 'Patient presented with chest pain. EKG shows ST changes. Admitted for observation.'
    }
  ],
  '3': [
    {
      id: 'visit4',
      date: '2024-09-28',
      doctor: 'Dr. Emily Rodriguez',
      department: 'General Medicine',
      reason: 'Annual Physical Examination',
      diagnosis: 'Healthy - No significant findings',
      prescription: ['Multivitamin - Daily'],
      followUp: 'Next annual physical in 12 months',
      notes: 'Patient in excellent health. All vitals within normal range. Encouraged to maintain active lifestyle.'
    },
    {
      id: 'visit5',
      date: '2024-05-12',
      doctor: 'Dr. David Wilson',
      department: 'Dermatology',
      reason: 'Skin Rash Consultation',
      diagnosis: 'Contact Dermatitis',
      prescription: ['Hydrocortisone cream 1%', 'Antihistamine as needed'],
      followUp: 'Return if symptoms persist beyond 2 weeks',
      notes: 'Mild allergic reaction, likely from new skincare product. Advised to discontinue use.'
    },
    {
      id: 'visit6',
      date: '2024-02-18',
      doctor: 'Dr. Michael Chen',
      department: 'General Medicine',
      reason: 'Flu Symptoms',
      diagnosis: 'Influenza Type A',
      prescription: ['Oseltamivir 75mg - Twice daily for 5 days', 'Rest and hydration'],
      followUp: 'Call if symptoms worsen',
      notes: 'Patient presented with fever, body aches, and fatigue. Rapid flu test positive.'
    }
  ],
  '4': [
    {
      id: 'visit7',
      date: '2024-09-20',
      doctor: 'Dr. Sarah Johnson',
      department: 'Pulmonology',
      reason: 'Asthma Management',
      diagnosis: 'Asthma - Well Controlled',
      prescription: ['Albuterol inhaler - As needed', 'Fluticasone inhaler - Twice daily'],
      followUp: 'Follow-up in 3 months',
      notes: 'Asthma symptoms well controlled with current medication regimen. Peak flow readings good.'
    }
  ],
  '5': [
    {
      id: 'visit8',
      date: '2024-10-01',
      doctor: 'Dr. Priya Sharma',
      department: 'Obstetrics',
      reason: 'Prenatal Checkup - 20 weeks',
      diagnosis: 'Normal Pregnancy Progression',
      prescription: ['Prenatal vitamins - Continue'],
      followUp: 'Next prenatal visit in 4 weeks',
      notes: 'Ultrasound shows healthy fetal development. Mother and baby doing well.'
    }
  ]
};

export const mockLabReports: Record<string, LabReport[]> = {
  '1': [
    {
      id: 'lab1',
      date: '2024-09-10',
      testType: 'HbA1c',
      orderedBy: 'Dr. Michael Chen',
      results: '6.8% - Within target range',
      status: 'Completed',
      reportUrl: '#'
    },
    {
      id: 'lab2',
      date: '2024-09-10',
      testType: 'Lipid Panel',
      orderedBy: 'Dr. Michael Chen',
      results: 'Total Cholesterol: 180 mg/dL - Normal',
      status: 'Completed',
      reportUrl: '#'
    }
  ],
  '2': [
    {
      id: 'lab3',
      date: '2024-10-02',
      testType: 'Troponin I',
      orderedBy: 'Dr. Sarah Johnson',
      results: 'Elevated - 0.8 ng/mL',
      status: 'Completed',
      reportUrl: '#'
    },
    {
      id: 'lab4',
      date: '2024-10-03',
      testType: 'Cardiac Catheterization',
      orderedBy: 'Dr. Emily Rodriguez',
      results: 'Pending',
      status: 'Pending'
    }
  ],
  '3': [
    {
      id: 'lab5',
      date: '2024-09-25',
      testType: 'Complete Blood Count (CBC)',
      orderedBy: 'Dr. Emily Rodriguez',
      results: 'All values within normal range',
      status: 'Completed',
      reportUrl: '#'
    },
    {
      id: 'lab6',
      date: '2024-09-25',
      testType: 'Comprehensive Metabolic Panel',
      orderedBy: 'Dr. Emily Rodriguez',
      results: 'Normal kidney and liver function',
      status: 'Completed',
      reportUrl: '#'
    },
    {
      id: 'lab7',
      date: '2024-05-10',
      testType: 'Allergy Patch Test',
      orderedBy: 'Dr. David Wilson',
      results: 'Positive reaction to fragrance mix',
      status: 'Completed',
      reportUrl: '#'
    },
    {
      id: 'lab8',
      date: '2024-02-15',
      testType: 'Rapid Flu Test',
      orderedBy: 'Dr. Michael Chen',
      results: 'Positive for Influenza A',
      status: 'Completed',
      reportUrl: '#'
    }
  ],
  '4': [
    {
      id: 'lab9',
      date: '2024-09-18',
      testType: 'Pulmonary Function Test',
      orderedBy: 'Dr. Sarah Johnson',
      results: 'FEV1 85% of predicted - Good control',
      status: 'Completed',
      reportUrl: '#'
    }
  ],
  '5': [
    {
      id: 'lab10',
      date: '2024-09-28',
      testType: 'Glucose Tolerance Test',
      orderedBy: 'Dr. Priya Sharma',
      results: 'Normal - No gestational diabetes',
      status: 'Completed',
      reportUrl: '#'
    },
    {
      id: 'lab11',
      date: '2024-09-28',
      testType: 'Ultrasound - 20 week anatomy scan',
      orderedBy: 'Dr. Priya Sharma',
      results: 'Normal fetal development, no abnormalities detected',
      status: 'Completed',
      reportUrl: '#'
    }
  ]
};

export const mockSurgeries: Record<string, Surgery[]> = {
  '2': [
    {
      id: 'surg1',
      date: '2023-05-15',
      procedure: 'Coronary Angioplasty with Stent Placement',
      surgeon: 'Dr. Robert Williams',
      outcome: 'Successful - Patient recovered well',
      notes: 'Two drug-eluting stents placed in LAD. Post-op recovery uneventful.'
    }
  ],
  '4': [
    {
      id: 'surg2',
      date: '2020-08-22',
      procedure: 'Appendectomy',
      surgeon: 'Dr. Jennifer Martinez',
      outcome: 'Successful - Complete recovery',
      notes: 'Laparoscopic appendectomy performed. Patient discharged after 2 days with no complications.'
    }
  ],
  '6': [
    {
      id: 'surg3',
      date: '2021-03-10',
      procedure: 'Total Knee Replacement (Right)',
      surgeon: 'Dr. Thomas Anderson',
      outcome: 'Successful - Good mobility restored',
      notes: 'Total knee arthroplasty performed. Patient completed physical therapy program successfully.'
    }
  ]
};

export const mockVaccinations: Record<string, Vaccination[]> = {
  '1': [
    {
      id: 'vac1',
      name: 'Influenza',
      date: '2024-09-01',
      nextDue: '2025-09-01',
      administeredBy: 'Nurse Mary Johnson'
    },
    {
      id: 'vac2',
      name: 'COVID-19 Booster',
      date: '2024-03-15',
      nextDue: '2025-03-15',
      administeredBy: 'Nurse James Smith'
    }
  ],
  '2': [
    {
      id: 'vac4',
      name: 'Influenza',
      date: '2024-09-01',
      nextDue: '2025-09-01',
      administeredBy: 'Nurse Mary Johnson'
    },
    {
      id: 'vac5',
      name: 'Pneumococcal',
      date: '2023-06-15',
      administeredBy: 'Nurse Robert Chen'
    }
  ],
  '3': [
    {
      id: 'vac3',
      name: 'Tdap',
      date: '2023-12-10',
      nextDue: '2033-12-10',
      administeredBy: 'Nurse Sarah Lee'
    },
    {
      id: 'vac6',
      name: 'COVID-19 Booster',
      date: '2024-04-20',
      nextDue: '2025-04-20',
      administeredBy: 'Nurse James Smith'
    },
    {
      id: 'vac7',
      name: 'Influenza',
      date: '2024-09-05',
      nextDue: '2025-09-05',
      administeredBy: 'Nurse Mary Johnson'
    },
    {
      id: 'vac8',
      name: 'HPV (Gardasil)',
      date: '2024-01-15',
      nextDue: '2024-07-15',
      administeredBy: 'Nurse Sarah Lee'
    }
  ],
  '4': [
    {
      id: 'vac9',
      name: 'Influenza',
      date: '2024-09-01',
      nextDue: '2025-09-01',
      administeredBy: 'Nurse Mary Johnson'
    },
    {
      id: 'vac10',
      name: 'COVID-19 Booster',
      date: '2024-02-10',
      nextDue: '2025-02-10',
      administeredBy: 'Nurse James Smith'
    }
  ],
  '5': [
    {
      id: 'vac11',
      name: 'Tdap (Pregnancy)',
      date: '2024-08-15',
      administeredBy: 'Nurse Sarah Lee'
    },
    {
      id: 'vac12',
      name: 'Influenza',
      date: '2024-09-01',
      nextDue: '2025-09-01',
      administeredBy: 'Nurse Mary Johnson'
    }
  ],
  '6': [
    {
      id: 'vac13',
      name: 'Influenza',
      date: '2024-09-01',
      nextDue: '2025-09-01',
      administeredBy: 'Nurse Mary Johnson'
    },
    {
      id: 'vac14',
      name: 'Pneumococcal',
      date: '2023-11-20',
      administeredBy: 'Nurse Robert Chen'
    },
    {
      id: 'vac15',
      name: 'Shingles (Shingrix)',
      date: '2023-05-10',
      nextDue: '2023-11-10',
      administeredBy: 'Nurse Sarah Lee'
    }
  ],
  '8': [
    {
      id: 'vac16',
      name: 'COVID-19 Booster',
      date: '2024-03-25',
      nextDue: '2025-03-25',
      administeredBy: 'Nurse James Smith'
    },
    {
      id: 'vac17',
      name: 'Influenza',
      date: '2024-09-01',
      nextDue: '2025-09-01',
      administeredBy: 'Nurse Mary Johnson'
    }
  ]
};
