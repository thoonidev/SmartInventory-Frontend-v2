import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import ApiService from "../service/ApiService";
import { canUseFeature, getFeatureRequirement, planLabel } from "../utils/planAccess";

const logout = () => {
  ApiService.logout();
  window.location.href = "/login";
};

const iconPaths = {
  menu: "M4 7h16M4 12h16M4 17h16",
  principal: "M4 13h6V4H4v9zM14 20h6V4h-6v16zM4 20h6v-3H4v3z",
  inventory: "M4 7l8-4 8 4-8 4-8-4zM4 7v10l8 4 8-4V7M12 11v10",
  contacts: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  sales: "M6 2l1.5 4H21l-2 8H8L6 2H3M9 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM18 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2z",
  quality: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 12l2 2 4-4",
  admin: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.08a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.88.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.08a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.88l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.08a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.88-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c.22.6.78 1 1.43 1H21a2 2 0 1 1 0 4h-.08a1.7 1.7 0 0 0-1.52 1z",
  user: "M20 21a8 8 0 0 0-16 0M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  logout: "M10 17l5-5-5-5M15 12H3M21 3v18",
  lock: "M7 11V8a5 5 0 0 1 10 0v3M6 11h12v10H6V11z",
  chevron: "M9 18l6-6-6-6",
};

const SidebarIcon = ({ name, className = "h-4 w-4" }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={iconPaths[name] || iconPaths.principal} />
  </svg>
);

const buildGroups = ({ isAuth, isAdmin, canOperate }) => [
  {
    id: "principal",
    title: "Principal",
    icon: "principal",
    visible: isAuth,
    items: [
      { label: "Panel ejecutivo", to: "/dashboard" },
      { label: "Logistica integral", to: "/logistics" },
      { label: "Almacenes y sedes", to: "/warehouses" },
      { label: "Movimientos", to: "/transaction" },
      { label: "Centro operativo", to: "/live", marker: "Ahora", feature: "live" },
      { label: "Reportes", to: "/reports", feature: "reports" },
      { label: "Alertas", to: "/notifications" },
    ],
  },
  {
    id: "inventory",
    title: "Inventario",
    icon: "inventory",
    visible: isAdmin,
    items: [
      { label: "Productos", to: "/product" },
      { label: "Categorias", to: "/category" },
    ],
  },
  {
    id: "contacts",
    title: "Contactos",
    icon: "contacts",
    visible: isAdmin,
    items: [
      { label: "Proveedores", to: "/supplier" },
      { label: "Clientes", to: "/customer" },
    ],
  },
  {
    id: "sales",
    title: "Compras y ventas",
    icon: "sales",
    visible: canOperate,
    items: [
      { label: "Compras", to: "/purchase" },
      { label: "Aprobaciones", to: "/approvals" },
      { label: "Ventas", to: "/sell" },
      { label: "Devolucion proveedor", to: "/return-to-supplier" },
      { label: "Devolucion cliente", to: "/return-from-customer" },
    ],
  },
  {
    id: "quality",
    title: "Calidad y produccion",
    icon: "quality",
    visible: isAuth,
    items: [
      { label: "Calidad ISO 9001", to: "/quality" },
      { label: "Produccion", to: "/production" },
    ],
  },
  {
    id: "admin",
    title: "Administracion",
    icon: "admin",
    visible: isAdmin,
    items: [
      { label: "Auditoria", to: "/audit", feature: "audit" },
      { label: "Empresa", to: "/organization" },
      { label: "Plan", to: "/plan" },
    ],
  },
].filter((group) => group.visible);

