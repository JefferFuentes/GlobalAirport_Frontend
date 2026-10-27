
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
  Bell,
  Search,
  Menu,
  ArrowUpRight,
  Settings,
  LogOut,
} from "lucide-react";

const modules = [
  {
    title: "Usuarios",
    description: "Administra las cuentas, los roles y los permisos.",
    icon: Users,
    color: "bg-sky-100 text-sky-700",
    path: "/usuarios",
  },
  {
    title: "Aeropuertos",
    description: "Consulta y administra la información aeroportuaria.",
    icon: Building2,
    color: "bg-blue-100 text-blue-800",
    path: "/aeropuertos",
  },
  {
    title: "Pasajeros",
    description: "Gestiona los datos y la información de los pasajeros.",
    icon: Contact,
    color: "bg-cyan-100 text-cyan-800",
    path: "/pasajeros",
  },
  {
    title: "Vuelos",
    description: "Organiza los vuelos y consulta su programación.",
    icon: PlaneTakeoff,
    color: "bg-indigo-100 text-indigo-800",
    path: "/vuelos",
  },
  {
    title: "Reservaciones",
    description: "Administra las reservas y sus detalles.",
    icon: Ticket,
    color: "bg-sky-100 text-sky-700",
    path: "/reservaciones",
  },
  {
    title: "Pilotos",
    description: "Consulta y administra la información de los pilotos.",
    icon: UserRound,
    color: "bg-blue-100 text-blue-800",
    path: "/pilotos",
  },
  {
    title: "Reportes e indicadores",
    description: "Visualiza estadísticas y analiza los resultados.",
    icon: ChartNoAxesCombined,
    color: "bg-cyan-100 text-cyan-800",
    path: "/reportes",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-700">
      {/* Barra lateral y contenido */}
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 flex-col bg-[#0C2D57] text-white lg:flex">
          <a
            href="/"
            className="flex items-center gap-3 border-b border-white/10 px-6 py-7"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500">
              <Plane className="h-6 w-6" />
            </span>
            <span className="text-xl font-extrabold">
              Global <span className="text-sky-300">Airport</span>
            </span>
          </a>

          <nav className="flex-1 space-y-2 px-4 py-7">
            <p className="mb-4 px-3 text-xs font-bold uppercase tracking-widest text-blue-200/70">
              Menú principal
            </p>

            <a
              href="/"
              className="flex items-center gap-3 rounded-xl bg-sky-500 px-4 py-3 font-semibold text-white"
            >
              <LayoutDashboard className="h-5 w-5" />
              Inicio
            </a>

            {modules.map((module) => {
              const Icon = module.icon;

              return (
                <a
                  key={module.title}
                  href={module.path}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-blue-100 transition hover:bg-white/10 hover:text-white"
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span>{module.title}</span>
                </a>
              );
            })}
          </nav>

          <div className="space-y-2 border-t border-white/10 p-4">
            <a
              href="/configuracion"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-blue-100 hover:bg-white/10"
            >
              <Settings className="h-5 w-5" />
              Configuración
            </a>

            <a
              href="/login"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-blue-100 hover:bg-white/10"
            >
              <LogOut className="h-5 w-5" />
              Cerrar sesión
            </a>
          </div>
        </aside>

        {/* Área principal */}
        <main className="min-w-0 flex-1">
          {/* Encabezado */}
          <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-sky-100 bg-white/95 px-5 py-4 backdrop-blur md:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700 lg:hidden">
                <Menu className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm text-slate-500">Global Airport</p>
                <h1 className="text-xl font-extrabold text-[#0C2D57] md:text-2xl">
                  Panel principal
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 sm:flex">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  type="search"
                  placeholder="Buscar módulo..."
                  className="w-36 bg-transparent text-sm outline-none md:w-48"
                  aria-label="Buscar módulo"
                />
              </label>

              <button
                type="button"
                aria-label="Notificaciones"
                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-[#0C2D57] transition hover:bg-sky-50"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-sky-500" />
              </button>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0C2D57] font-bold text-white">
                GA
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-7xl space-y-8 px-5 py-8 md:px-8 md:py-10">
            {/* Bienvenida */}
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0C2D57] via-blue-800 to-sky-600 p-7 text-white shadow-lg md:p-10">
              <div className="absolute -right-12 -top-16 h-64 w-64 rounded-full border-[35px] border-white/10" />
              <div className="absolute -bottom-24 right-40 h-52 w-52 rounded-full bg-sky-300/10" />

              <div className="relative max-w-2xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm text-sky-100">
                  <Plane className="h-4 w-4" />
                  Sistema de gestión aeroportuaria
                </span>

                <h2 className="mt-5 text-3xl font-extrabold leading-tight md:text-4xl">
                  Bienvenido a Global Airport
                </h2>

                <p className="mt-3 max-w-xl leading-7 text-blue-100">
                  Gestiona los procesos del aeropuerto desde un solo lugar.
                  Selecciona un módulo para comenzar a trabajar.
                </p>

                <a
                  href="#modulos"
                  className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-white px-5 py-3 font-bold text-[#0C2D57] transition hover:bg-sky-100"
                >
                  Explorar módulos
                  <ArrowUpRight className="h-5 w-5" />
                </a>
              </div>
            </section>

            {/* Título de módulos */}
            <section id="modulos">
              <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-sky-600">
                    Administración
                  </p>
                  <h2 className="mt-2 text-2xl font-extrabold text-[#0C2D57] md:text-3xl">
                    Módulos del sistema
                  </h2>
                  <p className="mt-2 text-slate-500">
                    Accede a las herramientas de gestión aeroportuaria.
                  </p>
                </div>

                <span className="w-fit rounded-full bg-sky-100 px-3 py-1.5 text-sm font-semibold text-sky-800">
                  {modules.length} módulos
                </span>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {modules.map((module) => {
                  const Icon = module.icon;

                  return (
                    <a
                      key={module.title}
                      href={module.path}
                      className="group flex min-h-52 flex-col rounded-2xl border border-sky-100 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-sky-300 hover:shadow-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div
                          className={`flex h-14 w-14 items-center justify-center rounded-2xl ${module.color}`}
                        >
                          <Icon className="h-7 w-7" />
                        </div>

                        <ArrowUpRight className="h-5 w-5 text-slate-300 transition group-hover:text-sky-600" />
                      </div>

                      <h3 className="mt-5 text-lg font-bold text-[#0C2D57]">
                        {module.title}
                      </h3>

                      <p className="mt-2 flex-1 text-sm leading-6 text-slate-500">
                        {module.description}
                      </p>

                      <span className="mt-4 text-sm font-bold text-sky-700 group-hover:text-blue-900">
                        Abrir módulo →
                      </span>
                    </a>
                  );
                })}
              </div>
            </section>

            {/* Pie */}
            <footer className="border-t border-sky-100 py-6 text-center text-sm text-slate-500 md:flex md:justify-between md:text-left">
              <p>© 2026 Global Airport. Todos los derechos reservados.</p>
              <p className="mt-2 text-[#0C2D57] md:mt-0">
                Gestión aeroportuaria inteligente
              </p>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
