// Dummy data for hospital token announcement screens

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  room: string;
  image: string;
  avgTime: number;
  status: 'available' | 'busy' | 'break' | 'offline';
  is_online?: string | number;
  back_online_time?: string;
  away_message?: string;
}

export interface Patient {
  id: string;
  tokenNumber: string;
  name: string;
  age: number;
  gender: 'M' | 'F';
  visitType: 'new' | 'follow-up' | 'emergency' | 'consultation';
  appointmentTime: string;
  status: 'waiting' | 'current' | 'completed' | 'missed';
  priority?: 'normal' | 'urgent' | 'vip';
}

export interface Counter {
  id: string;
  name: string;
  type: 'registration' | 'billing' | 'pharmacy' | 'lab' | 'consultation';
  currentToken: string;
  staff: string;
  status: 'active' | 'closed';
}

export interface Announcement {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'emergency';
}

export const doctors: Doctor[] = [
  { id: 'd1', name: 'Dr. Sarah Mitchell', specialty: 'General Medicine', room: 'Room 101', image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face', avgTime: 12, status: 'available' },
  { id: 'd2', name: 'Dr. James Wilson', specialty: 'Cardiology', room: 'Room 205', image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face', avgTime: 20, status: 'busy' },
  { id: 'd3', name: 'Dr. Emily Chen', specialty: 'Pediatrics', room: 'Room 103', image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=150&h=150&fit=crop&crop=face', avgTime: 15, status: 'available' },
  { id: 'd4', name: 'Dr. Michael Brown', specialty: 'Orthopedics', room: 'Room 302', image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop&crop=face', avgTime: 18, status: 'available' },
  { id: 'd5', name: 'Dr. Lisa Anderson', specialty: 'Dermatology', room: 'Room 108', image: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=150&h=150&fit=crop&crop=face', avgTime: 10, status: 'break' },
  { id: 'd6', name: 'Dr. Robert Taylor', specialty: 'Neurology', room: 'Room 401', image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&h=150&fit=crop&crop=face', avgTime: 25, status: 'busy' },
];

export const patients: Patient[] = [
  { id: 'p1', tokenNumber: 'A-001', name: 'John Smith', age: 45, gender: 'M', visitType: 'new', appointmentTime: '9:00 AM', status: 'completed' },
  { id: 'p2', tokenNumber: 'A-002', name: 'Maria Garcia', age: 32, gender: 'F', visitType: 'follow-up', appointmentTime: '9:15 AM', status: 'completed' },
  { id: 'p3', tokenNumber: 'A-003', name: 'Robert Kim', age: 58, gender: 'M', visitType: 'follow-up', appointmentTime: '9:30 AM', status: 'current' },
  { id: 'p4', tokenNumber: 'A-004', name: 'Sarah Johnson', age: 28, gender: 'F', visitType: 'new', appointmentTime: '9:45 AM', status: 'waiting', priority: 'urgent' },
  { id: 'p5', tokenNumber: 'A-005', name: 'David Chen', age: 67, gender: 'M', visitType: 'consultation', appointmentTime: '10:00 AM', status: 'waiting' },
  { id: 'p6', tokenNumber: 'A-006', name: 'Emily White', age: 41, gender: 'F', visitType: 'follow-up', appointmentTime: '10:15 AM', status: 'waiting', priority: 'vip' },
  { id: 'p7', tokenNumber: 'A-007', name: 'Michael Lee', age: 53, gender: 'M', visitType: 'new', appointmentTime: '10:30 AM', status: 'waiting' },
  { id: 'p8', tokenNumber: 'A-008', name: 'Jennifer Brown', age: 35, gender: 'F', visitType: 'emergency', appointmentTime: '10:45 AM', status: 'waiting', priority: 'urgent' },
  { id: 'p9', tokenNumber: 'B-001', name: 'Thomas Anderson', age: 49, gender: 'M', visitType: 'new', appointmentTime: '9:00 AM', status: 'current' },
  { id: 'p10', tokenNumber: 'B-002', name: 'Lisa Martinez', age: 38, gender: 'F', visitType: 'follow-up', appointmentTime: '9:20 AM', status: 'waiting' },
  { id: 'p11', tokenNumber: 'C-001', name: 'William Davis', age: 62, gender: 'M', visitType: 'consultation', appointmentTime: '9:00 AM', status: 'current' },
  { id: 'p12', tokenNumber: 'C-002', name: 'Amanda Wilson', age: 29, gender: 'F', visitType: 'new', appointmentTime: '9:30 AM', status: 'waiting' },
];

export const counters: Counter[] = [
  { id: 'c1', name: 'Counter 1', type: 'registration', currentToken: 'R-045', staff: 'Nancy Drew', status: 'active' },
  { id: 'c2', name: 'Counter 2', type: 'registration', currentToken: 'R-046', staff: 'Tom Hardy', status: 'active' },
  { id: 'c3', name: 'Counter 3', type: 'billing', currentToken: 'B-023', staff: 'Jane Foster', status: 'active' },
  { id: 'c4', name: 'Counter 4', type: 'billing', currentToken: 'B-024', staff: 'Mike Ross', status: 'closed' },
  { id: 'c5', name: 'Pharmacy 1', type: 'pharmacy', currentToken: 'P-078', staff: 'Dr. Alan', status: 'active' },
  { id: 'c6', name: 'Pharmacy 2', type: 'pharmacy', currentToken: 'P-079', staff: 'Dr. Betty', status: 'active' },
  { id: 'c7', name: 'Lab Collection', type: 'lab', currentToken: 'L-034', staff: 'Mark Wilson', status: 'active' },
];

export const announcements: Announcement[] = [
  { id: 'a1', message: 'OPD Hours: 9 AM - 8 PM', type: 'info' },
  { id: 'a2', message: 'Free WiFi available for patients and visitors', type: 'info' },
  { id: 'a3', message: 'Please maintain silence in waiting areas', type: 'info' },
  { id: 'a4', message: 'Hand sanitizers available at all entrances', type: 'info' },
  { id: 'a5', message: 'Wear masks at all times inside the hospital', type: 'warning' },
  { id: 'a6', message: 'COVID-19 vaccination available at Block B', type: 'info' },
  { id: 'a7', message: 'Emergency services available 24/7', type: 'emergency' },
  { id: 'a8', message: 'Cafeteria open from 7 AM to 9 PM', type: 'info' },
];

export const hospitalStats = {
  totalPatients: 156,
  avgWaitTime: 12,
  doctorsAvailable: 18,
  appointmentsToday: 245,
  completedToday: 89,
  emergencyCases: 3,
};

export const departments = [
  { name: 'General Medicine', icon: '🏥', activeTokens: 45, waitTime: 15 },
  { name: 'Cardiology', icon: '❤️', activeTokens: 23, waitTime: 25 },
  { name: 'Pediatrics', icon: '👶', activeTokens: 34, waitTime: 12 },
  { name: 'Orthopedics', icon: '🦴', activeTokens: 28, waitTime: 20 },
  { name: 'Neurology', icon: '🧠', activeTokens: 15, waitTime: 30 },
  { name: 'Dermatology', icon: '🔬', activeTokens: 19, waitTime: 10 },
];
