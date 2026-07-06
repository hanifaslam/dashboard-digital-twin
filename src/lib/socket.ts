import { io, Socket } from "socket.io-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
// Remove /api suffix for socket connection
const SOCKET_URL = API_URL.endsWith("/api") ? API_URL.slice(0, -4) : API_URL;

export const socket: Socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
  transports: ["websocket"],
});

if (process.env.NODE_ENV === "development") {
  socket.on("connect", () => {
    console.log("[Socket] Connected to", SOCKET_URL);
  });

  socket.on("disconnect", (reason) => {
    console.log("[Socket] Disconnected:", reason);
  });

  socket.on("connect_error", (error) => {
    console.error("[Socket] Connection error:", error);
  });
}

// Add system delay listener
socket.on("system-delay", (data) => {
  console.log(`⏱️ [Delay ${data.source}] ${data.delay_ms} ms`, data.details ? data.details : "");
});
