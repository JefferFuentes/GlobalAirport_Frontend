
import { useEffect, useMemo, useState } from "react";

import {
  Bell,
  Search,
  Plus,
  Users,
  UserRound,
  ShieldCheck,
  Pencil,
  SlidersHorizontal,
  ChevronDown,
  X,
  Check,
  Trash2,
  RotateCcw,
} from "lucide-react";

import "./css/userManagement.css";
import usuarioService from "../services/userService";
import rolService from "../services/rolService";

const initialForm = {
  nombreCompleto: "",
  identificacion: "",
  correo: "",
  telefono: "",
  rolId: "",
  password: "",
  confirmPassword: "",
};

function obtenerMensajeError(error) {
  const erroresValidacion = error.response?.data?.errores;

  return (
    error.response?.data?.mensaje ||
    error.response?.data?.message ||
    error.response?.data?.error ||
    (Array.isArray(erroresValidacion)
      ? erroresValidacion.join(". ")
      : null) ||
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

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  async function cargarDatos() {
    try {
      setLoading(true);
      setError("");

      const [usuariosData, rolesData] = await Promise.all([
        usuarioService.listar(),
        rolService.listar(),
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

      setUsers(usuariosData);
      setRoles(rolesData);
    } catch (err) {
      setError(obtenerMensajeError(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarDatos();
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
        user.identificacion || "",
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
    setEditingId(null);
    setForm(initialForm);
    setError("");
    setMessage("");
    setModal("form");
  }

  // ==========================================
  // ABRIR FORMULARIO DE EDICIÓN
  // ==========================================

  function openEdit(user) {
    setEditingId(user.id);

    const userRoleId = user.rolId ?? user.rol?.id;
    const currentRole = roles.find(
      (role) => String(role.id) === String(userRoleId)
    );
    const currentRoleCode = user.rol?.codigo || currentRole?.codigo;

    setForm({
      nombreCompleto: user.nombreCompleto || "",
      identificacion: user.identificacion || "",
      correo: user.correo || "",
      telefono: user.telefono || "",
      rolId:
        String(currentRoleCode || "").toUpperCase() === "PILOTO"
          ? ""
          : String(userRoleId ?? ""),
      password: "",
      confirmPassword: "",
    });

    setError("");
    setMessage("");
    setModal("form");
  }

  // ==========================================
  // ACTUALIZAR CAMPOS DEL FORMULARIO
  // ==========================================

  function updateForm(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  // ==========================================
  // REGISTRAR O MODIFICAR USUARIO
  // ==========================================

  async function saveUser(event) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (
      !form.nombreCompleto.trim() ||
      !form.identificacion.trim() ||
      !form.correo.trim() ||
      !form.rolId
    ) {
      setError("Complete los campos obligatorios.");
      return;
    }

    const correo = form.correo.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      setError("Ingrese un correo electrónico válido.");
      return;
    }

    // Validar contraseña al registrar.
    if (!editingId) {
      if (!form.password) {
        setError("La contraseña es obligatoria.");
        return;
      }

      if (form.password.length < 8) {
        setError(
          "La contraseña debe tener al menos 8 caracteres."
        );
        return;
      }

      if (form.password !== form.confirmPassword) {
        setError("Las contraseñas no coinciden.");
        return;
      }
    }

    // Validar contraseña al editar.
    else if (form.password) {
      if (form.password.length < 8) {
        setError(
          "La nueva contraseña debe tener al menos 8 caracteres."
        );
        return;
      }

      if (form.password !== form.confirmPassword) {
        setError("Las contraseñas no coinciden.");
        return;
      }
    }

    // Datos que acepta el Backend.
    const datos = {
      nombreCompleto: form.nombreCompleto.trim(),
      identificacion: form.identificacion.trim(),
      correo,
      telefono: form.telefono.trim() || null,
      rolId: Number(form.rolId),
    };

    // La contraseña solo se envía cuando corresponde.
    if (!editingId || form.password) {
      datos.password = form.password;
    }

    try {
      setSaving(true);

      if (editingId) {
        await usuarioService.actualizar(editingId, datos);

        setMessage(
          "Los datos del usuario se actualizaron correctamente."
        );
      } else {
        await usuarioService.crear(datos);

        setMessage("El usuario se registró correctamente.");
      }

      setModal(null);
      setForm(initialForm);
      setEditingId(null);

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
    setSelectedUser(user);
    setError("");
    setModal("deactivate");
  }

  function openReactivate(user) {
    setSelectedUser(user);
    setError("");
    setModal("reactivate");
  }

  function openDelete(user) {
    setSelectedUser(user);
    setError("");
    setModal("delete");
  }

  // ==========================================
  // DESACTIVAR USUARIO
  // ==========================================

  async function confirmDeactivation() {
    if (!selectedUser) return;

    try {
      setSaving(true);
      setError("");

      await usuarioService.desactivar(selectedUser.id);

      setModal(null);
      setSelectedUser(null);

      setMessage("El usuario se desactivó correctamente.");

      await cargarDatos();
    } catch (err) {
      setError(obtenerMensajeError(err));
    } finally {
      setSaving(false);
    }
  }

  async function confirmReactivation() {
    if (!selectedUser) return;

    try {
      setSaving(true);
      setError("");

      await usuarioService.reactivar(selectedUser.id);
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
    if (!selectedUser) return;

    try {
      setSaving(true);
      setError("");

      await usuarioService.eliminar(selectedUser.id);
      setModal(null);
      setSelectedUser(null);
      setMessage("El usuario se eliminó correctamente.");
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
      setProfile(await usuarioService.perfil());
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
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();

  const profileData = profile?.usuario || profile || {};
  const profileRole =
    typeof profileData.rol === "string"
      ? profileData.rol
      : profileData.rol?.nombre || profileData.rol?.codigo || "—";

  // ==========================================
  // INTERFAZ
  // ==========================================

  return (
    <div className="users-page">

      {/* ENCABEZADO SUPERIOR */}

      <header className="ua-topbar">
        <div>
          <div className="ua-breadcrumb">
            Global Airport　/　Usuarios
          </div>

          <h2>Gestión de usuarios</h2>
        </div>

        <div className="ua-top-actions">
          <div className="ua-module-search">
            <Search size={17} />
            <span>Buscar módulo...</span>
          </div>

          <button
            className="ua-icon-button"
            aria-label="Notificaciones"
            type="button"
          >
            <Bell size={19} />
          </button>

          <button
            className="ua-avatar ua-avatar-button"
            type="button"
            onClick={openProfile}
            aria-label="Consultar mi perfil"
            title="Consultar mi perfil"
          >
            GA
          </button>
        </div>
      </header>

      <main className="ua-content">

        {/* TÍTULO Y BOTÓN DE REGISTRO */}

        <div className="ua-page-heading">
          <div>
            <div className="ua-eyebrow">
              Administración del sistema
            </div>

            <h1>Gestión de usuarios</h1>

            <p>
              Administra las cuentas y los roles de acceso
              a la plataforma.
            </p>
          </div>

          <button
            className="ua-primary"
            onClick={openCreate}
            type="button"
          >
            <Plus size={19} />
            Registrar usuario
          </button>
        </div>

        {/* TARJETAS DE ESTADÍSTICAS */}

        <section className="ua-stats">

          <article className="ua-stat">
            <div className="ua-stat-icon blue">
              <Users />
            </div>

            <div>
              <div className="ua-stat-label">
                Total de usuarios
              </div>

              <div className="ua-stat-value">
                {users.length}
              </div>
            </div>
          </article>

          <article className="ua-stat">
            <div className="ua-stat-icon green">
              <UserRound />
            </div>

            <div>
              <div className="ua-stat-label">
                Usuarios activos
              </div>

              <div className="ua-stat-value">
                {activeUsers}
              </div>
            </div>
          </article>

          <article className="ua-stat">
            <div className="ua-stat-icon sky">
              <ShieldCheck />
            </div>

            <div>
              <div className="ua-stat-label">
                Roles disponibles
              </div>

              <div className="ua-stat-value">
                {availableRoles.length}
              </div>
            </div>
          </article>

          <article className="ua-stat">
            <div className="ua-stat-icon gray">
              <UserRound />
            </div>

            <div>
              <div className="ua-stat-label">
                Usuarios inactivos
              </div>

              <div className="ua-stat-value">
                {inactiveUsers}
              </div>
            </div>
          </article>

        </section>

        {/* DIRECTORIO DE USUARIOS */}

        <section className="ua-panel">

          <div className="ua-panel-heading">
            <div>
              <h3>Directorio de usuarios</h3>
              <p>
                Consulta y administra las cuentas registradas.
              </p>
            </div>
          </div>

          {/* BÚSQUEDA Y FILTROS */}

          <div className="ua-toolbar">

            <label className="ua-search-box">
              <Search size={18} />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Buscar por nombre, identificación, correo o ID..."
                aria-label="Buscar usuarios"
              />
            </label>

            <label className="ua-filter">
              <select
                value={roleFilter}
                onChange={(event) =>
                  setRoleFilter(event.target.value)
                }
                aria-label="Filtrar por rol"
                style={{
                  border: 0,
                  outline: 0,
                  background: "transparent",
                  color: "inherit",
                  width: "100%",
                  minWidth: 0,
                }}
              >
                <option value="todos">Todos los roles</option>

                {availableRoles.map((role) => (
                  <option
                    key={role.id}
                    value={String(role.id)}
                  >
                    {role.nombre}
                  </option>
                ))}
              </select>

              <ChevronDown size={16} />
            </label>

            <label className="ua-filter">
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                aria-label="Filtrar por estado"
                style={{
                  border: 0,
                  outline: 0,
                  background: "transparent",
                  color: "inherit",
                  width: "100%",
                  minWidth: 0,
                }}
              >
                <option value="todos">Todos los estados</option>
                <option value="ACTIVO">Activo</option>
                <option value="INACTIVO">Inactivo</option>
              </select>

              <ChevronDown size={16} />
            </label>

            <button
              className="ua-filter-icon"
              title="Limpiar filtros"
              aria-label="Limpiar filtros"
              type="button"
              onClick={() => {
                setSearch("");
                setRoleFilter("todos");
                setStatusFilter("todos");
              }}
            >
              <SlidersHorizontal size={18} />
            </button>

          </div>

          {/* MENSAJES */}

          {message && (
            <div className="ua-notice">
              {message}
            </div>
          )}

          {error && !modal && (
            <div
              className="ua-error"
              style={{ margin: "0 23px 18px" }}
            >
              {error}
            </div>
          )}

          {/* TABLA */}

          <div className="ua-table-wrap">
            <table className="ua-table">

              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>ID usuario</th>
                  <th>Identificación</th>
                  <th>Rol asignado</th>
                  <th>Estado</th>
                  <th>Fecha de registro</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>

                {loading ? (
                  <tr>
                    <td className="ua-empty" colSpan={7}>
                      Cargando usuarios...
                    </td>
                  </tr>
                ) : visibleUsers.length > 0 ? (

                  visibleUsers.map((user) => {
                    const roleName = getRoleName(user);
                    const isActive = user.estado === "ACTIVO";

                    return (
                      <tr key={user.id}>

                        <td>
                          <div className="ua-user">
                            <div className="ua-user-avatar">
                              {getInitials(user.nombreCompleto)}
                            </div>

                            <div>
                              <span className="ua-user-name">
                                {user.nombreCompleto}
                              </span>

                              <span className="ua-user-email">
                                {user.correo}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>{user.id}</td>

                        <td>{user.identificacion || "—"}</td>

                        <td>
                          <span className="ua-role">
                            {roleName}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`ua-status ${
                              isActive ? "active" : "inactive"
                            }`}
                          >
                            {isActive ? "Activo" : "Inactivo"}
                          </span>
                        </td>

                        <td>
                          {formatearFecha(user.creadoEn)}
                        </td>

                        {/* ACCIONES */}

                        <td>
                          <div className="ua-actions">

                            {/* EDITAR */}

                            <button
                              className="ua-action-btn"
                              title="Modificar usuario"
                              aria-label={`Modificar ${user.nombreCompleto}`}
                              type="button"
                              onClick={() => openEdit(user)}
                            >
                              <Pencil size={16} />
                            </button>

                            {/* DESACTIVAR */}

                            {isActive ? (
                              <button
                                className="ua-toggle on"
                                title="Desactivar usuario"
                                aria-label={`Desactivar ${user.nombreCompleto}`}
                                type="button"
                                onClick={() => openDeactivate(user)}
                              >
                                <span />
                              </button>
                            ) : (
                              <button
                                className="ua-action-btn"
                                title="Reactivar usuario"
                                aria-label={`Reactivar ${user.nombreCompleto}`}
                                type="button"
                                onClick={() => openReactivate(user)}
                              >
                                <RotateCcw size={16} />
                              </button>
                            )}

                            {/* ELIMINAR */}

                            <button
                              className="ua-action-btn"
                              title="Eliminar usuario"
                              aria-label={`Eliminar ${user.nombreCompleto}`}
                              type="button"
                              onClick={() => openDelete(user)}
                            >
                              <Trash2 size={16} />
                            </button>

                          </div>
                        </td>

                      </tr>
                    );
                  })

                ) : (

                  <tr>
                    <td className="ua-empty" colSpan={7}>
                      {users.length === 0
                        ? "No hay usuarios registrados."
                        : "No se encontraron usuarios con esos criterios."}
                    </td>
                  </tr>

                )}

              </tbody>
            </table>
          </div>

          {/* PIE DE TABLA */}

          <footer className="ua-table-footer">
            <span>
              Mostrando {visibleUsers.length} de {users.length} usuarios
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

      {modal === "form" && (

        <div
          className="ua-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !saving
            ) {
              setModal(null);
            }
          }}
        >

          <section
            className="ua-modal"
            role="dialog"
            aria-modal="true"
          >

            <header className="ua-modal-header">
              <div>
                <h3>
                  {editingId
                    ? "Modificar usuario"
                    : "Registrar usuario"}
                </h3>

                <p>
                  {editingId
                    ? `ID ${editingId} · El identificador no se puede modificar.`
                    : "Complete los datos para crear una nueva cuenta."}
                </p>
              </div>

              <button
                className="ua-icon-button"
                onClick={() => setModal(null)}
                aria-label="Cerrar"
                type="button"
                disabled={saving}
              >
                <X size={18} />
              </button>
            </header>

            <form
              className="ua-modal-body"
              onSubmit={saveUser}
            >

              {error && (
                <div className="ua-error">
                  {error}
                </div>
              )}

              <div className="ua-form-grid">

                {/* NOMBRE */}

                <div className="ua-form-field full">
                  <label>
                    Nombre completo <span>*</span>
                  </label>

                  <input
                    value={form.nombreCompleto}
                    onChange={(event) =>
                      updateForm(
                        "nombreCompleto",
                        event.target.value
                      )
                    }
                    placeholder="Nombre y apellidos"
                    required
                  />
                </div>

                {/* CORREO */}

                <div className="ua-form-field">
                  <label>
                    Identificación <span>*</span>
                  </label>

                  <input
                    value={form.identificacion}
                    onChange={(event) =>
                      updateForm("identificacion", event.target.value)
                    }
                    placeholder="Número de identificación"
                    maxLength={30}
                    required
                  />
                </div>

                {/* CORREO */}

                <div className="ua-form-field">
                  <label>
                    Correo electrónico <span>*</span>
                  </label>

                  <input
                    type="email"
                    value={form.correo}
                    onChange={(event) =>
                      updateForm("correo", event.target.value)
                    }
                    placeholder="usuario@correo.com"
                    required
                  />
                </div>

                {/* TELÉFONO */}

                <div className="ua-form-field">
                  <label>Número telefónico</label>

                  <input
                    value={form.telefono}
                    onChange={(event) =>
                      updateForm("telefono", event.target.value)
                    }
                    placeholder="8888-8888"
                  />
                </div>

                {/* ROL */}

                <div className="ua-form-field full">
                  <label>
                    Rol asignado <span>*</span>
                  </label>

                  <select
                    value={form.rolId}
                    onChange={(event) =>
                      updateForm("rolId", event.target.value)
                    }
                    required
                  >
                    <option value="">
                      Seleccione un rol
                    </option>

                    {availableRoles.map((role) => (
                      <option
                        key={role.id}
                        value={String(role.id)}
                      >
                        {role.nombre}
                      </option>
                    ))}
                  </select>

                  <span className="ua-help">
                    El rol define las funciones disponibles
                    para la cuenta.
                  </span>
                </div>

                {/* CONTRASEÑA */}

                <div className="ua-form-field">
                  <label>
                    {editingId
                      ? "Nueva contraseña (opcional)"
                      : "Contraseña *"}
                  </label>

                  <input
                    type="password"
                    value={form.password}
                    onChange={(event) =>
                      updateForm("password", event.target.value)
                    }
                    placeholder="Mínimo 8 caracteres"
                    autoComplete="new-password"
                    required={!editingId}
                  />

                  {editingId && (
                    <span className="ua-help">
                      Déjela vacía si no desea cambiar la contraseña.
                    </span>
                  )}
                </div>

                {/* CONFIRMAR CONTRASEÑA */}

                <div className="ua-form-field">
                  <label>
                    {editingId
                      ? "Confirmar nueva contraseña"
                      : "Confirmar contraseña *"}
                  </label>

                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={(event) =>
                      updateForm(
                        "confirmPassword",
                        event.target.value
                      )
                    }
                    placeholder="Repetir la contraseña"
                    autoComplete="new-password"
                    required={
                      !editingId || Boolean(form.password)
                    }
                  />
                </div>

              </div>

              {/* BOTONES DEL FORMULARIO */}

              <div className="ua-modal-footer">

                <button
                  type="button"
                  className="ua-secondary"
                  onClick={() => setModal(null)}
                  disabled={saving}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="ua-primary"
                  disabled={saving}
                >
                  <Check size={17} />

                  {saving
                    ? "Guardando..."
                    : editingId
                    ? "Guardar cambios"
                    : "Registrar usuario"}
                </button>

              </div>

            </form>

          </section>
        </div>
      )}

      {/* ======================================
          MODAL DE DESACTIVACIÓN
      ====================================== */}

      {modal === "deactivate" && selectedUser && (

        <div className="ua-overlay">

          <section
            className="ua-modal"
            role="dialog"
            aria-modal="true"
          >

            <header className="ua-modal-header">
              <div>
                <h3>Desactivar usuario</h3>

                <p>
                  La cuenta se desactivará sin eliminar su registro.
                </p>
              </div>

              <button
                className="ua-icon-button"
                onClick={() => setModal(null)}
                aria-label="Cerrar"
                type="button"
                disabled={saving}
              >
                <X size={18} />
              </button>
            </header>

            <div className="ua-modal-body">

              <div className="ua-warning">
                ¿Desea desactivar la cuenta de{" "}
                <strong>
                  {selectedUser.nombreCompleto}
                </strong>
                ?

                <br />

                Esta acción cambiará su estado a INACTIVO.
              </div>

              <div className="ua-modal-footer">

                <button
                  type="button"
                  className="ua-secondary"
                  onClick={() => setModal(null)}
                  disabled={saving}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  className="ua-primary ua-danger"
                  onClick={confirmDeactivation}
                  disabled={saving}
                >
                  {saving
                    ? "Procesando..."
                    : "Confirmar desactivación"}
                </button>

              </div>

            </div>

          </section>
        </div>
      )}

      {(modal === "reactivate" || modal === "delete") && selectedUser && (
        <div className="ua-overlay">
          <section className="ua-modal" role="dialog" aria-modal="true">
            <header className="ua-modal-header">
              <div>
                <h3>
                  {modal === "delete" ? "Eliminar usuario" : "Reactivar usuario"}
                </h3>
                <p>
                  {modal === "delete"
                    ? "Esta acción eliminará la cuenta del sistema."
                    : "La cuenta volverá a estar activa."}
                </p>
              </div>

              <button
                className="ua-icon-button"
                onClick={() => setModal(null)}
                aria-label="Cerrar"
                type="button"
                disabled={saving}
              >
                <X size={18} />
              </button>
            </header>

            <div className="ua-modal-body">
              {error && <div className="ua-error">{error}</div>}

              <div className="ua-warning">
                ¿Desea {modal === "delete" ? "eliminar" : "reactivar"} la cuenta de{" "}
                <strong>{selectedUser.nombreCompleto}</strong>?
              </div>

              <div className="ua-modal-footer">
                <button
                  type="button"
                  className="ua-secondary"
                  onClick={() => setModal(null)}
                  disabled={saving}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  className={`ua-primary ${modal === "delete" ? "ua-danger" : ""}`}
                  onClick={modal === "delete" ? confirmDelete : confirmReactivation}
                  disabled={saving}
                >
                  {saving
                    ? "Procesando..."
                    : modal === "delete"
                    ? "Eliminar usuario"
                    : "Confirmar reactivación"}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {modal === "profile" && (
        <div className="ua-overlay" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !profileLoading) {
            setModal(null);
          }
        }}>
          <section className="ua-modal" role="dialog" aria-modal="true">
            <header className="ua-modal-header">
              <div>
                <h3>Mi perfil</h3>
                <p>Información de la cuenta autenticada.</p>
              </div>
              <button
                className="ua-icon-button"
                onClick={() => setModal(null)}
                aria-label="Cerrar"
                type="button"
                disabled={profileLoading}
              >
                <X size={18} />
              </button>
            </header>

            <div className="ua-modal-body">
              {profileLoading ? (
                <p>Cargando perfil...</p>
              ) : error ? (
                <div className="ua-error">{error}</div>
              ) : (
                <div className="ua-profile-grid">
                  <div><span>Nombre completo</span><strong>{profileData.nombreCompleto || "—"}</strong></div>
                  <div><span>Identificación</span><strong>{profileData.identificacion || "—"}</strong></div>
                  <div><span>Correo electrónico</span><strong>{profileData.correo || "—"}</strong></div>
                  <div><span>Teléfono</span><strong>{profileData.telefono || "—"}</strong></div>
                  <div><span>Rol</span><strong>{profileRole}</strong></div>
                  <div><span>Estado</span><strong>{profileData.estado || "—"}</strong></div>
                  <div><span>Fecha de registro</span><strong>{formatearFecha(profileData.creadoEn)}</strong></div>
                </div>
              )}
            </div>
          </section>
        </div>
      )}

    </div>
  );
}
