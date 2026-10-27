import React, { useEffect, useMemo, useState } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import { useNavigate, useParams } from "react-router-dom";
import {
  transactionStatusLabels,
  transactionTypeLabels,
  userRoleLabels,
} from "../constants/translations";
import { useConfirm } from "../component/confirmContext";
import { ValidatedSelect } from "../component/FormControls";

const currencyFormatter = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
});

const prefixes = {
  PURCHASE: "OC",
  SALE: "VT",
  RETURN_TO_SUPPLIER: "DV",
  RETURN_FROM_CUSTOMER: "DC",
};

const returnReasonLabels = {
  DEFECTIVE: "Producto defectuoso",
  WRONG_PRODUCT: "Producto incorrecto",
  CUSTOMER_CHANGE: "Cambio del cliente",
  EXPIRED: "Producto vencido",
};

const returnConditionLabels = {
  SELLABLE: "Buen estado: vuelve a stock",
  DAMAGED: "Danado: no vuelve a stock",
  EXPIRED: "Vencido: no vuelve a stock",
};

const TransactionDetailsPage = () => {
  const { transactionId } = useParams();
  const [transaction, setTransaction] = useState(null);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const confirm = useConfirm();

  useEffect(() => {
    const getTransaction = async () => {
      setLoading(true);
      try {
        const transactionData = await ApiService.getTransactionById(transactionId);
        if (transactionData.status === 200) {
          setTransaction(transactionData.transaction);
          setStatus(transactionData.transaction.status);
        }
      } catch (error) {
        showMessage(
          error.response?.data?.message || "No se pudo cargar la transaccion."
        );
      } finally {
        setLoading(false);
      }
    };

    getTransaction();
  }, [transactionId]);

  const documentMeta = useMemo(() => {
    if (!transaction) return null;
    const items =
      transaction.items?.length > 0
        ? transaction.items
        : [
            {
              product: transaction.product,
              quantity: Number(transaction.totalProducts || 0),
              unitPrice:
                transaction.totalProducts > 0
                  ? Number(transaction.totalPrice || 0) /
                    Number(transaction.totalProducts)
                  : Number(transaction.product?.price || 0),
              subtotal: Number(transaction.totalPrice || 0),
            },
          ].filter((item) => item.product);

    return {
      code: `${prefixes[transaction.transactionType] || "TRX"}-${String(
        transaction.id
      ).padStart(5, "0")}`,
      type:
        transactionTypeLabels[transaction.transactionType] ||
        transaction.transactionType,
      subtotal: Number(transaction.totalPrice || 0),
      quantity: Number(transaction.totalProducts || 0),
      items,
    };
  }, [transaction]);

  const handleUpdateStatus = async () => {
    const ok = await confirm({
      title: "Actualizar estado",
      message: status === "COMPLETED"
        ? "Completar este documento puede aplicar movimientos de stock pendientes. Desea continuar?"
        : "Se actualizara el estado del documento. Desea continuar?",
      confirmLabel: "Actualizar",
      tone: status === "CANCELLED" ? "danger" : status === "COMPLETED" ? "success" : "primary",
    });
    if (!ok) return;
    try {
      await ApiService.updateTransactionStatus(transactionId, status);
      navigate("/transaction");
    } catch (error) {
      showMessage(
        error.response?.data?.message || "No se pudo actualizar el estado."
      );
    }
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 4000);
  };

  return (
    <Layout>
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="saas-kicker">Documento operativo</p>
            <h1 className="saas-title mt-1">Detalle de transaccion</h1>
            <p className="mt-2 text-sm text-[#647084]">
              Vista auditable del movimiento, responsables, lineas y estado.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/transaction")}
            className="self-start rounded-md border border-[#cfd6e2] bg-white px-4 py-2 text-sm font-bold text-[#465366] hover:bg-[#f8fafc] md:self-auto"
          >
            Volver al listado
          </button>
        </div>

        {message && (
          <p className="rounded-md border border-[#f4c7c7] bg-[#fff4f4] px-4 py-3 text-sm font-semibold text-[#9b2c2c]">
            {message}
          </p>
        )}

        {loading && (
          <p className="saas-surface p-6 text-center text-[#647084]">
            Cargando informacion...
          </p>
        )}

        {transaction && documentMeta && (
          <>
            <section className="saas-surface">
              <div className="grid grid-cols-1 gap-6 border-b border-[#d8dee8] p-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <p className="text-sm font-bold uppercase text-[#647084]">
                    {documentMeta.type}
                  </p>
                  <h2 className="mt-2 text-3xl font-bold text-[#172033]">
                    {documentMeta.code}
                  </h2>
                  <p className="mt-3 max-w-3xl text-sm text-[#647084]">
                    {transaction.description || "Movimiento registrado en inventario."}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <InfoBox label="Estado" value={<StatusBadge status={transaction.status} />} />
                  <InfoBox
                    label="Fecha"
                    value={
                      transaction.createdAt
                        ? new Date(transaction.createdAt).toLocaleString("es-PE")
                        : "-"
                    }
                  />
                  <InfoBox label="Empresa" value={transaction.organizationName || "-"} />
                  <InfoBox label="Almacen / sede" value={transaction.warehouseLocation || "-"} />
                  <InfoBox
                    label="Actualizado"
                    value={
                      transaction.updateAt
                        ? new Date(transaction.updateAt).toLocaleString("es-PE")
                        : "-"
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-3">
                <PartyPanel
                  title="Usuario responsable"
                  lines={[
                    transaction.user?.name,
                    transaction.user?.email,
                    transaction.user?.phoneNumber,
                    userRoleLabels[transaction.user?.role] || transaction.user?.role,
                  ]}
                />
                <PartyPanel
                  title="Proveedor"
                  lines={[
                    transaction.supplier?.name || "No aplica",
                    transaction.supplier?.contactInfo,
                    transaction.supplier?.address,
                  ]}
                />
                <PartyPanel
                  title="Cliente"
                  lines={[
                    transaction.customer?.name || "No aplica",
                    transaction.customer?.documentNumber,
                    transaction.customer?.contactInfo,
                    transaction.customer?.address,
                  ]}
                />
                <section className="rounded-md border border-[#d8dee8] p-4 lg:col-span-3">
                  <h3 className="text-sm font-bold uppercase text-[#647084]">
                    Control de estado
                  </h3>
                  <div className="mt-4 flex gap-3">
                    <div className="min-w-0 flex-1">
                      <ValidatedSelect
                        label="Estado"
                        value={status}
                        onChange={setStatus}
                        required
                        options={[
                          ["PENDING", "Pendiente"],
                          ["PROCESSING", "En proceso"],
                          ["COMPLETED", "Completado"],
                          ["CANCELLED", "Cancelado"],
                        ]}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleUpdateStatus}
                      className="saas-button-primary self-end px-4 py-2 text-sm"
                    >
                      Guardar
                    </button>
                  </div>
                </section>
              </div>
            </section>

            <section className="saas-surface">
              <div className="border-b border-[#d8dee8] px-6 py-4">
                <h2 className="text-base font-bold text-[#172033]">
                  Detalle de lineas
                </h2>
              </div>
              <div className="saas-table-scroll">
                <table className="saas-table min-w-full divide-y divide-[#d8dee8] text-sm">
                  <thead className="bg-[#f8fafc]">
                    <tr>
                      {["Producto", "SKU", "Cantidad", "Precio unit.", "Total"].map(
                        (header) => (
                          <th
                            key={header}
                            className="px-6 py-3 text-left font-bold text-[#526071]"
                          >
                            {header}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eef2f6] bg-white">
                    {documentMeta.items.map((item, index) => (
                      <tr key={item.id || item.product?.id || index} className="hover:bg-[#f8fafc]">
                        <td className="min-w-72 px-6 py-4">
                          <p className="font-bold text-[#172033]">
                            {item.product?.name || "-"}
                          </p>
                          <p className="mt-1 text-xs text-[#647084]">
                            {item.product?.description || "Sin descripcion"}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-[#647084]">
                          {item.product?.sku || "-"}
                        </td>
                        <td className="px-6 py-4 text-[#647084]">
                          {item.quantity || 0}
                        </td>
                        <td className="px-6 py-4 font-semibold text-[#344055]">
                          {currencyFormatter.format(Number(item.unitPrice || 0))}
                        </td>
                        <td className="px-6 py-4 font-bold text-[#172033]">
                          {currencyFormatter.format(Number(item.subtotal || 0))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end border-t border-[#d8dee8] p-6">
                <div className="w-full max-w-sm space-y-3 text-sm">
                  <SummaryRow
                    label="Subtotal"
                    value={currencyFormatter.format(documentMeta.subtotal)}
                  />
                  <SummaryRow label="Impuestos" value="Incluido en operacion" />
                  <div className="border-t border-[#d8dee8] pt-3">
                    <SummaryRow
                      label="Total documento"
                      value={currencyFormatter.format(documentMeta.subtotal)}
                      strong
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="saas-surface p-6">
              <h2 className="text-base font-bold text-[#172033]">Observaciones</h2>
              {(transaction.returnReason || transaction.returnCondition) && (
                <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                  <InfoBox
                    label="Motivo devolucion"
                    value={
                      returnReasonLabels[transaction.returnReason] ||
                      transaction.returnReason ||
                      "-"
                    }
                  />
                  <InfoBox
                    label="Condicion"
                    value={
                      returnConditionLabels[transaction.returnCondition] ||
                      transaction.returnCondition ||
                      "-"
                    }
                  />
                </div>
              )}
              <p className="mt-3 text-sm text-[#647084]">
                {transaction.note || "Sin notas internas registradas."}
              </p>
            </section>
          </>
        )}
      </div>
    </Layout>
  );
};

const InfoBox = ({ label, value }) => (
  <div className="rounded-md border border-[#d8dee8] bg-[#f8fafc] p-3">
    <p className="text-xs font-bold uppercase text-[#647084]">{label}</p>
    <div className="mt-1 text-sm font-bold text-[#172033]">{value}</div>
  </div>
);

const PartyPanel = ({ title, lines }) => (
  <section className="rounded-md border border-[#d8dee8] p-4">
    <h3 className="text-sm font-bold uppercase text-[#647084]">{title}</h3>
    <div className="mt-3 space-y-1 text-sm text-[#647084]">
      {lines.filter(Boolean).map((line) => (
        <p key={line}>{line}</p>
      ))}
    </div>
  </section>
);

const SummaryRow = ({ label, value, strong = false }) => (
  <div className="flex items-center justify-between gap-4">
    <span className={strong ? "font-bold text-[#172033]" : "text-[#647084]"}>
      {label}
    </span>
    <span className={strong ? "text-lg font-bold text-[#172033]" : "font-bold text-[#172033]"}>
      {value}
    </span>
  </div>
);

const StatusBadge = ({ status }) => {
  const className =
    status === "COMPLETED"
      ? "border-[#bfe1d2] bg-[#edf7f3] text-[#2f6f73]"
      : status === "CANCELLED"
      ? "border-[#f4c7c7] bg-[#fff4f4] text-[#9b2c2c]"
      : status === "PROCESSING"
      ? "border-[#f3d49a] bg-[#fff8e8] text-[#8a5a10]"
      : "border-[#d8dee8] bg-[#f8fafc] text-[#526071]";

  return (
    <span className={`rounded border px-3 py-1 text-xs font-bold ${className}`}>
      {transactionStatusLabels[status] || status || "-"}
    </span>
  );
};

export default TransactionDetailsPage;
