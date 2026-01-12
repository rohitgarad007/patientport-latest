export interface BedPermissionRequest {
  id: string;
  activityType: "Initial Assignment" | "Shift Bed" | "Transfer Ward" | "Mark Discharge" | "Hold Bed" | "Clean Bed";
  requestedBy: string;
  requestedByRole: string;
  requestDate: string;
  patientId: string;
  patientName: string;
  currentBed: string;
  targetBed: string;
  currentWard: string;
  targetWard: string;
  status: "pending" | "approved" | "declined" | "under-review";
  priority: "low" | "medium" | "high" | "urgent";
  justification: string;
  attachments?: string[];
  reviewedBy?: string;
  reviewedDate?: string;
  declineReason?: string;
}

export interface ApprovalStep {
  id: string;
  requestId: string;
  stepName: string;
  assignedTo: string;
  status: "pending" | "approved" | "declined" | "skipped" | "under-review";
  timestamp?: string;
  notes?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  userRole: string;
  action: string;
  description: string;
  requestId?: string;
}

export interface PatientStay {
  id: string;
  patientId: string;
  name: string;
  age: number;
  gender: string;
  admissionDate: string;
  department: string;
  currentBed: string;
  currentWard: string;
  attendingPhysician: string;
  status: "admitted" | "discharged" | "pending-transfer";
  diagnosis: string;
  condition: "stable" | "critical" | "improving" | "deteriorating";
}

export const bedPermissionRequests: BedPermissionRequest[] = [
  {
    id: "REQ-45231",
    activityType: "Transfer Ward",
    requestedBy: "Nurse Jane Smith",
    requestedByRole: "Ward Nurse",
    requestDate: "2025-10-14T09:30:00",
    patientId: "P001",
    patientName: "John Smith",
    currentBed: "Bed 12A",
    targetBed: "Bed 7C",
    currentWard: "General Ward A",
    targetWard: "ICU Ward",
    status: "pending",
    priority: "urgent",
    justification: "Patient requires intensive monitoring due to deteriorating vitals. O2 saturation dropping below 90%.",
    attachments: ["vitals_report.pdf", "physician_note.pdf"],
  },
  {
    id: "REQ-45230",
    activityType: "Initial Assignment",
    requestedBy: "Dr. Michael Chen",
    requestedByRole: "Attending Physician",
    requestDate: "2025-10-14T08:15:00",
    patientId: "P002",
    patientName: "Emma Davis",
    currentBed: "None",
    targetBed: "Bed 15B",
    currentWard: "Emergency",
    targetWard: "Maternity Ward",
    status: "approved",
    priority: "high",
    justification: "Patient admitted for scheduled C-section procedure tomorrow morning.",
    reviewedBy: "Admin Sarah Johnson",
    reviewedDate: "2025-10-14T08:45:00",
  },
  {
    id: "REQ-45229",
    activityType: "Mark Discharge",
    requestedBy: "Dr. Emily Williams",
    requestedByRole: "Attending Physician",
    requestDate: "2025-10-13T16:20:00",
    patientId: "P003",
    patientName: "Michael Brown",
    currentBed: "Bed 8D",
    targetBed: "None",
    currentWard: "General Ward A",
    targetWard: "Discharged",
    status: "approved",
    priority: "medium",
    justification: "Patient has recovered fully. All vitals stable. Cleared for discharge.",
    reviewedBy: "Head Nurse Patricia Lee",
    reviewedDate: "2025-10-13T17:00:00",
  },
  {
    id: "REQ-45228",
    activityType: "Shift Bed",
    requestedBy: "Nurse Robert Kim",
    requestedByRole: "Night Shift Nurse",
    requestDate: "2025-10-13T22:45:00",
    patientId: "P004",
    patientName: "Sarah Wilson",
    currentBed: "Bed 3A",
    targetBed: "Bed 5A",
    currentWard: "Pediatric Ward",
    targetWard: "Pediatric Ward",
    status: "declined",
    priority: "low",
    justification: "Patient requesting bed closer to window for better natural light.",
    reviewedBy: "Admin Sarah Johnson",
    reviewedDate: "2025-10-14T07:30:00",
    declineReason: "Target bed is reserved for incoming critical patient. Request can be reconsidered in 48 hours.",
  },
  {
    id: "REQ-45227",
    activityType: "Transfer Ward",
    requestedBy: "Dr. Lisa Anderson",
    requestedByRole: "ICU Specialist",
    requestDate: "2025-10-13T14:10:00",
    patientId: "P005",
    patientName: "David Martinez",
    currentBed: "Bed 2C (ICU)",
    targetBed: "Bed 9A",
    currentWard: "ICU Ward",
    targetWard: "General Ward A",
    status: "under-review",
    priority: "medium",
    justification: "Patient condition improved significantly. Ready for step-down to general ward.",
    attachments: ["recovery_assessment.pdf"],
  },
  {
    id: "REQ-45226",
    activityType: "Hold Bed",
    requestedBy: "Admin Sarah Johnson",
    requestedByRole: "Ward Administrator",
    requestDate: "2025-10-13T11:00:00",
    patientId: "N/A",
    patientName: "Reserved",
    currentBed: "Bed 1A (ICU)",
    targetBed: "Bed 1A (ICU)",
    currentWard: "ICU Ward",
    targetWard: "ICU Ward",
    status: "approved",
    priority: "high",
    justification: "Holding bed for incoming trauma patient from ER. ETA 30 minutes.",
    reviewedBy: "Dr. Robert Kim",
    reviewedDate: "2025-10-13T11:15:00",
  },
  {
    id: "REQ-45225",
    activityType: "Clean Bed",
    requestedBy: "Housekeeping Staff Maria",
    requestedByRole: "Housekeeping",
    requestDate: "2025-10-13T09:30:00",
    patientId: "N/A",
    patientName: "N/A",
    currentBed: "Bed 11C",
    targetBed: "Bed 11C",
    currentWard: "General Ward A",
    targetWard: "General Ward A",
    status: "approved",
    priority: "medium",
    justification: "Routine deep cleaning scheduled. Patient discharged yesterday.",
    reviewedBy: "Nurse Jane Smith",
    reviewedDate: "2025-10-13T09:45:00",
  },
];

