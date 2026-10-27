import React from "react";
import { Link, NavLink } from "react-router-dom";

const navItems = [
  ["Aplicaciones", "/apps"],
  ["Precios", "/pricing"],
  ["Empresa", "/company"],
];

const suiteLinks = [
  ["Inventario", "/apps"],
  ["Compras", "/apps"],
  ["Ventas", "/apps"],
  ["Clientes", "/apps"],
  ["Reportes", "/apps"],
  ["Tiempo real", "/apps"],
];

const footerGroups = [
  {
    title: "Producto",
    links: [["Aplicaciones", "/apps"], ["Precios", "/pricing"], ["Operaciones en vivo", "/apps"], ["Aprobaciones", "/apps"]],
  },
  {
    title: "Soluciones",
    links: [["Retail", "/apps"], ["Distribucion", "/apps"], ["Ferreterias", "/apps"], ["Almacenes", "/apps"]],
  },
  {
    title: "Empresa",
    links: [["Sobre SmartInventory", "/company"], ["Seguridad", "/company"], ["Arquitectura SaaS", "/company"], ["Contacto", "/company"]],
  },
  {
    title: "Acceso",
    links: [["Iniciar sesion", "/login"], ["Crear empresa", "/register"], ["Mi plan", "/pricing"]],
  },
];

const PublicLayout = ({ children }) => (
  <div className="min-h-screen bg-[#f7f8fb] text-[#171717]">
    <header className="sticky top-0 z-40 border-b border-black/10 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-[#7455ff] text-base font-black text-white">
            SI
          </span>
          <span>
            <span className="block text-lg font-black leading-5 text-[#171717]">SmartInventory</span>
            <span className="hidden text-[11px] font-bold uppercase text-[#737373] sm:block">Business suite</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-bold text-[#4b5563] md:flex">
          {navItems.map(([label, path]) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                isActive ? "text-[#171717]" : "transition hover:text-[#171717]"
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2 text-sm font-bold">
          <Link to="/login" className="rounded-md px-3 py-2 text-[#374151] transition hover:bg-black/5">
            Iniciar sesion
          </Link>
          <Link to="/register" className="rounded-md bg-[#171717] px-4 py-2 text-white transition hover:bg-[#333333]">
            Crear empresa
          </Link>
        </div>
      </div>
      <div className="hidden border-t border-black/5 bg-white md:block">
        <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-8 py-2">
          {suiteLinks.map(([label, path], index) => (
            <Link
              key={label}
              to={path}
              className="flex min-w-fit items-center gap-2 rounded-md px-3 py-2 text-xs font-bold text-[#4b5563] transition hover:bg-[#f1f5f9] hover:text-[#171717]"
            >
              <span className={`h-2.5 w-2.5 rounded-sm ${appDotClasses[index % appDotClasses.length]}`} />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </header>

    {children}

    <footer className="bg-[#101114] px-5 py-14 text-white lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.25fr_2fr]">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-[#7455ff] font-black">SI</span>
            <div>
              <h2 className="text-xl font-black">SmartInventory</h2>
              <p className="text-xs font-bold uppercase text-white/45">Suite SaaS para pymes</p>
            </div>
          </div>
          <p className="mt-5 max-w-md text-sm leading-6 text-white/60">
            Inventario, ventas, compras, clientes, proveedores, aprobaciones,
            reportes y operaciones en tiempo real en una plataforma multiempresa.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {["Multiempresa", "Roles", "Reportes", "Tiempo real"].map((tag) => (
              <span key={tag} className="rounded-md border border-white/10 px-3 py-1.5 text-xs font-bold text-white/70">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {footerGroups.map((group) => (
            <FooterColumn key={group.title} {...group} />
          ))}
        </div>
      </div>
      <div className="mx-auto mt-12 flex max-w-7xl flex-col gap-3 border-t border-white/10 pt-6 text-xs font-semibold text-white/45 sm:flex-row sm:items-center sm:justify-between">
        <span>SmartInventory SaaS. Todos los derechos reservados.</span>
        <span>Privacidad / Terminos / Seguridad</span>
      </div>
    </footer>
  </div>
);

const FooterColumn = ({ title, links }) => (
  <div>
    <h3 className="text-xs font-black uppercase text-white/80">{title}</h3>
    <ul className="mt-4 space-y-3 text-sm text-white/55">
      {links.map(([label, path]) => (
        <li key={`${title}-${label}`}>
          <Link to={path} className="transition hover:text-white">
            {label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

const appDotClasses = [
  "bg-[#7455ff]",
  "bg-[#08a88a]",
  "bg-[#f59e0b]",
  "bg-[#2563eb]",
  "bg-[#ef4444]",
  "bg-[#14b8a6]",
];

export default PublicLayout;
