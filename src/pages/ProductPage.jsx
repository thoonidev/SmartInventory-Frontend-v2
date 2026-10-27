import React, { useEffect, useMemo, useState } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import { useNavigate } from "react-router-dom";
import PaginationComponent from "../component/PaginationComponent";
import IconButton from "../component/IconButton";
import { useConfirm } from "../component/confirmContext";

const itemsPerPage = 8;

const resolveImageUrl = (url) => {
  if (!url) return "/vite.svg";
  if (url.startsWith("http") || url.startsWith("data:") || url.startsWith("/")) {
    return url;
  }
  return `/${url}`;
};

const ProductPage = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [message, setMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState("");

  const navigate = useNavigate();
  const confirm = useConfirm();

  useEffect(() => {
    const getProducts = async () => {
      try {
        const productData = await ApiService.getAllProducts();
        if (productData.status === 200) {
          setAllProducts(productData.products || []);
        }
      } catch (error) {
        showMessage(
          error.response?.data?.message ||
            "Error al obtener productos: " + error
        );
      }
    };

    getProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const value = filter.trim().toLowerCase();
    if (!value) return allProducts;
    return allProducts.filter((product) =>
      [product.name, product.sku, product.warehouseLocation, product.abcClass]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(value))
    );
  }, [allProducts, filter]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const products = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDeleteProduct = async (productId) => {
    const ok = await confirm({
      title: "Archivar producto",
      message: "El producto saldra del catalogo operativo, pero se conservara en el historial. Desea continuar?",
      confirmLabel: "Archivar",
      tone: "danger",
    });
    if (!ok) return;
    try {
      await ApiService.deleteProduct(productId);
      setAllProducts((current) =>
        current.filter((product) => product.id !== productId)
      );
      showMessage("Producto archivado correctamente");
    } catch (error) {
      showMessage(
        error.response?.data?.message ||
          "Error al archivar un producto: " + error
      );
    }
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage("");
    }, 4000);
  };

  const stockClass = (product) => {
    if ((product.stockQuantity || 0) <= 0) return "bg-[#fff1f1] text-[#9b2c2c] border-[#f4c7c7]";
    if (
      product.reorderPoint !== null &&
      product.reorderPoint !== undefined &&
      product.stockQuantity <= product.reorderPoint
    ) {
      return "bg-[#fff8e8] text-[#8a5a10] border-[#f3d49a]";
    }
    return "bg-[#edf7f3] text-[#2f6f73] border-[#bfe1d2]";
  };

  return (
    <Layout>
      <div className="space-y-6">
        {message && (
          <div className="text-center">
            <p className="inline-block rounded bg-teal-50 px-4 py-2 text-sm font-medium text-teal-800 shadow-sm">
              {message}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="saas-kicker">Inventario</p>
            <h1 className="saas-title mt-1">Productos</h1>
            <p className="mt-2 text-sm text-[#647084]">
              Catalogo operativo con SKU, stock, reorden, ubicacion y valor.
            </p>
          </div>
          <IconButton icon="add" label="Agregar producto" onClick={() => navigate("/add-product")} variant="primary" className="self-start" />
        </div>

        <div className="saas-surface p-4">
          <input
            type="text"
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Buscar por nombre, SKU, ubicacion o ABC"
            className="h-11 w-full rounded-md border border-[#cfd6e2] px-4 text-sm outline-none transition focus:border-[#123c69] focus:ring-2 focus:ring-[#123c69]/10"
          />
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {products.map((product) => (
              <article
                key={product.id}
                className="saas-surface flex min-h-[430px] flex-col justify-between p-4"
              >
                <img
                  src={resolveImageUrl(product.imageUrl)}
                  alt={product.name}
                  className="h-32 w-full rounded-md border border-[#d8dee8] object-cover"
                />
                <div className="mt-4 flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-base font-bold text-[#172033]">
                      {product.name}
                    </h3>
                    <span className="rounded bg-[#e8f1fb] px-2.5 py-1 text-xs font-bold text-[#123c69]">
                      {product.abcClass || "ABC"}
                    </span>
                  </div>
                  <p className="text-sm text-[#647084]">SKU: {product.sku}</p>
                  <p className="text-sm text-[#647084]">
                    Precio:{" "}
                    <span className="font-semibold">
                      S/ {Number(product.price || 0).toFixed(2)}
                    </span>
                  </p>
                  <p className="text-sm text-[#647084]">
                    Valor:{" "}
                    <span className="font-semibold">
                      S/ {Number(product.inventoryValue || 0).toFixed(2)}
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className={`rounded border px-3 py-1 text-xs font-bold ${stockClass(product)}`}>
                      Stock {product.stockQuantity ?? 0}
                    </span>
                    <span className="rounded border border-[#d8dee8] bg-[#f8fafc] px-3 py-1 text-xs font-bold text-[#526071]">
                      Reorden {product.reorderPoint ?? "-"}
                    </span>
                  </div>
                  <p className="text-sm text-[#647084]">
                    Ubicacion: {product.warehouseLocation || "Sin asignar"}
                  </p>
                </div>
                <div className="mt-4 flex gap-2">
                  <IconButton
                    icon="edit"
                    label="Editar producto"
                    onClick={() => navigate(`/edit-product/${product.id}`)}
                  />
                  <IconButton
                    icon="delete"
                    label="Archivar producto"
                    onClick={() => handleDeleteProduct(product.id)}
                    variant="danger"
                  />
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="saas-surface p-6 text-center text-[#647084]">
            No hay productos disponibles.
          </p>
        )}

        <div className="flex justify-center">
          <PaginationComponent
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </Layout>
  );
};

export default ProductPage;
