// Dummy data for Laboratory Management Software

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  email: string;
  address: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
}

export interface Test {
  id: string;
  code: string;
  name: string;
  department: string;
  sampleType: string;
  method: string;
  tat: string;
  price: number;
  parameters: TestParameter[];
}

export interface TestParameter {
  id: string;
  name: string;
  unit: string;
  method: string;
  referenceRanges: ReferenceRange[];
  isCritical: boolean;
}

export interface ReferenceRange {
  ageGroup: string;
  gender: 'Male' | 'Female' | 'All';
  min: number;
  max: number;
  criticalMin?: number;
  criticalMax?: number;
}

export interface TestPackage {
  id: string;
  name: string;
  description: string;
  tests: string[];
  price: number;
  discount: number;
}

export interface Order {
  id: string;
  orderId: string;
  patientId: string;
  patient: Patient;
  doctorId: string;
  doctor: Doctor;
  tests: OrderTest[];
  status: OrderStatus;
  priority: 'Normal' | 'Urgent' | 'STAT';
  createdAt: string;
  collectedAt?: string;
  receivedAt?: string;
  completedAt?: string;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: 'Pending' | 'Partial' | 'Paid' | 'Refunded';
}

export interface OrderTest {
  testId: string;
  testName: string;
  status: TestStatus;
  sampleId: string;
  sampleType: string;
  results?: TestResult[];
  validatedBy?: string;
  validatedAt?: string;
}

export interface TestResult {
  parameterId: string;
  parameterName: string;
  value: number | string;
  unit: string;
  referenceRange: string;
  flag: 'Normal' | 'Low' | 'High' | 'Critical';
}

export type OrderStatus = 
  | 'Ordered'
  | 'Sample Collected'
  | 'Received in Lab'
  | 'Processing'
  | 'Validation Pending'
  | 'Approved'
  | 'Report Generated';

export type TestStatus = 
  | 'Pending'
  | 'Sample Collected'
  | 'Processing'
  | 'Results Entered'
  | 'Validated'
  | 'Rejected';

export interface Sample {
  id: string;
  sampleId: string;
  orderId: string;
  patientName: string;
  sampleType: string;
  collectedBy: string;
  collectedAt: string;
  receivedBy?: string;
  receivedAt?: string;
  status: 'Collected' | 'In Transit' | 'Received' | 'Processing' | 'Completed' | 'Rejected';
  tests: string[];
  barcode: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  patientName: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paidAmount: number;
  balance: number;
  status: 'Draft' | 'Pending' | 'Partial' | 'Paid' | 'Cancelled' | 'Refunded';
  createdAt: string;
  payments: Payment[];
}

export interface InvoiceItem {
  testId: string;
  testName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  amount: number;
}

export interface Payment {
  id: string;
  amount: number;
  mode: 'Cash' | 'Card' | 'UPI' | 'Bank Transfer' | 'Insurance';
  reference: string;
  receivedBy: string;
  receivedAt: string;
}

// Dummy Patients
export const patients: Patient[] = [
  { id: 'P001', name: 'John Smith', age: 45, gender: 'Male', phone: '+1-555-0101', email: 'john.smith@email.com', address: '123 Main St, New York' },
  { id: 'P002', name: 'Sarah Johnson', age: 32, gender: 'Female', phone: '+1-555-0102', email: 'sarah.j@email.com', address: '456 Oak Ave, Boston' },
  { id: 'P003', name: 'Michael Brown', age: 58, gender: 'Male', phone: '+1-555-0103', email: 'mbrown@email.com', address: '789 Pine Rd, Chicago' },
  { id: 'P004', name: 'Emily Davis', age: 28, gender: 'Female', phone: '+1-555-0104', email: 'emily.d@email.com', address: '321 Elm St, Seattle' },
  { id: 'P005', name: 'Robert Wilson', age: 67, gender: 'Male', phone: '+1-555-0105', email: 'rwilson@email.com', address: '654 Maple Dr, Miami' },
];

// Dummy Doctors
export const doctors: Doctor[] = [
  { id: 'D001', name: 'Dr. Amanda White', specialization: 'Internal Medicine', hospital: 'City General Hospital', phone: '+1-555-1001' },
  { id: 'D002', name: 'Dr. James Lee', specialization: 'Cardiology', hospital: 'Heart Care Center', phone: '+1-555-1002' },
  { id: 'D003', name: 'Dr. Patricia Garcia', specialization: 'Endocrinology', hospital: 'Metro Health Clinic', phone: '+1-555-1003' },
  { id: 'D004', name: 'Dr. David Chen', specialization: 'Nephrology', hospital: 'Kidney Care Institute', phone: '+1-555-1004' },
];

