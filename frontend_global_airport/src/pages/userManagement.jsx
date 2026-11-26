import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Users,
  UserRound,
  ShieldCheck,
  Pencil,
  X,
  Check,
  Trash2,
  RotateCcw,
  LoaderCircle,
  UserRoundX,
  UserRoundCheck,
  UserRoundPlus,
  Eye,
  EyeOff,
  Save,
  TriangleAlert,
  BriefcaseBusiness,
  Building2
} from "lucide-react";
import { usuariosService } from "../services/usuariosService";
import { rolesService } from "../services/rolesService";
import { aeropuertosService } from "../services/aeropuertosService";
import { useAuth } from "../context/AuthContext";
import { tienePermiso } from "../config/permissions";
import PageHeader from "../components/management/PageHeader";
import StatCard from "../components/management/StatCard";

const initialForm = {
  nombreCompleto: "",
  tipoDocumento: "CEDULA",
  numeroDocumento: "",
  fechaNacimiento: "",
  nacionalidad: "",
  correo: "",
  telefono: "",
  direccion: "",
  rolId: "",
  password: "",
  confirmPassword: "",

  // Información laboral
  aeropuertoId: "",
  numeroEmpleado: "",
  puesto: "",
};

function obtenerMensajeError(error) {
  return (
    error?.message ||
    "Ocurrió un error al comunicarse con el servidor."
  );
}
function formatearFecha(fecha) {
  if (!fecha) return "—";
  const fechaValida = new Date(fecha);
  if (Number.isNaN(fechaValida.getTime())) {
    return "—";
  }
  return fechaValida.toLocaleDateString("es-CR");
}
const fechaMaxima = new Date().toISOString().slice(0, 10);
const inputClass = `
  w-full rounded-lg border border-slate-300
  bg-white px-3 py-2.5 text-sm text-slate-700
  outline-none transition
  placeholder:text-slate-400
  focus:border-sky-500 focus:ring-2 focus:ring-sky-100
  disabled:cursor-not-allowed disabled:bg-slate-100
  disabled:text-slate-500
`;
const labelClass = `
  block text-sm font-medium text-slate-700
`;
export default function UserManagement() {
  const { usuario, rol } = useAuth();
  const puedeConsultar = tienePermiso(
    rol, "usuarios", "consultar"
  );
  const puedeCrear = tienePermiso(
    rol, "usuarios", "crear"
  );
  const puedeEditar = tienePermiso(
    rol, "usuarios", "editar"
  );
  const puedeEliminar = tienePermiso(
    rol, "usuarios", "eliminar"
  );
  const puedeCambiarEstado = tienePermiso(
    rol, "usuarios", "cambiarEstado"
  );
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [aeropuertos, setAeropuertos] = useState([]);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  // ==========================================
  // CARGAR USUARIOS Y ROLES DESDE EL BACKEND
  // ==========================================
  async function cargarDatos(mostrarCarga = true) {
    if (!puedeConsultar) {
      setLoading(false);
      return;
    }

    try {
      if (mostrarCarga) {
        setLoading(true);
        setError("");
      }

      const [
        usuariosData,
        rolesData,
        aeropuertosData,
      ] = await Promise.all([
        usuariosService.obtenerTodos(),
        rolesService.obtenerTodos(),
        aeropuertosService.obtenerTodos(),
      ]);

      if (!Array.isArray(usuariosData)) {
        throw new Error(
          "El servidor no devolvió una lista válida de usuarios."
        );
      }

      if (!Array.isArray(rolesData)) {
        throw new Error(
          "El servidor no devolvió una lista válida de roles."
        );
      }

      if (!Array.isArray(aeropuertosData)) {
        throw new Error(
          "El servidor no devolvió una lista válida de aeropuertos."
        );
      }

      setUsers(usuariosData);
      setRoles(rolesData);
      setAeropuertos(aeropuertosData);

    } catch (err) {
      setError(obtenerMensajeError(err));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void Promise.resolve().then(() => cargarDatos(false));
  }, []);
  // ==========================================
  // ESTADÍSTICAS
  // ==========================================
  const activeUsers = users.filter(
    (user) => user.estado === "ACTIVO"
  ).length;
  const inactiveUsers = users.filter(
    (user) => user.estado === "INACTIVO"
  ).length;
  const availableRoles = roles.filter(
    (role) => String(role.codigo || "").toUpperCase() !== "PILOTO"
  );

  const rolSeleccionado = availableRoles.find(
    (role) => String(role.id) === String(form.rolId)
  );

  const esRolEmpleado =
    rolSeleccionado?.codigo === "EMPLEADO";

  const mostrarInformacionLaboral =
    editingId === null && esRolEmpleado;
  // ==========================================
  // BÚSQUEDA Y FILTROS
  // ==========================================
  const visibleUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    return users.filter((user) => {
      const roleName =
        user.rol?.nombre || user.rol?.codigo || "";
      const roleId = String(
        user.rolId ?? user.rol?.id ?? ""
      );
      const matchesSearch = [
        user.id,
        user.nombreCompleto,
        user.tipoDocumento || "",
        user.numeroDocumento || "",
        user.correo,
        user.telefono || "",
        roleName,
      ].some((value) =>
        String(value).toLowerCase().includes(term)
      );
      const matchesRole =
        roleFilter === "todos" || roleId === roleFilter;
      const matchesStatus =
        statusFilter === "todos" ||
        user.estado === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);
  // ==========================================
  // ABRIR FORMULARIO DE REGISTRO
  // ==========================================
  function openCreate() {
    if (!puedeCrear) return;
    setEditingId(null);
    setForm(initialForm);
    setError("");
    setMessage("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setModal("form");
  }
  // ==========================================
  // ABRIR FORMULARIO DE EDICIÓN
  // ==========================================
  function openEdit(user) {
    if (!puedeEditar) return;

    setEditingId(user.id);

    const userRoleId = user.rolId ?? user.rol?.id;

    const currentRole = roles.find(
      (role) => String(role.id) === String(userRoleId)
    );

    const currentRoleCode =
      user.rol?.codigo || currentRole?.codigo;

    setForm({
      ...initialForm,

      nombreCompleto: user.nombreCompleto || "",
      tipoDocumento: user.tipoDocumento || "CEDULA",
      numeroDocumento: user.numeroDocumento || "",

      fechaNacimiento: user.fechaNacimiento
        ? String(user.fechaNacimiento).slice(0, 10)
        : "",

      nacionalidad: user.nacionalidad || "",
      correo: user.correo || "",
      telefono: user.telefono || "",
      direccion: user.direccion || "",

      rolId:
        String(currentRoleCode || "").toUpperCase() === "PILOTO"
          ? ""
          : String(userRoleId ?? ""),

      password: "",
      confirmPassword: "",
    });

    setError("");
    setMessage("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setModal("form");
  }
  // ==========================================
  // ACTUALIZAR CAMPOS DEL FORMULARIO
  // ==========================================
  function updateForm(field, value) {
    setForm((current) => {
      const nuevoForm = {
        ...current,
        [field]: value,
      };

      if (field === "rolId") {
        const nuevoRol = availableRoles.find(
          (role) => String(role.id) === String(value)
        );

        if (nuevoRol?.codigo !== "EMPLEADO") {
          nuevoForm.aeropuertoId = "";
          nuevoForm.numeroEmpleado = "";
          nuevoForm.puesto = "";
        }
      }

      return nuevoForm;
    });
  }
  // ==========================================
  // REGISTRAR O MODIFICAR USUARIO
  // ==========================================
  async function saveUser(event) {
    event.preventDefault();

    if (saving) return;

    const esRegistro = editingId === null;

    // ==========================================
    // VALIDAR PERMISOS
    // ==========================================

    if (!esRegistro && !puedeEditar) {
      setError("No tiene permisos para editar usuarios.");
      return;
    }

    if (esRegistro && !puedeCrear) {
      setError("No tiene permisos para registrar usuarios.");
      return;
    }

    setError("");
    setMessage("");

    // ==========================================
    // VALIDAR INFORMACIÓN PERSONAL
    // ==========================================

    if (
      !form.nombreCompleto.trim() ||
      !form.tipoDocumento ||
      !form.numeroDocumento.trim() ||
      !form.fechaNacimiento ||
      !form.nacionalidad.trim() ||
      !form.correo.trim()
    ) {
      setError("Complete los campos obligatorios.");
      return;
    }

    const correo = form.correo.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      setError("Ingrese un correo electrónico válido.");
      return;
    }

    // ==========================================
    // VALIDAR ROL
    // ==========================================

    if (
      esRegistro &&
      (
        !rolSeleccionado ||
        !Number.isInteger(Number(form.rolId)) ||
        Number(form.rolId) <= 0
      )
    ) {
      setError("Seleccione un rol válido.");
      return;
    }

    // ==========================================
    // VALIDAR CONTRASEÑAS
    // ==========================================

    if (esRegistro && !form.password) {
      setError("La contraseña es obligatoria.");
      return;
    }

    if (form.password && form.password.length < 8) {
      setError(
        "La contraseña debe tener al menos 8 caracteres."
      );
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    // ==========================================
    // VALIDAR INFORMACIÓN LABORAL
    // ==========================================

    if (esRegistro && esRolEmpleado) {

      if (
        !form.aeropuertoId ||
        !form.numeroEmpleado.trim() ||
        !form.puesto.trim()
      ) {
        setError(
          "Complete todos los campos de información laboral."
        );
        return;
      }

      const aeropuertoId = Number(form.aeropuertoId);

      const aeropuertoValido = aeropuertos.some(
        (aeropuerto) =>
          Number(aeropuerto.id) === aeropuertoId
      );

      if (
        !Number.isInteger(aeropuertoId) ||
        aeropuertoId <= 0 ||
        !aeropuertoValido
      ) {
        setError("Seleccione un aeropuerto válido.");
        return;
      }
    }

    // ==========================================
    // PREPARAR INFORMACIÓN PERSONAL
    // ==========================================

    const datos = {
      nombreCompleto: form.nombreCompleto.trim(),
      tipoDocumento: form.tipoDocumento,
      numeroDocumento: form.numeroDocumento.trim(),
      fechaNacimiento: form.fechaNacimiento,
      nacionalidad: form.nacionalidad.trim(),
      correo,
      telefono: form.telefono.trim() || null,
      direccion: form.direccion.trim() || null,
    };

    // El rol solamente se envía durante el registro.

    if (esRegistro) {
      datos.rolId = Number(form.rolId);
    }

    // La contraseña se envía cuando corresponde.

    if (esRegistro || form.password) {
      datos.password = form.password;
    }

    // ==========================================
    // INCORPORAR INFORMACIÓN LABORAL
    // ==========================================

    if (esRegistro && esRolEmpleado) {
      datos.aeropuertoId = Number(form.aeropuertoId);
      datos.numeroEmpleado = form.numeroEmpleado.trim();
      datos.puesto = form.puesto.trim();
    }

    // ==========================================
    // ENVIAR PETICIÓN AL BACKEND
    // ==========================================

    try {
      setSaving(true);

      if (!esRegistro) {

        await usuariosService.actualizar(editingId, datos);

        setMessage(
          "Los datos del usuario se actualizaron correctamente."
        );

      } else {

        await usuariosService.registrar(datos);

        setMessage(
          esRolEmpleado
            ? "El usuario y su información laboral se registraron correctamente."
            : "El usuario se registró correctamente."
        );
      }

      setModal(null);
      setForm(initialForm);
      setEditingId(null);
      setShowPassword(false);
      setShowConfirmPassword(false);

      await cargarDatos();

    } catch (err) {

      setError(obtenerMensajeError(err));

    } finally {

      setSaving(false);

    }
  }
  // ==========================================
  // ABRIR CONFIRMACIÓN DE DESACTIVACIÓN
  // ==========================================
  function openDeactivate(user) {
    if (!puedeCambiarEstado) return;
    setSelectedUser(user);
    setError("");
    setModal("deactivate");
  }
  function openReactivate(user) {
    if (!puedeCambiarEstado) return;
    setSelectedUser(user);
    setError("");
    setModal("reactivate");
  }
  function openDelete(user) {
    if (!puedeEliminar) return;
    setSelectedUser(user);
    setError("");
    setModal("delete");
  }
  // ==========================================
  // DESACTIVAR USUARIO
  // ==========================================
  async function confirmDeactivation() {

    if (
      !puedeCambiarEstado ||
      !selectedUser ||
      saving
    ) {
      return;
    }

    if (
      String(selectedUser.id) === String(usuario?.id)
    ) {
      setError(
        "No podés desactivar tu propia cuenta."
      );

      return;
    }

    try {

      setSaving(true);
      setError("");

      await usuariosService.desactivar(
        selectedUser.id
      );

      setModal(null);
      setSelectedUser(null);

      setMessage(
        "El usuario se desactivó correctamente."
      );

      await cargarDatos();

    } catch (err) {

      setError(obtenerMensajeError(err));

    } finally {

      setSaving(false);

    }
  }
  async function confirmReactivation() {
    if (!puedeCambiarEstado || !selectedUser || saving) return;
    try {
      setSaving(true);
      setError("");
      await usuariosService.reactivar(selectedUser.id);
      setModal(null);
      setSelectedUser(null);
      setMessage("El usuario se reactivó correctamente.");
      await cargarDatos();
    } catch (err) {
      setError(obtenerMensajeError(err));
    } finally {
      setSaving(false);
    }
  }
  async function confirmDelete() {

    if (
      !puedeEliminar ||
      !selectedUser ||
      saving
    ) {
      return;
    }

    if (
      String(selectedUser.id) === String(usuario?.id)
    ) {
      setError(
        "No podés eliminar tu propia cuenta."
      );

      return;
    }

    try {

      setSaving(true);
      setError("");

      await usuariosService.eliminar(
        selectedUser.id
      );

      setModal(null);
      setSelectedUser(null);

      setMessage(
        "El usuario se eliminó correctamente."
      );

      await cargarDatos();

    } catch (err) {

      setError(obtenerMensajeError(err));

    } finally {

      setSaving(false);

    }
  }
  async function openProfile() {
    setProfile(null);
    setError("");
    setProfileLoading(true);
    setModal("profile");
    try {
      setProfile(await usuariosService.perfil());
    } catch (err) {
      setError(obtenerMensajeError(err));
    } finally {
      setProfileLoading(false);
    }
  }
  // ==========================================
  // FUNCIONES AUXILIARES
  // ==========================================
  const getRoleName = (user) =>
    user.rol?.nombre || user.rol?.codigo || "Sin rol";
  const getInitials = (name = "") =>
    String(name || "")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  const profileData = { ...usuario, ...(profile?.usuario || profile || {}) };
  const profileRole =
    typeof profileData.rol === "string"
      ? profileData.rol
      : profileData.rol?.nombre || profileData.rol?.codigo || "—";
  // ==========================================
  // INTERFAZ
  // ==========================================
  function cerrarModal() {
    if (saving || profileLoading) return;
    setModal(null);
    setSelectedUser(null);
    setError("");
    setForm(initialForm);
    setEditingId(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
  }
  const confirmationConfig = {
    deactivate: {
      titulo: "Desactivar usuario",
      descripcion: "La cuenta perderá el acceso al sistema.",
      pregunta: "¿Desea desactivar la cuenta de",
      advertencia:
        "El usuario no podrá iniciar sesión hasta que su cuenta sea reactivada.",
      boton: "Confirmar desactivación",
      icono: UserRoundX,
      onConfirmar: confirmDeactivation,
      permitido: puedeCambiarEstado,
      estilosIcono: "bg-amber-100 text-amber-600",
      estilosAviso: "border-amber-200 bg-amber-50 text-amber-800",
      estilosBoton: "bg-amber-600 hover:bg-amber-700",
    },
    reactivate: {
      titulo: "Reactivar usuario",
      descripcion: "Restablezca el acceso de la cuenta al sistema.",
      pregunta: "¿Desea reactivar la cuenta de",
      advertencia:
        "El usuario podrá volver a iniciar sesión en la plataforma.",
      boton: "Confirmar reactivación",
      icono: UserRoundCheck,
      onConfirmar: confirmReactivation,
      permitido: puedeCambiarEstado,
      estilosIcono: "bg-emerald-100 text-emerald-600",
      estilosAviso: "border-emerald-200 bg-emerald-50 text-emerald-800",
      estilosBoton: "bg-emerald-600 hover:bg-emerald-700",
    },
    delete: {
      titulo: "Eliminar usuario",
      descripcion: "Solicite la eliminación de la cuenta.",
      pregunta: "¿Desea eliminar la cuenta de",
      advertencia:
        "Esta acción podría ser irreversible. Verifique la información antes de continuar.",
      boton: "Eliminar usuario",
      icono: Trash2,
      onConfirmar: confirmDelete,
      permitido: puedeEliminar,
      estilosIcono: "bg-red-100 text-red-600",
      estilosAviso: "border-red-200 bg-red-50 text-red-800",
      estilosBoton: "bg-red-600 hover:bg-red-700",
    },
  };
  const currentConfirmation = confirmationConfig[modal];
  const ConfirmationIcon = currentConfirmation?.icono;

  if (!puedeConsultar) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">

        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">

          <h2 className="text-xl font-bold text-[#0C2D57]">
            Acceso restringido
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            No tenés permisos para acceder al módulo
            de gestión de usuarios.
          </p>

        </div>

      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* ENCABEZADO SUPERIOR */}
      <main className="space-y-6">
        <PageHeader
          icono={Users}
          titulo="Gestión de usuarios"
          descripcion="Administra las cuentas y los roles de acceso a la plataforma."
          onActualizar={() => cargarDatos()}
          onNuevo={puedeCrear ? openCreate : undefined}
          textoBoton="Registrar usuario"
        />
        {/* TARJETAS DE ESTADÍSTICAS */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            titulo="Total de usuarios"
            valor={users.length}
          />
          <StatCard
            titulo="Usuarios activos"
            valor={activeUsers}
          />
          <StatCard
            titulo="Roles disponibles"
            valor={availableRoles.length}
          />
          <StatCard
            titulo="Usuarios inactivos"
            valor={inactiveUsers}
          />
        </section>
        {/* CONSULTA DE PERFIL */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={openProfile}
            className="inline-flex items-center gap-2 rounded-lg
                 border border-slate-200 bg-white px-4 py-2
                 text-sm font-medium text-[#0C2D57]
                 transition hover:bg-sky-50"
          >
            <UserRound size={18} />
            Mi perfil
          </button>
        </div>
        {/* DIRECTORIO DE USUARIOS */}
        <section className="overflow-hidden rounded-2xl border
                    border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h3 className="text-lg font-semibold text-[#0C2D57]">
              Directorio de usuarios
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Consulta y administra las cuentas registradas.
            </p>
          </div>
          {/* BÚSQUEDA Y FILTROS */}
          <div className="space-y-4 border-b border-slate-200 p-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2
                  xl:grid-cols-[minmax(0,2fr)_1fr_1fr_auto]">
              {/* BUSCADOR */}
              <div className="relative">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-3
                   top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar usuario..."
                  aria-label="Buscar por nombre, documento, correo o ID"
                  className="w-full rounded-lg border border-slate-300
                   bg-white py-2.5 pl-10 pr-4 text-sm
                   text-slate-700 outline-none transition
                   placeholder:text-slate-400
                   focus:border-sky-500 focus:ring-2
                   focus:ring-sky-100"
                />
              </div>
              {/* FILTRO POR ROL */}
              <select
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
                aria-label="Filtrar por rol"
                className="w-full rounded-lg border border-slate-300
                 bg-white px-3 py-2.5 text-sm text-slate-700
                 outline-none transition focus:border-sky-500
                 focus:ring-2 focus:ring-sky-100"
              >
                <option value="todos">Todos los roles</option>
                {availableRoles.map((role) => (
                  <option
                    key={role.id}
                    value={String(role.id)}
                  >
                    {role.nombre || role.codigo}
                  </option>
                ))}
              </select>
              {/* FILTRO POR ESTADO */}
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                aria-label="Filtrar por estado"
                className="w-full rounded-lg border border-slate-300
                 bg-white px-3 py-2.5 text-sm text-slate-700
                 outline-none transition focus:border-sky-500
                 focus:ring-2 focus:ring-sky-100"
              >
                <option value="todos">Todos los estados</option>
                <option value="ACTIVO">Activo</option>
                <option value="INACTIVO">Inactivo</option>
              </select>
              {/* LIMPIAR FILTROS */}
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setRoleFilter("todos");
                  setStatusFilter("todos");
                }}
                disabled={
                  search === "" &&
                  roleFilter === "todos" &&
                  statusFilter === "todos"
                }
                className="inline-flex items-center justify-center
                 gap-2 whitespace-nowrap rounded-lg
                 border border-slate-300 bg-white
                 px-4 py-2.5 text-sm font-medium
                 text-slate-600 transition hover:bg-slate-50
                 hover:text-[#0C2D57] disabled:cursor-not-allowed
                 disabled:opacity-50"
              >
                <RotateCcw size={16} />
                Limpiar filtros
              </button>
            </div>
            {/* CANTIDAD DE RESULTADOS */}
            <p className="text-sm text-slate-500">
              Mostrando{" "}
              <span className="font-semibold text-[#0C2D57]">
                {visibleUsers.length}
              </span>
              {" "}de{" "}
              <span className="font-semibold text-[#0C2D57]">
                {users.length}
              </span>
              {" "}usuarios
            </p>
          </div>
          {/* MENSAJES */}
          {message && (
            <div
              role="status"
              className="mx-6 mt-4 flex items-center gap-3
               rounded-lg border border-emerald-200
               bg-emerald-50 px-4 py-3
               text-sm text-emerald-700"
            >
              <Check size={18} className="shrink-0" />
              <span className="flex-1">{message}</span>
              <button
                type="button"
                onClick={() => setMessage("")}
                aria-label="Cerrar mensaje"
                className="rounded-md p-1 hover:bg-emerald-100"
              >
                <X size={16} />
              </button>
            </div>
          )}
          {error && !modal && (
            <div
              role="alert"
              className="mx-6 mt-4 flex items-center gap-3
               rounded-lg border border-red-200
               bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              <span className="flex-1">{error}</span>
              <button
                type="button"
                onClick={() => setError("")}
                aria-label="Cerrar mensaje de error"
                className="rounded-md p-1 hover:bg-red-100"
              >
                <X size={16} />
              </button>
            </div>
          )}
          {/* TABLA */}
          <div className="max-h-[600px] overflow-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
              {/* ENCABEZADOS */}
              <thead className="sticky top-0 z-10 bg-slate-50
                      text-xs font-semibold uppercase
                      tracking-wide text-slate-600">
                <tr className="border-b border-slate-200">
                  <th className="px-6 py-4">Usuario</th>
                  <th className="px-4 py-4">ID usuario</th>
                  <th className="px-4 py-4">Documento</th>
                  <th className="px-4 py-4">Rol asignado</th>
                  <th className="px-4 py-4">Estado</th>
                  <th className="px-4 py-4">Fecha de registro</th>
                  <th className="px-6 py-4 text-center">Acciones</th>
                </tr>
              </thead>
              {/* CUERPO DE LA TABLA */}
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16">
                      <div className="flex flex-col items-center
                            justify-center gap-3 text-slate-500">
                        <LoaderCircle
                          size={30}
                          className="animate-spin text-sky-600"
                        />
                        <span>Cargando usuarios...</span>
                      </div>
                    </td>
                  </tr>
                ) : visibleUsers.length > 0 ? (
                  visibleUsers.map((user) => {
                    const roleName = getRoleName(user);
                    const isActive = user.estado === "ACTIVO";
                    return (
                      <tr
                        key={user.id}
                        className="transition-colors hover:bg-slate-50"
                      >
                        {/* USUARIO */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0
                                  items-center justify-center
                                  rounded-full bg-sky-100
                                  font-semibold text-sky-700">
                              {getInitials(user.nombreCompleto)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-[#0C2D57]">
                                {user.nombreCompleto}
                              </p>
                              <p className="mt-0.5 text-xs text-slate-500">
                                {user.correo}
                              </p>
                            </div>
                          </div>
                        </td>
                        {/* IDENTIFICADOR */}
                        <td className="px-4 py-4 text-slate-600">
                          #{user.id}
                        </td>
                        {/* DOCUMENTO */}
                        <td className="whitespace-nowrap px-4 py-4">
                          <p className="font-medium text-slate-700">
                            {user.numeroDocumento || "—"}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {user.tipoDocumento || "—"}
                          </p>
                        </td>
                        {/* ROL ASIGNADO */}
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center
                                 gap-1.5 rounded-full
                                 bg-sky-50 px-3 py-1.5
                                 text-xs font-medium text-sky-700">
                            <ShieldCheck size={14} />
                            {roleName}
                          </span>
                        </td>
                        {/* ESTADO */}
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5
                    rounded-full px-3 py-1.5 text-xs font-medium
                    ${isActive
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-600"
                              }`}
                          >
                            <span
                              className={`h-2 w-2 rounded-full ${isActive
                                ? "bg-emerald-500"
                                : "bg-slate-400"
                                }`}
                            />
                            {isActive ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        {/* FECHA DE REGISTRO */}
                        <td className="whitespace-nowrap px-4 py-4
                             text-slate-600">
                          {formatearFecha(user.creadoEn)}
                        </td>
                        {/* ACCIONES */}
                        <td className="px-6 py-4">
                          <div className="flex items-center
                                justify-center gap-2">
                            {/* EDITAR */}
                            {puedeEditar && (
                              <button
                                type="button"
                                title="Editar usuario"
                                aria-label={`Editar ${user.nombreCompleto}`}
                                onClick={() => openEdit(user)}
                                className="rounded-lg border border-sky-200
                                 bg-sky-50 p-2 text-sky-700
                                 transition hover:bg-sky-100"
                              >
                                <Pencil size={17} />
                              </button>
                            )}
                            {/* DESACTIVAR O REACTIVAR */}
                            {puedeCambiarEstado && (
                              isActive ? (
                                <button
                                  type="button"
                                  title="Desactivar usuario"
                                  aria-label={`Desactivar ${user.nombreCompleto}`}
                                  onClick={() => openDeactivate(user)}
                                  className="rounded-lg border border-amber-200
                                   bg-amber-50 p-2 text-amber-700
                                   transition hover:bg-amber-100"
                                >
                                  <UserRoundX size={17} />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  title="Reactivar usuario"
                                  aria-label={`Reactivar ${user.nombreCompleto}`}
                                  onClick={() => openReactivate(user)}
                                  className="rounded-lg border border-emerald-200
                                   bg-emerald-50 p-2 text-emerald-700
                                   transition hover:bg-emerald-100"
                                >
                                  <UserRoundCheck size={17} />
                                </button>
                              )
                            )}
                            {/* ELIMINAR */}
                            {puedeEliminar && (
                              <button
                                type="button"
                                title="Eliminar usuario"
                                aria-label={`Eliminar ${user.nombreCompleto}`}
                                onClick={() => openDelete(user)}
                                className="rounded-lg border border-red-200
                                 bg-red-50 p-2 text-red-600
                                 transition hover:bg-red-100"
                              >
                                <Trash2 size={17} />
                              </button>
                            )}
                            {/* SIN PERMISOS DE MODIFICACIÓN */}
                            {!puedeEditar &&
                              !puedeCambiarEstado &&
                              !puedeEliminar && (
                                <span className="whitespace-nowrap
                                     text-xs text-slate-400">
                                  Solo consulta
                                </span>
                              )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-16">
                      <div className="flex flex-col items-center
                            justify-center gap-3 text-center">
                        <div className="rounded-full bg-slate-100 p-4">
                          <Users size={30} className="text-slate-400" />
                        </div>
                        <p className="font-semibold text-[#0C2D57]">
                          {users.length === 0
                            ? "No hay usuarios registrados"
                            : "No se encontraron usuarios"}
                        </p>
                        <p className="text-sm text-slate-500">
                          {users.length === 0
                            ? "Los usuarios registrados aparecerán aquí."
                            : "Intentá modificar los criterios de búsqueda."}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* PIE DE TABLA */}
          <footer className="flex flex-wrap items-center
                   justify-between gap-3 border-t
                   border-slate-200 bg-slate-50
                   px-6 py-4 text-xs text-slate-500">
            <span>
              Total de registros encontrados:{" "}
              <strong className="text-[#0C2D57]">
                {visibleUsers.length}
              </strong>
            </span>
            <span>
              Global Airport · Administración de usuarios
            </span>
          </footer>
        </section>
      </main>
      {/* ======================================
    MODAL DE REGISTRO Y EDICIÓN
====================================== */}
      {modal === "form" &&
        (editingId !== null ? puedeEditar : puedeCrear) && (
          <div
            className="fixed inset-0 z-50 flex items-center
               justify-center bg-slate-900/50 p-4
               backdrop-blur-sm"
            onMouseDown={(event) => {
              if (
                event.target === event.currentTarget &&
                !saving
              ) {
                cerrarModal();
              }
            }}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="usuario-modal-titulo"
              className="flex max-h-[90dvh] w-full max-w-3xl
                 flex-col overflow-hidden rounded-2xl
                 bg-white shadow-2xl"
            >
              {/* ENCABEZADO */}
              <header className="flex shrink-0 items-center
                         justify-between gap-4 border-b
                         border-slate-200 px-6 py-5">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-sky-100
                          p-3 text-sky-700">
                    {editingId ? (
                      <Pencil size={24} />
                    ) : (
                      <UserRoundPlus size={24} />
                    )}
                  </div>
                  <div>
                    <h3
                      id="usuario-modal-titulo"
                      className="text-xl font-semibold
                         text-[#0C2D57]"
                    >
                      {editingId
                        ? "Modificar usuario"
                        : "Registrar usuario"}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {editingId
                        ? `ID ${editingId} · Actualice los datos de la cuenta.`
                        : "Complete los datos para crear una nueva cuenta."}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Cerrar modal"
                  disabled={saving}
                  onClick={cerrarModal}
                  className="rounded-lg p-2 text-slate-500
                     transition hover:bg-slate-100
                     disabled:opacity-50"
                >
                  <X size={22} />
                </button>
              </header>
              {/* FORMULARIO */}
              <form
                onSubmit={saveUser}
                className="flex min-h-0 flex-1 flex-col"
              >
                <div className="min-h-0 flex-1 space-y-6
                        overflow-y-auto p-6">
                  {/* MENSAJE DE ERROR */}
                  {error && (
                    <div
                      role="alert"
                      className="rounded-lg border border-red-200
                         bg-red-50 px-4 py-3
                         text-sm text-red-700"
                    >
                      {error}
                    </div>
                  )}
                  <fieldset
                    disabled={saving}
                    className="min-w-0 space-y-6"
                  >
                    {/* INFORMACIÓN PERSONAL */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <UserRound
                          size={19}
                          className="text-sky-600"
                        />
                        <h4 className="font-semibold text-[#0C2D57]">
                          Información personal
                        </h4>
                      </div>
                      <div className="grid grid-cols-1
                              gap-4 sm:grid-cols-2">
                        {/* NOMBRE COMPLETO */}
                        <label className="space-y-1.5 sm:col-span-2">
                          <span className={labelClass}>
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
                            className={inputClass}
                            required
                          />
                        </label>
                        {/* TIPO DE DOCUMENTO */}
                        <label className="space-y-1.5">
                          <span className={labelClass}>
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
                            className={inputClass}
                            required
                          >
                            <option value="CEDULA">
                              Cédula
                            </option>
                            <option value="PASAPORTE">
                              Pasaporte
                            </option>
                            <option value="RESIDENCIA">
                              Documento de residencia
                            </option>
                          </select>
                        </label>
                        {/* NÚMERO DE DOCUMENTO */}
                        <label className="space-y-1.5">
                          <span className={labelClass}>
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
                            className={inputClass}
                            required
                          />
                        </label>
                        {/* FECHA DE NACIMIENTO */}
                        <label className="space-y-1.5">
                          <span className={labelClass}>
                            Fecha de nacimiento *
                          </span>
                          <input
                            type="date"
                            value={form.fechaNacimiento}
                            onChange={(event) =>
                              updateForm(
                                "fechaNacimiento",
                                event.target.value
                              )
                            }
                            max={fechaMaxima}
                            className={inputClass}
                            required
                          />
                        </label>
                        {/* NACIONALIDAD */}
                        <label className="space-y-1.5">
                          <span className={labelClass}>
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
                            placeholder="Ej. Costa Rica"
                            className={inputClass}
                            required
                          />
                        </label>
                        {/* CORREO ELECTRÓNICO */}
                        <label className="space-y-1.5">
                          <span className={labelClass}>
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
                            placeholder="usuario@correo.com"
                            className={inputClass}
                            required
                          />
                        </label>
                        {/* TELÉFONO */}
                        <label className="space-y-1.5">
                          <span className={labelClass}>
                            Número telefónico
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
                            className={inputClass}
                          />
                        </label>
                        {/* DIRECCIÓN */}
                        <label className="space-y-1.5 sm:col-span-2">
                          <span className={labelClass}>
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
                            className={`${inputClass} resize-y`}
                          />
                        </label>
                      </div>
                    </div>
                    {/* INFORMACIÓN DE ACCESO */}
                    <div className="space-y-4 border-t
                            border-slate-200 pt-6">
                      <div className="flex items-center gap-2">
                        <ShieldCheck
                          size={19}
                          className="text-sky-600"
                        />
                        <h4 className="font-semibold text-[#0C2D57]">
                          Información de acceso
                        </h4>
                      </div>
                      {/* ROL */}
                      <label className="block space-y-1.5">
                        <span className={labelClass}>
                          Rol asignado {!editingId && "*"}
                        </span>
                        <select
                          value={form.rolId}
                          onChange={(event) =>
                            updateForm(
                              "rolId",
                              event.target.value
                            )
                          }
                          required={!editingId}
                          disabled={Boolean(editingId)}
                          className={inputClass}
                        >
                          <option value="">
                            Seleccione un rol
                          </option>
                          {availableRoles.map((role) => (
                            <option
                              key={role.id}
                              value={String(role.id)}
                            >
                              {role.nombre || role.codigo}
                            </option>
                          ))}
                        </select>
                        <span className="block text-xs text-slate-500">
                          {editingId
                            ? "El rol no se puede modificar desde este formulario."
                            : "El rol define los permisos de acceso a la plataforma."}
                        </span>
                      </label>
                      {/* CONTRASEÑAS */}
                      <div className="grid grid-cols-1
                              gap-4 sm:grid-cols-2">
                        {/* CONTRASEÑA */}
                        <div className="space-y-1.5">
                          <label
                            htmlFor="usuario-password"
                            className={labelClass}
                          >
                            {editingId
                              ? "Nueva contraseña (opcional)"
                              : "Contraseña *"}
                          </label>
                          <div className="relative">
                            <input
                              id="usuario-password"
                              type={showPassword ? "text" : "password"}
                              value={form.password}
                              onChange={(event) =>
                                updateForm(
                                  "password",
                                  event.target.value
                                )
                              }
                              placeholder="Mínimo 8 caracteres"
                              autoComplete="new-password"
                              minLength={8}
                              required={!editingId}
                              className={`${inputClass} pr-11`}
                            />
                            <button
                              type="button"
                              aria-label={
                                showPassword
                                  ? "Ocultar contraseña"
                                  : "Mostrar contraseña"
                              }
                              onClick={() =>
                                setShowPassword((current) => !current)
                              }
                              className="absolute right-3 top-1/2
                                 -translate-y-1/2
                                 text-slate-400
                                 hover:text-sky-600"
                            >
                              {showPassword
                                ? <EyeOff size={18} />
                                : <Eye size={18} />}
                            </button>
                          </div>
                        </div>
                        {/* CONFIRMAR CONTRASEÑA */}
                        <div className="space-y-1.5">
                          <label
                            htmlFor="usuario-confirm-password"
                            className={labelClass}
                          >
                            {editingId
                              ? "Confirmar nueva contraseña"
                              : "Confirmar contraseña *"}
                          </label>
                          <div className="relative">
                            <input
                              id="usuario-confirm-password"
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
                              placeholder="Repetir contraseña"
                              autoComplete="new-password"
                              minLength={8}
                              required={
                                !editingId || Boolean(form.password)
                              }
                              className={`${inputClass} pr-11`}
                            />
                            <button
                              type="button"
                              aria-label={
                                showConfirmPassword
                                  ? "Ocultar confirmación"
                                  : "Mostrar confirmación"
                              }
                              onClick={() =>
                                setShowConfirmPassword(
                                  (current) => !current
                                )
                              }
                              className="absolute right-3 top-1/2
                                 -translate-y-1/2
                                 text-slate-400
                                 hover:text-sky-600"
                            >
                              {showConfirmPassword
                                ? <EyeOff size={18} />
                                : <Eye size={18} />}
                            </button>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500">
                        {editingId
                          ? "Deje ambos campos vacíos si no desea cambiar la contraseña."
                          : "La contraseña debe contener al menos 8 caracteres."}
                      </p>
                    </div>
                    {mostrarInformacionLaboral && (
                      <section className="space-y-5 rounded-xl border border-sky-200 bg-sky-50/50 p-5">

                        {/* Encabezado de la sección */}
                        <div className="flex items-start gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                            <BriefcaseBusiness size={21} />
                          </div>

                          <div>
                            <h3 className="text-base font-semibold text-[#0C2D57]">
                              Información laboral
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                              Definí el aeropuerto y las funciones que tendrá
                              el empleado dentro de Global Airport.
                            </p>
                          </div>

                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                          {/* Aeropuerto asignado */}
                          <label className="space-y-2 sm:col-span-2">

                            <span className="text-sm font-medium text-slate-700">
                              Aeropuerto asignado *
                            </span>

                            <div className="relative">

                              <Building2
                                size={18}
                                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                              />

                              <select
                                value={form.aeropuertoId}
                                onChange={(e) =>
                                  updateForm("aeropuertoId", e.target.value)
                                }
                                required
                                className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                              >

                                <option value="">
                                  Seleccione un aeropuerto
                                </option>

                                {aeropuertos.map((aeropuerto) => (
                                  <option
                                    key={aeropuerto.id}
                                    value={aeropuerto.id}
                                  >
                                    {aeropuerto.nombre} ({aeropuerto.codigoIata})
                                  </option>
                                ))}

                              </select>

                            </div>

                            <p className="text-xs text-slate-500">
                              El empleado tendrá acceso operativo al aeropuerto
                              seleccionado.
                            </p>

                          </label>

                          {/* Número de empleado */}
                          <label className="space-y-2">

                            <span className="text-sm font-medium text-slate-700">
                              Número de empleado *
                            </span>

                            <input
                              type="text"
                              value={form.numeroEmpleado}
                              onChange={(e) =>
                                updateForm("numeroEmpleado", e.target.value)
                              }
                              placeholder="Ej. EMP-001"
                              required
                              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                            />

                          </label>

                          {/* Puesto de trabajo */}
                          <label className="space-y-2">

                            <span className="text-sm font-medium text-slate-700">
                              Puesto de trabajo *
                            </span>

                            <input
                              type="text"
                              value={form.puesto}
                              onChange={(e) =>
                                updateForm("puesto", e.target.value)
                              }
                              placeholder="Ej. Recepcionista"
                              required
                              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                            />

                          </label>

                        </div>

                        {/* Mensaje informativo */}
                        <div className="flex items-start gap-3 rounded-lg border border-sky-100 bg-white p-3">

                          <BriefcaseBusiness
                            size={18}
                            className="mt-0.5 shrink-0 text-sky-600"
                          />

                          <p className="text-xs leading-relaxed text-slate-600">
                            Al registrar esta cuenta, el sistema creará
                            automáticamente el registro del usuario y su
                            información laboral como empleado del aeropuerto
                            seleccionado.
                          </p>

                        </div>

                      </section>
                    )}
                  </fieldset>
                </div>
                {/* PIE DEL MODAL */}
                <footer className="flex shrink-0 flex-wrap
                           items-center justify-end gap-3
                           border-t border-slate-200
                           bg-slate-50 px-6 py-4">
                  <button
                    type="button"
                    onClick={cerrarModal}
                    disabled={saving}
                    className="rounded-lg border border-slate-300
                       bg-white px-5 py-2.5 text-sm
                       font-medium text-slate-600
                       transition hover:bg-slate-100
                       disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2
                       rounded-lg bg-sky-600 px-5 py-2.5
                       text-sm font-medium text-white
                       transition hover:bg-sky-700
                       disabled:cursor-not-allowed
                       disabled:opacity-50"
                  >
                    {saving ? (
                      <LoaderCircle
                        size={17}
                        className="animate-spin"
                      />
                    ) : (
                      <Save size={17} />
                    )}
                    {saving
                      ? "Guardando..."
                      : editingId
                        ? "Guardar cambios"
                        : "Registrar usuario"}
                  </button>
                </footer>
              </form>
            </section>
          </div>
        )}
      {/* MODALES DE CONFIRMACIÓN */}
      {currentConfirmation && currentConfirmation.permitido && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) cerrarModal(); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="confirmacion-usuario-titulo"
            className="flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
              <div className="flex items-center gap-4">
                <div className={`shrink-0 rounded-xl p-3 ${currentConfirmation.estilosIcono}`}><ConfirmationIcon size={25} /></div>
                <div><h3 id="confirmacion-usuario-titulo" className="text-xl font-semibold text-[#0C2D57]">{currentConfirmation.titulo}</h3>
                  <p className="mt-1 text-sm text-slate-500">{currentConfirmation.descripcion}</p></div>
              </div>
              <button type="button" aria-label="Cerrar modal" disabled={saving} onClick={cerrarModal} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"><X size={20} /></button>
            </header>
            <div className="space-y-5 overflow-y-auto p-6">
              {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
              <p className="text-sm text-slate-600">{currentConfirmation.pregunta}{" "}<strong className="text-[#0C2D57]">{selectedUser.nombreCompleto}</strong>?</p>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sky-100 font-semibold text-sky-700">{getInitials(selectedUser.nombreCompleto)}</div>
                  <div className="min-w-0"><p className="break-words font-semibold text-[#0C2D57]">{selectedUser.nombreCompleto}</p><p className="break-all text-sm text-slate-500">{selectedUser.correo}</p></div>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-200 pt-4 text-sm">
                  <div><dt className="text-xs text-slate-500">ID usuario</dt><dd>#{selectedUser.id}</dd></div>
                  <div><dt className="text-xs text-slate-500">Rol asignado</dt><dd>{getRoleName(selectedUser)}</dd></div>
                  <div><dt className="text-xs text-slate-500">Estado actual</dt><dd>{selectedUser.estado}</dd></div>
                </dl>
              </div>
              <div className={`flex items-start gap-3 rounded-lg border p-4 text-sm ${currentConfirmation.estilosAviso}`}><TriangleAlert size={19} className="shrink-0" /><p>{currentConfirmation.advertencia}</p></div>
            </div>
            <footer className="flex shrink-0 flex-wrap justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
              <button type="button" disabled={saving} onClick={cerrarModal} className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50">Cancelar</button>
              <button type="button" disabled={saving} onClick={currentConfirmation.onConfirmar} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50 ${currentConfirmation.estilosBoton}`}>
                {saving ? <LoaderCircle size={17} className="animate-spin" /> : <ConfirmationIcon size={17} />}
                {saving ? "Procesando..." : currentConfirmation.boton}
              </button>
            </footer>
          </section>
        </div>
      )}
      {/* MODAL DE PERFIL */}
      {modal === "profile" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget && !profileLoading) cerrarModal(); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="perfil-titulo" className="flex max-h-[90dvh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <header className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-5">
              <div className="flex items-center gap-3"><div className="rounded-xl bg-sky-100 p-3 text-sky-700"><UserRound size={24} /></div><div><h3 id="perfil-titulo" className="text-xl font-semibold text-[#0C2D57]">Mi perfil</h3><p className="text-sm text-slate-500">Información de la cuenta autenticada.</p></div></div>
              <button type="button" disabled={profileLoading} onClick={cerrarModal} aria-label="Cerrar perfil" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"><X size={20} /></button>
            </header>
            <div className="overflow-y-auto p-6">
              {profileLoading ? <div className="flex items-center justify-center gap-3 py-10 text-slate-500"><LoaderCircle className="animate-spin text-sky-600" />Cargando perfil...</div> : error ? <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : (
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {[
                    ["Nombre completo", profileData.nombreCompleto],
                    ["Documento", [profileData.tipoDocumento, profileData.numeroDocumento].filter(Boolean).join(" · ")],
                    ["Correo electrónico", profileData.correo],
                    ["Teléfono", profileData.telefono],
                    ["Rol", profileRole],
                    ["Estado", profileData.estado],
                    ["Fecha de registro", formatearFecha(profileData.creadoEn)],
                  ].map(([label, value]) => <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 p-4"><dt className="text-xs text-slate-500">{label}</dt><dd className="mt-1 break-words text-sm font-medium text-[#0C2D57]">{value || "—"}</dd></div>)}
                </dl>
              )}
            </div>
            <footer className="flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-4"><button type="button" disabled={profileLoading} onClick={cerrarModal} className="rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50">Cerrar</button></footer>
          </section>
        </div>
      )}
    </div>
  );
}

