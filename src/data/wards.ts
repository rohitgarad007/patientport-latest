export interface Ward {
  id: string;
  wardName: string;
  wardType: "General" | "Pediatric" | "Maternity" | "ICU" | "Emergency";
  floorNo: number;
  capacity: number;
  departmentId: string;
  status: "active" | "inactive";
  createdAt: string;
}

export const wards: Ward[] = [
  {
    id: "W001",
    wardName: "General Ward A",
    wardType: "General",
    floorNo: 1,
    capacity: 40,
    departmentId: "1",
    status: "active",
    createdAt: "2024-01-10",
  },
  {
    id: "W002",
    wardName: "Pediatric Ward",
    wardType: "Pediatric",
    floorNo: 2,
    capacity: 25,
    departmentId: "2",
    status: "active",
    createdAt: "2024-01-15",
  },
  {
    id: "W003",
    wardName: "ICU Ward",
    wardType: "ICU",
    floorNo: 3,
    capacity: 20,
    departmentId: "5",
    status: "active",
    createdAt: "2024-01-20",
  },
  {
    id: "W004",
    wardName: "Maternity Ward",
    wardType: "Maternity",
    floorNo: 2,
    capacity: 30,
    departmentId: "2",
    status: "active",
    createdAt: "2024-02-01",
  },
  {
    id: "W005",
    wardName: "Emergency Ward",
    wardType: "Emergency",
    floorNo: 1,
    capacity: 15,
    departmentId: "1",
    status: "active",
    createdAt: "2024-02-10",
  },
];
