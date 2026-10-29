
import { NavLink, Outlet } from "react-router-dom";
import {
  Plane,
  LayoutDashboard,
  Users,
  Building2,
  Contact,
  PlaneTakeoff,
  Ticket,
  UserRound,
  ChartNoAxesCombined,
  LogOut,
} from "lucide-react";

const modules = [
  {
    title: "Inicio",
    icon: LayoutDashboard,
    path: "/Home",
  },
  {
    title: "Usuarios",
    icon: Users,
    path: "/usuarios",
  },
  {
    title: "Aeropuertos",
    icon: Building2,
    path: "/aeropuertos",
  },
  {
    title: "Pasajeros",
    icon: Contact,
    path: "/pasajeros",
  },
  {
    title: "Vuelos",
    icon: PlaneTakeoff,
    path: "/vuelos",
  },
  {
    title: "Reservaciones",
    icon: Ticket,
    path: "/reservaciones",
  },
  {
    title: "Pilotos",
    icon: UserRound,
    path: "/pilotos",
  },
  {
    title: "Reportes e indicadores",
    icon: ChartNoAxesCombined,
    path: "/reportes",
  },
];

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-64 shrink-0 flex-col bg-[#0C2D57] text-white lg:flex">
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

          {modules.map((module) => {
            const Icon = module.icon;

            return (
              <NavLink
                key={module.path}
                to={module.path}
                end={module.path === "/Home"}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 transition ${
                    isActive
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

        <div className="border-t border-white/10 p-4">
          <NavLink
            to="/login"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-blue-100 hover:bg-white/10"
          >
            <LogOut className="h-5 w-5" />
            Cerrar sesión
          </NavLink>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  );
}
