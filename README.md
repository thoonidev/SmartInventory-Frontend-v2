# SmartInventory — Frontend v2

Aplicación web para gestionar inventarios y operaciones de una organización. Se conecta a la API de SmartInventory para administrar productos, movimientos de stock y procesos operativos desde un mismo panel.

## Funcionalidades

- Gestión de productos, categorías, proveedores y clientes.
- Registro de compras, ventas y devoluciones, con seguimiento de transacciones.
- Panel de indicadores, alertas de inventario y sugerencias de reposición.
- Gestión de almacenes, controles de calidad y órdenes de producción.
- Reportes en PDF y Excel, auditoría, notificaciones y eventos en tiempo real.
- Autenticación, acceso por roles y funciones según el plan de la organización.

## Tecnologías

React 19 · Vite 6 · Tailwind CSS 4 · React Router 7 · Axios · Recharts · WebSocket

## Instalación y ejecución

Requiere Node.js, pnpm y el backend de SmartInventory en ejecución. El repositorio incluye `pnpm-lock.yaml`.

```bash
git clone https://github.com/thoonidev/SmartInventory-Frontend-v2.git
cd SmartInventory-Frontend-v2
pnpm install
```

Copia `.env.example` como `.env.local` y configura la dirección de la API:

```env
VITE_API_URL=http://localhost:5050/api
```

Inicia el servidor de desarrollo:

```bash
pnpm dev
```

Abre la dirección que indique la terminal, normalmente `http://localhost:5173`. Para iniciar sesión y utilizar los módulos, la API debe estar disponible; las funciones en tiempo real también requieren el servicio WebSocket del backend.

## Comandos

| Comando | Descripción |
| --- | --- |
| `pnpm dev` | Inicia el entorno de desarrollo. |
| `pnpm build` | Genera la versión de producción en `dist/`. |
| `pnpm preview` | Permite revisar la compilación localmente. |
| `pnpm lint` | Revisa el código con ESLint. |
