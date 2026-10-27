import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../service/ApiService";
import LiveService from "../service/LiveService";

const typeLabels = {
  STOCK_ALERT: "Alerta de stock",
  APPROVAL_PENDING: "Aprobacion pendiente",
  RETURN_REVIEW: "Revision de devolucion",
};

const playSoftPing = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = 720;
    gain.gain.value = 0.04;
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.12);
  } catch {
    // El navegador puede bloquear audio hasta que haya interaccion del usuario.
  }
};

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    let socket;

    const load = async () => {
      try {
        const response = await ApiService.getNotifications();
        if (active) setNotifications(response.notifications || []);
      } catch {
        if (active) setNotifications([]);
      }
    };

    load();
    socket = LiveService.connect({
      channel: "notifications",
      onEvent: (event) => {
        if (!active || event.type !== "NOTIFICATION") return;
        setNotifications((current) => [
          {
            id: event.data?.notificationId || `${Date.now()}`,
            type: event.data?.notificationType || "NOTIFICATION",
            title: event.title,
            message: event.message,
            severity: event.severity,
            read: false,
            createdAt: event.createdAt || new Date().toISOString(),
          },
          ...current,
        ]);
        playSoftPing();
      },
    });

    return () => {
      active = false;
      socket?.close();
    };
  }, []);

  const unread = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  const preview = notifications.slice(0, 5);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        title="Notificaciones"
        aria-label="Notificaciones"
        className="relative inline-grid h-10 w-10 place-items-center rounded-md border border-[#cfd6e2] bg-white text-[#465366] hover:bg-[#f8fafc]"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
        </svg>
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-[#9b2c2c] px-1.5 text-center text-[11px] font-black text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-40 w-80 overflow-hidden rounded-md border border-[#d8dee8] bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-[#eef2f6] px-4 py-3">
            <p className="text-sm font-bold text-[#172033]">Notificaciones</p>
            <span className="text-xs font-semibold text-[#647084]">{unread} sin leer</span>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {preview.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-[#647084]">Sin avisos recientes.</p>
            ) : (
              preview.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    navigate("/notifications");
                  }}
                  className={`block w-full border-b border-[#eef2f6] px-4 py-3 text-left hover:bg-[#f8fafc] ${
                    notification.read ? "bg-white" : "bg-[#e8f1fb]"
                  }`}
                >
                  <span className="text-xs font-bold uppercase text-[#526071]">
                    {typeLabels[notification.type] || "Aviso"}
                  </span>
                  <span className="mt-1 block text-sm font-bold text-[#172033]">
                    {notification.title}
                  </span>
                  <span className="mt-1 line-clamp-2 block text-xs text-[#647084]">
                    {notification.message}
                  </span>
                </button>
              ))
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              navigate("/notifications");
            }}
            className="block w-full bg-[#f8fafc] px-4 py-3 text-center text-sm font-bold text-[#123c69] hover:bg-[#eef2f6]"
          >
            Ver todas
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
