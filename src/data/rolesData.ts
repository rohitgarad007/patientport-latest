import { Role, Permission, Staff, AuditLog, EmergencyAccess } from '@/types/roles';

export const mockPermissions: Permission[] = [
  // Patient Information Access
  { id: 'view_patient_demographics', name: 'View Patient Demographics', description: 'View basic patient information', category: 'patient-info', level: 'view' },
  { id: 'edit_patient_records', name: 'Edit Patient Records', description: 'Modify patient information', category: 'patient-info', level: 'edit', isHighRisk: true },
  { id: 'view_medical_history', name: 'View Medical History', description: 'Access patient medical history', category: 'patient-info', level: 'view' },
  { id: 'export_patient_data', name: 'Export Patient Data', description: 'Export patient records', category: 'patient-info', level: 'admin', isHighRisk: true },
  { id: 'anonymize_data', name: 'Anonymize Patient Data', description: 'Remove identifying information', category: 'patient-info', level: 'admin' },

  // Medical Operations
  { id: 'write_prescriptions', name: 'Write Prescriptions', description: 'Create medication prescriptions', category: 'medical-ops', level: 'full', isHighRisk: true },
  { id: 'view_lab_results', name: 'View Lab Results', description: 'Access laboratory test results', category: 'medical-ops', level: 'view' },
  { id: 'request_lab_tests', name: 'Request Lab Tests', description: 'Order diagnostic tests', category: 'medical-ops', level: 'edit' },
  { id: 'approve_test_results', name: 'Approve Test Results', description: 'Validate and approve test results', category: 'medical-ops', level: 'full' },
  { id: 'manage_vitals', name: 'Manage Patient Vitals', description: 'Record and update vital signs', category: 'medical-ops', level: 'edit' },
  { id: 'schedule_surgeries', name: 'Schedule Surgeries', description: 'Plan and schedule surgical procedures', category: 'medical-ops', level: 'full' },

  // Appointments & Scheduling
  { id: 'book_appointments', name: 'Book Appointments', description: 'Create new patient appointments', category: 'appointments', level: 'edit' },
  { id: 'reschedule_appointments', name: 'Reschedule Appointments', description: 'Modify existing appointments', category: 'appointments', level: 'edit' },
  { id: 'cancel_appointments', name: 'Cancel Appointments', description: 'Cancel patient appointments', category: 'appointments', level: 'edit' },
  { id: 'manage_doctor_schedule', name: 'Manage Doctor Schedule', description: 'Control physician availability', category: 'appointments', level: 'full' },

  // Facility Management
  { id: 'assign_rooms', name: 'Assign Patient Rooms', description: 'Allocate rooms to patients', category: 'facility', level: 'edit' },
  { id: 'view_ward_occupancy', name: 'View Ward Occupancy', description: 'Monitor bed availability', category: 'facility', level: 'view' },
  { id: 'icu_access', name: 'ICU Access Rights', description: 'Access intensive care units', category: 'facility', level: 'full' },
  { id: 'emergency_access', name: 'Emergency Department Access', description: 'Access emergency facilities', category: 'facility', level: 'full' },

  // Billing & Finance
  { id: 'view_billing', name: 'View Billing Information', description: 'Access patient billing data', category: 'billing', level: 'view' },
  { id: 'process_payments', name: 'Process Payments', description: 'Handle payment transactions', category: 'billing', level: 'edit' },
  { id: 'apply_discounts', name: 'Apply Discounts', description: 'Provide billing discounts', category: 'billing', level: 'full' },
  { id: 'insurance_claims', name: 'Manage Insurance Claims', description: 'Process insurance submissions', category: 'billing', level: 'edit' },
  { id: 'financial_reports', name: 'View Financial Reports', description: 'Access financial analytics', category: 'billing', level: 'admin' },

  // Pharmacy Management
  { id: 'view_inventory', name: 'View Medicine Inventory', description: 'Check medication stock levels', category: 'pharmacy', level: 'view' },
  { id: 'dispense_medication', name: 'Dispense Medication', description: 'Provide medications to patients', category: 'pharmacy', level: 'edit' },
  { id: 'controlled_substances', name: 'Manage Controlled Substances', description: 'Handle restricted medications', category: 'pharmacy', level: 'full', isHighRisk: true },
  { id: 'reorder_stock', name: 'Reorder Stock', description: 'Purchase new inventory', category: 'pharmacy', level: 'admin' },

  // Laboratory & Diagnostics
  { id: 'perform_tests', name: 'Perform Laboratory Tests', description: 'Conduct diagnostic procedures', category: 'laboratory', level: 'edit' },
  { id: 'lab_equipment', name: 'Manage Lab Equipment', description: 'Operate laboratory machinery', category: 'laboratory', level: 'full' },
  { id: 'lab_safety', name: 'Lab Safety Management', description: 'Maintain safety protocols', category: 'laboratory', level: 'admin' },

  // System Administration
  { id: 'manage_users', name: 'Manage User Accounts', description: 'Create and modify user accounts', category: 'system-admin', level: 'admin', isHighRisk: true },
  { id: 'assign_roles', name: 'Assign Roles', description: 'Grant and revoke user roles', category: 'system-admin', level: 'admin', isHighRisk: true },
  { id: 'system_monitoring', name: 'System Monitoring', description: 'Monitor system performance', category: 'system-admin', level: 'admin' },
  { id: 'emergency_override', name: 'Emergency Override Access', description: 'Break-glass emergency access', category: 'system-admin', level: 'admin', isHighRisk: true },

  // HR & Staff Management
  { id: 'view_staff_profiles', name: 'View Staff Profiles', description: 'Access employee information', category: 'hr', level: 'view' },
  { id: 'manage_shifts', name: 'Manage Shifts', description: 'Schedule staff assignments', category: 'hr', level: 'edit' },
  { id: 'performance_reviews', name: 'Performance Reviews', description: 'Conduct staff evaluations', category: 'hr', level: 'full' },
  { id: 'payroll_access', name: 'Payroll Access', description: 'View salary information', category: 'hr', level: 'admin', isHighRisk: true },
];