// Dummy Tests
export const tests: Test[] = [
  {
    id: 'T001',
    code: 'CBC',
    name: 'Complete Blood Count',
    department: 'Hematology',
    sampleType: 'EDTA Blood',
    method: 'Automated',
    tat: '4 hours',
    price: 350,
    parameters: [
      { id: 'CBC-01', name: 'Hemoglobin', unit: 'g/dL', method: 'Cyanmethemoglobin', referenceRanges: [{ ageGroup: 'Adult', gender: 'Male', min: 13.5, max: 17.5, criticalMin: 7, criticalMax: 20 }, { ageGroup: 'Adult', gender: 'Female', min: 12, max: 16, criticalMin: 7, criticalMax: 20 }], isCritical: true },
      { id: 'CBC-02', name: 'WBC Count', unit: 'cells/μL', method: 'Impedance', referenceRanges: [{ ageGroup: 'Adult', gender: 'All', min: 4000, max: 11000, criticalMin: 2000, criticalMax: 30000 }], isCritical: true },
      { id: 'CBC-03', name: 'Platelet Count', unit: 'cells/μL', method: 'Impedance', referenceRanges: [{ ageGroup: 'Adult', gender: 'All', min: 150000, max: 400000, criticalMin: 50000, criticalMax: 1000000 }], isCritical: true },
      { id: 'CBC-04', name: 'RBC Count', unit: 'million/μL', method: 'Impedance', referenceRanges: [{ ageGroup: 'Adult', gender: 'Male', min: 4.5, max: 5.5 }, { ageGroup: 'Adult', gender: 'Female', min: 4.0, max: 5.0 }], isCritical: false },
    ]
  },
  {
    id: 'T002',
    code: 'LFT',
    name: 'Liver Function Test',
    department: 'Biochemistry',
    sampleType: 'Serum',
    method: 'Spectrophotometry',
    tat: '6 hours',
    price: 650,
    parameters: [
      { id: 'LFT-01', name: 'Total Bilirubin', unit: 'mg/dL', method: 'Diazo', referenceRanges: [{ ageGroup: 'Adult', gender: 'All', min: 0.1, max: 1.2, criticalMax: 15 }], isCritical: true },
      { id: 'LFT-02', name: 'SGPT (ALT)', unit: 'U/L', method: 'Kinetic', referenceRanges: [{ ageGroup: 'Adult', gender: 'All', min: 7, max: 56 }], isCritical: false },
      { id: 'LFT-03', name: 'SGOT (AST)', unit: 'U/L', method: 'Kinetic', referenceRanges: [{ ageGroup: 'Adult', gender: 'All', min: 10, max: 40 }], isCritical: false },
      { id: 'LFT-04', name: 'Alkaline Phosphatase', unit: 'U/L', method: 'Kinetic', referenceRanges: [{ ageGroup: 'Adult', gender: 'All', min: 44, max: 147 }], isCritical: false },
    ]
  },
  {
    id: 'T003',
    code: 'KFT',
    name: 'Kidney Function Test',
    department: 'Biochemistry',
    sampleType: 'Serum',
    method: 'Spectrophotometry',
    tat: '6 hours',
    price: 550,
    parameters: [
      { id: 'KFT-01', name: 'Blood Urea', unit: 'mg/dL', method: 'Urease', referenceRanges: [{ ageGroup: 'Adult', gender: 'All', min: 15, max: 45, criticalMax: 100 }], isCritical: true },
      { id: 'KFT-02', name: 'Serum Creatinine', unit: 'mg/dL', method: 'Jaffe', referenceRanges: [{ ageGroup: 'Adult', gender: 'Male', min: 0.7, max: 1.3, criticalMax: 10 }, { ageGroup: 'Adult', gender: 'Female', min: 0.6, max: 1.1, criticalMax: 10 }], isCritical: true },
      { id: 'KFT-03', name: 'Uric Acid', unit: 'mg/dL', method: 'Enzymatic', referenceRanges: [{ ageGroup: 'Adult', gender: 'Male', min: 3.4, max: 7.0 }, { ageGroup: 'Adult', gender: 'Female', min: 2.4, max: 6.0 }], isCritical: false },
    ]
  },
  {
    id: 'T004',
    code: 'LIPID',
    name: 'Lipid Profile',
    department: 'Biochemistry',
    sampleType: 'Serum (Fasting)',
    method: 'Enzymatic',
    tat: '6 hours',
    price: 750,
    parameters: [
      { id: 'LIPID-01', name: 'Total Cholesterol', unit: 'mg/dL', method: 'Enzymatic', referenceRanges: [{ ageGroup: 'Adult', gender: 'All', min: 0, max: 200 }], isCritical: false },
      { id: 'LIPID-02', name: 'Triglycerides', unit: 'mg/dL', method: 'Enzymatic', referenceRanges: [{ ageGroup: 'Adult', gender: 'All', min: 0, max: 150, criticalMax: 500 }], isCritical: true },
      { id: 'LIPID-03', name: 'HDL Cholesterol', unit: 'mg/dL', method: 'Direct', referenceRanges: [{ ageGroup: 'Adult', gender: 'Male', min: 40, max: 200 }, { ageGroup: 'Adult', gender: 'Female', min: 50, max: 200 }], isCritical: false },
      { id: 'LIPID-04', name: 'LDL Cholesterol', unit: 'mg/dL', method: 'Calculated', referenceRanges: [{ ageGroup: 'Adult', gender: 'All', min: 0, max: 100 }], isCritical: false },
    ]
  },
  {
    id: 'T005',
    code: 'TSH',
    name: 'Thyroid Stimulating Hormone',
    department: 'Immunology',
    sampleType: 'Serum',
    method: 'ECLIA',
    tat: '8 hours',
    price: 450,
    parameters: [
      { id: 'TSH-01', name: 'TSH', unit: 'mIU/L', method: 'ECLIA', referenceRanges: [{ ageGroup: 'Adult', gender: 'All', min: 0.4, max: 4.0, criticalMin: 0.01, criticalMax: 100 }], isCritical: true },
    ]
  },
  {
    id: 'T006',
    code: 'HBA1C',
    name: 'Glycated Hemoglobin',
    department: 'Biochemistry',
    sampleType: 'EDTA Blood',
    method: 'HPLC',
    tat: '4 hours',
    price: 550,
    parameters: [
      { id: 'HBA1C-01', name: 'HbA1c', unit: '%', method: 'HPLC', referenceRanges: [{ ageGroup: 'Adult', gender: 'All', min: 4.0, max: 5.6 }], isCritical: false },
    ]
  },
];

