export type Severity = 'mild' | 'moderate' | 'severe';
export type Priority = 'routine' | 'urgent';
export type ProcedureStatus = 'planned' | 'scheduled' | 'completed';

export interface Diagnosis {
  id: string;
  name: string;
  icdCode: string;
  notes: string;
  severity: Severity;
  addedAt: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  addedAt: string;
}

export interface LabTest {
  id: string;
  name: string;
  indication: string;
  priority: Priority;
  addedAt: string;
  status: string;
}

export interface Procedure {
  id: string;
  name: string;
  notes: string;
  date: string;
  status: ProcedureStatus;
  addedAt: string;
}

export interface SuggestionItem {
  name: string;
  code?: string;
  description: string;
  isAI?: boolean;
}

export interface PatientInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  gender: string;
  lastVisit: string;
  conditions: string[];
}
