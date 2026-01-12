import { PrescriptionData } from "@/data/receiptData";

export interface ReceiptContentSettings {
  header_status?: number;
  doctor_info_status?: number;
  patient_info_status?: number;
  medical_history_status?: number;
  presenting_symptoms_status?: number;
  diagnosis_status?: number;
  lab_tests_status?: number;
  medications_status?: number;
  footer_status?: number;
  [key: string]: number | undefined;
}

export interface ReceiptProps {
  data: PrescriptionData;
  disabled?: boolean;
  contentSettings?: ReceiptContentSettings;
}
