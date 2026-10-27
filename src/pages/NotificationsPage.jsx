import React, { useEffect, useState } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";

const severityClass = {
  SUCCESS: "border-[#bfe1d2] bg-[#edf7f3] text-[#2f6f73]",
  INFO: "border-[#bfd7ef] bg-[#e8f1fb] text-[#123c69]",
  WARNING: "border-[#f3d49a] bg-[#fff8e8] text-[#8a5a10]",
  DANGER: "border-[#f4c7c7] bg-[#fff4f4] text-[#9b2c2c]",
};

const notificationTypeLabels = {
  STOCK_ALERT: "Alerta de stock",
  APPROVAL_PENDING: "Aprobacion pendiente",
  RETURN_REVIEW: "Revision de devolucion",
  TRANSACTION_CREATED: "Movimiento registrado",
  TRANSACTION_STATUS_UPDATED: "Estado actualizado",
  PRODUCT_CREATED: "Producto registrado",
  PRODUCT_UPDATED: "Producto actualizado",
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [message, setMessage] = useState("");

  const loadNotifications = async () => {
    try {
      const response = await ApiService.getNotifications();
      setNotifications(response.notifications || []);
    } catch (error) {
      showMessage(error.response?.data?.message || "No se pudieron cargar notificaciones.");
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 4000);
  };

  const markAsRead = async (notificationId) => {
    try {
      await ApiService.markNotificationAsRead(notificationId);
      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId ? { ...notification, read: true } : notification
        )
      );
    } catch (error) {
      showMessage(error.response?.data?.message || "No se pudo actualizar la notificacion.");
    }
  };

  const markAllAsRead = async () => {
    try {
      await ApiService.markAllNotificationsAsRead();
      setNotifications((current) =>
        current.map((notification) => ({ ...notification, read: true }))
      );
    } catch (error) {
      showMessage(error.response?.data?.message || "No se pudieron actualizar las notificaciones.");
    }
  };

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  return (
    <Layout>
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="saas-kicker">Centro de avisos</p>
            <h1 className="saas-title mt-1">Notificaciones</h1>
            <p className="mt-2 text-sm text-[#647084]">
              {unreadCount} notificaciones sin leer.
            </p>
          </div>
          <button
            type="button"
            onClick={markAllAsRead}
            className="saas-button-primary self-start px-4 py-2 text-sm"
          >
            Marcar todo como leido
          </button>
        </div>

        {message && (
          <p className="rounded-md border border-[#f4c7c7] bg-[#fff4f4] px-4 py-3 text-sm font-semibold text-[#9b2c2c]">
            {message}
          </p>
        )}

        <section className="saas-surface overflow-hidden">
          {notifications.length === 0 ? (
            <p className="p-8 text-center text-[#647084]">No hay notificaciones registradas.</p>
          ) : (
            <div className="divide-y divide-[#eef2f6]">
              {notifications.map((notification) => (
                <article
                  key={notification.id}
                  className={`grid grid-cols-1 gap-3 p-5 md:grid-cols-[1fr_auto] ${
                    notification.read ? "bg-white" : "bg-[#e8f1fb]"
                  }`}
                >
                  <div>
                    <span
                      className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${
                        severityClass[notification.severity] || severityClass.INFO
                      }`}
                    >
                      {notificationTypeLabels[notification.type] || "Aviso"}
                    </span>
                    <h2 className="mt-3 text-base font-bold text-[#172033]">
                      {notification.title}
                    </h2>
                    <p className="mt-1 text-sm text-[#647084]">{notification.message}</p>
                    <p className="mt-2 text-xs text-[#647084]">
                      {notification.createdAt
                        ? new Date(notification.createdAt).toLocaleString("es-PE")
                        : "-"}
                    </p>
                  </div>
                  {!notification.read && (
                    <button
                      type="button"
                      onClick={() => markAsRead(notification.id)}
                      className="self-start rounded-md border border-[#cfd6e2] bg-white px-3 py-2 text-xs font-bold text-[#123c69] hover:bg-[#f8fafc]"
                    >
                      Marcar leida
                    </button>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default NotificationsPage;
