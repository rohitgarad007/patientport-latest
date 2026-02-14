import { configService } from "./configService";
import { decryptAESFromPHP, encryptAESForPHP } from "@/utils/aesDecrypt";
import Cookies from "js-cookie";

export interface DoctorProfile {
  docuid?: string;
  name: string;
  email: string;
  phone: string;
  profile_image: string;
  gender: string;
  specialization_id: string;
  specialization_name?: string; // Display only
  experience_year: string;
  experience_month: string;
  consultation_fee: string;
  screen_default_message?: string;
  
  // For updates
  current_password?: string;
  new_password?: string;
  confirm_password?: string; // Frontend use
}

class DoctorProfileService {
  private AES_KEY = "RohitGaradHos@173414";

  private async getAuthHeaders() {
    const token = Cookies.get("token");
    if (!token) throw new Error("No auth token found");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  async getProfile(): Promise<DoctorProfile | null> {
    const API_URL = await configService.getApiUrl();
    const headers = await this.getAuthHeaders();

    try {
      const response = await fetch(`${API_URL}doctor_profile_get`, {
        method: "GET",
        headers: headers,
      });

      if (!response.ok) throw new Error("Failed to fetch doctor profile");
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
      console.error("Error fetching doctor profile:", error);
      return null;
    }
  }

  async updateProfile(data: Partial<DoctorProfile>, imageFile?: File): Promise<{ status: boolean; message: string }> {
    const API_URL = await configService.getApiUrl();
    const token = Cookies.get("token");
    if (!token) throw new Error("No auth token found");

    try {
      // Encrypt data
      const encryptedData = encryptAESForPHP(JSON.stringify(data), this.AES_KEY);
      
      const formData = new FormData();
      formData.append("data", encryptedData);
      
      if (imageFile) {
        formData.append("profile_image", imageFile);
      }
      
      const response = await fetch(`${API_URL}doctor_profile_update`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            // Content-Type must be undefined for FormData to set boundary
        },
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to update profile");
      return await response.json();
    } catch (error) {
      console.error("Error updating profile:", error);
      return { status: false, message: "Failed to update profile" };
    }
  }
}

export const doctorProfileService = new DoctorProfileService();
