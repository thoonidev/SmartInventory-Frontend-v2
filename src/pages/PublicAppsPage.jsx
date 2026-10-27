import React from "react";
import { Link } from "react-router-dom";
import PublicLayout from "../component/PublicLayout";

const modules = [
  {
    title: "Inventario",
    color: "bg-[#7455ff]",
    summary: "Productos, SKU, categorias, imagenes, valor de stock y punto de reposicion.",
    features: ["Stock por empresa", "Alertas de minimo", "Inventario valorizado", "Historial de movimientos"],
  },
  {
    title: "Ventas",
    color: "bg-[#f59e0b]",
    summary: "Documentos multi-producto conectados con clientes y salida automatica de stock.",
    features: ["Clientes", "Ventas por linea", "Control de stock", "Detalle comercial"],
  },
  {
    title: "Compras",
    color: "bg-[#08a88a]",
    summary: "Ordenes de compra por proveedor con aprobacion antes de aumentar inventario.",
    features: ["Proveedores", "Recepcion controlada", "Aprobaciones", "Costo por producto"],
  },
  {
    title: "Devoluciones",
    color: "bg-[#ef4444]",
    summary: "Gestion de devoluciones desde clientes o hacia proveedores con motivo y condicion.",
    features: ["Retorno de cliente", "Devolucion a proveedor", "Condicion de producto", "Revision de stock"],
  },
  {
    title: "Logistica",
    color: "bg-[#2563eb]",
    summary: "Indicadores para tomar decisiones de reposicion, rotacion y criticidad.",
    features: ["Analisis ABC", "KPIs logisticos", "Reorden", "Stock critico"],
  },
  {
    title: "Tiempo real",
    color: "bg-[#14b8a6]",
    summary: "Centro en tiempo real con eventos de ventas, compras, alertas y aprobaciones.",
    features: ["Eventos por empresa", "Actividad reciente", "Alertas operativas", "Monitoreo premium"],
  },
  {
    title: "Reportes",
    color: "bg-[#7c3aed]",
    summary: "Informes exportables para administradores y equipos comerciales.",
    features: ["PDF", "Excel", "Inventario", "Ventas y compras"],
  },
  {
    title: "Administracion SaaS",
    color: "bg-[#0f766e]",
    summary: "Usuarios, roles, organizacion, plan activo y limites de uso.",
    features: ["Multiempresa", "Roles", "Planes", "Auditoria"],
  },
];

const flows = [
  ["Comprar", "El proveedor entrega productos y la orden espera aprobacion."],
  ["Aprobar", "Un administrador revisa el documento antes de mover stock."],
  ["Vender", "La venta descuenta inventario y queda asociada al cliente."],
  ["Analizar", "Los reportes y KPIs muestran rotacion, valor y alertas."],
];

const PublicAppsPage = () => (
  <PublicLayout>
    <main>
      <section className="relative overflow-hidden bg-[#101114] px-5 py-24 text-white lg:px-8">
        <img
          src="https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=2200&q=85"
          alt="Equipo trabajando en un almacen"
          className="absolute inset-0 h-full w-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#101114] via-[#101114]/86 to-[#101114]/38" />
        <div className="relative mx-auto max-w-7xl">
          <p className="text-sm font-black uppercase text-[#84f0d9]">Aplicaciones</p>
          <h1 className="mt-4 max-w-4xl text-5xl font-black leading-tight md:text-6xl">
            Una suite completa para operar inventario, comercio y logistica
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/75">
            SmartInventory agrupa las funciones que una pyme necesita para vender,
            comprar, reponer, devolver, auditar y reportar sin perder trazabilidad.
          </p>
        </div>
      </section>

      <section className="px-5 py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {modules.map((module) => (
              <article key={module.title} className="rounded-md border border-black/10 bg-white p-5 shadow-sm">
                <span className={`grid h-12 w-12 place-items-center rounded-md ${module.color} text-sm font-black text-white`}>
                  {module.title.slice(0, 2).toUpperCase()}
                </span>
                <h2 className="mt-5 text-xl font-black text-[#171717]">{module.title}</h2>
                <p className="mt-3 min-h-20 text-sm leading-6 text-[#646b77]">{module.summary}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {module.features.map((feature) => (
                    <span key={feature} className="rounded-md bg-[#f1f5f9] px-3 py-1.5 text-xs font-black text-[#475569]">
                      {feature}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-20 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase text-[#7455ff]">Flujo conectado</p>
            <h2 className="mt-3 text-4xl font-black leading-tight">Del proveedor al cliente con control de stock</h2>
            <p className="mt-4 text-base leading-7 text-[#5f6673]">
              Las aplicaciones no funcionan como islas. Una compra puede requerir
              aprobacion, una venta se liga al cliente y una devolucion decide si
              el producto vuelve o no al inventario disponible.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {flows.map(([title, description], index) => (
              <div key={title} className="rounded-md border border-black/10 bg-[#f7f8fb] p-5">
                <span className="grid h-9 w-9 place-items-center rounded-md bg-[#171717] text-sm font-black text-white">
                  {index + 1}
                </span>
                <h3 className="mt-5 text-lg font-black">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#646b77]">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 rounded-md bg-[#101114] p-8 text-white md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-sm font-black uppercase text-[#84f0d9]">Escalable por plan</p>
            <h2 className="mt-3 text-3xl font-black">Activa mas capacidad cuando la empresa crece</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">
              Los limites de productos, usuarios, reportes y operaciones en vivo
              dependen del plan activo de cada organizacion.
            </p>
          </div>
          <Link to="/pricing" className="w-fit rounded-md bg-white px-5 py-3 text-sm font-black text-[#171717] transition hover:bg-[#e5e7eb]">
            Comparar planes
          </Link>
        </div>
      </section>
    </main>
  </PublicLayout>
);

export default PublicAppsPage;
