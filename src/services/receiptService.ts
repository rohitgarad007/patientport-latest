import Cookies from "js-cookie";
import CryptoJS from "crypto-js";
import { configService } from "./configService";
import { decryptAESFromPHP } from "@/utils/aesDecrypt";

export interface ReceiptTemplate {
  id: number;
  name: string;
  description: string;
  receipt_img: string;
  gradient?: string;
  accent_color?: string;
  icon?: string;
  is_default?: number;
  // UI helper properties (mapped after fetch)
  previewImage?: string;
  iconComponent?: any;
}

const getAuthHeaders = async () => {
  const token = Cookies.get("token");
  const apiUrl = await configService.getApiUrl();
  if (!token) throw new Error("No auth token found");
  return {
    apiUrl,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };
};

export async function fetchReceiptTemplates(): Promise<{ success: boolean; data: ReceiptTemplate[]; message?: string; default_receipt_id?: number }> {
  try {
    const { apiUrl, headers } = await getAuthHeaders();
    const url = `${apiUrl}dc_doctor_getReceiptTemplates`;
    const AES_KEY = "RohitGaradHos@173414";

    const res = await fetch(url, {
      method: "GET",
      headers,
    });

    const response = await res.json();
    
    if (!response?.success) {
      return { success: false, data: [], message: response?.message || "Failed to fetch receipts" };
    }

    let data: ReceiptTemplate[] = [];
    if (response?.data) {
      const decrypted = decryptAESFromPHP(response.data, AES_KEY);
      try {
        data = JSON.parse(decrypted);
      } catch (e) {
        console.error("Failed to parse receipt templates", e);
      }
    }

    return { success: true, data, default_receipt_id: response.default_receipt_id };
  } catch (error: any) {
    return { success: false, data: [], message: error.message || "Network error" };
  }
}

export async function setDefaultReceipt(receiptId: number): Promise<{ success: boolean; message?: string }> {
  try {
    const { apiUrl, headers } = await getAuthHeaders();
    const url = `${apiUrl}dc_doctor_set_defaultReceipt`;

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ receipt_id: receiptId }),
    });

    const response = await res.json();
    return response;
  } catch (error: any) {
    return { success: false, message: error.message || "Network error" };
  }
}

export async function getReceiptContent(): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    const { apiUrl, headers } = await getAuthHeaders();
    const url = `${apiUrl}dc_doctor_getReceiptContent`;
    const AES_KEY = "RohitGaradHos@173414";

    const res = await fetch(url, {
      method: "GET",
      headers,
    });

    const response = await res.json();
    
    if (!response?.success) {
      return { success: false, message: response?.message || "Failed to fetch receipt content" };
    }

    let data = null;
    if (response?.data) {
      const decrypted = decryptAESFromPHP(response.data, AES_KEY);
      try {
        data = JSON.parse(decrypted);
      } catch (e) {
        console.error("Failed to parse receipt content", e);
      }
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, message: error.message || "Network error" };
  }
}

export async function updateReceiptContent(data: any): Promise<{ success: boolean; message?: string }> {
  try {
    const { apiUrl, headers } = await getAuthHeaders();
    const url = `${apiUrl}dc_doctor_updateReceiptContent`;

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    const response = await res.json();
    return response;
  } catch (error: any) {
    return { success: false, message: error.message || "Network error" };
  }
}
