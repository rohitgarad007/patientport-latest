import { Ward, BedStatus } from '@/types/bedManagement';

const bedStatuses: BedStatus[] = ['available', 'occupied', 'reserved', 'maintenance'];

const getRandomStatus = (): BedStatus => {
  const random = Math.random();
  if (random < 0.6) return 'available';
  if (random < 0.75) return 'occupied';
  if (random < 0.85) return 'maintenance';
  return 'reserved';
};

const patientNames = [
  'John Doe', 'Jane Smith', 'Robert Johnson', 'Maria Garcia', 
  'Michael Brown', 'Lisa Wilson', 'David Martinez', 'Sarah Anderson'
];

const generateBeds = (count: number, roomNumber: string) => {
  return Array.from({ length: count }, (_, i) => {
    const status = getRandomStatus();
    return {
      id: `bed-${roomNumber}-${i + 1}`,
      number: i + 1,
      status,
      ...(status === 'occupied' && {
        patientName: patientNames[Math.floor(Math.random() * patientNames.length)],
        patientId: `P${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        admissionDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      }),
      ...(status === 'maintenance' && {
        notes: 'Under maintenance',
      }),
    };
  });
};

export const wardsData: Ward[] = [
  {
    id: 'general-ward',
    name: 'General Ward',
    rooms: [
      { id: 'room-201', number: '201', beds: generateBeds(14, '201') },
      { id: 'room-202', number: '202', beds: generateBeds(13, '202') },
      { id: 'room-203', number: '203', beds: generateBeds(14, '203') },
      { id: 'room-204', number: '204', beds: generateBeds(14, '204') },
      { id: 'room-205', number: '205', beds: generateBeds(11, '205') },
      { id: 'room-206', number: '206', beds: generateBeds(14, '206') },
    ],
  },
  {
    id: 'icu-ward',
    name: 'ICU Ward',
    rooms: [
      { id: 'room-101', number: '101', beds: generateBeds(10, '101') },
      { id: 'room-102', number: '102', beds: generateBeds(10, '102') },
      { id: 'room-103', number: '103', beds: generateBeds(8, '103') },
      { id: 'room-104', number: '104', beds: generateBeds(8, '104') },
    ],
  },
  {
    id: 'pediatric-ward',
    name: 'Pediatric Ward',
    rooms: [
      { id: 'room-301', number: '301', beds: generateBeds(12, '301') },
      { id: 'room-302', number: '302', beds: generateBeds(12, '302') },
      { id: 'room-303', number: '303', beds: generateBeds(10, '303') },
      { id: 'room-304', number: '304', beds: generateBeds(10, '304') },
      { id: 'room-305', number: '305', beds: generateBeds(8, '305') },
    ],
  },
  {
    id: 'operation-ward',
    name: 'Operation Ward',
    rooms: [
      { id: 'room-401', number: '401', beds: generateBeds(6, '401') },
      { id: 'room-402', number: '402', beds: generateBeds(6, '402') },
      { id: 'room-403', number: '403', beds: generateBeds(6, '403') },
    ],
  },
];
