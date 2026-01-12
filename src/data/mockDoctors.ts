export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  avatar: string;
  availability: {
    [date: string]: {
      start: string;
      end: string;
      status: 'available' | 'busy' | 'leave';
    };
  };
}

export interface Appointment {
  id: string;
  doctorId: string;
  patientName: string;
  patientPhone: string;
  purpose: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'booked' | 'completed' | 'cancelled';
}

export const mockDoctors: Doctor[] = [
  {
    id: "D001",
    name: "Dr. Sarah Wilson",
    specialization: "Cardiologist",
    avatar: "",
    availability: {
      "2025-10-01": { start: "09:00", end: "18:00", status: "available" },
      "2025-10-02": { start: "09:00", end: "18:00", status: "available" },
      "2025-10-03": { start: "09:00", end: "13:00", status: "busy" },
    }
  },
  {
    id: "D002",
    name: "Dr. Michael Chen",
    specialization: "Orthopedic Surgeon",
    avatar: "",
    availability: {
      "2025-10-01": { start: "10:00", end: "17:00", status: "available" },
      "2025-10-02": { start: "09:00", end: "18:00", status: "available" },
      "2025-10-03": { start: "00:00", end: "00:00", status: "leave" },
    }
  },
  {
    id: "D003",
    name: "Dr. Priya Kumar",
    specialization: "Pediatrician",
    avatar: "",
    availability: {
      "2025-10-01": { start: "08:00", end: "16:00", status: "available" },
      "2025-10-02": { start: "08:00", end: "16:00", status: "available" },
      "2025-10-03": { start: "08:00", end: "16:00", status: "available" },
    }
  },
  {
    id: "D004",
    name: "Dr. James Anderson",
    specialization: "Neurologist",
    avatar: "",
    availability: {
      "2025-10-01": { start: "09:00", end: "18:00", status: "available" },
      "2025-10-02": { start: "09:00", end: "18:00", status: "available" },
      "2025-10-03": { start: "09:00", end: "18:00", status: "available" },
    }
  },
  {
    id: "D005",
    name: "Dr. Emily Roberts",
    specialization: "Dermatologist",
    avatar: "",
    availability: {
      "2025-10-01": { start: "10:00", end: "17:00", status: "available" },
      "2025-10-02": { start: "10:00", end: "17:00", status: "available" },
      "2025-10-03": { start: "10:00", end: "14:00", status: "busy" },
    }
  },
];

export const mockAppointments: Appointment[] = [
  {
    id: "A001",
    doctorId: "D001",
    patientName: "John Doe",
    patientPhone: "+1 234-567-8901",
    purpose: "Regular Checkup",
    date: "2025-10-01",
    startTime: "09:00",
    endTime: "09:30",
    status: "booked"
  },
  {
    id: "A002",
    doctorId: "D001",
    patientName: "Jane Smith",
    patientPhone: "+1 234-567-8902",
    purpose: "Heart Consultation",
    date: "2025-10-01",
    startTime: "10:00",
    endTime: "10:30",
    status: "booked"
  },
  {
    id: "A003",
    doctorId: "D001",
    patientName: "Robert Brown",
    patientPhone: "+1 234-567-8903",
    purpose: "Follow-up Visit",
    date: "2025-10-01",
    startTime: "11:30",
    endTime: "12:00",
    status: "booked"
  },
  {
    id: "A004",
    doctorId: "D002",
    patientName: "Lisa Johnson",
    patientPhone: "+1 234-567-8904",
    purpose: "Knee Pain Assessment",
    date: "2025-10-01",
    startTime: "10:30",
    endTime: "11:00",
    status: "booked"
  },
  {
    id: "A005",
    doctorId: "D002",
    patientName: "David Wilson",
    patientPhone: "+1 234-567-8905",
    purpose: "Post-Surgery Review",
    date: "2025-10-01",
    startTime: "14:00",
    endTime: "14:30",
    status: "booked"
  },
  {
    id: "A006",
    doctorId: "D003",
    patientName: "Emma Davis",
    patientPhone: "+1 234-567-8906",
    purpose: "Child Vaccination",
    date: "2025-10-01",
    startTime: "09:00",
    endTime: "09:30",
    status: "booked"
  },
  {
    id: "A007",
    doctorId: "D003",
    patientName: "Oliver Taylor",
    patientPhone: "+1 234-567-8907",
    purpose: "Fever Consultation",
    date: "2025-10-01",
    startTime: "10:30",
    endTime: "11:00",
    status: "booked"
  },
];