export const mockRoles: Role[] = [
  {
    id: 'doctor_gp',
    name: 'Patient Information Access',
    description: 'View and modify patient information, and access patient medical history.',
    department: 'Medical',
    permissions: [
      'View Patient Demographics', 'Edit Patient Records', 'View Medical History'
    ],
    requiresMFA: true,
    maxSessionDuration: 480,
    color: 'hsl(220, 70%, 50%)'
  },
  {
    id: 'doctor_specialist',
    name: 'Medical Operations',
    description: 'Create medication prescriptions, access laboratory test results, order diagnostic tests, and record or update vital signs',
    department: 'Medical',
    permissions: [
      'Write Prescriptions', 'View Lab Results', 'Request Lab Tests',
      'Manage Patient Vitals'
    ],
    requiresMFA: true,
    maxSessionDuration: 480,
    color: 'hsl(260, 70%, 50%)'
  },
  {
    id: 'nurse_ward',
    name: 'Appointments & Scheduling',
    description: 'Create, modify, and cancel patient appointments',
    department: 'Appointments',
    permissions: [
      'Book Appointments', 'Reschedule Appointments', 'Cancel Appointments'  
    ],
    maxSessionDuration: 720,
    color: 'hsl(160, 70%, 45%)'
  },
  {
    id: 'nurse_icu',
    name: 'Ward & Facility Access',
    description: 'Access intensive care units and emergency facilities, allocate rooms to patients, and monitor bed availability',
    department: 'Nursing',
    permissions: [
      'ICU Access Rights', 'Assign Patient Rooms', 'View Ward Occupancy',
      'Emergency Department Access'
    ],
    requiresMFA: true,
    maxSessionDuration: 720,
    color: 'hsl(180, 70%, 45%)'
  },
  {
    id: 'pharmacist',
    name: 'Pharmacy Management',
    description: 'Check medication stock levels, provide medications to patients, handle restricted medications, and purchase new inventory',
    department: 'Pharmacy',
    permissions: [
      'View Medicine Inventory', 'Dispense Medication', 'Manage Controlled Substances',
      'Reorder Stock'
    ],
    requiresMFA: true,
    maxSessionDuration: 480,
    color: 'hsl(280, 70%, 50%)'
  },
  {
    id: 'lab_technician',
    name: 'Laboratory & Diagnostics',
    description: 'Conduct diagnostic procedures, operate laboratory machinery, and maintain safety protocols.',
    department: 'Laboratory',
    permissions: [
      'Perform Laboratory Tests', 'Manage Lab Equipment', 'Lab Safety Management'  
    ],
    maxSessionDuration: 480,
    color: 'hsl(40, 70%, 50%)'
  },
  {
    id: 'receptionist',
    name: 'Billing & Finance',
    description: 'Access patient billing data, handle payment transactions, provide billing discounts, process insurance submissions, and access financial analytics',
    department: 'Administration',
    permissions: [
      'View Billing Information', 'Process Payments', 'Apply Discounts',
      'Manage Insurance Claims', 'View Financial Reports'
    ],
    maxSessionDuration: 480,
    color: 'hsl(200, 50%, 50%)'
  },
  {
    id: 'billing_staff',
    name: 'IT & System Access',
    description: 'Create and modify user accounts, grant and revoke user roles, monitor system performance, and enable break-glass emergency access',
    department: 'Finance',
    permissions: [
      'Manage User Accounts', 'Assign Roles', 'System Monitoring', 'Emergency Override Access',
      'financial_reports'
    ],
    requiresMFA: true,
    maxSessionDuration: 480,
    color: 'hsl(120, 50%, 45%)'
  },
  {
    id: 'it_admin',
    name: 'HR & Staff Management',
    description: 'Access employee information, schedule staff assignments, and conduct staff evaluations.',
    department: 'IT',
    permissions: [
      'View Staff Profiles', 'Manage Shifts', 'Performance Reviews'
    ],
    requiresMFA: true,
    maxSessionDuration: 240,
    color: 'hsl(0, 70%, 50%)'
  },
  
];

