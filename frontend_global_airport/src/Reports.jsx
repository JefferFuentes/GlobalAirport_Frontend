
import { useMemo, useState } from "react";
import { Link } from "react-router-dom"
import {
  ArrowLeft,
  ArrowUpRight,
  Building2,
  CalendarDays,
  ChartNoAxesCombined,
  ChartPie,
  CheckCircle2,
  ClipboardList,
  Contact,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  PlaneTakeoff,
  RefreshCw,
  Ticket,
  Users,
  UserRound,
  BarChart3,
  Search,
  Plane,
  LayoutDashboard,
  Settings,
  LogOut
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

const reportes = [
  {
    id: 1,
    modulo: "Usuarios",
    titulo: "Reporte de usuarios",
    descripcion: "Consulta las cuentas registradas, roles y estado de los usuarios.",
    icon: Users,
    formatos: ["CSV", "Excel"],
  },
  {
    id: 2,
    modulo: "Aeropuertos",
    titulo: "Reporte de aeropuertos",
    descripcion: "Consulta los aeropuertos registrados y sus datos principales.",
    icon: Building2,
    formatos: ["CSV", "Excel"],
  },
  {
    id: 3,
    modulo: "Pasajeros",
    titulo: "Reporte de pasajeros",
    descripcion: "Consulta los pasajeros registrados y su información disponible.",
    icon: Contact,
    formatos: ["CSV", "Excel"],
  },
  {
    id: 4,
    modulo: "Vuelos",
    titulo: "Reporte de vuelos",
    descripcion: "Analiza vuelos programados, fechas, rutas y estados registrados.",
    icon: PlaneTakeoff,
    formatos: ["CSV", "Excel"],
  },
  {
    id: 5,
    modulo: "Reservaciones",
    titulo: "Reporte de reservaciones",
    descripcion: "Consulta reservas, fechas, pasajeros y estados de reservación.",
    icon: Ticket,
    formatos: ["CSV", "Excel"],
  },
  {
    id: 6,
    modulo: "Pilotos",
    titulo: "Reporte de pilotos",
    descripcion: "Consulta los pilotos registrados y sus datos profesionales disponibles.",
    icon: UserRound,
    formatos: ["CSV", "Excel"],
  },
];

const powerBIUrl = import.meta.env.VITE_POWERBI_EMBED_URL;

function descargarCSV(titulo) {
  // Demostración: sustituye estos datos por los registros de tu API.
  const csv = [
    ["Reporte", titulo],
    ["Estado", "Ejemplo: conecta este reporte con tu base de datos"],
  ]
    .map((fila) =>
      fila.map((valor) => `"${String(valor).replaceAll('"', '""')}"`).join(",")
    )
    .join("\r\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");

  enlace.href = url;
  enlace.download = `${titulo.toLowerCase().replaceAll(" ", "-")}.csv`;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  URL.revokeObjectURL(url);
}

export default function Reportes() {
  const [filtro, setFiltro] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [periodo, setPeriodo] = useState("30");

  const reportesFiltrados = useMemo(() => {
    return reportes.filter((reporte) => {
      const coincideModulo =
        filtro === "Todos" || reporte.modulo === filtro;

      const coincideBusqueda =
        reporte.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
        reporte.descripcion.toLowerCase().includes(busqueda.toLowerCase());

      return coincideModulo && coincideBusqueda;
    });
  }, [filtro, busqueda]);

  return (
    <>
      <header className="border-b border-sky-100 bg-white px-5 py-5">
        <h1 className="text-2xl font-bold text-[#0C2D57]">
          Reportes e indicadores
        </h1>
      </header>
    <div className="min-h-screen bg-slate-50 text-slate-700">
      {/* Encabezado */}
     

      <main className="mx-auto max-w-7xl space-y-8 px-5 py-8 md:px-8 md:py-10">
        {/* Introducción */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0C2D57] via-blue-800 to-sky-600 p-7 text-white shadow-lg md:p-9">
          <div className="absolute -right-12 -top-16 h-64 w-64 rounded-full border-[35px] border-white/10" />

          <div className="relative max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-sky-200">
              Análisis de información
            </p>
            <h2 className="mt-3 text-3xl font-extrabold md:text-4xl">
              Reportes para una gestión más inteligente
            </h2>
            <p className="mt-4 max-w-2xl leading-7 text-blue-100">
              Consulta información de los módulos operativos, genera reportes
              y analiza los indicadores clave para apoyar las decisiones
              gerenciales.
            </p>
          </div>
        </section>

        {/* Reportes operativos */}
        <section>
          <div className="mb-6">
            <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-sky-600">
              Reportes operativos
            </p>
            <h2 className="mt-2 text-2xl font-extrabold text-[#0C2D57]">
              Reportes por módulo
            </h2>
            <p className="mt-2 text-slate-500">
              Selecciona un módulo para preparar la consulta de su información.
            </p>
          </div>

          {/* Filtros */}
          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-sky-100 bg-white p-4 md:flex-row">
            <label className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
              <Search className="h-5 w-5 text-slate-400" />
              <input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar un reporte..."
                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
              />
            </label>

            <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <select
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="max-w-full bg-transparent text-sm text-slate-700 outline-none"
              >
                <option value="Todos">Todos los módulos</option>
                {reportes.map((reporte) => (
                  <option key={reporte.id} value={reporte.modulo}>
                    {reporte.modulo}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {reportesFiltrados.map((reporte) => {
              const Icon = reporte.icon;

              return (
                <article
                  key={reporte.id}
                  className="flex flex-col rounded-2xl border border-sky-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-sky-300 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                      <Icon className="h-6 w-6" />
                    </div>
                    <FileText className="h-5 w-5 text-slate-300" />
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-[#0C2D57]">
                    {reporte.titulo}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-slate-500">
                    {reporte.descripcion}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {reporte.formatos.map((formato) => (
                      <span
                        key={formato}
                        className="rounded-lg bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-800"
                      >
                        {formato}
                      </span>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => descargarCSV(reporte.titulo)}
                    className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#0C2D57] px-4 py-3 text-sm font-bold leading-5 text-white transition hover:bg-sky-700"
                  >
                    <Download className="h-4 w-4" />
                    Descargar ejemplo CSV
                  </button>
                </article>
              );
            })}
          </div>

          {reportesFiltrados.length === 0 && (
            <div className="rounded-2xl border border-dashed border-sky-200 bg-white p-10 text-center">
              <Search className="mx-auto h-8 w-8 text-slate-400" />
              <p className="mt-3 font-semibold text-[#0C2D57]">
                No se encontraron reportes
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Prueba otro término o selecciona un módulo diferente.
              </p>
            </div>
          )}
        </section>

        {/* Dashboard gerencial */}
        <section id="dashboard" className="scroll-mt-6">
          <div className="mb-6">
            <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-sky-600">
              Inteligencia de negocios
            </p>
            <h2 className="mt-2 text-2xl font-extrabold text-[#0C2D57]">
              Dashboard gerencial
            </h2>
            <p className="mt-2 text-slate-500">
              Panel ejecutivo integrado con Microsoft Power BI.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm">
            <div className="flex flex-col justify-between gap-4 border-b border-sky-100 p-5 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                  <ChartPie className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-[#0C2D57]">
                    Indicadores de gestión
                  </h3>
                  <p className="text-sm text-slate-500">
                    Vista ejecutiva de las operaciones
                  </p>
                </div>
              </div>

              <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
                <CalendarDays className="h-4 w-4 text-slate-500" />
                <span className="text-sm text-slate-600">Período:</span>
                <select
                  value={periodo}
                  onChange={(e) => setPeriodo(e.target.value)}
                  className="bg-transparent text-sm font-semibold text-[#0C2D57] outline-none"
                >
                  <option value="7">7 días</option>
                  <option value="30">30 días</option>
                  <option value="90">90 días</option>
                  <option value="365">12 meses</option>
                </select>
              </label>
            </div>

            {powerBIUrl ? (
              <div className="p-3 md:p-5">
                <iframe
                  title="Dashboard gerencial de Global Airport en Power BI"
                  src={powerBIUrl}
                  className="h-[650px] w-full rounded-xl border border-slate-200"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="p-5 md:p-8">
                <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-sky-200 bg-sky-50/60 p-8 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-sky-700 shadow-sm">
                    <BarChart3 className="h-9 w-9" />
                  </div>
                  <h3 className="mt-5 text-xl font-extrabold text-[#0C2D57]">
                    Tu dashboard de Power BI aparecerá aquí
                  </h3>
                  <p className="mt-3 max-w-lg text-sm leading-6 text-slate-500">
                    Cuando publiques el informe y configures su dirección de
                    inserción, podrás visualizar los gráficos gerenciales
                    dentro de Global Airport.
                  </p>
                  <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-sky-800">
                    <CheckCircle2 className="h-4 w-4" />
                    Espacio preparado para la integración
                  </span>
                </div>
              </div>
            )}
          </div>
        </section>

        <footer className="border-t border-sky-100 py-6 text-center text-sm text-slate-500 md:flex md:justify-between md:text-left">
          <p>© 2026 Global Airport. Todos los derechos reservados.</p>
          <Link to="/Home" className="mt-2 font-semibold text-sky-700 hover:text-blue-950 md:mt-0">
            Volver al inicio
          </Link>
        </footer>
      </main>
    </div>
  </>
  );
}
