import React, { useEffect, useState } from "react";
import Layout from "../component/Layout";
import TransactionDocumentForm from "../component/TransactionDocumentForm";
import ApiService from "../service/ApiService";
import { useConfirm } from "../component/confirmContext";

const ReturnToSupplierPage = () => {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [supplierId, setSupplierId] = useState("");
  const [warehouses, setWarehouses] = useState([]);
  const [warehouseLocation, setWarehouseLocation] = useState("");
  const [items, setItems] = useState([]);
  const [description, setDescription] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const confirm = useConfirm();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productData, supplierData, warehouseData] = await Promise.all([
          ApiService.getAllProducts(),
          ApiService.getAllSuppliers(),
          ApiService.getWarehouses(),
        ]);
        setProducts(productData.products || []);
        setSuppliers(supplierData.suppliers || []);
        setWarehouses(warehouseData.warehouses || []);
      } catch (error) {
        showMessage(
          error.response?.data?.message || "No se pudieron cargar los datos."
        );
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!supplierId || items.length === 0) {
      showMessage("Seleccione proveedor y agregue al menos un producto.");
      return;
    }
    if (items.some((item) => Number(item.quantity) <= 0)) {
      showMessage("Cada producto debe tener una cantidad mayor a cero.");
      return;
    }
    const itemWithoutStock = items.find((item) => {
      const product = products.find((current) => String(current.id) === String(item.productId));
      return product && Number(item.quantity) > Number(product.stockQuantity || 0);
    });
    if (itemWithoutStock) {
      showMessage("No puede devolver mas unidades que el stock disponible.");
      return;
    }
    const ok = await confirm({
      title: "Confirmar devolucion",
      message: "La devolucion al proveedor descontara stock inmediatamente. Desea continuar?",
      confirmLabel: "Confirmar devolucion",
      tone: "danger",
    });
    if (!ok) {
      return;
    }

    setLoading(true);
    try {
      const response = await ApiService.returnToSupplier({
        supplierId,
        warehouseLocation,
        items,
        description,
        note,
      });
      showMessage(response.message || "Devolucion registrada correctamente.");
      resetForm();
    } catch (error) {
      showMessage(
        error.response?.data?.message || "No se pudo registrar la devolucion."
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSupplierId("");
    setWarehouseLocation("");
    setItems([]);
    setDescription("");
    setNote("");
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 4000);
  };

  return (
    <Layout>
      <TransactionDocumentForm
        mode="return"
        products={products}
        suppliers={suppliers}
        supplierId={supplierId}
        warehouses={warehouses}
        warehouseLocation={warehouseLocation}
        items={items}
        description={description}
        note={note}
        message={message}
        loading={loading}
        onSupplierChange={setSupplierId}
        onWarehouseChange={setWarehouseLocation}
        onItemsChange={setItems}
        onDescriptionChange={setDescription}
        onNoteChange={setNote}
        onSubmit={handleSubmit}
      />
    </Layout>
  );
};

export default ReturnToSupplierPage;
