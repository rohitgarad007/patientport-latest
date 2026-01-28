// Dummy data for Token Announcement System

// Doctor/Staff data
export const doctors = [
  {
    id: "doc-001",
    name: "Dr. Sarah Mitchell",
    department: "Internal Medicine",
    specialty: "General Medicine",
    room: "Room 101",
    avgTime: "~12 min/patient",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face",
    status: "online",
  },
  {
    id: "doc-002",
    name: "Dr. James Wilson",
    department: "Cardiology",
    specialty: "Heart Specialist",
    room: "Room 205",
    avgTime: "~15 min/patient",
    avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face",
    status: "online",
  },
  {
    id: "doc-003",
    name: "Dr. Emily Chen",
    department: "Pediatrics",
    specialty: "Child Care",
    room: "Room 102",
    avgTime: "~10 min/patient",
    avatar: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=150&h=150&fit=crop&crop=face",
    status: "busy",
  },
  {
    id: "doc-004",
    name: "Dr. Michael Roberts",
    department: "Orthopedics",
    specialty: "Bone & Joint",
    room: "Room 301",
    avgTime: "~20 min/patient",
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop&crop=face",
    status: "offline",
  },
];

// Patient queue data
export const patients = [
  {
    id: "pat-001",
    token: "A-003",
    name: "Robert Kim",
    age: 58,
    gender: "Male",
    visitType: "follow-up",
    time: "09:30 AM",
    status: "current",
  },
  {
    id: "pat-002",
    token: "A-006",
    name: "Jennifer Brown",
    age: 41,
    gender: "Female",
    visitType: "walk-in",
    time: "10:15 AM",
    status: "waiting",
  },
  {
    id: "pat-003",
    token: "A-007",
    name: "Michael Davis",
    age: 53,
    gender: "Male",
    visitType: "follow-up",
    time: "10:30 AM",
    status: "waiting",
  },
  {
    id: "pat-004",
    token: "A-008",
    name: "Sarah Johnson",
    age: 35,
    gender: "Female",
    visitType: "appointment",
    time: "10:45 AM",
    status: "waiting",
  },
  {
    id: "pat-005",
    token: "A-009",
    name: "David Lee",
    age: 62,
    gender: "Male",
    visitType: "emergency",
    time: "11:00 AM",
    status: "waiting",
  },
  {
    id: "pat-006",
    token: "B-001",
    name: "Emma Thompson",
    age: 28,
    gender: "Female",
    visitType: "walk-in",
    time: "09:45 AM",
    status: "current",
  },
  {
    id: "pat-007",
    token: "B-002",
    name: "James Wilson Jr.",
    age: 8,
    gender: "Male",
    visitType: "appointment",
    time: "10:00 AM",
    status: "waiting",
  },
];

// Screen configurations
export const screens = [
  {
    id: "scr-001",
    name: "Main Lobby Display",
    location: "Building A - Ground Floor",
    doctor: doctors[0],
    currentPatient: patients[0],
    queue: patients.filter(p => p.token.startsWith("A-") && p.status === "waiting"),
    status: "active",
    resolution: "1920x1080",
    lastUpdated: "2 min ago",
    layout: "standard",
  },
  {
    id: "scr-002",
    name: "Cardiology Wing",
    location: "Building B - 2nd Floor",
    doctor: doctors[1],
    currentPatient: patients[5],
    queue: patients.filter(p => p.token.startsWith("B-") && p.status === "waiting"),
    status: "active",
    resolution: "1920x1080",
    lastUpdated: "5 min ago",
    layout: "compact",
  },
  {
    id: "scr-003",
    name: "Pediatrics Waiting",
    location: "Building A - 1st Floor",
    doctor: doctors[2],
    currentPatient: null,
    queue: [],
    status: "idle",
    resolution: "1280x720",
    lastUpdated: "15 min ago",
    layout: "standard",
  },
  {
    id: "scr-004",
    name: "Emergency Room",
    location: "Building C - Ground Floor",
    doctor: doctors[3],
    currentPatient: null,
    queue: [],
    status: "offline",
    resolution: "1920x1080",
    lastUpdated: "2 hours ago",
    layout: "emergency",
  },
];

// Dashboard stats
export const dashboardStats = {
  totalScreens: 12,
  activeScreens: 8,
  totalPatients: 156,
  avgWaitTime: "12 min",
  todayTokens: 89,
  pendingQueue: 34,
};

// Recent activity
export const recentActivity = [
  {
    id: "act-001",
    type: "token_called",
    message: "Token A-003 called for Dr. Sarah Mitchell",
    time: "2 min ago",
    icon: "bell",
  },
  {
    id: "act-002",
    type: "screen_online",
    message: "Main Lobby Display came online",
    time: "15 min ago",
    icon: "monitor",
  },
  {
    id: "act-003",
    type: "patient_added",
    message: "New patient added to queue: A-009",
    time: "22 min ago",
    icon: "user-plus",
  },
  {
    id: "act-004",
    type: "screen_offline",
    message: "Emergency Room display went offline",
    time: "2 hours ago",
    icon: "monitor-off",
  },
  {
    id: "act-005",
    type: "settings_changed",
    message: "Screen settings updated for Cardiology Wing",
    time: "3 hours ago",
    icon: "settings",
  },
];

// User profile
export const userProfile = {
  id: "user-001",
  name: "Admin User",
  email: "admin@hospital.com",
  role: "System Administrator",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  phone: "+1 (555) 123-4567",
  department: "IT Administration",
  joinDate: "January 15, 2023",
  lastLogin: "Today at 9:30 AM",
};

// Screen layout options
export const layoutOptions = [
  {
    id: "standard",
    name: "Standard",
    description: "Doctor info, current token, and queue list",
    preview: "standard-layout",
  },
  {
    id: "compact",
    name: "Compact",
    description: "Condensed view with essential info only",
    preview: "compact-layout",
  },
  {
    id: "split",
    name: "Split Screen",
    description: "Two doctors side by side",
    preview: "split-layout",
  },
  {
    id: "emergency",
    name: "Emergency",
    description: "High visibility for urgent cases",
    preview: "emergency-layout",
  },
];

// Screen zone configurations
export const screenZones = {
  header: {
    showLogo: true,
    showDateTime: true,
    showDepartment: true,
    backgroundColor: "primary",
  },
  doctorInfo: {
    showAvatar: true,
    showSpecialty: true,
    showRoom: true,
    showAvgTime: true,
    showStatus: true,
  },
  currentToken: {
    fontSize: "extra-large",
    showPatientName: true,
    showPatientDetails: true,
    showVisitType: true,
    showTime: true,
    animation: "pulse",
  },
  queue: {
    maxVisible: 5,
    showToken: true,
    showName: true,
    showAge: true,
    showVisitType: true,
    showTime: true,
    showStatus: true,
  },
  footer: {
    showScrollingMessage: true,
    message: "Please have your documents ready. Thank you for your patience.",
    showEmergencyContact: true,
  },
};