export const approvalSteps: ApprovalStep[] = [
  // For REQ-45231 (Pending Transfer)
  {
    id: "STEP-001",
    requestId: "REQ-45231",
    stepName: "Nurse-in-Charge Review",
    assignedTo: "Head Nurse Patricia Lee",
    status: "approved",
    timestamp: "2025-10-14T09:45:00",
    notes: "Reviewed vitals. Transfer justified.",
  },
  {
    id: "STEP-002",
    requestId: "REQ-45231",
    stepName: "Department Head Review",
    assignedTo: "Dr. Robert Kim",
    status: "approved",
    timestamp: "2025-10-14T10:15:00",
    notes: "ICU bed available. Approved for immediate transfer.",
  },
  {
    id: "STEP-003",
    requestId: "REQ-45231",
    stepName: "Admin Approval",
    assignedTo: "Admin Sarah Johnson",
    status: "pending",
  },
  // For REQ-45230 (Approved Initial Assignment)
  {
    id: "STEP-004",
    requestId: "REQ-45230",
    stepName: "Ward Availability Check",
    assignedTo: "Admin Sarah Johnson",
    status: "approved",
    timestamp: "2025-10-14T08:30:00",
  },
  {
    id: "STEP-005",
    requestId: "REQ-45230",
    stepName: "Final Approval",
    assignedTo: "Admin Sarah Johnson",
    status: "approved",
    timestamp: "2025-10-14T08:45:00",
    notes: "Bed assigned successfully.",
  },
  // For REQ-45227 (Under Review)
  {
    id: "STEP-006",
    requestId: "REQ-45227",
    stepName: "Medical Assessment",
    assignedTo: "Dr. Lisa Anderson",
    status: "approved",
    timestamp: "2025-10-13T14:30:00",
  },
  {
    id: "STEP-007",
    requestId: "REQ-45227",
    stepName: "Bed Availability Review",
    assignedTo: "Admin Sarah Johnson",
    status: "under-review",
  },
];

