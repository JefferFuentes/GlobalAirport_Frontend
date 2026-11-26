import { useEffect, useMemo, useState } from "react";

import {
  Building2,
  Globe,
  MapPin,
  Search,
  RotateCcw,
  Plus,
  Pencil,
  Eye,
  Trash2,
  X,
  Save,
  LoaderCircle,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Plane,
  Users,
  UserRound,
  Lock,
  PlaneTakeoff,
  PlaneLanding,
} from "lucide-react";

import { aeropuertosService } from "../services/aeropuertosService";
import { useAuth } from "../context/AuthContext";
import { tienePermiso } from "../config/permissions";

import PageHeader from "../components/management/PageHeader";
import StatCard from "../components/management/StatCard";

// Estado inicial del formulario.
const initialForm = {
  nombre: "",
  codigoIata: "",
  pais: "",
  ciudad: "",
  direccion: "",
};

// Etiquetas para las relaciones del aeropuerto.
const etiquetasRelaciones = {
  administradores: "Administradores",
  empleados: "Empleados",
  pilotos: "Pilotos",
  aeronaves: "Aeronaves",
  vuelosOrigen: "Vuelos de origen",
  vuelosDestino: "Vuelos de destino",
};

// Iconos de las relaciones aeroportuarias.
const iconosRelaciones = {
  administradores: ShieldCheck,
  empleados: Users,
  pilotos: UserRound,
  aeronaves: Plane,
  vuelosOrigen: PlaneTakeoff,
  vuelosDestino: PlaneLanding,
};

function relacionesValidas(relaciones) {
  if (
    !relaciones ||
    typeof relaciones !== "object" ||
    Array.isArray(relaciones)
  ) {
    return false;
  }

  return Object.keys(etiquetasRelaciones).every(
    clave =>
      Number.isInteger(relaciones[clave]) &&
      relaciones[clave] >= 0
  );
}

// Obtener el mensaje de error.
function obtenerMensajeError(error) {
  return (
    error?.message ||
    "Ocurrió un error al realizar la operación."
  );
}

