export type AppointmentStatus = 'booked' | 'arrived' | 'waiting' | 'active' | 'completed' | 'draft';

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  totalTokens: number;
  bookedTokens: number;
}

export interface DoctorSchedule {
  doctorId: string;
  day: string;
  slots: TimeSlot[];
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  avatar?: string;
  availableDays: string[];
  schedules: DoctorSchedule[];
}

export interface Patient {
  id: string;
  name: string;
  phone: string;
  age: number;
}

export interface Appointment {
  id: string;
  appointment_uid?: string;
  tokenNumber: number;
  patient: Patient;
  doctor: Doctor;
  date: string;
  timeSlot: TimeSlot;
  status: AppointmentStatus;
  arrivalTime?: string;
  consultationStartTime?: string;
  completedTime?: string;
  queuePosition?: number;
}

export interface QueueRule {
  type: 'insert-after' | 'priority-threshold';
  value: number;
  description: string;
}