// Dummy Test Packages
export const testPackages: TestPackage[] = [
  { id: 'PKG001', name: 'Basic Health Checkup', description: 'Essential tests for routine health screening', tests: ['T001', 'T002', 'T003'], price: 1200, discount: 20 },
  { id: 'PKG002', name: 'Cardiac Profile', description: 'Comprehensive heart health assessment', tests: ['T001', 'T004', 'T006'], price: 1400, discount: 15 },
  { id: 'PKG003', name: 'Diabetes Panel', description: 'Complete diabetes monitoring package', tests: ['T003', 'T004', 'T006'], price: 1600, discount: 18 },
  { id: 'PKG004', name: 'Complete Health Package', description: 'Full body health assessment', tests: ['T001', 'T002', 'T003', 'T004', 'T005', 'T006'], price: 2800, discount: 25 },
];

// Dummy Orders
export const orders: Order[] = [
  {
    id: 'ORD001',
    orderId: 'LAB-2024-00001',
    patientId: 'P001',
    patient: patients[0],
    doctorId: 'D001',
    doctor: doctors[0],
    tests: [
      { testId: 'T001', testName: 'Complete Blood Count', status: 'Validated', sampleId: 'SMP-001', sampleType: 'EDTA Blood', results: [
        { parameterId: 'CBC-01', parameterName: 'Hemoglobin', value: 14.5, unit: 'g/dL', referenceRange: '13.5-17.5', flag: 'Normal' },
        { parameterId: 'CBC-02', parameterName: 'WBC Count', value: 8500, unit: 'cells/μL', referenceRange: '4000-11000', flag: 'Normal' },
        { parameterId: 'CBC-03', parameterName: 'Platelet Count', value: 245000, unit: 'cells/μL', referenceRange: '150000-400000', flag: 'Normal' },
      ], validatedBy: 'Dr. Smith', validatedAt: '2024-01-15T14:30:00' },
      { testId: 'T002', testName: 'Liver Function Test', status: 'Validated', sampleId: 'SMP-002', sampleType: 'Serum', results: [
        { parameterId: 'LFT-01', parameterName: 'Total Bilirubin', value: 0.8, unit: 'mg/dL', referenceRange: '0.1-1.2', flag: 'Normal' },
        { parameterId: 'LFT-02', parameterName: 'SGPT (ALT)', value: 45, unit: 'U/L', referenceRange: '7-56', flag: 'Normal' },
      ], validatedBy: 'Dr. Smith', validatedAt: '2024-01-15T14:45:00' },
    ],
    status: 'Report Generated',
    priority: 'Normal',
    createdAt: '2024-01-15T08:00:00',
    collectedAt: '2024-01-15T09:30:00',
    receivedAt: '2024-01-15T10:00:00',
    completedAt: '2024-01-15T15:00:00',
    totalAmount: 1000,
    paidAmount: 1000,
    paymentStatus: 'Paid',
  },
  {
    id: 'ORD002',
    orderId: 'LAB-2024-00002',
    patientId: 'P002',
    patient: patients[1],
    doctorId: 'D002',
    doctor: doctors[1],
    tests: [
      { testId: 'T004', testName: 'Lipid Profile', status: 'Processing', sampleId: 'SMP-003', sampleType: 'Serum (Fasting)' },
      { testId: 'T006', testName: 'Glycated Hemoglobin', status: 'Results Entered', sampleId: 'SMP-004', sampleType: 'EDTA Blood', results: [
        { parameterId: 'HBA1C-01', parameterName: 'HbA1c', value: 7.2, unit: '%', referenceRange: '4.0-5.6', flag: 'High' },
      ] },
    ],
    status: 'Processing',
    priority: 'Urgent',
    createdAt: '2024-01-15T10:30:00',
    collectedAt: '2024-01-15T11:00:00',
    receivedAt: '2024-01-15T11:30:00',
    totalAmount: 1300,
    paidAmount: 500,
    paymentStatus: 'Partial',
  },
  {
    id: 'ORD003',
    orderId: 'LAB-2024-00003',
    patientId: 'P003',
    patient: patients[2],
    doctorId: 'D003',
    doctor: doctors[2],
    tests: [
      { testId: 'T003', testName: 'Kidney Function Test', status: 'Pending', sampleId: 'SMP-005', sampleType: 'Serum' },
      { testId: 'T005', testName: 'Thyroid Stimulating Hormone', status: 'Pending', sampleId: 'SMP-006', sampleType: 'Serum' },
    ],
    status: 'Sample Collected',
    priority: 'STAT',
    createdAt: '2024-01-15T12:00:00',
    collectedAt: '2024-01-15T12:15:00',
    totalAmount: 1000,
    paidAmount: 0,
    paymentStatus: 'Pending',
  },
  {
    id: 'ORD004',
    orderId: 'LAB-2024-00004',
    patientId: 'P004',
    patient: patients[3],
    doctorId: 'D001',
    doctor: doctors[0],
    tests: [
      { testId: 'T001', testName: 'Complete Blood Count', status: 'Results Entered', sampleId: 'SMP-007', sampleType: 'EDTA Blood', results: [
        { parameterId: 'CBC-01', parameterName: 'Hemoglobin', value: 9.5, unit: 'g/dL', referenceRange: '12.0-16.0', flag: 'Low' },
        { parameterId: 'CBC-02', parameterName: 'WBC Count', value: 15000, unit: 'cells/μL', referenceRange: '4000-11000', flag: 'High' },
        { parameterId: 'CBC-03', parameterName: 'Platelet Count', value: 45000, unit: 'cells/μL', referenceRange: '150000-400000', flag: 'Critical' },
      ] },
    ],
    status: 'Validation Pending',
    priority: 'STAT',
    createdAt: '2024-01-15T13:00:00',
    collectedAt: '2024-01-15T13:10:00',
    receivedAt: '2024-01-15T13:30:00',
    totalAmount: 350,
    paidAmount: 350,
    paymentStatus: 'Paid',
  },
  {
    id: 'ORD005',
    orderId: 'LAB-2024-00005',
    patientId: 'P005',
    patient: patients[4],
    doctorId: 'D004',
    doctor: doctors[3],
    tests: [
      { testId: 'T002', testName: 'Liver Function Test', status: 'Pending', sampleId: '', sampleType: 'Serum' },
      { testId: 'T003', testName: 'Kidney Function Test', status: 'Pending', sampleId: '', sampleType: 'Serum' },
    ],
    status: 'Ordered',
    priority: 'Normal',
    createdAt: '2024-01-15T14:00:00',
    totalAmount: 1200,
    paidAmount: 0,
    paymentStatus: 'Pending',
  },
];

