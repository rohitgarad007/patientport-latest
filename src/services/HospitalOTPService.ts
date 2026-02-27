import Cookies from "js-cookie";
import { configService } from "./configService";
import { decryptAESFromPHP } from "@/utils/aesDecrypt";
import { Employee } from "@/types/employee";

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

export const fetchEmployeeOTPList = async (role: string) => {
  const { apiUrl, headers } = await getAuthHeaders();
  
  const res = await fetch(`${apiUrl}/hs_employee_otp_list?role=${role}`, {
    method: "GET",
    headers,
  });

  if (!res.ok) throw new Error("Failed to fetch employee OTP list");

  const json = await res.json();

  if (json.success && json.data) {
    const AES_KEY = await configService.getAesSecretKey();
    const decrypted = decryptAESFromPHP(json.data, AES_KEY);
    const rawData = decrypted ? JSON.parse(decrypted) : [];
    
    const mappedData: Employee[] = rawData.map((item: any) => ({
      id: item.id,
      name: item.name,
      email: item.email,
      phone: item.phone,
      role: item.role,
      department: item.department || '',
      employeeId: item.employeeId,
      currentOtp: item.current_otp || '',
      otpGeneratedAt: item.otp_generated_at || '',
      otpExpiresAt: item.otp_expires_at || '',
      status: 'Active',
      twoFactorAuth: parseInt(item.two_factor_auth || '0'),
    }));

    return { ...json, data: mappedData };
  }

  return { ...json, data: [] };
};

export const resetEmployeeOTP = async (employeeId: string, role: string) => {
  const { apiUrl, headers } = await getAuthHeaders();
  
  const res = await fetch(`${apiUrl}/hs_employee_otp_reset`, {
    method: "POST",
    headers,
    body: JSON.stringify({ employeeId, role }),
  });

  if (!res.ok) throw new Error("Failed to reset OTP");
  return res.json();
};

export const toggleEmployee2FA = async (employeeId: string, role: string, status: number) => {
  const { apiUrl, headers } = await getAuthHeaders();
  
  const res = await fetch(`${apiUrl}/hs_employee_otp_2fa_toggle`, {
    method: "POST",
    headers,
    body: JSON.stringify({ employeeId, role, status }),
  });

  if (!res.ok) throw new Error("Failed to toggle 2FA");
  return res.json();
};
