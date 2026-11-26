import { useEffect, useMemo, useRef, useState } from "react";

import {
  Users,
  UserRound,
  UserRoundPlus,
  Globe,
  Ticket,
  Search,
  RotateCcw,
  Pencil,
  Eye,
  Trash2,
  X,
  Save,
  LoaderCircle,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
  Building2,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  CreditCard,
  Plane,
  History,
} from "lucide-react";

import { pasajerosService } from "../services/pasajerosService";
import { useAuth } from "../context/AuthContext";
import { tienePermiso } from "../config/permissions";

import PageHeader from "../components/management/PageHeader";
import StatCard from "../components/management/StatCard";

// ==========================================
// CONFIGURACIÓN DEL FORMULARIO
// ==========================================

const initialForm = {
  nombreCompleto: "",
  tipoDocumento: "CEDULA",
  numeroDocumento: "",
  nacionalidad: "",
  fechaNacimiento: "",
  correo: "",
  telefono: "",
  direccion: "",
};

const tiposDocumento = [
  {
    value: "CEDULA",
    label: "Cédula",
  },
  {
    value: "PASAPORTE",
    label: "Pasaporte",
  },
  {
    value: "RESIDENCIA",
    label: "Residencia",
  },
];

const rolesAutorizados = [
  "ADMIN_GENERAL",
  "ADMIN_AEROPUERTO",
  "EMPLEADO",
];

// ==========================================
// FUNCIONES AUXILIARES
// ==========================================

function normalizarTexto(valor) {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function normalizarDocumento(valor) {
  return String(valor ?? "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]/g, "");
}

function obtenerMensajeError(error) {
  return (
    error?.message ||
    "Ocurrió un error al realizar la operación."
  );
}

function obtenerFechaFormulario(fecha) {
  if (!fecha) return "";

  return String(fecha).substring(0, 10);
}

function obtenerFechaActual() {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Costa_Rica",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const fecha = Object.fromEntries(
    partes.map((parte) => [
      parte.type,
      parte.value,
    ])
  );

  return `${fecha.year}-${fecha.month}-${fecha.day}`;
}

function fechaNacimientoValida(valor) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    return false;
  }

  const fecha = new Date(
    `${valor}T12:00:00.000Z`
  );

  if (Number.isNaN(fecha.getTime())) {
    return false;
  }

  if (
    fecha.toISOString().substring(0, 10) !== valor
  ) {
    return false;
  }

  if (Number(valor.substring(0, 4)) < 1000) {
    return false;
  }

  return valor <= obtenerFechaActual();
}