// Dummy Samples
export const samples: Sample[] = [
  { id: 'S001', sampleId: 'SMP-001', orderId: 'LAB-2024-00001', patientName: 'John Smith', sampleType: 'EDTA Blood', collectedBy: 'Nurse Jane', collectedAt: '2024-01-15T09:30:00', receivedBy: 'Tech Mike', receivedAt: '2024-01-15T10:00:00', status: 'Completed', tests: ['CBC'], barcode: 'SMP001CBC20240115' },
  { id: 'S002', sampleId: 'SMP-002', orderId: 'LAB-2024-00001', patientName: 'John Smith', sampleType: 'Serum', collectedBy: 'Nurse Jane', collectedAt: '2024-01-15T09:30:00', receivedBy: 'Tech Mike', receivedAt: '2024-01-15T10:00:00', status: 'Completed', tests: ['LFT'], barcode: 'SMP002LFT20240115' },
  { id: 'S003', sampleId: 'SMP-003', orderId: 'LAB-2024-00002', patientName: 'Sarah Johnson', sampleType: 'Serum (Fasting)', collectedBy: 'Nurse Tom', collectedAt: '2024-01-15T11:00:00', receivedBy: 'Tech Sarah', receivedAt: '2024-01-15T11:30:00', status: 'Processing', tests: ['LIPID'], barcode: 'SMP003LIPID20240115' },
  { id: 'S004', sampleId: 'SMP-004', orderId: 'LAB-2024-00002', patientName: 'Sarah Johnson', sampleType: 'EDTA Blood', collectedBy: 'Nurse Tom', collectedAt: '2024-01-15T11:00:00', receivedBy: 'Tech Sarah', receivedAt: '2024-01-15T11:30:00', status: 'Processing', tests: ['HBA1C'], barcode: 'SMP004HBA1C20240115' },
  { id: 'S005', sampleId: 'SMP-005', orderId: 'LAB-2024-00003', patientName: 'Michael Brown', sampleType: 'Serum', collectedBy: 'Nurse Jane', collectedAt: '2024-01-15T12:15:00', status: 'In Transit', tests: ['KFT', 'TSH'], barcode: 'SMP005KFT20240115' },
];

