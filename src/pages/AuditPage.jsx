import React, { useEffect, useMemo, useState } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import PaginationComponent from "../component/PaginationComponent";
import IconButton from "../component/IconButton";
import SelectMenu from "../component/SelectMenu";

const itemsPerPage = 10;

const actionLabels = {
  LOGIN: "Inicio de sesion",
  CREATE: "Registro creado",
  UPDATE: "Registro actualizado",
  DELETE: "Registro eliminado",
  ARCHIVE: "Registro archivado",
  PURCHASE: "Compra registrada",
  SALE: "Venta registrada",
  RETURN: "Devolucion a proveedor",
  CUSTOMER_RETURN: "Devolucion de cliente",
  UPDATE_STATUS: "Cambio de estado",
  CARGA_INICIAL: "Carga inicial",
  INICIO_SESION: "Inicio de sesion",
  CREACION_PRODUCTO: "Producto registrado",
  COMPRA_REGISTRADA: "Compra registrada",
  VENTA_REGISTRADA: "Venta registrada",
  ALERTA_STOCK: "Alerta de stock",
  DEVOLUCION_PROVEEDOR: "Devolucion a proveedor",
  APROBACION_PENDIENTE: "Aprobacion pendiente",
  REVISION_DEVOLUCION: "Revision de devolucion",
  CONSULTA_REPORTE: "Consulta de reporte",
};

const entityLabels = {
  User: "Usuario",
  Product: "Producto",
  Category: "Categoria",
  Supplier: "Proveedor",
  Customer: "Cliente",
  Transaction: "Movimiento",
  Transaccion: "Movimiento",
  Report: "Reporte",
  Database: "Base de datos",
  Warehouse: "Almacen o sede",
  QualityRecord: "Calidad ISO 9001",
  ProductionOrder: "Orden de produccion",
};

const statusLabels = {
  PENDING: "Pendiente",
  PROCESSING: "En proceso",
  COMPLETED: "Completado",
  CANCELLED: "Cancelado",
};

const labelFor = (labels, value) => labels[value] || value || "-";

const detailFor = (log) => {
  if (!log.detail) return "Accion registrada.";
  if (log.action === "LOGIN") return "El usuario inicio sesion correctamente.";
  if (log.action === "UPDATE_STATUS") {
    return `El documento cambio a estado: ${statusLabels[log.detail] || log.detail}.`;
  }
  return log.detail;
};

