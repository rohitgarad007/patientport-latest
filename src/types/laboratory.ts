export interface Laboratory {
  id: string;
  name: string;
  location: string;
  city: string;
  contactNumber: string;
  email: string;
  type: 'Pathology' | 'Diagnostic' | 'Imaging' | 'Clinical' | 'Research';
  status: 'Active' | 'Inactive';
  licenseNo: string;
  accreditation: string;
}
