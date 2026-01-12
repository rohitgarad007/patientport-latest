import { User, Hospital, Patient, Doctor, Appointment, MedicalRecord, Invoice, Notification, ClinicStats } from '@/types';


export const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Super Admin',
    email: 'superadmin@healthcare.com',
    role: 'super_admin',
    phone: '+1-555-0001',
  },
  {
    id: '2',
    name: 'Dr. Sarah Wilson',
    email: 'sarah.wilson@cityhospital.com',
    role: 'hospital_admin',
    hospitalId: 'h1',
    phone: '+1-555-0002',
  },
  {
    id: '3',
    name: 'Dr. Michael Chen',
    email: 'michael.chen@cityhospital.com',
    role: 'doctor',
    specialization: 'Cardiology',
    hospitalId: 'h1',
    phone: '+1-555-0003',
  },
  {
    id: '4',
    name: 'Emily Johnson',
    email: 'emily.johnson@cityhospital.com',
    role: 'staff',
    hospitalId: 'h1',
    phone: '+1-555-0004',
  },
  {
    id: '5',
    name: 'Robert Davis',
    email: 'robert.davis@email.com',
    role: 'patient',
    phone: '+1-555-0005',
  },
];

export const mockHospitals: Hospital[] = [
  {
    id: 'h1',
    name: 'City General Hospital Rohit',
    address: '123 Healthcare Ave, Medical District',
    phone: '+1-555-1000',
    email: 'info@cityhospital.com',
    adminId: '2',
    totalPatients: 1247,
    totalDoctors: 45,
    totalStaff: 120,
  },
  {
    id: 'h2',
    name: 'Metro Medical Center',
    address: '456 Wellness Blvd, Downtown',
    phone: '+1-555-2000',
    email: 'contact@metromedical.com',
    adminId: '6',
    totalPatients: 892,
    totalDoctors: 32,
    totalStaff: 95,
  },
];

export const mockPatients: Patient[] = [
  {
    id: 'p1',
    name: 'Robert Davis',
    email: 'robert.davis@email.com',
    phone: '+1-555-0005',
    dateOfBirth: '1985-06-15',
    gender: 'male',
    address: '789 Oak Street, Riverside',
    emergencyContact: '+1-555-0006',
    bloodGroup: 'O+',
    allergies: ['Penicillin', 'Peanuts'],
    medicalHistory: ['Hypertension', 'Type 2 Diabetes'],
    hospitalId: 'h1',
  },
  {
    id: 'p2',
    name: 'Lisa Thompson',
    email: 'lisa.thompson@email.com',
    phone: '+1-555-0007',
    dateOfBirth: '1990-03-22',
    gender: 'female',
    address: '321 Pine Avenue, Westside',
    emergencyContact: '+1-555-0008',
    bloodGroup: 'A-',
    allergies: ['Latex'],
    medicalHistory: ['Asthma'],
    hospitalId: 'h1',
  },
];

export const mockDoctors: Doctor[] = [
  {
    id: 'd1',
    name: 'Dr. Michael Chen',
    email: 'michael.chen@cityhospital.com',
    phone: '+1-555-0003',
    specialization: 'Cardiology',
    experience: 12,
    qualification: 'MD, FACC',
    availability: ['Monday', 'Tuesday', 'Wednesday', 'Friday'],
    hospitalId: 'h1',
    consultationFee: 200,
  },
  {
    id: 'd2',
    name: 'Dr. Amanda Rodriguez',
    email: 'amanda.rodriguez@cityhospital.com',
    phone: '+1-555-0009',
    specialization: 'Pediatrics',
    experience: 8,
    qualification: 'MD, AAP',
    availability: ['Monday', 'Wednesday', 'Thursday', 'Friday'],
    hospitalId: 'h1',
    consultationFee: 150,
  },
];

const now = new Date();
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

