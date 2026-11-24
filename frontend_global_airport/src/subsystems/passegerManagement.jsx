import { useEffect, useMemo, useState } from "react";
import { Check, Mail, MapPin, Pencil, Plus, Search, Trash2, Users, X } from "lucide-react";
import passengerService from "../services/passengerService";
import "./css/passengerManagement.css";

const emptyForm = {
  nombreCompleto: "",
  tipoDocumento: "CEDULA",
  numeroDocumento: "",
  nacionalidad: "",
  fechaNacimiento: "",
  correo: "",
  telefono: "",
  direccion: "",
};
const fechaMaxima = new Date().toISOString().slice(0, 10);

const dateValue = (value) => value ? String(value).slice(0, 10) : "";
const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(`${dateValue(value)}T12:00:00`);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("es-CR");
};
const errorMessage = (error) => error.response?.data?.mensaje || error.response?.data?.message ||
  (Array.isArray(error.response?.data?.errores) ? error.response.data.errores.join(". ") : null) ||
  error.message || "No se pudo completar la operación.";

export default function PassengerManagement() {
  const [passengers, setPassengers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [modal, setModal] = useState("");
  const [selectedPassenger, setSelectedPassenger] = useState(null);
  const [form, setForm] = useState(emptyForm);

  async function loadPassengers(mostrarCarga = true) {
    if (mostrarCarga) {
      setLoading(true);
      setError("");
    }
    try {
      const data = await passengerService.listar();
      if (!Array.isArray(data)) throw new Error("El servidor no devolvió una lista de pasajeros.");
      setPassengers(data);
    } catch (loadError) {
      setError(errorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void Promise.resolve().then(() => loadPassengers(false)); }, []);

  const visiblePassengers = useMemo(() => {
    const term = search.trim().toLowerCase();
    return [...passengers].sort((a, b) => Number(b.id) - Number(a.id)).filter((passenger) =>
      [passenger.id, passenger.nombreCompleto, passenger.tipoDocumento, passenger.numeroDocumento,
        passenger.nacionalidad, passenger.correo].some((value) => String(value || "").toLowerCase().includes(term))
    );
  }, [passengers, search]);
  const nationalitiesCount = useMemo(() => new Set(passengers.map((passenger) => passenger.nacionalidad).filter(Boolean)).size, [passengers]);

  function openCreate() {
    setSelectedPassenger(null);
    setForm(emptyForm);
    setError("");
    setModal("form");
  }

  function openEdit(passenger) {
    setSelectedPassenger(passenger);
    setForm({
      nombreCompleto: passenger.nombreCompleto || "",
      tipoDocumento: passenger.tipoDocumento || "CEDULA",
      numeroDocumento: passenger.numeroDocumento || "",
      nacionalidad: passenger.nacionalidad || "",
      fechaNacimiento: dateValue(passenger.fechaNacimiento),
      correo: passenger.correo || "",
      telefono: passenger.telefono || "",
      direccion: passenger.direccion || "",
    });
    setError("");
    setModal("form");
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function savePassenger(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const data = {
      ...form,
      nombreCompleto: form.nombreCompleto.trim(),
      numeroDocumento: form.numeroDocumento.trim(),
      nacionalidad: form.nacionalidad.trim(),
      correo: form.correo.trim().toLowerCase(),
      telefono: form.telefono.trim() || null,
      direccion: form.direccion.trim() || null,
    };
    try {
      if (selectedPassenger) {
        await passengerService.actualizar(selectedPassenger.id, data);
        setMessage("Los datos del pasajero se actualizaron correctamente.");
      } else {
        await passengerService.crear(data);
        setMessage("El pasajero se registró correctamente.");
      }
      setModal("");
      await loadPassengers();
    } catch (saveError) {
      setError(errorMessage(saveError));
    } finally {
      setSaving(false);
    }
  }

  async function deletePassenger(passenger) {
    if (!window.confirm(`¿Desea eliminar el registro de ${passenger.nombreCompleto}?`)) return;
    setError("");
    setMessage("");
    try {
      await passengerService.eliminar(passenger.id);
      setMessage(`Se eliminó el registro de ${passenger.nombreCompleto}.`);
      await loadPassengers();
    } catch (deleteError) {
      setError(errorMessage(deleteError));
    }
  }

  return (
    <main className="pm-page">
      <div className="pm-topbar"><div><div className="pm-breadcrumb">Global Airport / Pasajeros</div><h2>Gestión de pasajeros</h2></div><div className="pm-topbar-avatar">GA</div></div>
      <div className="pm-content">
      <header className="pm-header">
        <div className="pm-heading">
          <div className="pm-heading-icon"><Users size={27} /></div>
          <div><h1>Gestión de pasajeros</h1><p>Consulta y administra los pasajeros registrados en el sistema.</p></div>
        </div>
      </header>

      <section className="pm-stats">
        <article className="pm-stat-card"><div className="pm-stat-icon blue"><Users size={21} /></div><div><span>Pasajeros registrados</span><strong>{passengers.length}</strong><small>Registros en el sistema</small></div></article>
        <article className="pm-stat-card"><div className="pm-stat-icon green"><MapPin size={21} /></div><div><span>Nacionalidades</span><strong>{nationalitiesCount}</strong><small>Representadas en el directorio</small></div></article>
        <article className="pm-stat-card"><div className="pm-stat-icon sky"><Search size={21} /></div><div><span>Coincidencias</span><strong>{visiblePassengers.length}</strong><small>Según la búsqueda actual</small></div></article>
      </section>

      {message && <div className="pm-message" role="status"><Check size={17} /><span>{message}</span><button type="button" onClick={() => setMessage("")} aria-label="Cerrar mensaje"><X size={16} /></button></div>}
      {error && !modal && <p className="pm-error" role="alert">{error}</p>}

      <section className="pm-panel">
        <div className="pm-panel-heading">
          <div><h2>Pasajeros registrados</h2><p>Los datos se guardan directamente en el backend.</p></div>
          <button className="pm-primary-btn" type="button" onClick={openCreate}><Plus size={17} />Registrar pasajero</button>
        </div>
        <div className="pm-toolbar">
          <div className="pm-search"><Search size={18} /><input type="search" placeholder="Buscar por nombre, documento o correo..." value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Buscar pasajeros" />{search && <button type="button" onClick={() => setSearch("")} aria-label="Limpiar búsqueda"><X size={16} /></button>}</div>
        </div>
        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead><tr><th>ID</th><th>Pasajero</th><th>Documento</th><th>Nacionalidad</th><th>Correo</th><th>Fecha de nacimiento</th><th>Acciones</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={7} className="pm-empty">Cargando pasajeros...</td></tr> : visiblePassengers.map((passenger) => (
                <tr key={passenger.id}>
                  <td>{passenger.id}</td>
                  <td><div className="pm-person"><div className="pm-avatar">{String(passenger.nombreCompleto || "P").split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}</div><strong>{passenger.nombreCompleto}</strong></div></td>
                  <td><span className="pm-document">{passenger.tipoDocumento}</span><small className="pm-secondary">{passenger.numeroDocumento}</small></td>
                  <td>{passenger.nacionalidad || "—"}</td>
                  <td><div className="pm-contact"><span><Mail size={13} />{passenger.correo}</span></div></td>
                  <td>{formatDate(passenger.fechaNacimiento)}</td>
                  <td><div className="pm-actions"><button type="button" className="pm-icon-btn" title="Modificar pasajero" aria-label={`Modificar ${passenger.nombreCompleto}`} onClick={() => openEdit(passenger)}><Pencil size={16} /></button><button type="button" className="pm-icon-btn pm-delete-btn" title="Eliminar pasajero" aria-label={`Eliminar ${passenger.nombreCompleto}`} onClick={() => deletePassenger(passenger)}><Trash2 size={16} /></button></div></td>
                </tr>
              ))}
              {!loading && visiblePassengers.length === 0 && <tr><td colSpan={7} className="pm-empty"><Search size={25} /><strong>{passengers.length ? "No se encontraron pasajeros" : "Todavía no hay pasajeros registrados"}</strong><span>Registra un pasajero para que aparezca en esta lista.</span></td></tr>}
            </tbody>
          </table>
        </div>
        <div className="pm-table-footer"><span>Mostrando <strong>{visiblePassengers.length}</strong> de <strong>{passengers.length}</strong> pasajeros</span><span>Global Airport · Gestión de pasajeros</span></div>
      </section>

      {modal === "form" && <div className="pm-overlay" onMouseDown={(event) => event.target === event.currentTarget && !saving && setModal("")}>
        <section className="pm-modal pm-modal-wide" role="dialog" aria-modal="true" aria-labelledby="pm-form-title">
          <div className="pm-modal-header"><div><h2 id="pm-form-title">{selectedPassenger ? "Modificar pasajero" : "Registrar pasajero"}</h2><p>Complete los campos requeridos por el backend.</p></div><button type="button" className="pm-close" onClick={() => setModal("")} aria-label="Cerrar" disabled={saving}><X size={20} /></button></div>
          <form onSubmit={savePassenger}>
            <div className="pm-form-grid">
              <label className="pm-field pm-full">Nombre completo *<input value={form.nombreCompleto} onChange={(event) => updateField("nombreCompleto", event.target.value)} required /></label>
              <label className="pm-field">Tipo de documento *<select value={form.tipoDocumento} onChange={(event) => updateField("tipoDocumento", event.target.value)} required><option value="CEDULA">Cédula</option><option value="PASAPORTE">Pasaporte</option><option value="RESIDENCIA">Documento de residencia</option></select></label>
              <label className="pm-field">Número de documento *<input value={form.numeroDocumento} onChange={(event) => updateField("numeroDocumento", event.target.value)} required /></label>
              <label className="pm-field">Nacionalidad *<input value={form.nacionalidad} onChange={(event) => updateField("nacionalidad", event.target.value)} required /></label>
              <label className="pm-field">Fecha de nacimiento *<input type="date" value={form.fechaNacimiento} max={fechaMaxima} onChange={(event) => updateField("fechaNacimiento", event.target.value)} required /></label>
              <label className="pm-field">Correo electrónico *<input type="email" value={form.correo} onChange={(event) => updateField("correo", event.target.value)} required /></label>
              <label className="pm-field">Teléfono<input value={form.telefono} onChange={(event) => updateField("telefono", event.target.value)} /></label>
              <label className="pm-field pm-full">Dirección<input value={form.direccion} onChange={(event) => updateField("direccion", event.target.value)} /></label>
            </div>
            {error && <p className="pm-error" role="alert">{error}</p>}
            <div className="pm-modal-actions"><button type="button" className="pm-secondary-btn" onClick={() => setModal("")} disabled={saving}>Cancelar</button><button type="submit" className="pm-primary-btn" disabled={saving}><Check size={17} />{saving ? "Guardando..." : selectedPassenger ? "Guardar cambios" : "Registrar pasajero"}</button></div>
          </form>
        </section>
      </div>}
      </div>
    </main>
  );
}
