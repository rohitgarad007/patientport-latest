import Cookies from "js-cookie";
import { configService } from "./configService";
import { decryptAESFromPHP, encryptAESForPHP } from "@/utils/aesDecrypt";

const getAuthHeaders = async () => {
  const apiUrl = await configService.getApiUrl();
  let token = Cookies.get("labToken");
  if (!token) {
    token = Cookies.get("token") || "";
  }
  if (!token) throw new Error("No auth token found");
  return {
    apiUrl,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };
};

export const fetchPaymentHistory = async (orderId: number) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const res = await fetch(`${apiUrl}lb_payment_history`, {
    method: "POST",
    headers,
    body: JSON.stringify({ order_id: orderId }),
  });
  if (!res.ok) throw new Error("Failed to fetch payment history");
  const json = await res.json();
  if (json.success && json.data) {
    const AES_KEY = await configService.getAesSecretKey();
    const decrypted = decryptAESFromPHP(json.data, AES_KEY);
    return decrypted ? JSON.parse(decrypted) : [];
  }
  return [];
};

export const addPayment = async (orderId: number, amount: number, paymentMethod: string, transactionRef: string, notes: string) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const AES_KEY = await configService.getAesSecretKey();
  
  const payload = JSON.stringify({
    order_id: orderId,
    amount,
    payment_method: paymentMethod,
    transaction_ref: transactionRef,
    notes: notes
  });
  
  const encryptedPayload = encryptAESForPHP(payload, AES_KEY);
  
  const res = await fetch(`${apiUrl}lb_add_payment`, {
    method: "POST",
    headers,
    body: JSON.stringify({ encrypted_payload: encryptedPayload }),
  });
  
  if (!res.ok) throw new Error("Failed to add payment");
  return await res.json();
};

export const fetchBillingData = async (page = 1, limit = 100, search = "", status = "all") => {
  const { apiUrl, headers } = await getAuthHeaders();
  const res = await fetch(`${apiUrl}lb_billing_data`, {
    method: "POST",
    headers,
    body: JSON.stringify({ page, limit, search, status }),
  });
  if (!res.ok) throw new Error("Failed to fetch billing data");
  const json = await res.json();
  if (json.success && json.data) {
    const AES_KEY = await configService.getAesSecretKey();
    const decrypted = decryptAESFromPHP(json.data, AES_KEY);
    return decrypted ? JSON.parse(decrypted) : null;
  }
  return null;
};
