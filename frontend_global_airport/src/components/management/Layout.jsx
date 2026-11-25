
import { NavLink, Outlet } from "react-router-dom";
import { Plane, LayoutDashboard, Users, Building2, Contact, PlaneTakeoff, Ticket, UserRound, ChartNoAxesCombined, LogOut, } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { tienePermiso } from "../../config/permissions";

const modules = [
  {
    title: "Inicio",
    icon: LayoutDashboard,
    path: "/Home",
    modulo: "inicio",
  },
  {
    title: "Usuarios",
    icon: Users,
    path: "/usuarios",
    modulo: "usuarios",
  },
  {
    title: "Aeropuertos",
    icon: Building2,
    path: "/aeropuertos",
    modulo: "aeropuertos",
  },
  {
    title: "Pasajeros",
    icon: Contact,
    path: "/pasajeros",
    modulo: "pasajeros",
  },
  {
    title: "Vuelos",
    icon: PlaneTakeoff,
    path: "/vuelos",
    modulo: "vuelos",
  },
  {
    title: "Reservaciones",
    icon: Ticket,
    path: "/reservaciones",
    modulo: "reservaciones",
  },
  {
    title: "Pilotos",
    icon: UserRound,
    path: "/pilotos",
    modulo: "pilotos",
  },
  {
    title: "Reportes e indicadores",
    icon: ChartNoAxesCombined,
    path: "/reportes",
    modulo: "reportes",
  },
];

export default function Layout() {
  const navigate = useNavigate();
  const {
    usuario,
    rol,
    aeropuertoActivo,
    accesoGlobal,
    cerrarSesion,
  } = useAuth();

  const modulosPermitidos = modules.filter((module) =>
    tienePermiso(rol, module.modulo, "consultar")
  );

  function handleCerrarSesion() {
    cerrarSesion();
    navigate("/login", { replace: true });
  }
  const nombresRoles = {
    ADMIN_GENERAL: "Administrador general",
    ADMIN_AEROPUERTO: "Administrador de aeropuerto",
    EMPLEADO: "Empleado",
  };

  const nombreRol = nombresRoles[rol] || rol;

  const nombreAeropuerto = accesoGlobal
    ? "Acceso global"
    : aeropuertoActivo?.nombre || "Sin aeropuerto asignado";

  const iniciales = usuario?.nombreCompleto
    ?.trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((nombre) => nombre.charAt(0))
    .join("")
    .toUpperCase() || "U";

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <aside className="hidden h-screen w-72 shrink-0 flex-col bg-[#0C2D57] text-white lg:flex">
        <NavLink
          to="/Home"
          className="flex items-center gap-3 border-b border-white/10 px-6 py-7"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500">
            <Plane className="h-6 w-6" />
          </span>

          <span className="text-xl font-extrabold">
            Global <span className="text-sky-300">Airport</span>
          </span>
        </NavLink>

        <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-7">
          <p className="mb-4 px-3 text-xs font-bold uppercase tracking-widest text-blue-200/70">
            Menú principal
          </p>

          {modulosPermitidos.map((module) => {
            const Icon = module.icon;

            return (
              <NavLink
                key={module.path}
                to={module.path}
                end={module.path === "/Home"}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 transition ${isActive
                    ? "bg-sky-500 font-semibold text-white"
                    : "text-blue-100 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{module.title}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Perfil del usuario autenticado */}
        <div className="border-t border-white/10 px-4 py-5">

          <div className="flex items-center gap-3 px-2">

            {/* Avatar con iniciales */}
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky-500 font-bold text-white">
              {iniciales}
            </div>

            {/* Información del usuario */}
            <div className="min-w-0 flex-1">

              <p
                className="truncate text-sm font-bold text-white"
                title={usuario?.nombreCompleto}
              >
                {usuario?.nombreCompleto}
              </p>

              <p className="mt-1 text-xs text-blue-200">
                {nombreRol}
              </p>

              <p className="mt-1 text-xs font-medium text-sky-300">
                {nombreAeropuerto}
              </p>

            </div>
          </div>

          {/* Cerrar sesión */}
          <button
            type="button"
            onClick={handleCerrarSesion}
            className="mt-5 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-blue-100 transition hover:bg-red-500/15 hover:text-red-300"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span>Cerrar sesión</span>
          </button>

        </div>
      </aside>

      <main className="h-screen min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
        <div className="app-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
