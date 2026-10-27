import React, { useEffect, useMemo, useState } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import IconButton from "../component/IconButton";
import { firstValidationError, isBlank, isSku } from "../utils/validation";
import { useConfirm } from "../component/confirmContext";
import { ValidatedField, ValidatedSelect, ValidatedTextArea } from "../component/FormControls";

const emptyForm = {
  code: "",
  processArea: "",
  referenceDocument: "",
  findingType: "INSPECTION",
  severity: "MEDIUM",
  status: "OPEN",
  responsibleName: "",
  dueDate: "",
  description: "",
  correctiveAction: "",
};

const findingLabels = {
  INSPECTION: "Inspeccion",
  NON_CONFORMITY: "No conformidad",
  CORRECTIVE_ACTION: "Accion correctiva",
  DOCUMENT_REVIEW: "Revision documental",
};

const severityLabels = {
  LOW: "Baja",
  MEDIUM: "Media",
  HIGH: "Alta",
  CRITICAL: "Critica",
};

const statusLabels = {
  OPEN: "Abierto",
  IN_PROGRESS: "En seguimiento",
  CLOSED: "Cerrado",
};

const QualityPage = () => {
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const canOperate = ApiService.isAdmin() || ApiService.isManager();
  const isAdmin = ApiService.isAdmin();
  const confirm = useConfirm();

  const loadRecords = async () => {
    try {
      const response = await ApiService.getQualityRecords();
      setRecords(response.qualityRecords || []);
    } catch (error) {
      setMessage(error.response?.data?.message || "No se pudo cargar calidad.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const metrics = useMemo(() => ({
    open: records.filter((item) => item.status !== "CLOSED").length,
    critical: records.filter((item) => item.severity === "CRITICAL" || item.severity === "HIGH").length,
    closed: records.filter((item) => item.status === "CLOSED").length,
  }), [records]);

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    const validationMessage = firstValidationError([
      { valid: isSku(form.code), message: "Ingrese un codigo de calidad valido." },
      { valid: !isBlank(form.processArea), message: "Ingrese el area o proceso." },
      { valid: !isBlank(form.responsibleName), message: "Ingrese el responsable del registro de calidad." },
      { valid: Object.keys(findingLabels).includes(form.findingType), message: "Seleccione un tipo de hallazgo valido." },
      { valid: Object.keys(severityLabels).includes(form.severity), message: "Seleccione una severidad valida." },
      { valid: Object.keys(statusLabels).includes(form.status), message: "Seleccione un estado valido." },
      { valid: form.status !== "CLOSED" || !isBlank(form.correctiveAction), message: "Para cerrar el caso registre la accion correctiva." },
    ]);
    if (validationMessage) {
      setMessage(validationMessage);
      return;
    }
    if (form.status === "CLOSED") {
      const ok = await confirm({
        title: "Cerrar registro de calidad",
        message: "Cerrar este registro confirma que la accion correctiva fue atendida. Desea continuar?",
        confirmLabel: "Cerrar registro",
        tone: "success",
      });
      if (!ok) return;
    }
    try {
      if (editingId) {
        await ApiService.updateQualityRecord(editingId, form);
        setMessage("Registro de calidad actualizado correctamente.");
      } else {
        await ApiService.createQualityRecord(form);
        setMessage("Registro de calidad creado correctamente.");
      }
      resetForm();
      await loadRecords();
    } catch (error) {
      setMessage(error.response?.data?.message || "No se pudo guardar el registro de calidad.");
    }
  };

  const editRecord = (record) => {
    setEditingId(record.id);
    setForm({
      code: record.code || "",
      processArea: record.processArea || "",
      referenceDocument: record.referenceDocument || "",
      findingType: record.findingType || "INSPECTION",
      severity: record.severity || "MEDIUM",
      status: record.status || "OPEN",
      responsibleName: record.responsibleName || "",
      dueDate: record.dueDate || "",
      description: record.description || "",
      correctiveAction: record.correctiveAction || "",
    });
  };

  const deleteRecord = async (record) => {
    const ok = await confirm({
      title: "Archivar registro",
      message: `Archivar ${record.code}? El caso saldra de la vista operativa y se conservara para trazabilidad.`,
      confirmLabel: "Archivar",
      tone: "danger",
    });
    if (!ok) return;
    try {
      await ApiService.deleteQualityRecord(record.id);
      setMessage("Registro de calidad archivado correctamente.");
      await loadRecords();
    } catch (error) {
      setMessage(error.response?.data?.message || "No se pudo archivar el registro.");
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <p className="saas-kicker">Gestion de calidad</p>
          <h1 className="saas-title mt-1">Calidad ISO 9001</h1>
          <p className="mt-2 text-sm text-[#647084]">
            Control de hallazgos, no conformidades y acciones correctivas del proceso.
          </p>
        </div>

        {message && (
          <p className="rounded-md border border-[#bfd7ef] bg-[#e8f1fb] px-4 py-3 text-sm font-semibold text-[#123c69]">
            {message}
          </p>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Metric label="Casos abiertos" value={metrics.open} />
          <Metric label="Prioridad alta" value={metrics.critical} />
          <Metric label="Casos cerrados" value={metrics.closed} />
        </div>

        {canOperate && (
          <section className="saas-surface p-5">
            <h2 className="text-lg font-bold text-[#172033]">
              {editingId ? "Editar control de calidad" : "Nuevo control de calidad"}
            </h2>
            <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-6">
              <ValidatedField label="Codigo" value={form.code} onChange={(value) => updateField("code", value)} required validator={isSku} errorMessage="Ingrese un codigo valido." />
              <ValidatedField label="Area o proceso" value={form.processArea} onChange={(value) => updateField("processArea", value)} required validator={(value) => !isBlank(value)} errorMessage="Ingrese el area o proceso." className="lg:col-span-2" />
              <ValidatedField label="Documento" value={form.referenceDocument} onChange={(value) => updateField("referenceDocument", value)} />
              <ValidatedSelect label="Tipo" value={form.findingType} onChange={(value) => updateField("findingType", value)} options={Object.entries(findingLabels)} required />
              <ValidatedSelect label="Severidad" value={form.severity} onChange={(value) => updateField("severity", value)} options={Object.entries(severityLabels)} required />
              <ValidatedSelect label="Estado" value={form.status} onChange={(value) => updateField("status", value)} options={Object.entries(statusLabels)} required />
              <ValidatedField label="Responsable" value={form.responsibleName} onChange={(value) => updateField("responsibleName", value)} required validator={(value) => !isBlank(value)} errorMessage="Ingrese el responsable." className="lg:col-span-2" />
              <ValidatedField label="Fecha compromiso" type="date" value={form.dueDate} onChange={(value) => updateField("dueDate", value)} />
              <ValidatedTextArea label="Descripcion" value={form.description} onChange={(value) => updateField("description", value)} className="lg:col-span-3" />
              <ValidatedTextArea label="Accion correctiva" value={form.correctiveAction} onChange={(value) => updateField("correctiveAction", value)} className="lg:col-span-3" required={form.status === "CLOSED"} validator={(value) => form.status !== "CLOSED" || !isBlank(value)} errorMessage="Registre la accion correctiva para cerrar." hint="Obligatoria si cierra el caso" />
              <div className="flex items-end gap-2 lg:col-span-6">
                <button type="submit" className="saas-button-primary h-11 px-4 text-sm">
                  {editingId ? "Guardar cambios" : "Crear registro"}
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
          <p className="saas-surface p-6 text-center text-[#647084]">Cargando calidad...</p>
        ) : records.length ? (
          <div className="saas-surface saas-table-scroll">
            <table className="saas-table min-w-full divide-y divide-[#d8dee8] text-sm">
              <thead className="bg-[#f8fafc]">
                <tr>
                  {["Codigo", "Area", "Origen", "Hallazgo", "Severidad", "Estado", "Responsable", "Compromiso", canOperate || isAdmin ? "Acciones" : null].filter(Boolean).map((header) => (
                    <th key={header} className="px-5 py-3 text-left font-bold text-[#526071]">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef2f6] bg-white">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-[#f8fafc]">
                    <td className="whitespace-nowrap px-5 py-4 font-bold text-[#172033]">{record.code}</td>
                    <td className="min-w-48 px-5 py-4 text-[#647084]">{record.processArea || "-"}</td>
                    <td className="min-w-48 px-5 py-4 text-[#647084]">
                      {record.sourceId ? `TRX-${String(record.sourceId).padStart(5, "0")}` : record.referenceDocument || "-"}
                      {record.productName && <p className="mt-1 text-xs">{record.productName}</p>}
                    </td>
                    <td className="min-w-72 px-5 py-4">
                      <p className="font-bold text-[#172033]">{findingLabels[record.findingType] || record.findingType}</p>
                      <p className="mt-1 line-clamp-2 text-xs text-[#647084]">{record.description || "-"}</p>
                    </td>
                    <td className="px-5 py-4">
                      <Badge value={severityLabels[record.severity] || record.severity} tone={record.severity === "CRITICAL" || record.severity === "HIGH" ? "danger" : "neutral"} />
                    </td>
                    <td className="px-5 py-4"><Badge value={statusLabels[record.status] || record.status} tone={record.status === "CLOSED" ? "success" : "info"} /></td>
                    <td className="min-w-48 px-5 py-4 text-[#647084]">{record.responsibleName || "-"}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-[#647084]">{record.dueDate || "-"}</td>
                    {(canOperate || isAdmin) && (
                      <td className="whitespace-nowrap px-5 py-4">
                        <div className="flex gap-2">
                          {canOperate && <IconButton icon="edit" label="Editar" onClick={() => editRecord(record)} />}
                          {isAdmin && <IconButton icon="delete" label="Archivar" variant="danger" onClick={() => deleteRecord(record)} />}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="saas-surface p-6 text-center text-[#647084]">Aun no hay registros de calidad.</p>
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

const Badge = ({ value, tone }) => {
  const tones = {
    danger: "border-[#f4c7c7] bg-[#fff4f4] text-[#9b2c2c]",
    success: "border-[#bfe1d2] bg-[#edf7f3] text-[#2f6f73]",
    info: "border-[#bfd7ef] bg-[#e8f1fb] text-[#123c69]",
    neutral: "border-[#d8dee8] bg-[#f8fafc] text-[#647084]",
  };
  return <span className={`rounded border px-3 py-1 text-xs font-bold ${tones[tone] || tones.neutral}`}>{value}</span>;
};

export default QualityPage;
