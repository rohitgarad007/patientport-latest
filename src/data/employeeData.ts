import { Employee } from '@/types/employee';

const generateOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const today = new Date().toISOString().split('T')[0];
const expiry = new Date();
expiry.setHours(23, 59, 59, 999);

export const initialEmployees: Employee[] = [
  {
    id: 'emp-001',
    name: 'Dr. Rajesh Kumar',
    email: 'rajesh.kumar@hospital.com',
    phone: '+91 98765 43210',
    role: 'Doctor',
    department: 'Cardiology',
    employeeId: 'DOC-2024-001',
    currentOtp: generateOtp(),
    otpGeneratedAt: `${today}T08:00:00`,
    otpExpiresAt: expiry.toISOString(),
    status: 'Active'
  },
  {
    id: 'emp-002',
    name: 'Dr. Priya Sharma',
    email: 'priya.sharma@hospital.com',
    phone: '+91 98765 43211',
    role: 'Doctor',
    department: 'Neurology',
    employeeId: 'DOC-2024-002',
    currentOtp: generateOtp(),
    otpGeneratedAt: `${today}T08:00:00`,
    otpExpiresAt: expiry.toISOString(),
    status: 'Active'
  },
  {
    id: 'emp-003',
    name: 'Nurse Anita Desai',
    email: 'anita.desai@hospital.com',
    phone: '+91 98765 43212',
    role: 'Nurse',
    department: 'ICU',
    employeeId: 'NRS-2024-001',
    currentOtp: generateOtp(),
    otpGeneratedAt: `${today}T08:00:00`,
    otpExpiresAt: expiry.toISOString(),
    status: 'Active'
  },
  {
    id: 'emp-004',
    name: 'Nurse Kavitha Nair',
    email: 'kavitha.nair@hospital.com',
    phone: '+91 98765 43213',
    role: 'Nurse',
    department: 'Emergency',
    employeeId: 'NRS-2024-002',
    currentOtp: generateOtp(),
    otpGeneratedAt: `${today}T08:00:00`,
    otpExpiresAt: expiry.toISOString(),
    status: 'Active'
  },
  {
    id: 'emp-005',
    name: 'Rahul Verma',
    email: 'rahul.verma@hospital.com',
    phone: '+91 98765 43214',
    role: 'Technician',
    department: 'Radiology',
    employeeId: 'TEC-2024-001',
    currentOtp: generateOtp(),
    otpGeneratedAt: `${today}T08:00:00`,
    otpExpiresAt: expiry.toISOString(),
    status: 'Active'
  },
  {
    id: 'emp-006',
    name: 'Sunita Patel',
    email: 'sunita.patel@hospital.com',
    phone: '+91 98765 43215',
    role: 'Receptionist',
    department: 'Front Desk',
    employeeId: 'REC-2024-001',
    currentOtp: generateOtp(),
    otpGeneratedAt: `${today}T08:00:00`,
    otpExpiresAt: expiry.toISOString(),
    status: 'Active'
  },
  {
    id: 'emp-007',
    name: 'Dr. Amit Singh',
    email: 'amit.singh@hospital.com',
    phone: '+91 98765 43216',
    role: 'Doctor',
    department: 'Orthopedics',
    employeeId: 'DOC-2024-003',
    currentOtp: generateOtp(),
    otpGeneratedAt: `${today}T08:00:00`,
    otpExpiresAt: expiry.toISOString(),
    status: 'Inactive'
  },
  {
    id: 'emp-008',
    name: 'Meena Gupta',
    email: 'meena.gupta@hospital.com',
    phone: '+91 98765 43217',
    role: 'Pharmacist',
    department: 'Pharmacy',
    employeeId: 'PHR-2024-001',
    currentOtp: generateOtp(),
    otpGeneratedAt: `${today}T08:00:00`,
    otpExpiresAt: expiry.toISOString(),
    status: 'Active'
  },
  {
    id: 'emp-009',
    name: 'Vikram Reddy',
    email: 'vikram.reddy@hospital.com',
    phone: '+91 98765 43218',
    role: 'Staff',
    department: 'Housekeeping',
    employeeId: 'STF-2024-001',
    currentOtp: generateOtp(),
    otpGeneratedAt: `${today}T08:00:00`,
    otpExpiresAt: expiry.toISOString(),
    status: 'Active'
  },
  {
    id: 'emp-010',
    name: 'Dr. Lakshmi Iyer',
    email: 'lakshmi.iyer@hospital.com',
    phone: '+91 98765 43219',
    role: 'Doctor',
    department: 'Pediatrics',
    employeeId: 'DOC-2024-004',
    currentOtp: generateOtp(),
    otpGeneratedAt: `${today}T08:00:00`,
    otpExpiresAt: expiry.toISOString(),
    status: 'Active'
  },
  {
    id: 'emp-011',
    name: 'Nurse Deepa Menon',
    email: 'deepa.menon@hospital.com',
    phone: '+91 98765 43220',
    role: 'Nurse',
    department: 'Operation Theater',
    employeeId: 'NRS-2024-003',
    currentOtp: generateOtp(),
    otpGeneratedAt: `${today}T08:00:00`,
    otpExpiresAt: expiry.toISOString(),
    status: 'Active'
  },
  {
    id: 'emp-012',
    name: 'Arjun Das',
    email: 'arjun.das@hospital.com',
    phone: '+91 98765 43221',
    role: 'Technician',
    department: 'Laboratory',
    employeeId: 'TEC-2024-002',
    currentOtp: generateOtp(),
    otpGeneratedAt: `${today}T08:00:00`,
    otpExpiresAt: expiry.toISOString(),
    status: 'Active'
  }
];

export const generateNewOtp = (): { otp: string; generatedAt: string; expiresAt: string } => {
  const now = new Date();
  const expiry = new Date();
  expiry.setHours(23, 59, 59, 999);
  
  return {
    otp: generateOtp(),
    generatedAt: now.toISOString(),
    expiresAt: expiry.toISOString()
  };
};