export const mockAppointments: Appointment[] = [
  {
    id: 'apt1',
    patientId: 'p1',
    doctorId: 'dr1',
    scheduledTime: new Date(today.getTime() + 9 * 60 * 60 * 1000), // 9 AM
    estimatedDuration: 30,
    status: 'completed',
    type: 'Check-up',
    actualStartTime: new Date(today.getTime() + 9 * 60 * 60 * 1000),
    actualEndTime: new Date(today.getTime() + 9.5 * 60 * 60 * 1000),
  },
  {
    id: 'apt2',
    patientId: 'p2',
    doctorId: 'dr1',
    scheduledTime: new Date(today.getTime() + 10 * 60 * 60 * 1000), // 10 AM
    estimatedDuration: 45,
    status: 'in-progress',
    type: 'Consultation',
    actualStartTime: new Date(today.getTime() + 10.2 * 60 * 60 * 1000),
    queuePosition: 0,
  },
  {
    id: 'apt3',
    patientId: 'p3',
    doctorId: 'dr1',
    scheduledTime: new Date(today.getTime() + 11 * 60 * 60 * 1000), // 11 AM
    estimatedDuration: 30,
    status: 'waiting',
    type: 'Follow-up',
    queuePosition: 1,
    estimatedWaitTime: 25,
  },
  {
    id: 'apt4',
    patientId: 'p4',
    doctorId: 'dr1',
    scheduledTime: new Date(today.getTime() + 11.5 * 60 * 60 * 1000), // 11:30 AM
    estimatedDuration: 30,
    status: 'checked-in',
    type: 'Check-up',
    queuePosition: 2,
    estimatedWaitTime: 55,
  },
  {
    id: 'apt5',
    patientId: 'p5',
    doctorId: 'dr2',
    scheduledTime: new Date(today.getTime() + 10.5 * 60 * 60 * 1000), // 10:30 AM
    estimatedDuration: 60,
    status: 'waiting',
    type: 'Cardiology Consultation',
    queuePosition: 1,
    estimatedWaitTime: 15,
  },
  {
    id: 'apt6',
    patientId: 'p6',
    doctorId: 'dr2',
    scheduledTime: new Date(today.getTime() + 12 * 60 * 60 * 1000), // 12 PM
    estimatedDuration: 45,
    status: 'scheduled',
    type: 'Cardiology Check-up',
    queuePosition: 2,
    estimatedWaitTime: 75,
  },
];

export const mockMedicalRecords: MedicalRecord[] = [
  {
    id: 'mr1',
    patientId: 'p1',
    doctorId: 'd1',
    date: '2024-01-10',
    diagnosis: 'Hypertension Grade 1',
    symptoms: 'High blood pressure, mild headaches',
    treatment: 'Lifestyle modifications, medication',
    prescription: ['Lisinopril 10mg', 'Amlodipine 5mg'],
    followUpDate: '2024-02-10',
    notes: 'Patient advised to monitor BP daily',
  },
];

export const mockInvoices: Invoice[] = [
  {
    id: 'inv1',
    patientId: 'p1',
    hospitalId: 'h1',
    date: '2024-01-15',
    items: [
      { description: 'Consultation Fee', quantity: 1, rate: 200, amount: 200 },
      { description: 'ECG Test', quantity: 1, rate: 75, amount: 75 },
      { description: 'Blood Test', quantity: 1, rate: 50, amount: 50 },
    ],
    subtotal: 325,
    tax: 32.5,
    total: 357.5,
    status: 'pending',
    dueDate: '2024-02-15',
  },
];

export const mockNotifications: Notification[] = [
  {
    id: 'n1',
    userId: '3',
    title: 'New Appointment Scheduled',
    message: 'You have a new appointment with Robert Davis on Jan 15, 2024',
    type: 'info',
    read: false,
    createdAt: '2024-01-14T10:30:00Z',
  },
  {
    id: 'n2',
    userId: '5',
    title: 'Appointment Reminder',
    message: 'Your appointment with Dr. Michael Chen is tomorrow at 10:00 AM',
    type: 'warning',
    read: false,
    createdAt: '2024-01-14T15:00:00Z',
  },
];

// Auth state management
export const getCurrentUser = (): User | null => {
  const userId = localStorage.getItem('currentUserId');
  return userId ? mockUsers.find(user => user.id === userId) || null : null;
};

export const setCurrentUser = (userId: string) => {
  localStorage.setItem('currentUserId', userId);
};

export const logout = () => {
  localStorage.removeItem('currentUserId');
};

export const mockClinicStats: ClinicStats = {
  totalAppointments: 12,
  patientsWaiting: 3,
  appointmentsInProgress: 1,
  completedToday: 5,
  averageWaitTime: 18,
};