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

export interface HospitalSpecializationItem {
  id: string;
  name: string;
  description: string;
  status?: number | string | null;
}

export interface HospitalPublicDoctor {
  id: string;
  docuid: string;
  hosuid?: string;
  name: string;
  email?: string;
  phone?: string;
  gender?: string;
  profile_image?: string;
  specialization_id?: string;
  specialization_name?: string;
  experience_year?: string;
  experience_month?: string;
  consultation_fee?: string;
}

export interface HospitalPublicAbout {
  about_title: string;
  about_description: string;
  about_image: string;
}

export interface HospitalPublicBanner {
  id: string;
  title: string;
  sub_title: string;
  banner_image: string;
}

export interface HospitalAmenityItem {
  id: string;
  amenityuid: string;
  hosuid: string;
  name: string;
  icon?: string;
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

  async getPublicHospitalSpecializations(hosuid: string): Promise<HospitalSpecializationItem[]> {
    const API_URL = await configService.getApiUrl();
    const response = await fetch(`${API_URL}/public_hospital_specializations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ hosuid }),
    });
    if (!response.ok) throw new Error("Failed to fetch hospital specializations");
    const json: unknown = await response.json();
    const root = (json && typeof json === "object" ? (json as Record<string, unknown>) : {}) as Record<string, unknown>;
    const rawItems = Array.isArray(root.items) ? root.items : Array.isArray(root.data) ? root.data : [];

    return rawItems
      .map((it) => (it && typeof it === "object" ? (it as Record<string, unknown>) : null))
      .filter((it): it is Record<string, unknown> => Boolean(it))
      .map((row) => ({
        id: String((row.id ?? row.speuid) ?? ""),
        name: String(row.name ?? ""),
        description: String(row.description ?? ""),
        status: (row.status ?? null) as HospitalSpecializationItem["status"],
      }));
  }

  async getPublicHospitalDoctors(hosuid: string): Promise<HospitalPublicDoctor[]> {
    const API_URL = await configService.getApiUrl();
    const response = await fetch(`${API_URL}/public_hospital_doctors`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ hosuid }),
    });
    if (!response.ok) throw new Error("Failed to fetch hospital doctors");
    const json: unknown = await response.json();
    const root = (json && typeof json === "object" ? (json as Record<string, unknown>) : {}) as Record<string, unknown>;
    const rawItems = Array.isArray(root.items) ? root.items : Array.isArray(root.data) ? root.data : [];

    const normalizeImage = (p: string) => {
      const s = p || "";
      if (!s) return "";
      if (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("data:")) return s;
      return `${API_URL}/${s.replace(/^\/+/, "")}`;
    };

    return rawItems
      .map((it) => (it && typeof it === "object" ? (it as Record<string, unknown>) : null))
      .filter((it): it is Record<string, unknown> => Boolean(it))
      .map((row) => {
        const profile = String(row.profile_image ?? "");
        return {
          id: String(row.id ?? ""),
          docuid: String(row.docuid ?? ""),
          hosuid: String(row.hosuid ?? ""),
          name: String(row.name ?? ""),
          email: String(row.email ?? ""),
          phone: String(row.phone ?? ""),
          gender: String(row.gender ?? ""),
          profile_image: normalizeImage(profile),
          specialization_id: String(row.specialization_id ?? ""),
          specialization_name: String(row.specialization_name ?? ""),
          experience_year: String(row.experience_year ?? ""),
          experience_month: String(row.experience_month ?? ""),
          consultation_fee: String(row.consultation_fee ?? ""),
        };
      })
      .filter((d) => Boolean(d.id) && Boolean(d.name));
  }

  async getPublicHospitalAbout(hosuid: string): Promise<HospitalPublicAbout | null> {
    const API_URL = await configService.getApiUrl();
    const response = await fetch(`${API_URL}/public_hospital_about`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ hosuid }),
    });
    if (!response.ok) throw new Error("Failed to fetch hospital about");
    const json: unknown = await response.json();
    const root = (json && typeof json === "object" ? (json as Record<string, unknown>) : {}) as Record<string, unknown>;
    const aboutRaw = root.about && typeof root.about === "object" ? (root.about as Record<string, unknown>) : null;
    if (!aboutRaw) return null;

    const normalizeImage = (p: string) => {
      const s = p || "";
      if (!s) return "";
      if (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("data:")) return s;
      return `${API_URL}/${s.replace(/^\/+/, "")}`;
    };

    return {
      about_title: String(aboutRaw.about_title ?? ""),
      about_description: String(aboutRaw.about_description ?? ""),
      about_image: normalizeImage(String(aboutRaw.about_image ?? "")),
    };
  }

  async getPublicHospitalAmenities(hosuid: string): Promise<HospitalAmenityItem[]> {
    const API_URL = await configService.getApiUrl();
    const response = await fetch(`${API_URL}/public_hospital_amenities`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ hosuid }),
    });
    if (!response.ok) throw new Error("Failed to fetch hospital amenities");
    const json: unknown = await response.json();
    const root = (json && typeof json === "object" ? (json as Record<string, unknown>) : {}) as Record<string, unknown>;
    const rawItems = Array.isArray(root.items) ? root.items : Array.isArray(root.data) ? root.data : [];

    return rawItems
      .map((it) => (it && typeof it === "object" ? (it as Record<string, unknown>) : null))
      .filter((it): it is Record<string, unknown> => Boolean(it))
      .map((row) => ({
        id: String(row.id ?? ""),
        amenityuid: String(row.amenityuid ?? ""),
        hosuid: String(row.hosuid ?? ""),
        name: String(row.name ?? ""),
        icon: String(row.icon ?? ""),
      }))
      .filter((a) => Boolean(a.id) && Boolean(a.name));
  }

  async getPublicHospitalBanners(hosuid: string): Promise<HospitalPublicBanner[]> {
    const API_URL = await configService.getApiUrl();
    const response = await fetch(`${API_URL}/public_hospital_banners`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ hosuid }),
    });
    if (!response.ok) throw new Error("Failed to fetch hospital banners");
    const json: unknown = await response.json();
    const root = (json && typeof json === "object" ? (json as Record<string, unknown>) : {}) as Record<string, unknown>;
    const rawItems = Array.isArray(root.items) ? root.items : Array.isArray(root.data) ? root.data : [];

    const normalizeImage = (p: string) => {
      const s = p || "";
      if (!s) return "";
      if (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("data:")) return s;
      return `${API_URL}/${s.replace(/^\/+/, "")}`;
    };

    return rawItems
      .map((it) => (it && typeof it === "object" ? (it as Record<string, unknown>) : null))
      .filter((it): it is Record<string, unknown> => Boolean(it))
      .map((row) => ({
        id: String(row.id ?? ""),
        title: String(row.title ?? ""),
        sub_title: String(row.sub_title ?? ""),
        banner_image: normalizeImage(String(row.banner_image ?? row.image ?? "")),
      }))
      .filter((b) => Boolean(b.id) && Boolean(b.banner_image));
  }
}

export const hospitalService = new HospitalService();
