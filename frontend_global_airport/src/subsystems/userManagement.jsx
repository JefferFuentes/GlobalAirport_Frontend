
import { useMemo, useState } from "react";
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
  Plane,
} from "lucide-react";
import "./css/userManagement.css";
import { History } from "lucide-react";
import DeactivationHistory from "./deactivationHistory";
import RoleChangeHistory from "./roleChangeHistory";

const initialUsers = [
  {
    id: "USR-001",
    name: "María Fernanda Rodríguez",
    email: "maria.rodriguez@globalairport.com",
    phone: "8888-1200",
    role: "Administrador de Aeropuerto",
    status: "Activo",
    date: "15/10/2026",
  },
  {
    id: "USR-002",
    name: "Carlos Andrés Jiménez",
    email: "carlos.jimenez@globalairport.com",
    phone: "8700-2310",
    role: "Empleado",
    status: "Activo",
    date: "17/10/2026",
  },
  {
    id: "USR-003",
    name: "Sofía Valverde Mora",
    email: "sofia.valverde@email.com",
    phone: "8812-4400",
    role: "Cliente",
    status: "Activo",
    date: "19/10/2026",
  },
  {
    id: "USR-004",
    name: "Daniel Vargas Solano",
    email: "daniel.vargas@globalairport.com",
    phone: "8601-7722",
    role: "Piloto",
    status: "Inactivo",
    date: "20/10/2026",
  },
];

const roles = [
  "Administrador General",
  "Administrador de Aeropuerto",
  "Empleado",
  "Cliente",
  "Piloto",
];

const initialForm = {
  name: "",
  email: "",
  phone: "",
  role: "Empleado",
  password: "",
  confirmPassword: "",
};

