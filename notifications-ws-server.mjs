import http from "http";
import { WebSocketServer } from "ws";
import { URL } from "url";

const PORT = Number(process.env.WS_NOTIFICATIONS_PORT || 8081);
const PUBLISH_SECRET = String(process.env.WS_PUBLISH_SECRET || "");

const doctorClients = new Map();

const addClient = (doctorId, ws) => {
  if (!doctorClients.has(doctorId)) doctorClients.set(doctorId, new Set());
  doctorClients.get(doctorId).add(ws);
};

const removeClient = (doctorId, ws) => {
  const set = doctorClients.get(doctorId);
  if (!set) return;
  set.delete(ws);
  if (set.size === 0) doctorClients.delete(doctorId);
};

const publishToDoctor = (doctorId, message) => {
  const set = doctorClients.get(doctorId);
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
    res.end(JSON.stringify({ ok: true, doctors: doctorClients.size }));
    return;
  }

  if (req.method === "GET" && url.pathname === "/debug") {
    const doctors = [];
    for (const [doctor_id, set] of doctorClients.entries()) {
      doctors.push({ doctor_id, connections: set.size });
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, doctors }));
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
    const event = body && (body.event ?? body.type);
    const payload = body && (body.payload ?? {});

    if (!doctorId || !event) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: "doctor_id and event are required" }));
      return;
    }

    const did = String(doctorId);
    const sent = publishToDoctor(did, { event: String(event), doctor_id: did, payload });

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: true, doctor_id: did, sent }));
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ success: false, message: "Not found" }));
});

const wss = new WebSocketServer({ server, path: "/ws" });

wss.on("connection", (ws, req) => {
  const url = new URL(req.url || "/ws", `http://${req.headers.host || "localhost"}`);
  const doctorId = String(url.searchParams.get("doctor_id") || "");
  if (!doctorId) {
    ws.close(1008, "doctor_id required");
    return;
  }

  addClient(doctorId, ws);
  ws.on("close", () => removeClient(doctorId, ws));
  ws.on("error", () => removeClient(doctorId, ws));
});

server.listen(PORT, () => {
  process.stdout.write(`notifications-ws-server listening on http://localhost:${PORT}\n`);
});
