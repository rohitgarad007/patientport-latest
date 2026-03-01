import { configService } from "./configService";
import { decryptAESFromPHP, encryptAESForPHP } from "@/utils/aesDecrypt";
import Cookies from "js-cookie";

export interface StaffProfile {
  stf_uid?: string;
  name: string;
  email: string;
  phone: string;
  profile_image: string;
  gender: string;
  specialization: string;
  experience_years: string;
  experience_months: string;
  screen_lock_pin?: string;
  screen_sleep_time?: string;
  
  // For updates
  current_password?: string;
  new_password?: string;
  confirm_password?: string; // Frontend use
}

class StaffProfileService {
  private AES_KEY = "RohitGaradHos@173414";

  private async getAuthHeaders() {
    const token = Cookies.get("token");
    if (!token) throw new Error("No auth token found");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  async getProfile(): Promise<StaffProfile | null> {
    const API_URL = await configService.getApiUrl();
    const headers = await this.getAuthHeaders();

    try {
      const response = await fetch(`${API_URL}/staff_profile_get`, {
        method: "GET",
        headers: headers,
      });

      if (!response.ok) throw new Error("Failed to fetch staff profile");
      const result = await response.json();
      
      if (result.status && result.data) {
        const decryptedJson = decryptAESFromPHP(result.data, this.AES_KEY);
        if (decryptedJson) {
            const profile = JSON.parse(decryptedJson);
            
            // Prepend API URL to profile_image if it's a relative path (not base64 and not http)
            if (profile.profile_image && 
                !profile.profile_image.startsWith('data:') && 
                !profile.profile_image.startsWith('http')) {
                const baseUrl = API_URL.endsWith('/') ? API_URL : API_URL + '/';
                profile.profile_image = `${baseUrl}${profile.profile_image}`;
            }
            return profile;
        }
      }
      return null;
    } catch (error) {
      console.error("Error fetching staff profile:", error);
      return null;
    }
  }

  // Event system for profile updates
  private listeners: (() => void)[] = [];

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<{ status: boolean; message: string }> {
    const API_URL = await configService.getApiUrl();
    const headers = await this.getAuthHeaders();
    const { encryptAESForPHP } = await import("@/utils/aesDecrypt");

    try {
      const encryptedData = encryptAESForPHP(JSON.stringify(data), this.AES_KEY);

      const response = await fetch(`${API_URL}/staff_profile_change_password`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({ data: encryptedData }),
      });

      if (!response.ok) throw new Error("Failed to change password");
      return await response.json();
    } catch (error) {
      console.error("Error changing password:", error);
      return { status: false, message: "Failed to change password" };
    }
  }
}

export const staffProfileService = new StaffProfileService();
