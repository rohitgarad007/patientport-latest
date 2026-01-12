export interface InventoryItem {
  id: string;
  name: string;
  category: 'medicine' | 'equipment' | 'consumables';
  batchNumber: string;
  currentStock: number;
  expiryDate: string;
  supplier: string;
  status: 'in-stock' | 'low' | 'expired';
  unitCost: number;
  storageLocation: string;
}

export const dummyInventory: InventoryItem[] = [
  {
    id: '1',
    name: 'Paracetamol 500mg',
    category: 'medicine',
    batchNumber: 'MED2024-001',
    currentStock: 5000,
    expiryDate: '2025-12-31',
    supplier: 'PharmaCorp Ltd',
    status: 'in-stock',
    unitCost: 0.15,
    storageLocation: 'Pharmacy-A1'
  },
  {
    id: '11',
    name: 'Paracetamol 500mg',
    category: 'medicine',
    batchNumber: 'MED2024-089',
    currentStock: 3000,
    expiryDate: '2026-03-15',
    supplier: 'PharmaCorp Ltd',
    status: 'in-stock',
    unitCost: 0.18,
    storageLocation: 'Pharmacy-A1'
  },
  {
    id: '2',
    name: 'Surgical Gloves (Box)',
    category: 'consumables',
    batchNumber: 'CON2024-045',
    currentStock: 150,
    expiryDate: '2026-06-30',
    supplier: 'MedSupply Inc',
    status: 'low',
    unitCost: 12.50,
    storageLocation: 'Storage-B3'
  },
  {
    id: '12',
    name: 'Surgical Gloves (Box)',
    category: 'consumables',
    batchNumber: 'CON2024-102',
    currentStock: 200,
    expiryDate: '2026-09-20',
    supplier: 'MedSupply Inc',
    status: 'in-stock',
    unitCost: 11.75,
    storageLocation: 'Storage-B3'
  },
  {
    id: '3',
    name: 'X-Ray Machine',
    category: 'equipment',
    batchNumber: 'EQP2023-012',
    currentStock: 2,
    expiryDate: '2030-01-15',
    supplier: 'MedTech Solutions',
    status: 'in-stock',
    unitCost: 45000.00,
    storageLocation: 'Radiology-Wing'
  },
  {
    id: '4',
    name: 'Amoxicillin 250mg',
    category: 'medicine',
    batchNumber: 'MED2023-087',
    currentStock: 50,
    expiryDate: '2024-11-30',
    supplier: 'PharmaCorp Ltd',
    status: 'expired',
    unitCost: 0.25,
    storageLocation: 'Pharmacy-A2'
  },
  {
    id: '13',
    name: 'Amoxicillin 250mg',
    category: 'medicine',
    batchNumber: 'MED2024-145',
    currentStock: 4500,
    expiryDate: '2026-05-30',
    supplier: 'PharmaCorp Ltd',
    status: 'in-stock',
    unitCost: 0.28,
    storageLocation: 'Pharmacy-A2'
  },
  {
    id: '5',
    name: 'Digital Thermometer',
    category: 'equipment',
    batchNumber: 'EQP2024-033',
    currentStock: 85,
    expiryDate: '2028-03-20',
    supplier: 'HealthGear Pro',
    status: 'in-stock',
    unitCost: 25.00,
    storageLocation: 'Equipment-C1'
  },
  {
    id: '6',
    name: 'Gauze Bandages (Pack)',
    category: 'consumables',
    batchNumber: 'CON2024-078',
    currentStock: 300,
    expiryDate: '2026-09-15',
    supplier: 'MedSupply Inc',
    status: 'in-stock',
    unitCost: 3.75,
    storageLocation: 'Storage-B1'
  },
  {
    id: '7',
    name: 'Insulin 100IU/ml',
    category: 'medicine',
    batchNumber: 'MED2024-112',
    currentStock: 120,
    expiryDate: '2025-02-28',
    supplier: 'DiabetesCare Ltd',
    status: 'low',
    unitCost: 18.50,
    storageLocation: 'Pharmacy-Cold-Storage'
  },
  {
    id: '14',
    name: 'Insulin 100IU/ml',
    category: 'medicine',
    batchNumber: 'MED2024-156',
    currentStock: 200,
    expiryDate: '2025-08-15',
    supplier: 'DiabetesCare Ltd',
    status: 'in-stock',
    unitCost: 19.00,
    storageLocation: 'Pharmacy-Cold-Storage'
  },
  {
    id: '8',
    name: 'Wheelchair',
    category: 'equipment',
    batchNumber: 'EQP2024-055',
    currentStock: 15,
    expiryDate: '2029-07-10',
    supplier: 'MobilityPlus',
    status: 'in-stock',
    unitCost: 450.00,
    storageLocation: 'Equipment-D2'
  },
  {
    id: '9',
    name: 'Face Masks (Box)',
    category: 'consumables',
    batchNumber: 'CON2024-091',
    currentStock: 80,
    expiryDate: '2025-05-20',
    supplier: 'ProtectAll Supplies',
    status: 'low',
    unitCost: 8.00,
    storageLocation: 'Storage-B2'
  },
  {
    id: '15',
    name: 'Face Masks (Box)',
    category: 'consumables',
    batchNumber: 'CON2024-133',
    currentStock: 500,
    expiryDate: '2026-01-10',
    supplier: 'ProtectAll Supplies',
    status: 'in-stock',
    unitCost: 7.50,
    storageLocation: 'Storage-B2'
  },
  {
    id: '10',
    name: 'Blood Pressure Monitor',
    category: 'equipment',
    batchNumber: 'EQP2024-067',
    currentStock: 45,
    expiryDate: '2027-11-30',
    supplier: 'HealthGear Pro',
    status: 'in-stock',
    unitCost: 75.00,
    storageLocation: 'Equipment-C2'
  }
];

export interface BatchData {
  id: string;
  batchNumber: string;
  itemName: string;
  receivedDate: string;
  quantity: number;
  expiryDate: string;
}

export const dummyBatches: BatchData[] = dummyInventory.map(item => ({
  id: item.id,
  batchNumber: item.batchNumber,
  itemName: item.name,
  receivedDate: new Date(new Date(item.expiryDate).getTime() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  quantity: item.currentStock,
  expiryDate: item.expiryDate
}));