const Sidebar = () => {
  const isAuth = ApiService.isAuthenticated();
  const isAdmin = ApiService.isAdmin();
  const canOperate = ApiService.isAdmin() || ApiService.isManager();
  const organization = ApiService.getOrganization();
  const location = useLocation();
  const scrollRef = useRef(null);
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("smartinventory.sidebar.collapsed") === "true"
  );
  const [openGroups, setOpenGroups] = useState(() => {
    const stored = localStorage.getItem("smartinventory.sidebar.groups");
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  });
  const [flyout, setFlyout] = useState(null);

  const groups = useMemo(
    () => buildGroups({ isAuth, isAdmin, canOperate }),
    [isAuth, isAdmin, canOperate]
  );

  useLayoutEffect(() => {
    const savedScroll = Number(sessionStorage.getItem("smartinventory.sidebar.scroll") || 0);
    if (scrollRef.current) scrollRef.current.scrollTop = savedScroll;
  }, []);

  useEffect(() => {
    if (openGroups === null) {
      const initialGroups = Object.fromEntries(groups.map((group) => [group.id, true]));
      localStorage.setItem("smartinventory.sidebar.groups", JSON.stringify(initialGroups));
      setOpenGroups(initialGroups);
      return;
    }
    const activeGroup = groups.find((group) =>
      group.items.some((item) => item.to === location.pathname)
    );
    if (activeGroup && !openGroups[activeGroup.id]) {
      setOpenGroups((current) => ({ ...current, [activeGroup.id]: true }));
    }
  }, [groups, location.pathname, openGroups]);

  const rememberScroll = () => {
    if (scrollRef.current) {
      sessionStorage.setItem("smartinventory.sidebar.scroll", String(scrollRef.current.scrollTop));
    }
  };

  const toggleCollapsed = () => {
    setFlyout(null);
    setCollapsed((current) => {
      localStorage.setItem("smartinventory.sidebar.collapsed", String(!current));
      return !current;
    });
  };

  const toggleGroup = (groupId) => {
    setOpenGroups((current) => {
      const next = { ...(current || {}), [groupId]: !current?.[groupId] };
      localStorage.setItem("smartinventory.sidebar.groups", JSON.stringify(next));
      return next;
    });
  };

  const openFlyout = (event, group) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setFlyout((current) =>
      current?.id === group.id
        ? null
        : { id: group.id, top: Math.max(84, rect.top), group }
    );
  };

  return (
    <aside className={`relative hidden h-screen shrink-0 border-r border-[#d8dee8] bg-[#f6f8fb] py-5 transition-all duration-200 lg:flex lg:flex-col ${collapsed ? "w-20 px-3" : "w-72 px-4"}`}>
      <div className="mb-5 rounded-md border border-[#d8dee8] bg-white p-3 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase text-[#647084]">
              {collapsed ? "SI" : "SmartInventory"}
            </p>
            {!collapsed && (
              <>
                <h1 className="mt-1 truncate text-base font-bold text-[#172033]">
                  {organization?.name || "Enterprise Cloud"}
                </h1>
                <p className="mt-2 text-xs text-[#647084]">Inventario, logistica y calidad</p>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={toggleCollapsed}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-[#d8dee8] bg-[#f8fafc] text-[#526071] transition hover:bg-white hover:text-[#172033]"
            title={collapsed ? "Expandir menu" : "Plegar menu"}
            aria-label={collapsed ? "Expandir menu" : "Plegar menu"}
          >
            <SidebarIcon name="menu" className="h-5 w-5" />
          </button>
        </div>
      </div>

      <nav
        ref={scrollRef}
        onScroll={rememberScroll}
        className={`min-h-0 flex-1 space-y-2 overflow-y-auto ${collapsed ? "overflow-x-visible" : "pr-1"}`}
      >
        {groups.map((group) => (
          collapsed ? (
            <CollapsedGroup
              key={group.id}
              group={group}
              active={group.items.some((item) => item.to === location.pathname)}
              onOpen={openFlyout}
            />
          ) : (
            <ExpandedGroup
              key={group.id}
              group={group}
              open={Boolean(openGroups?.[group.id])}
              onToggle={() => toggleGroup(group.id)}
              onNavigate={() => setFlyout(null)}
            />
          )
        ))}
      </nav>

      {isAuth && (
        <div className="mt-4 space-y-2 border-t border-[#d8dee8] pt-4">
          <ul>
            <SidebarLink item={{ label: "Perfil", to: "/profile", icon: "user" }} collapsed={collapsed} />
          </ul>
          <button
            type="button"
            onClick={logout}
            className={`flex w-full items-center ${collapsed ? "justify-center px-2" : "justify-between px-3"} rounded-md border border-[#f4c7c7] bg-[#fff4f4] py-2 text-sm font-bold text-[#9b2c2c] transition hover:bg-[#ffecec]`}
            title="Cerrar sesion"
          >
            {collapsed ? (
              <SidebarIcon name="logout" className="h-5 w-5" />
            ) : (
              <>
                <span className="flex items-center gap-2">
                  <SidebarIcon name="logout" />
                  Cerrar sesion
                </span>
              </>
            )}
          </button>
        </div>
      )}

      {collapsed && flyout && (
        <div
          className="fixed left-24 z-50 w-64 rounded-lg border border-[#d8dee8] bg-white p-3 shadow-2xl"
          style={{ top: flyout.top }}
        >
          <div className="mb-2 flex items-center gap-2 border-b border-[#eef2f6] pb-3">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-[#e8f1fb] text-[#123c69]">
              <SidebarIcon name={flyout.group.icon} />
            </span>
            <p className="text-sm font-black text-[#172033]">{flyout.group.title}</p>
          </div>
          <ul className="space-y-1">
            {flyout.group.items.map((item) => (
              <SidebarLink
                key={item.to}
                item={item}
                collapsed={false}
                onNavigate={() => setFlyout(null)}
              />
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
};

const ExpandedGroup = ({ group, open, onToggle, onNavigate }) => (
  <section>
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm font-black text-[#526071] transition hover:bg-white hover:text-[#172033]"
    >
      <span className="flex min-w-0 items-center gap-2">
        <SidebarIcon name={group.icon} />
        <span className="truncate">{group.title}</span>
      </span>
      <SidebarIcon name="chevron" className={`h-4 w-4 transition ${open ? "rotate-90" : ""}`} />
    </button>
    {open && (
      <ul className="mt-1 space-y-1 pl-2">
        {group.items.map((item) => (
          <SidebarLink key={item.to} item={item} onNavigate={onNavigate} />
        ))}
      </ul>
    )}
  </section>
);

const CollapsedGroup = ({ group, active, onOpen }) => {
  const locked = group.items.some((item) => item.feature && !canUseFeature(item.feature));
  return (
    <button
      type="button"
      onClick={(event) => onOpen(event, group)}
      className={`relative grid h-11 w-full place-items-center rounded-md border transition ${
        active
          ? "border-[#b7cde5] bg-white text-[#123c69] shadow-sm"
          : "border-transparent text-[#465366] hover:border-[#d8dee8] hover:bg-white hover:text-[#172033]"
      }`}
      title={group.title}
      aria-label={group.title}
    >
      <SidebarIcon name={group.icon} className="h-5 w-5" />
      {locked && <LockBadge compact />}
    </button>
  );
};

const SidebarLink = ({ item, collapsed = false, onNavigate }) => {
  const requirement = item.feature ? getFeatureRequirement(item.feature) : null;
  const locked = item.feature ? !canUseFeature(item.feature) : false;
  const badge = locked ? planLabel(requirement?.plan) : item.marker;
  const compactLabel = item.label.slice(0, 2).toUpperCase();

  return (
    <li>
      <NavLink
        to={item.to}
        onClick={onNavigate}
        title={locked ? `${item.label} - requiere ${badge}` : item.label}
        className={({ isActive }) =>
          `flex items-center ${collapsed ? "justify-center px-2" : "justify-between px-3"} rounded-md border py-2 text-sm font-semibold transition ${
            isActive
              ? "border-[#b7cde5] bg-white text-[#123c69] shadow-sm"
              : "border-transparent text-[#465366] hover:border-[#d8dee8] hover:bg-white hover:text-[#172033]"
          }`
        }
      >
        {collapsed ? (
          <span className="relative grid h-8 w-8 place-items-center rounded-md bg-white text-[11px] font-black shadow-sm">
            {item.icon ? <SidebarIcon name={item.icon} className="h-5 w-5" /> : compactLabel}
            {locked && <LockBadge compact />}
          </span>
        ) : (
          <>
            <span className={`flex min-w-0 items-center gap-2 ${locked ? "text-[#647084]" : ""}`}>
              {item.icon && <SidebarIcon name={item.icon} />}
              <span className="truncate">{item.label}</span>
            </span>
            {badge && (
              <span className={`ml-2 flex shrink-0 items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold ${
                locked ? "border border-[#d8dee8] bg-white text-[#7b8798]" : "bg-[#edf7f3] text-[#2f6f73]"
              }`}>
                {locked && <SidebarIcon name="lock" className="h-3 w-3" />}
                {badge}
              </span>
            )}
          </>
        )}
      </NavLink>
    </li>
  );
};

const LockBadge = ({ compact = false }) => (
  <span className={`absolute grid place-items-center rounded-full border border-[#d8dee8] bg-white text-[#7b8798] ${compact ? "-right-1 -top-1 h-4 w-4" : "h-5 w-5"}`}>
    <SidebarIcon name="lock" className="h-2.5 w-2.5" />
  </span>
);

export default Sidebar;