// Dummy Invoices
export const invoices: Invoice[] = [
  {
    id: 'INV001',
    invoiceNumber: 'INV-2024-00001',
    orderId: 'LAB-2024-00001',
    patientName: 'John Smith',
    items: [
      { testId: 'T001', testName: 'Complete Blood Count', quantity: 1, unitPrice: 350, discount: 0, amount: 350 },
      { testId: 'T002', testName: 'Liver Function Test', quantity: 1, unitPrice: 650, discount: 0, amount: 650 },
    ],
    subtotal: 1000,
    discount: 0,
    tax: 180,
    total: 1180,
    paidAmount: 1180,
    balance: 0,
    status: 'Paid',
    createdAt: '2024-01-15T08:00:00',
    payments: [
      { id: 'PAY001', amount: 1180, mode: 'Card', reference: 'TXN123456', receivedBy: 'Reception Staff', receivedAt: '2024-01-15T08:05:00' },
    ],
  },
  {
    id: 'INV002',
    invoiceNumber: 'INV-2024-00002',
    orderId: 'LAB-2024-00002',
    patientName: 'Sarah Johnson',
    items: [
      { testId: 'T004', testName: 'Lipid Profile', quantity: 1, unitPrice: 750, discount: 50, amount: 700 },
      { testId: 'T006', testName: 'Glycated Hemoglobin', quantity: 1, unitPrice: 550, discount: 0, amount: 550 },
    ],
    subtotal: 1250,
    discount: 50,
    tax: 225,
    total: 1475,
    paidAmount: 500,
    balance: 975,
    status: 'Partial',
    createdAt: '2024-01-15T10:30:00',
    payments: [
      { id: 'PAY002', amount: 500, mode: 'Cash', reference: '', receivedBy: 'Reception Staff', receivedAt: '2024-01-15T10:35:00' },
    ],
  },
  {
    id: 'INV003',
    invoiceNumber: 'INV-2024-00003',
    orderId: 'LAB-2024-00003',
    patientName: 'Michael Brown',
    items: [
      { testId: 'T003', testName: 'Kidney Function Test', quantity: 1, unitPrice: 550, discount: 0, amount: 550 },
      { testId: 'T005', testName: 'Thyroid Stimulating Hormone', quantity: 1, unitPrice: 450, discount: 0, amount: 450 },
    ],
    subtotal: 1000,
    discount: 0,
    tax: 180,
    total: 1180,
    paidAmount: 0,
    balance: 1180,
    status: 'Pending',
    createdAt: '2024-01-15T12:00:00',
    payments: [],
  },
];

// Stats for Dashboard
export const dashboardStats = {
  todayOrders: 45,
  pendingSamples: 23,
  processingTests: 67,
  pendingValidation: 12,
  completedToday: 34,
  criticalAlerts: 3,
  revenue: {
    today: 45600,
    pending: 23400,
  },
  tat: {
    average: '4.2 hrs',
    breached: 5,
  },
};
