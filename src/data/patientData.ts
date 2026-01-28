export interface PatientToken {
  tokenNumber: string;
  patientName: string;
  doctor: string;
  room: string;
  department: string;
  status: 'waiting' | 'called' | 'in-progress' | 'completed' | 'delayed' | 'next';
}

export const patientData: PatientToken[] = [
  {
    tokenNumber: "A-101",
    patientName: "John Smith",
    doctor: "Dr. Sarah Johnson",
    room: "101",
    department: "Cardiology",
    status: "called"
  },
  {
    tokenNumber: "A-102",
    patientName: "Emily Davis",
    doctor: "Dr. Michael Chen",
    room: "205",
    department: "Orthopedics",
    status: "in-progress"
  },
  {
    tokenNumber: "A-103",
    patientName: "Robert Wilson",
    doctor: "Dr. Amanda Lee",
    room: "102",
    department: "Neurology",
    status: "next"
  },
  {
    tokenNumber: "A-104",
    patientName: "Maria Garcia",
    doctor: "Dr. James Brown",
    room: "310",
    department: "Pediatrics",
    status: "waiting"
  },
  {
    tokenNumber: "A-105",
    patientName: "David Kim",
    doctor: "Dr. Lisa Wang",
    room: "108",
    department: "Dermatology",
    status: "waiting"
  },
  {
    tokenNumber: "A-106",
    patientName: "Susan Miller",
    doctor: "Dr. Robert Taylor",
    room: "204",
    department: "Ophthalmology",
    status: "delayed"
  },
  {
    tokenNumber: "A-107",
    patientName: "James Anderson",
    doctor: "Dr. Sarah Johnson",
    room: "101",
    department: "Cardiology",
    status: "waiting"
  },
  {
    tokenNumber: "A-108",
    patientName: "Jennifer White",
    doctor: "Dr. David Park",
    room: "305",
    department: "ENT",
    status: "completed"
  },
  {
    tokenNumber: "A-109",
    patientName: "Michael Brown",
    doctor: "Dr. Emily Zhang",
    room: "203",
    department: "General Medicine",
    status: "waiting"
  },
  {
    tokenNumber: "A-110",
    patientName: "Patricia Jones",
    doctor: "Dr. Kevin Patel",
    room: "109",
    department: "Gastroenterology",
    status: "next"
  }
];

export const getStatusColor = (status: PatientToken['status']) => {
  switch (status) {
    case 'called':
      return 'text-green-400';
    case 'in-progress':
      return 'text-yellow-400';
    case 'next':
      return 'text-cyan-400';
    case 'waiting':
      return 'text-gray-300';
    case 'delayed':
      return 'text-red-400';
    case 'completed':
      return 'text-blue-400';
    default:
      return 'text-gray-300';
  }
};

export const getStatusText = (status: PatientToken['status']): string => {
  switch (status) {
    case 'called':
      return 'NOW CALLING';
    case 'in-progress':
      return 'IN PROGRESS';
    case 'next':
      return 'NEXT';
    case 'waiting':
      return 'WAITING';
    case 'delayed':
      return 'DELAYED';
    case 'completed':
      return 'COMPLETED';
  }
};