export default function AirportManagement() {
  // ==========================================
  // AUTENTICACIÓN Y PERMISOS
  // ==========================================

  const {
    rol,
    aeropuertoActivo,
    aeropuertos: aeropuertosAsignados,
  } = useAuth();

  const esAdministradorGeneral =
    rol === "ADMIN_GENERAL";

  const esAdministradorAeropuerto =
    rol === "ADMIN_AEROPUERTO";

  const aeropuertoActivoId =
    aeropuertoActivo?.id ?? null;

  const tieneContextoOperativo =
    esAdministradorGeneral ||
    (
      esAdministradorAeropuerto &&
      Number.isSafeInteger(aeropuertoActivoId) &&
      aeropuertoActivoId > 0
    );

  const puedeConsultar =
    tieneContextoOperativo &&
    tienePermiso(rol, "aeropuertos", "consultar");

  const puedeCrear =
    tieneContextoOperativo &&
    tienePermiso(rol, "aeropuertos", "crear");

  const puedeEditar =
    tieneContextoOperativo &&
    tienePermiso(rol, "aeropuertos", "editar");

  const puedeEliminar =
    tieneContextoOperativo &&
    tienePermiso(rol, "aeropuertos", "eliminar");

  const puedeCambiarIata =
    tieneContextoOperativo &&
    tienePermiso(rol, "aeropuertos", "cambiarIata");

  const puedeConsultarRelaciones =
    tieneContextoOperativo &&
    tienePermiso(
      rol,
      "aeropuertos",
      "consultarRelaciones"
    );

  // ==========================================
  // ESTADOS
  // ==========================================

  const [aeropuertos, setAeropuertos] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [detailLoading, setDetailLoading] =
    useState(false);

  // Filtros.
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] =
    useState("todos");

  const [cityFilter, setCityFilter] =
    useState("todos");

  // Modales.
  const [modal, setModal] = useState(null);

  const [selectedAirport, setSelectedAirport] =
    useState(null);

  const [editingId, setEditingId] = useState(null);

  // Formulario.
  const [form, setForm] = useState(initialForm);

  // Mensajes.
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // ==========================================
  // PERMISOS POR AEROPUERTO
  // ==========================================

  function esAeropuertoPropio(aeropuerto) {
    return (
      aeropuerto?.id != null &&
      aeropuertoActivoId != null &&
      Number(aeropuerto.id) ===
      Number(aeropuertoActivoId)
    );
  }

  function esAeropuertoAsignado(aeropuerto) {
    if (!aeropuerto || aeropuerto.id == null) {
      return false;
    }

    if (!Array.isArray(aeropuertosAsignados)) {
      return false;
    }

    return aeropuertosAsignados.some(
      asignado =>
        Number(asignado.id) === Number(aeropuerto.id)
    );
  }

  function puedeEditarAeropuerto(aeropuerto) {

    if (!puedeEditar || !aeropuerto) {
      return false;
    }

    if (esAdministradorGeneral) {
      return true;
    }

    return (
      esAdministradorAeropuerto &&
      esAeropuertoPropio(aeropuerto) &&
      esAeropuertoAsignado(aeropuerto)
    );
  }

  function puedeVerRelacionesAeropuerto(aeropuerto) {
    if (!puedeConsultarRelaciones || !aeropuerto) {
      return false;
    }

    if (esAdministradorGeneral) {
      return true;
    }

    return (
      esAdministradorAeropuerto &&
      esAeropuertoAsignado(aeropuerto)
    );
  }

  // ==========================================
  // CARGA DE DATOS
  // ==========================================

  async function cargarDatos(mostrarCarga = true) {
    if (!puedeConsultar) {
      return;
    }

    if (mostrarCarga) {
      setLoading(true);
    }

    setError("");

    try {
      const resultado =
        await aeropuertosService.obtenerTodos();

      if (!Array.isArray(resultado)) {
        throw new Error(
          "La respuesta del catálogo no es válida."
        );
      }

      setAeropuertos(resultado);
    } catch (err) {
      setError(obtenerMensajeError(err));
    } finally {
      setLoading(false);
    }
  }

  // Carga inicial y cambios de contexto.
  useEffect(() => {
    let cancelado = false;

    setAeropuertos([]);
    setSearch("");
    setCountryFilter("todos");
    setCityFilter("todos");

    setModal(null);
    setSelectedAirport(null);
    setEditingId(null);
    setForm(initialForm);

    setError("");
    setMessage("");

    if (!puedeConsultar) {
      setLoading(false);
      return;
    }

    async function cargarAeropuertos() {
      setLoading(true);

      try {
        const resultado =
          await aeropuertosService.obtenerTodos();

        if (!Array.isArray(resultado)) {
          throw new Error(
            "La respuesta del catálogo no es válida."
          );
        }

        if (!cancelado) {
          setAeropuertos(resultado);
        }
      } catch (err) {
        if (!cancelado) {
          setError(obtenerMensajeError(err));
        }
      } finally {
        if (!cancelado) {
          setLoading(false);
        }
      }
    }

    cargarAeropuertos();

    return () => {
      cancelado = true;
    };
  }, [puedeConsultar, rol, aeropuertoActivoId]);

  // ==========================================
  // ESTADÍSTICAS
  // ==========================================

  const estadisticas = useMemo(() => {
    const paises = new Set(
      aeropuertos
        .map(a => a.pais?.trim().toLowerCase())
        .filter(Boolean)
    );

    const ciudades = new Set(
      aeropuertos
        .filter(a => a.pais && a.ciudad)
        .map(
          a =>
            `${a.pais.trim().toLowerCase()}|${a.ciudad
              .trim()
              .toLowerCase()}`
        )
    );

    return {
      total: aeropuertos.length,
      paises: paises.size,
      ciudades: ciudades.size,
    };
  }, [aeropuertos]);

  // ==========================================
  // OPCIONES DE FILTRADO
  // ==========================================

  const paisesDisponibles = useMemo(() => {
    return [
      ...new Set(
        aeropuertos.map(a => a.pais).filter(Boolean)
      ),
    ].sort((a, b) => a.localeCompare(b, "es"));
  }, [aeropuertos]);

  const ciudadesDisponibles = useMemo(() => {
    return [
      ...new Set(
        aeropuertos
          .filter(
            a =>
              countryFilter === "todos" ||
              a.pais === countryFilter
          )
          .map(a => a.ciudad)
          .filter(Boolean)
      ),
    ].sort((a, b) => a.localeCompare(b, "es"));
  }, [aeropuertos, countryFilter]);

  // ==========================================
  // FILTRADO DE AEROPUERTOS
  // ==========================================

  const aeropuertosFiltrados = useMemo(() => {
    const termino = search.trim().toLowerCase();

    return aeropuertos.filter(aeropuerto => {
      const coincideBusqueda = [
        aeropuerto.nombre,
        aeropuerto.codigoIata,
        aeropuerto.pais,
        aeropuerto.ciudad,
        aeropuerto.direccion,
      ].some(valor =>
        String(valor ?? "")
          .toLowerCase()
          .includes(termino)
      );

      const coincidePais =
        countryFilter === "todos" ||
        aeropuerto.pais === countryFilter;

      const coincideCiudad =
        cityFilter === "todos" ||
        aeropuerto.ciudad === cityFilter;

      return (
        coincideBusqueda &&
        coincidePais &&
        coincideCiudad
      );
    });
  }, [
    aeropuertos,
    search,
    countryFilter,
    cityFilter,
  ]);

  function cambiarFiltroPais(valor) {
    setCountryFilter(valor);
    setCityFilter("todos");
  }

  function limpiarFiltros() {
    setSearch("");
    setCountryFilter("todos");
    setCityFilter("todos");
  }

  // ==========================================
  // FORMULARIO
  // ==========================================

  const esRegistro = editingId === null;

  const iataEditable = esRegistro
    ? puedeCrear
    : puedeCambiarIata;

  function updateForm(campo, valor) {
    setForm(anterior => ({
      ...anterior,
      [campo]:
        campo === "codigoIata"
          ? valor.toUpperCase()
          : valor,
    }));
  }

  // ==========================================
  // GUARDAR AEROPUERTO
  // ==========================================

  async function saveAirport(event) {
    event.preventDefault();

    if (saving) {
      return;
    }

    const registrando = editingId === null;

    setError("");
    setMessage("");

    // Validar permisos de registro.
    if (registrando && !puedeCrear) {
      setError(
        "No tenés permisos para registrar aeropuertos."
      );
      return;
    }

    // Validar permisos de edición.
    if (
      !registrando &&
      !puedeEditarAeropuerto(selectedAirport)
    ) {
      setError(
        "No tenés permisos para modificar este aeropuerto."
      );
      return;
    }

    // Normalizar los datos.
    const nombre = form.nombre.trim();

    const codigoIata = form.codigoIata
      .trim()
      .toUpperCase();

    const pais = form.pais.trim();
    const ciudad = form.ciudad.trim();
    const direccion = form.direccion.trim();

    // Validar campos obligatorios.
    if (
      !nombre ||
      !codigoIata ||
      !pais ||
      !ciudad ||
      !direccion
    ) {
      setError(
        "Todos los campos del formulario son obligatorios."
      );
      return;
    }

    // Validar código IATA.
    if (!/^[A-Z]{3}$/.test(codigoIata)) {
      setError(
        "El código IATA debe contener exactamente tres letras."
      );
      return;
    }

    // Validar longitud de los campos.
    if (
      [nombre, pais, ciudad, direccion].some(
        valor => valor.length > 191
      )
    ) {
      setError(
        "Los campos de texto no pueden superar los 191 caracteres."
      );
      return;
    }

    // Validar modificación del código IATA.
    if (
      !registrando &&
      !puedeCambiarIata &&
      codigoIata !== selectedAirport?.codigoIata
    ) {
      setError(
        "No tenés permisos para modificar el código IATA."
      );
      return;
    }

    // Verificar códigos IATA duplicados.
    const codigoDuplicado = aeropuertos.some(
      aeropuerto =>
        aeropuerto.codigoIata.toUpperCase() ===
        codigoIata &&
        Number(aeropuerto.id) !== Number(editingId)
    );

    if (codigoDuplicado) {
      setError(
        "Ya existe un aeropuerto registrado con ese código IATA."
      );
      return;
    }

    // Preparar los datos.
    const datos = {
      nombre,
      pais,
      ciudad,
      direccion,
    };

    // Solamente enviar el código IATA cuando
    // el usuario tenga autorización.
    if (registrando || puedeCambiarIata) {
      datos.codigoIata = codigoIata;
    }

    setSaving(true);

    try {
      if (registrando) {
        await aeropuertosService.registrar(datos);

        setMessage(
          "El aeropuerto se registró correctamente."
        );
      } else {
        await aeropuertosService.actualizar(
          editingId,
          datos
        );

        setMessage(
          "El aeropuerto se actualizó correctamente."
        );
      }

      // Cerrar y limpiar el formulario.
      setModal(null);
      setSelectedAirport(null);
      setEditingId(null);
      setForm(initialForm);

      // Actualizar el catálogo.
      await cargarDatos(false);

    } catch (err) {
      setError(obtenerMensajeError(err));
    } finally {
      setSaving(false);
    }
  }

  // ==========================================
  // ABRIR MODAL DE REGISTRO
  // ==========================================

  function openCreate() {
    if (!puedeCrear || saving || detailLoading) {
      return;
    }

    setEditingId(null);
    setSelectedAirport(null);
    setForm(initialForm);

    setError("");
    setMessage("");

    setModal("form");
  }

  // ==========================================
  // ABRIR MODAL DE EDICIÓN
  // ==========================================

  function openEdit(aeropuerto) {
    if (
      !puedeEditarAeropuerto(aeropuerto) ||
      saving ||
      detailLoading
    ) {
      return;
    }

    setEditingId(aeropuerto.id);
    setSelectedAirport(aeropuerto);

    setForm({
      nombre: aeropuerto.nombre ?? "",
      codigoIata: aeropuerto.codigoIata ?? "",
      pais: aeropuerto.pais ?? "",
      ciudad: aeropuerto.ciudad ?? "",
      direccion: aeropuerto.direccion ?? "",
    });

    setError("");
    setMessage("");

    setModal("form");
  }

  // ==========================================
  // ABRIR MODAL DE DETALLES
  // ==========================================

  async function openDetails(aeropuerto) {
    if (
      !puedeConsultar ||
      saving ||
      detailLoading
    ) {
      return;
    }

    setSelectedAirport(aeropuerto);
    setError("");
    setMessage("");
    setModal("details");
    setDetailLoading(true);

    try {
      const detalle =
        await aeropuertosService.obtenerPorId(
          aeropuerto.id
        );

      setSelectedAirport(detalle);
    } catch (err) {
      setError(obtenerMensajeError(err));
    } finally {
      setDetailLoading(false);
    }
  }

  // ==========================================
  // ABRIR MODAL DE ELIMINACIÓN
  // ==========================================

  // ==========================================
  // ABRIR MODAL DE ELIMINACIÓN
  // ==========================================

  async function openDelete(aeropuerto) {
    if (
      !puedeEliminar ||
      !aeropuerto ||
      saving ||
      detailLoading
    ) {
      return;
    }

    // No utilizar conteos de consultas anteriores.
    setSelectedAirport({
      id: aeropuerto.id,
      nombre: aeropuerto.nombre,
      codigoIata: aeropuerto.codigoIata,
      pais: aeropuerto.pais,
      ciudad: aeropuerto.ciudad,
      direccion: aeropuerto.direccion,
    });

    setError("");
    setMessage("");
    setModal("delete");
    setDetailLoading(true);

    try {
      const detalle =
        await aeropuertosService.obtenerPorId(
          aeropuerto.id
        );

      if (
        !detalle ||
        Number(detalle.id) !== Number(aeropuerto.id)
      ) {
        throw new Error(
          "No se pudo verificar el aeropuerto seleccionado."
        );
      }

      if (!relacionesValidas(detalle._count)) {
        throw new Error(
          "No se pudieron verificar todas las dependencias del aeropuerto."
        );
      }

      setSelectedAirport(detalle);

    } catch (err) {
      setError(obtenerMensajeError(err));
    } finally {
      setDetailLoading(false);
    }
  }

  // ==========================================
  // CONFIRMAR ELIMINACIÓN DEL AEROPUERTO
  // ==========================================

  async function confirmarEliminacion() {
    if (
      modal !== "delete" ||
      !puedeEliminar ||
      !selectedAirport ||
      saving ||
      detailLoading ||
      error
    ) {
      return;
    }

    // Verificar nuevamente los conteos disponibles.
    const relaciones = selectedAirport._count;

    if (!relacionesValidas(relaciones)) {
      setError(
        "No se puede eliminar el aeropuerto porque sus dependencias no han sido verificadas."
      );
      return;
    }

    const existenDependencias = Object.keys(
      etiquetasRelaciones
    ).some(clave => relaciones[clave] > 0);

    if (existenDependencias) {
      setError(
        "No se puede eliminar el aeropuerto porque tiene registros asociados."
      );
      return;
    }

    const aeropuertoId = selectedAirport.id;
    const nombreAeropuerto = selectedAirport.nombre;

    setError("");
    setMessage("");
    setSaving(true);

    try {
      await aeropuertosService.eliminar(aeropuertoId);

      setModal(null);
      setSelectedAirport(null);
      setEditingId(null);
      setForm(initialForm);

      setMessage(
        `El aeropuerto ${nombreAeropuerto} se eliminó correctamente.`
      );

      // Actualizar inmediatamente el catálogo.
      setAeropuertos(anteriores =>
        anteriores.filter(
          aeropuerto =>
            Number(aeropuerto.id) !== Number(aeropuertoId)
        )
      );

      // Restablecer filtros.
      limpiarFiltros();

      // Consultar nuevamente los datos del backend.
      await cargarDatos(false);

    } catch (err) {
      // Invalidar los conteos anteriores si falla la eliminación.
      setSelectedAirport(anterior =>
        anterior
          ? {
            ...anterior,
            _count: null,
          }
          : anterior
      );

      setError(obtenerMensajeError(err));
    } finally {
      setSaving(false);
    }
  }

  // ==========================================
  // CERRAR MODALES
  // ==========================================

  function cerrarModal() {
    if (saving || detailLoading) {
      return;
    }

    setModal(null);
    setSelectedAirport(null);
    setEditingId(null);
    setForm(initialForm);
    setError("");
  }


  // ==========================================
  // INFORMACIÓN DEL AEROPUERTO SELECCIONADO
  // ==========================================

  const relacionesSeleccionadas =
    selectedAirport?._count ?? null;

  const conteosVerificados = relacionesValidas(
    relacionesSeleccionadas
  );

  const mostrarRelaciones =
    puedeVerRelacionesAeropuerto(selectedAirport) &&
    conteosVerificados;

  const totalRelaciones = conteosVerificados
    ? Object.keys(etiquetasRelaciones).reduce(
      (total, clave) =>
        total + relacionesSeleccionadas[clave],
      0
    )
    : null;

  const tieneDependencias =
    conteosVerificados && totalRelaciones > 0;

  const puedeConfirmarEliminacion =
    modal === "delete" &&
    puedeEliminar &&
    selectedAirport !== null &&
    conteosVerificados &&
    totalRelaciones === 0 &&
    !detailLoading &&
    !saving &&
    !error;

  // ==========================================
  // ACCESO RESTRINGIDO
  // ==========================================

  if (!puedeConsultar) {
    return (
      <main className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-red-600" />

            <h2 className="font-semibold text-red-800">
              Acceso restringido
            </h2>
          </div>

          <p className="mt-2 text-sm text-red-700">
            No tenés permisos para acceder al módulo
            de aeropuertos.
          </p>
        </div>
      </main>
    );
  }

  // ==========================================
  // INTERFAZ PRINCIPAL
  // ==========================================

  return (
    <main className="space-y-6 p-4 md:p-6">

      {/* ENCABEZADO */}

      <PageHeader
        icono={Building2}
        titulo="Gestión de aeropuertos"
        descripcion="Consulta y administra la información de la infraestructura aeroportuaria."
        onActualizar={
          loading || saving || detailLoading
            ? undefined
            : () => cargarDatos()
        }
        onNuevo={
          puedeCrear ? openCreate : undefined
        }
        textoBoton="Registrar aeropuerto"
      />

      {/* INFORMACIÓN DEL ALCANCE */}

      <div className="rounded-xl border border-sky-200 bg-sky-50 p-4">
        <div className="flex items-start gap-3">

          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-sky-700" />

          <div className="flex-1">

            <h3 className="font-semibold text-sky-900">
              {esAdministradorGeneral
                ? "Administración global de aeropuertos"
                : "Administración de aeropuertos asignados"}
            </h3>

            <p className="mt-1 text-sm text-sky-800">
              {esAdministradorGeneral
                ? "Podés consultar, registrar, modificar y eliminar los aeropuertos del sistema, respetando las restricciones de integridad de datos."
                : "Podés consultar la información y los registros asociados de todos los aeropuertos que tenés asignados. Únicamente podés modificar el aeropuerto activo de tu sesión, sin cambiar su código IATA."}
            </p>

            {esAdministradorAeropuerto && aeropuertoActivo && (
              <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm text-sky-900">

                <Building2 className="h-4 w-4 text-sky-600" />

                <span className="font-medium">
                  Aeropuerto activo:
                </span>

                <span>
                  {aeropuertoActivo.nombre}
                </span>

                <span className="rounded-md bg-sky-100 px-2 py-0.5 font-semibold text-sky-800">
                  {aeropuertoActivo.codigoIata}
                </span>

              </div>
            )}

          </div>
        </div>
      </div>

      {/* TARJETAS DE ESTADÍSTICAS */}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          titulo={
            esAdministradorGeneral
              ? "Total de aeropuertos"
              : "Aeropuertos asignados"
          }
          valor={loading ? "—" : estadisticas.total}
        />

        <StatCard
          titulo="Países con aeropuertos"
          valor={loading ? "—" : estadisticas.paises}
        />

        <StatCard
          titulo="Ciudades con aeropuertos"
          valor={loading ? "—" : estadisticas.ciudades}
        />

        <StatCard
          titulo="Resultados encontrados"
          valor={
            loading
              ? "—"
              : aeropuertosFiltrados.length
          }
        />

      </section>

      {/* MENSAJE DE ÉXITO */}

      {message && !modal && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4"
        >

          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

          <div className="flex-1">
            <h3 className="font-semibold text-emerald-800">
              Operación exitosa
            </h3>

            <p className="mt-1 text-sm text-emerald-700">
              {message}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setMessage("")}
            aria-label="Cerrar mensaje"
            className="rounded-md p-1 text-emerald-600 transition hover:bg-emerald-100"
          >
            <X className="h-4 w-4" />
          </button>

        </div>
      )}

      {/* MENSAJE DE ERROR */}

      {error && !modal && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
        >

          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

          <div className="flex-1">
            <h3 className="font-semibold text-red-800">
              No se pudo completar la operación
            </h3>

            <p className="mt-1 text-sm text-red-700">
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Cerrar mensaje de error"
            className="rounded-md p-1 text-red-600 transition hover:bg-red-100"
          >
            <X className="h-4 w-4" />
          </button>

        </div>
      )}

      {/* DIRECTORIO DE AEROPUERTOS */}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

        {/* ENCABEZADO DEL DIRECTORIO */}

        <div className="border-b border-slate-200 p-5">

          <div className="flex items-center gap-3">

            <div className="rounded-lg bg-sky-100 p-2.5">
              <Building2 className="h-5 w-5 text-sky-700" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[#0C2D57]">
                Directorio de aeropuertos
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Consulta y localiza los aeropuertos registrados
                en el sistema.
              </p>
            </div>

          </div>

          {/* FILTROS */}

          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-12">

            {/* BÚSQUEDA */}

            <div className="xl:col-span-5">

              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Buscar aeropuerto
              </label>

              <div className="relative">

                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="search"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Nombre, código IATA, ubicación..."
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />

              </div>

            </div>

            {/* FILTRO POR PAÍS */}

            <div className="xl:col-span-3">

              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                País
              </label>

              <select
                value={countryFilter}
                onChange={e => cambiarFiltroPais(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              >

                <option value="todos">
                  Todos los países
                </option>

                {paisesDisponibles.map(pais => (
                  <option key={pais} value={pais}>
                    {pais}
                  </option>
                ))}

              </select>

            </div>

            {/* FILTRO POR CIUDAD */}

            <div className="xl:col-span-2">

              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Ciudad
              </label>

              <select
                value={cityFilter}
                onChange={e => setCityFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              >

                <option value="todos">
                  Todas las ciudades
                </option>

                {ciudadesDisponibles.map(ciudad => (
                  <option key={ciudad} value={ciudad}>
                    {ciudad}
                  </option>
                ))}

              </select>

            </div>

            {/* LIMPIAR FILTROS */}

            <div className="flex items-end xl:col-span-2">

              <button
                type="button"
                onClick={limpiarFiltros}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
              >

                <RotateCcw className="h-4 w-4" />

                Limpiar filtros

              </button>

            </div>

          </div>

        </div>

        {/* CONTENIDO DEL DIRECTORIO */}

        {loading ? (

          <div className="flex min-h-64 items-center justify-center gap-3 text-slate-500">

            <LoaderCircle className="h-6 w-6 animate-spin text-sky-600" />

            Cargando aeropuertos...

          </div>

        ) : aeropuertosFiltrados.length === 0 ? (

          /* ESTADO VACÍO */

          <div className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">

            <div className="rounded-full bg-slate-100 p-4">
              <Building2 className="h-9 w-9 text-slate-400" />
            </div>

            <h3 className="mt-4 font-semibold text-[#0C2D57]">
              {aeropuertos.length === 0
                ? "No hay aeropuertos disponibles"
                : "No se encontraron resultados"}
            </h3>

            <p className="mt-2 max-w-md text-sm text-slate-500">

              {aeropuertos.length === 0
                ? "Actualmente no hay aeropuertos disponibles en el catálogo."
                : "No existen aeropuertos que coincidan con los filtros seleccionados."}

            </p>

            {aeropuertos.length > 0 && (

              <button
                type="button"
                onClick={limpiarFiltros}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700 transition hover:bg-sky-100"
              >

                <RotateCcw className="h-4 w-4" />

                Limpiar filtros

              </button>

            )}

          </div>

        ) : (

          /* TABLA DE AEROPUERTOS */

          <div className="max-h-[600px] overflow-auto">

            <table className="w-full min-w-[1000px] text-left text-sm">

              {/* ENCABEZADOS FIJOS */}

              <thead className="sticky top-0 z-10 border-b border-slate-200 bg-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-600">

                <tr>

                  <th className="px-5 py-4">
                    Aeropuerto
                  </th>

                  <th className="px-5 py-4">
                    Código IATA
                  </th>

                  <th className="px-5 py-4">
                    País
                  </th>

                  <th className="px-5 py-4">
                    Ciudad
                  </th>

                  <th className="px-5 py-4">
                    Dirección
                  </th>

                  <th className="px-5 py-4 text-center">
                    Acciones
                  </th>

                </tr>

              </thead>

              {/* REGISTROS */}

              <tbody className="divide-y divide-slate-100">

                {aeropuertosFiltrados.map(aeropuerto => (

                  <tr
                    key={aeropuerto.id}
                    className={`transition hover:bg-slate-50 ${esAeropuertoPropio(aeropuerto)
                      ? "bg-sky-50/40"
                      : "bg-white"
                      }`}
                  >

                    {/* NOMBRE DEL AEROPUERTO */}

                    <td className="px-5 py-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700">

                          <Building2 className="h-5 w-5" />

                        </div>

                        <div>

                          <p className="font-semibold text-[#0C2D57]">
                            {aeropuerto.nombre}
                          </p>

                          {esAeropuertoPropio(aeropuerto) && (

                            <span className="mt-1 inline-flex items-center gap-1 rounded-md bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700">

                              <MapPin className="h-3 w-3" />

                              Aeropuerto activo

                            </span>

                          )}

                        </div>

                      </div>

                    </td>

                    {/* CÓDIGO IATA */}

                    <td className="px-5 py-4">

                      <span className="inline-flex rounded-md border border-sky-200 bg-sky-50 px-3 py-1 font-mono text-sm font-semibold tracking-wide text-sky-700">

                        {aeropuerto.codigoIata}

                      </span>

                    </td>

                    {/* PAÍS */}

                    <td className="px-5 py-4">

                      <div className="flex items-center gap-2 text-slate-600">

                        <Globe className="h-4 w-4 shrink-0 text-slate-400" />

                        {aeropuerto.pais}

                      </div>

                    </td>

                    {/* CIUDAD */}

                    <td className="px-5 py-4">

                      <div className="flex items-center gap-2 text-slate-600">

                        <MapPin className="h-4 w-4 shrink-0 text-slate-400" />

                        {aeropuerto.ciudad}

                      </div>

                    </td>

                    {/* DIRECCIÓN */}

                    <td className="max-w-[250px] px-5 py-4">

                      <p
                        title={aeropuerto.direccion}
                        className="truncate text-slate-600"
                      >
                        {aeropuerto.direccion || "—"}
                      </p>

                    </td>

                    {/* ACCIONES */}

                    <td className="px-5 py-4">

                      <div className="flex items-center justify-center gap-2">

                        {/* CONSULTAR DETALLES */}

                        {puedeConsultar && (

                          <button
                            type="button"
                            onClick={() => openDetails(aeropuerto)}
                            disabled={saving || detailLoading}
                            title="Ver detalles"
                            aria-label={`Ver detalles de ${aeropuerto.nombre}`}
                            className="rounded-lg border border-sky-200 bg-sky-50 p-2 text-sky-700 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >

                            <Eye className="h-4 w-4" />

                          </button>

                        )}

                        {/* EDITAR AEROPUERTO */}

                        {puedeEditarAeropuerto(aeropuerto) && (

                          <button
                            type="button"
                            onClick={() => openEdit(aeropuerto)}
                            disabled={saving || detailLoading}
                            title="Editar aeropuerto"
                            aria-label={`Editar ${aeropuerto.nombre}`}
                            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >

                            <Pencil className="h-4 w-4" />

                          </button>

                        )}

                        {/* ELIMINAR AEROPUERTO */}

                        {puedeEliminar && (

                          <button
                            type="button"
                            onClick={() => openDelete(aeropuerto)}
                            disabled={saving || detailLoading}
                            title="Eliminar aeropuerto"
                            aria-label={`Eliminar ${aeropuerto.nombre}`}
                            className="rounded-lg border border-red-200 bg-red-50 p-2 text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >

                            <Trash2 className="h-4 w-4" />

                          </button>

                        )}

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

        {/* PIE DEL DIRECTORIO */}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4">

          <p className="text-sm text-slate-500">

            Mostrando {aeropuertosFiltrados.length} de{" "}
            {aeropuertos.length}{" "}
            {esAdministradorGeneral
              ? "aeropuertos registrados."
              : "aeropuertos asignados."}

          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">

            <span className="flex items-center gap-1.5">
              <Eye className="h-4 w-4 text-sky-600" />
              Consultar
            </span>

            {puedeEditar && (

              <span className="flex items-center gap-1.5">
                <Pencil className="h-4 w-4 text-slate-600" />
                Editar
              </span>

            )}

            {puedeEliminar && (

              <span className="flex items-center gap-1.5">
                <Trash2 className="h-4 w-4 text-red-600" />
                Eliminar
              </span>

            )}

          </div>

        </div>

      </section>

      {/* MODAL DE REGISTRO Y EDICIÓN */}

      {modal === "form" &&
        (esRegistro
          ? puedeCrear
          : puedeEditarAeropuerto(selectedAirport)) && (

          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
            onMouseDown={event => {
              if (event.target === event.currentTarget) {
                cerrarModal();
              }
            }}
          >

            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="airport-form-title"
              className="flex max-h-[90dvh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            >

              {/* ENCABEZADO DEL MODAL */}

              <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">

                <div className="flex items-start gap-3">

                  <div className="rounded-xl bg-sky-100 p-3 text-sky-700">

                    {esRegistro ? (
                      <Building2 className="h-6 w-6" />
                    ) : (
                      <Pencil className="h-6 w-6" />
                    )}

                  </div>

                  <div>

                    <h2
                      id="airport-form-title"
                      className="text-xl font-bold text-[#0C2D57]"
                    >
                      {esRegistro
                        ? "Registrar aeropuerto"
                        : "Editar aeropuerto"}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {esRegistro
                        ? "Completa la información del nuevo aeropuerto."
                        : "Actualiza la información del aeropuerto seleccionado."}
                    </p>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={cerrarModal}
                  disabled={saving}
                  aria-label="Cerrar modal"
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>

              </div>

              {/* FORMULARIO */}

              <form
                onSubmit={saveAirport}
                className="flex min-h-0 flex-1 flex-col"
              >

                {/* CONTENIDO DESPLAZABLE */}

                <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">

                  {/* MENSAJE DE ERROR */}

                  {error && (

                    <div
                      role="alert"
                      className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4"
                    >

                      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

                      <p className="text-sm text-red-700">
                        {error}
                      </p>

                    </div>

                  )}

                  {/* INFORMACIÓN DEL AEROPUERTO */}

                  <div className="flex items-center gap-2 border-b border-slate-200 pb-3">

                    <Building2 className="h-5 w-5 text-sky-600" />

                    <h3 className="font-semibold text-[#0C2D57]">
                      Información aeroportuaria
                    </h3>

                  </div>

                  <fieldset
                    disabled={saving}
                    className="grid grid-cols-1 gap-5 md:grid-cols-2"
                  >

                    {/* NOMBRE */}

                    <div className="md:col-span-2">

                      <label
                        htmlFor="airport-nombre"
                        className="mb-1.5 block text-sm font-medium text-slate-700"
                      >
                        Nombre del aeropuerto
                        <span className="ml-1 text-red-500">*</span>
                      </label>

                      <input
                        id="airport-nombre"
                        type="text"
                        value={form.nombre}
                        onChange={event =>
                          updateForm("nombre", event.target.value)
                        }
                        placeholder="Ej. Aeropuerto Internacional Juan Santamaría"
                        maxLength={191}
                        required
                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:bg-slate-100"
                      />

                    </div>

                    {/* CÓDIGO IATA */}

                    <div>

                      <label
                        htmlFor="airport-iata"
                        className="mb-1.5 block text-sm font-medium text-slate-700"
                      >
                        Código IATA
                        <span className="ml-1 text-red-500">*</span>
                      </label>

                      <div className="relative">

                        <input
                          id="airport-iata"
                          type="text"
                          value={form.codigoIata}
                          onChange={event =>
                            updateForm(
                              "codigoIata",
                              event.target.value
                            )
                          }
                          placeholder="Ej. SJO"
                          maxLength={3}
                          minLength={3}
                          pattern="[A-Z]{3}"
                          disabled={!iataEditable}
                          required
                          className={`w-full rounded-lg border px-3 py-2.5 font-mono text-sm font-semibold uppercase tracking-wider outline-none transition ${iataEditable
                            ? "border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                            : "cursor-not-allowed border-slate-200 bg-slate-100 pr-10 text-slate-500"
                            }`}
                        />

                        {!iataEditable && (

                          <Lock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                        )}

                      </div>

                      <p className="mt-1.5 text-xs text-slate-500">

                        {iataEditable
                          ? "Código único de tres letras."
                          : "Solo el administrador general puede modificar este código."}

                      </p>

                    </div>

                    {/* PAÍS */}

                    <div>

                      <label
                        htmlFor="airport-pais"
                        className="mb-1.5 block text-sm font-medium text-slate-700"
                      >
                        País
                        <span className="ml-1 text-red-500">*</span>
                      </label>

                      <div className="relative">

                        <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                        <input
                          id="airport-pais"
                          type="text"
                          value={form.pais}
                          onChange={event =>
                            updateForm("pais", event.target.value)
                          }
                          placeholder="Ej. Costa Rica"
                          maxLength={191}
                          required
                          className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:bg-slate-100"
                        />

                      </div>

                    </div>

                    {/* CIUDAD */}

                    <div className="md:col-span-2">

                      <label
                        htmlFor="airport-ciudad"
                        className="mb-1.5 block text-sm font-medium text-slate-700"
                      >
                        Ciudad
                        <span className="ml-1 text-red-500">*</span>
                      </label>

                      <div className="relative">

                        <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                        <input
                          id="airport-ciudad"
                          type="text"
                          value={form.ciudad}
                          onChange={event =>
                            updateForm("ciudad", event.target.value)
                          }
                          placeholder="Ej. Alajuela"
                          maxLength={191}
                          required
                          className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:bg-slate-100"
                        />

                      </div>

                    </div>

                    {/* DIRECCIÓN */}

                    <div className="md:col-span-2">

                      <label
                        htmlFor="airport-direccion"
                        className="mb-1.5 block text-sm font-medium text-slate-700"
                      >
                        Dirección
                        <span className="ml-1 text-red-500">*</span>
                      </label>

                      <textarea
                        id="airport-direccion"
                        value={form.direccion}
                        onChange={event =>
                          updateForm("direccion", event.target.value)
                        }
                        placeholder="Ingresa la dirección del aeropuerto..."
                        rows={3}
                        maxLength={191}
                        required
                        className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:bg-slate-100"
                      />

                      <p className="mt-1 text-right text-xs text-slate-400">
                        {form.direccion.length}/191
                      </p>

                    </div>

                  </fieldset>

                  {/* AVISO PARA ADMINISTRADOR DE AEROPUERTO */}

                  {!esRegistro && esAdministradorAeropuerto && (

                    <div className="flex items-start gap-3 rounded-lg border border-sky-200 bg-sky-50 p-4">

                      <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" />

                      <div>

                        <p className="text-sm font-semibold text-sky-800">
                          Permisos de edición limitados
                        </p>

                        <p className="mt-1 text-xs leading-relaxed text-sky-700">
                          Podés actualizar la información general de
                          tu aeropuerto activo. La modificación del
                          código IATA está reservada al administrador
                          general.
                        </p>

                      </div>

                    </div>

                  )}

                  <p className="text-xs text-slate-500">
                    Los campos marcados con
                    <span className="mx-1 text-red-500">*</span>
                    son obligatorios.
                  </p>

                </div>

                {/* PIE DEL MODAL */}

                <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">

                  <button
                    type="button"
                    onClick={cerrarModal}
                    disabled={saving}
                    className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >

                    {saving ? (

                      <LoaderCircle className="h-4 w-4 animate-spin" />

                    ) : (

                      <Save className="h-4 w-4" />

                    )}

                    {saving
                      ? "Guardando..."
                      : esRegistro
                        ? "Registrar aeropuerto"
                        : "Guardar cambios"}

                  </button>

                </div>

              </form>

            </section>

          </div>

        )}

      {/* MODAL DE DETALLES DEL AEROPUERTO */}

      {modal === "details" &&
        puedeConsultar &&
        selectedAirport && (

          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
            onMouseDown={event => {
              if (event.target === event.currentTarget) {
                cerrarModal();
              }
            }}
          >

            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="airport-details-title"
              className="flex max-h-[90dvh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            >

              {/* ENCABEZADO DEL MODAL */}

              <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">

                <div className="flex items-start gap-3">

                  <div className="rounded-xl bg-sky-100 p-3 text-sky-700">
                    <Building2 className="h-6 w-6" />
                  </div>

                  <div>

                    <h2
                      id="airport-details-title"
                      className="text-xl font-bold text-[#0C2D57]"
                    >
                      Detalles del aeropuerto
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Consulta la información del aeropuerto seleccionado.
                    </p>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={cerrarModal}
                  disabled={detailLoading}
                  aria-label="Cerrar modal"
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>

              </div>

              {/* CONTENIDO DEL MODAL */}

              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">

                {detailLoading ? (

                  /* ESTADO DE CARGA */

                  <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-slate-500">

                    <LoaderCircle className="h-8 w-8 animate-spin text-sky-600" />

                    <p className="text-sm">
                      Cargando información del aeropuerto...
                    </p>

                  </div>

                ) : error ? (

                  /* ESTADO DE ERROR */

                  <div
                    role="alert"
                    className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4"
                  >

                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

                    <div>

                      <h3 className="font-semibold text-red-800">
                        No se pudo consultar el aeropuerto
                      </h3>

                      <p className="mt-1 text-sm text-red-700">
                        {error}
                      </p>

                    </div>

                  </div>

                ) : (

                  <div className="space-y-6">

                    {/* IDENTIFICACIÓN DEL AEROPUERTO */}

                    <div className="rounded-xl border border-sky-200 bg-sky-50 p-5">

                      <div className="flex flex-wrap items-center gap-4">

                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700">

                          <Building2 className="h-8 w-8" />

                        </div>

                        <div className="min-w-0 flex-1">

                          <h3 className="text-lg font-bold text-[#0C2D57]">
                            {selectedAirport.nombre}
                          </h3>

                          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">

                            <MapPin className="h-4 w-4 shrink-0" />

                            {selectedAirport.ciudad},{" "}
                            {selectedAirport.pais}

                          </p>

                          {esAeropuertoPropio(selectedAirport) && (

                            <span className="mt-2 inline-flex items-center gap-1 rounded-md bg-sky-100 px-2 py-1 text-xs font-semibold text-sky-700">

                              <ShieldCheck className="h-3.5 w-3.5" />

                              Aeropuerto activo

                            </span>

                          )}

                        </div>

                        <div className="rounded-xl border border-sky-200 bg-white px-5 py-3 text-center">

                          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                            Código IATA
                          </p>

                          <p className="mt-1 font-mono text-2xl font-bold tracking-wider text-sky-700">
                            {selectedAirport.codigoIata}
                          </p>

                        </div>

                      </div>

                    </div>

                    {/* INFORMACIÓN GENERAL */}

                    <section>

                      <div className="mb-4 flex items-center gap-2 border-b border-slate-200 pb-3">

                        <Building2 className="h-5 w-5 text-sky-600" />

                        <h3 className="font-semibold text-[#0C2D57]">
                          Información general
                        </h3>

                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                        {/* IDENTIFICADOR */}

                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">

                          <p className="text-xs font-medium text-slate-500">
                            Identificador
                          </p>

                          <p className="mt-1 font-semibold text-[#0C2D57]">
                            #{selectedAirport.id}
                          </p>

                        </div>

                        {/* CÓDIGO IATA */}

                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">

                          <p className="text-xs font-medium text-slate-500">
                            Código IATA
                          </p>

                          <p className="mt-1 font-semibold text-[#0C2D57]">
                            {selectedAirport.codigoIata}
                          </p>

                        </div>

                        {/* PAÍS */}

                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">

                          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">

                            <Globe className="h-4 w-4" />

                            País

                          </div>

                          <p className="mt-2 font-semibold text-[#0C2D57]">
                            {selectedAirport.pais}
                          </p>

                        </div>

                        {/* CIUDAD */}

                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">

                          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">

                            <MapPin className="h-4 w-4" />

                            Ciudad

                          </div>

                          <p className="mt-2 font-semibold text-[#0C2D57]">
                            {selectedAirport.ciudad}
                          </p>

                        </div>

                        {/* DIRECCIÓN */}

                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 sm:col-span-2">

                          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">

                            <MapPin className="h-4 w-4" />

                            Dirección

                          </div>

                          <p className="mt-2 whitespace-pre-wrap break-words text-sm font-medium text-[#0C2D57]">
                            {selectedAirport.direccion || "—"}
                          </p>

                        </div>

                      </div>

                    </section>

                    {/* RELACIONES DEL AEROPUERTO */}

                    {mostrarRelaciones && (

                      <section>

                        <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-200 pb-3">

                          <div className="flex items-center gap-2">

                            <Users className="h-5 w-5 text-sky-600" />

                            <h3 className="font-semibold text-[#0C2D57]">
                              Registros asociados
                            </h3>

                          </div>

                          <span className="rounded-md bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-700">
                            {totalRelaciones} asociaciones
                          </span>

                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">

                          {Object.entries(etiquetasRelaciones).map(
                            ([clave, etiqueta]) => {

                              const Icono =
                                iconosRelaciones[clave];

                              const cantidad =
                                relacionesSeleccionadas[clave];

                              return (

                                <div
                                  key={clave}
                                  className="rounded-xl border border-slate-200 bg-white p-4"
                                >

                                  <div className="flex items-center gap-2">

                                    <div className="rounded-lg bg-sky-100 p-2 text-sky-700">

                                      <Icono className="h-5 w-5" />

                                    </div>

                                    <p className="text-xs font-medium text-slate-500">
                                      {etiqueta}
                                    </p>

                                  </div>

                                  <p className="mt-3 text-2xl font-bold text-[#0C2D57]">
                                    {cantidad ?? "—"}
                                  </p>

                                </div>

                              );
                            }
                          )}

                        </div>

                        <p className="mt-3 text-xs text-slate-500">
                          Los conteos incluyen registros históricos
                          e inactivos cuando corresponda.
                        </p>

                      </section>

                    )}

                    {/* INFORMACIÓN SOBRE LA ELIMINACIÓN */}

                    {puedeEliminar && mostrarRelaciones && (

                      <div
                        className={`flex items-start gap-3 rounded-lg border p-4 ${totalRelaciones > 0
                          ? "border-amber-200 bg-amber-50"
                          : "border-emerald-200 bg-emerald-50"
                          }`}
                      >

                        {totalRelaciones > 0 ? (

                          <Lock className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

                        ) : (

                          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

                        )}

                        <div>

                          <p
                            className={`text-sm font-semibold ${totalRelaciones > 0
                              ? "text-amber-800"
                              : "text-emerald-800"
                              }`}
                          >

                            {totalRelaciones > 0
                              ? "Eliminación restringida"
                              : "Sin registros asociados"}

                          </p>

                          <p
                            className={`mt-1 text-xs leading-relaxed ${totalRelaciones > 0
                              ? "text-amber-700"
                              : "text-emerald-700"
                              }`}
                          >

                            {totalRelaciones > 0
                              ? "Este aeropuerto no puede eliminarse porque tiene registros asociados."
                              : "Actualmente no se detectan dependencias que impidan solicitar su eliminación."}

                          </p>

                        </div>

                      </div>

                    )}

                  </div>

                )}

              </div>

              {/* PIE DEL MODAL */}

              <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">

                <button
                  type="button"
                  onClick={cerrarModal}
                  disabled={detailLoading}
                  className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cerrar
                </button>

                {!detailLoading &&
                  !error &&
                  puedeEditarAeropuerto(selectedAirport) && (

                    <button
                      type="button"
                      onClick={() => openEdit(selectedAirport)}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700"
                    >

                      <Pencil className="h-4 w-4" />

                      Editar aeropuerto

                    </button>

                  )}

              </div>

            </section>

          </div>

        )}

      {/* MODAL DE ELIMINACIÓN DEL AEROPUERTO */}

      {modal === "delete" &&
        puedeEliminar &&
        selectedAirport && (

          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
            onMouseDown={event => {
              if (event.target === event.currentTarget) {
                cerrarModal();
              }
            }}
          >

            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="airport-delete-title"
              className="flex max-h-[90dvh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            >

              {/* ENCABEZADO */}

              <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">

                <div className="flex items-start gap-3">

                  <div className="rounded-xl bg-red-100 p-3 text-red-600">

                    <Trash2 className="h-6 w-6" />

                  </div>

                  <div>

                    <h2
                      id="airport-delete-title"
                      className="text-xl font-bold text-[#0C2D57]"
                    >
                      Eliminar aeropuerto
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Verifica las dependencias antes de eliminar
                      el aeropuerto seleccionado.
                    </p>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={cerrarModal}
                  disabled={saving || detailLoading}
                  aria-label="Cerrar modal"
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
                >

                  <X className="h-5 w-5" />

                </button>

              </div>

              {/* CONTENIDO DEL MODAL */}

              <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">

                {/* INFORMACIÓN DEL AEROPUERTO */}

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                  <div className="flex flex-wrap items-center gap-3">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700">

                      <Building2 className="h-6 w-6" />

                    </div>

                    <div className="min-w-0 flex-1">

                      <h3 className="font-semibold text-[#0C2D57]">
                        {selectedAirport.nombre}
                      </h3>

                      <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">

                        <MapPin className="h-4 w-4 shrink-0" />

                        {selectedAirport.ciudad},{" "}
                        {selectedAirport.pais}

                      </p>

                    </div>

                    <span className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 font-mono text-lg font-bold text-sky-700">

                      {selectedAirport.codigoIata}

                    </span>

                  </div>

                </div>

                {/* VERIFICACIÓN DE DEPENDENCIAS */}

                {detailLoading ? (

                  <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-slate-500">

                    <LoaderCircle className="h-8 w-8 animate-spin text-sky-600" />

                    <p className="text-sm">
                      Verificando registros asociados...
                    </p>

                  </div>

                ) : error ? (

                  /* MENSAJE DE ERROR */

                  <div
                    role="alert"
                    className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4"
                  >

                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

                    <div>

                      <h3 className="font-semibold text-red-800">
                        No se puede completar la eliminación
                      </h3>

                      <p className="mt-1 text-sm text-red-700">
                        {error}
                      </p>

                      <p className="mt-2 text-xs text-red-600">
                        Cerrá esta ventana y volvé a consultar
                        las dependencias del aeropuerto.
                      </p>

                    </div>

                  </div>

                ) : !conteosVerificados ? (

                  <div
                    role="alert"
                    className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4"
                  >

                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

                    <div>

                      <h3 className="font-semibold text-amber-800">
                        Dependencias sin verificar
                      </h3>

                      <p className="mt-1 text-sm text-amber-700">
                        No es posible eliminar el aeropuerto
                        sin verificar todos sus registros asociados.
                      </p>

                    </div>

                  </div>

                ) : (

                  <>

                    {/* ENCABEZADO DE DEPENDENCIAS */}

                    <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3">

                      <div className="flex items-center gap-2">

                        <Users className="h-5 w-5 text-sky-600" />

                        <h3 className="font-semibold text-[#0C2D57]">
                          Registros asociados
                        </h3>

                      </div>

                      <span
                        className={`rounded-md px-2.5 py-1 text-xs font-semibold ${tieneDependencias
                          ? "bg-red-100 text-red-700"
                          : "bg-emerald-100 text-emerald-700"
                          }`}
                      >

                        {totalRelaciones} asociaciones

                      </span>

                    </div>

                    {/* TARJETAS DE DEPENDENCIAS */}

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">

                      {Object.entries(etiquetasRelaciones).map(
                        ([clave, etiqueta]) => {

                          const Icono = iconosRelaciones[clave];

                          const cantidad =
                            relacionesSeleccionadas[clave];

                          const tieneRegistros = cantidad > 0;

                          return (

                            <div
                              key={clave}
                              className={`rounded-xl border p-4 ${tieneRegistros
                                ? "border-red-200 bg-red-50"
                                : "border-slate-200 bg-white"
                                }`}
                            >

                              <div className="flex items-center gap-2">

                                <div
                                  className={`rounded-lg p-2 ${tieneRegistros
                                    ? "bg-red-100 text-red-600"
                                    : "bg-sky-100 text-sky-700"
                                    }`}
                                >

                                  <Icono className="h-5 w-5" />

                                </div>

                                <p className="text-xs font-medium text-slate-600">
                                  {etiqueta}
                                </p>

                              </div>

                              <p
                                className={`mt-3 text-2xl font-bold ${tieneRegistros
                                  ? "text-red-700"
                                  : "text-[#0C2D57]"
                                  }`}
                              >

                                {cantidad}

                              </p>

                            </div>

                          );
                        }
                      )}

                    </div>

                    {/* RESULTADO DE LA VERIFICACIÓN */}

                    {tieneDependencias ? (

                      <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">

                        <Lock className="mt-0.5 h-6 w-6 shrink-0 text-red-600" />

                        <div>

                          <h3 className="font-semibold text-red-800">
                            Eliminación no permitida
                          </h3>

                          <p className="mt-1 text-sm leading-relaxed text-red-700">

                            Este aeropuerto tiene registros asociados.
                            Para proteger la integridad de la información,
                            el sistema no permite eliminarlo.

                          </p>

                          <p className="mt-2 text-xs text-red-600">

                            Los registros históricos e inactivos
                            también se consideran dependencias.

                          </p>

                        </div>

                      </div>

                    ) : (

                      <>

                        {/* VERIFICACIÓN EXITOSA */}

                        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">

                          <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" />

                          <div>

                            <h3 className="font-semibold text-emerald-800">
                              Sin registros asociados
                            </h3>

                            <p className="mt-1 text-sm text-emerald-700">

                              No se detectaron dependencias que
                              impidan solicitar la eliminación
                              del aeropuerto.

                            </p>

                          </div>

                        </div>

                        {/* ADVERTENCIA DE ELIMINACIÓN */}

                        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">

                          <AlertCircle className="mt-0.5 h-6 w-6 shrink-0 text-amber-600" />

                          <div>

                            <h3 className="font-semibold text-amber-800">
                              ¿Confirmás la eliminación?
                            </h3>

                            <p className="mt-1 text-sm leading-relaxed text-amber-700">

                              El aeropuerto{" "}

                              <strong>
                                {selectedAirport.nombre}
                              </strong>

                              {" "}será eliminado permanentemente
                              del sistema.

                            </p>

                            <p className="mt-2 text-sm font-semibold text-amber-800">
                              Esta acción no se puede deshacer.
                            </p>

                          </div>

                        </div>

                      </>

                    )}

                  </>

                )}

              </div>

              {/* PIE DEL MODAL */}

              <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">

                <button
                  type="button"
                  onClick={cerrarModal}
                  disabled={saving || detailLoading}
                  className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {tieneDependencias || error
                    ? "Cerrar"
                    : "Cancelar"}

                </button>

                <button
                  type="button"
                  onClick={confirmarEliminacion}
                  disabled={!puedeConfirmarEliminacion}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
                >

                  {saving ? (

                    <LoaderCircle className="h-4 w-4 animate-spin" />

                  ) : tieneDependencias ? (

                    <Lock className="h-4 w-4" />

                  ) : (

                    <Trash2 className="h-4 w-4" />

                  )}

                  {saving
                    ? "Eliminando..."
                    : tieneDependencias
                      ? "Eliminación bloqueada"
                      : "Eliminar aeropuerto"}

                </button>

              </div>

            </section>

          </div>

        )}

    </main>
  );
}