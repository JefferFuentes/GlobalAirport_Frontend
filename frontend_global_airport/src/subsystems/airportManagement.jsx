import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  Plane,
  MapPin,
  Building2,
  CheckCircle2,
  XCircle,
  Pencil,
  Eye,
  X,
  Check,
  SlidersHorizontal,
  ChevronDown,
  Phone,
  CalendarDays,
  UserRound,
  UserRoundCog,
  Globe,
  Trash2,
} from "lucide-react";
import "./css/airportManagement.css";

const initialAirports = [
  {
    id: "AER-001",
    name: "Aeropuerto Internacional Juan Santamaría",
    iata: "SJO",
    country: "Costa Rica",
    city: "Alajuela",
    address: "Río Segundo, Alajuela",
    phone: "2437-2400",
    status: "Activo",
    date: "15/10/2026",
    creator: "Administrador General",
  },
  {
    id: "AER-002",
    name: "Aeropuerto Internacional Daniel Oduber Quirós",
    iata: "LIR",
    country: "Costa Rica",
    city: "Liberia",
    address: "Comunidad, Liberia, Guanacaste",
    phone: "2666-9600",
    status: "Activo",
    date: "17/10/2026",
    creator: "Administrador General",
  },
  {
    id: "AER-003",
    name: "Aeropuerto Internacional Tobías Bolaños",
    iata: "SYQ",
    country: "Costa Rica",
    city: "San José",
    address: "Pavas, San José",
    phone: "2232-2820",
    status: "Activo",
    date: "19/10/2026",
    creator: "Administrador General",
  },
  {
    id: "AER-004",
    name: "Aeropuerto de Limón",
    iata: "LIO",
    country: "Costa Rica",
    city: "Limón",
    address: "Ruta 36, Limón",
    phone: "2799-0366",
    status: "Inactivo",
    date: "20/10/2026",
    creator: "Administrador General",
  },
];

const emptyForm = {
  name: "",
  iata: "",
  country: "",
  city: "",
  address: "",
  phone: "",
};

