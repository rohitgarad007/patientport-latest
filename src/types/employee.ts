export type EmployeeRole = 'Doctor' | 'Nurse' | 'Staff' | 'Technician' | 'Receptionist' | 'Pharmacist';

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  employeeId: string;
  currentOtp: string;
  otpGeneratedAt: string;
  otpExpiresAt: string;
  status: string;
  twoFactorAuth?: number; // 0 for off, 1 for on
}
