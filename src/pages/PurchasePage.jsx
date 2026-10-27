import React, { useEffect, useState } from "react";
import Layout from "../component/Layout";
import TransactionDocumentForm from "../component/TransactionDocumentForm";
import ApiService from "../service/ApiService";
import { useConfirm } from "../component/confirmContext";

const PurchasePage = () => {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [supplierId, setSupplierId] = useState("");
  const [warehouses, setWarehouses] = useState([]);
  const [warehouseLocation, setWarehouseLocation] = useState("");
  const [description, setDescription] = useState("");
  const [note, setNote] = useState("");
  const [items, setItems] = useState([]);
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
    const ok = await confirm({
      title: "Registrar compra",
      message: "La compra se enviara a aprobacion antes de ingresar stock. Desea continuar?",
      confirmLabel: "Enviar a aprobacion",
      tone: "primary",
    });
    if (!ok) {
      return;
    }

    setLoading(true);
    try {
      const response = await ApiService.purchaseProduct({
        supplierId,
        warehouseLocation,
        items,
        description,
        note,
      });
      showMessage(response.message || "Compra registrada y enviada a aprobacion.");
      resetForm();
    } catch (error) {
      showMessage(
        error.response?.data?.message || "No se pudo registrar la compra."
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSupplierId("");
    setWarehouseLocation("");
    setDescription("");
    setNote("");
    setItems([]);
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 4000);
  };

  return (
    <Layout>
      <TransactionDocumentForm
        mode="purchase"
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

export default PurchasePage;
