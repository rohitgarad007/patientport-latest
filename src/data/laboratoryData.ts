import { Laboratory } from '@/types/laboratory';

export const masterLaboratories: Laboratory[] = [
  {
    id: 'lab-001',
    name: 'MedLife Diagnostics',
    location: '123 Health Street',
    city: 'Mumbai',
    contactNumber: '+91 22 1234 5678',
    email: 'info@medlife.com',
    type: 'Diagnostic',
    status: 'Active',
    licenseNo: 'DL-2024-001',
    accreditation: 'NABL'
  },
  {
    id: 'lab-002',
    name: 'PathCare Labs',
    location: '456 Medical Avenue',
    city: 'Delhi',
    contactNumber: '+91 11 2345 6789',
    email: 'contact@pathcare.com',
    type: 'Pathology',
    status: 'Active',
    licenseNo: 'DL-2024-002',
    accreditation: 'CAP'
  },
  {
    id: 'lab-003',
    name: 'RadiScan Imaging',
    location: '789 Scan Road',
    city: 'Bangalore',
    contactNumber: '+91 80 3456 7890',
    email: 'hello@radiscan.com',
    type: 'Imaging',
    status: 'Active',
    licenseNo: 'DL-2024-003',
    accreditation: 'NABL'
  },
  {
    id: 'lab-004',
    name: 'ClinicalFirst Labs',
    location: '321 Clinic Lane',
    city: 'Chennai',
    contactNumber: '+91 44 4567 8901',
    email: 'support@clinicalfirst.com',
    type: 'Clinical',
    status: 'Active',
    licenseNo: 'DL-2024-004',
    accreditation: 'ISO 15189'
  },
  {
    id: 'lab-005',
    name: 'BioResearch Center',
    location: '654 Research Park',
    city: 'Hyderabad',
    contactNumber: '+91 40 5678 9012',
    email: 'info@bioresearch.com',
    type: 'Research',
    status: 'Inactive',
    licenseNo: 'DL-2024-005',
    accreditation: 'GLP'
  },
  {
    id: 'lab-006',
    name: 'HealthPlus Diagnostics',
    location: '987 Wellness Blvd',
    city: 'Pune',
    contactNumber: '+91 20 6789 0123',
    email: 'care@healthplus.com',
    type: 'Diagnostic',
    status: 'Active',
    licenseNo: 'DL-2024-006',
    accreditation: 'NABL'
  },
  {
    id: 'lab-007',
    name: 'PrimePath Laboratories',
    location: '147 Prime Street',
    city: 'Kolkata',
    contactNumber: '+91 33 7890 1234',
    email: 'contact@primepath.com',
    type: 'Pathology',
    status: 'Active',
    licenseNo: 'DL-2024-007',
    accreditation: 'CAP'
  },
  {
    id: 'lab-008',
    name: 'ScanMaster Imaging',
    location: '258 Imaging Hub',
    city: 'Ahmedabad',
    contactNumber: '+91 79 8901 2345',
    email: 'info@scanmaster.com',
    type: 'Imaging',
    status: 'Active',
    licenseNo: 'DL-2024-008',
    accreditation: 'NABL'
  },
  {
    id: 'lab-009',
    name: 'CareFirst Clinical',
    location: '369 Care Avenue',
    city: 'Jaipur',
    contactNumber: '+91 141 9012 3456',
    email: 'hello@carefirst.com',
    type: 'Clinical',
    status: 'Inactive',
    licenseNo: 'DL-2024-009',
    accreditation: 'ISO 15189'
  },
  {
    id: 'lab-010',
    name: 'LabGenix Research',
    location: '741 Innovation Park',
    city: 'Lucknow',
    contactNumber: '+91 522 0123 4567',
    email: 'research@labgenix.com',
    type: 'Research',
    status: 'Active',
    licenseNo: 'DL-2024-010',
    accreditation: 'GLP'
  },
  {
    id: 'lab-011',
    name: 'AccuDiagnostics',
    location: '852 Accuracy Lane',
    city: 'Chandigarh',
    contactNumber: '+91 172 1234 5678',
    email: 'info@accudiagnostics.com',
    type: 'Diagnostic',
    status: 'Active',
    licenseNo: 'DL-2024-011',
    accreditation: 'NABL'
  },
  {
    id: 'lab-012',
    name: 'QuickPath Labs',
    location: '963 Quick Street',
    city: 'Nagpur',
    contactNumber: '+91 712 2345 6789',
    email: 'quick@quickpath.com',
    type: 'Pathology',
    status: 'Active',
    licenseNo: 'DL-2024-012',
    accreditation: 'CAP'
  }
];

export const initialPreferredLabs: Laboratory[] = [
  masterLaboratories[0],
  masterLaboratories[2],
  masterLaboratories[5],
  masterLaboratories[7]
];
