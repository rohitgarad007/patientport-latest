import Cookies from "js-cookie";
import { configService } from "./configService";
import { decryptAESFromPHP, encryptAESForPHP } from "@/utils/aesDecrypt";

export type ScreenAppointmentsWsMessage = {
  event: string;
  hospital_id?: string;
  staff_id?: string;
  payload?: unknown;
};

export const getScreenAppointmentsGrouped = async (doctorIds: string[]) => {
  const token = Cookies.get("token");
  const apiUrl = await configService.getApiUrl();
  const AES_KEY = await configService.getAesSecretKey();

  if (!token) throw new Error("No auth token found");

  const payload = {
    doctorIds: encryptAESForPHP(JSON.stringify(doctorIds), AES_KEY) || ""
  };

  const res = await fetch(`${apiUrl.replace(/\/$/, "")}/hs_screen_appointments_grouped`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Failed to fetch screen appointments");

  const json = await res.json();
  if (json.success && json.data) {
    const decrypted = decryptAESFromPHP(json.data, AES_KEY);
    return decrypted ? JSON.parse(decrypted) : { waiting: [], arrived: [], draft: [], booked: [] };
  }
  return { waiting: [], arrived: [], draft: [], booked: [] };
};

export const connectScreenAppointmentsSocket = async (opts: {
  onMessage: (message: ScreenAppointmentsWsMessage) => void;
  onOpen?: () => void;
  onClose?: () => void;
}) => {
  let ws: WebSocket | null = null;
  let closedByUser = false;
  let reconnectTimer: number | null = null;

  const getWsUrl = async () => {
    const env = import.meta.env as unknown as Record<string, string | undefined>;
    const rawBase = env.VITE_STAFF_NOTIFICATIONS_WS_URL || env.VITE_WS_NOTIFICATIONS_URL || "";
    const normalizedRawBase = rawBase.startsWith("https://")
      ? rawBase.replace(/^https:/, "wss:")
      : rawBase.startsWith("http://")
        ? rawBase.replace(/^http:/, "ws:")
        : rawBase;
    return normalizedRawBase || `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.hostname}:8081/ws`;
  };

  const getHospitalId = () => {
    const userInfoStr = Cookies.get("userInfo");
    if (userInfoStr) {
      try {
        const u = JSON.parse(userInfoStr);
        return u.hospital_id || u.hospitalId || u.hospitalID || u.hospital || "";
      } catch (e) {
        return "";
      }
    }
    return "";
  };

  const connect = async () => {
    try {
      const url = await getWsUrl();
      const hospitalId = getHospitalId();
      if (!hospitalId) {
        throw new Error("Hospital ID not found for socket connection");
      }

      ws = new WebSocket(url);

      ws.onopen = () => {
        opts.onOpen?.();
        // Join the hospital staff room which receives staff_appointments_changed events
        ws?.send(JSON.stringify({
          action: "join_room",
          room: `hospital_${hospitalId}_staff`
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          opts.onMessage(data);
        } catch (err) {
          // parse error
        }
      };

      ws.onclose = () => {
        opts.onClose?.();
        if (!closedByUser) {
          reconnectTimer = window.setTimeout(() => void connect(), 3000);
        }
      };

      ws.onerror = () => {
        // error handling handled by close
      };
    } catch (err) {
      if (!closedByUser) {
        reconnectTimer = window.setTimeout(() => void connect(), 3000);
      }
    }
  };

  await connect();

  return {
    close: () => {
      closedByUser = true;
      if (reconnectTimer) window.clearTimeout(reconnectTimer);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    },
  };
};
