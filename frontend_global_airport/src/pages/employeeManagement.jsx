import { useEffect, useMemo, useState } from "react";

import {
    Users,
    UserRoundPlus,
    UserRoundCheck,
    UserRoundX,
    Building2,
    BriefcaseBusiness,
    Search,
    RotateCcw,
    Pencil,
    Eye,
    EyeOff,
    X,
    Save,
    LoaderCircle,
    AlertCircle,
    CheckCircle2,
    ShieldCheck,
} from "lucide-react";

import { empleadosService } from "../services/empleadosService";
import { aeropuertosService } from "../services/aeropuertosService";

import { useAuth } from "../context/AuthContext";

import PageHeader from "../components/management/PageHeader";
import StatCard from "../components/management/StatCard";

import { tienePermiso } from "../config/permissions";

// ==========================================
// FORMULARIO INICIAL
// ==========================================

const initialForm = {
    nombreCompleto: "",
    tipoDocumento: "CEDULA",
    numeroDocumento: "",
    fechaNacimiento: "",
    nacionalidad: "",
    correo: "",
    telefono: "",
    direccion: "",

    password: "",
    confirmPassword: "",

    aeropuertoId: "",
    numeroEmpleado: "",
    puesto: "",
};


// ==========================================
// FUNCIONES AUXILIARES
// ==========================================

function obtenerMensajeError(error) {
    return (
        error?.message ||
        "Ocurrió un error al comunicarse con el servidor."
    );
}

function obtenerIniciales(nombre = "") {
    return (
        String(nombre || "")
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((palabra) => palabra[0].toUpperCase())
            .join("") || "EM"
    );
}

function formatearFecha(fecha) {
    if (!fecha) return "—";

    const valor = String(fecha).slice(0, 10);

    const fechaLocal = new Date(`${valor}T12:00:00`);

    if (Number.isNaN(fechaLocal.getTime())) {
        return "—";
    }

    return fechaLocal.toLocaleDateString("es-CR");
}


// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export default function EmployeeManagement() {

    // ========================================
    // AUTENTICACIÓN Y PERMISOS
    // ========================================

    const {
        rol,
        aeropuertoActivo,
    } = useAuth();

    const esAdministradorGeneral =
        rol === "ADMIN_GENERAL";

    const esAdministradorAeropuerto =
        rol === "ADMIN_AEROPUERTO";

    // ========================================
    // CONTEXTO OPERATIVO
    // ========================================

    const aeropuertoActivoId =
        aeropuertoActivo?.id ?? null;

    const tieneContextoOperativo =
        esAdministradorGeneral ||
        (
            esAdministradorAeropuerto &&
            Number.isSafeInteger(aeropuertoActivoId) &&
            aeropuertoActivoId > 0
        );

    // ========================================
    // PERMISOS
    // ========================================

    const puedeConsultar =
        tieneContextoOperativo &&
        tienePermiso(rol, "empleados", "consultar");

    const puedeCrear =
        tieneContextoOperativo &&
        tienePermiso(rol, "empleados", "crear");

    const puedeEditar =
        tieneContextoOperativo &&
        tienePermiso(rol, "empleados", "editar");

    const puedeCambiarEstado =
        tieneContextoOperativo &&
        tienePermiso(rol, "empleados", "cambiarEstado");

    const puedeTrasladar =
        tieneContextoOperativo &&
        tienePermiso(rol, "empleados", "trasladar");

    const puedeCambiarPassword =
        tieneContextoOperativo &&
        tienePermiso(rol, "empleados", "cambiarPassword");
    // ========================================
    // ESTADOS DE DATOS
    // ========================================

    const [empleados, setEmpleados] = useState([]);

    const [aeropuertos, setAeropuertos] = useState([]);

    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    const [detailLoading, setDetailLoading] =
        useState(false);


    // ========================================
    // ESTADOS DE FILTROS
    // ========================================

    const [search, setSearch] = useState("");

    const [airportFilter, setAirportFilter] =
        useState("todos");

    const [statusFilter, setStatusFilter] =
        useState("todos");

    const [positionFilter, setPositionFilter] =
        useState("todos");


    // ========================================
    // ESTADOS DE MODALES
    // ========================================

    const [modal, setModal] = useState(null);

    const [selectedEmployee, setSelectedEmployee] =
        useState(null);

    const [editingId, setEditingId] = useState(null);

    const [form, setForm] = useState(initialForm);

    const [showPassword, setShowPassword] =
        useState(false);

    const [
        showConfirmPassword,
        setShowConfirmPassword,
    ] = useState(false);


    // ========================================
    // ESTADOS DE MENSAJES
    // ========================================

    const [error, setError] = useState("");

    const [message, setMessage] = useState("");


    // ========================================
    // CONFIGURACIÓN DEL FORMULARIO
    // ========================================

    const esRegistro = editingId === null;

    const mostrarCamposPassword =
        esRegistro || puedeCambiarPassword;

    const fechaMaxima = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Costa_Rica",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date());

    const aeropuertoEditable =
        esRegistro
            ? esAdministradorGeneral
            : puedeTrasladar;


    // ========================================
    // INFORMACIÓN DEL EMPLEADO SELECCIONADO
    // ========================================

    const usuarioSeleccionado =
        selectedEmployee?.usuario || {};

    const aeropuertoSeleccionado =
        selectedEmployee?.aeropuerto || {};

    const empleadoActivo =
        usuarioSeleccionado.estado === "ACTIVO";

    // ========================================
    // CONFIGURACIÓN DEL CAMBIO DE ESTADO
    // ========================================

    const desactivandoEmpleado =
        modal === "deactivate";

    const configuracionEstado = desactivandoEmpleado
        ? {
            titulo: "Desactivar empleado",

            descripcion:
                "Confirme la desactivación de la cuenta del empleado.",

            pregunta:
                "¿Está seguro de que desea desactivar este empleado?",

            advertencia:
                "El empleado perderá el acceso al sistema. Su información personal, laboral y sus registros históricos se conservarán.",

            textoBoton: "Desactivar empleado",

            textoCargando: "Desactivando...",

            Icono: UserRoundX,

            colorIcono: "bg-red-100 text-red-600",

            colorAdvertencia:
                "border-red-200 bg-red-50 text-red-700",

            colorBoton:
                "bg-red-600 hover:bg-red-700",
        }
        : {
            titulo: "Reactivar empleado",

            descripcion:
                "Restablezca el acceso del empleado al sistema.",

            pregunta:
                "¿Está seguro de que desea reactivar este empleado?",

            advertencia:
                "El empleado recuperará el acceso al sistema con los permisos correspondientes a su rol y aeropuerto asignado.",

            textoBoton: "Reactivar empleado",

            textoCargando: "Reactivando...",

            Icono: UserRoundCheck,

            colorIcono:
                "bg-emerald-100 text-emerald-600",

            colorAdvertencia:
                "border-emerald-200 bg-emerald-50 text-emerald-700",

            colorBoton:
                "bg-emerald-600 hover:bg-emerald-700",
        };

    const IconoCambioEstado =
        configuracionEstado.Icono;

    // ========================================
    // CARGAR INFORMACIÓN
    // ========================================

    async function cargarDatos(mostrarCarga = true) {

        if (!puedeConsultar) {
            setEmpleados([]);
            setAeropuertos([]);
            setLoading(false);
            return;
        }

        if (
            esAdministradorAeropuerto &&
            !aeropuertoActivo?.id
        ) {
            setEmpleados([]);
            setAeropuertos([]);
            setError("No existe un aeropuerto activo.");
            setLoading(false);
            return;
        }

        try {

            if (mostrarCarga) {
                setLoading(true);
                setError("");
            }

            const empleadosData =
                await empleadosService.obtenerTodos();

            if (!Array.isArray(empleadosData)) {
                throw new Error(
                    "El servidor no devolvió una lista válida de empleados."
                );
            }

            let aeropuertosData = [];

            if (esAdministradorGeneral) {

                aeropuertosData =
                    await aeropuertosService.obtenerTodos();

                if (!Array.isArray(aeropuertosData)) {
                    throw new Error(
                        "El servidor no devolvió una lista válida de aeropuertos."
                    );
                }

            } else {

                aeropuertosData = [aeropuertoActivo];

            }

            setEmpleados(empleadosData);

            setAeropuertos(aeropuertosData);

        } catch (err) {

            setError(obtenerMensajeError(err));

        } finally {

            setLoading(false);

        }
    }


    // ========================================
    // CARGA INICIAL Y CAMBIO DE AEROPUERTO
    // ========================================

    useEffect(() => {

        let cancelado = false;

        async function cargarInicial() {

            setEmpleados([]);
            setAeropuertos([]);
            setError("");
            setMessage("");
            setLoading(true);

            setSearch("");
            setAirportFilter("todos");
            setStatusFilter("todos");
            setPositionFilter("todos");

            setModal(null);
            setSelectedEmployee(null);
            setEditingId(null);
            setForm(initialForm);

            try {

                if (!puedeConsultar) return;

                if (
                    esAdministradorAeropuerto &&
                    !aeropuertoActivo?.id
                ) {
                    throw new Error(
                        "No existe un aeropuerto activo."
                    );
                }

                const [
                    empleadosData,
                    aeropuertosData,
                ] = await Promise.all([

                    empleadosService.obtenerTodos(),

                    esAdministradorGeneral
                        ? aeropuertosService.obtenerTodos()
                        : Promise.resolve([aeropuertoActivo]),

                ]);

                if (!Array.isArray(empleadosData)) {
                    throw new Error(
                        "La lista de empleados no es válida."
                    );
                }

                if (!Array.isArray(aeropuertosData)) {
                    throw new Error(
                        "La lista de aeropuertos no es válida."
                    );
                }

                if (!cancelado) {
                    setEmpleados(empleadosData);
                    setAeropuertos(aeropuertosData);
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

        cargarInicial();

        return () => {
            cancelado = true;
        };

    }, [
        puedeConsultar,
        esAdministradorGeneral,
        esAdministradorAeropuerto,
        aeropuertoActivo,
    ]);


    // ========================================
    // ESTADÍSTICAS
    // ========================================

    const estadisticas = useMemo(() => {

        const activos = empleados.filter(
            (empleado) =>
                empleado.usuario?.estado === "ACTIVO"
        ).length;

        const inactivos = empleados.filter(
            (empleado) =>
                empleado.usuario?.estado === "INACTIVO"
        ).length;

        const aeropuertosConEmpleados = new Set(
            empleados
                .map((empleado) => empleado.aeropuertoId)
                .filter((id) => id != null)
        ).size;

        return {
            total: empleados.length,
            activos,
            inactivos,
            aeropuertos: aeropuertosConEmpleados,
        };

    }, [empleados]);


    // ========================================
    // PUESTOS DISPONIBLES
    // ========================================

    const puestosDisponibles = useMemo(() => {

        return [
            ...new Set(
                empleados
                    .map((empleado) => empleado.puesto)
                    .filter(Boolean)
            ),
        ].sort((a, b) =>
            a.localeCompare(b, "es")
        );

    }, [empleados]);


    // ========================================
    // FILTRAR EMPLEADOS
    // ========================================

    const empleadosFiltrados = useMemo(() => {

        const texto = search.trim().toLowerCase();

        return empleados.filter((empleado) => {

            const usuario = empleado.usuario || {};

            const aeropuerto = empleado.aeropuerto || {};

            const coincideBusqueda = [

                usuario.nombreCompleto,
                usuario.numeroDocumento,
                usuario.correo,
                usuario.telefono,

                empleado.numeroEmpleado,
                empleado.puesto,

                aeropuerto.nombre,
                aeropuerto.codigoIata,

            ].some((valor) =>
                String(valor ?? "")
                    .toLowerCase()
                    .includes(texto)
            );

            const coincideAeropuerto =
                airportFilter === "todos" ||
                String(empleado.aeropuertoId) ===
                airportFilter;

            const coincideEstado =
                statusFilter === "todos" ||
                usuario.estado === statusFilter;

            const coincidePuesto =
                positionFilter === "todos" ||
                empleado.puesto === positionFilter;

            return (
                coincideBusqueda &&
                coincideAeropuerto &&
                coincideEstado &&
                coincidePuesto
            );

        });

    }, [
        empleados,
        search,
        airportFilter,
        statusFilter,
        positionFilter,
    ]);


    // ========================================
    // LIMPIAR FILTROS
    // ========================================

    function limpiarFiltros() {

        setSearch("");

        setAirportFilter("todos");

        setStatusFilter("todos");

        setPositionFilter("todos");

    }


    // ========================================
    // ACTUALIZAR FORMULARIO
    // ========================================

    function updateForm(field, value) {

        setForm((current) => ({
            ...current,
            [field]: value,
        }));

    }

    // ========================================
    // GUARDAR EMPLEADO
    // ========================================

    async function saveEmployee(event) {
        event.preventDefault();

        if (saving) return;

        const registrando = editingId === null;

        setError("");
        setMessage("");

        // Validar permisos
        if (registrando && !puedeCrear) {
            setError("No tiene permisos para registrar empleados.");
            return;
        }

        if (!registrando && !puedeEditar) {
            setError("No tiene permisos para editar empleados.");
            return;
        }

        // Validar información personal
        if (
            !form.nombreCompleto.trim() ||
            !form.tipoDocumento ||
            !form.numeroDocumento.trim() ||
            !form.fechaNacimiento ||
            !form.nacionalidad.trim() ||
            !form.correo.trim()
        ) {
            setError("Debe completar los campos personales obligatorios.");
            return;
        }

        // Validar correo
        const correo = form.correo.trim().toLowerCase();

        const correoValido =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);

        if (!correoValido) {
            setError("Debe ingresar un correo electrónico válido.");
            return;
        }

        // Validar fecha de nacimiento
        const fechaNacimiento = new Date(
            `${form.fechaNacimiento}T00:00:00Z`
        );

        if (
            Number.isNaN(fechaNacimiento.getTime()) ||
            fechaNacimiento.toISOString().slice(0, 10) !==
            form.fechaNacimiento ||
            form.fechaNacimiento > fechaMaxima
        ) {
            setError("Debe ingresar una fecha de nacimiento válida.");
            return;
        }

        // Validar información laboral
        if (
            !form.numeroEmpleado.trim() ||
            !form.puesto.trim()
        ) {
            setError("Debe completar el número de empleado y el puesto.");
            return;
        }

        // Validar aeropuerto
        const aeropuertoId = esAdministradorAeropuerto
            ? Number(aeropuertoActivo?.id)
            : Number(form.aeropuertoId);

        if (
            !Number.isInteger(aeropuertoId) ||
            aeropuertoId <= 0
        ) {
            setError("Debe seleccionar un aeropuerto válido.");
            return;
        }

        const aeropuertoExiste = aeropuertos.some(
            (aeropuerto) =>
                Number(aeropuerto.id) === aeropuertoId
        );

        if (!aeropuertoExiste) {
            setError("El aeropuerto seleccionado no está disponible.");
            return;
        }

        // Validar contraseñas
        if (registrando || puedeCambiarPassword) {

            if (registrando && !form.password) {
                setError("Debe establecer una contraseña.");
                return;
            }

            if (form.password && form.password.length < 8) {
                setError("La contraseña debe contener al menos 8 caracteres.");
                return;
            }

            if (form.password !== form.confirmPassword) {
                setError("Las contraseñas no coinciden.");
                return;
            }

        }

        // Construir datos para el backend
        const datos = {
            nombreCompleto: form.nombreCompleto.trim(),
            tipoDocumento: form.tipoDocumento,
            numeroDocumento: form.numeroDocumento.trim(),
            fechaNacimiento: form.fechaNacimiento,
            nacionalidad: form.nacionalidad.trim(),
            correo,
            telefono: form.telefono.trim() || null,
            direccion: form.direccion.trim() || null,
            numeroEmpleado: form.numeroEmpleado.trim(),
            puesto: form.puesto.trim(),
        };

        // Asignación o traslado de aeropuerto
        if (
            (registrando && esAdministradorGeneral) ||
            (!registrando && puedeTrasladar)
        ) {
            datos.aeropuertoId = aeropuertoId;
        }

        // Contraseña inicial o cambio autorizado
        if (
            form.password &&
            (registrando || puedeCambiarPassword)
        ) {
            datos.password = form.password;
        }

        // Guardar empleado
        try {
            setSaving(true);

            if (registrando) {

                await empleadosService.registrar(datos);

                setMessage("Empleado registrado correctamente.");

            } else {

                await empleadosService.actualizar(
                    editingId,
                    datos
                );

                setMessage("Empleado actualizado correctamente.");

            }

            // Restablecer formulario
            setModal(null);
            setEditingId(null);
            setSelectedEmployee(null);
            setForm(initialForm);
            setShowPassword(false);
            setShowConfirmPassword(false);

            // Actualizar directorio y estadísticas
            await cargarDatos(false);

        } catch (err) {

            setError(obtenerMensajeError(err));

        } finally {

            setSaving(false);

        }
    }

    // ========================================
    // ABRIR MODAL DE REGISTRO
    // ========================================

    function openCreate() {

        if (!puedeCrear) return;

        setEditingId(null);

        setSelectedEmployee(null);

        setForm({

            ...initialForm,

            aeropuertoId: esAdministradorAeropuerto
                ? String(aeropuertoActivo?.id ?? "")
                : "",

        });

        setError("");
        setMessage("");

        setShowPassword(false);
        setShowConfirmPassword(false);

        setModal("form");

    }


    // ========================================
    // ABRIR MODAL DE EDICIÓN
    // ========================================

    function openEdit(empleado) {

        if (!puedeEditar) return;

        const usuario = empleado.usuario || {};

        setEditingId(empleado.id);

        setSelectedEmployee(empleado);

        setForm({

            ...initialForm,

            nombreCompleto:
                usuario.nombreCompleto || "",

            tipoDocumento:
                usuario.tipoDocumento || "CEDULA",

            numeroDocumento:
                usuario.numeroDocumento || "",

            fechaNacimiento:
                usuario.fechaNacimiento
                    ? String(usuario.fechaNacimiento).slice(0, 10)
                    : "",

            nacionalidad:
                usuario.nacionalidad || "",

            correo:
                usuario.correo || "",

            telefono:
                usuario.telefono || "",

            direccion:
                usuario.direccion || "",

            aeropuertoId:
                String(empleado.aeropuertoId ?? ""),

            numeroEmpleado:
                empleado.numeroEmpleado || "",

            puesto:
                empleado.puesto || "",

        });

        setError("");
        setMessage("");

        setShowPassword(false);
        setShowConfirmPassword(false);

        setModal("form");

    }


    // ========================================
    // ABRIR MODAL DE DETALLES
    // ========================================

    async function openDetails(empleado) {

        if (!puedeConsultar || detailLoading) return;

        setSelectedEmployee(empleado);

        setError("");

        setModal("details");

        setDetailLoading(true);

        try {

            const detalle =
                await empleadosService.obtenerPorId(
                    empleado.id
                );

            setSelectedEmployee(detalle);

        } catch (err) {

            setError(obtenerMensajeError(err));

        } finally {

            setDetailLoading(false);

        }
    }


    // ========================================
    // ABRIR MODAL DE DESACTIVACIÓN
    // ========================================

    function openDeactivate(empleado) {

        if (!puedeCambiarEstado) return;

        if (empleado.usuario?.estado !== "ACTIVO") {
            return;
        }

        setSelectedEmployee(empleado);

        setError("");
        setMessage("");

        setModal("deactivate");

    }


    // ========================================
    // ABRIR MODAL DE REACTIVACIÓN
    // ========================================

    function openReactivate(empleado) {

        if (!puedeCambiarEstado) return;

        if (empleado.usuario?.estado !== "INACTIVO") {
            return;
        }

        setSelectedEmployee(empleado);

        setError("");
        setMessage("");

        setModal("reactivate");

    }

    // ========================================
    // CONFIRMAR CAMBIO DE ESTADO
    // ========================================

    async function confirmarCambioEstado() {

        if (
            !puedeCambiarEstado ||
            !selectedEmployee ||
            saving
        ) {
            return;
        }

        const desactivando = modal === "deactivate";

        const reactivando = modal === "reactivate";

        if (!desactivando && !reactivando) {
            return;
        }

        const estadoActual =
            selectedEmployee.usuario?.estado;

        if (
            desactivando &&
            estadoActual !== "ACTIVO"
        ) {
            setError("El empleado no se encuentra activo.");
            return;
        }

        if (
            reactivando &&
            estadoActual !== "INACTIVO"
        ) {
            setError("El empleado no se encuentra inactivo.");
            return;
        }

        try {

            setSaving(true);
            setError("");
            setMessage("");

            if (desactivando) {

                await empleadosService.desactivar(
                    selectedEmployee.id
                );

                setMessage(
                    "Empleado desactivado correctamente."
                );

            } else {

                await empleadosService.reactivar(
                    selectedEmployee.id
                );

                setMessage(
                    "Empleado reactivado correctamente."
                );

            }

            setModal(null);

            setSelectedEmployee(null);

            await cargarDatos(false);

        } catch (err) {

            setError(obtenerMensajeError(err));

        } finally {

            setSaving(false);

        }

    }

    // ========================================
    // CERRAR MODALES
    // ========================================

    function cerrarModal() {

        if (saving || detailLoading) return;

        setModal(null);

        setSelectedEmployee(null);

        setEditingId(null);

        setForm(initialForm);

        setShowPassword(false);

        setShowConfirmPassword(false);

        setError("");

    }


    // ========================================
    // INTERFAZ TEMPORAL
    // ========================================

    if (!puedeConsultar) {

        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6">

                <div className="flex items-center gap-3">

                    <ShieldCheck
                        size={24}
                        className="text-red-600"
                    />

                    <h2 className="font-semibold text-red-700">
                        Acceso restringido
                    </h2>

                </div>

                <p className="mt-2 text-sm text-red-600">
                    No tiene permisos para acceder al módulo
                    de gestión de empleados.
                </p>

            </div>
        );

    }

    return (

        <main className="w-full space-y-6">

            <PageHeader
                icono={Users}
                titulo="Gestión de empleados"
                descripcion="Administra el personal operativo de Global Airport."
                onActualizar={() => cargarDatos()}
                onNuevo={puedeCrear ? openCreate : undefined}
                textoBoton="Registrar empleado"
            />

            {error && (

                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>

            )}

            {/* Directorio de empleados */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                {/* Encabezado del directorio */}
                <div className="border-b border-slate-100 p-5">

                    <h2 className="text-lg font-semibold text-[#0C2D57]">
                        Directorio de empleados
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Consulta y administra la información personal y laboral
                        de los empleados.
                    </p>

                </div>

                {/* Filtros */}
                <div className="space-y-4 border-b border-slate-100 p-5">

                    <div
                        className={`grid grid-cols-1 gap-4 md:grid-cols-2 ${esAdministradorGeneral
                            ? "xl:grid-cols-5"
                            : "xl:grid-cols-4"
                            }`}
                    >

                        {/* Búsqueda */}
                        <div className="space-y-2 xl:col-span-2">

                            <label
                                htmlFor="buscar-empleado"
                                className="text-sm font-medium text-slate-700"
                            >
                                Buscar empleado
                            </label>

                            <div className="relative">

                                <Search
                                    size={19}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    id="buscar-empleado"
                                    type="text"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Nombre, documento, correo..."
                                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                                />

                            </div>

                        </div>

                        {/* Filtro por aeropuerto */}
                        {esAdministradorGeneral && (

                            <div className="space-y-2">

                                <label
                                    htmlFor="filtro-aeropuerto"
                                    className="text-sm font-medium text-slate-700"
                                >
                                    Aeropuerto
                                </label>

                                <select
                                    id="filtro-aeropuerto"
                                    value={airportFilter}
                                    onChange={(event) =>
                                        setAirportFilter(event.target.value)
                                    }
                                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                                >

                                    <option value="todos">
                                        Todos los aeropuertos
                                    </option>

                                    {aeropuertos.map((aeropuerto) => (

                                        <option
                                            key={aeropuerto.id}
                                            value={String(aeropuerto.id)}
                                        >
                                            {aeropuerto.nombre} ({aeropuerto.codigoIata})
                                        </option>

                                    ))}

                                </select>

                            </div>

                        )}

                        {/* Filtro por estado */}
                        <div className="space-y-2">

                            <label
                                htmlFor="filtro-estado"
                                className="text-sm font-medium text-slate-700"
                            >
                                Estado
                            </label>

                            <select
                                id="filtro-estado"
                                value={statusFilter}
                                onChange={(event) =>
                                    setStatusFilter(event.target.value)
                                }
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                            >

                                <option value="todos">
                                    Todos los estados
                                </option>

                                <option value="ACTIVO">
                                    Activos
                                </option>

                                <option value="INACTIVO">
                                    Inactivos
                                </option>

                            </select>

                        </div>

                        {/* Filtro por puesto */}
                        <div className="space-y-2">

                            <label
                                htmlFor="filtro-puesto"
                                className="text-sm font-medium text-slate-700"
                            >
                                Puesto
                            </label>

                            <select
                                id="filtro-puesto"
                                value={positionFilter}
                                onChange={(event) =>
                                    setPositionFilter(event.target.value)
                                }
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                            >

                                <option value="todos">
                                    Todos los puestos
                                </option>

                                {puestosDisponibles.map((puesto) => (

                                    <option
                                        key={puesto}
                                        value={puesto}
                                    >
                                        {puesto}
                                    </option>

                                ))}

                            </select>

                        </div>

                    </div>

                    {/* Resultados y limpieza de filtros */}
                    <div className="flex flex-wrap items-center justify-between gap-3">

                        <p className="text-sm text-slate-500">

                            Mostrando{" "}

                            <span className="font-semibold text-[#0C2D57]">
                                {empleadosFiltrados.length}
                            </span>

                            {" "}de{" "}

                            <span className="font-semibold text-[#0C2D57]">
                                {empleados.length}
                            </span>

                            {" "}empleados

                        </p>

                        <button
                            type="button"
                            onClick={limpiarFiltros}
                            disabled={
                                !search &&
                                airportFilter === "todos" &&
                                statusFilter === "todos" &&
                                positionFilter === "todos"
                            }
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >

                            <RotateCcw size={16} />

                            Limpiar filtros

                        </button>

                    </div>

                </div>

                {/* Tabla de empleados */}
                <div className="max-h-[600px] overflow-auto">

                    <table className="w-full min-w-[1150px] border-collapse text-left">

                        {/* Encabezados */}
                        <thead className="sticky top-0 z-10 bg-slate-50">

                            <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-500">

                                <th className="px-5 py-4">
                                    Empleado
                                </th>

                                <th className="px-5 py-4">
                                    Número de empleado
                                </th>

                                <th className="px-5 py-4">
                                    Documento
                                </th>

                                <th className="px-5 py-4">
                                    Aeropuerto
                                </th>

                                <th className="px-5 py-4">
                                    Puesto
                                </th>

                                <th className="px-5 py-4">
                                    Estado
                                </th>

                                <th className="px-5 py-4 text-center">
                                    Acciones
                                </th>

                            </tr>

                        </thead>

                        <tbody className="divide-y divide-slate-100">

                            {/* Estado de carga */}
                            {loading ? (

                                <tr>

                                    <td colSpan={7} className="px-5 py-16">

                                        <div className="flex flex-col items-center justify-center gap-3">

                                            <LoaderCircle
                                                size={32}
                                                className="animate-spin text-sky-600"
                                            />

                                            <p className="text-sm text-slate-500">
                                                Cargando empleados...
                                            </p>

                                        </div>

                                    </td>

                                </tr>

                            ) : empleadosFiltrados.length > 0 ? (

                                empleadosFiltrados.map((empleado) => {

                                    const usuario = empleado.usuario || {};

                                    const aeropuerto = empleado.aeropuerto || {};

                                    const activo = usuario.estado === "ACTIVO";

                                    return (

                                        <tr
                                            key={empleado.id}
                                            className="transition hover:bg-sky-50/40"
                                        >

                                            {/* Información del empleado */}
                                            <td className="px-5 py-4">

                                                <div className="flex items-center gap-3">

                                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-semibold text-sky-700">

                                                        {obtenerIniciales(
                                                            usuario.nombreCompleto
                                                        )}

                                                    </div>

                                                    <div className="min-w-0">

                                                        <p className="font-semibold text-[#0C2D57]">
                                                            {usuario.nombreCompleto || "—"}
                                                        </p>

                                                        <p className="mt-1 text-xs text-slate-500">
                                                            {usuario.correo || "—"}
                                                        </p>

                                                    </div>

                                                </div>

                                            </td>

                                            {/* Número de empleado */}
                                            <td className="px-5 py-4">

                                                <span className="whitespace-nowrap rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700">

                                                    {empleado.numeroEmpleado || "—"}

                                                </span>

                                            </td>

                                            {/* Documento */}
                                            <td className="px-5 py-4">

                                                <p className="whitespace-nowrap text-sm font-medium text-slate-700">
                                                    {usuario.numeroDocumento || "—"}
                                                </p>

                                                <p className="mt-1 text-xs text-slate-400">

                                                    {usuario.tipoDocumento === "CEDULA"
                                                        ? "Cédula"
                                                        : usuario.tipoDocumento === "PASAPORTE"
                                                            ? "Pasaporte"
                                                            : usuario.tipoDocumento === "RESIDENCIA"
                                                                ? "Residencia"
                                                                : usuario.tipoDocumento || "—"}

                                                </p>

                                            </td>

                                            {/* Aeropuerto */}
                                            <td className="px-5 py-4">

                                                <div className="flex items-center gap-2">

                                                    <Building2
                                                        size={17}
                                                        className="shrink-0 text-slate-400"
                                                    />

                                                    <div>

                                                        <p className="text-sm font-medium text-slate-700">
                                                            {aeropuerto.nombre || "—"}
                                                        </p>

                                                        <p className="mt-1 text-xs text-slate-500">
                                                            {aeropuerto.codigoIata || "—"}
                                                        </p>

                                                    </div>

                                                </div>

                                            </td>

                                            {/* Puesto */}
                                            <td className="px-5 py-4">

                                                <div className="flex items-center gap-2 text-sm text-slate-600">

                                                    <BriefcaseBusiness
                                                        size={16}
                                                        className="shrink-0 text-slate-400"
                                                    />

                                                    {empleado.puesto || "—"}

                                                </div>

                                            </td>

                                            {/* Estado */}
                                            <td className="px-5 py-4">

                                                <span
                                                    className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${activo
                                                        ? "bg-emerald-50 text-emerald-700"
                                                        : usuario.estado === "INACTIVO"
                                                            ? "bg-red-50 text-red-700"
                                                            : "bg-slate-100 text-slate-600"
                                                        }`}
                                                >

                                                    <span
                                                        className={`h-2 w-2 rounded-full ${activo
                                                            ? "bg-emerald-500"
                                                            : usuario.estado === "INACTIVO"
                                                                ? "bg-red-500"
                                                                : "bg-slate-400"
                                                            }`}
                                                    />

                                                    {activo
                                                        ? "Activo"
                                                        : usuario.estado === "INACTIVO"
                                                            ? "Inactivo"
                                                            : "Desconocido"}

                                                </span>

                                            </td>

                                            {/* Acciones */}
                                            <td className="px-5 py-4">

                                                <div className="flex items-center justify-center gap-2">

                                                    {/* Consultar detalles */}
                                                    <button
                                                        type="button"
                                                        onClick={() => openDetails(empleado)}
                                                        disabled={detailLoading || saving}
                                                        title="Consultar empleado"
                                                        aria-label="Consultar empleado"
                                                        className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-600 disabled:opacity-50"
                                                    >

                                                        <Eye size={17} />

                                                    </button>

                                                    {/* Editar */}
                                                    {puedeEditar && (

                                                        <button
                                                            type="button"
                                                            onClick={() => openEdit(empleado)}
                                                            disabled={saving || detailLoading}
                                                            title="Editar empleado"
                                                            aria-label="Editar empleado"
                                                            className="rounded-lg border border-sky-200 p-2 text-sky-600 transition hover:bg-sky-50 disabled:opacity-50"
                                                        >

                                                            <Pencil size={17} />

                                                        </button>

                                                    )}

                                                    {/* Desactivar */}
                                                    {puedeCambiarEstado && activo && (

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openDeactivate(empleado)
                                                            }
                                                            disabled={saving || detailLoading}
                                                            title="Desactivar empleado"
                                                            aria-label="Desactivar empleado"
                                                            className="rounded-lg border border-red-200 p-2 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                                                        >

                                                            <UserRoundX size={17} />

                                                        </button>

                                                    )}

                                                    {/* Reactivar */}
                                                    {puedeCambiarEstado &&
                                                        usuario.estado === "INACTIVO" && (

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    openReactivate(empleado)
                                                                }
                                                                disabled={saving || detailLoading}
                                                                title="Reactivar empleado"
                                                                aria-label="Reactivar empleado"
                                                                className="rounded-lg border border-emerald-200 p-2 text-emerald-600 transition hover:bg-emerald-50 disabled:opacity-50"
                                                            >

                                                                <UserRoundCheck size={17} />

                                                            </button>

                                                        )}

                                                </div>

                                            </td>

                                        </tr>

                                    );

                                })

                            ) : (

                                /* Sin resultados */
                                <tr>

                                    <td colSpan={7} className="px-5 py-16">

                                        <div className="flex flex-col items-center justify-center gap-3">

                                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">

                                                <Users size={30} />

                                            </div>

                                            <h3 className="font-semibold text-[#0C2D57]">

                                                {empleados.length === 0
                                                    ? "No hay empleados registrados"
                                                    : "No se encontraron empleados"}

                                            </h3>

                                            <p className="max-w-sm text-center text-sm text-slate-500">

                                                {empleados.length === 0
                                                    ? "Los empleados registrados aparecerán en este directorio."
                                                    : "Intentá modificar los filtros o utilizar otro término de búsqueda."}

                                            </p>

                                            {empleados.length > 0 && (

                                                <button
                                                    type="button"
                                                    onClick={limpiarFiltros}
                                                    className="mt-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-sky-600 transition hover:bg-sky-50"
                                                >

                                                    Limpiar filtros

                                                </button>

                                            )}

                                        </div>

                                    </td>

                                </tr>

                            )}

                        </tbody>

                    </table>

                </div>

                {/* Pie del directorio */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4">

                    <p className="text-xs text-slate-500">

                        Total de resultados:{" "}

                        <span className="font-semibold text-slate-700">
                            {empleadosFiltrados.length}
                        </span>

                    </p>

                    <div className="flex items-center gap-4">

                        <div className="flex items-center gap-1.5">

                            <span className="h-2 w-2 rounded-full bg-emerald-500" />

                            <span className="text-xs text-slate-500">
                                Activo
                            </span>

                        </div>

                        <div className="flex items-center gap-1.5">

                            <span className="h-2 w-2 rounded-full bg-red-500" />

                            <span className="text-xs text-slate-500">
                                Inactivo
                            </span>

                        </div>

                    </div>

                </div>

            </section>

            <div className="rounded-xl border border-slate-200 bg-white p-6">

                {loading ? (

                    <div className="flex items-center gap-3 text-slate-500">

                        <LoaderCircle
                            size={20}
                            className="animate-spin text-sky-600"
                        />

                        Cargando empleados...

                    </div>

                ) : (

                    <p className="text-sm text-slate-600">

                        Empleados registrados:{" "}

                        <strong className="text-[#0C2D57]">
                            {estadisticas.total}
                        </strong>

                    </p>

                )}

            </div>

            {/* Modal de registro y edición */}
            {modal === "form" &&
                (esRegistro ? puedeCrear : puedeEditar) && (

                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
                        onMouseDown={(event) => {
                            if (event.target === event.currentTarget) {
                                cerrarModal();
                            }
                        }}
                    >

                        <section
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="empleado-modal-titulo"
                            className="flex max-h-[90dvh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
                        >

                            {/* Encabezado del modal */}
                            <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-5">

                                <div className="flex items-center gap-4">

                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600">

                                        {esRegistro ? (
                                            <UserRoundPlus size={25} />
                                        ) : (
                                            <Pencil size={23} />
                                        )}

                                    </div>

                                    <div>

                                        <h2
                                            id="empleado-modal-titulo"
                                            className="text-xl font-semibold text-[#0C2D57]"
                                        >
                                            {esRegistro
                                                ? "Registrar empleado"
                                                : "Editar empleado"}
                                        </h2>

                                        <p className="mt-1 text-sm text-slate-500">

                                            {esRegistro
                                                ? "Complete la información del nuevo empleado."
                                                : "Actualice la información personal y laboral."}

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
                                    <X size={23} />
                                </button>

                            </div>

                            {/* Formulario */}
                            <form
                                onSubmit={saveEmployee}
                                className="flex min-h-0 flex-1 flex-col"
                            >

                                {/* Contenido desplazable */}
                                <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-6">

                                    {/* Mensajes de error */}
                                    {error && (

                                        <div
                                            role="alert"
                                            className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                                        >

                                            <AlertCircle
                                                size={20}
                                                className="shrink-0"
                                            />

                                            <span>{error}</span>

                                        </div>

                                    )}

                                    <fieldset
                                        disabled={saving}
                                        className="min-w-0 space-y-6"
                                    >

                                        {/* INFORMACIÓN PERSONAL */}
                                        <section className="space-y-4">

                                            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">

                                                <Users
                                                    size={20}
                                                    className="text-sky-600"
                                                />

                                                <h3 className="font-semibold text-[#0C2D57]">
                                                    Información personal
                                                </h3>

                                            </div>

                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                                                {/* Nombre completo */}
                                                <label className="space-y-2 md:col-span-2">

                                                    <span className="text-sm font-medium text-slate-700">
                                                        Nombre completo *
                                                    </span>

                                                    <input
                                                        type="text"
                                                        value={form.nombreCompleto}
                                                        onChange={(event) =>
                                                            updateForm(
                                                                "nombreCompleto",
                                                                event.target.value
                                                            )
                                                        }
                                                        placeholder="Nombre y apellidos"
                                                        required
                                                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                                                    />

                                                </label>

                                                {/* Tipo de documento */}
                                                <label className="space-y-2">

                                                    <span className="text-sm font-medium text-slate-700">
                                                        Tipo de documento *
                                                    </span>

                                                    <select
                                                        value={form.tipoDocumento}
                                                        onChange={(event) =>
                                                            updateForm(
                                                                "tipoDocumento",
                                                                event.target.value
                                                            )
                                                        }
                                                        required
                                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                                                    >

                                                        <option value="CEDULA">
                                                            Cédula
                                                        </option>

                                                        <option value="PASAPORTE">
                                                            Pasaporte
                                                        </option>

                                                        <option value="RESIDENCIA">
                                                            Residencia
                                                        </option>

                                                    </select>

                                                </label>

                                                {/* Número de documento */}
                                                <label className="space-y-2">

                                                    <span className="text-sm font-medium text-slate-700">
                                                        Número de documento *
                                                    </span>

                                                    <input
                                                        type="text"
                                                        value={form.numeroDocumento}
                                                        onChange={(event) =>
                                                            updateForm(
                                                                "numeroDocumento",
                                                                event.target.value
                                                            )
                                                        }
                                                        placeholder="Número de identificación"
                                                        required
                                                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                                                    />

                                                </label>

                                                {/* Fecha de nacimiento */}
                                                <label className="space-y-2">

                                                    <span className="text-sm font-medium text-slate-700">
                                                        Fecha de nacimiento *
                                                    </span>

                                                    <input
                                                        type="date"
                                                        value={form.fechaNacimiento}
                                                        max={fechaMaxima}
                                                        onChange={(event) =>
                                                            updateForm(
                                                                "fechaNacimiento",
                                                                event.target.value
                                                            )
                                                        }
                                                        required
                                                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                                                    />

                                                </label>

                                                {/* Nacionalidad */}
                                                <label className="space-y-2">

                                                    <span className="text-sm font-medium text-slate-700">
                                                        Nacionalidad *
                                                    </span>

                                                    <input
                                                        type="text"
                                                        value={form.nacionalidad}
                                                        onChange={(event) =>
                                                            updateForm(
                                                                "nacionalidad",
                                                                event.target.value
                                                            )
                                                        }
                                                        placeholder="Ej. Costarricense"
                                                        required
                                                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                                                    />

                                                </label>

                                                {/* Correo electrónico */}
                                                <label className="space-y-2">

                                                    <span className="text-sm font-medium text-slate-700">
                                                        Correo electrónico *
                                                    </span>

                                                    <input
                                                        type="email"
                                                        value={form.correo}
                                                        onChange={(event) =>
                                                            updateForm(
                                                                "correo",
                                                                event.target.value
                                                            )
                                                        }
                                                        placeholder="correo@ejemplo.com"
                                                        required
                                                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                                                    />

                                                </label>

                                                {/* Teléfono */}
                                                <label className="space-y-2">

                                                    <span className="text-sm font-medium text-slate-700">
                                                        Teléfono
                                                    </span>

                                                    <input
                                                        type="tel"
                                                        value={form.telefono}
                                                        onChange={(event) =>
                                                            updateForm(
                                                                "telefono",
                                                                event.target.value
                                                            )
                                                        }
                                                        placeholder="8888-8888"
                                                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                                                    />

                                                </label>

                                                {/* Dirección */}
                                                <label className="space-y-2 md:col-span-2">

                                                    <span className="text-sm font-medium text-slate-700">
                                                        Dirección
                                                    </span>

                                                    <textarea
                                                        rows={2}
                                                        value={form.direccion}
                                                        onChange={(event) =>
                                                            updateForm(
                                                                "direccion",
                                                                event.target.value
                                                            )
                                                        }
                                                        placeholder="Dirección de residencia"
                                                        className="w-full resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                                                    />

                                                </label>

                                            </div>

                                        </section>

                                        {/* INFORMACIÓN LABORAL */}
                                        <section className="space-y-4">

                                            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">

                                                <BriefcaseBusiness
                                                    size={20}
                                                    className="text-sky-600"
                                                />

                                                <h3 className="font-semibold text-[#0C2D57]">
                                                    Información laboral
                                                </h3>

                                            </div>

                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                                                {/* Aeropuerto */}
                                                <label className="space-y-2 md:col-span-2">

                                                    <span className="text-sm font-medium text-slate-700">
                                                        Aeropuerto asignado *
                                                    </span>

                                                    <select
                                                        value={form.aeropuertoId}
                                                        onChange={(event) =>
                                                            updateForm(
                                                                "aeropuertoId",
                                                                event.target.value
                                                            )
                                                        }
                                                        disabled={!aeropuertoEditable}
                                                        required
                                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                                                    >

                                                        <option value="">
                                                            Seleccione un aeropuerto
                                                        </option>

                                                        {aeropuertos.map((aeropuerto) => (

                                                            <option
                                                                key={aeropuerto.id}
                                                                value={String(aeropuerto.id)}
                                                            >

                                                                {aeropuerto.nombre} ({aeropuerto.codigoIata})

                                                            </option>

                                                        ))}

                                                    </select>

                                                    {!aeropuertoEditable && (

                                                        <p className="text-xs text-slate-500">
                                                            El aeropuerto se determina según su alcance administrativo.
                                                        </p>

                                                    )}

                                                    {!esRegistro && puedeTrasladar && (

                                                        <p className="text-xs text-amber-600">
                                                            Cambiar el aeropuerto trasladará al empleado.
                                                        </p>

                                                    )}

                                                </label>

                                                {/* Número de empleado */}
                                                <label className="space-y-2">

                                                    <span className="text-sm font-medium text-slate-700">
                                                        Número de empleado *
                                                    </span>

                                                    <input
                                                        type="text"
                                                        value={form.numeroEmpleado}
                                                        onChange={(event) =>
                                                            updateForm(
                                                                "numeroEmpleado",
                                                                event.target.value
                                                            )
                                                        }
                                                        placeholder="Ej. EMP-001"
                                                        required
                                                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                                                    />

                                                </label>

                                                {/* Puesto */}
                                                <label className="space-y-2">

                                                    <span className="text-sm font-medium text-slate-700">
                                                        Puesto *
                                                    </span>

                                                    <input
                                                        type="text"
                                                        value={form.puesto}
                                                        onChange={(event) =>
                                                            updateForm(
                                                                "puesto",
                                                                event.target.value
                                                            )
                                                        }
                                                        placeholder="Ej. Recepcionista"
                                                        required
                                                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                                                    />

                                                </label>

                                            </div>

                                        </section>

                                        {/* INFORMACIÓN DE ACCESO */}
                                        <section className="space-y-4">

                                            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">

                                                <ShieldCheck
                                                    size={20}
                                                    className="text-sky-600"
                                                />

                                                <h3 className="font-semibold text-[#0C2D57]">
                                                    Información de acceso
                                                </h3>

                                            </div>

                                            {/* Rol asignado automáticamente */}
                                            <div className="rounded-xl border border-sky-200 bg-sky-50 p-4">

                                                <p className="text-sm font-semibold text-sky-800">
                                                    Rol asignado: Empleado
                                                </p>

                                                <p className="mt-1 text-xs text-sky-700">
                                                    El rol se asigna automáticamente y no puede
                                                    modificarse desde este formulario.
                                                </p>

                                            </div>

                                            {/* Contraseñas */}
                                            {mostrarCamposPassword ? (

                                                <>

                                                    {!esRegistro && (

                                                        <p className="text-sm text-slate-500">
                                                            Deje los campos de contraseña vacíos si
                                                            desea conservar la contraseña actual.
                                                        </p>

                                                    )}

                                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                                                        {/* Contraseña */}
                                                        <label className="space-y-2">

                                                            <span className="text-sm font-medium text-slate-700">

                                                                {esRegistro
                                                                    ? "Contraseña *"
                                                                    : "Nueva contraseña"}

                                                            </span>

                                                            <div className="relative">

                                                                <input
                                                                    type={showPassword ? "text" : "password"}
                                                                    value={form.password}
                                                                    onChange={(event) =>
                                                                        updateForm(
                                                                            "password",
                                                                            event.target.value
                                                                        )
                                                                    }
                                                                    required={esRegistro}
                                                                    minLength={8}
                                                                    autoComplete="new-password"
                                                                    placeholder="Mínimo 8 caracteres"
                                                                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-4 pr-12 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                                                                />

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setShowPassword((current) => !current)
                                                                    }
                                                                    aria-label={
                                                                        showPassword
                                                                            ? "Ocultar contraseña"
                                                                            : "Mostrar contraseña"
                                                                    }
                                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                                                >

                                                                    {showPassword ? (
                                                                        <EyeOff size={19} />
                                                                    ) : (
                                                                        <Eye size={19} />
                                                                    )}

                                                                </button>

                                                            </div>

                                                        </label>

                                                        {/* Confirmar contraseña */}
                                                        <label className="space-y-2">

                                                            <span className="text-sm font-medium text-slate-700">

                                                                Confirmar contraseña
                                                                {esRegistro ? " *" : ""}

                                                            </span>

                                                            <div className="relative">

                                                                <input
                                                                    type={
                                                                        showConfirmPassword
                                                                            ? "text"
                                                                            : "password"
                                                                    }
                                                                    value={form.confirmPassword}
                                                                    onChange={(event) =>
                                                                        updateForm(
                                                                            "confirmPassword",
                                                                            event.target.value
                                                                        )
                                                                    }
                                                                    required={
                                                                        esRegistro ||
                                                                        Boolean(form.password)
                                                                    }
                                                                    minLength={8}
                                                                    autoComplete="new-password"
                                                                    placeholder="Repita la contraseña"
                                                                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-4 pr-12 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                                                                />

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setShowConfirmPassword(
                                                                            (current) => !current
                                                                        )
                                                                    }
                                                                    aria-label={
                                                                        showConfirmPassword
                                                                            ? "Ocultar confirmación"
                                                                            : "Mostrar confirmación"
                                                                    }
                                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                                                >

                                                                    {showConfirmPassword ? (
                                                                        <EyeOff size={19} />
                                                                    ) : (
                                                                        <Eye size={19} />
                                                                    )}

                                                                </button>

                                                            </div>

                                                        </label>

                                                    </div>

                                                </>

                                            ) : (

                                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">

                                                    Solamente el administrador general puede
                                                    modificar la contraseña de un empleado
                                                    existente.

                                                </div>

                                            )}

                                        </section>

                                    </fieldset>

                                    <p className="text-xs text-slate-400">
                                        Los campos marcados con * son obligatorios.
                                    </p>

                                </div>

                                {/* Pie del modal */}
                                <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">

                                    <button
                                        type="button"
                                        onClick={cerrarModal}
                                        disabled={saving}
                                        className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
                                    >
                                        Cancelar
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
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
                                            : esRegistro
                                                ? "Registrar empleado"
                                                : "Guardar cambios"}

                                    </button>

                                </div>

                            </form>

                        </section>

                    </div>

                )}

            {/* Modal de detalles del empleado */}
            {modal === "details" &&
                puedeConsultar &&
                selectedEmployee && (

                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
                        onMouseDown={(event) => {
                            if (event.target === event.currentTarget) {
                                cerrarModal();
                            }
                        }}
                    >

                        <section
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="empleado-detalle-titulo"
                            className="flex max-h-[90dvh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
                        >

                            {/* Encabezado */}
                            <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-5">

                                <div className="flex items-center gap-4">

                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600">

                                        <Eye size={24} />

                                    </div>

                                    <div>

                                        <h2
                                            id="empleado-detalle-titulo"
                                            className="text-xl font-semibold text-[#0C2D57]"
                                        >
                                            Detalles del empleado
                                        </h2>

                                        <p className="mt-1 text-sm text-slate-500">
                                            Consulta la información personal y laboral.
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

                                    <X size={23} />

                                </button>

                            </div>

                            {/* Contenido */}
                            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-6">

                                {detailLoading ? (

                                    <div className="flex min-h-64 flex-col items-center justify-center gap-3">

                                        <LoaderCircle
                                            size={32}
                                            className="animate-spin text-sky-600"
                                        />

                                        <p className="text-sm text-slate-500">
                                            Cargando información del empleado...
                                        </p>

                                    </div>

                                ) : error ? (

                                    <div
                                        role="alert"
                                        className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                                    >

                                        <AlertCircle
                                            size={20}
                                            className="shrink-0"
                                        />

                                        <span>{error}</span>

                                    </div>

                                ) : (

                                    <>

                                        {/* Tarjeta de identificación */}
                                        <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-sky-100 bg-sky-50 p-5">

                                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-sky-200 text-xl font-bold text-sky-800">

                                                {obtenerIniciales(
                                                    usuarioSeleccionado.nombreCompleto
                                                )}

                                            </div>

                                            <div className="min-w-0 flex-1">

                                                <h3 className="text-lg font-semibold text-[#0C2D57]">

                                                    {usuarioSeleccionado.nombreCompleto || "—"}

                                                </h3>

                                                <p className="mt-1 text-sm text-slate-600">

                                                    {selectedEmployee.puesto || "—"}

                                                </p>

                                                <p className="mt-1 text-xs font-medium text-sky-700">

                                                    {selectedEmployee.numeroEmpleado || "—"}

                                                </p>

                                            </div>

                                            <span
                                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${empleadoActivo
                                                    ? "bg-emerald-100 text-emerald-700"
                                                    : usuarioSeleccionado.estado === "INACTIVO"
                                                        ? "bg-red-100 text-red-700"
                                                        : "bg-slate-100 text-slate-600"
                                                    }`}
                                            >

                                                <span
                                                    className={`h-2 w-2 rounded-full ${empleadoActivo
                                                        ? "bg-emerald-500"
                                                        : usuarioSeleccionado.estado === "INACTIVO"
                                                            ? "bg-red-500"
                                                            : "bg-slate-400"
                                                        }`}
                                                />

                                                {empleadoActivo
                                                    ? "Activo"
                                                    : usuarioSeleccionado.estado === "INACTIVO"
                                                        ? "Inactivo"
                                                        : "Desconocido"}

                                            </span>

                                        </div>

                                        {/* INFORMACIÓN PERSONAL */}
                                        <section className="space-y-4">

                                            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">

                                                <Users
                                                    size={20}
                                                    className="text-sky-600"
                                                />

                                                <h3 className="font-semibold text-[#0C2D57]">
                                                    Información personal
                                                </h3>

                                            </div>

                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                                                {[
                                                    {
                                                        titulo: "Nombre completo",
                                                        valor: usuarioSeleccionado.nombreCompleto,
                                                    },
                                                    {
                                                        titulo: "Tipo de documento",
                                                        valor:
                                                            usuarioSeleccionado.tipoDocumento === "CEDULA"
                                                                ? "Cédula"
                                                                : usuarioSeleccionado.tipoDocumento === "PASAPORTE"
                                                                    ? "Pasaporte"
                                                                    : usuarioSeleccionado.tipoDocumento === "RESIDENCIA"
                                                                        ? "Residencia"
                                                                        : usuarioSeleccionado.tipoDocumento,
                                                    },
                                                    {
                                                        titulo: "Número de documento",
                                                        valor: usuarioSeleccionado.numeroDocumento,
                                                    },
                                                    {
                                                        titulo: "Fecha de nacimiento",
                                                        valor: formatearFecha(
                                                            usuarioSeleccionado.fechaNacimiento
                                                        ),
                                                    },
                                                    {
                                                        titulo: "Nacionalidad",
                                                        valor: usuarioSeleccionado.nacionalidad,
                                                    },
                                                    {
                                                        titulo: "Correo electrónico",
                                                        valor: usuarioSeleccionado.correo,
                                                    },
                                                    {
                                                        titulo: "Teléfono",
                                                        valor: usuarioSeleccionado.telefono,
                                                    },
                                                    {
                                                        titulo: "Dirección",
                                                        valor: usuarioSeleccionado.direccion,
                                                    },
                                                ].map((campo) => (

                                                    <div
                                                        key={campo.titulo}
                                                        className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                                                    >

                                                        <p className="text-xs font-medium text-slate-500">

                                                            {campo.titulo}

                                                        </p>

                                                        <p className="mt-1 break-words text-sm font-medium text-slate-800">

                                                            {campo.valor || "—"}

                                                        </p>

                                                    </div>

                                                ))}

                                            </div>

                                        </section>

                                        {/* INFORMACIÓN LABORAL */}
                                        <section className="space-y-4">

                                            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">

                                                <BriefcaseBusiness
                                                    size={20}
                                                    className="text-sky-600"
                                                />

                                                <h3 className="font-semibold text-[#0C2D57]">
                                                    Información laboral
                                                </h3>

                                            </div>

                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                                                {[
                                                    {
                                                        titulo: "ID del empleado",
                                                        valor: selectedEmployee.id,
                                                    },
                                                    {
                                                        titulo: "Número de empleado",
                                                        valor: selectedEmployee.numeroEmpleado,
                                                    },
                                                    {
                                                        titulo: "Puesto",
                                                        valor: selectedEmployee.puesto,
                                                    },
                                                    {
                                                        titulo: "Aeropuerto asignado",
                                                        valor: aeropuertoSeleccionado.nombre,
                                                    },
                                                    {
                                                        titulo: "Código IATA",
                                                        valor: aeropuertoSeleccionado.codigoIata,
                                                    },
                                                    {
                                                        titulo: "Ubicación del aeropuerto",
                                                        valor: [
                                                            aeropuertoSeleccionado.ciudad,
                                                            aeropuertoSeleccionado.pais,
                                                        ].filter(Boolean).join(", "),
                                                    },
                                                ].map((campo) => (

                                                    <div
                                                        key={campo.titulo}
                                                        className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                                                    >

                                                        <p className="text-xs font-medium text-slate-500">

                                                            {campo.titulo}

                                                        </p>

                                                        <p className="mt-1 break-words text-sm font-medium text-slate-800">

                                                            {campo.valor ?? "—"}

                                                        </p>

                                                    </div>

                                                ))}

                                            </div>

                                        </section>

                                        {/* INFORMACIÓN DE ACCESO */}
                                        <section className="space-y-4">

                                            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">

                                                <ShieldCheck
                                                    size={20}
                                                    className="text-sky-600"
                                                />

                                                <h3 className="font-semibold text-[#0C2D57]">
                                                    Información de acceso
                                                </h3>

                                            </div>

                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                                                {[
                                                    {
                                                        titulo: "ID de usuario",
                                                        valor: selectedEmployee.usuarioId,
                                                    },
                                                    {
                                                        titulo: "Rol asignado",
                                                        valor:
                                                            usuarioSeleccionado.rol?.codigo === "EMPLEADO"
                                                                ? "Empleado"
                                                                : usuarioSeleccionado.rol?.codigo,
                                                    },
                                                    {
                                                        titulo: "Estado de la cuenta",
                                                        valor: empleadoActivo
                                                            ? "Activo"
                                                            : usuarioSeleccionado.estado === "INACTIVO"
                                                                ? "Inactivo"
                                                                : "Desconocido",
                                                    },
                                                    {
                                                        titulo: "Fecha de registro",
                                                        valor: formatearFecha(
                                                            usuarioSeleccionado.creadoEn
                                                        ),
                                                    },
                                                    {
                                                        titulo: "Última actualización",
                                                        valor: formatearFecha(
                                                            usuarioSeleccionado.actualizadoEn
                                                        ),
                                                    },
                                                    {
                                                        titulo: "Fecha de desactivación",
                                                        valor: formatearFecha(
                                                            usuarioSeleccionado.desactivadoEn
                                                        ),
                                                    },
                                                ].map((campo) => (

                                                    <div
                                                        key={campo.titulo}
                                                        className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                                                    >

                                                        <p className="text-xs font-medium text-slate-500">

                                                            {campo.titulo}

                                                        </p>

                                                        <p className="mt-1 break-words text-sm font-medium text-slate-800">

                                                            {campo.valor ?? "—"}

                                                        </p>

                                                    </div>

                                                ))}

                                            </div>

                                        </section>

                                    </>

                                )}

                            </div>

                            {/* Pie del modal */}
                            <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">

                                <button
                                    type="button"
                                    onClick={cerrarModal}
                                    disabled={detailLoading}
                                    className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
                                >

                                    Cerrar

                                </button>

                                {puedeEditar && !detailLoading && !error && (

                                    <button
                                        type="button"
                                        onClick={() => openEdit(selectedEmployee)}
                                        className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700"
                                    >

                                        <Pencil size={17} />

                                        Editar empleado

                                    </button>

                                )}

                            </div>

                        </section>

                    </div>

                )}

            {/* Modal de desactivación y reactivación */}
            {(modal === "deactivate" ||
                modal === "reactivate") &&
                puedeCambiarEstado &&
                selectedEmployee && (

                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
                        onMouseDown={(event) => {
                            if (event.target === event.currentTarget) {
                                cerrarModal();
                            }
                        }}
                    >

                        <section
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="empleado-estado-titulo"
                            className="flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
                        >

                            {/* Encabezado */}
                            <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-5">

                                <div className="flex items-center gap-3">

                                    <div
                                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${configuracionEstado.colorIcono}`}
                                    >

                                        <IconoCambioEstado size={25} />

                                    </div>

                                    <div>

                                        <h2
                                            id="empleado-estado-titulo"
                                            className="text-xl font-semibold text-[#0C2D57]"
                                        >

                                            {configuracionEstado.titulo}

                                        </h2>

                                        <p className="mt-1 text-sm text-slate-500">

                                            {configuracionEstado.descripcion}

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

                                    <X size={23} />

                                </button>

                            </div>

                            {/* Contenido */}
                            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-6">

                                {/* Mensaje de confirmación */}
                                <p className="text-sm font-medium text-slate-700">

                                    {configuracionEstado.pregunta}

                                </p>

                                {/* Información del empleado */}
                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                                    <div className="flex items-center gap-3">

                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-700">

                                            {obtenerIniciales(
                                                usuarioSeleccionado.nombreCompleto
                                            )}

                                        </div>

                                        <div className="min-w-0 flex-1">

                                            <h3 className="break-words font-semibold text-[#0C2D57]">

                                                {usuarioSeleccionado.nombreCompleto || "—"}

                                            </h3>

                                            <p className="mt-1 break-words text-xs text-slate-500">

                                                {usuarioSeleccionado.correo || "—"}

                                            </p>

                                        </div>

                                        <span
                                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${empleadoActivo
                                                ? "bg-emerald-100 text-emerald-700"
                                                : "bg-red-100 text-red-700"
                                                }`}
                                        >

                                            <span
                                                className={`h-2 w-2 rounded-full ${empleadoActivo
                                                    ? "bg-emerald-500"
                                                    : "bg-red-500"
                                                    }`}
                                            />

                                            {empleadoActivo
                                                ? "Activo"
                                                : "Inactivo"}

                                        </span>

                                    </div>

                                    {/* Información laboral */}
                                    <div className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-200 pt-4">

                                        <div>

                                            <p className="text-xs text-slate-500">
                                                Número de empleado
                                            </p>

                                            <p className="mt-1 text-sm font-medium text-slate-700">

                                                {selectedEmployee.numeroEmpleado || "—"}

                                            </p>

                                        </div>

                                        <div>

                                            <p className="text-xs text-slate-500">
                                                Puesto
                                            </p>

                                            <p className="mt-1 text-sm font-medium text-slate-700">

                                                {selectedEmployee.puesto || "—"}

                                            </p>

                                        </div>

                                        <div className="col-span-2">

                                            <p className="text-xs text-slate-500">
                                                Aeropuerto asignado
                                            </p>

                                            <div className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-700">

                                                <Building2
                                                    size={16}
                                                    className="shrink-0 text-slate-400"
                                                />

                                                {aeropuertoSeleccionado.nombre || "—"}

                                                {aeropuertoSeleccionado.codigoIata &&
                                                    ` (${aeropuertoSeleccionado.codigoIata})`}

                                            </div>

                                        </div>

                                    </div>

                                </div>

                                {/* Advertencia */}
                                <div
                                    className={`flex items-start gap-3 rounded-xl border p-4 ${configuracionEstado.colorAdvertencia}`}
                                >

                                    {desactivandoEmpleado ? (

                                        <AlertCircle
                                            size={20}
                                            className="shrink-0"
                                        />

                                    ) : (

                                        <CheckCircle2
                                            size={20}
                                            className="shrink-0"
                                        />

                                    )}

                                    <div>

                                        <p className="text-sm font-semibold">

                                            {desactivandoEmpleado
                                                ? "Importante"
                                                : "Restablecimiento de acceso"}

                                        </p>

                                        <p className="mt-1 text-sm leading-relaxed">

                                            {configuracionEstado.advertencia}

                                        </p>

                                    </div>

                                </div>

                                {/* Errores del backend */}
                                {error && (

                                    <div
                                        role="alert"
                                        className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                                    >

                                        <AlertCircle
                                            size={20}
                                            className="shrink-0"
                                        />

                                        <span>{error}</span>

                                    </div>

                                )}

                            </div>

                            {/* Pie del modal */}
                            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">

                                <button
                                    type="button"
                                    onClick={cerrarModal}
                                    disabled={saving}
                                    className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
                                >

                                    Cancelar

                                </button>

                                <button
                                    type="button"
                                    onClick={confirmarCambioEstado}
                                    disabled={saving}
                                    className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${configuracionEstado.colorBoton}`}
                                >

                                    {saving ? (

                                        <LoaderCircle
                                            size={18}
                                            className="animate-spin"
                                        />

                                    ) : (

                                        <IconoCambioEstado size={18} />

                                    )}

                                    {saving
                                        ? configuracionEstado.textoCargando
                                        : configuracionEstado.textoBoton}

                                </button>

                            </div>

                        </section>

                    </div>

                )}

        </main>

    );

}