import React from "react";
import { Link } from "react-router-dom";
import PublicLayout from "../component/PublicLayout";

const pillars = [
  ["Multiempresa", "Cada organizacion mantiene sus propios productos, usuarios, clientes, proveedores, documentos y plan activo."],
  ["Seguridad por rol", "Administradores, supervisores y usuarios operativos trabajan con permisos definidos segun responsabilidad."],
  ["Trazabilidad", "Las operaciones importantes registran usuario, fecha, estado, documento y empresa para revisar lo ocurrido."],
  ["Operacion controlada", "Compras y devoluciones sensibles pueden pasar por aprobacion antes de afectar el inventario."],
];

const stack = [
  ["Empresa", "Datos separados por organizacion para que cada cliente use el mismo SaaS sin mezclar informacion."],
  ["Plan", "Limites reales para productos, usuarios, reportes, auditoria y operaciones en vivo."],
  ["Documento", "Ventas, compras y devoluciones con multiples productos y detalle de cada linea."],
  ["Evento", "Notificaciones persistentes y mensajes en tiempo real cuando el plan lo permite."],
];

const timeline = [
  ["1", "Registro", "La empresa crea su organizacion e inicia en Free."],
  ["2", "Configuracion", "Agrega usuarios, roles, productos, clientes y proveedores."],
  ["3", "Operacion", "Compra, vende, devuelve, aprueba y consulta reportes."],
  ["4", "Escala", "Cambia a Basic o Premium cuando necesita mas capacidad."],
];

const PublicCompanyPage = () => (
  <PublicLayout>
    <main>
      <section className="relative overflow-hidden bg-[#101114] px-5 py-24 text-white lg:px-8">
        <img
          src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=2200&q=85"
          alt="Equipo revisando operaciones de una empresa"
          className="absolute inset-0 h-full w-full object-cover opacity-42"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#101114] via-[#101114]/88 to-[#101114]/40" />
        <div className="relative mx-auto max-w-7xl">
          <p className="text-sm font-black uppercase text-[#84f0d9]">Empresa</p>
          <h1 className="mt-4 max-w-4xl text-5xl font-black leading-tight md:text-6xl">
            Una plataforma SaaS para operaciones de inventario modernas
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/75">
            SmartInventory esta pensado para pymes que necesitan trazabilidad,
            control de stock, reportes, roles y una experiencia preparada para crecer.
          </p>
        </div>
      </section>

      <section className="px-5 py-20 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-4">
          {pillars.map(([title, description]) => (
            <article key={title} className="rounded-md border border-black/10 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-black text-[#171717]">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-[#646b77]">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white px-5 py-20 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase text-[#7455ff]">Arquitectura SaaS</p>
            <h2 className="mt-3 text-4xl font-black leading-tight md:text-5xl">
              El producto no es solo un login con datos
            </h2>
            <p className="mt-4 text-base leading-7 text-[#5f6673]">
              La plataforma combina empresas, planes, roles, documentos, auditoria,
              notificaciones y eventos en vivo. Esa estructura permite atender a
              varias empresas desde el mismo sistema sin perder control operativo.
            </p>
            <Link to="/apps" className="mt-7 inline-flex rounded-md bg-[#171717] px-5 py-3 text-sm font-black text-white transition hover:bg-[#333333]">
              Ver aplicaciones
            </Link>
          </div>
          <div className="rounded-md border border-black/10 bg-[#f7f8fb] p-4">
            <div className="rounded-md bg-[#101114] p-5 text-white">
              <p className="text-xs font-black uppercase text-[#84f0d9]">Modelo de plataforma</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {stack.map(([title, description]) => (
                  <div key={title} className="rounded-md border border-white/10 bg-white/6 p-4">
                    <h3 className="text-lg font-black">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/60">{description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase text-[#08a88a]">Adopcion</p>
            <h2 className="mt-3 text-4xl font-black">De registro a operacion continua</h2>
            <p className="mt-4 text-base leading-7 text-[#5f6673]">
              La experiencia publica prepara al cliente para entender como empieza,
              que configura y como escala el uso de la plataforma.
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-4">
            {timeline.map(([number, title, description]) => (
              <article key={title} className="rounded-md border border-black/10 bg-white p-5">
                <span className="grid h-10 w-10 place-items-center rounded-md bg-[#7455ff] text-sm font-black text-white">
                  {number}
                </span>
                <h3 className="mt-5 text-xl font-black">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#646b77]">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-20 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 rounded-md bg-[#101114] p-8 text-white md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-sm font-black uppercase text-[#84f0d9]">SmartInventory</p>
            <h2 className="mt-3 text-3xl font-black">Listo para operar como producto SaaS</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">
              Sitio publico, registro de empresa, planes, limites, roles, reportes,
              aprobaciones, notificaciones y centro de operaciones en tiempo real.
            </p>
          </div>
          <Link to="/register" className="w-fit rounded-md bg-white px-5 py-3 text-sm font-black text-[#171717] transition hover:bg-[#e5e7eb]">
            Crear empresa
          </Link>
        </div>
      </section>
    </main>
  </PublicLayout>
);

export default PublicCompanyPage;
