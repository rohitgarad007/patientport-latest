export interface ProductBatch {
  batchNumber: string;
  manufactureDate: string;
  expiryDate: string;
  quantity: number;
  warehouse: string;
  rackPosition: string;
  unitCost: number;
  supplier: string;
  lastUpdated: string;
  status: 'fresh' | 'expiring-soon' | 'expired';
}

export interface ProductInventory {
  id: string;
  productImage: string;
  productName: string;
  sku: string;
  category: string;
  brand: string;
  totalStock: number;
  minLevel: number;
  maxLevel: number;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'overstocked';
  batches: ProductBatch[];
}

export const dummyProducts: ProductInventory[] = [
  {
    id: '1',
    productImage: '/placeholder.svg',
    productName: 'Paracetamol 500mg Tablets',
    sku: 'MED-PAR-500',
    category: 'Medicine',
    brand: 'PharmaCorp',
    totalStock: 8000,
    minLevel: 2000,
    maxLevel: 10000,
    status: 'in-stock',
    batches: [
      {
        batchNumber: 'MED2024-001',
        manufactureDate: '2024-01-15',
        expiryDate: '2025-12-31',
        quantity: 5000,
        warehouse: 'Main Pharmacy',
        rackPosition: 'A1-R2-S3',
        unitCost: 0.15,
        supplier: 'PharmaCorp Ltd',
        lastUpdated: '2024-10-20',
        status: 'fresh'
      },
      {
        batchNumber: 'MED2024-089',
        manufactureDate: '2024-06-10',
        expiryDate: '2026-03-15',
        quantity: 3000,
        warehouse: 'Main Pharmacy',
        rackPosition: 'A1-R3-S2',
        unitCost: 0.18,
        supplier: 'PharmaCorp Ltd',
        lastUpdated: '2024-10-22',
        status: 'fresh'
      }
    ]
  },
  {
    id: '2',
    productImage: '/placeholder.svg',
    productName: 'Surgical Gloves (Latex)',
    sku: 'CON-GLV-LAT',
    category: 'Consumables',
    brand: 'MedSupply',
    totalStock: 350,
    minLevel: 500,
    maxLevel: 2000,
    status: 'low-stock',
    batches: [
      {
        batchNumber: 'CON2024-045',
        manufactureDate: '2024-03-20',
        expiryDate: '2026-06-30',
        quantity: 150,
        warehouse: 'Storage Unit B',
        rackPosition: 'B3-R1-S4',
        unitCost: 12.50,
        supplier: 'MedSupply Inc',
        lastUpdated: '2024-10-15',
        status: 'fresh'
      },
      {
        batchNumber: 'CON2024-102',
        manufactureDate: '2024-07-05',
        expiryDate: '2026-09-20',
        quantity: 200,
        warehouse: 'Storage Unit B',
        rackPosition: 'B3-R2-S1',
        unitCost: 11.75,
        supplier: 'MedSupply Inc',
        lastUpdated: '2024-10-18',
        status: 'fresh'
      }
    ]
  },
  {
    id: '3',
    productImage: '/placeholder.svg',
    productName: 'Insulin 100IU/ml',
    sku: 'MED-INS-100',
    category: 'Medicine',
    brand: 'DiabetesCare',
    totalStock: 320,
    minLevel: 200,
    maxLevel: 500,
    status: 'in-stock',
    batches: [
      {
        batchNumber: 'MED2024-112',
        manufactureDate: '2024-05-15',
        expiryDate: '2025-02-28',
        quantity: 120,
        warehouse: 'Cold Storage',
        rackPosition: 'CS-R1-S1',
        unitCost: 18.50,
        supplier: 'DiabetesCare Ltd',
        lastUpdated: '2024-10-19',
        status: 'expiring-soon'
      },
      {
        batchNumber: 'MED2024-156',
        manufactureDate: '2024-08-20',
        expiryDate: '2025-08-15',
        quantity: 200,
        warehouse: 'Cold Storage',
        rackPosition: 'CS-R1-S2',
        unitCost: 19.00,
        supplier: 'DiabetesCare Ltd',
        lastUpdated: '2024-10-21',
        status: 'fresh'
      }
    ]
  },
  {
    id: '4',
    productImage: '/placeholder.svg',
    productName: 'Amoxicillin 250mg Capsules',
    sku: 'MED-AMX-250',
    category: 'Medicine',
    brand: 'PharmaCorp',
    totalStock: 4550,
    minLevel: 1000,
    maxLevel: 5000,
    status: 'in-stock',
    batches: [
      {
        batchNumber: 'MED2023-087',
        manufactureDate: '2023-10-10',
        expiryDate: '2024-11-30',
        quantity: 50,
        warehouse: 'Main Pharmacy',
        rackPosition: 'A2-R1-S3',
        unitCost: 0.25,
        supplier: 'PharmaCorp Ltd',
        lastUpdated: '2024-10-10',
        status: 'expired'
      },
      {
        batchNumber: 'MED2024-145',
        manufactureDate: '2024-05-15',
        expiryDate: '2026-05-30',
        quantity: 4500,
        warehouse: 'Main Pharmacy',
        rackPosition: 'A2-R2-S1',
        unitCost: 0.28,
        supplier: 'PharmaCorp Ltd',
        lastUpdated: '2024-10-23',
        status: 'fresh'
      }
    ]
  },
  {
    id: '5',
    productImage: '/placeholder.svg',
    productName: 'Digital Thermometer',
    sku: 'EQP-THR-DGT',
    category: 'Equipment',
    brand: 'HealthGear Pro',
    totalStock: 85,
    minLevel: 50,
    maxLevel: 200,
    status: 'in-stock',
    batches: [
      {
        batchNumber: 'EQP2024-033',
        manufactureDate: '2024-01-10',
        expiryDate: '2028-03-20',
        quantity: 85,
        warehouse: 'Equipment Store',
        rackPosition: 'C1-R3-S2',
        unitCost: 25.00,
        supplier: 'HealthGear Pro',
        lastUpdated: '2024-10-12',
        status: 'fresh'
      }
    ]
  },
  {
    id: '6',
    productImage: '/placeholder.svg',
    productName: 'Face Masks (Surgical)',
    sku: 'CON-MSK-SRG',
    category: 'Consumables',
    brand: 'ProtectAll',
    totalStock: 580,
    minLevel: 300,
    maxLevel: 1000,
    status: 'in-stock',
    batches: [
      {
        batchNumber: 'CON2024-091',
        manufactureDate: '2024-04-10',
        expiryDate: '2025-05-20',
        quantity: 80,
        warehouse: 'Storage Unit B',
        rackPosition: 'B2-R2-S3',
        unitCost: 8.00,
        supplier: 'ProtectAll Supplies',
        lastUpdated: '2024-10-16',
        status: 'expiring-soon'
      },
      {
        batchNumber: 'CON2024-133',
        manufactureDate: '2024-08-15',
        expiryDate: '2026-01-10',
        quantity: 500,
        warehouse: 'Storage Unit B',
        rackPosition: 'B2-R3-S1',
        unitCost: 7.50,
        supplier: 'ProtectAll Supplies',
        lastUpdated: '2024-10-24',
        status: 'fresh'
      }
    ]
  },
  {
    id: '7',
    productImage: '/placeholder.svg',
    productName: 'Blood Pressure Monitor',
    sku: 'EQP-BPM-AUT',
    category: 'Equipment',
    brand: 'HealthGear Pro',
    totalStock: 45,
    minLevel: 30,
    maxLevel: 100,
    status: 'in-stock',
    batches: [
      {
        batchNumber: 'EQP2024-067',
        manufactureDate: '2024-02-20',
        expiryDate: '2027-11-30',
        quantity: 45,
        warehouse: 'Equipment Store',
        rackPosition: 'C2-R1-S4',
        unitCost: 75.00,
        supplier: 'HealthGear Pro',
        lastUpdated: '2024-10-14',
        status: 'fresh'
      }
    ]
  },
  {
    id: '8',
    productImage: '/placeholder.svg',
    productName: 'Wheelchair Standard',
    sku: 'EQP-WCH-STD',
    category: 'Equipment',
    brand: 'MobilityPlus',
    totalStock: 15,
    minLevel: 10,
    maxLevel: 30,
    status: 'in-stock',
    batches: [
      {
        batchNumber: 'EQP2024-055',
        manufactureDate: '2024-03-05',
        expiryDate: '2029-07-10',
        quantity: 15,
        warehouse: 'Equipment Store',
        rackPosition: 'D2-R1-S1',
        unitCost: 450.00,
        supplier: 'MobilityPlus',
        lastUpdated: '2024-10-11',
        status: 'fresh'
      }
    ]
  }
];
