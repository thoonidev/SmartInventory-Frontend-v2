import React from "react";
import { Link } from "react-router-dom";
import PublicLayout from "../component/PublicLayout";

const appModules = [
  ["Inventario", "Stock por empresa, SKU, categorias, imagenes y punto de reposicion.", "bg-[#7455ff]"],
  ["Compras", "Ordenes multi-producto, proveedores, aprobaciones y recepcion controlada.", "bg-[#08a88a]"],
  ["Ventas", "Clientes, documentos comerciales, descuentos, historial y salida de stock.", "bg-[#f59e0b]"],
  ["Devoluciones", "Retornos de clientes y proveedores con motivo, condicion y trazabilidad.", "bg-[#ef4444]"],
  ["Logistica", "ABC, KPI, bajo stock, rotacion y sugerencias para reordenar.", "bg-[#2563eb]"],
  ["Tiempo real", "Alertas, aprobaciones y actividad en linea para cada empresa.", "bg-[#14b8a6]"],
  ["Reportes", "PDF, Excel, inventario valorizado y analisis comercial.", "bg-[#7c3aed]"],
  ["Auditoria", "Usuarios, roles, acciones criticas y documentos sensibles.", "bg-[#0f766e]"],
];

const industries = [
  ["Retail", "Control de productos, ventas diarias y devoluciones por cliente."],
  ["Distribucion", "Compras grandes, multiples proveedores y reposicion continua."],
  ["Ferreterias", "Catalogos amplios, stock critico y rotacion por familia."],
  ["Almacenes", "Entradas, salidas, aprobaciones y seguimiento operativo."],
];

const events = [
  ["09:41", "Compra OC-00218 enviada a aprobacion", "Compras"],
  ["09:45", "Venta VT-00872 registrada para cliente mayorista", "Ventas"],
  ["09:52", "Stock bajo detectado en SKU-ALM-104", "Inventario"],
  ["10:03", "Devolucion de cliente pendiente de revision", "Soporte"],
];

