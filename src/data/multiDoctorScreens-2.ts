// Multi-doctor screen configurations
import { doctors, patients } from "./dummyData";

export interface MultiDoctorScreen {
  id: string;
  name: string;
  location: string;
  doctors: typeof doctors;
  currentPatients: (typeof patients[0] | null)[];
  queues: (typeof patients)[];
  totalQueue: number;
  status: string;
  resolution: string;
  lastUpdated: string;
  layout: string;
  screenType: "single" | "multi";
}

// Generate queue data for each doctor
const generateQueue = (tokenPrefix: string, count: number) => {
  const queue = [];
  for (let i = 0; i < count; i++) {
    queue.push({
      id: `pat-${tokenPrefix}-${i}`,
      token: `${tokenPrefix}-${String(i + 1).padStart(3, '0')}`,
      name: ['John Smith', 'Maria Garcia', 'David Chen', 'Sarah Johnson', 'Michael Brown', 'Emily Davis'][i % 6],
      age: 25 + (i * 7) % 40,
      gender: i % 2 === 0 ? 'Male' : 'Female',
      visitType: ['appointment', 'walk-in', 'follow-up', 'emergency'][i % 4],
      time: `${9 + Math.floor(i / 4)}:${String((i * 15) % 60).padStart(2, '0')} AM`,
      status: 'waiting',
    });
  }
  return queue;
};

export const multiDoctorScreens: MultiDoctorScreen[] = [
  {
    id: "mds-001",
    name: "Main Lobby Display",
    location: "Building A - Ground Floor",
    doctors: [doctors[0]],
    currentPatients: [patients[0]],
    queues: [generateQueue('A', 4)],
    totalQueue: 4,
    status: "active",
    resolution: "1920x1080",
    lastUpdated: "2 min ago",
    layout: "standard",
    screenType: "single",
  },
  {
    id: "mds-002",
    name: "Multi-Specialty Wing",
    location: "Building B - 2nd Floor",
    doctors: [doctors[0], doctors[1], doctors[2]],
    currentPatients: [patients[0], patients[5], patients[6]],
    queues: [generateQueue('A', 4), generateQueue('B', 5), generateQueue('C', 3)],
    totalQueue: 12,
    status: "active",
    resolution: "3840x2160",
    lastUpdated: "1 min ago",
    layout: "split",
    screenType: "multi",
  },
  {
    id: "mds-003",
    name: "Pediatrics Waiting",
    location: "Building A - 1st Floor",
    doctors: [doctors[2]],
    currentPatients: [null],
    queues: [[]],
    totalQueue: 0,
    status: "idle",
    resolution: "1280x720",
    lastUpdated: "15 min ago",
    layout: "standard",
    screenType: "single",
  },
  {
    id: "mds-004",
    name: "Emergency & Orthopedics",
    location: "Building C - Ground Floor",
    doctors: [doctors[3], doctors[1]],
    currentPatients: [patients[4], patients[2]],
    queues: [generateQueue('E', 4), generateQueue('O', 4)],
    totalQueue: 8,
    status: "active",
    resolution: "1920x1080",
    lastUpdated: "30 sec ago",
    layout: "split",
    screenType: "multi",
  },
  {
    id: "mds-005",
    name: "Cardiology Center",
    location: "Building B - 3rd Floor",
    doctors: [doctors[1]],
    currentPatients: [patients[5]],
    queues: [generateQueue('H', 3)],
    totalQueue: 3,
    status: "active",
    resolution: "1920x1080",
    lastUpdated: "5 min ago",
    layout: "standard",
    screenType: "single",
  },
  {
    id: "mds-006",
    name: "General OPD Block A",
    location: "Building A - 2nd Floor",
    doctors: [doctors[0], doctors[2], doctors[3], doctors[1]],
    currentPatients: [patients[1], patients[3], patients[4], patients[2]],
    queues: [generateQueue('G1', 5), generateQueue('G2', 4), generateQueue('G3', 5), generateQueue('G4', 4)],
    totalQueue: 18,
    status: "active",
    resolution: "3840x2160",
    lastUpdated: "Just now",
    layout: "grid",
    screenType: "multi",
  },
  {
    id: "mds-007",
    name: "Reception Display",
    location: "Main Entrance",
    doctors: [doctors[0], doctors[1]],
    currentPatients: [null, patients[5]],
    queues: [generateQueue('R1', 2), generateQueue('R2', 3)],
    totalQueue: 5,
    status: "active",
    resolution: "1920x1080",
    lastUpdated: "3 min ago",
    layout: "split",
    screenType: "multi",
  },
  {
    id: "mds-008",
    name: "Old Building Display",
    location: "Building D - Ground Floor",
    doctors: [doctors[3]],
    currentPatients: [null],
    queues: [[]],
    totalQueue: 0,
    status: "offline",
    resolution: "1280x720",
    lastUpdated: "2 hours ago",
    layout: "standard",
    screenType: "single",
  },
];
