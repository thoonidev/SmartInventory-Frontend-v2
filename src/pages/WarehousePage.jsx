import React, { useEffect, useMemo, useState } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import IconButton from "../component/IconButton";
import { firstValidationError, isBlank, isSku } from "../utils/validation";
import { useConfirm } from "../component/confirmContext";
import { ValidatedField, ValidatedSelect } from "../component/FormControls";

const emptyForm = {
  name: "",
  code: "",
  type: "WAREHOUSE",
  address: "",
  managerName: "",
  active: true,
};

const typeLabels = {
  MAIN: "Sede principal",
  WAREHOUSE: "Almacen",
  STORE: "Punto de despacho",
  QUALITY: "Area de calidad",
};

const WarehousePage = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const isAdmin = ApiService.isAdmin();
  const confirm = useConfirm();

  const loadWarehouses = async () => {
    try {
      const response = await ApiService.getWarehouses();
      setWarehouses(response.warehouses || []);
    } catch (error) {
      setMessage(error.response?.data?.message || "No se pudo cargar almacenes y sedes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWarehouses();
  }, []);

  const metrics = useMemo(() => {
    const active = warehouses.filter((item) => item.active !== false).length;
    const dispatch = warehouses.filter((item) => item.type === "STORE").length;
    return { total: warehouses.length, active, dispatch };
  }, [warehouses]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    const validationMessage = firstValidationError([
      { valid: !isBlank(form.name), message: "Ingrese el nombre del almacen o sede." },
      { valid: isSku(form.code), message: "Ingrese un codigo valido de 2 a 30 caracteres." },
      { valid: Object.keys(typeLabels).includes(form.type), message: "Seleccione un tipo de ubicacion valido." },
    ]);
    if (validationMessage) {
      setMessage(validationMessage);
      return;
    }
    if (editingId && form.active === false) {
      const ok = await confirm({
        title: "Desactivar ubicacion",
        message: `Desactivar ${form.name}? Esta ubicacion dejara de aparecer como almacen disponible.`,
        confirmLabel: "Desactivar",
        tone: "danger",
      });
      if (!ok) return;
    }
    try {
      if (editingId) {
        await ApiService.updateWarehouse(editingId, form);
        setMessage("Almacen o sede actualizado correctamente.");
      } else {
        await ApiService.createWarehouse(form);
        setMessage("Almacen o sede registrado correctamente.");
      }
      resetForm();
      await loadWarehouses();
    } catch (error) {
      setMessage(error.response?.data?.message || "No se pudo guardar la informacion.");
    }
  };

  const editWarehouse = (warehouse) => {
    setEditingId(warehouse.id);
    setForm({
      name: warehouse.name || "",
      code: warehouse.code || "",
      type: warehouse.type || "WAREHOUSE",
      address: warehouse.address || "",
      managerName: warehouse.managerName || "",
      active: warehouse.active !== false,
    });
  };

  const deleteWarehouse = async (warehouse) => {
    const ok = await confirm({
      title: "Archivar ubicacion",
      message: `Archivar ${warehouse.name}? Dejaria de aparecer como almacen disponible y se conservara el historial.`,
      confirmLabel: "Archivar",
      tone: "danger",
    });
    if (!ok) return;
    try {
      await ApiService.deleteWarehouse(warehouse.id);
      setMessage("Almacen o sede archivado correctamente.");
      await loadWarehouses();
    } catch (error) {
      setMessage(error.response?.data?.message || "No se pudo archivar el registro.");
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <p className="saas-kicker">Operacion multi sede</p>
          <h1 className="saas-title mt-1">Almacenes y sedes</h1>
          <p className="mt-2 text-sm text-[#647084]">
            Organiza los puntos fisicos donde se almacena, revisa y despacha inventario.
          </p>
        </div>

        {message && (
          <p className="rounded-md border border-[#bfd7ef] bg-[#e8f1fb] px-4 py-3 text-sm font-semibold text-[#123c69]">
            {message}
          </p>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Metric label="Ubicaciones registradas" value={metrics.total} />
          <Metric label="Ubicaciones activas" value={metrics.active} />
          <Metric label="Puntos de despacho" value={metrics.dispatch} />
        </div>

        {isAdmin && (
          <section className="saas-surface p-5">
            <h2 className="text-lg font-bold text-[#172033]">
              {editingId ? "Editar ubicacion" : "Nueva ubicacion"}
            </h2>
            <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-6">
              <ValidatedField label="Nombre" value={form.name} onChange={(value) => updateField("name", value)} required validator={(value) => !isBlank(value)} errorMessage="Ingrese el nombre." className="lg:col-span-2" />
              <ValidatedField label="Codigo" value={form.code} onChange={(value) => updateField("code", value)} required validator={isSku} errorMessage="Use 2 a 30 caracteres validos." />
              <ValidatedSelect
                label="Tipo"
                value={form.type}
                onChange={(value) => updateField("type", value)}
                options={Object.entries(typeLabels)}
                required
              />
              <ValidatedField label="Responsable" value={form.managerName} onChange={(value) => updateField("managerName", value)} className="lg:col-span-2" />
              <ValidatedField label="Direccion" value={form.address} onChange={(value) => updateField("address", value)} className="lg:col-span-4" />
              <label className="flex items-end gap-3 pb-3 text-sm font-semibold text-[#344055]">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(event) => updateField("active", event.target.checked)}
                  className="h-4 w-4 rounded border-[#cfd6e2]"
                />
                Activa
              </label>
              <div className="flex items-end gap-2">
                <button type="submit" className="saas-button-primary h-11 px-4 text-sm">
                  {editingId ? "Guardar cambios" : "Crear ubicacion"}
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
          <p className="saas-surface p-6 text-center text-[#647084]">Cargando ubicaciones...</p>
        ) : warehouses.length ? (
          <div className="saas-surface saas-table-scroll">
            <table className="saas-table min-w-full divide-y divide-[#d8dee8] text-sm">
              <thead className="bg-[#f8fafc]">
                <tr>
                  {["Codigo", "Nombre", "Tipo", "Direccion", "Responsable", "Estado", isAdmin ? "Acciones" : null].filter(Boolean).map((header) => (
                    <th key={header} className="px-5 py-3 text-left font-bold text-[#526071]">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef2f6] bg-white">
                {warehouses.map((warehouse) => (
                  <tr key={warehouse.id} className="hover:bg-[#f8fafc]">
                    <td className="whitespace-nowrap px-5 py-4 font-bold text-[#172033]">{warehouse.code}</td>
                    <td className="min-w-56 px-5 py-4 font-bold text-[#172033]">{warehouse.name}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-[#647084]">{typeLabels[warehouse.type] || warehouse.type}</td>
                    <td className="min-w-72 px-5 py-4 text-[#647084]">{warehouse.address || "-"}</td>
                    <td className="min-w-48 px-5 py-4 text-[#647084]">{warehouse.managerName || "-"}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded border px-3 py-1 text-xs font-bold ${warehouse.active !== false ? "border-[#bfe1d2] bg-[#edf7f3] text-[#2f6f73]" : "border-[#d8dee8] bg-[#f8fafc] text-[#647084]"}`}>
                        {warehouse.active !== false ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="whitespace-nowrap px-5 py-4">
                        <div className="flex gap-2">
                          <IconButton icon="edit" label="Editar" onClick={() => editWarehouse(warehouse)} />
                          <IconButton icon="delete" label="Archivar" variant="danger" onClick={() => deleteWarehouse(warehouse)} />
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="saas-surface p-6 text-center text-[#647084]">Aun no hay almacenes ni sedes registradas.</p>
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

export default WarehousePage;
