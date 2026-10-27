import React from "react";
import { Link } from "react-router-dom";
import PublicLayout from "../component/PublicLayout";

const plans = [
  {
    name: "Free",
    price: "S/ 0",
    description: "Para empresas que empiezan a ordenar inventario y documentos.",
    badge: "Inicio",
    cta: "Crear empresa",
    color: "border-black/10",
    features: ["20 productos", "2 usuarios activos", "Compras y ventas", "Clientes y proveedores", "Devoluciones basicas"],
  },
  {
    name: "Basic",
    price: "S/ 49",
    description: "Para equipos que necesitan reportes, auditoria y mas capacidad.",
    badge: "Crecimiento",
    cta: "Elegir Basic",
    color: "border-[#08a88a]",
    features: ["200 productos", "5 usuarios activos", "Reportes PDF y Excel", "Auditoria", "Alertas operativas"],
  },
  {
    name: "Premium",
    price: "S/ 99",
    description: "Para operaciones que requieren monitoreo en vivo y uso sin limites.",
    badge: "Mas completo",
    cta: "Elegir Premium",
    color: "border-[#7455ff]",
    features: ["Productos ilimitados", "Usuarios activos ilimitados", "Operaciones en vivo", "KPIs logisticos avanzados", "Auditoria avanzada"],
  },
];

const comparisons = [
  ["Productos", "20", "200", "Ilimitado"],
  ["Usuarios activos", "2 en total", "5 en total", "Ilimitado"],
  ["Clientes y proveedores", "Incluido", "Incluido", "Incluido"],
  ["Compras y ventas multi-linea", "Incluido", "Incluido", "Incluido"],
  ["Reportes PDF/Excel", "No incluido", "Incluido", "Incluido"],
  ["Auditoria", "Basica", "Incluida", "Avanzada"],
  ["Operaciones en vivo", "No incluido", "No incluido", "Incluido"],
  ["KPIs logisticos", "Basicos", "Incluidos", "Avanzados"],
];

const faqs = [
  ["Todas las empresas empiezan en Free?", "Si. Al registrar una organizacion nueva, inicia con Free y puede cambiar de plan cuando necesite mas capacidad."],
  ["Que pasa al llegar a un limite?", "El sistema evita crear mas recursos del tipo limitado y muestra que se requiere cambiar de plan."],
  ["El cambio de plan mueve datos?", "No. La empresa conserva productos, usuarios, ventas, compras y reportes; solo cambian los limites y funciones disponibles."],
  ["Premium es necesario para ver actividad en tiempo real?", "Si. El centro de operaciones en vivo queda reservado para Premium."],
];

const PublicPricingPage = () => (
  <PublicLayout>
    <main>
      <section className="relative overflow-hidden bg-[#101114] px-5 py-24 text-white lg:px-8">
        <img
          src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=2200&q=85"
          alt="Equipo revisando indicadores de negocio"
          className="absolute inset-0 h-full w-full object-cover opacity-38"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#101114] via-[#101114]/88 to-[#101114]/45" />
        <div className="relative mx-auto max-w-7xl">
          <p className="text-sm font-black uppercase text-[#84f0d9]">Precios</p>
          <h1 className="mt-4 max-w-4xl text-5xl font-black leading-tight md:text-6xl">
            Planes simples para crecer sin cambiar de sistema
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/75">
            Cada organizacion inicia en Free. Cuando necesita mas productos,
            usuarios, reportes o monitoreo en vivo, puede pasar a Basic o Premium.
          </p>
        </div>
      </section>

      <section className="bg-[#f7f8fb] px-5 py-16 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">
          {plans.map((plan) => (
            <article key={plan.name} className={`rounded-md border-2 ${plan.color} bg-white p-6 shadow-xl`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="rounded-md bg-[#f1f5f9] px-3 py-1.5 text-xs font-black uppercase text-[#475569]">
                    {plan.badge}
                  </span>
                  <h2 className="mt-4 text-2xl font-black text-[#171717]">{plan.name}</h2>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-[#646b77]">{plan.description}</p>
              <p className="mt-6 text-5xl font-black text-[#171717]">
                {plan.price}
                <span className="text-sm font-bold text-[#737373]"> / mes</span>
              </p>
              <ul className="mt-6 space-y-3 text-sm font-bold text-[#374151]">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-3">
                    <span className="mt-1 h-2 w-2 rounded-sm bg-[#08a88a]" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link to="/register" className="mt-7 block rounded-md bg-[#171717] px-4 py-3 text-center text-sm font-black text-white transition hover:bg-[#333333]">
                {plan.cta}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white px-5 py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase text-[#7455ff]">Comparativa</p>
            <h2 className="mt-3 text-4xl font-black">Funciones y limites por plan</h2>
          </div>
          <div className="mt-8 overflow-hidden rounded-md border border-black/10 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-[760px] w-full text-sm">
                <thead className="bg-[#f7f8fb]">
                  <tr>
                    {["Funcion", "Free", "Basic", "Premium"].map((header) => (
                      <th key={header} className="px-5 py-4 text-left font-black text-[#374151]">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {comparisons.map((row) => (
                    <tr key={row[0]}>
                      {row.map((cell, index) => (
                        <td key={`${row[0]}-${cell}`} className={`px-5 py-4 ${index === 0 ? "font-black text-[#171717]" : "font-semibold text-[#5f6673]"}`}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-black uppercase text-[#f59e0b]">Preguntas frecuentes</p>
            <h2 className="mt-3 text-4xl font-black leading-tight">Cambiar de plan debe sentirse natural</h2>
            <p className="mt-4 text-base leading-7 text-[#5f6673]">
              La logica del sistema ya aplica limites reales. Eso permite mostrar
              planes como parte del producto y no solo como una seccion decorativa.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {faqs.map(([question, answer]) => (
              <article key={question} className="rounded-md border border-black/10 bg-white p-5">
                <h3 className="text-lg font-black text-[#171717]">{question}</h3>
                <p className="mt-3 text-sm leading-6 text-[#646b77]">{answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  </PublicLayout>
);

export default PublicPricingPage;
