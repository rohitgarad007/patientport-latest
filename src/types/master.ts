export interface Category {
  id: string;
  name: string;
  description?: string;
  status: "Active" | "Inactive";
  createdAt: string;
}

export interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  description?: string;
  status: "Active" | "Inactive";
  createdAt: string;
}

export interface Manufacturer {
  id: string;
  name: string;
  contactPerson: string;
  address?: string;
  phone: string;
  email: string;
  licenseNo?: string;
  status: "Active" | "Inactive";
  createdAt: string;
}

export interface Brand {
  id: string;
  name: string;
  manufacturerId: string;
  manufacturerName: string;
  description?: string;
  status: "Active" | "Inactive";
  createdAt: string;
}

export interface UnitOfMeasure {
  id: string;
  name: string;
  symbol: string;
  conversionRate: number;
  status: "Active" | "Inactive";
  createdAt: string;
}

export interface Tax {
  id: string;
  name: string;
  percentage: number;
  type: string; // e.g. GST, VAT
  region?: string;
  status: "Active" | "Inactive";
  createdAt: string;
}