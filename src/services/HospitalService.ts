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

export interface HospitalWebsiteBanner {
  id?: number | null;
  title: string;
  sub_title: string;
  image: string;
  status?: number | null;
}

export interface HospitalWebsiteSettings {
  about_title: string;
  about_description: string;
  about_image?: string;
  website_template: string;
  banners: HospitalWebsiteBanner[];
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
      const response = await fetch(`${API_URL}/hospital/profile/change_password`, {
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

  async getWebsiteSettings(hosuid: string): Promise<HospitalWebsiteSettings | null> {
    const API_URL = await configService.getApiUrl();
    try {
      const response = await fetch(`${API_URL}/hospital/website_settings/${hosuid}`);
      if (!response.ok) throw new Error("Failed to fetch hospital website settings");
      const result = await response.json();

      if (result.status && result.data) {
        const decryptedJson = decryptAESFromPHP(result.data, this.AES_KEY);
        if (decryptedJson) {
          return JSON.parse(decryptedJson);
        }
      }
      return null;
    } catch (error) {
      console.error("Error fetching hospital website settings:", error);
      return null;
    }
  }

  async updateWebsiteSettings(
    data: { hosuid: string } & Partial<HospitalWebsiteSettings>
  ): Promise<{ status: boolean; message: string }> {
    const API_URL = await configService.getApiUrl();
    try {
      const encryptedData = encryptAESForPHP(JSON.stringify(data), this.AES_KEY);
      const response = await fetch(`${API_URL}/hospital/website_settings/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: encryptedData }),
      });
      if (!response.ok) throw new Error("Failed to update hospital website settings");
      return await response.json();
    } catch (error) {
      console.error("Error updating hospital website settings:", error);
      return { status: false, message: "Failed to update hospital website settings" };
    }
  }

  async updateWebsiteTemplate(params: {
    hosuid: string;
    template_id: 1 | 2 | 3 | 4;
  }): Promise<{ status: boolean; message?: string; data?: { template_id: number } }> {
    const API_URL = await configService.getApiUrl();
    try {
      const encryptedData = encryptAESForPHP(JSON.stringify(params), this.AES_KEY);
      const response = await fetch(`${API_URL}/hospital/website_settings/template/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: encryptedData }),
      });
      if (!response.ok) throw new Error("Failed to update website template");
      return await response.json();
    } catch (error) {
      console.error("Error updating website template:", error);
      return { status: false, message: "Failed to update website template" };
    }
  }

  async updateWebsiteAbout(params: {
    hosuid: string;
    about_title: string;
    about_description: string;
    about_image?: File | null;
  }): Promise<{ status: boolean; message?: string; about_image?: string; full_url?: string }> {
    const API_URL = await configService.getApiUrl();
    try {
      const formData = new FormData();
      formData.append("hosuid", params.hosuid);
      formData.append("about_title", params.about_title);
      formData.append("about_description", params.about_description);
      if (params.about_image) {
        formData.append("about_image", params.about_image);
      }
      const response = await fetch(`${API_URL}/hospital/website_settings/about/update`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to update website about");
      return await response.json();
    } catch (error) {
      console.error("Error updating website about:", error);
      return { status: false, message: "Failed to update website about" };
    }
  }
  async uploadWebsiteBannerImage(
    hosuid: string,
    file: File
  ): Promise<{ status: boolean; message?: string; path?: string; full_url?: string }> {
    const API_URL = await configService.getApiUrl();
    const formData = new FormData();
    formData.append("hosuid", hosuid);
    formData.append("banner_image", file);

    try {
      const response = await fetch(`${API_URL}/hospital/website_settings/upload_banner`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to upload banner image");
      return await response.json();
    } catch (error) {
      console.error("Error uploading banner image:", error);
      return { status: false, message: "Failed to upload banner image" };
    }
  }

  async addWebsiteBanner(params: {
    hosuid: string;
    title: string;
    sub_title: string;
    banner_image: File;
    status?: number | null;
  }): Promise<{ status: boolean; message?: string; banner?: HospitalWebsiteBanner; full_url?: string }> {
    const API_URL = await configService.getApiUrl();
    const formData = new FormData();
    formData.append("hosuid", params.hosuid);
    formData.append("title", params.title);
    formData.append("sub_title", params.sub_title);
    formData.append("banner_image", params.banner_image);
    if (params.status !== undefined && params.status !== null) {
      formData.append("status", String(params.status));
    }

    try {
      const response = await fetch(`${API_URL}/hospital/website_settings/banner/add`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to add banner");
      const json = await response.json();
      if (json?.banner) {
        return {
          status: Boolean(json.status),
          message: json.message,
          banner: {
            id: json.banner.id ?? null,
            title: String(json.banner.title ?? ""),
            sub_title: String(json.banner.sub_title ?? ""),
            image: String(json.banner.image ?? ""),
            status: json.banner.status ?? null,
          },
          full_url: json.banner.full_url ?? json.full_url,
        };
      }
      return json;
    } catch (error) {
      console.error("Error adding website banner:", error);
      return { status: false, message: "Failed to add banner" };
    }
  }

  async changeWebsiteBannerStatus(params: {
    hosuid: string;
    banner_id: number | string;
    status: 0 | 1;
  }): Promise<{ status: boolean; message?: string; data?: { banner_id: number | string; status: 0 | 1 } }> {
    const API_URL = await configService.getApiUrl();
    try {
      const encryptedData = encryptAESForPHP(JSON.stringify(params), this.AES_KEY);
      const response = await fetch(`${API_URL}/hospital/website_settings/banner/change_status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: encryptedData }),
      });
      if (!response.ok) throw new Error("Failed to update banner status");
      return await response.json();
    } catch (error) {
      console.error("Error updating website banner status:", error);
      return { status: false, message: "Failed to update banner status" };
    }
  }

  async updateWebsiteBanner(params: {
    hosuid: string;
    banner_id: number;
    title: string;
    sub_title: string;
    status: 0 | 1;
    banner_image?: File | null;
  }): Promise<{ status: boolean; message?: string; banner?: HospitalWebsiteBanner; full_url?: string }> {
    const API_URL = await configService.getApiUrl();
    const formData = new FormData();
    formData.append("hosuid", params.hosuid);
    formData.append("banner_id", String(params.banner_id));
    formData.append("title", params.title);
    formData.append("sub_title", params.sub_title);
    formData.append("status", String(params.status));
    if (params.banner_image) {
      formData.append("banner_image", params.banner_image);
    }

    try {
      const response = await fetch(`${API_URL}/hospital/website_settings/banner/update`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to update banner");
      const json = await response.json();
      if (json?.banner) {
        return {
          status: Boolean(json.status),
          message: json.message,
          banner: {
            id: json.banner.id ?? null,
            title: String(json.banner.title ?? ""),
            sub_title: String(json.banner.sub_title ?? ""),
            image: String(json.banner.image ?? ""),
            status: json.banner.status ?? null,
          },
          full_url: json.banner.full_url ?? json.full_url,
        };
      }
      return json;
    } catch (error) {
      console.error("Error updating website banner:", error);
      return { status: false, message: "Failed to update banner" };
    }
  }
}

export const hospitalService = new HospitalService();