const AuditPage = () => {
  const [logs, setLogs] = useState([]);
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [action, setAction] = useState("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const loadAudit = async () => {
      try {
        const response = await ApiService.getAuditLogs();
        setLogs(response.auditLogs || []);
      } catch (error) {
        setMessage(
          error.response?.data?.message ||
            "No se pudo cargar la auditoria del sistema."
        );
      }
    };

    loadAudit();
  }, []);

  const metrics = useMemo(() => {
    const users = new Set(logs.map((log) => log.userName).filter(Boolean));
    const entities = new Set(logs.map((log) => log.entity).filter(Boolean));
    return {
      events: logs.length,
      users: users.size,
      entities: entities.size,
    };
  }, [logs]);

  const actions = useMemo(
    () => [
      "ALL",
      ...Array.from(
        new Set(logs.map((log) => labelFor(actionLabels, log.action)).filter(Boolean))
      ),
    ],
    [logs]
  );

  const filteredLogs = useMemo(() => {
    const value = query.trim().toLowerCase();
    return logs.filter((log) => {
      const createdDate = log.createdAt ? new Date(log.createdAt).toISOString().slice(0, 10) : "";
      const actionLabel = labelFor(actionLabels, log.action);
      const entityLabel = labelFor(entityLabels, log.entity);
      const detail = detailFor(log);
      const text = [log.userName, log.action, actionLabel, log.entity, entityLabel, detail, log.ipAddress]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return (
        (!value || text.includes(value)) &&
        (action === "ALL" || actionLabel === action) &&
        (!dateFrom || createdDate >= dateFrom) &&
        (!dateTo || createdDate <= dateTo)
      );
    });
  }, [action, dateFrom, dateTo, logs, query]);

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const pagedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const updateFilter = (setter) => (value) => {
    setter(value);
    setCurrentPage(1);
  };

  return (
    <Layout>
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <p className="saas-kicker">Seguridad operativa</p>
          <h1 className="saas-title mt-1">Auditoria</h1>
          <p className="mt-2 text-sm text-[#647084]">
            Registro de acciones para trazabilidad, control interno y evidencia.
          </p>
        </div>

        {message && (
          <p className="rounded-md border border-[#f4c7c7] bg-[#fff4f4] px-4 py-3 text-sm font-semibold text-[#9b2c2c]">
            {message}
          </p>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Metric label="Eventos registrados" value={metrics.events} />
          <Metric label="Usuarios auditados" value={metrics.users} />
          <Metric label="Entidades afectadas" value={metrics.entities} />
        </div>

        <section className="saas-surface p-5">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.3fr_1fr_1fr_1fr_auto]">
            <label className="block">
              <span className="text-sm font-semibold text-[#344055]">Busqueda</span>
              <input
                value={query}
                onChange={(event) => updateFilter(setQuery)(event.target.value)}
                placeholder="Usuario, accion, entidad, detalle o IP"
                className="mt-2 h-11 w-full rounded-md border border-[#cfd6e2] px-3 text-sm outline-none transition focus:border-[#123c69] focus:ring-2 focus:ring-[#123c69]/10"
              />
            </label>
            <SelectMenu
              label="Accion"
              value={action}
              onChange={updateFilter(setAction)}
              options={actions.map((item) => [item, item === "ALL" ? "Todas" : item])}
            />
            <DateField label="Desde" value={dateFrom} onChange={updateFilter(setDateFrom)} />
            <DateField label="Hasta" value={dateTo} onChange={updateFilter(setDateTo)} />
            <IconButton
              icon="clear"
              label="Limpiar filtros"
              onClick={() => {
                setQuery("");
                setAction("ALL");
                setDateFrom("");
                setDateTo("");
                setCurrentPage(1);
              }}
              className="self-end"
            />
          </div>
        </section>

        {filteredLogs.length > 0 ? (
          <div className="saas-surface saas-table-scroll">
            <table className="saas-table min-w-full divide-y divide-[#d8dee8] text-sm">
              <thead className="bg-[#f8fafc]">
                <tr>
                  {["Fecha", "Usuario", "Accion", "Entidad", "Detalle", "IP"].map((header) => (
                    <th key={header} className="px-5 py-3 text-left font-bold text-[#526071]">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef2f6] bg-white">
                {pagedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#f8fafc]">
                    <td className="whitespace-nowrap px-5 py-4 text-[#647084]">
                      {log.createdAt ? new Date(log.createdAt).toLocaleString("es-PE") : "-"}
                    </td>
                    <td className="px-5 py-4 font-bold text-[#172033]">
                      {log.userName || "-"}
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded border border-[#bfd7ef] bg-[#e8f1fb] px-3 py-1 text-xs font-bold text-[#123c69]">
                        {labelFor(actionLabels, log.action)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[#647084]">
                      {labelFor(entityLabels, log.entity)}
                      {log.entityId ? ` #${log.entityId}` : ""}
                    </td>
                    <td data-wrap="true" className="min-w-80 px-5 py-4 text-[#647084]">{detailFor(log)}</td>
                    <td className="px-5 py-4 text-[#647084]">{log.ipAddress || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="saas-surface p-6 text-center text-[#647084]">
            No hay eventos de auditoria para los filtros seleccionados.
          </p>
        )}

        {filteredLogs.length > 0 && (
          <PaginationComponent
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </Layout>
  );
};

const Metric = ({ label, value }) => (
  <section className="saas-surface p-5">
    <p className="text-sm font-semibold text-[#526071]">{label}</p>
    <p className="mt-2 text-2xl font-bold text-[#172033]">{value}</p>
  </section>
);

const DateField = ({ label, value, onChange }) => (
  <label className="block">
    <span className="text-sm font-semibold text-[#344055]">{label}</span>
    <input
      type="date"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="mt-2 h-11 w-full rounded-md border border-[#cfd6e2] px-3 text-sm outline-none transition focus:border-[#123c69] focus:ring-2 focus:ring-[#123c69]/10"
    />
  </label>
);

export default AuditPage;
