import React, { useEffect, useMemo, useState } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import IconButton from "../component/IconButton";
import SelectMenu from "../component/SelectMenu";
import { firstValidationError, isBlank, isNonNegativeNumber, isPositiveNumber, isSku } from "../utils/validation";
import { useConfirm } from "../component/confirmContext";
import { ValidatedField, ValidatedSelect, ValidatedTextArea } from "../component/FormControls";

const emptyForm = {
  code: "",
  productId: "",
  productName: "",
  plannedQuantity: "",
  completedQuantity: "",
  status: "PLANNED",
  startDate: "",
  dueDate: "",
  notes: "",
};

const statusLabels = {
  PLANNED: "Planificada",
  IN_PROGRESS: "En proceso",
  DONE: "Terminada",
  PAUSED: "Pausada",
  CANCELLED: "Cancelada",
};

const ProductionPage = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const canOperate = ApiService.isAdmin() || ApiService.isManager();
  const isAdmin = ApiService.isAdmin();
  const confirm = useConfirm();

  const loadOrders = async () => {
    try {
      const [ordersResponse, productsResponse] = await Promise.all([
        ApiService.getProductionOrders(),
        ApiService.getAllProducts(),
      ]);
      setOrders(ordersResponse.productionOrders || []);
      setProducts(productsResponse.products || []);
    } catch (error) {
      setMessage(error.response?.data?.message || "No se pudo cargar produccion.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const metrics = useMemo(() => {
    const progressValues = orders.map(progressOf).filter((value) => value > 0);
    const average = progressValues.length
      ? Math.round(progressValues.reduce((sum, value) => sum + value, 0) / progressValues.length)
      : 0;
    return {
      planned: orders.filter((item) => item.status === "PLANNED").length,
      active: orders.filter((item) => item.status === "IN_PROGRESS").length,
      average,
    };
  }, [orders]);

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const payload = {
    ...form,
    productId: form.productId ? Number(form.productId) : null,
    plannedQuantity: Number(form.plannedQuantity || 0),
    completedQuantity: Number(form.completedQuantity || 0),
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    const validationMessage = firstValidationError([
      { valid: isSku(form.code), message: "Ingrese un codigo de orden valido." },
      { valid: !isBlank(form.productName), message: "Ingrese el nombre operativo del producto." },
      { valid: isPositiveNumber(form.plannedQuantity), message: "La cantidad planificada debe ser mayor a cero." },
      { valid: form.completedQuantity === "" || isNonNegativeNumber(form.completedQuantity), message: "La cantidad terminada no puede ser negativa." },
      { valid: !form.startDate || !form.dueDate || form.dueDate >= form.startDate, message: "La entrega estimada no puede ser anterior al inicio." },
      { valid: Object.keys(statusLabels).includes(form.status), message: "Seleccione un estado valido." },
    ]);
    if (validationMessage) {
      setMessage(validationMessage);
      return;
    }
    if (form.status === "DONE") {
      const ok = await confirm({
        title: "Terminar orden",
        message: "Marcar la orden como terminada puede aumentar el stock del producto. Desea continuar?",
        confirmLabel: "Terminar orden",
        tone: "success",
      });
      if (!ok) return;
    }
    try {
      if (editingId) {
        await ApiService.updateProductionOrder(editingId, payload);
        setMessage("Orden de produccion actualizada correctamente.");
      } else {
        await ApiService.createProductionOrder(payload);
        setMessage("Orden de produccion creada correctamente.");
      }
      resetForm();
      await loadOrders();
    } catch (error) {
      setMessage(error.response?.data?.message || "No se pudo guardar la orden de produccion.");
    }
  };

  const editOrder = (order) => {
    setEditingId(order.id);
    setForm({
      code: order.code || "",
      productId: order.productId ? String(order.productId) : "",
      productName: order.productName || "",
      plannedQuantity: order.plannedQuantity ?? "",
      completedQuantity: order.completedQuantity ?? "",
      status: order.status || "PLANNED",
      startDate: order.startDate || "",
      dueDate: order.dueDate || "",
      notes: order.notes || "",
    });
  };

  const deleteOrder = async (order) => {
    const ok = await confirm({
      title: "Archivar orden",
      message: `Archivar ${order.code}? La orden saldra de la vista operativa y se conservara su historial.`,
      confirmLabel: "Archivar",
      tone: "danger",
    });
    if (!ok) return;
    try {
      await ApiService.deleteProductionOrder(order.id);
      setMessage("Orden de produccion archivada correctamente.");
      await loadOrders();
    } catch (error) {
      setMessage(error.response?.data?.message || "No se pudo archivar la orden.");
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <p className="saas-kicker">Manufactura ligera</p>
          <h1 className="saas-title mt-1">Produccion</h1>
          <p className="mt-2 text-sm text-[#647084]">
            Planifica kits, reprocesos y preparaciones internas antes del despacho.
          </p>
        </div>

        {message && (
          <p className="rounded-md border border-[#bfd7ef] bg-[#e8f1fb] px-4 py-3 text-sm font-semibold text-[#123c69]">
            {message}
          </p>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Metric label="Planificadas" value={metrics.planned} />
          <Metric label="En proceso" value={metrics.active} />
          <Metric label="Avance promedio" value={`${metrics.average}%`} />
        </div>

        {canOperate && (
          <section className="saas-surface p-5">
            <h2 className="text-lg font-bold text-[#172033]">
              {editingId ? "Editar orden" : "Nueva orden"}
            </h2>
            <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-6">
              <ValidatedField label="Codigo" value={form.code} onChange={(value) => updateField("code", value)} required validator={isSku} errorMessage="Ingrese un codigo valido." />
              <SelectMenu
                label="Producto terminado"
                value={form.productId}
                onChange={(value) => {
                  const product = products.find((item) => String(item.id) === String(value));
                  updateField("productId", value);
                  updateField("productName", product?.name || "");
                }}
                options={[
                  ["", "Seleccione un producto"],
                  ...products.map((product) => [
                    String(product.id),
                    `${product.name} - ${product.sku || "sin SKU"}`,
                  ]),
                ]}
              />
              <ValidatedField label="Nombre operativo" value={form.productName} onChange={(value) => updateField("productName", value)} required validator={(value) => !isBlank(value)} errorMessage="Ingrese el nombre operativo." className="lg:col-span-2" />
              <ValidatedField label="Cantidad planificada" type="number" value={form.plannedQuantity} onChange={(value) => updateField("plannedQuantity", value)} required validator={isPositiveNumber} errorMessage="Debe ser mayor a cero." min="1" />
              <ValidatedField label="Cantidad terminada" type="number" value={form.completedQuantity} onChange={(value) => updateField("completedQuantity", value)} validator={(value) => value === "" || isNonNegativeNumber(value)} errorMessage="No puede ser negativa." min="0" />
              <ValidatedSelect label="Estado" value={form.status} onChange={(value) => updateField("status", value)} options={Object.entries(statusLabels)} required />
              <ValidatedField label="Inicio" type="date" value={form.startDate} onChange={(value) => updateField("startDate", value)} />
              <ValidatedField label="Entrega estimada" type="date" value={form.dueDate} onChange={(value) => updateField("dueDate", value)} validator={(value) => !form.startDate || !value || value >= form.startDate} errorMessage="No puede ser anterior al inicio." />
              <ValidatedTextArea label="Notas" value={form.notes} onChange={(value) => updateField("notes", value)} className="lg:col-span-4" />
              <div className="flex items-end gap-2 lg:col-span-6">
                <button type="submit" className="saas-button-primary h-11 px-4 text-sm">
                  {editingId ? "Guardar cambios" : "Crear orden"}
                </button>
                {editingId && (
                  <button type="button" onClick={resetForm} className="saas-button-secondary h-11 px-4 text-sm">
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </section>
        )}

        {loading ? (
          <p className="saas-surface p-6 text-center text-[#647084]">Cargando produccion...</p>
        ) : orders.length ? (
          <div className="saas-surface saas-table-scroll">
            <table className="saas-table min-w-full divide-y divide-[#d8dee8] text-sm">
              <thead className="bg-[#f8fafc]">
                <tr>
                  {["Codigo", "Producto", "Planificado", "Terminado", "Avance", "Estado", "Fechas", canOperate || isAdmin ? "Acciones" : null].filter(Boolean).map((header) => (
                    <th key={header} className="px-5 py-3 text-left font-bold text-[#526071]">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef2f6] bg-white">
                {orders.map((order) => {
                  const progress = progressOf(order);
                  return (
                    <tr key={order.id} className="hover:bg-[#f8fafc]">
                      <td className="whitespace-nowrap px-5 py-4 font-bold text-[#172033]">{order.code}</td>
                      <td className="min-w-72 px-5 py-4">
                        <p className="font-bold text-[#172033]">{order.productName}</p>
                        <p className="mt-1 line-clamp-2 text-xs text-[#647084]">
                          {order.productSku ? `${order.productSku} | ` : ""}{order.notes || "-"}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-[#647084]">{order.plannedQuantity || 0}</td>
                      <td className="px-5 py-4 text-[#647084]">{order.completedQuantity || 0}</td>
                      <td className="min-w-44 px-5 py-4">
                        <div className="h-2 rounded-full bg-[#eef2f6]">
                          <div className="h-2 rounded-full bg-[#2f6f73]" style={{ width: `${Math.min(progress, 100)}%` }} />
                        </div>
                        <p className="mt-2 text-xs font-bold text-[#526071]">{progress}%</p>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4"><Badge value={statusLabels[order.status] || order.status} tone={order.status === "DONE" ? "success" : "info"} /></td>
                      <td className="whitespace-nowrap px-5 py-4 text-[#647084]">
                        {order.startDate || "-"} / {order.dueDate || "-"}
                      </td>
                      {(canOperate || isAdmin) && (
                        <td className="whitespace-nowrap px-5 py-4">
                          <div className="flex gap-2">
                            {canOperate && <IconButton icon="edit" label="Editar" onClick={() => editOrder(order)} />}
                            {isAdmin && <IconButton icon="delete" label="Archivar" variant="danger" onClick={() => deleteOrder(order)} />}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="saas-surface p-6 text-center text-[#647084]">Aun no hay ordenes de produccion.</p>
        )}
      </div>
    </Layout>
  );
};

const progressOf = (order) => {
  const planned = Number(order.plannedQuantity || 0);
  const completed = Number(order.completedQuantity || 0);
  if (!planned) return 0;
  return Math.round((completed / planned) * 100);
};

const Metric = ({ label, value }) => (
  <section className="saas-surface p-5">
    <p className="text-sm font-semibold text-[#526071]">{label}</p>
    <p className="mt-2 text-2xl font-bold text-[#172033]">{value}</p>
  </section>
);

const Badge = ({ value, tone }) => {
  const tones = {
    success: "border-[#bfe1d2] bg-[#edf7f3] text-[#2f6f73]",
    info: "border-[#bfd7ef] bg-[#e8f1fb] text-[#123c69]",
  };
  return <span className={`rounded border px-3 py-1 text-xs font-bold ${tones[tone] || tones.info}`}>{value}</span>;
};

export default ProductionPage;