export default function UserManagement() {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("Todos los roles");
  const [statusFilter, setStatusFilter] = useState("Todos los estados");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [deactivationReason, setDeactivationReason] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [deactivationHistory, setDeactivationHistory] = useState([]);
  const [showRoleHistory, setShowRoleHistory] = useState(false);
  const [roleChangeHistory, setRoleChangeHistory] = useState([]);

  const activeUsers = users.filter((u) => u.status === "Activo").length;
  const inactiveUsers = users.length - activeUsers;

  const visibleUsers = useMemo(() => {
    const term = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch = [
        user.id,
        user.name,
        user.email,
        user.phone,
      ].some((value) => value.toLowerCase().includes(term));

      const matchesRole =
        roleFilter === "Todos los roles" || user.role === roleFilter;

      const matchesStatus =
        statusFilter === "Todos los estados" ||
        user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  function openCreate() {
    setEditingId(null);
    setForm(initialForm);
    setError("");
    setMessage("");
    setModal("form");
  }

  function openEdit(user) {
    setEditingId(user.id);
    setForm({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      password: "",
      confirmPassword: "",
    });
    setError("");
    setMessage("");
    setModal("form");
  }

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function saveUser(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setError("Complete todos los campos obligatorios.");
      return;
    }

    const email = form.email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Ingrese un correo electrónico válido.");
      return;
    }

    const duplicate = users.some(
      (user) => user.email.toLowerCase() === email && user.id !== editingId
    );

    if (duplicate) {
      setError("El correo electrónico ya está registrado.");
      return;
    }

    if (!editingId) {
      if (!form.password || !form.confirmPassword) {
        setError("La contraseña y su confirmación son obligatorias.");
        return;
      }

      if (form.password.length < 8) {
        setError("La contraseña debe tener al menos 8 caracteres.");
        return;
      }

      if (form.password !== form.confirmPassword) {
        setError("Las contraseñas no coinciden.");
        return;
      }

      const nextNumber =
        Math.max(
          0,
          ...users.map((u) => Number(u.id.split("-")[1]) || 0)
        ) + 1;

      const newUser = {
        id: `USR-${String(nextNumber).padStart(3, "0")}`,
        name: form.name.trim(),
        email,
        phone: form.phone.trim(),
        role: form.role,
        status: "Activo",
        date: new Date().toLocaleDateString("es-CR"),
      };

      setUsers((current) => [newUser, ...current]);
      setMessage("Usuario registrado correctamente.");
    } else {
      const previousUser = users.find((user) => user.id === editingId);

      if (previousUser && previousUser.role !== form.role) {
        const roleEvent = {
          id: `${editingId}-${Date.now()}`,
          userId: previousUser.id,
          userName: form.name.trim(),
          email,
          previousRole: previousUser.role,
          newRole: form.role,
          dateTime: new Date().toLocaleString("es-CR", {
            dateStyle: "short",
            timeStyle: "medium",
          }),
          responsible: "Administrador General",
        };

        setRoleChangeHistory((current) => [roleEvent, ...current]);
      }

      setUsers((current) =>
        current.map((user) =>
          user.id === editingId
            ? {
              ...user,
              name: form.name.trim(),
              email,
              phone: form.phone.trim(),
              role: form.role,
            }
            : user
        )
      );

      setMessage("Los cambios se guardaron correctamente.");
    }

    setModal(null);
  }

  function changeStatus(user) {
    if (user.status === "Activo") {
      setEditingId(user.id);
      setDeactivationReason("");
      setModal("deactivate");
      return;
    }

    setUsers((current) =>
      current.map((item) =>
        item.id === user.id ? { ...item, status: "Activo" } : item
      )
    );

    setMessage(`La cuenta de ${user.name} se reactivó.`);
  }


  function confirmDeactivation(event) {
    event.preventDefault();

    const userToDeactivate = users.find(
      (user) => user.id === editingId
    );

    if (!userToDeactivate) {
      setModal(null);
      return;
    }

    const eventRecord = {
      id: `${editingId}-${Date.now()}`,
      userId: userToDeactivate.id,
      userName: userToDeactivate.name,
      email: userToDeactivate.email,
      dateTime: new Date().toLocaleString("es-CR", {
        dateStyle: "short",
        timeStyle: "medium",
      }),
      responsible: "Administrador General",
      reason: deactivationReason.trim(),
    };

    setUsers((current) =>
      current.map((user) =>
        user.id === editingId
          ? { ...user, status: "Inactivo" }
          : user
      )
    );

    setDeactivationHistory((current) => [
      eventRecord,
      ...current,
    ]);

    setModal(null);
    setDeactivationReason("");
    setMessage("Usuario desactivado y evento registrado en el historial.");
  }

  if (showHistory) {
    return (
      <DeactivationHistory
        records={deactivationHistory}
        onBack={() => setShowHistory(false)}
      />
    );
  }

  if (showRoleHistory) {
    return (
      <RoleChangeHistory
        records={roleChangeHistory}
        onBack={() => setShowRoleHistory(false)}
      />
    );
  }

  return (
    <div className="users-page">


      <header className="ua-topbar">
        <div>
          <div className="ua-breadcrumb">Global Airport　/　Usuarios</div>
          <h2>Gestión de usuarios</h2>
        </div>

        <div className="ua-top-actions">
          <div className="ua-module-search">
            <Search size={17} />
            <span>Buscar módulo...</span>
          </div>
          <button className="ua-icon-button" aria-label="Notificaciones">
            <Bell size={19} />
          </button>
          <div className="ua-avatar">GA</div>
        </div>
      </header>

      <main className="ua-content">
        <div className="ua-page-heading">
          <div>
            <div className="ua-eyebrow">Administración del sistema</div>
            <h1>Gestión de usuarios</h1>
            <p>
              Administra las cuentas, roles y permisos de acceso a la plataforma.
            </p>
          </div>

          <button className="ua-primary" onClick={openCreate}>
            <Plus size={19} />
            Registrar usuario
          </button>
        </div>

        <section className="ua-stats">
          <article className="ua-stat">
            <div className="ua-stat-icon blue"><Users /></div>
            <div>
              <div className="ua-stat-label">Total de usuarios</div>
              <div className="ua-stat-value">{users.length}</div>
            </div>
          </article>

          <article className="ua-stat">
            <div className="ua-stat-icon green"><UserRound /></div>
            <div>
              <div className="ua-stat-label">Usuarios activos</div>
              <div className="ua-stat-value">{activeUsers}</div>
            </div>
          </article>

          <article className="ua-stat">
            <div className="ua-stat-icon sky"><ShieldCheck /></div>
            <div>
              <div className="ua-stat-label">Roles disponibles</div>
              <div className="ua-stat-value">{roles.length}</div>
            </div>
          </article>

          <article className="ua-stat">
            <div className="ua-stat-icon gray"><UserRound /></div>
            <div>
              <div className="ua-stat-label">Usuarios inactivos</div>
              <div className="ua-stat-value">{inactiveUsers}</div>
            </div>
          </article>
        </section>

        <section className="ua-panel">

          <div className="ua-panel-heading">
            <div>
              <h3>Directorio de usuarios</h3>
              <p>Consulta y administra las cuentas registradas.</p>
            </div>

            <button
              className="ua-action-btn"
              onClick={() => setShowHistory(true)}
              title="Consultar historial de desactivaciones"
              aria-label="Consultar historial de desactivaciones"
            >
              <History size={18} />
              <span>Historial de desactivaciones</span>
            </button>

            <button
              className="ua-action-btn"
              onClick={() => setShowRoleHistory(true)}
              title="Consultar historial de cambios de roles"
              aria-label="Consultar historial de cambios de roles"
            >
              <History size={18} />
              <span>Historial de roles</span>
            </button>
          </div>


          <div className="ua-toolbar">
            <label className="ua-search-box">
              <Search size={18} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nombre, correo o ID..."
                aria-label="Buscar usuarios"
              />
            </label>

            <label className="ua-filter">
              <select
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
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
                <option>Todos los roles</option>
                {roles.map((role) => <option key={role}>{role}</option>)}
              </select>
              <ChevronDown size={16} />
            </label>

            <label className="ua-filter">
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
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
                <option>Todos los estados</option>
                <option>Activo</option>
                <option>Inactivo</option>
              </select>
              <ChevronDown size={16} />
            </label>

            <button
              className="ua-filter-icon"
              title="Limpiar filtros"
              aria-label="Limpiar filtros"
              onClick={() => {
                setSearch("");
                setRoleFilter("Todos los roles");
                setStatusFilter("Todos los estados");
              }}
            >
              <SlidersHorizontal size={18} />
            </button>
          </div>

          {message && <div className="ua-notice">{message}</div>}

          <div className="ua-table-wrap">
            <table className="ua-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>ID usuario</th>
                  <th>Rol asignado</th>
                  <th>Estado</th>
                  <th>Fecha de registro</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {visibleUsers.map((user) => {
                  const initials = user.name
                    .split(" ")
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join("");

                  return (
                    <tr key={user.id}>
                      <td>
                        <div className="ua-user">
                          <div className="ua-user-avatar">{initials}</div>
                          <div>
                            <span className="ua-user-name">{user.name}</span>
                            <span className="ua-user-email">{user.email}</span>
                          </div>
                        </div>
                      </td>

                      <td>{user.id}</td>

                      <td>
                        <span className={`ua-role role-${user.role}`}>
                          {user.role}
                        </span>
                      </td>

                      <td>
                        <span className={`ua-status ${user.status === "Activo" ? "active" : "inactive"}`}>
                          {user.status}
                        </span>
                      </td>

                      <td>{user.date}</td>

                      <td>
                        <div className="ua-actions">
                          <button
                            className="ua-action-btn"
                            title="Modificar usuario"
                            aria-label={`Modificar ${user.name}`}
                            onClick={() => openEdit(user)}
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            className={`ua-toggle ${user.status === "Activo" ? "on" : "off"}`}
                            title={user.status === "Activo" ? "Desactivar usuario" : "Reactivar usuario"}
                            aria-label="Cambiar estado del usuario"
                            onClick={() => changeStatus(user)}
                          >
                            <span />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {visibleUsers.length === 0 && (
                  <tr>
                    <td className="ua-empty" colSpan={6}>
                      No se encontraron usuarios con esos criterios.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <footer className="ua-table-footer">
            <span>Mostrando {visibleUsers.length} de {users.length} usuarios</span>
            <span>Global Airport · Administración de usuarios</span>
          </footer>
        </section>
      </main>

      {modal === "form" && (
        <div className="ua-overlay" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setModal(null);
        }}>
          <section className="ua-modal" role="dialog" aria-modal="true">
            <header className="ua-modal-header">
              <div>
                <h3>{editingId ? "Modificar usuario" : "Registrar usuario"}</h3>
                <p>
                  {editingId
                    ? `ID ${editingId} · El identificador no se puede modificar.`
                    : "Complete los datos para crear una nueva cuenta."}
                </p>
              </div>
              <button className="ua-icon-button" onClick={() => setModal(null)} aria-label="Cerrar">
                <X size={18} />
              </button>
            </header>

            <form className="ua-modal-body" onSubmit={saveUser}>
              {error && <div className="ua-error">{error}</div>}

              <div className="ua-form-grid">
                <div className="ua-form-field full">
                  <label>Nombre completo <span>*</span></label>
                  <input
                    value={form.name}
                    onChange={(event) => updateForm("name", event.target.value)}
                    placeholder="Nombre y apellidos"
                    required
                  />
                </div>

                <div className="ua-form-field">
                  <label>Correo electrónico <span>*</span></label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => updateForm("email", event.target.value)}
                    placeholder="usuario@correo.com"
                    required
                  />
                </div>

                <div className="ua-form-field">
                  <label>Número telefónico <span>*</span></label>
                  <input
                    value={form.phone}
                    onChange={(event) => updateForm("phone", event.target.value)}
                    placeholder="8888-8888"
                    required
                  />
                </div>

                <div className="ua-form-field full">
                  <label>Rol asignado <span>*</span></label>
                  <select
                    value={form.role}
                    onChange={(event) => updateForm("role", event.target.value)}
                    required
                  >
                    {roles
                      .filter((role) => role !== "Administrador General" || editingId)
                      .map((role) => <option key={role}>{role}</option>)}
                  </select>
                  <span className="ua-help">
                    El rol define las funciones disponibles para la cuenta.
                  </span>
                </div>

                {!editingId && (
                  <>
                    <div className="ua-form-field">
                      <label>Contraseña <span>*</span></label>
                      <input
                        type="password"
                        value={form.password}
                        onChange={(event) => updateForm("password", event.target.value)}
                        placeholder="Mínimo 8 caracteres"
                        autoComplete="new-password"
                        required
                      />
                    </div>

                    <div className="ua-form-field">
                      <label>Confirmar contraseña <span>*</span></label>
                      <input
                        type="password"
                        value={form.confirmPassword}
                        onChange={(event) => updateForm("confirmPassword", event.target.value)}
                        placeholder="Repetir la contraseña"
                        autoComplete="new-password"
                        required
                      />
                    </div>


                  </>
                )}
              </div>

              <div className="ua-modal-footer">
                <button type="button" className="ua-secondary" onClick={() => setModal(null)}>
                  Cancelar
                </button>
                <button type="submit" className="ua-primary">
                  <Check size={17} />
                  {editingId ? "Guardar cambios" : "Registrar usuario"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {modal === "deactivate" && (
        <div className="ua-overlay">
          <section className="ua-modal" role="dialog" aria-modal="true">
            <header className="ua-modal-header">
              <div>
                <h3>Desactivar usuario</h3>
                <p>La cuenta se desactivará sin eliminar su registro.</p>
              </div>
              <button className="ua-icon-button" onClick={() => setModal(null)} aria-label="Cerrar">
                <X size={18} />
              </button>
            </header>

            <form className="ua-modal-body" onSubmit={confirmDeactivation}>


              <div className="ua-form-field">
                <label>Motivo de desactivación (opcional)</label>
                <input
                  value={deactivationReason}
                  onChange={(event) => setDeactivationReason(event.target.value)}
                  placeholder="Escribí el motivo, si corresponde"
                />
              </div>

              <div className="ua-modal-footer">
                <button type="button" className="ua-secondary" onClick={() => setModal(null)}>
                  Cancelar
                </button>
                <button type="submit" className="ua-primary ua-danger">
                  Confirmar desactivación
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