const LandingPage = () => (
  <PublicLayout>
    <main>
      <section className="relative min-h-[620px] overflow-hidden bg-[#121316] text-white">
        <img
          src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=2200&q=85"
          alt="Almacen moderno con inventario organizado"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#101114] via-[#101114]/82 to-[#101114]/18" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#f7f8fb] to-transparent" />

        <div className="relative mx-auto flex min-h-[620px] max-w-7xl flex-col justify-center px-5 pb-24 pt-16 lg:px-8">
          <p className="w-fit rounded-md bg-white/12 px-3 py-2 text-xs font-black uppercase text-white backdrop-blur">
            Suite SaaS de inventario para pymes
          </p>
          <h1 className="mt-6 max-w-3xl text-5xl font-black leading-[1.02] md:text-7xl">
            SmartInventory
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/78">
            Una plataforma multiempresa para controlar inventario, ventas, compras,
            devoluciones, clientes, reportes, aprobaciones y operaciones en tiempo real.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/register" className="rounded-md bg-white px-5 py-3 text-sm font-black text-[#171717] transition hover:bg-[#e5e7eb]">
              Crear empresa
            </Link>
            <Link to="/apps" className="rounded-md border border-white/35 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10">
              Explorar aplicaciones
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#f7f8fb] px-5 pt-10 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 rounded-md border border-black/10 bg-white p-5 shadow-sm md:grid-cols-4">
          <Metric value="8+" label="aplicaciones conectadas" />
          <Metric value="3" label="planes con limites reales" />
          <Metric value="100%" label="datos separados por empresa" />
          <Metric value="24/7" label="actividad operativa" />
        </div>
      </section>

      <section className="px-5 py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase text-[#7455ff]">Suite modular</p>
            <h2 className="mt-3 text-4xl font-black leading-tight text-[#171717] md:text-5xl">
              Aplicaciones que trabajan juntas desde el primer dia
            </h2>
            <p className="mt-4 text-base leading-7 text-[#5f6673]">
              Cada modulo comparte clientes, productos, usuarios, permisos y movimientos
              de stock. La empresa no salta entre herramientas: opera desde una sola suite.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            {appModules.map(([title, description, color]) => (
              <Link
                key={title}
                to="/apps"
                className="group rounded-md border border-black/10 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <span className={`grid h-11 w-11 place-items-center rounded-md ${color} text-sm font-black text-white`}>
                  {title.slice(0, 2).toUpperCase()}
                </span>
                <h3 className="mt-5 text-lg font-black text-[#171717]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#646b77]">{description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-20 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase text-[#08a88a]">Panel operativo</p>
            <h2 className="mt-3 text-4xl font-black leading-tight md:text-5xl">
              Una vista ejecutiva para decidir rapido
            </h2>
            <p className="mt-4 text-base leading-7 text-[#5f6673]">
              El panel combina inventario valorizado, ventas, compras pendientes,
              alertas de stock y eventos recientes. Eso hace que el SaaS se sienta
              como una plataforma viva, no solo como formularios aislados.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {["Aprobaciones antes de mover stock", "Notificaciones persistentes", "Reportes para administradores", "Limites segun el plan"].map((item) => (
                <div key={item} className="rounded-md border border-black/10 bg-[#f7f8fb] px-4 py-3 text-sm font-bold text-[#374151]">
                  {item}
                </div>
              ))}
            </div>
          </div>
          <ProductMockup />
        </div>
      </section>

      <section className="px-5 py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div>
              <p className="text-sm font-black uppercase text-[#f59e0b]">Operaciones en vivo</p>
              <h2 className="mt-3 text-4xl font-black leading-tight md:text-5xl">
                El equipo ve lo que ocurre mientras ocurre
              </h2>
              <p className="mt-4 text-base leading-7 text-[#5f6673]">
                Cuando una venta baja stock, una compra espera aprobacion o un producto
                llega al minimo, el centro de operaciones muestra el evento por empresa.
              </p>
            </div>
            <div className="rounded-md border border-black/10 bg-[#101114] p-4 text-white shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="text-xs font-black uppercase text-[#08d4af]">Centro de operaciones</p>
                  <h3 className="mt-1 text-2xl font-black">Actividad en tiempo real</h3>
                </div>
                <span className="rounded-md bg-[#08a88a]/20 px-3 py-1.5 text-xs font-black text-[#7df0d7]">
                  En linea
                </span>
              </div>
              <div className="mt-4 space-y-3">
                {events.map(([time, title, area]) => (
                  <div key={`${time}-${title}`} className="grid gap-3 rounded-md bg-white/6 p-4 sm:grid-cols-[72px_1fr_110px] sm:items-center">
                    <span className="text-sm font-black text-white/50">{time}</span>
                    <span className="text-sm font-bold text-white/90">{title}</span>
                    <span className="rounded-md bg-white/10 px-3 py-1.5 text-center text-xs font-black text-white/70">{area}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-black uppercase text-[#7455ff]">Soluciones</p>
              <h2 className="mt-3 text-4xl font-black">Preparado para negocios reales</h2>
            </div>
            <Link to="/pricing" className="w-fit rounded-md bg-[#171717] px-5 py-3 text-sm font-black text-white transition hover:bg-[#333333]">
              Ver planes
            </Link>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-4">
            {industries.map(([title, description]) => (
              <article key={title} className="rounded-md border border-black/10 bg-[#f7f8fb] p-5">
                <h3 className="text-xl font-black">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#646b77]">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  </PublicLayout>
);

const Metric = ({ value, label }) => (
  <div className="min-h-[120px] rounded-md bg-[#f7f8fb] p-5 text-center">
    <p className="text-3xl font-black text-[#171717]">{value}</p>
    <p className="mx-auto mt-2 max-w-[150px] text-xs font-black uppercase leading-5 text-[#737373]">{label}</p>
  </div>
);

const ProductMockup = () => (
  <div className="rounded-md border border-black/10 bg-[#101114] p-4 shadow-2xl">
    <div className="rounded-md bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 px-5 py-4">
        <div>
          <p className="text-xs font-black uppercase text-[#7455ff]">SmartInventory</p>
          <h3 className="text-xl font-black text-[#171717]">Resumen operativo</h3>
        </div>
        <div className="flex gap-2">
          <span className="rounded-md bg-[#e8fff9] px-3 py-1.5 text-xs font-black text-[#087f69]">Premium</span>
          <span className="rounded-md bg-[#fff7e6] px-3 py-1.5 text-xs font-black text-[#a16207]">4 alertas</span>
        </div>
      </div>
      <div className="grid gap-4 p-5 md:grid-cols-4">
        <MiniStat label="Inventario" value="S/ 84,930" color="bg-[#7455ff]" />
        <MiniStat label="Ventas mes" value="S/ 31,420" color="bg-[#f59e0b]" />
        <MiniStat label="Compras" value="18" color="bg-[#08a88a]" />
        <MiniStat label="Pendientes" value="6" color="bg-[#ef4444]" />
      </div>
      <div className="grid gap-4 px-5 pb-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-md border border-black/10">
          {["Laptop Lenovo ThinkPad", "Taladro Bosch 650W", "Caja organizadora 40L", "Mouse Logitech M185"].map((item, index) => (
            <div key={item} className="grid grid-cols-[1fr_70px_80px] gap-3 border-b border-black/5 px-4 py-3 text-sm last:border-b-0">
              <span className="font-bold text-[#374151]">{item}</span>
              <span className="text-[#737373]">{[18, 7, 42, 96][index]} und.</span>
              <span className={`rounded-md px-2 py-1 text-center text-xs font-black ${index === 1 ? "bg-[#fee2e2] text-[#b91c1c]" : "bg-[#dcfce7] text-[#166534]"}`}>
                {index === 1 ? "Critico" : "OK"}
              </span>
            </div>
          ))}
        </div>
        <div className="rounded-md border border-black/10 p-4">
          <p className="text-sm font-black text-[#171717]">Rotacion por categoria</p>
          <div className="mt-4 space-y-3">
            <Bar label="Tecnologia" width="86%" color="bg-[#7455ff]" />
            <Bar label="Herramientas" width="64%" color="bg-[#f59e0b]" />
            <Bar label="Almacen" width="52%" color="bg-[#08a88a]" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const MiniStat = ({ label, value, color }) => (
  <div className="rounded-md border border-black/10 p-4">
    <span className={`block h-2 w-10 rounded-sm ${color}`} />
    <p className="mt-4 text-xs font-black uppercase text-[#737373]">{label}</p>
    <p className="mt-1 text-xl font-black text-[#171717]">{value}</p>
  </div>
);

const Bar = ({ label, width, color }) => (
  <div>
    <div className="flex justify-between text-xs font-black text-[#5f6673]">
      <span>{label}</span>
      <span>{width}</span>
    </div>
    <div className="mt-2 h-2 rounded-full bg-black/10">
      <div className={`h-2 rounded-full ${color}`} style={{ width }} />
    </div>
  </div>
);

export default LandingPage;
