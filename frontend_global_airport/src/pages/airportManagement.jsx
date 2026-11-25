import { useEffect, useMemo, useState } from "react";
import { Building2, Check, CheckCircle2, MapPin, Pencil, Plane, Plus, Search, SlidersHorizontal, Trash2, X } from "lucide-react";
import airportService from "../services/airportService";
import "./css/airportManagement.css";

const emptyForm = { nombre: "", codigoIata: "", pais: "", ciudad: "", direccion: "" };
const errorMessage = (error) => error.response?.data?.mensaje || error.response?.data?.message ||
  (Array.isArray(error.response?.data?.errores) ? error.response.data.errores.join(". ") : null) ||
  error.message || "No se pudo completar la operación.";

export default function AirportManagement() {
  const [airports, setAirports] = useState([]);
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [modal, setModal] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [selectedAirport, setSelectedAirport] = useState(null);
  const [form, setForm] = useState(emptyForm);

  async function loadAirports(mostrarCarga = true) {
    if (mostrarCarga) {
      setLoading(true);
      setError("");
    }
    try {
      const data = await airportService.listar();
      if (!Array.isArray(data)) throw new Error("El servidor no devolvió una lista de aeropuertos.");
      setAirports(data);
    } catch (loadError) {
      setError(errorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void Promise.resolve().then(() => loadAirports(false)); }, []);

  const countries = useMemo(() => [...new Set(airports.map((airport) => airport.pais).filter(Boolean))].sort(), [airports]);
  const visibleAirports = useMemo(() => {
    const term = search.trim().toLowerCase();
    return [...airports].sort((a, b) => Number(b.id) - Number(a.id)).filter((airport) => {
      const matchesSearch = [airport.id, airport.nombre, airport.codigoIata, airport.pais, airport.ciudad, airport.direccion]
        .some((value) => String(value || "").toLowerCase().includes(term));
      return matchesSearch && (!countryFilter || airport.pais === countryFilter);
    });
  }, [airports, search, countryFilter]);

  function openCreate() {
    setEditingId(null);
    setSelectedAirport(null);
    setForm(emptyForm);
    setError("");
    setModal("form");
  }

  function openEdit(airport) {
    setEditingId(airport.id);
    setSelectedAirport(airport);
    setForm({ nombre: airport.nombre || "", codigoIata: airport.codigoIata || "", pais: airport.pais || "", ciudad: airport.ciudad || "", direccion: airport.direccion || "" });
    setError("");
    setModal("form");
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function saveAirport(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const data = {
      nombre: form.nombre.trim(),
      codigoIata: form.codigoIata.trim().toUpperCase(),
      pais: form.pais.trim(),
      ciudad: form.ciudad.trim(),
      direccion: form.direccion.trim(),
    };
    try {
      if (editingId) {
        await airportService.actualizar(editingId, data);
        setMessage("Los datos del aeropuerto se actualizaron correctamente.");
      } else {
        await airportService.crear(data);
        setMessage("El aeropuerto se registró correctamente.");
      }
      setModal("");
      await loadAirports();
    } catch (saveError) {
      setError(errorMessage(saveError));
    } finally {
      setSaving(false);
    }
  }

  async function deleteAirport(airport) {
    if (!window.confirm(`¿Desea eliminar el aeropuerto “${airport.nombre}” (${airport.codigoIata})?`)) return;
    setError("");
    setMessage("");
    try {
      await airportService.eliminar(airport.id);
      setMessage(`El aeropuerto ${airport.codigoIata} se eliminó correctamente.`);
      if (selectedAirport?.id === airport.id) setModal("");
      await loadAirports();
    } catch (deleteError) {
      setError(errorMessage(deleteError));
    }
  }

  return (
    <div className="am-page">
      <header className="am-topbar"><div><div className="am-breadcrumb">Global Airport / Aeropuertos</div><h2>Gestión de aeropuertos</h2></div><div className="am-top-actions"><div className="am-avatar">GA</div></div></header>
      <main className="am-content">
        <div className="am-page-heading"><div><div className="am-eyebrow">Infraestructura aeroportuaria</div><h1>Administración de aeropuertos</h1><p>Registra y administra las sedes disponibles en el sistema.</p></div><button type="button" className="am-primary" onClick={openCreate}><Plus size={18} />Registrar aeropuerto</button></div>
        <section className="am-stats">
          <article className="am-stat"><div className="am-stat-icon blue"><Plane size={23} /></div><div><div className="am-stat-label">Aeropuertos registrados</div><div className="am-stat-value">{airports.length}</div></div></article>
          <article className="am-stat"><div className="am-stat-icon green"><Building2 size={23} /></div><div><div className="am-stat-label">Países</div><div className="am-stat-value">{countries.length}</div></div></article>
          <article className="am-stat"><div className="am-stat-icon sky"><MapPin size={23} /></div><div><div className="am-stat-label">En esta búsqueda</div><div className="am-stat-value">{visibleAirports.length}</div></div></article>
        </section>

        <section className="am-panel">
          <div className="am-panel-heading"><div><h3>Directorio de aeropuertos</h3><p>Consulta y actualiza la información guardada en el backend.</p></div><span className="am-total-badge"><Plane size={16} />{airports.length} registros</span></div>
          <div className="am-toolbar">
            <label className="am-search-box"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre, IATA, país o ciudad..." aria-label="Buscar aeropuertos" /></label>
            <label className="am-filter"><select value={countryFilter} onChange={(event) => setCountryFilter(event.target.value)} aria-label="Filtrar por país"><option value="">Todos los países</option>{countries.map((country) => <option key={country} value={country}>{country}</option>)}</select></label>
            <button type="button" className="am-filter-icon" title="Limpiar filtros" aria-label="Limpiar filtros" onClick={() => { setSearch(""); setCountryFilter(""); }}><SlidersHorizontal size={18} /></button>
          </div>
          {message && <div className="am-notice"><CheckCircle2 size={17} /><span>{message}</span><button type="button" onClick={() => setMessage("")} aria-label="Cerrar mensaje"><X size={16} /></button></div>}
          {error && !modal && <div className="am-error" style={{ margin: "0 23px 18px" }} role="alert">{error}</div>}
          <div className="am-table-wrap"><table className="am-table">
            <thead><tr><th>Aeropuerto</th><th>ID / IATA</th><th>Ubicación</th><th>Dirección</th><th>Acciones</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={5} className="am-empty">Cargando aeropuertos...</td></tr> : visibleAirports.map((airport) => <tr key={airport.id}>
                <td><div className="am-airport-cell"><div className="am-airport-icon"><Plane size={19} /></div><div className="am-airport-info"><strong>{airport.nombre}</strong><span><MapPin size={12} />{airport.ciudad}, {airport.pais}</span></div></div></td>
                <td><div className="am-id-cell"><strong>#{airport.id}</strong><span className="am-iata">{airport.codigoIata}</span></div></td>
                <td><div className="am-location-cell"><strong>{airport.ciudad}</strong><span>{airport.pais}</span></div></td>
                <td>{airport.direccion || "—"}</td>
                <td><div className="am-actions"><button type="button" className="am-icon-btn" title="Ver detalles" aria-label={`Ver ${airport.nombre}`} onClick={() => { setSelectedAirport(airport); setModal("details"); }}><Search size={16} /></button><button type="button" className="am-icon-btn" title="Modificar aeropuerto" aria-label={`Modificar ${airport.nombre}`} onClick={() => openEdit(airport)}><Pencil size={16} /></button><button type="button" className="am-delete-btn" title="Eliminar aeropuerto" aria-label={`Eliminar ${airport.nombre}`} onClick={() => deleteAirport(airport)}><Trash2 size={16} /></button></div></td>
              </tr>)}
              {!loading && visibleAirports.length === 0 && <tr><td colSpan={5} className="am-empty"><Plane size={30} /><strong>{airports.length ? "No se encontraron aeropuertos" : "Todavía no hay aeropuertos registrados"}</strong><span>Registra un aeropuerto para agregarlo al directorio.</span></td></tr>}
            </tbody>
          </table></div>
          <footer className="am-table-footer"><span>Mostrando {visibleAirports.length} de {airports.length} aeropuertos</span><span>Global Airport · Gestión de aeropuertos</span></footer>
        </section>
      </main>

      {modal === "form" && <div className="am-overlay" onMouseDown={(event) => event.target === event.currentTarget && !saving && setModal("")}>
        <section className="am-modal" role="dialog" aria-modal="true" aria-labelledby="am-form-title">
          <header className="am-modal-header"><div className="am-modal-title-icon"><Plane size={22} /></div><div className="am-modal-title"><h3 id="am-form-title">{editingId ? "Modificar aeropuerto" : "Registrar aeropuerto"}</h3><p>Los datos corresponden al modelo de Aeropuerto del backend.</p></div><button type="button" className="am-close-btn" onClick={() => setModal("")} aria-label="Cerrar" disabled={saving}><X size={18} /></button></header>
          <form className="am-modal-body" onSubmit={saveAirport}>
            {error && <div className="am-error" role="alert">{error}</div>}
            <div className="am-form-grid">
              <div className="am-field full"><label>Nombre del aeropuerto <span>*</span></label><input value={form.nombre} onChange={(event) => updateField("nombre", event.target.value)} required /></div>
              <div className="am-field"><label>Código IATA <span>*</span></label><input value={form.codigoIata} onChange={(event) => updateField("codigoIata", event.target.value.toUpperCase())} maxLength={3} minLength={3} placeholder="SJO" required /><small>Debe contener tres letras y ser único.</small></div>
              <div className="am-field"><label>País <span>*</span></label><input value={form.pais} onChange={(event) => updateField("pais", event.target.value)} required /></div>
              <div className="am-field"><label>Ciudad <span>*</span></label><input value={form.ciudad} onChange={(event) => updateField("ciudad", event.target.value)} required /></div>
              <div className="am-field full"><label>Dirección <span>*</span></label><input value={form.direccion} onChange={(event) => updateField("direccion", event.target.value)} required /></div>
            </div>
            <div className="am-modal-footer"><button type="button" className="am-secondary" onClick={() => setModal("")} disabled={saving}>Cancelar</button><button type="submit" className="am-primary" disabled={saving}><Check size={17} />{saving ? "Guardando..." : editingId ? "Guardar cambios" : "Registrar aeropuerto"}</button></div>
          </form>
        </section>
      </div>}

      {modal === "details" && selectedAirport && <div className="am-overlay" onMouseDown={(event) => event.target === event.currentTarget && setModal("")}>
        <section className="am-modal am-details-modal" role="dialog" aria-modal="true" aria-labelledby="am-details-title">
          <header className="am-modal-header"><div className="am-modal-title-icon"><Plane size={22} /></div><div className="am-modal-title"><h3 id="am-details-title">Detalles del aeropuerto</h3><p>ID {selectedAirport.id} · Código IATA {selectedAirport.codigoIata}</p></div><button type="button" className="am-close-btn" onClick={() => setModal("")} aria-label="Cerrar"><X size={18} /></button></header>
          <div className="am-details-body"><div className="am-details-banner"><div className="am-details-plane"><Plane size={27} /></div><div><h4>{selectedAirport.nombre}</h4><span className="am-iata">{selectedAirport.codigoIata}</span></div></div>
            <div className="am-details-grid"><div className="am-detail-item"><span>ID aeropuerto</span><strong>{selectedAirport.id}</strong></div><div className="am-detail-item"><span>Código IATA</span><strong>{selectedAirport.codigoIata}</strong></div><div className="am-detail-item"><span>País</span><strong>{selectedAirport.pais}</strong></div><div className="am-detail-item"><span>Ciudad</span><strong>{selectedAirport.ciudad}</strong></div><div className="am-detail-item full"><span>Dirección</span><strong><MapPin size={15} />{selectedAirport.direccion}</strong></div></div>
            <div className="am-modal-footer"><button type="button" className="am-secondary" onClick={() => setModal("")}>Cerrar</button><button type="button" className="am-primary" onClick={() => openEdit(selectedAirport)}><Pencil size={16} />Modificar aeropuerto</button></div>
          </div>
        </section>
      </div>}
    </div>
  );
}