export const mockStaff: Staff[] = [
  {
    id: 'staff_001',
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@hospital.com',
    roles: ['doctor_gp'],
    department: 'Medical',
    isActive: true,
    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    id: 'staff_002',
    name: 'Dr. Michael Chen',
    email: 'michael.chen@hospital.com',
    roles: ['doctor_specialist'],
    department: 'Cardiology',
    isActive: true,
    lastLogin: new Date(Date.now() - 1 * 60 * 60 * 1000)
  },
  {
    id: 'staff_003',
    name: 'Nurse Emma Wilson',
    email: 'emma.wilson@hospital.com',
    roles: ['nurse_ward'],
    department: 'Nursing',
    isActive: true,
    lastLogin: new Date(Date.now() - 30 * 60 * 1000)
  },
  {
    id: 'staff_004',
    name: 'Nurse Robert Brown',
    email: 'robert.brown@hospital.com',
    roles: ['nurse_icu'],
    department: 'ICU',
    isActive: true,
    lastLogin: new Date(Date.now() - 15 * 60 * 1000)
  },
  {
    id: 'staff_005',
    name: 'Lisa Thompson',
    email: 'lisa.thompson@hospital.com',
    roles: ['pharmacist'],
    department: 'Pharmacy',
    isActive: true,
    lastLogin: new Date(Date.now() - 45 * 60 * 1000)
  },
  {
    id: 'staff_006',
    name: 'Jennifer Davis',
    email: 'jennifer.davis@hospital.com',
    roles: ['receptionist'],
    department: 'Front Desk',
    isActive: true,
    lastLogin: new Date(Date.now() - 20 * 60 * 1000)
  },
  {
    id: 'staff_007',
    name: 'David Wilson',
    email: 'david.wilson@hospital.com',
    roles: ['it_admin'],
    department: 'IT',
    isActive: true,
    lastLogin: new Date(Date.now() - 10 * 60 * 1000)
  },
  {
    id: 'staff_008',
    name: 'Maria Garcia',
    email: 'maria.garcia@hospital.com',
    roles: ['billing_staff'],
    department: 'Finance',
    isActive: true,
    lastLogin: new Date(Date.now() - 3 * 60 * 60 * 1000)
  }
];

export const mockAuditLogs: AuditLog[] = [
  {
    id: 'log_001',
    staffId: 'staff_001',
    staffName: 'Dr. Sarah Johnson',
    action: 'data_access',
    target: 'Patient John Smith',
    details: 'Viewed medical history',
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    ipAddress: '192.168.1.45',
    riskLevel: 'low'
  },
  {
    id: 'log_002',
    staffId: 'staff_007',
    staffName: 'David Wilson',
    action: 'role_change',
    target: 'staff_003',
    details: 'Assigned ICU access to Nurse Emma Wilson',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    ipAddress: '192.168.1.10',
    riskLevel: 'high'
  },
  {
    id: 'log_003',
    staffId: 'staff_004',
    staffName: 'Nurse Robert Brown',
    action: 'emergency_access',
    target: 'Emergency Override',
    details: 'Used break-glass access for critical patient',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    ipAddress: '192.168.1.67',
    riskLevel: 'critical'
  },
  {
    id: 'log_004',
    staffId: 'staff_005',
    staffName: 'Lisa Thompson',
    action: 'permission_used',
    target: 'Controlled Substances',
    details: 'Dispensed morphine for post-op patient',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    ipAddress: '192.168.1.89',
    riskLevel: 'medium'
  }
];

export const mockEmergencyRequests: EmergencyAccess[] = [
  {
    id: 'emg_001',
    staffId: 'staff_003',
    staffName: 'Nurse Emma Wilson',
    requestedRole: 'doctor_gp',
    reason: 'Critical patient needs immediate prescription - doctor unavailable',
    requestedAt: new Date(Date.now() - 30 * 60 * 1000),
    status: 'pending'
  },
  {
    id: 'emg_002',
    staffId: 'staff_006',
    staffName: 'Jennifer Davis',
    requestedRole: 'billing_staff',
    reason: 'Emergency payment processing for ambulance service',
    requestedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: 'approved',
    approvedBy: 'staff_007',
    approvedAt: new Date(Date.now() - 90 * 60 * 1000),
    expiresAt: new Date(Date.now() + 30 * 60 * 1000)
  }
];