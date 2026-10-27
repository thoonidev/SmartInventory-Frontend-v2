import ApiService from "./ApiService";

export default class LiveService {
  static connect({ onEvent, onStatus, channel = "live" }) {
    const token = ApiService.getToken();
    if (!token) {
      onStatus?.("DISCONNECTED");
      return { close: () => {} };
    }

    const socketUrl = ApiService.BASE_URL.replace(/^http/, "ws").replace("/api", "");
    const socket = new WebSocket(
      `${socketUrl}/ws/live?token=${encodeURIComponent(token)}&channel=${encodeURIComponent(channel)}`
    );

    socket.onopen = () => onStatus?.("CONNECTED");
    socket.onclose = () => onStatus?.("DISCONNECTED");
    socket.onerror = () => onStatus?.("ERROR");
    socket.onmessage = (message) => {
      try {
        onEvent?.(JSON.parse(message.data));
      } catch {
        onEvent?.({
          type: "RAW",
          title: "Evento recibido",
          message: message.data,
          severity: "INFO",
          createdAt: new Date().toISOString(),
        });
      }
    };

    return socket;
  }
}
