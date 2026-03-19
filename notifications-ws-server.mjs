import http from "http";
import { WebSocketServer } from "ws";
import { URL } from "url";

const PORT = Number(process.env.WS_NOTIFICATIONS_PORT || 8081);
const PUBLISH_SECRET = String(process.env.WS_PUBLISH_SECRET || "");

const clientsByKey = new Map();

const addClient = (key, ws) => {
  if (!clientsByKey.has(key)) clientsByKey.set(key, new Set());
  clientsByKey.get(key).add(ws);
};

const removeClient = (key, ws) => {
  const set = clientsByKey.get(key);
  if (!set) return;
  set.delete(ws);
  if (set.size === 0) clientsByKey.delete(key);
};

const publishToKey = (key, message) => {
  const set = clientsByKey.get(key);
  if (!set) return 0;
  let sent = 0;
  const raw = JSON.stringify(message);
  for (const ws of set) {
    if (ws.readyState === ws.OPEN) {
      ws.send(raw);
      sent += 1;
    }
  }
  return sent;
};

const getClientKeyFromUrl = (url) => {
  const doctorId = String(url.searchParams.get("doctor_id") || "");
  if (doctorId) return { key: `doctor:${doctorId}`, role: "doctor", id: doctorId };

  const hospitalId = String(url.searchParams.get("hospital_id") || "");
  if (hospitalId) return { key: `staff_hospital:${hospitalId}`, role: "staff", id: hospitalId };

  const staffId = String(url.searchParams.get("staff_id") || "");
  if (staffId) return { key: `staff:${staffId}`, role: "staff", id: staffId };

  return null;
};

const readJsonBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const text = Buffer.concat(chunks).toString("utf8");
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

  if (req.method === "GET" && url.pathname === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, channels: clientsByKey.size }));
    return;
  }

  if (req.method === "GET" && url.pathname === "/debug") {
    const channels = [];
    for (const [key, set] of clientsByKey.entries()) {
      channels.push({ key, connections: set.size });
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, channels }));
    return;
  }

  if (url.pathname === "/publish") {
    if (req.method !== "POST") {
      res.writeHead(405, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: "Method not allowed" }));
      return;
    }

    if (PUBLISH_SECRET) {
      const secret = String(req.headers["x-ws-secret"] || "");
      if (secret !== PUBLISH_SECRET) {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, message: "Unauthorized" }));
        return;
      }
    }

    const body = await readJsonBody(req);
    const doctorId = body && (body.doctor_id ?? body.doctorId);
    const hospitalId = body && (body.hospital_id ?? body.hospitalId);
    const staffId = body && (body.staff_id ?? body.staffId);
    const event = body && (body.event ?? body.type);
    const payload = body && (body.payload ?? {});

    const target =
      doctorId
        ? { role: "doctor", id: String(doctorId), key: `doctor:${String(doctorId)}` }
        : hospitalId
          ? { role: "staff", id: String(hospitalId), key: `staff_hospital:${String(hospitalId)}` }
          : staffId
            ? { role: "staff", id: String(staffId), key: `staff:${String(staffId)}` }
            : null;

    if (!target || !event) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          success: false,
          message: "target id and event are required",
        })
      );
      return;
    }

    const message =
      target.role === "doctor"
        ? { event: String(event), doctor_id: target.id, payload }
        : target.key.startsWith("staff_hospital:")
          ? { event: String(event), hospital_id: target.id, payload }
          : { event: String(event), staff_id: target.id, payload };

    const sent = publishToKey(target.key, message);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: true, target: { role: target.role, id: target.id }, sent }));
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ success: false, message: "Not found" }));
});

const wss = new WebSocketServer({ server, path: "/ws" });

wss.on("connection", (ws, req) => {
  const url = new URL(req.url || "/ws", `http://${req.headers.host || "localhost"}`);
  const target = getClientKeyFromUrl(url);
  if (!target) {
    ws.close(1008, "doctor_id or hospital_id required");
    return;
  }

  addClient(target.key, ws);
  ws.on("close", () => removeClient(target.key, ws));
  ws.on("error", () => removeClient(target.key, ws));
});

server.listen(PORT, () => {
  process.stdout.write(`notifications-ws-server listening on http://localhost:${PORT}\n`);
});
