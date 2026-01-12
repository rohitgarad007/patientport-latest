import { Doctor, Appointment, Patient } from '@/types/appointment';

// Appointment-specific mock data (renamed to avoid conflicts)
export const aptMockDoctors: Doctor[] = [
  {
    id: 'doc1',
    name: 'Dr. Sarah Chen',
    specialty: 'Cardiology',
    availableDays: ['Monday', 'Wednesday', 'Friday'],
    schedules: [
      {
        doctorId: 'doc1',
        day: 'Monday',
        slots: [
          { id: 'slot1', startTime: '09:00', endTime: '12:00', totalTokens: 15, bookedTokens: 8 },
          { id: 'slot2', startTime: '14:00', endTime: '17:00', totalTokens: 15, bookedTokens: 12 },
        ],
      },
      {
        doctorId: 'doc1',
        day: 'Wednesday',
        slots: [
          { id: 'slot3', startTime: '09:00', endTime: '12:00', totalTokens: 15, bookedTokens: 5 },
          { id: 'slot4', startTime: '14:00', endTime: '17:00', totalTokens: 15, bookedTokens: 9 },
        ],
      },
      {
        doctorId: 'doc1',
        day: 'Friday',
        slots: [
          { id: 'slot5', startTime: '09:00', endTime: '13:00', totalTokens: 20, bookedTokens: 15 },
        ],
      },
    ],
  },
  {
    id: 'doc2',
    name: 'Dr. Michael Brown',
    specialty: 'Orthopedics',
    availableDays: ['Tuesday', 'Thursday', 'Saturday'],
    schedules: [
      {
        doctorId: 'doc2',
        day: 'Tuesday',
        slots: [
          { id: 'slot6', startTime: '10:00', endTime: '13:00', totalTokens: 12, bookedTokens: 7 },
          { id: 'slot7', startTime: '15:00', endTime: '18:00', totalTokens: 12, bookedTokens: 10 },
        ],
      },
      {
        doctorId: 'doc2',
        day: 'Thursday',
        slots: [
          { id: 'slot8', startTime: '10:00', endTime: '13:00', totalTokens: 12, bookedTokens: 6 },
          { id: 'slot9', startTime: '15:00', endTime: '18:00', totalTokens: 12, bookedTokens: 8 },
        ],
      },
      {
        doctorId: 'doc2',
        day: 'Saturday',
        slots: [
          { id: 'slot10', startTime: '09:00', endTime: '12:00', totalTokens: 10, bookedTokens: 9 },
        ],
      },
    ],
  },
  {
    id: 'doc3',
    name: 'Dr. Emily Rodriguez',
    specialty: 'Pediatrics',
    availableDays: ['Monday', 'Tuesday', 'Thursday'],
    schedules: [
      {
        doctorId: 'doc3',
        day: 'Monday',
        slots: [
          { id: 'slot11', startTime: '08:00', endTime: '12:00', totalTokens: 20, bookedTokens: 14 },
          { id: 'slot12', startTime: '13:00', endTime: '16:00', totalTokens: 15, bookedTokens: 11 },
        ],
      },
      {
        doctorId: 'doc3',
        day: 'Tuesday',
        slots: [
          { id: 'slot13', startTime: '08:00', endTime: '12:00', totalTokens: 20, bookedTokens: 16 },
        ],
      },
      {
        doctorId: 'doc3',
        day: 'Thursday',
        slots: [
          { id: 'slot14', startTime: '08:00', endTime: '12:00', totalTokens: 20, bookedTokens: 12 },
          { id: 'slot15', startTime: '14:00', endTime: '17:00', totalTokens: 15, bookedTokens: 8 },
        ],
      },
    ],
  },
];

export const aptMockPatients: Patient[] = [
  { id: 'pat1', name: 'John Smith', phone: '555-0101', age: 45 },
  { id: 'pat2', name: 'Emma Wilson', phone: '555-0102', age: 32 },
  { id: 'pat3', name: 'Robert Johnson', phone: '555-0103', age: 58 },
  { id: 'pat4', name: 'Maria Garcia', phone: '555-0104', age: 41 },
  { id: 'pat5', name: 'David Lee', phone: '555-0105', age: 29 },
  { id: 'pat6', name: 'Lisa Anderson', phone: '555-0106', age: 52 },
  { id: 'pat7', name: 'James Taylor', phone: '555-0107', age: 37 },
  { id: 'pat8', name: 'Patricia Martinez', phone: '555-0108', age: 64 },
];

export const aptMockAppointments: Appointment[] = [
  {
    id: 'apt1',
    tokenNumber: 1,
    patient: aptMockPatients[0],
    doctor: aptMockDoctors[0],
    date: '2025-01-20',
    timeSlot: aptMockDoctors[0].schedules[0].slots[0],
    status: 'in-consultation',
    arrivalTime: '08:55',
    consultationStartTime: '09:05',
    queuePosition: 0,
  },
  {
    id: 'apt2',
    tokenNumber: 2,
    patient: aptMockPatients[1],
    doctor: aptMockDoctors[0],
    date: '2025-01-20',
    timeSlot: aptMockDoctors[0].schedules[0].slots[0],
    status: 'arrived',
    arrivalTime: '09:10',
    queuePosition: 1,
  },
  {
    id: 'apt3',
    tokenNumber: 5,
    patient: aptMockPatients[2],
    doctor: aptMockDoctors[0],
    date: '2025-01-20',
    timeSlot: aptMockDoctors[0].schedules[0].slots[0],
    status: 'arrived',
    arrivalTime: '09:15',
    queuePosition: 2,
  },
  {
    id: 'apt4',
    tokenNumber: 3,
    patient: aptMockPatients[3],
    doctor: aptMockDoctors[0],
    date: '2025-01-20',
    timeSlot: aptMockDoctors[0].schedules[0].slots[0],
    status: 'arrived',
    arrivalTime: '09:20',
    queuePosition: 3,
  },
  {
    id: 'apt5',
    tokenNumber: 4,
    patient: aptMockPatients[4],
    doctor: aptMockDoctors[0],
    date: '2025-01-20',
    timeSlot: aptMockDoctors[0].schedules[0].slots[0],
    status: 'booked',
  },
  {
    id: 'apt6',
    tokenNumber: 6,
    patient: aptMockPatients[5],
    doctor: aptMockDoctors[0],
    date: '2025-01-20',
    timeSlot: aptMockDoctors[0].schedules[0].slots[0],
    status: 'booked',
  },
  {
    id: 'apt7',
    tokenNumber: 7,
    patient: aptMockPatients[6],
    doctor: aptMockDoctors[0],
    date: '2025-01-20',
    timeSlot: aptMockDoctors[0].schedules[0].slots[0],
    status: 'booked',
  },
  {
    id: 'apt8',
    tokenNumber: 8,
    patient: aptMockPatients[7],
    doctor: aptMockDoctors[0],
    date: '2025-01-20',
    timeSlot: aptMockDoctors[0].schedules[0].slots[0],
    status: 'completed',
    arrivalTime: '08:50',
    consultationStartTime: '09:00',
    completedTime: '09:15',
  },
];

// Re-export broader mock data and auth helpers from general dataset
export {
  mockUsers,
  mockHospitals,
  mockPatients,
  mockDoctors,
  mockAppointments,
  mockMedicalRecords,
  mockInvoices,
  mockNotifications,
  getCurrentUser,
  setCurrentUser,
  logout,
  mockClinicStats,
} from './2mockData';
