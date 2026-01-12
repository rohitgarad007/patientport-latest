export interface Room {
  id: string;
  wardId: string;
  roomNumber: string;
  roomType: "General" | "Private" | "Semi-Private";
  floorNo: number;
  bedCount: number;
  amenities: string[];
  status: "Available" | "Occupied" | "Cleaning" | "Maintenance";
  createdAt: string;
}

export const rooms: Room[] = [
  // General Ward A rooms
  {
    id: "R001",
    wardId: "W001",
    roomNumber: "101",
    roomType: "General",
    floorNo: 1,
    bedCount: 8,
    amenities: ["WiFi", "AC"],
    status: "Occupied",
    createdAt: "2024-01-10",
  },
  {
    id: "R002",
    wardId: "W001",
    roomNumber: "102",
    roomType: "General",
    floorNo: 1,
    bedCount: 8,
    amenities: ["WiFi", "AC"],
    status: "Available",
    createdAt: "2024-01-10",
  },
  {
    id: "R003",
    wardId: "W001",
    roomNumber: "103",
    roomType: "Semi-Private",
    floorNo: 1,
    bedCount: 4,
    amenities: ["TV", "WiFi", "AC", "Bathroom"],
    status: "Occupied",
    createdAt: "2024-01-10",
  },
  // Pediatric Ward rooms
  {
    id: "R004",
    wardId: "W002",
    roomNumber: "201",
    roomType: "General",
    floorNo: 2,
    bedCount: 6,
    amenities: ["TV", "WiFi", "AC"],
    status: "Occupied",
    createdAt: "2024-01-15",
  },
  {
    id: "R005",
    wardId: "W002",
    roomNumber: "202",
    roomType: "Private",
    floorNo: 2,
    bedCount: 1,
    amenities: ["TV", "WiFi", "AC", "Bathroom", "Refrigerator"],
    status: "Available",
    createdAt: "2024-01-15",
  },
  // ICU Ward rooms
  {
    id: "R006",
    wardId: "W003",
    roomNumber: "301",
    roomType: "Private",
    floorNo: 3,
    bedCount: 1,
    amenities: ["WiFi", "AC", "Bathroom"],
    status: "Occupied",
    createdAt: "2024-01-20",
  },
  {
    id: "R007",
    wardId: "W003",
    roomNumber: "302",
    roomType: "Private",
    floorNo: 3,
    bedCount: 1,
    amenities: ["WiFi", "AC", "Bathroom"],
    status: "Cleaning",
    createdAt: "2024-01-20",
  },
  // Maternity Ward rooms
  {
    id: "R008",
    wardId: "W004",
    roomNumber: "203",
    roomType: "Semi-Private",
    floorNo: 2,
    bedCount: 2,
    amenities: ["TV", "WiFi", "AC", "Bathroom"],
    status: "Occupied",
    createdAt: "2024-02-01",
  },
  {
    id: "R009",
    wardId: "W004",
    roomNumber: "204",
    roomType: "Private",
    floorNo: 2,
    bedCount: 1,
    amenities: ["TV", "WiFi", "AC", "Bathroom", "Refrigerator"],
    status: "Available",
    createdAt: "2024-02-01",
  },
  // Emergency Ward rooms
  {
    id: "R010",
    wardId: "W005",
    roomNumber: "104",
    roomType: "General",
    floorNo: 1,
    bedCount: 6,
    amenities: ["WiFi", "AC"],
    status: "Available",
    createdAt: "2024-02-10",
  },
];
