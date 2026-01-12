export type UserRole = 'super_admin' | 'hospital_admin' | 'doctor' | 'staff' | 'patient';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  hospitalId?: string;
  specialization?: string;
  phone?: string;
  address?: string;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  adminId: string;
  totalPatients: number;
  totalDoctors: number;
  totalStaff: number;
}

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  emergencyContact: string;
  bloodGroup: string;
  allergies: string[];
  medicalHistory: string[];
  hospitalId: string;
}

export interface Doctor {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  experience: number;
  qualification: string;
  availability: string[];
  hospitalId: string;
  consultationFee: number;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  hospitalId: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  type: 'consultation' | 'follow-up' | 'emergency';
  notes?: string;
  symptoms?: string;
  diagnosis?: string;
  prescription?: string[];
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  diagnosis: string;
  symptoms: string;
  treatment: string;
  prescription: string[];
  followUpDate?: string;
  notes?: string;
}

export interface Invoice {
  id: string;
  patientId: string;
  hospitalId: string;
  date: string;
  items: {
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'paid' | 'pending' | 'overdue';
  dueDate: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  createdAt: string;
}