export default function AirportManagement() {
  const [airports, setAirports] = useState(initialAirports);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos los estados");
  const [countryFilter, setCountryFilter] = useState("Todos los países");
  const [modal, setModal] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [selectedAirport, setSelectedAirport] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const activeCount = airports.filter(
    (airport) => airport.status === "Activo"
  ).length;

  const inactiveCount = airports.length - activeCount;

  const countries = [
    ...new Set(airports.map((airport) => airport.country)),
  ].sort();

  const visibleAirports = useMemo(() => {
    const term = search.trim().toLowerCase();

    return airports.filter((airport) => {
      const matchesSearch = [
        airport.id,
        airport.name,
        airport.iata,
        airport.country,
        airport.city,
        airport.address,
        airport.phone,
      ].some((value) => value.toLowerCase().includes(term));

      const matchesStatus =
        statusFilter === "Todos los estados" ||
        airport.status === statusFilter;

      const matchesCountry =
        countryFilter === "Todos los países" ||
        airport.country === countryFilter;

      return matchesSearch && matchesStatus && matchesCountry;
    });
  }, [airports, search, statusFilter, countryFilter]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setMessage("");
    setModal("form");
  }

  function openEdit(airport) {
    setEditingId(airport.id);
    setForm({
      name: airport.name,
      iata: airport.iata,
      country: airport.country,
      city: airport.city,
      address: airport.address,
      phone: airport.phone,

    });
    setError("");
    setMessage("");
    setModal("form");
  }

  function updateForm(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function saveAirport(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    const name = form.name.trim();
    const iata = form.iata.trim().toUpperCase();
    const country = form.country.trim();
    const city = form.city.trim();
    const address = form.address.trim();
    const phone = form.phone.trim();

    if (!name || !iata || !country || !city || !address || !phone) {
      setError("Complete todos los campos obligatorios.");
      return;
    }

    if (!/^[A-Z]{3}$/.test(iata)) {
      setError("El código IATA debe contener exactamente 3 letras.");
      return;
    }

    const duplicateIata = airports.some(
      (airport) =>
        airport.iata.toUpperCase() === iata &&
        airport.id !== editingId
    );

    if (duplicateIata) {
      setError("Ya existe un aeropuerto registrado con ese código IATA.");
      return;
    }

    const duplicateNameAndIata = airports.some(
      (airport) =>
        airport.name.trim().toLowerCase() === name.toLowerCase() &&
        airport.iata.toUpperCase() === iata &&
        airport.id !== editingId
    );

    if (duplicateNameAndIata) {
      setError("Ya existe un aeropuerto con ese nombre y código IATA.");
      return;
    }

    if (editingId) {
      setAirports((current) =>
        current.map((airport) =>
          airport.id === editingId
            ? {
              ...airport,
              name,
              country,
              city,
              address,
              phone,

            }
            : airport
        )
      );

      setMessage("La información del aeropuerto se actualizó correctamente.");
    } else {
      const nextNumber =
        Math.max(
          0,
          ...airports.map(
            (airport) => Number(airport.id.split("-")[1]) || 0
          )
        ) + 1;

      const newAirport = {
        id: `AER-${String(nextNumber).padStart(3, "0")}`,
        name,
        iata,
        country,
        city,
        address,
        phone,
        status: "Activo",
        date: new Date().toLocaleDateString("es-CR"),
        creator: "Administrador General",
      };

      setAirports((current) => [newAirport, ...current]);
      setMessage("Aeropuerto registrado correctamente.");
    }

    setModal(null);
    setForm(emptyForm);
  }

  function toggleAirportStatus(airport) {
    const newStatus =
      airport.status === "Activo" ? "Inactivo" : "Activo";

    setAirports((current) =>
      current.map((item) =>
        item.id === airport.id
          ? { ...item, status: newStatus }
          : item
      )
    );

    setMessage(
      `${airport.name}: estado cambiado a ${newStatus.toLowerCase()}.`
    );
  }

  function deleteAirport(airport) {
    const confirmed = window.confirm(
      `¿Está seguro de eliminar el aeropuerto "${airport.name}" (${airport.iata})?`
    );

    if (!confirmed) return;

    setAirports((current) =>
      current.filter((item) => item.id !== airport.id)
    );

    if (selectedAirport?.id === airport.id) {
      setSelectedAirport(null);
      setModal(null);
    }

    setMessage(`El aeropuerto ${airport.iata} se eliminó correctamente.`);
  }

  function clearFilters() {
    setSearch("");
    setStatusFilter("Todos los estados");
    setCountryFilter("Todos los países");
  }

  return (
    <div className="am-page">
      <header className="am-topbar">
        <div>
          <div className="am-breadcrumb">
            Global Airport / Administración / Aeropuertos
          </div>
          <h2>Gestión de aeropuertos</h2>
        </div>

        <div className="am-top-actions">
          <div className="am-module-search">
            <Search size={17} />
            <span>Buscar módulo...</span>
          </div>
          <div className="am-avatar">GA</div>
        </div>
      </header>

      <main className="am-content">
        <div className="am-page-heading">
          <div>
            <div className="am-eyebrow">
              Administración del sistema
            </div>
            <h1>Gestión de aeropuertos</h1>
            <p>
              Administra las sedes aeroportuarias registradas en
              la plataforma Global Airport.
            </p>
          </div>
          <button
            className="am-secondary"
            onClick={() => {
              window.location.href = "/asignacion-administradores";
            }}
          >
            <UserRoundCog size={18} />
            Asignar administrador
          </button>
          <button className="am-primary" onClick={openCreate}>
            <Plus size={19} />
            Registrar aeropuerto
          </button>
        </div>

        <section className="am-stats">
          <article className="am-stat">
            <div className="am-stat-icon blue">
              <Building2 size={23} />
            </div>
            <div>
              <div className="am-stat-label">Total de aeropuertos</div>
              <div className="am-stat-value">{airports.length}</div>
            </div>
          </article>

          <article className="am-stat">
            <div className="am-stat-icon green">
              <CheckCircle2 size={23} />
            </div>
            <div>
              <div className="am-stat-label">Aeropuertos activos</div>
              <div className="am-stat-value">{activeCount}</div>
            </div>
          </article>

          <article className="am-stat">
            <div className="am-stat-icon sky">
              <Globe size={23} />
            </div>
            <div>
              <div className="am-stat-label">Países registrados</div>
              <div className="am-stat-value">{countries.length}</div>
            </div>
          </article>

          <article className="am-stat">
            <div className="am-stat-icon gray">
              <XCircle size={23} />
            </div>
            <div>
              <div className="am-stat-label">Aeropuertos inactivos</div>
              <div className="am-stat-value">{inactiveCount}</div>
            </div>
          </article>
        </section>

        <section className="am-panel">
          <div className="am-panel-heading">
            <div>
              <h3>Directorio de aeropuertos</h3>
              <p>
                Consulta, registra y administra la información de cada sede.
              </p>
            </div>
            <div className="am-total-badge">
              <Plane size={16} />
              {airports.length} sedes registradas
            </div>
          </div>

          <div className="am-toolbar">
            <label className="am-search-box">
              <Search size={18} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nombre, IATA, país o ciudad..."
                aria-label="Buscar aeropuertos"
              />
            </label>

            <label className="am-filter">
              <select
                value={countryFilter}
                onChange={(event) => setCountryFilter(event.target.value)}
                aria-label="Filtrar por país"
              >
                <option>Todos los países</option>
                {countries.map((country) => (
                  <option key={country}>{country}</option>
                ))}
              </select>
              <ChevronDown size={16} />
            </label>

            <label className="am-filter">
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                aria-label="Filtrar por estado"
              >
                <option>Todos los estados</option>
                <option>Activo</option>
                <option>Inactivo</option>
              </select>
              <ChevronDown size={16} />
            </label>

            <button
              className="am-filter-icon"
              title="Limpiar filtros"
              aria-label="Limpiar filtros"
              onClick={clearFilters}
            >
              <SlidersHorizontal size={18} />
            </button>
          </div>

          {message && (
            <div className="am-notice">
              <CheckCircle2 size={17} />
              <span>{message}</span>
              <button
                onClick={() => setMessage("")}
                aria-label="Cerrar mensaje"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div className="am-table-wrap">
            <table className="am-table">
              <thead>
                <tr>
                  <th>Aeropuerto</th>
                  <th>ID / IATA</th>
                  <th>Ubicación</th>
                  <th>Estado operativo</th>
                  <th>Fecha de registro</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {visibleAirports.map((airport) => (
                  <tr key={airport.id}>
                    <td>
                      <div className="am-airport-cell">
                        <div className="am-airport-icon">
                          <Plane size={19} />
                        </div>
                        <div className="am-airport-info">
                          <strong>{airport.name}</strong>
                          <span>
                            <MapPin size={12} />
                            {airport.address}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="am-id-cell">
                        <strong>{airport.id}</strong>
                        <span className="am-iata">{airport.iata}</span>
                      </div>
                    </td>

                    <td>
                      <div className="am-location-cell">
                        <strong>{airport.city}</strong>
                        <span>{airport.country}</span>
                      </div>
                    </td>

                    <td>
                      <span
                        className={`am-status ${airport.status === "Activo" ? "active" : "inactive"
                          }`}
                      >
                        <span />
                        {airport.status}
                      </span>
                    </td>

                    <td>{airport.date}</td>

                    <td>
                      <div className="am-actions">
                        <button
                          className="am-icon-btn"
                          title="Ver detalles"
                          aria-label={`Ver ${airport.name}`}
                          onClick={() => {
                            setSelectedAirport(airport);
                            setModal("details");
                          }}
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          className="am-icon-btn"
                          title="Modificar aeropuerto"
                          aria-label={`Modificar ${airport.name}`}
                          onClick={() => openEdit(airport)}
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          className={`am-toggle ${airport.status === "Activo" ? "on" : "off"
                            }`}
                          title={
                            airport.status === "Activo"
                              ? "Desactivar aeropuerto"
                              : "Activar aeropuerto"
                          }
                          aria-label={`Cambiar estado de ${airport.name}`}
                          onClick={() => toggleAirportStatus(airport)}
                        >
                          <span />
                        </button>
                        <button
                          type="button"
                          className="am-delete-btn"
                          title="Eliminar aeropuerto"
                          aria-label={`Eliminar ${airport.name}`}
                          onClick={() => deleteAirport(airport)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {visibleAirports.length === 0 && (
                  <tr>
                    <td colSpan={6} className="am-empty">
                      <Plane size={30} />
                      <strong>No se encontraron aeropuertos</strong>
                      <span>
                        Intente cambiar los filtros o los términos de búsqueda.
                      </span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <footer className="am-table-footer">
            <span>
              Mostrando {visibleAirports.length} de {airports.length} aeropuertos
            </span>
            <span>Global Airport · Gestión de aeropuertos</span>
          </footer>
        </section>
      </main>

      {modal === "form" && (
        <div
          className="am-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setModal(null);
          }}
        >
          <section className="am-modal" role="dialog" aria-modal="true">
            <header className="am-modal-header">
              <div className="am-modal-title-icon">
                <Plane size={22} />
              </div>
              <div className="am-modal-title">
                <h3>
                  {editingId ? "Modificar aeropuerto" : "Registrar aeropuerto"}
                </h3>
                <p>
                  {editingId
                    ? `ID ${editingId} · El ID y el código IATA no se pueden modificar.`
                    : "Complete los datos para registrar una nueva sede."}
                </p>
              </div>
              <button
                className="am-close-btn"
                onClick={() => setModal(null)}
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </header>

            <form className="am-modal-body" onSubmit={saveAirport}>
              {error && <div className="am-error">{error}</div>}

              <div className="am-form-grid">
                {editingId && (
                  <>
                    <div className="am-field">
                      <label>ID aeropuerto</label>
                      <input value={editingId} readOnly />
                    </div>
                    <div className="am-field">
                      <label>Código IATA</label>
                      <input value={form.iata} readOnly />
                    </div>
                  </>
                )}

                <div className="am-field full">
                  <label>Nombre del aeropuerto <span>*</span></label>
                  <input
                    value={form.name}
                    onChange={(event) => updateForm("name", event.target.value)}
                    placeholder="Ej. Aeropuerto Internacional..."
                    required
                  />
                </div>

                {!editingId && (
                  <div className="am-field">
                    <label>Código IATA <span>*</span></label>
                    <input
                      value={form.iata}
                      onChange={(event) =>
                        updateForm("iata", event.target.value.toUpperCase())
                      }
                      placeholder="Ej. SJO"
                      maxLength={3}
                      required
                    />
                    <small>Debe contener exactamente 3 letras.</small>
                  </div>
                )}

                <div className="am-field">
                  <label>País <span>*</span></label>
                  <input
                    value={form.country}
                    onChange={(event) =>
                      updateForm("country", event.target.value)
                    }
                    placeholder="Ej. Costa Rica"
                    required
                  />
                </div>

                <div className="am-field">
                  <label>Ciudad <span>*</span></label>
                  <input
                    value={form.city}
                    onChange={(event) => updateForm("city", event.target.value)}
                    placeholder="Ciudad"
                    required
                  />
                </div>

                <div className="am-field">
                  <label>Teléfono <span>*</span></label>
                  <input
                    value={form.phone}
                    onChange={(event) =>
                      updateForm("phone", event.target.value)
                    }
                    placeholder="Número telefónico"
                    required
                  />
                </div>

                <div className="am-field full">
                  <label>Dirección <span>*</span></label>
                  <input
                    value={form.address}
                    onChange={(event) =>
                      updateForm("address", event.target.value)
                    }
                    placeholder="Dirección física del aeropuerto"
                    required
                  />
                </div>


              </div>

              {!editingId && (
                <div className="am-info-banner">
                  <CheckCircle2 size={18} />
                  <span>
                    El aeropuerto se registrará inicialmente como activo.
                    El ID y la fecha se generan automáticamente.
                  </span>
                </div>
              )}

              <div className="am-modal-footer">
                <button
                  type="button"
                  className="am-secondary"
                  onClick={() => setModal(null)}
                >
                  Cancelar
                </button>
                <button type="submit" className="am-primary">
                  <Check size={17} />
                  {editingId ? "Guardar cambios" : "Registrar aeropuerto"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {modal === "details" && selectedAirport && (
        <div
          className="am-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setModal(null);
          }}
        >
          <section className="am-modal am-details-modal" role="dialog" aria-modal="true">
            <header className="am-modal-header">
              <div className="am-modal-title-icon">
                <Plane size={22} />
              </div>
              <div className="am-modal-title">
                <h3>Detalles del aeropuerto</h3>
                <p>{selectedAirport.id} · Código IATA {selectedAirport.iata}</p>
              </div>
              <button
                className="am-close-btn"
                onClick={() => setModal(null)}
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </header>

            <div className="am-details-body">
              <div className="am-details-banner">
                <div className="am-details-plane">
                  <Plane size={27} />
                </div>
                <div>
                  <h4>{selectedAirport.name}</h4>
                  <span
                    className={`am-status ${selectedAirport.status === "Activo" ? "active" : "inactive"
                      }`}
                  >
                    <span />
                    {selectedAirport.status}
                  </span>
                </div>
              </div>

              <div className="am-details-grid">
                <div className="am-detail-item">
                  <span>ID aeropuerto</span>
                  <strong>{selectedAirport.id}</strong>
                </div>
                <div className="am-detail-item">
                  <span>Código IATA</span>
                  <strong>{selectedAirport.iata}</strong>
                </div>
                <div className="am-detail-item">
                  <span>País</span>
                  <strong>{selectedAirport.country}</strong>
                </div>
                <div className="am-detail-item">
                  <span>Ciudad</span>
                  <strong>{selectedAirport.city}</strong>
                </div>
                <div className="am-detail-item full">
                  <span>Dirección</span>
                  <strong>
                    <MapPin size={15} />
                    {selectedAirport.address}
                  </strong>
                </div>
                <div className="am-detail-item">
                  <span>Teléfono</span>
                  <strong>
                    <Phone size={15} />
                    {selectedAirport.phone}
                  </strong>
                </div>
                <div className="am-detail-item">
                  <span>Fecha de registro</span>
                  <strong>
                    <CalendarDays size={15} />
                    {selectedAirport.date}
                  </strong>
                </div>
                <div className="am-detail-item full">
                  <span>Usuario creador</span>
                  <strong>
                    <UserRound size={15} />
                    {selectedAirport.creator}
                  </strong>
                </div>
              </div>

              <div className="am-modal-footer">
                <button
                  className="am-secondary"
                  onClick={() => setModal(null)}
                >
                  Cerrar
                </button>
                <button
                  className="am-primary"
                  onClick={() => openEdit(selectedAirport)}
                >
                  <Pencil size={16} />
                  Modificar aeropuerto
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}