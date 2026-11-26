import { useEffect, useMemo, useRef, useState } from "react";

import {
  ClipboardCheck,
  Building2,
  UserRound,
  Users,
  UserRoundCheck,
  UserRoundX,
  ShieldCheck,
  ShieldAlert,
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
  Unlink,
  Mail,
  Lock,
} from "lucide-react";

import { asignacionesAdministradoresService } from "../services/asignacionesAdministradoresService";
import { usuariosService } from "../services/usuariosService";
import { aeropuertosService } from "../services/aeropuertosService";

import { useAuth } from "../context/AuthContext";

import PageHeader from "../components/management/PageHeader";
import StatCard from "../components/management/StatCard";

import { tienePermiso } from "../config/permissions";

// Estado inicial del formulario
const initialForm = {
  usuarioId: "",
  aeropuertoId: "",
};

// Normalizar textos para las búsquedas
function normalizarTexto(valor) {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

// Obtener mensajes de error
function obtenerMensajeError(error) {
  return (
    error?.message ||
    "No se pudo completar la operación."
  );
}

export default function AirportAdministrators() {
  const { rol, usuario } = useAuth();

  // Permisos del módulo
  const puedeConsultar = tienePermiso(
    rol,
    "asignacionesAdministradores",
    "consultar"
  );

  const puedeCrear = tienePermiso(
    rol,
    "asignacionesAdministradores",
    "crear"
  );

  const puedeEditar = tienePermiso(
    rol,
    "asignacionesAdministradores",
    "editar"
  );

  const puedeRevocar = tienePermiso(
    rol,
    "asignacionesAdministradores",
    "revocar"
  );

  const usuarioSesionId = usuario?.id;

  // Control de solicitudes asíncronas
  const versionCarga = useRef(0);
  const versionDetalle = useRef(0);
  const versionSesion = useRef(0);
  const operacionEnCurso = useRef(false);

  // Datos principales
  const [asignaciones, setAsignaciones] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [aeropuertos, setAeropuertos] = useState([]);

  // Estados de carga
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  // Filtros
  const [search, setSearch] = useState("");
  const [airportFilter, setAirportFilter] = useState("");
  const [adminFilter, setAdminFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modales
  const [modal, setModal] = useState(null);

  const [selectedAssignment, setSelectedAssignment] =
    useState(null);

  const [editingId, setEditingId] = useState(null);

  // Formulario
  const [form, setForm] = useState({
    ...initialForm,
  });

  // Mensajes
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // ==========================================
  // CARGA DE INFORMACIÓN
  // ==========================================

  async function cargarDatos(mostrarCarga = true) {
    if (!puedeConsultar) return;

    const solicitud = ++versionCarga.current;

    if (mostrarCarga) {
      setLoading(true);
      setError("");
    }

    try {
      const [
        datosAsignaciones,
        datosUsuarios,
        datosAeropuertos,
      ] = await Promise.all([
        asignacionesAdministradoresService.obtenerTodos(),
        usuariosService.obtenerTodos(),
        aeropuertosService.obtenerTodos(),
      ]);

      if (solicitud !== versionCarga.current) return;

      if (
        !Array.isArray(datosAsignaciones) ||
        !Array.isArray(datosUsuarios) ||
        !Array.isArray(datosAeropuertos)
      ) {
        throw new Error(
          "El servidor devolvió información con un formato incorrecto."
        );
      }

      setAsignaciones(datosAsignaciones);
      setUsuarios(datosUsuarios);
      setAeropuertos(datosAeropuertos);
    } catch (errorCarga) {
      if (solicitud !== versionCarga.current) return;

      setError(obtenerMensajeError(errorCarga));
    } finally {
      if (solicitud === versionCarga.current) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    versionSesion.current++;

    setAsignaciones([]);
    setUsuarios([]);
    setAeropuertos([]);

    setSearch("");
    setAirportFilter("");
    setAdminFilter("");
    setStatusFilter("");

    setModal(null);
    setSelectedAssignment(null);
    setEditingId(null);
    setForm({ ...initialForm });

    setError("");
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
      versionCarga.current++;
      versionDetalle.current++;
      versionSesion.current++;
    };
  }, [puedeConsultar, usuarioSesionId]);

  // ==========================================
  // ADMINISTRADORES
  // ==========================================

  const administradores = useMemo(() => {
    return usuarios.filter(
      (usuario) =>
        usuario.rol?.codigo === "ADMIN_AEROPUERTO"
    );
  }, [usuarios]);

  const administradoresActivos = useMemo(() => {
    return administradores.filter(
      (administrador) =>
        administrador.estado === "ACTIVO"
    );
  }, [administradores]);

  const administradoresInactivos = useMemo(() => {
    return administradores.filter(
      (administrador) =>
        administrador.estado === "INACTIVO"
    );
  }, [administradores]);

  // Identificadores de administradores asignados
  const idsAdministradoresAsignados = useMemo(() => {
    return new Set(
      asignaciones.map(
        (asignacion) => Number(asignacion.usuarioId)
      )
    );
  }, [asignaciones]);

  // Administradores activos sin asignaciones
  const administradoresSinAsignaciones = useMemo(() => {
    return administradoresActivos.filter(
      (administrador) =>
        !idsAdministradoresAsignados.has(
          Number(administrador.id)
        )
    );
  }, [
    administradoresActivos,
    idsAdministradoresAsignados,
  ]);

  // ==========================================
  // ESTADÍSTICAS
  // ==========================================

  const estadisticas = useMemo(() => {
    const aeropuertosAsignados = new Set(
      asignaciones.map(
        (asignacion) => Number(asignacion.aeropuertoId)
      )
    );

    return {
      totalAsignaciones: asignaciones.length,

      administradoresAsignados:
        idsAdministradoresAsignados.size,

      aeropuertosConAdministradores:
        aeropuertosAsignados.size,

      administradoresSinAsignaciones:
        administradoresSinAsignaciones.length,
    };
  }, [
    asignaciones,
    idsAdministradoresAsignados,
    administradoresSinAsignaciones,
  ]);

  // ==========================================
  // FILTROS Y BÚSQUEDA
  // ==========================================

  const asignacionesFiltradas = useMemo(() => {
    const busqueda = normalizarTexto(search);

    return asignaciones.filter((asignacion) => {
      const administrador = asignacion.usuario;
      const aeropuerto = asignacion.aeropuerto;

      const textoBusqueda = normalizarTexto(
        [
          administrador?.nombreCompleto,
          administrador?.correo,
          aeropuerto?.nombre,
          aeropuerto?.codigoIata,
          aeropuerto?.pais,
          aeropuerto?.ciudad,
        ].join(" ")
      );

      const coincideBusqueda =
        !busqueda ||
        textoBusqueda.includes(busqueda);

      const coincideAeropuerto =
        !airportFilter ||
        String(asignacion.aeropuertoId) === airportFilter;

      const coincideAdministrador =
        !adminFilter ||
        String(asignacion.usuarioId) === adminFilter;

      const coincideEstado =
        !statusFilter ||
        administrador?.estado === statusFilter;

      return (
        coincideBusqueda &&
        coincideAeropuerto &&
        coincideAdministrador &&
        coincideEstado
      );
    });
  }, [
    asignaciones,
    search,
    airportFilter,
    adminFilter,
    statusFilter,
  ]);

  const filtrosActivos = Boolean(
    search ||
    airportFilter ||
    adminFilter ||
    statusFilter
  );

  function limpiarFiltros() {
    setSearch("");
    setAirportFilter("");
    setAdminFilter("");
    setStatusFilter("");
  }

  // ==========================================
  // INFORMACIÓN DEL FORMULARIO
  // ==========================================

  const administradorSeleccionado = useMemo(() => {
    return administradores.find(
      (administrador) =>
        String(administrador.id) === form.usuarioId
    );
  }, [administradores, form.usuarioId]);

  const aeropuertoSeleccionado = useMemo(() => {
    return aeropuertos.find(
      (aeropuerto) =>
        String(aeropuerto.id) === form.aeropuertoId
    );
  }, [aeropuertos, form.aeropuertoId]);

  // Administradores disponibles para el formulario
  const administradoresDisponibles = useMemo(() => {
    const disponibles = [...administradoresActivos];

    // Conservar el titular actual si está inactivo
    // para poder visualizarlo durante la edición.
    if (editingId !== null && selectedAssignment?.usuario) {
      const titular = selectedAssignment.usuario;

      const incluido = disponibles.some(
        (administrador) =>
          Number(administrador.id) === Number(titular.id)
      );

      if (!incluido) {
        disponibles.push(titular);
      }
    }

    return disponibles.sort((a, b) =>
      a.nombreCompleto.localeCompare(
        b.nombreCompleto,
        "es"
      )
    );
  }, [
    administradoresActivos,
    editingId,
    selectedAssignment,
  ]);

  // Aeropuertos que puede recibir el administrador
  const aeropuertosDisponibles = useMemo(() => {
    if (!form.usuarioId) {
      return aeropuertos;
    }

    return aeropuertos.filter((aeropuerto) => {
      const duplicado = asignaciones.some(
        (asignacion) =>
          Number(asignacion.usuarioId) ===
          Number(form.usuarioId) &&
          Number(asignacion.aeropuertoId) ===
          Number(aeropuerto.id) &&
          Number(asignacion.id) !== Number(editingId)
      );

      return !duplicado;
    });
  }, [
    aeropuertos,
    asignaciones,
    form.usuarioId,
    editingId,
  ]);

  const asignacionDuplicada = useMemo(() => {
    if (!form.usuarioId || !form.aeropuertoId) {
      return false;
    }

    return asignaciones.some(
      (asignacion) =>
        Number(asignacion.usuarioId) ===
        Number(form.usuarioId) &&
        Number(asignacion.aeropuertoId) ===
        Number(form.aeropuertoId) &&
        Number(asignacion.id) !== Number(editingId)
    );
  }, [asignaciones, form, editingId]);

  const hayCambios = useMemo(() => {
    if (editingId === null || !selectedAssignment) {
      return true;
    }

    return (
      Number(form.usuarioId) !==
      Number(selectedAssignment.usuarioId) ||
      Number(form.aeropuertoId) !==
      Number(selectedAssignment.aeropuertoId)
    );
  }, [form, editingId, selectedAssignment]);

  const puedeGuardar =
    Boolean(form.usuarioId) &&
    Boolean(form.aeropuertoId) &&
    Boolean(aeropuertoSeleccionado) &&
    administradorSeleccionado?.estado === "ACTIVO" &&
    !asignacionDuplicada &&
    !saving &&
    !loading &&
    hayCambios &&
    (editingId === null ? puedeCrear : puedeEditar);

  // Asignaciones actuales del administrador seleccionado
  const asignacionesAdministradorSeleccionado = useMemo(() => {
    if (!form.usuarioId) {
      return [];
    }

    return asignaciones.filter(
      (asignacion) =>
        Number(asignacion.usuarioId) ===
        Number(form.usuarioId)
    );
  }, [asignaciones, form.usuarioId]);

  // Determinar si se está modificando el administrador
  const cambiaAdministrador =
    editingId !== null &&
    Boolean(selectedAssignment) &&
    Boolean(form.usuarioId) &&
    Number(form.usuarioId) !==
    Number(selectedAssignment.usuarioId);

  // Determinar si se está modificando el aeropuerto
  const cambiaAeropuerto =
    editingId !== null &&
    Boolean(selectedAssignment) &&
    Boolean(form.aeropuertoId) &&
    Number(form.aeropuertoId) !==
    Number(selectedAssignment.aeropuertoId);

  // Asignaciones del administrador consultado
  const asignacionesAdministradorDetalle = useMemo(() => {
    if (!selectedAssignment?.usuarioId) {
      return [];
    }

    const otrasAsignaciones = asignaciones.filter(
      (asignacion) =>
        Number(asignacion.usuarioId) ===
        Number(selectedAssignment.usuarioId) &&
        Number(asignacion.id) !==
        Number(selectedAssignment.id)
    );

    return [
      selectedAssignment,
      ...otrasAsignaciones,
    ].sort((a, b) =>
      String(a.aeropuerto?.nombre ?? "").localeCompare(
        String(b.aeropuerto?.nombre ?? ""),
        "es"
      )
    );
  }, [asignaciones, selectedAssignment]);

  // Estado del administrador consultado
  const administradorDetalleActivo =
    selectedAssignment?.usuario?.estado === "ACTIVO";

  const administradorDetalleInactivo =
    selectedAssignment?.usuario?.estado === "INACTIVO";

  // Verificar la disponibilidad de los detalles
  const detalleDisponible =
    Boolean(selectedAssignment?.id) &&
    Boolean(selectedAssignment?.usuario) &&
    Boolean(selectedAssignment?.aeropuerto) &&
    !detailLoading &&
    !error;

  // ==========================================
  // GESTIÓN DEL FORMULARIO
  // ==========================================

  function updateForm(campo, valor) {
    setError("");

    setForm((anterior) => {
      const actualizado = {
        ...anterior,
        [campo]: valor,
      };

      // Si cambia el administrador, comprobar que
      // el aeropuerto seleccionado siga disponible.
      if (campo === "usuarioId") {
        const duplicado = asignaciones.some(
          (asignacion) =>
            Number(asignacion.usuarioId) === Number(valor) &&
            Number(asignacion.aeropuertoId) ===
            Number(anterior.aeropuertoId) &&
            Number(asignacion.id) !== Number(editingId)
        );

        if (duplicado) {
          actualizado.aeropuertoId = "";
        }
      }

      return actualizado;
    });
  }

  function reiniciarFormulario() {
    setForm({ ...initialForm });
    setEditingId(null);
    setSelectedAssignment(null);
  }

  // ==========================================
  // GESTIÓN DE MODALES
  // ==========================================

  function openCreate() {
    if (!puedeCrear || saving || loading || detailLoading) {
      return;
    }

    reiniciarFormulario();

    setError("");
    setMessage("");
    setModal("create");
  }

  function openEdit(asignacion) {
    if (!puedeEditar || saving || loading || detailLoading) {
      return;
    }

    if (!asignacion?.id) return;

    setSelectedAssignment(asignacion);
    setEditingId(asignacion.id);

    setForm({
      usuarioId: String(asignacion.usuarioId),
      aeropuertoId: String(asignacion.aeropuertoId),
    });

    setError("");
    setMessage("");
    setModal("edit");
  }

  async function cargarDetalle(asignacion, tipoModal) {
    if (saving || loading || detailLoading) return;

    if (
      (tipoModal === "details" && !puedeConsultar) ||
      (tipoModal === "delete" && !puedeRevocar)
    ) {
      return;
    }

    if (!asignacion?.id) return;

    const solicitud = ++versionDetalle.current;

    setSelectedAssignment(null);
    setEditingId(null);
    setError("");
    setMessage("");
    setModal(tipoModal);
    setDetailLoading(true);

    try {
      const detalle =
        await asignacionesAdministradoresService.obtenerPorId(
          asignacion.id
        );

      if (solicitud !== versionDetalle.current) return;

      if (
        Number(detalle?.id) !== Number(asignacion.id) ||
        !detalle?.usuario ||
        !detalle?.aeropuerto
      ) {
        throw new Error(
          "No se pudo verificar la información de la asignación."
        );
      }

      setSelectedAssignment(detalle);
    } catch (errorDetalle) {
      if (solicitud !== versionDetalle.current) return;

      setError(obtenerMensajeError(errorDetalle));
    } finally {
      if (solicitud === versionDetalle.current) {
        setDetailLoading(false);
      }
    }
  }

  function openDetails(asignacion) {
    return cargarDetalle(asignacion, "details");
  }

  function openDelete(asignacion) {
    return cargarDetalle(asignacion, "delete");
  }

  function cerrarModal() {
    if (saving || operacionEnCurso.current) return;

    versionDetalle.current++;

    setModal(null);
    setDetailLoading(false);
    setError("");

    reiniciarFormulario();
  }

  // ==========================================
  // REGISTRAR Y ACTUALIZAR
  // ==========================================

  async function saveAssignment(event) {
    event.preventDefault();

    if (
      saving ||
      loading ||
      detailLoading ||
      operacionEnCurso.current
    ) {
      return;
    }

    if (modal !== "create" && modal !== "edit") return;

    const registrando = editingId === null;

    if (
      (registrando && !puedeCrear) ||
      (!registrando && !puedeEditar)
    ) {
      return;
    }

    if (
      !registrando &&
      Number(selectedAssignment?.id) !== Number(editingId)
    ) {
      setError("No se pudo identificar la asignación.");
      return;
    }

    setError("");
    setMessage("");

    if (!form.usuarioId || !form.aeropuertoId) {
      setError(
        "Debés seleccionar un administrador y un aeropuerto."
      );
      return;
    }

    if (!administradorSeleccionado) {
      setError(
        "El administrador seleccionado no existe."
      );
      return;
    }

    if (administradorSeleccionado.estado !== "ACTIVO") {
      setError(
        "Solo se pueden otorgar asignaciones a administradores activos."
      );
      return;
    }

    if (!aeropuertoSeleccionado) {
      setError(
        "El aeropuerto seleccionado no existe."
      );
      return;
    }

    if (asignacionDuplicada) {
      setError(
        "El administrador ya tiene asignado este aeropuerto."
      );
      return;
    }

    if (!hayCambios) {
      setError("No se realizaron cambios.");
      return;
    }

    const usuarioId = Number(form.usuarioId);
    const aeropuertoId = Number(form.aeropuertoId);

    if (
      !Number.isSafeInteger(usuarioId) ||
      usuarioId <= 0 ||
      usuarioId > 2147483647 ||
      !Number.isSafeInteger(aeropuertoId) ||
      aeropuertoId <= 0 ||
      aeropuertoId > 2147483647
    ) {
      setError("Los identificadores no son válidos.");
      return;
    }

    const datos = registrando
      ? {
        usuarioId,
        aeropuertoId,
      }
      : {
        ...(cambiaAdministrador ? { usuarioId } : {}),
        ...(cambiaAeropuerto ? { aeropuertoId } : {}),
      };

    const sesionActual = versionSesion.current;

    operacionEnCurso.current = true;
    setSaving(true);

    try {
      let resultado;

      if (registrando) {
        resultado =
          await asignacionesAdministradoresService.registrar(
            datos
          );
      } else {
        resultado =
          await asignacionesAdministradoresService.actualizar(
            editingId,
            datos
          );
      }

      if (sesionActual !== versionSesion.current) return;

      // Invalidar consultas anteriores
      versionCarga.current++;

      // Actualizar el directorio con la respuesta
      // confirmada por el backend.
      if (resultado?.id) {
        setAsignaciones((anteriores) => {
          if (registrando) {
            return [
              ...anteriores.filter(
                (a) => Number(a.id) !== Number(resultado.id)
              ),
              resultado,
            ];
          }

          return anteriores.map((asignacion) =>
            Number(asignacion.id) === Number(resultado.id)
              ? resultado
              : asignacion
          );
        });
      }

      setMessage(
        registrando
          ? "Asignación registrada correctamente."
          : "Asignación actualizada correctamente."
      );

      setModal(null);

      reiniciarFormulario();
      limpiarFiltros();

      await cargarDatos(false);
    } catch (errorGuardado) {
      if (sesionActual !== versionSesion.current) return;

      setError(obtenerMensajeError(errorGuardado));
    } finally {
      if (sesionActual === versionSesion.current) {
        operacionEnCurso.current = false;
        setSaving(false);
      }
    }
  }

  // ==========================================
  // REVOCAR ASIGNACIONES
  // ==========================================
  // Asignaciones que conservará el administrador
  const asignacionesRestantes = useMemo(() => {
    if (!selectedAssignment?.usuarioId) {
      return [];
    }

    return asignaciones.filter(
      (asignacion) =>
        Number(asignacion.usuarioId) ===
        Number(selectedAssignment.usuarioId) &&
        Number(asignacion.id) !==
        Number(selectedAssignment.id)
    );
  }, [asignaciones, selectedAssignment]);

  // Determinar si se está revocando la última asignación
  const esUltimaAsignacion =
    Boolean(selectedAssignment?.id) &&
    asignacionesRestantes.length === 0;

  const puedeConfirmarRevocacion =
    puedeRevocar &&
    modal === "delete" &&
    Boolean(selectedAssignment?.id) &&
    Boolean(selectedAssignment?.usuario) &&
    Boolean(selectedAssignment?.aeropuerto) &&
    !detailLoading &&
    !loading &&
    !saving &&
    !error;

  async function confirmarRevocacion() {
    if (
      !puedeConfirmarRevocacion ||
      operacionEnCurso.current
    ) {
      return;
    }

    const asignacionId = selectedAssignment.id;

    const sesionActual = versionSesion.current;

    operacionEnCurso.current = true;
    setSaving(true);
    setError("");
    setMessage("");

    try {
      await asignacionesAdministradoresService.eliminar(
        asignacionId
      );

      if (sesionActual !== versionSesion.current) return;

      versionCarga.current++;

      setAsignaciones((anteriores) =>
        anteriores.filter(
          (asignacion) =>
            Number(asignacion.id) !== Number(asignacionId)
        )
      );

      setMessage(
        "Asignación revocada correctamente."
      );

      setModal(null);

      reiniciarFormulario();
      limpiarFiltros();

      await cargarDatos(false);
    } catch (errorRevocacion) {
      if (sesionActual !== versionSesion.current) return;

      setError(obtenerMensajeError(errorRevocacion));
    } finally {
      if (sesionActual === versionSesion.current) {
        operacionEnCurso.current = false;
        setSaving(false);
      }
    }
  }

  // ==========================================
  // CONTROL DE ACCESO
  // ==========================================

  if (!puedeConsultar) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <div className="mb-4 rounded-full bg-red-50 p-4">
          <ShieldAlert
            size={36}
            className="text-red-500"
          />
        </div>

        <h2 className="text-xl font-bold text-slate-800">
          Acceso restringido
        </h2>

        <p className="mt-2 max-w-md text-sm text-slate-500">
          Únicamente el administrador general puede
          gestionar las asignaciones de administradores
          de aeropuerto.
        </p>
      </div>
    );
  }

  // ==========================================
  // INTERFAZ PRINCIPAL
  // ==========================================

  return (
    <div className="space-y-6">

      {/* Encabezado del módulo */}
      <PageHeader
        icono={ClipboardCheck}
        titulo="Asignación de administradores"
        descripcion="Gestioná los accesos administrativos a los aeropuertos del sistema."
        onActualizar={
          loading || saving || detailLoading || modal
            ? undefined
            : () => cargarDatos()
        }
        onNuevo={
          puedeCrear &&
            !loading &&
            !saving &&
            !detailLoading &&
            !modal
            ? openCreate
            : undefined
        }
        textoBoton="Nueva asignación"
      />

      {/* Indicador de acceso administrativo */}
      <div className="flex flex-col gap-4 rounded-2xl border border-sky-200 bg-sky-50 p-4 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
            <ShieldCheck size={24} />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[#0C2D57]">
              Gestión global de accesos
            </h3>

            <p className="mt-1 text-sm text-sky-700">
              Administrá las asignaciones de todos los
              aeropuertos del sistema.
            </p>
          </div>

        </div>

        <span className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full border border-sky-200 bg-white px-3 py-1.5 text-xs font-semibold text-sky-700">
          <Lock size={13} />
          Administrador general
        </span>

      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          titulo="Total de asignaciones"
          valor={
            loading
              ? "—"
              : estadisticas.totalAsignaciones
          }
        />

        <StatCard
          titulo="Administradores asignados"
          valor={
            loading
              ? "—"
              : estadisticas.administradoresAsignados
          }
        />

        <StatCard
          titulo="Aeropuertos con administradores"
          valor={
            loading
              ? "—"
              : estadisticas.aeropuertosConAdministradores
          }
        />

        <StatCard
          titulo="Administradores activos sin asignar"
          valor={
            loading
              ? "—"
              : estadisticas.administradoresSinAsignaciones
          }
        />

      </div>

      {/* Advertencia de administradores sin asignaciones */}
      {!loading &&
        !error &&
        administradoresSinAsignaciones.length > 0 && (

          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">

            <AlertCircle
              size={21}
              className="mt-0.5 shrink-0 text-amber-600"
            />

            <div>
              <h3 className="text-sm font-semibold text-amber-800">
                Administradores pendientes de asignación
              </h3>

              <p className="mt-1 text-sm text-amber-700">
                {administradoresSinAsignaciones.length === 1
                  ? "Existe un administrador activo que todavía no tiene ningún aeropuerto asignado."
                  : `Existen ${administradoresSinAsignaciones.length} administradores activos que todavía no tienen ningún aeropuerto asignado.`}
              </p>

              <p className="mt-1 text-xs text-amber-700">
                Estos usuarios no pueden realizar operaciones
                que requieran un aeropuerto autorizado.
              </p>
            </div>

          </div>
        )}

      {/* Mensaje de confirmación */}
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

      {/* Mensaje de error */}
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

      {/* ========================================== */}
      {/* DIRECTORIO DE ASIGNACIONES                 */}
      {/* ========================================== */}

      <section className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm">

        {/* Encabezado del directorio */}
        <div className="border-b border-slate-100 p-5">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
              <ClipboardCheck size={22} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[#0C2D57]">
                Directorio de asignaciones
              </h2>

              <p className="mt-0.5 text-sm text-slate-500">
                Consultá y gestioná los accesos administrativos
                registrados en el sistema.
              </p>
            </div>

          </div>

        </div>

        {/* ========================================== */}
        {/* BÚSQUEDA Y FILTROS                         */}
        {/* ========================================== */}

        <div className="space-y-4 border-b border-slate-100 p-5">

          {/* Barra de búsqueda */}
          <div className="relative">

            <Search
              size={19}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Buscar por administrador, correo, aeropuerto o código IATA..."
              aria-label="Buscar asignaciones"
              disabled={loading || saving}
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 disabled:bg-slate-50"
            />

          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

            {/* Filtro por aeropuerto */}
            <div>

              <label
                htmlFor="assignment-airport-filter"
                className="mb-1.5 block text-sm font-medium text-slate-600"
              >
                Aeropuerto
              </label>

              <select
                id="assignment-airport-filter"
                value={airportFilter}
                onChange={(event) =>
                  setAirportFilter(event.target.value)
                }
                disabled={loading || saving}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 disabled:bg-slate-50"
              >

                <option value="">
                  Todos los aeropuertos
                </option>

                {aeropuertos.map((aeropuerto) => (

                  <option
                    key={aeropuerto.id}
                    value={String(aeropuerto.id)}
                  >
                    {aeropuerto.codigoIata} - {aeropuerto.nombre}
                  </option>

                ))}

              </select>

            </div>

            {/* Filtro por administrador */}
            <div>

              <label
                htmlFor="assignment-admin-filter"
                className="mb-1.5 block text-sm font-medium text-slate-600"
              >
                Administrador
              </label>

              <select
                id="assignment-admin-filter"
                value={adminFilter}
                onChange={(event) =>
                  setAdminFilter(event.target.value)
                }
                disabled={loading || saving}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 disabled:bg-slate-50"
              >

                <option value="">
                  Todos los administradores
                </option>

                {administradores.map((administrador) => (

                  <option
                    key={administrador.id}
                    value={String(administrador.id)}
                  >
                    {administrador.nombreCompleto}
                    {administrador.estado === "INACTIVO"
                      ? " (Inactivo)"
                      : ""}
                  </option>

                ))}

              </select>

            </div>

            {/* Filtro por estado */}
            <div>

              <label
                htmlFor="assignment-status-filter"
                className="mb-1.5 block text-sm font-medium text-slate-600"
              >
                Estado del administrador
              </label>

              <select
                id="assignment-status-filter"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                disabled={loading || saving}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 disabled:bg-slate-50"
              >

                <option value="">
                  Todos los estados
                </option>

                <option value="ACTIVO">
                  Activo
                </option>

                <option value="INACTIVO">
                  Inactivo
                </option>

              </select>

            </div>

          </div>

          {/* Resultados y limpieza de filtros */}
          <div className="flex flex-wrap items-center justify-between gap-3">

            <p className="text-sm text-slate-500">
              {loading ? (
                "Consultando asignaciones..."
              ) : (
                <>
                  <span className="font-semibold text-[#0C2D57]">
                    {asignacionesFiltradas.length}
                  </span>

                  {" de "}

                  {asignaciones.length}

                  {" asignaciones"}
                </>
              )}
            </p>

            <button
              type="button"
              onClick={limpiarFiltros}
              disabled={!filtrosActivos || loading || saving}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
            >

              <RotateCcw size={16} />

              Limpiar filtros

            </button>

          </div>

        </div>

        {/* ========================================== */}
        {/* CONTENIDO DEL DIRECTORIO                   */}
        {/* ========================================== */}

        {loading ? (

          /* Indicador de carga */
          <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 p-6">

            <LoaderCircle
              size={34}
              className="animate-spin text-sky-500"
            />

            <p className="text-sm text-slate-500">
              Cargando asignaciones...
            </p>

          </div>

        ) : asignacionesFiltradas.length === 0 ? (

          /* Estado vacío */
          <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 p-6 text-center">

            <div className="rounded-full bg-sky-50 p-5">

              {filtrosActivos ? (

                <Search
                  size={34}
                  className="text-sky-400"
                />

              ) : (

                <ClipboardCheck
                  size={34}
                  className="text-sky-400"
                />

              )}

            </div>

            <h3 className="font-semibold text-slate-700">

              {error
                ? "No se pudo cargar la información"
                : filtrosActivos
                  ? "No se encontraron resultados"
                  : "No hay asignaciones registradas"}

            </h3>

            <p className="max-w-md text-sm text-slate-500">

              {error
                ? "Intentá actualizar la información del directorio."
                : filtrosActivos
                  ? "Probá utilizando otros términos de búsqueda o modificando los filtros."
                  : "Las asignaciones de administradores aparecerán en este directorio."}

            </p>

          </div>

        ) : (

          /* Tabla de asignaciones */
          <div className="max-h-[600px] overflow-auto">

            <table className="w-full min-w-[1050px] border-collapse text-left">

              {/* Encabezados fijos */}
              <thead className="sticky top-0 z-10 bg-slate-50">

                <tr className="border-b border-slate-200">

                  <th
                    scope="col"
                    className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    Administrador
                  </th>

                  <th
                    scope="col"
                    className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    Aeropuerto
                  </th>

                  <th
                    scope="col"
                    className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    Ubicación
                  </th>

                  <th
                    scope="col"
                    className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    Estado del administrador
                  </th>

                  <th
                    scope="col"
                    className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    Acciones
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                {asignacionesFiltradas.map((asignacion) => {

                  const administrador = asignacion.usuario;

                  const aeropuerto = asignacion.aeropuerto;

                  const activo =
                    administrador?.estado === "ACTIVO";

                  const inactivo =
                    administrador?.estado === "INACTIVO";

                  return (

                    <tr
                      key={asignacion.id}
                      className="transition hover:bg-sky-50/40"
                    >

                      {/* Administrador */}
                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600">

                            <UserRound size={20} />

                          </div>

                          <div>

                            <p className="font-semibold text-slate-700">
                              {administrador?.nombreCompleto ||
                                "Administrador no disponible"}
                            </p>

                            <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">

                              <Mail size={13} />

                              {administrador?.correo ||
                                "Correo no disponible"}

                            </p>

                          </div>

                        </div>

                      </td>

                      {/* Aeropuerto */}
                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">

                            <Building2 size={20} />

                          </div>

                          <div>

                            <p className="text-sm font-semibold text-slate-700">
                              {aeropuerto?.nombre ||
                                "Aeropuerto no disponible"}
                            </p>

                            <span className="mt-1 inline-flex rounded-md border border-sky-100 bg-sky-50 px-2 py-0.5 text-xs font-semibold text-sky-700">

                              {aeropuerto?.codigoIata || "—"}

                            </span>

                          </div>

                        </div>

                      </td>

                      {/* Ubicación */}
                      <td className="px-5 py-4">

                        <p className="text-sm font-medium text-slate-700">
                          {aeropuerto?.ciudad || "—"}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {aeropuerto?.pais || "—"}
                        </p>

                      </td>

                      {/* Estado del administrador */}
                      <td className="px-5 py-4">

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${activo
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : inactivo
                              ? "border-slate-200 bg-slate-100 text-slate-600"
                              : "border-amber-200 bg-amber-50 text-amber-700"
                            }`}
                        >

                          <span
                            className={`h-2 w-2 rounded-full ${activo
                              ? "bg-emerald-500"
                              : inactivo
                                ? "bg-slate-400"
                                : "bg-amber-500"
                              }`}
                          />

                          {activo
                            ? "Activo"
                            : inactivo
                              ? "Inactivo"
                              : "Desconocido"}

                        </span>

                      </td>

                      {/* Acciones */}
                      <td className="px-5 py-4">

                        <div className="flex items-center justify-center gap-2">

                          {/* Consultar detalles */}
                          {puedeConsultar && (

                            <button
                              type="button"
                              title="Consultar detalles"
                              aria-label="Consultar detalles de la asignación"
                              onClick={() => openDetails(asignacion)}
                              disabled={
                                loading ||
                                saving ||
                                detailLoading ||
                                Boolean(modal)
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-sky-100 bg-sky-50 text-sky-600 transition hover:border-sky-200 hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >

                              <Eye size={17} />

                            </button>

                          )}

                          {/* Editar asignación */}
                          {puedeEditar && (

                            <button
                              type="button"
                              title="Editar asignación"
                              aria-label="Editar asignación"
                              onClick={() => openEdit(asignacion)}
                              disabled={
                                loading ||
                                saving ||
                                detailLoading ||
                                Boolean(modal)
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >

                              <Pencil size={17} />

                            </button>

                          )}

                          {/* Revocar asignación */}
                          {puedeRevocar && (

                            <button
                              type="button"
                              title="Revocar asignación"
                              aria-label="Revocar asignación"
                              onClick={() => openDelete(asignacion)}
                              disabled={
                                loading ||
                                saving ||
                                detailLoading ||
                                Boolean(modal)
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-500 transition hover:border-red-200 hover:bg-red-100 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >

                              <Unlink size={17} />

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

        {/* Pie del directorio */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/50 px-5 py-4">

          <p className="text-xs text-slate-500">

            {loading
              ? "Cargando información..."
              : `Mostrando ${asignacionesFiltradas.length} de ${asignaciones.length} asignaciones registradas.`}

          </p>

          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">

            <ShieldCheck
              size={15}
              className="text-sky-600"
            />

            Gestión administrativa global

          </div>

        </div>

      </section>

      {/* ========================================== */}
      {/* MODAL DE REGISTRO Y EDICIÓN                */}
      {/* ========================================== */}

      {(modal === "create" || modal === "edit") && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
          onKeyDown={(event) => {
            if (event.key === "Escape" && !saving) {
              cerrarModal();
            }
          }}
        >

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="assignment-modal-title"
            className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          >

            {/* Encabezado del modal */}
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-100 px-6 py-5">

              <div className="flex items-center gap-3">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600">

                  {editingId === null ? (
                    <ClipboardCheck size={25} />
                  ) : (
                    <Pencil size={23} />
                  )}

                </div>

                <div>

                  <h2
                    id="assignment-modal-title"
                    className="text-xl font-bold text-[#0C2D57]"
                  >
                    {editingId === null
                      ? "Nueva asignación"
                      : "Editar asignación"}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {editingId === null
                      ? "Otorgá acceso administrativo a un aeropuerto."
                      : "Modificá los datos de la asignación seleccionada."}
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={cerrarModal}
                disabled={saving}
                aria-label="Cerrar modal"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={22} />
              </button>

            </div>

            {/* Formulario */}
            <form
              onSubmit={saveAssignment}
              className="flex min-h-0 flex-1 flex-col"
            >

              {/* Contenido desplazable */}
              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">

                <fieldset
                  disabled={saving}
                  className="space-y-5 disabled:opacity-70"
                >

                  {/* Asignación original */}
                  {editingId !== null &&
                    selectedAssignment && (

                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Asignación actual
                        </p>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                          <div className="flex items-center gap-3">

                            <div className="rounded-lg bg-white p-2 text-sky-600">
                              <UserRound size={20} />
                            </div>

                            <div>

                              <p className="text-xs text-slate-500">
                                Administrador
                              </p>

                              <p className="text-sm font-semibold text-slate-700">
                                {selectedAssignment.usuario?.nombreCompleto}
                              </p>

                            </div>

                          </div>

                          <div className="flex items-center gap-3">

                            <div className="rounded-lg bg-white p-2 text-sky-600">
                              <Building2 size={20} />
                            </div>

                            <div>

                              <p className="text-xs text-slate-500">
                                Aeropuerto
                              </p>

                              <p className="text-sm font-semibold text-slate-700">
                                {selectedAssignment.aeropuerto?.codigoIata}
                                {" - "}
                                {selectedAssignment.aeropuerto?.nombre}
                              </p>

                            </div>

                          </div>

                        </div>

                      </div>

                    )}

                  {/* Selección del administrador */}
                  <div>

                    <label
                      htmlFor="assignment-admin"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Administrador de aeropuerto

                      <span className="ml-1 text-red-500">
                        *
                      </span>

                    </label>

                    <div className="relative">

                      <UserRound
                        size={19}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <select
                        id="assignment-admin"
                        value={form.usuarioId}
                        onChange={(event) =>
                          updateForm(
                            "usuarioId",
                            event.target.value
                          )
                        }
                        required
                        autoFocus
                        className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                      >

                        <option value="">
                          Seleccioná un administrador
                        </option>

                        {administradoresDisponibles.map(
                          (administrador) => (

                            <option
                              key={administrador.id}
                              value={String(administrador.id)}
                              disabled={
                                administrador.estado !== "ACTIVO"
                              }
                            >
                              {administrador.nombreCompleto}

                              {administrador.estado === "INACTIVO"
                                ? " (Inactivo)"
                                : ""}
                            </option>

                          )
                        )}

                      </select>

                    </div>

                    <p className="mt-2 text-xs text-slate-500">
                      Solo se pueden otorgar asignaciones a
                      administradores activos.
                    </p>

                    {administradoresActivos.length === 0 && (

                      <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">

                        <AlertCircle
                          size={18}
                          className="shrink-0"
                        />

                        No existen administradores activos
                        disponibles para recibir asignaciones.

                      </div>

                    )}

                  </div>

                  {/* Información del administrador seleccionado */}
                  {administradorSeleccionado && (

                    <div className="rounded-xl border border-sky-100 bg-sky-50/50 p-4">

                      <div className="flex flex-wrap items-center justify-between gap-3">

                        <div className="flex items-center gap-3">

                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600">

                            <UserRound size={22} />

                          </div>

                          <div>

                            <p className="text-sm font-semibold text-[#0C2D57]">
                              {administradorSeleccionado.nombreCompleto}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {administradorSeleccionado.correo}
                            </p>

                          </div>

                        </div>

                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${administradorSeleccionado.estado === "ACTIVO"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-slate-100 text-slate-600"
                            }`}
                        >
                          {administradorSeleccionado.estado === "ACTIVO"
                            ? "Activo"
                            : "Inactivo"}
                        </span>

                      </div>

                      <div className="mt-4 border-t border-sky-100 pt-4">

                        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Aeropuertos asignados actualmente
                          {" "}
                          ({asignacionesAdministradorSeleccionado.length})
                        </p>

                        {asignacionesAdministradorSeleccionado.length === 0 ? (

                          <div className="flex items-center gap-2 text-sm text-slate-500">

                            <UserRoundX size={17} />

                            Este administrador todavía no tiene
                            aeropuertos asignados.

                          </div>

                        ) : (

                          <div className="flex flex-wrap gap-2">

                            {asignacionesAdministradorSeleccionado.map(
                              (asignacion) => (

                                <span
                                  key={asignacion.id}
                                  title={asignacion.aeropuerto?.nombre}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-sky-200 bg-white px-3 py-1.5 text-xs font-semibold text-sky-700"
                                >

                                  <Building2 size={14} />

                                  {asignacion.aeropuerto?.codigoIata || "—"}

                                  {Number(asignacion.id) ===
                                    Number(editingId) && (

                                      <span className="font-normal text-slate-500">
                                        (Actual)
                                      </span>

                                    )}

                                </span>

                              )
                            )}

                          </div>

                        )}

                      </div>

                    </div>

                  )}

                  {/* Advertencia de administrador inactivo */}
                  {administradorSeleccionado?.estado ===
                    "INACTIVO" && (

                      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">

                        <AlertCircle
                          size={21}
                          className="shrink-0 text-amber-600"
                        />

                        <div>

                          <p className="text-sm font-semibold text-amber-800">
                            Administrador inactivo
                          </p>

                          <p className="mt-1 text-sm text-amber-700">
                            No se pueden otorgar nuevos accesos
                            a este administrador mientras
                            permanezca inactivo. Podés transferir
                            la asignación a otro administrador
                            activo.
                          </p>

                        </div>

                      </div>

                    )}

                  {/* Selección del aeropuerto */}
                  <div>

                    <label
                      htmlFor="assignment-airport"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Aeropuerto

                      <span className="ml-1 text-red-500">
                        *
                      </span>

                    </label>

                    <div className="relative">

                      <Building2
                        size={19}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <select
                        id="assignment-airport"
                        value={form.aeropuertoId}
                        onChange={(event) =>
                          updateForm(
                            "aeropuertoId",
                            event.target.value
                          )
                        }
                        disabled={
                          !form.usuarioId ||
                          administradorSeleccionado?.estado !== "ACTIVO"
                        }
                        required
                        className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                      >

                        <option value="">
                          {form.usuarioId
                            ? "Seleccioná un aeropuerto"
                            : "Seleccioná primero un administrador"}
                        </option>

                        {aeropuertosDisponibles.map(
                          (aeropuerto) => (

                            <option
                              key={aeropuerto.id}
                              value={String(aeropuerto.id)}
                            >
                              {aeropuerto.codigoIata}
                              {" - "}
                              {aeropuerto.nombre}
                            </option>

                          )
                        )}

                      </select>

                    </div>

                    <p className="mt-2 text-xs text-slate-500">
                      Los aeropuertos que ya están asignados
                      al administrador no se muestran como
                      disponibles, excepto el de la asignación
                      que se está editando.
                    </p>

                    {form.usuarioId &&
                      administradorSeleccionado?.estado === "ACTIVO" &&
                      aeropuertosDisponibles.length === 0 && (

                        <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">

                          <AlertCircle
                            size={18}
                            className="shrink-0"
                          />

                          No existen aeropuertos disponibles
                          para este administrador.

                        </div>

                      )}

                  </div>

                  {/* Información del aeropuerto seleccionado */}
                  {aeropuertoSeleccionado && (

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600">

                          <Building2 size={23} />

                        </div>

                        <div className="flex-1">

                          <p className="text-sm font-semibold text-[#0C2D57]">
                            {aeropuertoSeleccionado.nombre}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {aeropuertoSeleccionado.ciudad}
                            {", "}
                            {aeropuertoSeleccionado.pais}
                          </p>

                        </div>

                        <span className="rounded-lg border border-sky-200 bg-white px-3 py-1.5 text-sm font-bold text-sky-700">
                          {aeropuertoSeleccionado.codigoIata}
                        </span>

                      </div>

                      <div className="mt-3 border-t border-slate-200 pt-3">

                        <p className="text-xs font-medium text-slate-500">
                          Dirección
                        </p>

                        <p className="mt-1 text-sm text-slate-700">
                          {aeropuertoSeleccionado.direccion || "—"}
                        </p>

                      </div>

                    </div>

                  )}

                  {/* Advertencia de asignación duplicada */}
                  {asignacionDuplicada && (

                    <div
                      role="alert"
                      className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
                    >

                      <AlertCircle
                        size={20}
                        className="shrink-0 text-red-600"
                      />

                      <p className="text-sm text-red-700">
                        El administrador seleccionado ya tiene
                        asignado este aeropuerto.
                      </p>

                    </div>

                  )}

                  {/* Información sobre los accesos */}
                  {editingId === null ? (

                    <div className="flex items-start gap-3 rounded-xl border border-sky-200 bg-sky-50 p-4">

                      <ShieldCheck
                        size={22}
                        className="shrink-0 text-sky-600"
                      />

                      <div>

                        <p className="text-sm font-semibold text-sky-800">
                          Otorgamiento de acceso administrativo
                        </p>

                        <p className="mt-1 text-sm text-sky-700">
                          Al registrar esta asignación, el
                          administrador podrá acceder a las
                          funcionalidades autorizadas del
                          aeropuerto seleccionado.
                        </p>

                      </div>

                    </div>

                  ) : hayCambios ? (

                    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">

                      <ShieldAlert
                        size={22}
                        className="shrink-0 text-amber-600"
                      />

                      <div>

                        <p className="text-sm font-semibold text-amber-800">
                          Modificación de accesos administrativos
                        </p>

                        {cambiaAdministrador && (

                          <p className="mt-2 text-sm text-amber-700">
                            El administrador original perderá
                            el acceso correspondiente a esta
                            asignación.
                          </p>

                        )}

                        {cambiaAeropuerto && (

                          <p className="mt-2 text-sm text-amber-700">
                            Se retirará el acceso asociado al
                            aeropuerto original y se otorgará
                            el acceso al nuevo aeropuerto
                            seleccionado.
                          </p>

                        )}

                        <p className="mt-2 text-xs text-amber-700">
                          Las demás asignaciones existentes no
                          serán modificadas.
                        </p>

                      </div>

                    </div>

                  ) : (

                    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">

                      <AlertCircle size={18} />

                      Todavía no se han realizado cambios.

                    </div>

                  )}

                </fieldset>

                {/* Mensaje de error del formulario */}
                {error && (

                  <div
                    role="alert"
                    className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
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

              {/* Pie del modal */}
              <div className="flex shrink-0 flex-wrap items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4">

                <button
                  type="button"
                  onClick={cerrarModal}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={!puedeGuardar}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {saving ? (

                    <LoaderCircle
                      size={18}
                      className="animate-spin"
                    />

                  ) : (

                    <Save size={18} />

                  )}

                  {saving
                    ? "Guardando..."
                    : editingId === null
                      ? "Registrar asignación"
                      : "Guardar cambios"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* Pendiente de implementación */}

      {/* ========================================== */}
      {/* MODAL DE DETALLES                          */}
      {/* ========================================== */}

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
            aria-labelledby="assignment-details-title"
            className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          >

            {/* Encabezado */}
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-100 px-6 py-5">

              <div className="flex items-center gap-3">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600">

                  <Eye size={25} />

                </div>

                <div>

                  <h2
                    id="assignment-details-title"
                    className="text-xl font-bold text-[#0C2D57]"
                  >
                    Detalles de la asignación
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Información del acceso administrativo.
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={cerrarModal}
                autoFocus
                aria-label="Cerrar detalles"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >

                <X size={22} />

              </button>

            </div>

            {/* Contenido del modal */}
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">

              {detailLoading ? (

                /* Indicador de carga */
                <div className="flex min-h-[260px] flex-col items-center justify-center gap-3">

                  <LoaderCircle
                    size={36}
                    className="animate-spin text-sky-500"
                  />

                  <p className="text-sm text-slate-500">
                    Consultando información de la asignación...
                  </p>

                </div>

              ) : error ? (

                /* Mensaje de error */
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
                >

                  <AlertCircle
                    size={22}
                    className="shrink-0 text-red-600"
                  />

                  <div>

                    <h3 className="text-sm font-semibold text-red-800">
                      No se pudieron obtener los detalles
                    </h3>

                    <p className="mt-1 text-sm text-red-700">
                      {error}
                    </p>

                  </div>

                </div>

              ) : detalleDisponible ? (

                <div className="space-y-5">

                  {/* ========================================== */}
                  {/* ESTADO DEL ACCESO                          */}
                  {/* ========================================== */}

                  <div
                    className={`rounded-xl border p-4 ${administradorDetalleActivo
                      ? "border-sky-200 bg-sky-50"
                      : "border-amber-200 bg-amber-50"
                      }`}
                  >

                    <div className="flex flex-wrap items-center justify-between gap-3">

                      <div className="flex items-center gap-3">

                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${administradorDetalleActivo
                            ? "bg-sky-100 text-sky-600"
                            : "bg-amber-100 text-amber-600"
                            }`}
                        >

                          {administradorDetalleActivo ? (

                            <ShieldCheck size={25} />

                          ) : (

                            <ShieldAlert size={25} />

                          )}

                        </div>

                        <div>

                          <h3
                            className={`text-sm font-semibold ${administradorDetalleActivo
                              ? "text-sky-800"
                              : "text-amber-800"
                              }`}
                          >

                            {administradorDetalleActivo
                              ? "Acceso administrativo autorizado"
                              : administradorDetalleInactivo
                                ? "Acceso administrativo suspendido"
                                : "Estado de acceso no disponible"}

                          </h3>

                          <p className="mt-1 text-xs text-slate-500">
                            Asignación #{selectedAssignment.id}
                          </p>

                        </div>

                      </div>

                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${administradorDetalleActivo
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : administradorDetalleInactivo
                            ? "border-slate-200 bg-slate-100 text-slate-600"
                            : "border-amber-200 bg-amber-50 text-amber-700"
                          }`}
                      >

                        <span
                          className={`h-2 w-2 rounded-full ${administradorDetalleActivo
                            ? "bg-emerald-500"
                            : administradorDetalleInactivo
                              ? "bg-slate-400"
                              : "bg-amber-500"
                            }`}
                        />

                        {administradorDetalleActivo
                          ? "Administrador activo"
                          : administradorDetalleInactivo
                            ? "Administrador inactivo"
                            : "Estado desconocido"}

                      </span>

                    </div>

                    {administradorDetalleInactivo && (

                      <p className="mt-3 border-t border-amber-200 pt-3 text-sm text-amber-700">
                        La asignación continúa registrada, pero
                        el administrador no puede utilizar este
                        acceso mientras su cuenta permanezca
                        inactiva.
                      </p>

                    )}

                  </div>

                  {/* ========================================== */}
                  {/* INFORMACIÓN DEL ADMINISTRADOR             */}
                  {/* ========================================== */}

                  <section className="overflow-hidden rounded-xl border border-slate-200">

                    <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3">

                      <div className="rounded-lg bg-sky-100 p-2 text-sky-600">

                        <UserRound size={20} />

                      </div>

                      <h3 className="text-sm font-semibold text-[#0C2D57]">
                        Información del administrador
                      </h3>

                    </div>

                    <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2">

                      <div>

                        <p className="text-xs font-medium text-slate-500">
                          Nombre completo
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {selectedAssignment.usuario.nombreCompleto}
                        </p>

                      </div>

                      <div>

                        <p className="text-xs font-medium text-slate-500">
                          Identificador del usuario
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          #{selectedAssignment.usuarioId}
                        </p>

                      </div>

                      <div>

                        <p className="text-xs font-medium text-slate-500">
                          Correo electrónico
                        </p>

                        <p className="mt-1 break-all text-sm font-medium text-slate-700">
                          {selectedAssignment.usuario.correo || "—"}
                        </p>

                      </div>

                      <div>

                        <p className="text-xs font-medium text-slate-500">
                          Rol del usuario
                        </p>

                        <p className="mt-1 text-sm font-medium text-slate-700">
                          {selectedAssignment.usuario.rol?.nombre ||
                            "Administrador de aeropuerto"}
                        </p>

                      </div>

                      <div>

                        <p className="text-xs font-medium text-slate-500">
                          Código del rol
                        </p>

                        <span className="mt-1 inline-flex rounded-md border border-sky-100 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700">

                          {selectedAssignment.usuario.rol?.codigo || "—"}

                        </span>

                      </div>

                      <div>

                        <p className="text-xs font-medium text-slate-500">
                          Estado de la cuenta
                        </p>

                        <p
                          className={`mt-1 text-sm font-semibold ${administradorDetalleActivo
                            ? "text-emerald-600"
                            : "text-slate-500"
                            }`}
                        >

                          {administradorDetalleActivo
                            ? "Activo"
                            : administradorDetalleInactivo
                              ? "Inactivo"
                              : "Desconocido"}

                        </p>

                      </div>

                    </div>

                  </section>

                  {/* ========================================== */}
                  {/* INFORMACIÓN DEL AEROPUERTO                */}
                  {/* ========================================== */}

                  <section className="overflow-hidden rounded-xl border border-slate-200">

                    <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3">

                      <div className="flex items-center gap-3">

                        <div className="rounded-lg bg-sky-100 p-2 text-sky-600">

                          <Building2 size={20} />

                        </div>

                        <h3 className="text-sm font-semibold text-[#0C2D57]">
                          Información del aeropuerto
                        </h3>

                      </div>

                      <span className="rounded-lg border border-sky-200 bg-white px-3 py-1.5 text-sm font-bold text-sky-700">

                        {selectedAssignment.aeropuerto.codigoIata}

                      </span>

                    </div>

                    <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2">

                      <div className="sm:col-span-2">

                        <p className="text-xs font-medium text-slate-500">
                          Nombre del aeropuerto
                        </p>

                        <p className="mt-1 text-base font-semibold text-[#0C2D57]">
                          {selectedAssignment.aeropuerto.nombre}
                        </p>

                      </div>

                      <div>

                        <p className="text-xs font-medium text-slate-500">
                          Identificador del aeropuerto
                        </p>

                        <p className="mt-1 text-sm font-medium text-slate-700">
                          #{selectedAssignment.aeropuertoId}
                        </p>

                      </div>

                      <div>

                        <p className="text-xs font-medium text-slate-500">
                          Código IATA
                        </p>

                        <p className="mt-1 text-sm font-semibold text-sky-700">
                          {selectedAssignment.aeropuerto.codigoIata}
                        </p>

                      </div>

                      <div>

                        <p className="text-xs font-medium text-slate-500">
                          País
                        </p>

                        <p className="mt-1 text-sm font-medium text-slate-700">
                          {selectedAssignment.aeropuerto.pais || "—"}
                        </p>

                      </div>

                      <div>

                        <p className="text-xs font-medium text-slate-500">
                          Ciudad
                        </p>

                        <p className="mt-1 text-sm font-medium text-slate-700">
                          {selectedAssignment.aeropuerto.ciudad || "—"}
                        </p>

                      </div>

                      <div className="sm:col-span-2">

                        <p className="text-xs font-medium text-slate-500">
                          Dirección
                        </p>

                        <p className="mt-1 text-sm font-medium text-slate-700">
                          {selectedAssignment.aeropuerto.direccion || "—"}
                        </p>

                      </div>

                    </div>

                  </section>

                  {/* ========================================== */}
                  {/* OTROS AEROPUERTOS ASIGNADOS               */}
                  {/* ========================================== */}

                  <section className="overflow-hidden rounded-xl border border-slate-200">

                    <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3">

                      <div className="flex items-center gap-3">

                        <div className="rounded-lg bg-sky-100 p-2 text-sky-600">

                          <Building2 size={20} />

                        </div>

                        <div>

                          <h3 className="text-sm font-semibold text-[#0C2D57]">
                            Aeropuertos asignados al administrador
                          </h3>

                          <p className="mt-1 text-xs text-slate-500">
                            Según la información cargada en el directorio.
                          </p>

                        </div>

                      </div>

                      <span className="rounded-full bg-sky-100 px-3 py-1 text-sm font-bold text-sky-700">

                        {asignacionesAdministradorDetalle.length}

                      </span>

                    </div>

                    <div className="max-h-[240px] divide-y divide-slate-100 overflow-y-auto">

                      {asignacionesAdministradorDetalle.map(
                        (asignacion) => {

                          const esActual =
                            Number(asignacion.id) ===
                            Number(selectedAssignment.id);

                          return (

                            <div
                              key={asignacion.id}
                              className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3 ${esActual ? "bg-sky-50/60" : ""
                                }`}
                            >

                              <div className="flex items-center gap-3">

                                <div className="flex h-10 min-w-[48px] items-center justify-center rounded-lg border border-sky-100 bg-sky-50 px-2 text-xs font-bold text-sky-700">

                                  {asignacion.aeropuerto?.codigoIata || "—"}

                                </div>

                                <div>

                                  <p className="text-sm font-semibold text-slate-700">
                                    {asignacion.aeropuerto?.nombre ||
                                      "Aeropuerto no disponible"}
                                  </p>

                                  <p className="mt-1 text-xs text-slate-500">

                                    {[
                                      asignacion.aeropuerto?.ciudad,
                                      asignacion.aeropuerto?.pais,
                                    ]
                                      .filter(Boolean)
                                      .join(", ") || "—"}

                                  </p>

                                </div>

                              </div>

                              {esActual && (

                                <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-white px-2.5 py-1 text-xs font-semibold text-sky-700">

                                  <CheckCircle2 size={13} />

                                  Asignación actual

                                </span>

                              )}

                            </div>

                          );

                        }
                      )}

                    </div>

                  </section>

                  {/* Información adicional */}
                  <div className="flex items-start gap-3 rounded-xl border border-sky-100 bg-sky-50 p-4">

                    <ShieldCheck
                      size={21}
                      className="shrink-0 text-sky-600"
                    />

                    <div>

                      <p className="text-sm font-semibold text-sky-800">
                        Alcance del acceso administrativo
                      </p>

                      <p className="mt-1 text-sm text-sky-700">
                        Esta asignación establece una relación
                        entre el administrador y el aeropuerto.
                        Las operaciones disponibles dependen
                        del rol, el estado de la cuenta y el
                        aeropuerto activo de la sesión.
                      </p>

                    </div>

                  </div>

                </div>

              ) : (

                /* Información no disponible */
                <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 text-center">

                  <AlertCircle
                    size={34}
                    className="text-slate-400"
                  />

                  <p className="text-sm text-slate-500">
                    No hay información disponible
                    para esta asignación.
                  </p>

                </div>

              )}

            </div>

            {/* Pie del modal */}
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4">

              <button
                type="button"
                onClick={cerrarModal}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
              >
                Cerrar
              </button>

              {puedeEditar && detalleDisponible && (

                <button
                  type="button"
                  onClick={() =>
                    openEdit(selectedAssignment)
                  }
                  disabled={saving || loading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  <Pencil size={17} />

                  Editar asignación

                </button>

              )}

            </div>

          </div>

        </div>

      )}

      {/* ========================================== */}
      {/* MODAL DE REVOCACIÓN                        */}
      {/* ========================================== */}

      {modal === "delete" && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
          onKeyDown={(event) => {
            if (event.key === "Escape" && !saving) {
              cerrarModal();
            }
          }}
        >

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="assignment-revoke-title"
            className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          >

            {/* Encabezado */}
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-100 px-6 py-5">

              <div className="flex items-center gap-3">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">

                  <Unlink size={25} />

                </div>

                <div>

                  <h2
                    id="assignment-revoke-title"
                    className="text-xl font-bold text-[#0C2D57]"
                  >
                    Revocar asignación
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Retirar un acceso administrativo.
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={cerrarModal}
                disabled={saving}
                autoFocus
                aria-label="Cerrar modal de revocación"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
              >

                <X size={22} />

              </button>

            </div>

            {/* Contenido */}
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">

              {detailLoading ? (

                /* Indicador de carga */
                <div className="flex min-h-[260px] flex-col items-center justify-center gap-3">

                  <LoaderCircle
                    size={36}
                    className="animate-spin text-sky-500"
                  />

                  <p className="text-sm text-slate-500">
                    Verificando información de la asignación...
                  </p>

                </div>

              ) : selectedAssignment?.usuario &&
                selectedAssignment?.aeropuerto ? (

                <div className="space-y-5">

                  <p className="text-sm leading-relaxed text-slate-600">
                    ¿Estás seguro de que deseás revocar
                    la siguiente asignación?
                  </p>

                  {/* ========================================== */}
                  {/* INFORMACIÓN DE LA ASIGNACIÓN               */}
                  {/* ========================================== */}

                  <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">

                    <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">

                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Asignación seleccionada
                      </p>

                      <span className="rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
                        #{selectedAssignment.id}
                      </span>

                    </div>

                    {/* Información del administrador */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600">

                          <UserRound size={23} />

                        </div>

                        <div>

                          <p className="text-xs font-medium text-slate-500">
                            Administrador
                          </p>

                          <p className="mt-1 text-sm font-semibold text-[#0C2D57]">
                            {selectedAssignment.usuario.nombreCompleto}
                          </p>

                          <p className="mt-1 break-all text-xs text-slate-500">
                            {selectedAssignment.usuario.correo || "—"}
                          </p>

                        </div>

                      </div>

                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${administradorDetalleActivo
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : administradorDetalleInactivo
                            ? "border-slate-200 bg-slate-100 text-slate-600"
                            : "border-amber-200 bg-amber-50 text-amber-700"
                          }`}
                      >

                        <span
                          className={`h-2 w-2 rounded-full ${administradorDetalleActivo
                            ? "bg-emerald-500"
                            : administradorDetalleInactivo
                              ? "bg-slate-400"
                              : "bg-amber-500"
                            }`}
                        />

                        {administradorDetalleActivo
                          ? "Activo"
                          : administradorDetalleInactivo
                            ? "Inactivo"
                            : "Desconocido"}

                      </span>

                    </div>

                    {/* Información del aeropuerto */}
                    <div className="flex flex-wrap items-center justify-between gap-3 p-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600">

                          <Building2 size={23} />

                        </div>

                        <div>

                          <p className="text-xs font-medium text-slate-500">
                            Aeropuerto
                          </p>

                          <p className="mt-1 text-sm font-semibold text-[#0C2D57]">
                            {selectedAssignment.aeropuerto.nombre}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">

                            {[
                              selectedAssignment.aeropuerto.ciudad,
                              selectedAssignment.aeropuerto.pais,
                            ]
                              .filter(Boolean)
                              .join(", ") || "—"}

                          </p>

                        </div>

                      </div>

                      <span className="rounded-lg border border-sky-200 bg-white px-3 py-1.5 text-sm font-bold text-sky-700">

                        {selectedAssignment.aeropuerto.codigoIata}

                      </span>

                    </div>

                  </div>

                  {/* ========================================== */}
                  {/* CONSECUENCIAS DE LA REVOCACIÓN             */}
                  {/* ========================================== */}

                  <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">

                    <ShieldAlert
                      size={24}
                      className="mt-0.5 shrink-0 text-red-600"
                    />

                    <div>

                      <h3 className="text-sm font-semibold text-red-800">
                        Consecuencias de la revocación
                      </h3>

                      <ul className="mt-3 list-disc space-y-2 pl-4 text-sm text-red-700">

                        <li>
                          Se eliminará la asignación administrativa
                          correspondiente a este aeropuerto.
                        </li>

                        <li>
                          El administrador perderá la autorización
                          para realizar operaciones en este aeropuerto.
                        </li>

                        <li>
                          Las demás asignaciones del administrador
                          no serán modificadas.
                        </li>

                        <li>
                          Para recuperar este acceso será necesario
                          registrar una nueva asignación.
                        </li>

                      </ul>

                    </div>

                  </div>

                  {/* ========================================== */}
                  {/* ASIGNACIONES RESTANTES                     */}
                  {/* ========================================== */}

                  {esUltimaAsignacion ? (

                    /* Advertencia de última asignación */
                    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">

                      <AlertCircle
                        size={23}
                        className="mt-0.5 shrink-0 text-amber-600"
                      />

                      <div>

                        <h3 className="text-sm font-semibold text-amber-800">
                          Última asignación del administrador
                        </h3>

                        <p className="mt-2 text-sm text-amber-700">
                          Según la información del directorio,
                          esta es la única asignación registrada
                          para el administrador.
                        </p>

                        <p className="mt-2 text-sm text-amber-700">
                          Si continuás, el administrador quedará
                          sin aeropuertos asignados y no podrá
                          realizar operaciones que requieran
                          un aeropuerto autorizado.
                        </p>

                        <p className="mt-2 text-xs font-medium text-amber-800">
                          La cuenta del usuario conservará su
                          estado actual.
                        </p>

                      </div>

                    </div>

                  ) : (

                    /* Aeropuertos que conservará */
                    <section className="overflow-hidden rounded-xl border border-slate-200">

                      <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3">

                        <div className="flex items-center gap-2">

                          <Building2
                            size={20}
                            className="shrink-0 text-sky-600"
                          />

                          <div>

                            <h3 className="text-sm font-semibold text-[#0C2D57]">
                              Asignaciones restantes
                            </h3>

                            <p className="mt-1 text-xs text-slate-500">
                              Según la información del directorio.
                            </p>

                          </div>

                        </div>

                        <span className="rounded-full bg-sky-100 px-3 py-1 text-sm font-bold text-sky-700">

                          {asignacionesRestantes.length}

                        </span>

                      </div>

                      <div className="max-h-[200px] divide-y divide-slate-100 overflow-y-auto">

                        {asignacionesRestantes.map(
                          (asignacion) => (

                            <div
                              key={asignacion.id}
                              className="flex items-center gap-3 px-4 py-3"
                            >

                              <div className="flex h-9 min-w-[45px] items-center justify-center rounded-lg border border-sky-100 bg-sky-50 px-2 text-xs font-bold text-sky-700">

                                {asignacion.aeropuerto?.codigoIata || "—"}

                              </div>

                              <div className="flex-1">

                                <p className="text-sm font-medium text-slate-700">
                                  {asignacion.aeropuerto?.nombre ||
                                    "Aeropuerto no disponible"}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">

                                  {[
                                    asignacion.aeropuerto?.ciudad,
                                    asignacion.aeropuerto?.pais,
                                  ]
                                    .filter(Boolean)
                                    .join(", ") || "—"}

                                </p>

                              </div>

                              <CheckCircle2
                                size={18}
                                className="shrink-0 text-emerald-500"
                              />

                            </div>

                          )
                        )}

                      </div>

                    </section>

                  )}

                  {/* Información sobre los registros conservados */}
                  <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">

                    <CheckCircle2
                      size={21}
                      className="mt-0.5 shrink-0 text-emerald-600"
                    />

                    <div>

                      <p className="text-sm font-semibold text-slate-700">
                        Registros que se conservarán
                      </p>

                      <p className="mt-1 text-sm text-slate-600">
                        Esta operación no elimina la cuenta
                        del administrador, el aeropuerto ni
                        sus registros operativos asociados.
                      </p>

                    </div>

                  </div>

                </div>

              ) : !error ? (

                /* Información no disponible */
                <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 text-center">

                  <AlertCircle
                    size={34}
                    className="text-slate-400"
                  />

                  <p className="text-sm text-slate-500">
                    No se pudo verificar la información
                    de la asignación seleccionada.
                  </p>

                </div>

              ) : null}

              {/* Mensaje de error */}
              {error && (

                <div
                  role="alert"
                  className="mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
                >

                  <AlertCircle
                    size={22}
                    className="shrink-0 text-red-600"
                  />

                  <div>

                    <p className="text-sm font-semibold text-red-800">
                      No se pudo completar la operación
                    </p>

                    <p className="mt-1 text-sm text-red-700">
                      {error}
                    </p>

                    <p className="mt-2 text-xs text-red-700">
                      Cerrá el modal y actualizá el directorio
                      antes de volver a intentarlo.
                    </p>

                  </div>

                </div>

              )}

            </div>

            {/* Pie del modal */}
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4">

              <button
                type="button"
                onClick={cerrarModal}
                disabled={saving}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={confirmarRevocacion}
                disabled={!puedeConfirmarRevocacion}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >

                {saving ? (

                  <LoaderCircle
                    size={18}
                    className="animate-spin"
                  />

                ) : (

                  <Unlink size={18} />

                )}

                {saving
                  ? "Revocando..."
                  : "Revocar asignación"}

              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}