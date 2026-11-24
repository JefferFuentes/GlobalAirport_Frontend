import { useEffect, useMemo, useState } from "react";
import { Building2, CheckCircle2, ClipboardCheck, Pencil, Trash2, UserRound } from "lucide-react";
import airportService from "../services/airportService";
import airportAdministratorService from "../services/airportAdministratorService";
import usuarioService from "../services/userService";
import "./css/airportAdministrators.css";

const errorMessage = (error) => error.response?.data?.mensaje || error.response?.data?.message ||
  (Array.isArray(error.response?.data?.errores) ? error.response.data.errores.join(". ") : null) ||
  error.message || "No se pudo completar la operación.";

export default function AirportAdministrators() {
  const [airports, setAirports] = useState([]);
  const [users, setUsers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [airportId, setAirportId] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadData(mostrarCarga = true) {
    if (mostrarCarga) {
      setLoading(true);
      setError("");
    }
    try {
      const [airportData, userData, assignmentData] = await Promise.all([
        airportService.listar(),
        usuarioService.listar(),
        airportAdministratorService.listar(),
      ]);
      setAirports(Array.isArray(airportData) ? airportData : []);
      setUsers(Array.isArray(userData) ? userData : []);
      setAssignments(Array.isArray(assignmentData) ? assignmentData : []);
    } catch (loadError) {
      setError(errorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void Promise.resolve().then(() => loadData(false)); }, []);

  const availableAdmins = useMemo(() => users.filter((user) =>
    user.estado === "ACTIVO" && user.rol?.codigo === "ADMIN_AEROPUERTO"
  ), [users]);

  const assignmentRows = useMemo(() => assignments.map((assignment) => ({
    ...assignment,
    airport: airports.find((item) => Number(item.id) === Number(assignment.aeropuertoId)),
    user: users.find((item) => Number(item.id) === Number(assignment.usuarioId)),
  })), [assignments, airports, users]);

  async function handleAssignment(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);
    try {
      const data = { aeropuertoId: Number(airportId), usuarioId: Number(userId) };
      if (editingId) {
        await airportAdministratorService.actualizar(editingId, data);
        setMessage("La asignación se actualizó correctamente.");
      } else {
        await airportAdministratorService.crear(data);
        setMessage("La asignación se guardó correctamente.");
      }
      setEditingId(null);
      setAirportId("");
      setUserId("");
      await loadData();
    } catch (saveError) {
      setError(errorMessage(saveError));
    } finally {
      setSaving(false);
    }
  }

  function editAssignment(assignment) {
    setEditingId(assignment.id);
    setAirportId(String(assignment.aeropuertoId));
    setUserId(String(assignment.usuarioId));
    setError("");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteAssignment(assignment) {
    const airport = airports.find((item) => Number(item.id) === Number(assignment.aeropuertoId));
    const user = users.find((item) => Number(item.id) === Number(assignment.usuarioId));
    if (!window.confirm(`¿Eliminar la asignación de ${user?.nombreCompleto || `usuario ${assignment.usuarioId}`} a ${airport?.codigoIata || `aeropuerto ${assignment.aeropuertoId}`}?`)) return;
    setError("");
    setMessage("");
    try {
      await airportAdministratorService.eliminar(assignment.id);
      setMessage("La asignación se eliminó correctamente.");
      await loadData();
    } catch (deleteError) {
      setError(errorMessage(deleteError));
    }
  }

  return (
    <div className="aa-page">
      <header className="aa-topbar"><div><div className="aa-breadcrumb">Global Airport / Infraestructura / Asignaciones</div><h2>Asignación de administradores</h2></div><div className="aa-avatar">GA</div></header>
      <main className="aa-content">
        <div className="aa-heading"><div className="aa-heading-icon"><ClipboardCheck size={26} /></div><div><h1>Asignar administrador de aeropuerto</h1><p>Asigna usuarios con rol de administrador a los aeropuertos existentes.</p></div></div>
        <div className="aa-admin-notice"><UserRound size={19} /><div><strong>Acceso requerido: Administrador General</strong><p>El backend limita la creación y eliminación de estas asignaciones a ese rol.</p></div></div>

        {error && <div className="aa-alert aa-error" role="alert">{error}</div>}
        {message && <div className="aa-alert aa-success"><CheckCircle2 size={18} />{message}</div>}

        <section className="aa-card">
          <div className="aa-card-heading"><div><h3>Datos de la asignación</h3><p>Selecciona un aeropuerto y un usuario activo con el rol requerido.</p></div><span className="aa-required">* Obligatorio</span></div>
          <form onSubmit={handleAssignment}>
            <div className="aa-form-grid">
              <div className="aa-field"><label htmlFor="airport">Aeropuerto <span>*</span></label><div className="aa-input-icon"><Building2 size={18} /><select id="airport" value={airportId} onChange={(event) => setAirportId(event.target.value)} required><option value="">Selecciona un aeropuerto</option>{airports.map((airport) => <option key={airport.id} value={airport.id}>{airport.codigoIata} · {airport.nombre}</option>)}</select></div></div>
              <div className="aa-field"><label htmlFor="admin">Administrador <span>*</span></label><div className="aa-input-icon"><UserRound size={18} /><select id="admin" value={userId} onChange={(event) => setUserId(event.target.value)} required><option value="">Selecciona un administrador</option>{availableAdmins.map((user) => <option key={user.id} value={user.id}>{user.nombreCompleto} · {user.correo}</option>)}</select></div></div>
            </div>
          <div className="aa-form-footer">{editingId && <button className="aa-secondary" type="button" onClick={() => { setEditingId(null); setAirportId(""); setUserId(""); }}>Cancelar edición</button>}<button className="aa-primary" type="submit" disabled={saving || loading || !airports.length || !availableAdmins.length}><CheckCircle2 size={18} />{saving ? "Guardando..." : editingId ? "Guardar cambios" : "Confirmar asignación"}</button></div>
          </form>
        </section>

        <section className="aa-card">
          <div className="aa-card-heading"><div><h3>Administradores asignados</h3><p>Asignaciones guardadas por el backend.</p></div><span className="aa-count">{assignments.length} registros</span></div>
          <div className="aa-table-wrap"><table className="aa-table">
            <thead><tr><th>Aeropuerto</th><th>Administrador</th><th>Correo electrónico</th><th>Acciones</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={4} className="aa-empty">Cargando asignaciones...</td></tr> : assignmentRows.map((assignment) => <tr key={assignment.id}>
                <td><strong>{assignment.airport?.nombre || `Aeropuerto ${assignment.aeropuertoId}`}</strong><small>{assignment.airport?.codigoIata || "—"} · ID {assignment.aeropuertoId}</small></td>
                <td><strong>{assignment.user?.nombreCompleto || `Usuario ${assignment.usuarioId}`}</strong><small>ID {assignment.usuarioId}</small></td>
                <td>{assignment.user?.correo || "—"}</td>
                <td><div className="aa-row-actions"><button type="button" className="aa-edit-btn" title="Editar asignación" aria-label="Editar asignación" onClick={() => editAssignment(assignment)}><Pencil size={16} /></button><button type="button" className="aa-delete-btn" title="Eliminar asignación" aria-label="Eliminar asignación" onClick={() => deleteAssignment(assignment)}><Trash2 size={17} /></button></div></td>
              </tr>)}
              {!loading && assignmentRows.length === 0 && <tr><td colSpan={4} className="aa-empty"><UserRound size={28} /><strong>No hay asignaciones registradas</strong><span>Las asignaciones creadas aparecerán aquí.</span></td></tr>}
            </tbody>
          </table></div>
        </section>
      </main>
    </div>
  );
}
