// Multi-doctor screen configurations
import { doctors, patients } from "./dummyData";

export interface MultiDoctorScreen {
  id: string;
  name: string;
  location: string;
  doctors: typeof doctors;
  currentPatients: { doctor: typeof doctors[0]; patient: typeof patients[0] | null }[];
  totalQueue: number;
  status: string;
  resolution: string;
  lastUpdated: string;
  layout: string;
  screenType: "single" | "multi";
}

export const multiDoctorScreens: MultiDoctorScreen[] = [
  {
    id: "scr-001",
    name: "Main Lobby Display",
    location: "Building A - Ground Floor",
    doctors: [doctors[0]],
    currentPatients: [
      { doctor: doctors[0], patient: patients[0] }
    ],
    totalQueue: 4,
    status: "active",
    resolution: "1920x1080",
    lastUpdated: "2 min ago",
    layout: "standard",
    screenType: "single",
  },
  {
    id: "scr-002",
    name: "Multi-Specialty Wing",
    location: "Building B - 2nd Floor",
    doctors: [doctors[0], doctors[1], doctors[2]],
    currentPatients: [
      { doctor: doctors[0], patient: patients[0] },
      { doctor: doctors[1], patient: patients[5] },
      { doctor: doctors[2], patient: patients[6] }
    ],
    totalQueue: 12,
    status: "active",
    resolution: "3840x2160",
    lastUpdated: "1 min ago",
    layout: "split",
    screenType: "multi",
  },
  {
    id: "scr-003",
    name: "Pediatrics Waiting",
    location: "Building A - 1st Floor",
    doctors: [doctors[2]],
    currentPatients: [
      { doctor: doctors[2], patient: null }
    ],
    totalQueue: 0,
    status: "idle",
    resolution: "1280x720",
    lastUpdated: "15 min ago",
    layout: "standard",
    screenType: "single",
  },
  {
    id: "scr-004",
    name: "Emergency & Orthopedics",
    location: "Building C - Ground Floor",
    doctors: [doctors[3], doctors[1]],
    currentPatients: [
      { doctor: doctors[3], patient: patients[4] },
      { doctor: doctors[1], patient: patients[2] }
    ],
    totalQueue: 8,
    status: "active",
    resolution: "1920x1080",
    lastUpdated: "30 sec ago",
    layout: "split",
    screenType: "multi",
  },
  {
    id: "scr-005",
    name: "Cardiology Center",
    location: "Building B - 3rd Floor",
    doctors: [doctors[1]],
    currentPatients: [
      { doctor: doctors[1], patient: patients[5] }
    ],
    totalQueue: 3,
    status: "active",
    resolution: "1920x1080",
    lastUpdated: "5 min ago",
    layout: "standard",
    screenType: "single",
  },
  {
    id: "scr-006",
    name: "General OPD Block A",
    location: "Building A - 2nd Floor",
    doctors: [doctors[0], doctors[2], doctors[3], doctors[1]],
    currentPatients: [
      { doctor: doctors[0], patient: patients[1] },
      { doctor: doctors[2], patient: patients[3] },
      { doctor: doctors[3], patient: patients[4] },
      { doctor: doctors[1], patient: patients[2] }
    ],
    totalQueue: 18,
    status: "active",
    resolution: "3840x2160",
    lastUpdated: "Just now",
    layout: "grid",
    screenType: "multi",
  },
  {
    id: "scr-007",
    name: "Reception Display",
    location: "Main Entrance",
    doctors: [doctors[0], doctors[1]],
    currentPatients: [
      { doctor: doctors[0], patient: null },
      { doctor: doctors[1], patient: patients[5] }
    ],
    totalQueue: 5,
    status: "active",
    resolution: "1920x1080",
    lastUpdated: "3 min ago",
    layout: "split",
    screenType: "multi",
  },
  {
    id: "scr-008",
    name: "Old Building Display",
    location: "Building D - Ground Floor",
    doctors: [doctors[3]],
    currentPatients: [
      { doctor: doctors[3], patient: null }
    ],
    totalQueue: 0,
    status: "offline",
    resolution: "1280x720",
    lastUpdated: "2 hours ago",
    layout: "standard",
    screenType: "single",
  },
];
