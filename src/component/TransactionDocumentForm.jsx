import React, { useMemo, useState } from "react";
import { ValidatedField, ValidatedSelect } from "./FormControls";

const currencyFormatter = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
});

const documentCopy = {
  purchase: {
    documentType: "Orden de compra",
    title: "Registrar compra",
    subtitle: "Ingreso de mercaderia, proveedor, costos y stock proyectado.",
    partyLabel: "Proveedor",
    submitLabel: "Confirmar compra",
    quantityLabel: "Cantidad recibida",
    referencePrefix: "OC",
    totalLabel: "Total estimado de compra",
    stockLabel: "Stock resultante",
  },
  sale: {
    documentType: "Comprobante de venta",
    title: "Registrar venta",
    subtitle: "Salida comercial con cliente, unidades y valor de operacion.",
    partyLabel: "Cliente",
    submitLabel: "Confirmar venta",
    quantityLabel: "Cantidad vendida",
    referencePrefix: "VT",
    totalLabel: "Total estimado de venta",
    stockLabel: "Stock resultante",
  },
  return: {
    documentType: "Nota de devolucion",
    title: "Registrar devolucion a proveedor",
    subtitle: "Salida controlada hacia proveedor por observacion o ajuste.",
    partyLabel: "Proveedor",
    submitLabel: "Confirmar devolucion",
    quantityLabel: "Cantidad devuelta",
    referencePrefix: "DV",
    totalLabel: "Valor referencial",
    stockLabel: "Stock luego de devolver",
  },
  customerReturn: {
    documentType: "Nota de devolucion de cliente",
    title: "Registrar devolucion de cliente",
    subtitle: "Retorno con evaluacion de condicion para reposicion o revision.",
    partyLabel: "Cliente",
    submitLabel: "Confirmar devolucion",
    quantityLabel: "Cantidad devuelta",
    referencePrefix: "DC",
    totalLabel: "Valor referencial",
    stockLabel: "Stock resultante",
  },
};

const resolveNumber = (value) => Number(value || 0);