function formatearFecha(fecha) {
  if (!fecha) return "No registrada";

  const valor = new Date(fecha);

  if (Number.isNaN(valor.getTime())) {
    return "Fecha no válida";
  }

  return valor.toLocaleDateString("es-CR", {
    timeZone: "UTC",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function obtenerTipoDocumento(tipo) {
  return (
    tiposDocumento.find(
      (documento) => documento.value === tipo
    )?.label || tipo || "No registrado"
  );
}

function obtenerIniciales(nombre) {
  return String(nombre ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((palabra) => palabra[0].toUpperCase())
    .join("");
}

function obtenerCantidadReservaciones(pasajero) {
  const cantidad = pasajero?._count?.reservaciones;

  if (
    !Number.isInteger(cantidad) ||
    cantidad < 0
  ) {
    return null;
  }

  return cantidad;
}

function formatearMoneda(monto) {
  if (
    monto === null ||
    monto === undefined ||
    monto === ""
  ) {
    return "No registrado";
  }

  const valor = Number(monto);

  if (!Number.isFinite(valor)) {
    return "No registrado";
  }

  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "USD",
  }).format(valor);
}

function prepararDatosFormulario(form) {
  return {
    nombreCompleto: form.nombreCompleto
      .trim()
      .replace(/\s+/g, " "),

    tipoDocumento: form.tipoDocumento
      .trim()
      .toUpperCase(),

    numeroDocumento: normalizarDocumento(
      form.numeroDocumento
    ),

    nacionalidad: form.nacionalidad
      .trim()
      .replace(/\s+/g, " "),

    fechaNacimiento: form.fechaNacimiento,

    correo: form.correo
      .trim()
      .toLowerCase(),

    telefono: form.telefono.trim() || null,

    direccion:
      form.direccion
        .trim()
        .replace(/\s+/g, " ") || null,
  };
}

function convertirPasajeroAFormulario(pasajero) {
  return {
    nombreCompleto:
      pasajero.nombreCompleto ?? "",

    tipoDocumento:
      pasajero.tipoDocumento ?? "CEDULA",

    numeroDocumento:
      pasajero.numeroDocumento ?? "",

    nacionalidad:
      pasajero.nacionalidad ?? "",

    fechaNacimiento: obtenerFechaFormulario(
      pasajero.fechaNacimiento
    ),

    correo: pasajero.correo ?? "",

    telefono: pasajero.telefono ?? "",

    direccion: pasajero.direccion ?? "",
  };
}

function formatearFechaHora(fecha) {
  if (!fecha) return "No registrada";

  const valor = new Date(fecha);

  if (Number.isNaN(valor.getTime())) {
    return "Fecha no válida";
  }

  return new Intl.DateTimeFormat("es-CR", {
    timeZone: "America/Costa_Rica",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(valor);
}

function obtenerEstadoReservacion(estado) {
  const estados = {
    CONFIRMADA: "Confirmada",
    CHECK_IN: "Check-in realizado",
    CANCELADA: "Cancelada",
  };

  return estados[estado] || estado || "Desconocido";
}

function obtenerClaseEstadoReservacion(estado) {
  const estilos = {
    CONFIRMADA: "bg-sky-100 text-sky-700",
    CHECK_IN: "bg-emerald-100 text-emerald-700",
    CANCELADA: "bg-red-100 text-red-700",
  };

  return estilos[estado] || "bg-slate-100 text-slate-600";
}

function calcularEdad(fechaNacimiento) {
  const fecha = obtenerFechaFormulario(
    fechaNacimiento
  );

  if (!fechaNacimientoValida(fecha)) {
    return "No disponible";
  }

  const [anio, mes, dia] = fecha
    .split("-")
    .map(Number);

  const [anioActual, mesActual, diaActual] =
    obtenerFechaActual()
      .split("-")
      .map(Number);

  let edad = anioActual - anio;

  if (
    mesActual < mes ||
    (mesActual === mes && diaActual < dia)
  ) {
    edad--;
  }

  return `${edad} años`;
}

function ocultarDocumento(documento) {
  const valor = String(documento ?? "");

  if (!valor) return "No registrado";

  if (valor.length <= 4) {
    return "•".repeat(valor.length);
  }

  return (
    "•".repeat(valor.length - 4) +
    valor.slice(-4)
  );
}

function DetallePasajero({
  icono: Icono,
  titulo,
  valor,
}) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-sky-600">

        {Icono && <Icono size={18} />}

      </div>

      <div className="min-w-0 flex-1">

        <p className="text-xs font-medium text-slate-500">
          {titulo}
        </p>

        <p className="mt-1 break-words text-sm font-semibold text-[#0C2D57]">
          {valor ?? "No registrado"}
        </p>

      </div>

    </div>
  );
}
// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export default function PassengerManagement() {
  // ========================================
  // AUTENTICACIÓN Y PERMISOS
  // ========================================

  const { rol, usuario, aeropuertoActivo } = useAuth();

  const accesoGlobal = rol === "ADMIN_GENERAL";

  const aeropuertoActivoId =
    aeropuertoActivo?.id ?? null;

  const usuarioSesionId =
    usuario?.id ?? null;

  const tieneContextoOperativo =
    accesoGlobal ||
    (
      (
        rol === "ADMIN_AEROPUERTO" ||
        rol === "EMPLEADO"
      ) &&
      Number.isSafeInteger(aeropuertoActivoId) &&
      aeropuertoActivoId > 0 &&
      aeropuertoActivoId <= 2147483647
    );
  const puedeConsultar =
    tieneContextoOperativo &&
    tienePermiso(rol, "pasajeros", "consultar");

  const puedeCrear =
    tieneContextoOperativo &&
    tienePermiso(rol, "pasajeros", "crear");

  const puedeEditar =
    tieneContextoOperativo &&
    tienePermiso(rol, "pasajeros", "editar");

  const puedeConsultarHistorial =
    tieneContextoOperativo &&
    tienePermiso(rol, "pasajeros", "consultarHistorial");

  const puedeEliminar =
    accesoGlobal &&
    tienePermiso(rol, "pasajeros", "eliminar");

  // ========================================
  // REFERENCIAS DE CONTROL
  // ========================================

  const versionCarga = useRef(0);

  const versionDetalle = useRef(0);

  const versionSesion = useRef(0);

  const operacionEnCurso = useRef(false);

  // ========================================
  // ESTADOS PRINCIPALES
  // ========================================

  const [pasajeros, setPasajeros] = useState([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [detailLoading, setDetailLoading] =
    useState(false);

  const [datosCargados, setDatosCargados] =
    useState(false);

  const [errorCarga, setErrorCarga] =
    useState("");

  // ========================================
  // ESTADOS DE FILTROS
  // ========================================

  const [search, setSearch] = useState("");

  const [documentFilter, setDocumentFilter] =
    useState("");

  const [
    nationalityFilter,
    setNationalityFilter,
  ] = useState("");

  const [
    reservationFilter,
    setReservationFilter,
  ] = useState("");

  // ========================================
  // ESTADOS DE MODALES
  // ========================================

  const [modal, setModal] = useState(null);

  const [
    selectedPassenger,
    setSelectedPassenger,
  ] = useState(null);

  const [editingId, setEditingId] =
    useState(null);

  const [
    reservacionesPasajero,
    setReservacionesPasajero,
  ] = useState([]);

  const [form, setForm] = useState({
    ...initialForm,
  });

  const [touched, setTouched] = useState({});
  // ========================================
  // MENSAJES DEL SISTEMA
  // ========================================

  const [error, setError] = useState("");

  const [message, setMessage] = useState("");

  // ========================================
  // CARGAR PASAJEROS
  // ========================================

  async function cargarDatos(
    mostrarCarga = true
  ) {
    if (!puedeConsultar) {
      setLoading(false);
      return;
    }

    const solicitudActual =
      ++versionCarga.current;

    if (mostrarCarga) {
      setLoading(true);
      setError("");
    }

    setErrorCarga("");

    try {
      const resultado =
        await pasajerosService.obtenerTodos();

      if (
        solicitudActual !== versionCarga.current
      ) {
        return;
      }

      if (!Array.isArray(resultado)) {
        throw new Error(
          "El servidor devolvió una respuesta de pasajeros no válida."
        );
      }

      setPasajeros(resultado);
      setDatosCargados(true);
    } catch (error) {
      if (
        solicitudActual !== versionCarga.current
      ) {
        return;
      }

      setErrorCarga(
        obtenerMensajeError(error)
      );

      setDatosCargados(false);
    } finally {
      if (
        solicitudActual === versionCarga.current
      ) {
        setLoading(false);
      }
    }
  }

  // ========================================
  // CONTROL DE SESIÓN Y AEROPUERTO ACTIVO
  // ========================================

  useEffect(() => {
    versionSesion.current += 1;

    setPasajeros([]);
    setDatosCargados(false);

    setSearch("");
    setDocumentFilter("");
    setNationalityFilter("");
    setReservationFilter("");

    setModal(null);
    setSelectedPassenger(null);
    setEditingId(null);
    setReservacionesPasajero([]);

    setForm({
      ...initialForm,
    });

    setTouched({});
    setError("");
    setErrorCarga("");
    setMessage("");

    setSaving(false);
    setDetailLoading(false);

    operacionEnCurso.current = false;

    if (puedeConsultar) {
      void cargarDatos();
    } else {
      setLoading(false);
    }

    return () => {
      versionCarga.current += 1;
      versionDetalle.current += 1;
      versionSesion.current += 1;
    };
  }, [
    puedeConsultar,
    usuarioSesionId,
    aeropuertoActivoId,
    rol,
  ]);

  // ========================================
  // NACIONALIDADES DISPONIBLES
  // ========================================

  const nacionalidades = useMemo(() => {
    const resultado = new Map();

    for (const pasajero of pasajeros) {
      const nacionalidad =
        pasajero.nacionalidad?.trim();

      if (!nacionalidad) continue;

      const clave =
        normalizarTexto(nacionalidad);

      if (!resultado.has(clave)) {
        resultado.set(clave, nacionalidad);
      }
    }

    return [...resultado.values()].sort(
      (a, b) => a.localeCompare(b, "es")
    );
  }, [pasajeros]);

  // ========================================
  // ESTADÍSTICAS
  // ========================================

  const estadisticas = useMemo(() => {
    const conReservaciones = pasajeros.filter(
      (pasajero) =>
        obtenerCantidadReservaciones(
          pasajero
        ) > 0
    ).length;

    const sinReservaciones = pasajeros.filter(
      (pasajero) =>
        obtenerCantidadReservaciones(
          pasajero
        ) === 0
    ).length;

    const conteosDisponibles =
      pasajeros.every(
        (pasajero) =>
          obtenerCantidadReservaciones(
            pasajero
          ) !== null
      );

    return {
      totalPasajeros: pasajeros.length,

      totalNacionalidades:
        nacionalidades.length,

      pasajerosConReservaciones:
        conReservaciones,

      pasajerosSinReservaciones:
        sinReservaciones,

      conteosDisponibles,
    };
  }, [pasajeros, nacionalidades]);

  // ========================================
  // FILTRAR PASAJEROS
  // ========================================

  const pasajerosFiltrados = useMemo(() => {
    const textoBusqueda =
      normalizarTexto(search);

    const documentoBusqueda =
      normalizarDocumento(search);

    return pasajeros.filter((pasajero) => {
      const textoPasajero = normalizarTexto(
        [
          pasajero.nombreCompleto,
          pasajero.numeroDocumento,
          pasajero.correo,
          pasajero.nacionalidad,
          pasajero.telefono,
        ]
          .filter(Boolean)
          .join(" ")
      );

      const documentoPasajero =
        normalizarDocumento(
          pasajero.numeroDocumento
        );

      const coincideBusqueda =
        !textoBusqueda ||
        textoPasajero.includes(textoBusqueda) ||
        (
          Boolean(documentoBusqueda) &&
          documentoPasajero.includes(
            documentoBusqueda
          )
        );

      const coincideDocumento =
        !documentFilter ||
        pasajero.tipoDocumento ===
        documentFilter;

      const coincideNacionalidad =
        !nationalityFilter ||
        normalizarTexto(
          pasajero.nacionalidad
        ) ===
        normalizarTexto(
          nationalityFilter
        );

      const cantidadReservaciones =
        obtenerCantidadReservaciones(
          pasajero
        );

      const coincideReservaciones =
        !reservationFilter ||
        (
          reservationFilter === "CON" &&
          cantidadReservaciones !== null &&
          cantidadReservaciones > 0
        ) ||
        (
          reservationFilter === "SIN" &&
          cantidadReservaciones === 0
        );

      return (
        coincideBusqueda &&
        coincideDocumento &&
        coincideNacionalidad &&
        coincideReservaciones
      );
    });
  }, [
    pasajeros,
    search,
    documentFilter,
    nationalityFilter,
    reservationFilter,
  ]);

  const filtrosActivos = Boolean(
    search ||
    documentFilter ||
    nationalityFilter ||
    reservationFilter
  );

  function limpiarFiltros() {
    setSearch("");
    setDocumentFilter("");
    setNationalityFilter("");
    setReservationFilter("");
  }

  // ========================================
  // VALIDACIÓN DE DOCUMENTOS DUPLICADOS
  // ========================================

  const documentoDuplicado = useMemo(() => {
    const documento = normalizarDocumento(
      form.numeroDocumento
    );

    if (!documento) return false;

    return pasajeros.some(
      (pasajero) =>
        Number(pasajero.id) !==
        Number(editingId) &&
        normalizarDocumento(
          pasajero.numeroDocumento
        ) === documento
    );
  }, [
    pasajeros,
    form.numeroDocumento,
    editingId,
  ]);

  // ========================================
  // VALIDACIÓN DEL FORMULARIO
  // ========================================

  const erroresFormulario = useMemo(() => {
    const errores = {};

    const datos =
      prepararDatosFormulario(form);

    if (
      !datos.nombreCompleto ||
      datos.nombreCompleto.length < 2
    ) {
      errores.nombreCompleto =
        "Ingresá el nombre completo del pasajero.";
    }

    if (
      !tiposDocumento.some(
        (tipo) =>
          tipo.value === datos.tipoDocumento
      )
    ) {
      errores.tipoDocumento =
        "Seleccioná un tipo de documento válido.";
    }

    if (
      !/^[A-Z0-9]{1,50}$/.test(
        datos.numeroDocumento
      )
    ) {
      errores.numeroDocumento =
        "Ingresá un documento alfanumérico válido.";
    } else if (documentoDuplicado) {
      errores.numeroDocumento =
        "Ya existe un pasajero con ese documento.";
    }

    if (!datos.nacionalidad) {
      errores.nacionalidad =
        "Ingresá la nacionalidad del pasajero.";
    }

    if (
      !fechaNacimientoValida(
        datos.fechaNacimiento
      )
    ) {
      errores.fechaNacimiento =
        "Ingresá una fecha válida que no sea futura.";
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        datos.correo
      )
    ) {
      errores.correo =
        "Ingresá un correo electrónico válido.";
    }

    if (datos.telefono) {
      const cantidadDigitos =
        datos.telefono.replace(/\D/g, "").length;

      if (
        !/^\+?[0-9\s().-]+$/.test(
          datos.telefono
        ) ||
        cantidadDigitos < 5 ||
        cantidadDigitos > 15 ||
        datos.telefono.length > 30
      ) {
        errores.telefono =
          "Ingresá un número de teléfono válido.";
      }
    }

    for (const [campo, valor] of Object.entries(
      form
    )) {
      if (
        typeof valor === "string" &&
        valor.trim().length > 191
      ) {
        errores[campo] =
          "Este campo no puede superar los 191 caracteres.";
      }
    }

    return errores;
  }, [form, documentoDuplicado]);

  // ========================================
  // DETECTAR CAMBIOS EN EDICIÓN
  // ========================================

  const cambiosFormulario = useMemo(() => {
    if (
      editingId === null ||
      !selectedPassenger
    ) {
      return {};
    }

    const datosNuevos =
      prepararDatosFormulario(form);

    const formularioOriginal =
      convertirPasajeroAFormulario(
        selectedPassenger
      );

    const datosOriginales =
      prepararDatosFormulario(
        formularioOriginal
      );

    const cambios = {};

    for (const campo of Object.keys(
      datosNuevos
    )) {
      if (
        datosNuevos[campo] !==
        datosOriginales[campo]
      ) {
        cambios[campo] = datosNuevos[campo];
      }
    }

    return cambios;
  }, [
    form,
    editingId,
    selectedPassenger,
  ]);

  const hayCambios =
    editingId === null ||
    Object.keys(cambiosFormulario).length > 0;

  const formularioValido =
    Object.keys(erroresFormulario).length === 0;

  const puedeGuardar =
    formularioValido &&
    hayCambios &&
    !loading &&
    !saving &&
    !detailLoading &&
    datosCargados &&
    (
      (modal === "create" && puedeCrear) ||
      (
        modal === "edit" &&
        puedeEditar &&
        editingId !== null &&
        selectedPassenger?.id === editingId
      )
    );


  function marcarCampoVisitado(campo) {
    setTouched((anterior) => ({
      ...anterior,
      [campo]: true,
    }));
  }

  function obtenerErrorCampo(campo) {
    return touched[campo]
      ? erroresFormulario[campo]
      : "";
  }

  function obtenerClaseCampo(campo) {
    return `w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-50 ${obtenerErrorCampo(campo)
      ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
      : "border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
      }`;
  }

  // ========================================
  // ACTUALIZAR FORMULARIO
  // ========================================

  function updateForm(campo, valor) {
    if (saving) return;

    setError("");

    setForm((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  }

  function reiniciarFormulario() {
    setForm({
      ...initialForm,
    });

    setTouched({});

    setEditingId(null);
    setSelectedPassenger(null);
    setReservacionesPasajero([]);
  }

  // ========================================
  // ABRIR MODAL DE REGISTRO
  // ========================================

  function openCreate() {
    if (
      !puedeCrear ||
      !datosCargados ||
      loading ||
      saving ||
      detailLoading ||
      operacionEnCurso.current
    ) {
      return;
    }

    versionDetalle.current += 1;

    reiniciarFormulario();

    setError("");
    setMessage("");

    setModal("create");
  }

  // ========================================
  // CARGAR INFORMACIÓN INDIVIDUAL
  // ========================================

  async function cargarDetalle(
    pasajero,
    tipoModal
  ) {
    if (
      !pasajero?.id ||
      !datosCargados ||
      loading ||
      saving ||
      detailLoading ||
      operacionEnCurso.current
    ) {
      return;
    }

    if (
      tipoModal === "details" &&
      !puedeConsultarHistorial
    ) {
      return;
    }

    if (
      tipoModal === "edit" &&
      !puedeEditar
    ) {
      return;
    }

    if (
      tipoModal === "delete" &&
      !puedeEliminar
    ) {
      return;
    }

    const solicitudActual =
      ++versionDetalle.current;

    reiniciarFormulario();

    setError("");
    setMessage("");

    setModal(tipoModal);
    setDetailLoading(true);

    try {
      const solicitudes = [
        pasajerosService.obtenerPorId(
          pasajero.id
        ),
      ];

      if (tipoModal === "details") {
        solicitudes.push(
          pasajerosService.obtenerReservaciones(
            pasajero.id
          )
        );
      }

      const [
        detalle,
        historial = [],
      ] = await Promise.all(solicitudes);

      if (
        solicitudActual !==
        versionDetalle.current
      ) {
        return;
      }

      if (
        !detalle ||
        Number(detalle.id) !==
        Number(pasajero.id)
      ) {
        throw new Error(
          "No fue posible obtener la información del pasajero."
        );
      }

      if (
        tipoModal === "details" &&
        !Array.isArray(historial)
      ) {
        throw new Error(
          "No fue posible obtener el historial de reservaciones."
        );
      }

      setSelectedPassenger(detalle);

      setReservacionesPasajero(historial);

      if (tipoModal === "edit") {
        setEditingId(detalle.id);

        setForm(
          convertirPasajeroAFormulario(
            detalle
          )
        );
      }
    } catch (error) {
      if (
        solicitudActual !==
        versionDetalle.current
      ) {
        return;
      }

      setError(
        obtenerMensajeError(error)
      );
    } finally {
      if (
        solicitudActual ===
        versionDetalle.current
      ) {
        setDetailLoading(false);
      }
    }
  }

  // ========================================
  // ABRIR MODALES
  // ========================================

  function openEdit(pasajero) {
    return cargarDetalle(
      pasajero,
      "edit"
    );
  }

  function openDetails(pasajero) {
    return cargarDetalle(
      pasajero,
      "details"
    );
  }

  function openDelete(pasajero) {
    return cargarDetalle(
      pasajero,
      "delete"
    );
  }

  // ========================================
  // CERRAR MODAL
  // ========================================

  function cerrarModal() {
    if (
      saving ||
      operacionEnCurso.current
    ) {
      return;
    }

    versionDetalle.current += 1;

    setModal(null);
    setDetailLoading(false);
    setError("");

    reiniciarFormulario();
  }

  // ========================================
  // REGISTRAR O ACTUALIZAR PASAJERO
  // ========================================

  async function savePassenger(event) {
    event.preventDefault();

    if (
      saving ||
      loading ||
      detailLoading ||
      operacionEnCurso.current
    ) {
      return;
    }

    if (!puedeGuardar) {
      setTouched(
        Object.fromEntries(
          Object.keys(initialForm).map(
            (campo) => [campo, true]
          )
        )
      );

      setError(
        "Revisá los datos del formulario antes de continuar."
      );

      return;
    }

    const registrando = modal === "create";

    const datos = registrando
      ? prepararDatosFormulario(form)
      : cambiosFormulario;

    const sesionActual =
      versionSesion.current;

    operacionEnCurso.current = true;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      let resultado;

      if (registrando) {
        resultado =
          await pasajerosService.registrar(
            datos
          );
      } else {
        resultado =
          await pasajerosService.actualizar(
            editingId,
            datos
          );
      }

      if (
        sesionActual !==
        versionSesion.current
      ) {
        return;
      }

      versionCarga.current += 1;

      if (resultado?.id) {
        setPasajeros((anteriores) => {
          const actualizados = registrando
            ? [
              ...anteriores.filter(
                (pasajero) =>
                  pasajero.id !==
                  resultado.id
              ),
              resultado,
            ]
            : anteriores.map(
              (pasajero) =>
                pasajero.id === resultado.id
                  ? resultado
                  : pasajero
            );

          return actualizados.sort(
            (a, b) =>
              String(
                a.nombreCompleto ?? ""
              ).localeCompare(
                String(
                  b.nombreCompleto ?? ""
                ),
                "es"
              )
          );
        });
      }

      setMessage(
        registrando
          ? "Pasajero registrado correctamente."
          : "Pasajero actualizado correctamente."
      );

      setModal(null);

      reiniciarFormulario();

      limpiarFiltros();

      await cargarDatos(false);
    } catch (error) {
      if (
        sesionActual !==
        versionSesion.current
      ) {
        return;
      }

      setError(
        obtenerMensajeError(error)
      );
    } finally {
      if (
        sesionActual ===
        versionSesion.current
      ) {
        operacionEnCurso.current = false;

        setSaving(false);
      }
    }
  }

  // ========================================
  // CONTROL DE ELIMINACIÓN
  // ========================================

  const cantidadReservacionesSeleccionado =
    obtenerCantidadReservaciones(
      selectedPassenger
    );

  const pasajeroTieneReservaciones =
    cantidadReservacionesSeleccionado !==
    null &&
    cantidadReservacionesSeleccionado > 0;

  const puedeConfirmarEliminacion =
    puedeEliminar &&
    modal === "delete" &&
    Boolean(selectedPassenger?.id) &&
    cantidadReservacionesSeleccionado === 0 &&
    !detailLoading &&
    !loading &&
    !saving &&
    !error;

  // ========================================
  // ELIMINAR PASAJERO
  // ========================================

  async function confirmarEliminacion() {
    if (
      !puedeConfirmarEliminacion ||
      operacionEnCurso.current
    ) {
      return;
    }

    const pasajeroId =
      selectedPassenger.id;

    const sesionActual =
      versionSesion.current;

    operacionEnCurso.current = true;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      await pasajerosService.eliminar(
        pasajeroId
      );

      if (
        sesionActual !==
        versionSesion.current
      ) {
        return;
      }

      versionCarga.current += 1;

      setPasajeros((anteriores) =>
        anteriores.filter(
          (pasajero) =>
            pasajero.id !== pasajeroId
        )
      );

      setMessage(
        "Pasajero eliminado correctamente."
      );

      setModal(null);

      reiniciarFormulario();

      limpiarFiltros();

      await cargarDatos(false);
    } catch (error) {
      if (
        sesionActual !==
        versionSesion.current
      ) {
        return;
      }

      setError(
        obtenerMensajeError(error)
      );
    } finally {
      if (
        sesionActual ===
        versionSesion.current
      ) {
        operacionEnCurso.current = false;

        setSaving(false);
      }
    }
  }

  // ========================================
  // CONTROL DE ACCESO
  // ========================================

  if (!puedeConsultar) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
          <ShieldAlert size={32} />
        </div>

        <h2 className="text-xl font-semibold text-[#0C2D57]">
          Acceso restringido
        </h2>

        <p className="mt-2 max-w-md text-sm text-slate-500">
          No contás con los permisos o el
          contexto operativo necesario para
          acceder a la gestión de pasajeros.
        </p>
      </div>
    );
  }

  // ========================================
  // INTERFAZ PRINCIPAL
  // ========================================

  return (
    <div className="space-y-6">

      {/* ENCABEZADO */}

      <PageHeader
        icono={Users}
        titulo="Gestión de pasajeros"
        descripcion="Administrá la información de los pasajeros registrados en el sistema."
        onActualizar={
          loading ||
            saving ||
            detailLoading ||
            modal
            ? undefined
            : () => cargarDatos()
        }
        onNuevo={
          puedeCrear &&
            datosCargados &&
            !loading &&
            !saving &&
            !detailLoading &&
            !modal
            ? openCreate
            : undefined
        }
        textoBoton="Nuevo pasajero"
      />

      {/* CONTEXTO OPERATIVO */}

      <div className="flex flex-col gap-4 rounded-2xl border border-sky-200 bg-sky-50 p-4 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-start gap-3 sm:items-center">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600">

            {accesoGlobal ? (
              <Globe size={24} />
            ) : (
              <Building2 size={24} />
            )}

          </div>

          <div>

            <h3 className="text-sm font-semibold text-[#0C2D57]">
              {accesoGlobal
                ? "Gestión global de pasajeros"
                : "Gestión operativa de pasajeros"}
            </h3>

            <p className="mt-1 text-sm text-sky-700">

              {accesoGlobal
                ? "Consultá los pasajeros y sus reservaciones en todos los aeropuertos del sistema."
                : "Consultá el directorio global de pasajeros y las reservaciones correspondientes al aeropuerto activo."}

            </p>

          </div>

        </div>

        <span className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full border border-sky-200 bg-white px-3 py-1.5 text-xs font-semibold text-sky-700">

          {accesoGlobal ? (
            <>
              <ShieldCheck size={14} />

              Acceso global
            </>
          ) : (
            <>
              <Building2 size={14} />

              {aeropuertoActivo?.codigoIata ||
                aeropuertoActivo?.nombre ||
                "Aeropuerto activo"}
            </>
          )}

        </span>

      </div>

      {/* TARJETAS DE ESTADÍSTICAS */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          titulo="Pasajeros registrados"
          valor={
            loading || !datosCargados
              ? "—"
              : estadisticas.totalPasajeros
          }
        />

        <StatCard
          titulo="Nacionalidades"
          valor={
            loading || !datosCargados
              ? "—"
              : estadisticas.totalNacionalidades
          }
        />

        <StatCard
          titulo={
            accesoGlobal
              ? "Pasajeros con reservaciones"
              : "Pasajeros con reservas locales"
          }
          valor={
            loading ||
              !datosCargados ||
              !estadisticas.conteosDisponibles
              ? "—"
              : estadisticas.pasajerosConReservaciones
          }
        />

        <StatCard
          titulo={
            accesoGlobal
              ? "Pasajeros sin reservaciones"
              : "Pasajeros sin reservas locales"
          }
          valor={
            loading ||
              !datosCargados ||
              !estadisticas.conteosDisponibles
              ? "—"
              : estadisticas.pasajerosSinReservaciones
          }
        />

      </div>

      {/* INFORMACIÓN SOBRE ESTADÍSTICAS */}

      {!accesoGlobal && (
        <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">

          <AlertCircle
            size={20}
            className="mt-0.5 shrink-0 text-sky-500"
          />

          <div>

            <h3 className="text-sm font-semibold text-[#0C2D57]">
              Alcance de las estadísticas
            </h3>

            <p className="mt-1 text-sm leading-relaxed text-slate-500">
              Los pasajeros y nacionalidades
              corresponden al directorio global.
              Las estadísticas de reservaciones
              se calculan únicamente a partir
              de los vuelos con origen en el
              aeropuerto activo.
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Un pasajero sin reservaciones
              locales puede tener reservaciones
              en otros aeropuertos.
            </p>

          </div>

        </div>
      )}

      {/* MENSAJE DE CONFIRMACIÓN */}

      {message && !modal && (
        <div
          role="status"
          className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4"
        >

          <div className="flex items-center gap-3">

            <CheckCircle2
              size={21}
              className="shrink-0 text-emerald-600"
            />

            <p className="text-sm font-medium text-emerald-700">
              {message}
            </p>

          </div>

          <button
            type="button"
            onClick={() => setMessage("")}
            aria-label="Cerrar mensaje de confirmación"
            className="rounded-lg p-1.5 text-emerald-600 transition hover:bg-emerald-100"
          >
            <X size={18} />
          </button>

        </div>
      )}

      {/* MENSAJE DE ERROR */}

      {error && !modal && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
        >

          <div className="flex items-center gap-3">

            <AlertCircle
              size={21}
              className="shrink-0 text-red-600"
            />

            <p className="text-sm font-medium text-red-700">
              {error}
            </p>

          </div>

          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Cerrar mensaje de error"
            className="rounded-lg p-1.5 text-red-600 transition hover:bg-red-100"
          >
            <X size={18} />
          </button>

        </div>
      )}

      {/* ERROR DE CARGA */}

      {errorCarga && !modal && (
        <div
          role="alert"
          className="flex flex-col gap-4 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between"
        >

          <div className="flex items-start gap-3">

            <AlertCircle
              size={21}
              className="mt-0.5 shrink-0 text-red-600"
            />

            <div>

              <h3 className="text-sm font-semibold text-red-800">
                No fue posible actualizar los pasajeros
              </h3>

              <p className="mt-1 text-sm text-red-700">
                {errorCarga}
              </p>

              <p className="mt-1 text-xs text-red-600">
                Los datos podrían estar desactualizados.
                Intentá cargar la información nuevamente.
              </p>

            </div>

          </div>

          <button
            type="button"
            disabled={loading || saving}
            onClick={() => cargarDatos()}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
          >

            <RotateCcw size={16} />

            Reintentar

          </button>

        </div>
      )}

      {/* =====================================
    DIRECTORIO DE PASAJEROS
===================================== */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        {/* ENCABEZADO DEL DIRECTORIO */}

        <div className="border-b border-slate-200 px-6 py-5">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="text-lg font-semibold text-[#0C2D57]">
                Directorio de pasajeros
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Consultá y administrá los pasajeros
                registrados en Global Airport.
              </p>
            </div>

            <span className="w-fit rounded-full bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700">
              {datosCargados
                ? `${pasajeros.length} pasajeros registrados`
                : "Información no disponible"}
            </span>

          </div>

        </div>

        {/* FILTROS */}

        <div className="space-y-4 border-b border-slate-200 p-6">

          {/* BARRA DE BÚSQUEDA */}

          <div className="relative">

            <Search
              size={20}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              disabled={
                loading ||
                saving ||
                !datosCargados
              }
              placeholder="Buscar por nombre, documento, correo o nacionalidad..."
              aria-label="Buscar pasajeros"
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-50"
            />

          </div>

          {/* FILTROS SECUNDARIOS */}

          <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2 xl:grid-cols-4">

            {/* TIPO DE DOCUMENTO */}

            <div className="space-y-2">

              <label
                htmlFor="passenger-document-filter"
                className="text-sm font-medium text-slate-700"
              >
                Tipo de documento
              </label>

              <select
                id="passenger-document-filter"
                value={documentFilter}
                onChange={(event) =>
                  setDocumentFilter(event.target.value)
                }
                disabled={
                  loading ||
                  saving ||
                  !datosCargados
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:bg-slate-50"
              >

                <option value="">
                  Todos los documentos
                </option>

                {tiposDocumento.map((tipo) => (
                  <option
                    key={tipo.value}
                    value={tipo.value}
                  >
                    {tipo.label}
                  </option>
                ))}

              </select>

            </div>

            {/* NACIONALIDAD */}

            <div className="space-y-2">

              <label
                htmlFor="passenger-nationality-filter"
                className="text-sm font-medium text-slate-700"
              >
                Nacionalidad
              </label>

              <select
                id="passenger-nationality-filter"
                value={nationalityFilter}
                onChange={(event) =>
                  setNationalityFilter(event.target.value)
                }
                disabled={
                  loading ||
                  saving ||
                  !datosCargados
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:bg-slate-50"
              >

                <option value="">
                  Todas las nacionalidades
                </option>

                {nacionalidades.map((nacionalidad) => (
                  <option
                    key={nacionalidad}
                    value={nacionalidad}
                  >
                    {nacionalidad}
                  </option>
                ))}

              </select>

            </div>

            {/* RESERVACIONES */}

            <div className="space-y-2">

              <label
                htmlFor="passenger-reservation-filter"
                className="text-sm font-medium text-slate-700"
              >
                {accesoGlobal
                  ? "Reservaciones"
                  : "Reservaciones locales"}
              </label>

              <select
                id="passenger-reservation-filter"
                value={reservationFilter}
                onChange={(event) =>
                  setReservationFilter(event.target.value)
                }
                disabled={
                  loading ||
                  saving ||
                  !datosCargados ||
                  !estadisticas.conteosDisponibles
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:bg-slate-50"
              >

                <option value="">
                  Todas
                </option>

                <option value="CON">
                  {accesoGlobal
                    ? "Con reservaciones"
                    : "Con reservaciones locales"}
                </option>

                <option value="SIN">
                  {accesoGlobal
                    ? "Sin reservaciones"
                    : "Sin reservaciones locales"}
                </option>

              </select>

            </div>

            {/* LIMPIAR FILTROS */}

            <button
              type="button"
              onClick={limpiarFiltros}
              disabled={
                !filtrosActivos ||
                loading ||
                saving
              }
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
            >

              <RotateCcw size={17} />

              Limpiar filtros

            </button>

          </div>

          {/* RESULTADOS */}

          {datosCargados && !loading && (
            <div className="flex flex-wrap items-center justify-between gap-2">

              <p className="text-sm text-slate-500">

                Mostrando{" "}

                <span className="font-semibold text-[#0C2D57]">
                  {pasajerosFiltrados.length}
                </span>

                {" "}de{" "}

                <span className="font-semibold text-[#0C2D57]">
                  {pasajeros.length}
                </span>

                {" "}pasajeros

              </p>

              {filtrosActivos && (
                <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-600">
                  Filtros activos
                </span>
              )}

            </div>
          )}

        </div>

        {/* ESTADO DE CARGA */}

        {loading ? (

          <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 p-8">

            <LoaderCircle
              size={32}
              className="animate-spin text-sky-500"
            />

            <p className="text-sm font-medium text-slate-500">
              Cargando pasajeros...
            </p>

          </div>

        ) : !datosCargados ? (

          /* ERROR DE CARGA */

          <div className="flex min-h-[300px] flex-col items-center justify-center p-8 text-center">

            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-400">

              <AlertCircle size={30} />

            </div>

            <h3 className="font-semibold text-[#0C2D57]">
              Información no disponible
            </h3>

            <p className="mt-2 max-w-sm text-sm text-slate-500">
              No fue posible consultar el directorio.
              Intentá actualizar la información.
            </p>

            <button
              type="button"
              onClick={() => cargarDatos()}
              disabled={saving}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700 disabled:opacity-50"
            >

              <RotateCcw size={16} />

              Reintentar

            </button>

          </div>

        ) : pasajerosFiltrados.length === 0 ? (

          /* SIN RESULTADOS */

          <div className="flex min-h-[300px] flex-col items-center justify-center p-8 text-center">

            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sky-50 text-sky-500">

              {filtrosActivos ? (
                <Search size={30} />
              ) : (
                <Users size={30} />
              )}

            </div>

            <h3 className="font-semibold text-[#0C2D57]">

              {filtrosActivos
                ? "No se encontraron pasajeros"
                : "No hay pasajeros registrados"}

            </h3>

            <p className="mt-2 max-w-sm text-sm text-slate-500">

              {filtrosActivos
                ? "Probá con otros criterios de búsqueda o limpiá los filtros."
                : "Registrá un nuevo pasajero para comenzar a gestionar sus reservaciones."}

            </p>

            {filtrosActivos ? (

              <button
                type="button"
                onClick={limpiarFiltros}
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-sky-200 px-4 py-2 text-sm font-medium text-sky-600 transition hover:bg-sky-50"
              >

                <RotateCcw size={16} />

                Limpiar filtros

              </button>

            ) : puedeCrear && !saving ? (

              <button
                type="button"
                onClick={openCreate}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700"
              >

                <UserRoundPlus size={17} />

                Registrar pasajero

              </button>

            ) : null}

          </div>

        ) : (

          /* TABLA DE PASAJEROS */

          <div className="max-h-[600px] overflow-auto">

            <table className="w-full min-w-[1050px] border-collapse text-left">

              <thead className="sticky top-0 z-10 bg-slate-50 shadow-sm">

                <tr className="border-b border-slate-200">

                  <th
                    scope="col"
                    className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    Pasajero
                  </th>

                  <th
                    scope="col"
                    className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    Documento
                  </th>

                  <th
                    scope="col"
                    className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    Nacionalidad
                  </th>

                  <th
                    scope="col"
                    className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    Teléfono
                  </th>

                  <th
                    scope="col"
                    className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >

                    {accesoGlobal
                      ? "Reservaciones"
                      : "Reservas locales"}

                  </th>

                  <th
                    scope="col"
                    className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    Acciones
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                {pasajerosFiltrados.map((pasajero) => {

                  const cantidadReservaciones =
                    obtenerCantidadReservaciones(
                      pasajero
                    );

                  const accionesDeshabilitadas =
                    loading ||
                    saving ||
                    detailLoading ||
                    Boolean(modal);

                  return (

                    <tr
                      key={pasajero.id}
                      className="transition hover:bg-sky-50/40"
                    >

                      {/* PASAJERO */}

                      <td className="px-6 py-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-semibold text-sky-700">

                            {obtenerIniciales(
                              pasajero.nombreCompleto
                            ) || <UserRound size={20} />}

                          </div>

                          <div>

                            <p className="whitespace-nowrap text-sm font-semibold text-[#0C2D57]">
                              {pasajero.nombreCompleto}
                            </p>

                            <p className="mt-1 max-w-[240px] truncate text-xs text-slate-500">
                              {pasajero.correo ||
                                "Sin correo registrado"}
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* DOCUMENTO */}

                      <td className="px-6 py-4">

                        <p className="whitespace-nowrap text-sm font-medium text-slate-700">
                          {ocultarDocumento(pasajero.numeroDocumento)}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">

                          {obtenerTipoDocumento(
                            pasajero.tipoDocumento
                          )}

                        </p>

                      </td>

                      {/* NACIONALIDAD */}

                      <td className="px-6 py-4">

                        <div className="flex items-center gap-2">

                          <Globe
                            size={16}
                            className="shrink-0 text-slate-400"
                          />

                          <span className="whitespace-nowrap text-sm text-slate-600">

                            {pasajero.nacionalidad ||
                              "No registrada"}

                          </span>

                        </div>

                      </td>

                      {/* TELÉFONO */}

                      <td className="px-6 py-4">

                        <span className="whitespace-nowrap text-sm text-slate-600">

                          {pasajero.telefono ||
                            "No registrado"}

                        </span>

                      </td>

                      {/* RESERVACIONES */}

                      <td className="px-6 py-4 text-center">

                        <span
                          className={`inline-flex min-w-12 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${cantidadReservaciones === null
                            ? "bg-amber-50 text-amber-600"
                            : cantidadReservaciones > 0
                              ? "bg-sky-100 text-sky-700"
                              : "bg-slate-100 text-slate-500"
                            }`}
                        >

                          <Ticket size={14} />

                          {cantidadReservaciones ?? "—"}

                        </span>

                      </td>

                      {/* ACCIONES */}

                      <td className="px-6 py-4">

                        <div className="flex items-center justify-center gap-2">

                          {puedeConsultarHistorial && (

                            <button
                              type="button"
                              onClick={() =>
                                openDetails(pasajero)
                              }
                              disabled={accionesDeshabilitadas}
                              title="Consultar detalles"
                              aria-label={`Consultar detalles de ${pasajero.nombreCompleto}`}
                              className="rounded-lg border border-sky-100 bg-sky-50 p-2 text-sky-600 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >

                              <Eye size={17} />

                            </button>

                          )}

                          {puedeEditar && (

                            <button
                              type="button"
                              onClick={() =>
                                openEdit(pasajero)
                              }
                              disabled={accionesDeshabilitadas}
                              title="Editar pasajero"
                              aria-label={`Editar a ${pasajero.nombreCompleto}`}
                              className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-600 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >

                              <Pencil size={17} />

                            </button>

                          )}

                          {puedeEliminar && (

                            <button
                              type="button"
                              onClick={() =>
                                openDelete(pasajero)
                              }
                              disabled={
                                accionesDeshabilitadas ||
                                cantidadReservaciones !== 0
                              }
                              title={
                                cantidadReservaciones === null
                                  ? "Conteo de reservaciones no disponible"
                                  : cantidadReservaciones > 0
                                    ? "El pasajero tiene reservaciones asociadas"
                                    : "Eliminar pasajero"
                              }
                              aria-label={`Eliminar a ${pasajero.nombreCompleto}`}
                              className="rounded-lg border border-red-100 bg-red-50 p-2 text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-300"
                            >

                              <Trash2 size={17} />

                            </button>

                          )}

                        </div>

                      </td>

                    </tr>

                  );

                })}

              </tbody>

            </table>

          </div>

        )}

        {/* PIE DEL DIRECTORIO */}

        <div className="flex flex-col gap-2 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">

          <p className="text-xs text-slate-500">

            {datosCargados
              ? `${pasajerosFiltrados.length} pasajeros encontrados`
              : "Directorio de pasajeros"}

          </p>

          <div className="flex items-center gap-2 text-xs text-slate-500">

            {accesoGlobal ? (
              <Globe size={14} />
            ) : (
              <Building2 size={14} />
            )}

            {accesoGlobal
              ? "Directorio global de pasajeros"
              : `Reservaciones de ${aeropuertoActivo?.codigoIata ||
              "aeropuerto activo"
              }`}

          </div>

        </div>

      </section>

      {/* =====================================
    MODAL DE REGISTRO Y EDICIÓN
===================================== */}

      {(modal === "create" || modal === "edit") && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
          onKeyDown={(event) => {
            if (
              event.key === "Escape" &&
              !saving
            ) {
              cerrarModal();
            }
          }}
        >

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="passenger-form-title"
            className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          >

            {/* ENCABEZADO */}

            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600">

                  {modal === "create" ? (
                    <UserRoundPlus size={25} />
                  ) : (
                    <Pencil size={23} />
                  )}

                </div>

                <div>

                  <h2
                    id="passenger-form-title"
                    className="text-xl font-semibold text-[#0C2D57]"
                  >

                    {modal === "create"
                      ? "Registrar pasajero"
                      : "Editar pasajero"}

                  </h2>

                  <p className="mt-1 text-sm text-slate-500">

                    {modal === "create"
                      ? "Ingresá la información personal y de contacto."
                      : "Actualizá la información del pasajero seleccionado."}

                  </p>

                </div>

              </div>

              <button
                type="button"
                autoFocus={modal === "edit"}
                disabled={saving}
                onClick={cerrarModal}
                aria-label="Cerrar formulario"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
              >

                <X size={22} />

              </button>

            </div>

            {/* FORMULARIO */}

            <form
              onSubmit={savePassenger}
              noValidate
              className="flex min-h-0 flex-1 flex-col"
            >

              {/* CONTENIDO DESPLAZABLE */}

              <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-5">

                {detailLoading ? (

                  <div className="flex min-h-[280px] flex-col items-center justify-center gap-3">

                    <LoaderCircle
                      size={32}
                      className="animate-spin text-sky-500"
                    />

                    <p className="text-sm text-slate-500">
                      Cargando información del pasajero...
                    </p>

                  </div>

                ) : modal === "edit" &&
                  !selectedPassenger ? (

                  <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 text-center">

                    <AlertCircle
                      size={36}
                      className="text-red-400"
                    />

                    <h3 className="font-semibold text-[#0C2D57]">
                      Información no disponible
                    </h3>

                    <p className="text-sm text-slate-500">
                      Cerrá el formulario e intentá
                      consultar nuevamente el pasajero.
                    </p>

                  </div>

                ) : (

                  <>

                    {/* INFORMACIÓN DEL PASAJERO ACTUAL */}

                    {modal === "edit" &&
                      selectedPassenger && (

                        <div className="flex items-center gap-4 rounded-xl border border-sky-100 bg-sky-50 p-4">

                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sky-100 font-semibold text-sky-700">

                            {obtenerIniciales(
                              selectedPassenger.nombreCompleto
                            )}

                          </div>

                          <div className="min-w-0 flex-1">

                            <p className="text-sm font-semibold text-[#0C2D57]">

                              {selectedPassenger.nombreCompleto}

                            </p>

                            <p className="mt-1 text-xs text-slate-500">

                              {obtenerTipoDocumento(
                                selectedPassenger.tipoDocumento
                              )}

                              {" · "}

                              {selectedPassenger.numeroDocumento}

                            </p>

                          </div>

                          <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-medium text-sky-700">

                            ID #{selectedPassenger.id}

                          </span>

                        </div>

                      )}

                    <fieldset
                      disabled={saving}
                      className="min-w-0 space-y-6"
                    >

                      {/* INFORMACIÓN PERSONAL */}

                      <section className="space-y-4">

                        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">

                          <UserRound
                            size={19}
                            className="text-sky-600"
                          />

                          <h3 className="font-semibold text-[#0C2D57]">
                            Información personal
                          </h3>

                        </div>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                          {/* NOMBRE COMPLETO */}

                          <div className="space-y-2 sm:col-span-2">

                            <label
                              htmlFor="passenger-name"
                              className="text-sm font-medium text-slate-700"
                            >

                              Nombre completo{" "}

                              <span className="text-red-500">
                                *
                              </span>

                            </label>

                            <input
                              id="passenger-name"
                              type="text"
                              autoFocus={modal === "create"}
                              autoComplete="off"
                              required
                              maxLength={191}
                              value={form.nombreCompleto}
                              onChange={(event) =>
                                updateForm(
                                  "nombreCompleto",
                                  event.target.value
                                )
                              }
                              onBlur={() =>
                                marcarCampoVisitado(
                                  "nombreCompleto"
                                )
                              }
                              placeholder="Ej. María Fernández Rodríguez"
                              aria-invalid={Boolean(
                                obtenerErrorCampo(
                                  "nombreCompleto"
                                )
                              )}
                              className={obtenerClaseCampo(
                                "nombreCompleto"
                              )}
                            />

                            {obtenerErrorCampo(
                              "nombreCompleto"
                            ) && (

                                <p className="text-xs text-red-600">

                                  {obtenerErrorCampo(
                                    "nombreCompleto"
                                  )}

                                </p>

                              )}

                          </div>

                          {/* TIPO DE DOCUMENTO */}

                          <div className="space-y-2">

                            <label
                              htmlFor="passenger-document-type"
                              className="text-sm font-medium text-slate-700"
                            >

                              Tipo de documento{" "}

                              <span className="text-red-500">
                                *
                              </span>

                            </label>

                            <select
                              id="passenger-document-type"
                              required
                              value={form.tipoDocumento}
                              onChange={(event) =>
                                updateForm(
                                  "tipoDocumento",
                                  event.target.value
                                )
                              }
                              onBlur={() =>
                                marcarCampoVisitado(
                                  "tipoDocumento"
                                )
                              }
                              className={obtenerClaseCampo(
                                "tipoDocumento"
                              )}
                            >

                              {tiposDocumento.map((tipo) => (

                                <option
                                  key={tipo.value}
                                  value={tipo.value}
                                >

                                  {tipo.label}

                                </option>

                              ))}

                            </select>

                            {obtenerErrorCampo(
                              "tipoDocumento"
                            ) && (

                                <p className="text-xs text-red-600">

                                  {obtenerErrorCampo(
                                    "tipoDocumento"
                                  )}

                                </p>

                              )}

                          </div>

                          {/* NÚMERO DE DOCUMENTO */}

                          <div className="space-y-2">

                            <label
                              htmlFor="passenger-document-number"
                              className="text-sm font-medium text-slate-700"
                            >

                              Número de documento{" "}

                              <span className="text-red-500">
                                *
                              </span>

                            </label>

                            <input
                              id="passenger-document-number"
                              type="text"
                              required
                              autoComplete="off"
                              maxLength={191}
                              value={form.numeroDocumento}
                              onChange={(event) =>
                                updateForm(
                                  "numeroDocumento",
                                  event.target.value
                                )
                              }
                              onBlur={() =>
                                marcarCampoVisitado(
                                  "numeroDocumento"
                                )
                              }
                              placeholder="Ej. 1-1234-5678"
                              aria-invalid={
                                documentoDuplicado ||
                                Boolean(
                                  obtenerErrorCampo(
                                    "numeroDocumento"
                                  )
                                )
                              }
                              className={
                                documentoDuplicado
                                  ? "w-full rounded-xl border border-red-300 px-3.5 py-2.5 text-sm text-slate-700 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                  : obtenerClaseCampo(
                                    "numeroDocumento"
                                  )
                              }
                            />

                            {documentoDuplicado ? (

                              <p className="flex items-center gap-1.5 text-xs text-red-600">

                                <AlertCircle size={14} />

                                Ya existe un pasajero con
                                ese documento.

                              </p>

                            ) : obtenerErrorCampo(
                              "numeroDocumento"
                            ) ? (

                              <p className="text-xs text-red-600">

                                {obtenerErrorCampo(
                                  "numeroDocumento"
                                )}

                              </p>

                            ) : (

                              <p className="text-xs text-slate-400">
                                El documento debe ser único.
                              </p>

                            )}

                          </div>

                          {/* NACIONALIDAD */}

                          <div className="space-y-2">

                            <label
                              htmlFor="passenger-nationality"
                              className="text-sm font-medium text-slate-700"
                            >

                              Nacionalidad{" "}

                              <span className="text-red-500">
                                *
                              </span>

                            </label>

                            <input
                              id="passenger-nationality"
                              type="text"
                              list="passenger-nationalities"
                              required
                              maxLength={191}
                              value={form.nacionalidad}
                              onChange={(event) =>
                                updateForm(
                                  "nacionalidad",
                                  event.target.value
                                )
                              }
                              onBlur={() =>
                                marcarCampoVisitado(
                                  "nacionalidad"
                                )
                              }
                              placeholder="Ej. Costarricense"
                              className={obtenerClaseCampo(
                                "nacionalidad"
                              )}
                            />

                            <datalist id="passenger-nationalities">

                              {nacionalidades.map(
                                (nacionalidad) => (

                                  <option
                                    key={nacionalidad}
                                    value={nacionalidad}
                                  />

                                )
                              )}

                            </datalist>

                            {obtenerErrorCampo(
                              "nacionalidad"
                            ) && (

                                <p className="text-xs text-red-600">

                                  {obtenerErrorCampo(
                                    "nacionalidad"
                                  )}

                                </p>

                              )}

                          </div>

                          {/* FECHA DE NACIMIENTO */}

                          <div className="space-y-2">

                            <label
                              htmlFor="passenger-birth-date"
                              className="text-sm font-medium text-slate-700"
                            >

                              Fecha de nacimiento{" "}

                              <span className="text-red-500">
                                *
                              </span>

                            </label>

                            <input
                              id="passenger-birth-date"
                              type="date"
                              required
                              min="1000-01-01"
                              max={obtenerFechaActual()}
                              value={form.fechaNacimiento}
                              onChange={(event) =>
                                updateForm(
                                  "fechaNacimiento",
                                  event.target.value
                                )
                              }
                              onBlur={() =>
                                marcarCampoVisitado(
                                  "fechaNacimiento"
                                )
                              }
                              className={obtenerClaseCampo(
                                "fechaNacimiento"
                              )}
                            />

                            {obtenerErrorCampo(
                              "fechaNacimiento"
                            ) && (

                                <p className="text-xs text-red-600">

                                  {obtenerErrorCampo(
                                    "fechaNacimiento"
                                  )}

                                </p>

                              )}

                          </div>

                        </div>

                      </section>

                      {/* INFORMACIÓN DE CONTACTO */}

                      <section className="space-y-4">

                        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">

                          <Mail
                            size={19}
                            className="text-sky-600"
                          />

                          <h3 className="font-semibold text-[#0C2D57]">
                            Información de contacto
                          </h3>

                        </div>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                          {/* CORREO */}

                          <div className="space-y-2">

                            <label
                              htmlFor="passenger-email"
                              className="text-sm font-medium text-slate-700"
                            >

                              Correo electrónico{" "}

                              <span className="text-red-500">
                                *
                              </span>

                            </label>

                            <input
                              id="passenger-email"
                              type="email"
                              required
                              autoComplete="off"
                              maxLength={191}
                              value={form.correo}
                              onChange={(event) =>
                                updateForm(
                                  "correo",
                                  event.target.value
                                )
                              }
                              onBlur={() =>
                                marcarCampoVisitado(
                                  "correo"
                                )
                              }
                              placeholder="correo@ejemplo.com"
                              className={obtenerClaseCampo(
                                "correo"
                              )}
                            />

                            {obtenerErrorCampo(
                              "correo"
                            ) && (

                                <p className="text-xs text-red-600">

                                  {obtenerErrorCampo(
                                    "correo"
                                  )}

                                </p>

                              )}

                          </div>

                          {/* TELÉFONO */}

                          <div className="space-y-2">

                            <label
                              htmlFor="passenger-phone"
                              className="text-sm font-medium text-slate-700"
                            >

                              Teléfono{" "}

                              <span className="font-normal text-slate-400">
                                (Opcional)
                              </span>

                            </label>

                            <input
                              id="passenger-phone"
                              type="tel"
                              autoComplete="off"
                              maxLength={30}
                              value={form.telefono}
                              onChange={(event) =>
                                updateForm(
                                  "telefono",
                                  event.target.value
                                )
                              }
                              onBlur={() =>
                                marcarCampoVisitado(
                                  "telefono"
                                )
                              }
                              placeholder="Ej. +506 8888 0000"
                              className={obtenerClaseCampo(
                                "telefono"
                              )}
                            />

                            {obtenerErrorCampo(
                              "telefono"
                            ) && (

                                <p className="text-xs text-red-600">

                                  {obtenerErrorCampo(
                                    "telefono"
                                  )}

                                </p>

                              )}

                          </div>

                          {/* DIRECCIÓN */}

                          <div className="space-y-2 sm:col-span-2">

                            <label
                              htmlFor="passenger-address"
                              className="text-sm font-medium text-slate-700"
                            >

                              Dirección{" "}

                              <span className="font-normal text-slate-400">
                                (Opcional)
                              </span>

                            </label>

                            <textarea
                              id="passenger-address"
                              rows={3}
                              maxLength={191}
                              value={form.direccion}
                              onChange={(event) =>
                                updateForm(
                                  "direccion",
                                  event.target.value
                                )
                              }
                              onBlur={() =>
                                marcarCampoVisitado(
                                  "direccion"
                                )
                              }
                              placeholder="Ingresá la dirección del pasajero..."
                              className={`${obtenerClaseCampo(
                                "direccion"
                              )} resize-none`}
                            />

                            <div className="flex justify-between gap-2">

                              <p className="text-xs text-red-600">

                                {obtenerErrorCampo(
                                  "direccion"
                                )}

                              </p>

                              <span className="text-xs text-slate-400">

                                {form.direccion.length}/191

                              </span>

                            </div>

                          </div>

                        </div>

                      </section>

                    </fieldset>

                    {/* INFORMACIÓN ADICIONAL */}

                    <div className="flex items-start gap-3 rounded-xl border border-sky-100 bg-sky-50 p-4">

                      <AlertCircle
                        size={19}
                        className="mt-0.5 shrink-0 text-sky-600"
                      />

                      <div>

                        <p className="text-sm font-semibold text-[#0C2D57]">

                          {modal === "create"
                            ? "Registro global de pasajeros"
                            : "Actualización de información global"}

                        </p>

                        <p className="mt-1 text-xs leading-relaxed text-sky-700">

                          {modal === "create"
                            ? "El pasajero podrá ser utilizado para registrar reservaciones en cualquier aeropuerto autorizado. No se creará una cuenta de acceso al sistema."
                            : "Los cambios en la información personal estarán disponibles para los demás aeropuertos. Las reservaciones existentes no serán eliminadas."}

                        </p>

                      </div>

                    </div>

                    {/* SIN CAMBIOS */}

                    {modal === "edit" &&
                      selectedPassenger &&
                      !hayCambios && (

                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">

                          <p className="text-sm text-slate-500">
                            Todavía no se han realizado cambios
                            en la información del pasajero.
                          </p>

                        </div>

                      )}

                  </>

                )}

                {/* ERROR DEL FORMULARIO */}

                {error && (

                  <div
                    role="alert"
                    className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
                  >

                    <AlertCircle
                      size={20}
                      className="mt-0.5 shrink-0 text-red-600"
                    />

                    <p className="flex-1 text-sm text-red-700">

                      {error}

                    </p>

                    <button
                      type="button"
                      onClick={() => setError("")}
                      aria-label="Cerrar mensaje de error"
                      className="text-red-500 hover:text-red-700"
                    >

                      <X size={17} />

                    </button>

                  </div>

                )}

              </div>

              {/* PIE DEL MODAL */}

              <div className="flex shrink-0 flex-col gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">

                <p className="text-xs text-slate-500">

                  <span className="font-semibold text-red-500">
                    *
                  </span>

                  {" "}Campos obligatorios

                </p>

                <div className="flex flex-wrap justify-end gap-3">

                  <button
                    type="button"
                    onClick={cerrarModal}
                    disabled={saving}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >

                    Cancelar

                  </button>

                  <button
                    type="submit"
                    disabled={!puedeGuardar}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >

                    {saving ? (

                      <>

                        <LoaderCircle
                          size={17}
                          className="animate-spin"
                        />

                        Guardando...

                      </>

                    ) : (

                      <>

                        <Save size={17} />

                        {modal === "create"
                          ? "Registrar pasajero"
                          : "Guardar cambios"}

                      </>

                    )}

                  </button>

                </div>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =====================================
    MODAL DE DETALLES E HISTORIAL
===================================== */}

      {modal === "details" && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              cerrarModal();
            }
          }}
        >

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="passenger-details-title"
            className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          >

            {/* ENCABEZADO */}

            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600">

                  <Eye size={25} />

                </div>

                <div>

                  <h2
                    id="passenger-details-title"
                    className="text-xl font-semibold text-[#0C2D57]"
                  >
                    Detalles del pasajero
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Información personal e historial de reservaciones.
                  </p>

                </div>

              </div>

              <button
                type="button"
                autoFocus
                onClick={cerrarModal}
                aria-label="Cerrar detalles"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >

                <X size={22} />

              </button>

            </div>

            {/* CONTENIDO DESPLAZABLE */}

            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-5">

              {detailLoading ? (

                <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">

                  <LoaderCircle
                    size={34}
                    className="animate-spin text-sky-500"
                  />

                  <p className="text-sm text-slate-500">
                    Consultando información del pasajero...
                  </p>

                </div>

              ) : !selectedPassenger ? (

                <div className="flex min-h-[250px] flex-col items-center justify-center gap-3 text-center">

                  <AlertCircle
                    size={38}
                    className="text-red-400"
                  />

                  <h3 className="font-semibold text-[#0C2D57]">
                    Información no disponible
                  </h3>

                  <p className="max-w-sm text-sm text-slate-500">
                    No fue posible consultar los datos del pasajero.
                    Cerrá esta ventana e intentá nuevamente.
                  </p>

                </div>

              ) : (

                <>

                  {/* PERFIL DEL PASAJERO */}

                  <div className="flex flex-col gap-5 rounded-2xl border border-sky-100 bg-sky-50 p-5 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex items-center gap-4">

                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-white bg-sky-100 text-2xl font-bold text-sky-700 shadow-sm">

                        {obtenerIniciales(
                          selectedPassenger.nombreCompleto
                        )}

                      </div>

                      <div>

                        <h3 className="text-xl font-semibold text-[#0C2D57]">

                          {selectedPassenger.nombreCompleto}

                        </h3>

                        <p className="mt-1 text-sm text-slate-500">

                          {selectedPassenger.nacionalidad}

                          {" · "}

                          {calcularEdad(
                            selectedPassenger.fechaNacimiento
                          )}

                        </p>

                        <span className="mt-2 inline-flex rounded-full bg-white px-3 py-1 text-xs font-medium text-sky-700">

                          Pasajero #{selectedPassenger.id}

                        </span>

                      </div>

                    </div>

                    <div className="rounded-xl border border-sky-100 bg-white px-5 py-4 text-center">

                      <Ticket
                        size={23}
                        className="mx-auto mb-2 text-sky-600"
                      />

                      <p className="text-2xl font-bold text-[#0C2D57]">

                        {reservacionesPasajero.length}

                      </p>

                      <p className="mt-1 text-xs text-slate-500">

                        {accesoGlobal
                          ? "Reservaciones registradas"
                          : "Reservaciones locales"}

                      </p>

                    </div>

                  </div>

                  {/* INFORMACIÓN PERSONAL */}

                  <section className="space-y-4">

                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">

                      <UserRound
                        size={20}
                        className="text-sky-600"
                      />

                      <h3 className="font-semibold text-[#0C2D57]">
                        Información personal
                      </h3>

                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                      <DetallePasajero
                        icono={CreditCard}
                        titulo="Tipo de documento"
                        valor={obtenerTipoDocumento(
                          selectedPassenger.tipoDocumento
                        )}
                      />

                      <DetallePasajero
                        icono={CreditCard}
                        titulo="Número de documento"
                        valor={selectedPassenger.numeroDocumento}
                      />

                      <DetallePasajero
                        icono={Globe}
                        titulo="Nacionalidad"
                        valor={selectedPassenger.nacionalidad}
                      />

                      <DetallePasajero
                        icono={CalendarDays}
                        titulo="Fecha de nacimiento"
                        valor={formatearFecha(
                          selectedPassenger.fechaNacimiento
                        )}
                      />

                    </div>

                  </section>

                  {/* INFORMACIÓN DE CONTACTO */}

                  <section className="space-y-4">

                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">

                      <Mail
                        size={20}
                        className="text-sky-600"
                      />

                      <h3 className="font-semibold text-[#0C2D57]">
                        Información de contacto
                      </h3>

                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                      <DetallePasajero
                        icono={Mail}
                        titulo="Correo electrónico"
                        valor={
                          selectedPassenger.correo ||
                          "No registrado"
                        }
                      />

                      <DetallePasajero
                        icono={Phone}
                        titulo="Teléfono"
                        valor={
                          selectedPassenger.telefono ||
                          "No registrado"
                        }
                      />

                      <div className="sm:col-span-2">

                        <DetallePasajero
                          icono={MapPin}
                          titulo="Dirección"
                          valor={
                            selectedPassenger.direccion ||
                            "No registrada"
                          }
                        />

                      </div>

                    </div>

                  </section>

                  {/* HISTORIAL DE RESERVACIONES */}

                  <section className="space-y-4">

                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">

                      <div className="flex items-center gap-2">

                        <History
                          size={20}
                          className="text-sky-600"
                        />

                        <h3 className="font-semibold text-[#0C2D57]">
                          Historial de reservaciones
                        </h3>

                      </div>

                      <span className="rounded-full bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-700">

                        {reservacionesPasajero.length} reservaciones

                      </span>

                    </div>

                    {/* ALCANCE DEL HISTORIAL */}

                    <div className="flex items-start gap-3 rounded-xl border border-sky-100 bg-sky-50 p-4">

                      <AlertCircle
                        size={19}
                        className="mt-0.5 shrink-0 text-sky-600"
                      />

                      <p className="text-sm leading-relaxed text-sky-700">

                        {accesoGlobal
                          ? "Este historial incluye las reservaciones del pasajero en todos los aeropuertos del sistema."
                          : `Este historial incluye únicamente las reservaciones de vuelos con origen en ${aeropuertoActivo?.nombre ||
                          "el aeropuerto activo"
                          }.`}

                      </p>

                    </div>

                    {/* ESTADÍSTICAS DEL HISTORIAL */}

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

                      {[
                        {
                          estado: "CONFIRMADA",
                          titulo: "Confirmadas",
                          estilo: "border-sky-100 bg-sky-50 text-sky-700",
                        },
                        {
                          estado: "CHECK_IN",
                          titulo: "Check-in realizado",
                          estilo: "border-emerald-100 bg-emerald-50 text-emerald-700",
                        },
                        {
                          estado: "CANCELADA",
                          titulo: "Canceladas",
                          estilo: "border-red-100 bg-red-50 text-red-700",
                        },
                      ].map((item) => (

                        <div
                          key={item.estado}
                          className={`rounded-xl border p-4 ${item.estilo}`}
                        >

                          <p className="text-xs font-medium">
                            {item.titulo}
                          </p>

                          <p className="mt-2 text-2xl font-bold">

                            {
                              reservacionesPasajero.filter(
                                (reservacion) =>
                                  reservacion.estado === item.estado
                              ).length
                            }

                          </p>

                        </div>

                      ))}

                    </div>

                    {/* LISTADO DE RESERVACIONES */}

                    {reservacionesPasajero.length === 0 ? (

                      <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 p-6 text-center">

                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-sky-50 text-sky-500">

                          <Ticket size={28} />

                        </div>

                        <h4 className="font-semibold text-[#0C2D57]">

                          {accesoGlobal
                            ? "Sin reservaciones registradas"
                            : "Sin reservaciones en este aeropuerto"}

                        </h4>

                        <p className="mt-2 max-w-md text-sm text-slate-500">

                          {accesoGlobal
                            ? "El pasajero todavía no tiene reservaciones asociadas."
                            : "No existen reservaciones del pasajero dentro del alcance operativo actual."}

                        </p>

                      </div>

                    ) : (

                      <div className="space-y-4">

                        {reservacionesPasajero.map(
                          (reservacion) => {

                            const vuelo = reservacion.vuelo;

                            const origen =
                              vuelo?.aeropuertoOrigen;

                            const destino =
                              vuelo?.aeropuertoDestino;

                            return (

                              <article
                                key={reservacion.id}
                                className="overflow-hidden rounded-xl border border-slate-200 bg-white"
                              >

                                {/* ENCABEZADO DE RESERVACIÓN */}

                                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-5 py-4">

                                  <div className="flex items-center gap-3">

                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 text-sky-600">

                                      <Ticket size={21} />

                                    </div>

                                    <div>

                                      <p className="text-sm font-semibold text-[#0C2D57]">

                                        {reservacion.codigo}

                                      </p>

                                      <p className="mt-1 text-xs text-slate-500">

                                        Registrada:{" "}

                                        {formatearFechaHora(
                                          reservacion.fechaReservacion
                                        )}

                                      </p>

                                    </div>

                                  </div>

                                  <span
                                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${obtenerClaseEstadoReservacion(
                                      reservacion.estado
                                    )}`}
                                  >

                                    {obtenerEstadoReservacion(
                                      reservacion.estado
                                    )}

                                  </span>

                                </div>

                                {/* INFORMACIÓN DEL VUELO */}

                                <div className="space-y-4 p-5">

                                  <div className="flex items-center justify-between gap-4 rounded-xl bg-sky-50 p-4">

                                    <div className="min-w-0 flex-1">

                                      <p className="text-2xl font-bold text-[#0C2D57]">

                                        {origen?.codigoIata || "—"}

                                      </p>

                                      <p className="mt-1 text-xs text-slate-500">

                                        {origen?.ciudad ||
                                          "Origen no disponible"}

                                      </p>

                                    </div>

                                    <div className="flex flex-col items-center gap-2">

                                      <Plane
                                        size={25}
                                        className="text-sky-600"
                                      />

                                      <span className="text-xs font-semibold text-sky-700">

                                        {vuelo?.numeroVuelo ||
                                          "Sin número"}

                                      </span>

                                    </div>

                                    <div className="min-w-0 flex-1 text-right">

                                      <p className="text-2xl font-bold text-[#0C2D57]">

                                        {destino?.codigoIata || "—"}

                                      </p>

                                      <p className="mt-1 text-xs text-slate-500">

                                        {destino?.ciudad ||
                                          "Destino no disponible"}

                                      </p>

                                    </div>

                                  </div>

                                  {/* DATOS DE LA RESERVACIÓN */}

                                  <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">

                                    <div>

                                      <p className="text-xs text-slate-500">
                                        Salida programada
                                      </p>

                                      <p className="mt-1 text-sm font-medium text-slate-700">

                                        {formatearFechaHora(
                                          vuelo?.salidaProgramada
                                        )}

                                      </p>

                                    </div>

                                    <div>

                                      <p className="text-xs text-slate-500">
                                        Llegada programada
                                      </p>

                                      <p className="mt-1 text-sm font-medium text-slate-700">

                                        {formatearFechaHora(
                                          vuelo?.llegadaProgramada
                                        )}

                                      </p>

                                    </div>

                                    <div>

                                      <p className="text-xs text-slate-500">
                                        Asiento
                                      </p>

                                      <p className="mt-1 text-sm font-medium text-slate-700">

                                        {reservacion.asiento?.numero ||
                                          "No asignado"}

                                      </p>

                                    </div>

                                    <div>

                                      <p className="text-xs text-slate-500">
                                        Clase
                                      </p>

                                      <p className="mt-1 text-sm font-medium text-slate-700">

                                        {reservacion.asiento?.clase ||
                                          "No registrada"}

                                      </p>

                                    </div>

                                    <div>

                                      <p className="text-xs text-slate-500">
                                        Método de pago
                                      </p>

                                      <p className="mt-1 text-sm font-medium text-slate-700">

                                        {reservacion.metodoPago ||
                                          "No registrado"}

                                      </p>

                                    </div>

                                    <div>

                                      <p className="text-xs text-slate-500">
                                        Monto de la reservación
                                      </p>

                                      <p className="mt-1 text-sm font-semibold text-[#0C2D57]">

                                        {formatearMoneda(
                                          reservacion.monto
                                        )}

                                      </p>

                                    </div>

                                  </div>

                                  {/* INFORMACIÓN DE CHECK-IN */}

                                  {reservacion.checkIn && (

                                    <div className="flex items-start gap-3 rounded-lg border border-emerald-100 bg-emerald-50 p-3">

                                      <CheckCircle2
                                        size={19}
                                        className="mt-0.5 shrink-0 text-emerald-600"
                                      />

                                      <div>

                                        <p className="text-sm font-semibold text-emerald-700">
                                          Check-in registrado
                                        </p>

                                        <p className="mt-1 text-xs text-emerald-600">

                                          {formatearFechaHora(
                                            reservacion.checkIn.creadoEn
                                          )}

                                        </p>

                                      </div>

                                    </div>

                                  )}

                                  {/* INFORMACIÓN DE CANCELACIÓN */}

                                  {reservacion.estado === "CANCELADA" && (

                                    <div className="flex items-start gap-3 rounded-lg border border-red-100 bg-red-50 p-3">

                                      <AlertCircle
                                        size={19}
                                        className="mt-0.5 shrink-0 text-red-600"
                                      />

                                      <div className="min-w-0">

                                        <p className="text-sm font-semibold text-red-700">
                                          Reservación cancelada
                                        </p>

                                        <p className="mt-1 text-xs text-red-600">

                                          {formatearFechaHora(
                                            reservacion.canceladaEn
                                          )}

                                        </p>

                                        <p className="mt-2 break-words text-sm text-red-700">

                                          Motivo:{" "}

                                          {reservacion.motivoCancelacion ||
                                            "No registrado"}

                                        </p>

                                      </div>

                                    </div>

                                  )}

                                </div>

                              </article>

                            );

                          }
                        )}

                      </div>

                    )}

                  </section>

                </>

              )}

              {/* MENSAJE DE ERROR */}

              {error && (

                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
                >

                  <AlertCircle
                    size={20}
                    className="shrink-0 text-red-600"
                  />

                  <p className="text-sm text-red-700">
                    {error}
                  </p>

                </div>

              )}

            </div>

            {/* PIE DEL MODAL */}

            <div className="flex shrink-0 flex-wrap justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">

              <button
                type="button"
                onClick={cerrarModal}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
              >

                Cerrar

              </button>

              {puedeEditar &&
                selectedPassenger &&
                !detailLoading && (

                  <button
                    type="button"
                    onClick={() =>
                      openEdit(selectedPassenger)
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700"
                  >

                    <Pencil size={17} />

                    Editar pasajero

                  </button>

                )}

            </div>

          </div>

        </div>

      )}

      {/* =====================================
    MODAL DE ELIMINACIÓN
===================================== */}

      {modal === "delete" && puedeEliminar && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
          onKeyDown={(event) => {
            if (
              event.key === "Escape" &&
              !saving
            ) {
              cerrarModal();
            }
          }}
        >

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="passenger-delete-title"
            className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          >

            {/* ENCABEZADO */}

            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">

                  <Trash2 size={25} />

                </div>

                <div>

                  <h2
                    id="passenger-delete-title"
                    className="text-xl font-semibold text-[#0C2D57]"
                  >
                    Eliminar pasajero
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Confirmación de eliminación permanente.
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={cerrarModal}
                disabled={saving}
                aria-label="Cerrar confirmación"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 disabled:opacity-50"
              >

                <X size={22} />

              </button>

            </div>

            {/* CONTENIDO */}

            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">

              {detailLoading ? (

                <div className="flex min-h-[200px] flex-col items-center justify-center gap-3">

                  <LoaderCircle
                    size={32}
                    className="animate-spin text-sky-500"
                  />

                  <p className="text-sm text-slate-500">
                    Verificando información del pasajero...
                  </p>

                </div>

              ) : !selectedPassenger ? (

                <div className="flex min-h-[180px] flex-col items-center justify-center gap-3 text-center">

                  <AlertCircle
                    size={36}
                    className="text-red-400"
                  />

                  <h3 className="font-semibold text-[#0C2D57]">
                    No fue posible verificar el pasajero
                  </h3>

                  <p className="text-sm text-slate-500">
                    La eliminación no está disponible.
                  </p>

                </div>

              ) : (

                <>

                  <p className="text-sm leading-relaxed text-slate-600">
                    ¿Estás seguro de que deseás eliminar
                    permanentemente al siguiente pasajero?
                  </p>

                  {/* INFORMACIÓN DEL PASAJERO */}

                  <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">

                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-sky-100 text-lg font-semibold text-sky-700">

                      {obtenerIniciales(
                        selectedPassenger.nombreCompleto
                      )}

                    </div>

                    <div className="min-w-0">

                      <p className="font-semibold text-[#0C2D57]">

                        {selectedPassenger.nombreCompleto}

                      </p>

                      <p className="mt-1 text-xs text-slate-500">

                        {obtenerTipoDocumento(
                          selectedPassenger.tipoDocumento
                        )}

                        {" · "}

                        {ocultarDocumento(
                          selectedPassenger.numeroDocumento
                        )}

                      </p>

                      <p className="mt-1 break-all text-xs text-slate-500">

                        {selectedPassenger.correo}

                      </p>

                    </div>

                  </div>

                  {/* VERIFICACIÓN DE RESERVACIONES */}

                  <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">

                    <div className="flex items-center gap-3">

                      <Ticket
                        size={22}
                        className="text-sky-600"
                      />

                      <div>

                        <p className="text-sm font-medium text-slate-700">
                          Reservaciones asociadas
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Incluye todos los estados.
                        </p>

                      </div>

                    </div>

                    <span className="text-xl font-bold text-[#0C2D57]">

                      {cantidadReservacionesSeleccionado ?? "—"}

                    </span>

                  </div>

                  {/* ESTADO DE LA ELIMINACIÓN */}

                  {cantidadReservacionesSeleccionado === null ? (

                    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">

                      <AlertCircle
                        size={20}
                        className="mt-0.5 shrink-0 text-amber-600"
                      />

                      <div>

                        <p className="text-sm font-semibold text-amber-800">
                          No se pudo verificar la información
                        </p>

                        <p className="mt-1 text-xs leading-relaxed text-amber-700">
                          No es posible confirmar que el pasajero
                          esté libre de reservaciones asociadas.
                          La eliminación permanecerá bloqueada.
                        </p>

                      </div>

                    </div>

                  ) : pasajeroTieneReservaciones ? (

                    <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">

                      <ShieldAlert
                        size={21}
                        className="mt-0.5 shrink-0 text-red-600"
                      />

                      <div>

                        <p className="text-sm font-semibold text-red-800">
                          No se puede eliminar este pasajero
                        </p>

                        <p className="mt-1 text-xs leading-relaxed text-red-700">
                          El pasajero tiene reservaciones asociadas.
                          Para proteger el historial de operaciones,
                          no se permite eliminarlo, incluso cuando
                          sus reservaciones estén canceladas.
                        </p>

                      </div>

                    </div>

                  ) : (

                    <>

                      <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">

                        <CheckCircle2
                          size={20}
                          className="mt-0.5 shrink-0 text-emerald-600"
                        />

                        <div>

                          <p className="text-sm font-semibold text-emerald-800">
                            Pasajero sin reservaciones
                          </p>

                          <p className="mt-1 text-xs leading-relaxed text-emerald-700">
                            Actualmente no existen reservaciones
                            asociadas a este pasajero.
                          </p>

                        </div>

                      </div>

                      <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">

                        <AlertCircle
                          size={20}
                          className="mt-0.5 shrink-0 text-red-600"
                        />

                        <div>

                          <p className="text-sm font-semibold text-red-800">
                            Esta acción es irreversible
                          </p>

                          <p className="mt-1 text-xs leading-relaxed text-red-700">
                            Se eliminará permanentemente la información
                            personal y de contacto del pasajero.
                            Esta operación no se puede deshacer.
                          </p>

                        </div>

                      </div>

                    </>

                  )}

                </>

              )}

              {/* MENSAJE DE ERROR */}

              {error && (

                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
                >

                  <AlertCircle
                    size={20}
                    className="shrink-0 text-red-600"
                  />

                  <div>

                    <p className="text-sm font-semibold text-red-800">
                      No fue posible eliminar el pasajero
                    </p>

                    <p className="mt-1 text-sm text-red-700">
                      {error}
                    </p>

                    <p className="mt-2 text-xs text-red-600">
                      Cerrá esta ventana y actualizá el directorio
                      antes de intentar nuevamente.
                    </p>

                  </div>

                </div>

              )}

            </div>

            {/* PIE DEL MODAL */}

            <div className="flex shrink-0 flex-wrap justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">

              <button
                type="button"
                autoFocus
                onClick={cerrarModal}
                disabled={saving}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >

                Cancelar

              </button>

              <button
                type="button"
                onClick={confirmarEliminacion}
                disabled={!puedeConfirmarEliminacion}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
              >

                {saving ? (

                  <>

                    <LoaderCircle
                      size={17}
                      className="animate-spin"
                    />

                    Eliminando...

                  </>

                ) : (

                  <>

                    <Trash2 size={17} />

                    Eliminar pasajero

                  </>

                )}

              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}