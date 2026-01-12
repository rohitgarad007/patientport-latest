import Cookies from "js-cookie";
import { configService } from "./configService";
import { encryptAESForPHP, decryptAESFromPHP } from "../utils/aesDecrypt";

const getAuthHeaders = async () => {
  let token = Cookies.get("labToken");
  if (!token) {
    token = Cookies.get("token");
  }
  let apiUrl = await configService.getApiUrl();
  
  if (apiUrl.endsWith('/')) {
    apiUrl = apiUrl.slice(0, -1);
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

export const getUnseenOrders = async () => {
  const { apiUrl, headers } = await getAuthHeaders();
  const aesKey = await configService.getAesSecretKey();

  const res = await fetch(`${apiUrl}/lb_unseen_orders`, {
    method: "GET",
    headers,
  });

  if (!res.ok) {
    throw new Error("Failed to fetch notifications");
  }

  const response = await res.json();

  if (response.success && response.data) {
    const decrypted = decryptAESFromPHP(response.data, aesKey);
    if (decrypted) {
      return JSON.parse(decrypted);
    }
  }
  return [];
};

export const markOrdersSeen = async (orderIds: string[]) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const aesKey = await configService.getAesSecretKey();

  const payload = encryptAESForPHP(JSON.stringify({ orderIds }), aesKey);

  const res = await fetch(`${apiUrl}/lb_mark_seen`, {
    method: "POST",
    headers,
    body: JSON.stringify({ encrypted_payload: payload }),
  });

  if (!res.ok) {
    throw new Error("Failed to mark notifications seen");
  }

  return await res.json();
};

export const getUnseenQueue = async () => {
  const { apiUrl, headers } = await getAuthHeaders();
  const aesKey = await configService.getAesSecretKey();

  const res = await fetch(`${apiUrl}/lb_unseen_queue`, {
    method: "GET",
    headers,
  });

  if (!res.ok) {
    throw new Error("Failed to fetch queue notifications");
  }

  const response = await res.json();

  if (response.success && response.data) {
    const decrypted = decryptAESFromPHP(response.data, aesKey);
    if (decrypted) {
      return JSON.parse(decrypted);
    }
  }
  return [];
};

export const markQueueSeen = async (orderIds: string[]) => {
  const { apiUrl, headers } = await getAuthHeaders();
  const aesKey = await configService.getAesSecretKey();

  const payload = encryptAESForPHP(JSON.stringify({ orderIds }), aesKey);

  const res = await fetch(`${apiUrl}/lb_mark_queue_seen`, {
    method: "POST",
    headers,
    body: JSON.stringify({ encrypted_payload: payload }),
  });

  if (!res.ok) {
    throw new Error("Failed to mark queue seen");
  }

  return await res.json();
};