const TransactionDocumentForm = ({
  mode,
  products,
  suppliers = [],
  customers = [],
  supplierId,
  customerId,
  warehouses = [],
  warehouseLocation,
  items,
  description,
  note,
  returnReason,
  returnCondition,
  message,
  loading = false,
  onSupplierChange,
  onCustomerChange,
  onWarehouseChange,
  onItemsChange,
  onDescriptionChange,
  onNoteChange,
  onReturnReasonChange,
  onReturnConditionChange,
  onSubmit,
}) => {
  const copy = documentCopy[mode];
  const [draftProductId, setDraftProductId] = useState("");
  const [draftQuantity, setDraftQuantity] = useState("");
  const usesSupplier = mode === "purchase" || mode === "return";
  const usesCustomer = mode === "sale" || mode === "customerReturn";
  const warehouseOptions = [
    ["", "Seleccione un almacen o sede"],
    ...warehouses
      .filter((warehouse) => warehouse.active !== false)
      .map((warehouse) => [
        warehouse.code || warehouse.name,
        `${warehouse.name} - ${warehouse.code || "sin codigo"}`,
      ]),
  ];

  const selectedSupplier = useMemo(
    () => suppliers.find((supplier) => String(supplier.id) === String(supplierId)),
    [supplierId, suppliers]
  );
  const selectedCustomer = useMemo(
    () => customers.find((customer) => String(customer.id) === String(customerId)),
    [customerId, customers]
  );

  const selectedItems = useMemo(
    () =>
      items
        .map((item) => {
          const product = products.find(
            (currentProduct) => String(currentProduct.id) === String(item.productId)
          );
          const quantity = resolveNumber(item.quantity);
          const unitPrice = resolveNumber(product?.price);
          const currentStock = resolveNumber(product?.stockQuantity);
          const resultingStock =
            mode === "purchase" ||
            (mode === "customerReturn" &&
              (!returnCondition || returnCondition === "SELLABLE"))
              ? currentStock + quantity
              : mode === "customerReturn"
              ? currentStock
              : currentStock - quantity;

          return {
            ...item,
            product,
            quantity,
            unitPrice,
            subtotal: unitPrice * quantity,
            currentStock,
            resultingStock,
          };
        })
        .filter((item) => item.product),
    [items, mode, products, returnCondition]
  );

  const totals = useMemo(
    () =>
      selectedItems.reduce(
        (acc, item) => ({
          units: acc.units + item.quantity,
          amount: acc.amount + item.subtotal,
        }),
        { units: 0, amount: 0 }
      ),
    [selectedItems]
  );

  const reference = `${copy.referencePrefix}-${new Date()
    .toISOString()
    .slice(0, 10)
    .replaceAll("-", "")}`;

  const handleAddItem = () => {
    const quantity = parseInt(draftQuantity, 10);
    if (!draftProductId || !quantity || quantity <= 0) return;

    const existingItem = items.find(
      (item) => String(item.productId) === String(draftProductId)
    );

    if (existingItem) {
      onItemsChange(
        items.map((item) =>
          String(item.productId) === String(draftProductId)
            ? { ...item, quantity: resolveNumber(item.quantity) + quantity }
            : item
        )
      );
    } else {
      onItemsChange([...items, { productId: draftProductId, quantity }]);
    }

    setDraftProductId("");
    setDraftQuantity("");
  };

  const handleQuantityChange = (productId, quantity) => {
    onItemsChange(
      items.map((item) =>
        String(item.productId) === String(productId)
          ? { ...item, quantity: parseInt(quantity || "0", 10) }
          : item
      )
    );
  };

  const clearForm = () => {
    onSupplierChange?.("");
    onCustomerChange?.("");
    onItemsChange([]);
    onDescriptionChange("");
    onNoteChange("");
    onWarehouseChange?.("");
    onReturnReasonChange?.("");
    onReturnConditionChange?.("SELLABLE");
  };

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="saas-kicker">{copy.documentType}</p>
          <h1 className="saas-title mt-1">{copy.title}</h1>
          <p className="mt-2 text-sm text-[#647084]">{copy.subtitle}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm md:min-w-96">
          <ReadOnlyField label="Documento" value={reference} />
          <ReadOnlyField label="Fecha" value={new Date().toLocaleDateString("es-PE")} />
        </div>
      </div>

      {message && (
        <p className="rounded-md border border-[#bfe1d2] bg-[#edf7f3] px-4 py-3 text-sm font-semibold text-[#2f6f73]">
          {message}
        </p>
      )}

      <section className="saas-surface p-5">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          {usesSupplier && (
            <PartySelect
              label={copy.partyLabel}
              value={supplierId}
              onChange={onSupplierChange}
              options={suppliers}
              placeholder="Seleccione un proveedor"
            />
          )}
          {usesCustomer && (
            <PartySelect
              label={copy.partyLabel}
              value={customerId}
              onChange={onCustomerChange}
              options={customers}
              placeholder="Seleccione un cliente"
            />
          )}
          <ReadOnlyField label="Lineas" value={selectedItems.length} />
          <ReadOnlyField label="Unidades" value={totals.units} />
          <ValidatedSelect
            label="Almacen / sede"
            value={warehouseLocation}
            onChange={onWarehouseChange}
            options={warehouseOptions}
          />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="saas-surface overflow-hidden xl:col-span-2">
          <div className="border-b border-[#d8dee8] px-5 py-4">
            <h2 className="text-base font-bold text-[#172033]">
              Productos del documento
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-3 border-b border-[#d8dee8] p-5 lg:grid-cols-[1fr_160px_auto]">
            <ValidatedSelect
              label="Producto"
              value={draftProductId}
              onChange={setDraftProductId}
              required
              errorMessage="Seleccione un producto."
              options={[
                ["", "Seleccione un producto"],
                ...products.map((product) => [
                  String(product.id),
                  `${product.name} - ${product.sku || "sin SKU"}`,
                ]),
              ]}
            />
            <ValidatedField
              label={copy.quantityLabel}
              type="number"
              min="1"
              value={draftQuantity}
              onChange={setDraftQuantity}
              validator={(value) => Number(value) > 0}
              errorMessage="La cantidad debe ser mayor a cero."
            />
            <button
              type="button"
              onClick={handleAddItem}
              className="saas-button-primary self-end px-4 py-2 text-sm"
            >
              Agregar
            </button>
          </div>

          <div className="saas-table-scroll">
            <table className="saas-table min-w-full divide-y divide-[#d8dee8] text-sm">
              <thead className="bg-[#f8fafc]">
                <tr>
                  {[
                    "Producto",
                    "Stock actual",
                    "Cantidad",
                    "Precio unit.",
                    "Subtotal",
                    copy.stockLabel,
                    "",
                  ].map((header) => (
                    <th
                      key={header || "actions"}
                      className="px-5 py-3 text-left font-bold text-[#526071]"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef2f6] bg-white">
                {selectedItems.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-5 py-8 text-center text-[#647084]">
                      Agregue productos para registrar el documento.
                    </td>
                  </tr>
                ) : (
                  selectedItems.map((item) => (
                    <tr key={item.productId} className="hover:bg-[#f8fafc]">
                      <td className="min-w-64 px-5 py-4">
                        <p className="font-bold text-[#172033]">{item.product.name}</p>
                        <p className="mt-1 text-xs text-[#647084]">
                          {item.product.sku || "sin SKU"} | {item.product.warehouseLocation || "Sin almacen"}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-[#647084]">{item.currentStock}</td>
                      <td className="px-5 py-4">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(event) =>
                            handleQuantityChange(item.productId, event.target.value)
                          }
                          className={`h-10 w-24 rounded-md border px-3 text-sm outline-none transition focus:ring-2 ${
                            item.quantity <= 0
                              ? "border-[#e58b8b] bg-[#fff8f8] focus:border-[#b42318] focus:ring-[#b42318]/10 saas-field-shake"
                              : "border-[#8cc8aa] bg-[#fbfffd] focus:border-[#2f6f73] focus:ring-[#2f6f73]/10"
                          }`}
                        />
                      </td>
                      <td className="px-5 py-4 font-semibold text-[#344055]">
                        {currencyFormatter.format(item.unitPrice)}
                      </td>
                      <td className="px-5 py-4 font-bold text-[#172033]">
                        {currencyFormatter.format(item.subtotal)}
                      </td>
                      <td
                        className={`px-5 py-4 font-bold ${
                          item.resultingStock < 0 ? "text-[#9b2c2c]" : "text-[#172033]"
                        }`}
                      >
                        {item.resultingStock}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            onItemsChange(
                              items.filter(
                                (current) =>
                                  String(current.productId) !== String(item.productId)
                              )
                            )
                          }
                          className="rounded-md border border-[#cfd6e2] bg-white px-3 py-2 text-xs font-bold text-[#465366] hover:bg-[#f8fafc]"
                        >
                          Quitar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="saas-surface h-fit p-5">
          <h2 className="text-base font-bold text-[#172033]">Resumen</h2>
          <div className="mt-4 space-y-3 text-sm">
            <SummaryRow
              label={copy.partyLabel}
              value={usesCustomer ? selectedCustomer?.name || "-" : selectedSupplier?.name || "-"}
            />
            <SummaryRow label="Lineas" value={selectedItems.length || "-"} />
            <SummaryRow label="Unidades" value={totals.units || "-"} />
            <SummaryRow label="Almacen / sede" value={warehouseLocation || "-"} />
          </div>
          <div className="mt-5 border-t border-[#d8dee8] pt-5">
            <p className="text-sm font-semibold text-[#647084]">{copy.totalLabel}</p>
            <p className="mt-1 text-3xl font-bold text-[#172033]">
              {currencyFormatter.format(totals.amount)}
            </p>
          </div>
        </aside>
      </div>

      <section className="saas-surface p-5">
        {mode === "customerReturn" && (
          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <ReturnSelect
              label="Motivo de devolucion"
              value={returnReason}
              onChange={onReturnReasonChange}
              options={[
                ["", "Seleccione un motivo"],
                ["DEFECTIVE", "Producto defectuoso"],
                ["WRONG_PRODUCT", "Producto incorrecto"],
                ["CUSTOMER_CHANGE", "Cambio del cliente"],
                ["EXPIRED", "Producto vencido"],
              ]}
            />
            <ReturnSelect
              label="Condicion del producto"
              value={returnCondition}
              onChange={onReturnConditionChange}
              options={[
                ["SELLABLE", "Buen estado: vuelve a stock"],
                ["DAMAGED", "Danado: no vuelve a stock"],
                ["EXPIRED", "Vencido: no vuelve a stock"],
              ]}
            />
          </div>
        )}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <TextField label="Descripcion" value={description} onChange={onDescriptionChange} />
          <TextField label="Nota interna" value={note} onChange={onNoteChange} />
        </div>
        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={clearForm}
            className="rounded-md border border-[#cfd6e2] bg-white px-4 py-2 text-sm font-bold text-[#465366] hover:bg-[#f8fafc]"
          >
            Limpiar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="saas-button-primary px-5 py-2 text-sm disabled:cursor-not-allowed disabled:bg-[#7b8798]"
          >
            {loading ? "Procesando..." : copy.submitLabel}
          </button>
        </div>
      </section>
    </form>
  );
};

const PartySelect = ({ label, value, onChange, options, placeholder }) => (
  <div className="lg:col-span-2">
    <ValidatedSelect
      label={label}
      value={value}
      onChange={onChange}
      required
      errorMessage={`Seleccione ${label.toLowerCase()}.`}
      options={[["", placeholder], ...options.map((option) => [String(option.id), option.name])]}
    />
  </div>
);

const ReturnSelect = ({ label, value, onChange, options }) => (
  <ValidatedSelect label={label} value={value} onChange={onChange} options={options} required />
);

const TextField = ({ label, value, onChange }) => (
  <ValidatedField label={label} type="text" value={value} onChange={onChange} />
);

const ReadOnlyField = ({ label, value }) => (
  <div>
    <p className="text-xs font-bold uppercase text-[#647084]">{label}</p>
    <p className="mt-1 rounded-md border border-[#d8dee8] bg-white px-3 py-2 text-sm font-bold text-[#172033]">
      {value}
    </p>
  </div>
);

const SummaryRow = ({ label, value }) => (
  <div className="flex items-center justify-between gap-4">
    <span className="text-[#647084]">{label}</span>
    <span className="text-right font-bold text-[#172033]">{value}</span>
  </div>
);

export default TransactionDocumentForm;