export const auditLogs: AuditLog[] = [
  {
    id: "LOG-001",
    timestamp: "2025-10-14T10:15:00",
    user: "Dr. Robert Kim",
    userRole: "Department Head",
    action: "Approved",
    description: "Approved transfer request from General Ward to ICU",
    requestId: "REQ-45231",
  },
  {
    id: "LOG-002",
    timestamp: "2025-10-14T09:45:00",
    user: "Head Nurse Patricia Lee",
    userRole: "Nurse-in-Charge",
    action: "Approved",
    description: "Reviewed and approved bed transfer for critical patient",
    requestId: "REQ-45231",
  },
  {
    id: "LOG-003",
    timestamp: "2025-10-14T08:45:00",
    user: "Admin Sarah Johnson",
    userRole: "Ward Administrator",
    action: "Approved",
    description: "Initial bed assignment for maternity patient",
    requestId: "REQ-45230",
  },
  {
    id: "LOG-004",
    timestamp: "2025-10-14T07:30:00",
    user: "Admin Sarah Johnson",
    userRole: "Ward Administrator",
    action: "Declined",
    description: "Bed shift request declined - target bed reserved",
    requestId: "REQ-45228",
  },
  {
    id: "LOG-005",
    timestamp: "2025-10-13T17:00:00",
    user: "Head Nurse Patricia Lee",
    userRole: "Nurse-in-Charge",
    action: "Approved",
    description: "Patient discharge approved - all requirements met",
    requestId: "REQ-45229",
  },
  {
    id: "LOG-006",
    timestamp: "2025-10-13T11:15:00",
    user: "Dr. Robert Kim",
    userRole: "Department Head",
    action: "Approved",
    description: "Bed hold approved for incoming trauma patient",
    requestId: "REQ-45226",
  },
  {
    id: "LOG-007",
    timestamp: "2025-10-13T09:45:00",
    user: "Nurse Jane Smith",
    userRole: "Ward Nurse",
    action: "Approved",
    description: "Bed cleaning request approved - routine maintenance",
    requestId: "REQ-45225",
  },
  {
    id: "LOG-008",
    timestamp: "2025-10-13T09:30:00",
    user: "Housekeeping Staff Maria",
    userRole: "Housekeeping",
    action: "Requested",
    description: "Submitted bed cleaning request for Bed 11C",
    requestId: "REQ-45225",
  },
];

export const patientStays: PatientStay[] = [
  {
    id: "PS-001",
    patientId: "P001",
    name: "John Smith",
    age: 45,
    gender: "Male",
    admissionDate: "2025-10-10",
    department: "General",
    currentBed: "Bed 12A",
    currentWard: "General Ward A",
    attendingPhysician: "Dr. Sarah Johnson",
    status: "pending-transfer",
    diagnosis: "Pneumonia with complications",
    condition: "deteriorating",
  },
  {
    id: "PS-002",
    patientId: "P002",
    name: "Emma Davis",
    age: 32,
    gender: "Female",
    admissionDate: "2025-10-14",
    department: "Maternity",
    currentBed: "Bed 15B",
    currentWard: "Maternity Ward",
    attendingPhysician: "Dr. Michael Chen",
    status: "admitted",
    diagnosis: "Scheduled C-Section",
    condition: "stable",
  },
  {
    id: "PS-003",
    patientId: "P003",
    name: "Michael Brown",
    age: 58,
    gender: "Male",
    admissionDate: "2025-10-08",
    department: "General",
    currentBed: "None (Discharged)",
    currentWard: "N/A",
    attendingPhysician: "Dr. Emily Williams",
    status: "discharged",
    diagnosis: "Post-operative recovery",
    condition: "stable",
  },
  {
    id: "PS-004",
    patientId: "P004",
    name: "Sarah Wilson",
    age: 8,
    gender: "Female",
    admissionDate: "2025-10-12",
    department: "Pediatrics",
    currentBed: "Bed 3A",
    currentWard: "Pediatric Ward",
    attendingPhysician: "Dr. Lisa Anderson",
    status: "admitted",
    diagnosis: "Viral Infection",
    condition: "improving",
  },
  {
    id: "PS-005",
    patientId: "P005",
    name: "David Martinez",
    age: 63,
    gender: "Male",
    admissionDate: "2025-10-09",
    department: "ICU",
    currentBed: "Bed 2C (ICU)",
    currentWard: "ICU Ward",
    attendingPhysician: "Dr. Robert Kim",
    status: "pending-transfer",
    diagnosis: "Cardiac Arrest Recovery",
    condition: "improving",
  },
];
