
import { useMemo, useState, useRef } from "react";
import { Link } from "react-router-dom"
import {
  ArrowLeft, ArrowUpRight, Building2, CalendarDays, ChartNoAxesCombined, ChartPie,
  CheckCircle2, ClipboardList, Contact, Download, FileSpreadsheet, FileText, Filter, PlaneTakeoff, RefreshCw, Ticket, Users, UserRound, BarChart3, Search, Plane, LayoutDashboard, Settings, LogOut
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { tienePermiso } from "../config/permissions";
import { reportesService } from "../services/reportesService";

const modules = [
  {
    title: "Inicio",
    icon: LayoutDashboard,
    path: "/home",
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
    modulo: "Pasajeros",
    titulo: "Reporte de pasajeros",
    descripcion:
      "Consulta la cantidad de pasajeros según el alcance autorizado.",
    icon: Contact,
    formatos: ["CSV"],
    permiso: "consultarPasajeros",
    endpoint: "/reportes/pasajeros",
  },
  {
    id: 2,
    modulo: "Vuelos",
    titulo: "Reporte de vuelos",
    descripcion:
      "Analiza la cantidad de vuelos y su distribución por estado.",
    icon: PlaneTakeoff,
    formatos: ["CSV"],
    permiso: "consultarVuelos",
    endpoint: "/reportes/vuelos",
  },
  {
    id: 3,
    modulo: "Reservaciones",
    titulo: "Reporte de reservaciones",
    descripcion:
      "Consulta la cantidad de reservaciones y sus montos registrados.",
    icon: Ticket,
    formatos: ["CSV"],
    permiso: "consultarReservaciones",
    endpoint: "/reportes/reservaciones",
  },
  {
    id: 4,
    modulo: "Pilotos",
    titulo: "Reporte de pilotos",
    descripcion:
      "Consulta la cantidad de pilotos, sus estados y vuelos asignados.",
    icon: UserRound,
    formatos: ["CSV"],
    permiso: "consultarPilotos",
    endpoint: "/reportes/pilotos",
  },
];

function obtenerPowerBIUrl(aeropuertoId = null) {
  const valor = import.meta.env.VITE_POWERBI_EMBED_URL;

  if (!valor) {
    return null;
  }

  try {
    const url = new URL(valor);

    if (
      url.origin !== "https://app.powerbi.com" ||
      url.pathname !== "/reportEmbed" ||
      !url.searchParams.get("reportId")
    ) {
      return null;
    }

    url.searchParams.delete("filter");

    if (aeropuertoId !== null) {
      if (
        !Number.isSafeInteger(aeropuertoId) ||
        aeropuertoId <= 0
      ) {
        return null;
      }

      url.searchParams.set(
        "filter",
        `globalairport_x0020_aeropuerto/id eq ${aeropuertoId}`
      );
    }

    return url.href;
  } catch {
    return null;
  }
}


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

function obtenerFiltrosPeriodo(periodo) {

  const dias = Number(periodo);

  if (![7, 30, 90, 365].includes(dias)) {
    throw new Error("Período inválido");
  }

  const fechaFin = new Date();

  const fechaInicio = new Date(fechaFin);

  fechaInicio.setUTCDate(
    fechaInicio.getUTCDate() - (dias - 1)
  );

  return {
    fechaInicio:
      fechaInicio.toISOString().slice(0, 10),

    fechaFin:
      fechaFin.toISOString().slice(0, 10),
  };
}

function escaparCSV(valor) {

  let texto = String(valor ?? "");

  // Evitar que textos se interpreten como fórmulas.

  if (/^\s*[=+\-@]|^[\t\r\n]/.test(texto)) {
    texto = "'" + texto;
  }

  return `"${texto.replaceAll('"', '""')}"`;
}

function generarArchivoCSV(nombre, filas) {

  const contenido = filas
    .map((fila) =>
      fila.map(escaparCSV).join(",")
    )
    .join("\r\n");

  const blob = new Blob(
    ["\uFEFF" + contenido],
    {
      type: "text/csv;charset=utf-8;",
    }
  );

  const url = URL.createObjectURL(blob);

  const enlace = document.createElement("a");

  enlace.href = url;
  enlace.download = nombre;

  document.body.appendChild(enlace);

  enlace.click();
  enlace.remove();

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

export default function Reportes() {

  const { rol, aeropuertoActivo } = useAuth();

  const accesoGlobal =
    rol === "ADMIN_GENERAL";

  const aeropuertoActivoId =
    aeropuertoActivo?.id ?? null;

  const tieneContextoOperativo =
    accesoGlobal ||
    (
      rol === "ADMIN_AEROPUERTO" &&
      Number.isSafeInteger(aeropuertoActivoId) &&
      aeropuertoActivoId > 0 &&
      aeropuertoActivoId <= 2147483647
    );

  const [exportando, setExportando] = useState(null);

  const [errorExportacion, setErrorExportacion] =
    useState("");

  const exportacionEnCurso = useRef(false);

  // =====================================
  // PERMISOS
  // =====================================

  const puedeConsultar =
    tieneContextoOperativo &&
    tienePermiso(rol, "reportes", "consultar");

  const puedeConsultarDashboard =
    tieneContextoOperativo &&
    tienePermiso(
      rol,
      "reportes",
      "consultarDashboard"
    );

  const puedeExportar =
    tieneContextoOperativo &&
    tienePermiso(rol, "reportes", "exportar");

  const puedeVisualizarPowerBI =
    puedeConsultarDashboard &&
    tieneContextoOperativo;

  const powerBIUrl = useMemo(() => {
    if (!puedeVisualizarPowerBI) {
      return null;
    }

    return obtenerPowerBIUrl(
      accesoGlobal ? null : aeropuertoActivoId
    );
  }, [
    puedeVisualizarPowerBI,
    accesoGlobal,
    aeropuertoActivoId
  ]);

  const [filtro, setFiltro] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [periodo, setPeriodo] = useState("30");

  const reportesAutorizados = useMemo(() => {

    if (!puedeConsultar) {
      return [];
    }

    return reportes.filter((reporte) =>
      tienePermiso(
        rol,
        "reportes",
        reporte.permiso
      )
    );

  }, [rol, puedeConsultar]);

  const reportesFiltrados = useMemo(() => {

    const termino = busqueda.trim().toLowerCase();

    return reportesAutorizados.filter((reporte) => {

      const coincideModulo =
        filtro === "Todos" ||
        reporte.modulo === filtro;

      const coincideBusqueda =
        reporte.titulo.toLowerCase().includes(termino) ||
        reporte.descripcion.toLowerCase().includes(termino);

      return coincideModulo && coincideBusqueda;
    });

  }, [
    filtro,
    busqueda,
    reportesAutorizados,
  ]);

  async function descargarReporte(reporte) {

    if (
      exportacionEnCurso.current ||
      !puedeExportar ||
      !tienePermiso(
        rol,
        "reportes",
        reporte.permiso
      )
    ) {
      return;
    }

    const tokenInicial = JSON.parse(
      sessionStorage.getItem("sesion") || "null"
    )?.token;

    if (!tokenInicial) {
      setErrorExportacion(
        "No existe una sesión activa."
      );

      return;
    }

    exportacionEnCurso.current = true;

    setExportando(reporte.id);
    setErrorExportacion("");

    try {

      const filtros = obtenerFiltrosPeriodo(periodo);

      let datos;

      const filas = [
        ["Reporte", reporte.titulo],
        ["Fecha inicial", filtros.fechaInicio],
        ["Fecha final", filtros.fechaFin],
        [
          "Alcance",
          accesoGlobal
            ? "Global"
            : aeropuertoActivo?.nombre || "",
        ],
        [],
        ["Indicador", "Valor"],
      ];

      switch (reporte.modulo) {

        case "Vuelos":

          datos = await reportesService
            .obtenerVuelos(filtros);

          filas.push(["Total", datos.total]);

          for (const estado of datos.porEstado || []) {

            filas.push([
              estado.estado,
              estado._count?._all ?? 0,
            ]);
          }

          break;

        case "Pasajeros":

          datos = await reportesService
            .obtenerPasajeros(filtros);

          filas.push([
            "Total de pasajeros",
            datos.total,
          ]);

          break;

        case "Reservaciones":

          datos = await reportesService
            .obtenerReservaciones(filtros);

          filas.push(
            [
              "Total de reservaciones",
              datos.total,
            ],
            [
              "Monto registrado (USD)",
              datos.monto?._sum?.monto ?? 0,
            ]
          );

          break;

        case "Pilotos":

          datos = await reportesService
            .obtenerPilotos(filtros);

          filas.push(
            [
              "Total de pilotos",
              datos.total,
            ],
            [
              "Pilotos con vuelos en el período",
              datos.pilotosConVuelos,
            ]
          );

          for (const estado of datos.porEstado || []) {

            filas.push([
              estado.estado,
              estado._count?._all ?? 0,
            ]);
          }

          break;

        default:

          throw new Error(
            "Reporte no disponible"
          );
      }

      const tokenActual = JSON.parse(
        sessionStorage.getItem("sesion") || "null"
      )?.token;

      if (tokenInicial !== tokenActual) {
        return;
      }

      const nombreArchivo =
        `${reporte.modulo.toLowerCase()}-${filtros.fechaFin}.csv`;

      generarArchivoCSV(
        nombreArchivo,
        filas
      );

    } catch (err) {

      setErrorExportacion(
        err.message ||
        "No fue posible generar el reporte."
      );

    } finally {

      exportacionEnCurso.current = false;
      setExportando(null);
    }
  }

  if (!puedeConsultar) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">

        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">

          <h2 className="text-xl font-bold text-[#0C2D57]">
            Acceso restringido
          </h2>

          <p className="mt-3 text-sm text-slate-500">
            No tenés permisos para consultar
            reportes e indicadores.
          </p>

        </div>

      </div>
    );
  }

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
          <section className="relative overflow-hidden rounded-3xl bg-linear-to-r from-[#0C2D57] via-blue-800 to-sky-600 p-7 text-white shadow-lg md:p-9">

            <div className="pointer-events-none absolute -right-12 -top-16 h-64 w-64 rounded-full border-[35px] border-white/10" />

            <div className="relative z-10 max-w-3xl">

              <p className="text-sm font-bold uppercase tracking-[0.2em] text-sky-200!">
                Análisis de información
              </p>

              <h2 className="mt-3 text-3xl font-extrabold text-white! md:text-4xl">
                Reportes para una gestión más inteligente
              </h2>

              <p className="mt-4 max-w-2xl leading-7 text-blue-100!">
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
                  {reportesAutorizados.map((reporte) => (
                    <option key={reporte.id} value={reporte.modulo}>
                      {reporte.modulo}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {errorExportacion && (
              <div
                role="alert"
                className="
            mb-5 rounded-xl border border-red-200
            bg-red-50 p-4 text-sm text-red-700
        "
              >
                {errorExportacion}
              </div>
            )}

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

                    {puedeExportar && (
                      <button
                        type="button"
                        onClick={() => descargarReporte(reporte)}
                        disabled={exportando !== null}
                        className="
            mt-5 inline-flex min-h-11 items-center
            justify-center gap-2 rounded-xl
            bg-[#0C2D57] px-4 py-3 text-sm
            font-bold text-white transition
            hover:bg-sky-700
            disabled:cursor-not-allowed
            disabled:opacity-50
        "
                      >
                        <Download className="h-4 w-4" />

                        {exportando === reporte.id
                          ? "Generando reporte..."
                          : "Descargar CSV"}
                      </button>
                    )}
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
                {accesoGlobal
                  ? "Dashboard gerencial"
                  : `Dashboard — ${aeropuertoActivo?.nombre || "Aeropuerto"}`}
              </h2>
              <p className="mt-2 text-slate-500">
                {accesoGlobal
                  ? "Panel ejecutivo de todos los aeropuertos."
                  : "Indicadores operativos del aeropuerto activo."}
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

              {!puedeVisualizarPowerBI ? (

                <div className="p-5 md:p-8">

                  <div className="
            flex min-h-72 flex-col items-center
            justify-center rounded-2xl border
            border-sky-200 bg-sky-50/60
            p-8 text-center
        ">

                    <BarChart3 className="h-10 w-10 text-sky-700" />

                    <h3 className="mt-5 text-xl font-bold text-[#0C2D57]">
                      Dashboard gerencial restringido
                    </h3>

                    <p className="mt-3 max-w-lg text-sm text-slate-500">
                      Por seguridad, el informe global de Power BI
                      está reservado al administrador general.
                      Podés consultar y exportar los reportes
                      correspondientes a tu aeropuerto activo.
                    </p>

                  </div>

                </div>

              ) : powerBIUrl ? (
                <div className="p-3 md:p-5">
                  <iframe
                    key={powerBIUrl}
                    title="Dashboard de Global Airport en Power BI"
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
            <Link to="/home" className="mt-2 font-semibold text-sky-700 hover:text-blue-950 md:mt-0">
              Volver al inicio
            </Link>
          </footer>
        </main>
      </div>
    </>
  );
}
