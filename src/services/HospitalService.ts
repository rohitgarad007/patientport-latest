import { configService } from "./configService";
import { decryptAESFromPHP, encryptAESForPHP } from "@/utils/aesDecrypt";

export interface HospitalProfile {
  id: string;
  hosuid: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  state: string;
  city: string;
  appointment_day_limit?: string;
  book_appointment_status?: string | number;
  screen_default_message?: string;
  hospital_qr_code?: string;
}

class HospitalService {
  // Hardcoded key to match backend (should be in secure config ideally)
  private AES_KEY = "RohitGaradHos@173414";

  async getProfile(hosuid: string): Promise<HospitalProfile | null> {
    const API_URL = await configService.getApiUrl();
    try {
      const response = await fetch(`${API_URL}/hospital/profile/${hosuid}`);
      if (!response.ok) throw new Error("Failed to fetch hospital profile");
      const result = await response.json();
      
      if (result.status && result.data) {
        const decryptedJson = decryptAESFromPHP(result.data, this.AES_KEY);
        if (decryptedJson) {
            return JSON.parse(decryptedJson);
        }
      }
      return null;
    } catch (error) {
      console.error("Error fetching hospital profile:", error);
      return null;
    }
  }

  async updateProfile(data: Partial<HospitalProfile>): Promise<{ status: boolean; message: string }> {
    const API_URL = await configService.getApiUrl();
    try {
      // Encrypt data
      const encryptedData = encryptAESForPHP(JSON.stringify(data), this.AES_KEY);
      
      const response = await fetch(`${API_URL}/hospital/profile/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: encryptedData }),
      });
      if (!response.ok) throw new Error("Failed to update profile");
      return await response.json();
    } catch (error) {
      console.error("Error updating profile:", error);
      return { status: false, message: "Failed to update profile" };
    }
  }

  async changePassword(data: any): Promise<{ status: boolean; message: string }> {
    const API_URL = await configService.getApiUrl();
    try {
      // Keep changePassword as form-urlencoded for now unless requested otherwise, 
      // but to be safe and consistent, we could encrypt it too. 
      // However, the controller for changePassword wasn't modified to accept encrypted JSON.
      // So I leave it as is.
      const response = await fetch(`${API_URL}hospital/profile/change_password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(data).toString(),
      });
      if (!response.ok) throw new Error("Failed to change password");
      return await response.json();
    } catch (error) {
      console.error("Error changing password:", error);
      return { status: false, message: "Failed to change password" };
    }
  }
}

export const hospitalService = new HospitalService();
