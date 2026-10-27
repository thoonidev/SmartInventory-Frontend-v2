import React, { useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import ApiService from "../service/ApiService";
import IconButton from "./IconButton";
import NotificationBell from "./NotificationBell";
import { canUseFeature, getFeatureRequirement, planLabel } from "../utils/planAccess";

const Layout = ({ children }) => {
  const organization = ApiService.getOrganization();
  const role = ApiService.getRole();
  const isAdmin = ApiService.isAdmin();
  const canOperate = ApiService.isAdmin() || ApiService.isManager();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const roleLabels = {
    ADMIN: "Administrador",
    MANAGER: "Supervisor",
    VIEWER: "Consulta",
  };

  const quickLinks = [
    ["Panel de control", "/dashboard", true, "Indicadores, alertas y actividad"],
    ["Productos", "/product", isAdmin, "Catalogo e inventario"],
    ["Categorias", "/category", isAdmin, "Clasificacion del catalogo"],
    ["Proveedores", "/supplier", isAdmin, "Abastecimiento"],
    ["Clientes", "/customer", isAdmin, "Gestion comercial"],
    ["Compras", "/purchase", canOperate, "Ingreso de mercaderia"],
    ["Ventas", "/sell", canOperate, "Salida comercial"],
    ["Movimientos", "/transaction", true, "Libro de transacciones"],
    ["Reportes", "/reports", true, "Exportaciones PDF y Excel", "reports"],
    ["Almacenes y sedes", "/warehouses", true, "Sedes, almacenes y responsables"],
    ["Calidad ISO 9001", "/quality", true, "Inspecciones y no conformidades"],
    ["Produccion", "/production", true, "Ordenes de produccion"],
    ["Perfil", "/profile", true, "Datos de mi cuenta"],
    ["Auditoria", "/audit", isAdmin, "Registro de acciones", "audit"],
    ["Empresa y equipo", "/organization", isAdmin, "Usuarios y espacio de trabajo"],
    ["Plan", "/plan", isAdmin, "Limites y suscripcion"],
  ].filter(([, , visible]) => visible);

  const createLinks = [
    ["Producto", "/add-product", isAdmin],
    ["Proveedor", "/add-supplier", isAdmin],
    ["Cliente", "/add-customer", isAdmin],
    ["Compra", "/purchase", canOperate],
    ["Venta", "/sell", canOperate],
  ].filter(([, , visible]) => visible);

  const searchResults = useMemo(() => {
    const value = search.trim().toLowerCase();
    if (!value) return [];
    return quickLinks
      .filter(([label, , , detail]) =>
        `${label} ${detail}`.toLowerCase().includes(value)
      )
      .slice(0, 6);
  }, [quickLinks, search]);

  const mobileLinks = [
    ["Panel", "/dashboard", true],
    ["Logistica", "/logistics", true],
    ["Movimientos", "/transaction", true],
    ["Productos", "/product", isAdmin],
    ["Compras", "/purchase", canOperate],
    ["Ventas", "/sell", canOperate],
    ["Reportes", "/reports", true, "reports"],
    ["Empresa", "/organization", isAdmin],
  ].filter(([, , visible]) => visible);

  const mobileNavClass = ({ isActive }) =>
    `shrink-0 rounded-md px-3 py-2 text-sm font-semibold ${
      isActive
        ? "bg-[#123c69] text-white"
        : "border border-[#cfd6e2] bg-white text-[#465366]"
    }`;

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-[#f4f6f8] text-[#172033]">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 border-b border-[#d8dee8] bg-white/95 px-5 py-3 backdrop-blur">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-[#123c69] text-sm font-bold text-white">
                SI
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#172033]">
                  {organization?.name || "SmartInventory Cloud"}
                </p>
                <p className="text-xs text-[#647084]">
                  Espacio de trabajo empresarial
                </p>
              </div>
            </div>

            <div className="flex flex-1 items-center gap-3 lg:max-w-3xl">
              <label className="relative flex-1">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#7b8798]">
                  Buscar
                </span>
                <input
                  type="search"
                  aria-label="Buscar en SmartInventory"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && searchResults[0]) {
                      navigate(searchResults[0][1]);
                      setSearch("");
                    }
                  }}
                  className="h-10 w-full rounded-md border border-[#cfd6e2] bg-[#f8fafc] pl-16 pr-3 text-sm text-[#172033] outline-none transition focus:border-[#123c69] focus:bg-white focus:ring-2 focus:ring-[#123c69]/10"
                />
                {searchResults.length > 0 && (
                  <div className="absolute left-0 right-0 top-12 z-30 overflow-hidden rounded-md border border-[#d8dee8] bg-white shadow-lg">
                    {searchResults.map(([label, to, , detail, feature]) => {
                      const locked = feature ? !canUseFeature(feature) : false;
                      const requirement = feature ? getFeatureRequirement(feature) : null;
                      return (
                      <button
                        key={to}
                        type="button"
                        onClick={() => {
                          navigate(to);
                          setSearch("");
                        }}
                        className="block w-full border-b border-[#eef2f6] px-4 py-3 text-left last:border-b-0 hover:bg-[#f8fafc]"
                      >
                        <span className="flex items-center justify-between gap-2 text-sm font-bold text-[#172033]">
                          {label}
                          {locked && (
                            <span className="rounded border border-[#d8dee8] bg-[#f8fafc] px-2 py-0.5 text-[10px] text-[#7b8798]">
                              Requiere {planLabel(requirement?.plan)}
                            </span>
                          )}
                        </span>
                        <span className="mt-1 block text-xs text-[#647084]">{detail}</span>
                      </button>
                    )})}
                  </div>
                )}
              </label>
              <div className="relative">
                <IconButton
                  icon="add"
                  label="Nuevo"
                  onClick={() => setShowCreate((current) => !current)}
                  variant="primary"
                  className="h-10 w-10"
                />
                {showCreate && (
                  <div className="absolute right-0 top-12 z-30 max-h-56 w-52 overflow-y-auto rounded-md border border-[#d8dee8] bg-white shadow-lg">
                    {createLinks.map(([label, to]) => (
                      <button
                        key={to}
                        type="button"
                        onClick={() => {
                          navigate(to);
                          setShowCreate(false);
                        }}
                        className="block w-full border-b border-[#eef2f6] px-4 py-3 text-left text-sm font-bold text-[#172033] last:border-b-0 hover:bg-[#f8fafc]"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <NotificationBell />
              <div className="hidden h-10 items-center rounded-md border border-[#cfd6e2] bg-white px-3 text-sm font-semibold text-[#465366] md:flex">
                {roleLabels[role] || "Usuario"}
              </div>
            </div>
          </div>
        </header>

        <nav className="border-b border-[#d8dee8] bg-[#f8fafc] px-4 py-3 lg:hidden">
          <div className="flex gap-2 overflow-x-auto">
            {mobileLinks.map(([label, to, , feature]) => {
              const locked = feature ? !canUseFeature(feature) : false;
              return (
              <NavLink key={to} to={to} className={mobileNavClass}>
                {label}{locked ? " +" : ""}
              </NavLink>
            )})}
          </div>
        </nav>

        <main className="min-w-0 p-4 transition-all duration-300 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
