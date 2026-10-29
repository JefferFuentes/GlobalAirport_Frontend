
import { useMemo, useState } from "react";
import {
    Search,
    Plus,
    Users,
    UserRound,
    Pencil,
    X,
    Check,
    Plane,
    History,
    Mail,
    Phone,
    MapPin,
    CalendarDays,
    FileText,
    Globe,
    Eye,
    UserCircle,
    Clock,
    ChevronDown,
    Trash2,
} from "lucide-react";

import "./css/passengerManagement.css";

const initialPassengers = [
    {
        id: "PAS-001",
        fullName: "María Fernanda Rodríguez",
        documentType: "Cédula",
        documentNumber: "1-1234-0567",
        nationality: "Costarricense",
        birthDate: "1998-05-14",
        email: "maria.rodriguez@email.com",
        phone: "8888-1234",
        address: "Siquirres, Limón, Costa Rica",
        registrationDate: "2026-08-10",
        status: "Activo",
        trips: [
            {
                flight: "GA-102",
                date: "2026-10-15",
                origin: "Juan Santamaría (SJO)",
                destination: "Tocumen (PTY)",
                flightStatus: "Completado",
                reservationStatus: "Confirmada",
                pilot: "Carlos Méndez",
            },
            {
                flight: "GA-205",
                date: "2026-06-20",
                origin: "Tocumen (PTY)",
                destination: "Juan Santamaría (SJO)",
                flightStatus: "Completado",
                reservationStatus: "Cancelada",
                pilot: "Andrés Vargas",
            },
        ],
        audit: [],
    },
    {
        id: "PAS-002",
        fullName: "Carlos Andrés Jiménez",
        documentType: "Pasaporte",
        documentNumber: "CR-A782451",
        nationality: "Costarricense",
        birthDate: "1995-11-02",
        email: "carlos.jimenez@email.com",
        phone: "8700-5678",
        address: "Cartago, Costa Rica",
        registrationDate: "2026-08-18",
        status: "Activo",
        trips: [
            {
                flight: "GA-310",
                date: "2026-09-05",
                origin: "Juan Santamaría (SJO)",
                destination: "El Dorado (BOG)",
                flightStatus: "Completado",
                reservationStatus: "Confirmada",
                pilot: "Daniel Solano",
            },
        ],
        audit: [],
    },
    {
        id: "PAS-003",
        fullName: "Sofía Valverde Mora",
        documentType: "Documento de Residencia",
        documentNumber: "DIM-784512",
        nationality: "Nicaragüense",
        birthDate: "2001-03-27",
        email: "sofia.valverde@email.com",
        phone: "8555-9012",
        address: "Heredia, Costa Rica",
        registrationDate: "2026-09-02",
        status: "Activo",
        trips: [],
        audit: [],
    },
    {
        id: "PAS-004",
        fullName: "Daniel Vargas Solano",
        documentType: "Cédula",
        documentNumber: "2-0987-0654",
        nationality: "Costarricense",
        birthDate: "1988-07-19",
        email: "daniel.vargas@email.com",
        phone: "8999-1234",
        address: "Alajuela, Costa Rica",
        registrationDate: "2026-09-12",
        status: "Inactivo",
        trips: [],
        audit: [],
    },
];

const emptyForm = {
    fullName: "",
    documentType: "Cédula",
    documentNumber: "",
    nationality: "",
    birthDate: "",
    email: "",
    phone: "",
    address: "",
};

const today = () => new Date().toISOString().slice(0, 10);

const formatDate = (date) => {
    if (!date) return "—";
    return new Date(`${date}T12:00:00`).toLocaleDateString("es-CR");
};

export default function PassengerManagement() {
    const [passengers, setPassengers] = useState(initialPassengers);
    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState({
        nationality: "",
        status: "",
    });

    const [view, setView] = useState("all");
    const [role, setRole] = useState("Empleado");
    const [modal, setModal] = useState("");
    const [selectedPassenger, setSelectedPassenger] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const visiblePassengers = useMemo(() => {
        const term = search.trim().toLowerCase();

        return passengers.filter((passenger) => {
            const matchesSearch =
                !term ||
                passenger.fullName.toLowerCase().includes(term) ||
                passenger.documentNumber.toLowerCase().includes(term) ||
                passenger.email.toLowerCase().includes(term);

            const matchesNationality =
                !filters.nationality ||
                passenger.nationality === filters.nationality;

            const matchesStatus =
                !filters.status || passenger.status === filters.status;

            const matchesView =
                view !== "active" || passenger.status === "Activo";

            return (
                matchesSearch &&
                matchesNationality &&
                matchesStatus &&
                matchesView
            );
        });
    }, [passengers, search, filters, view]);

    const activeCount = passengers.filter(
        (passenger) => passenger.status === "Activo"
    ).length;

    const totalTrips = passengers.reduce(
        (total, passenger) => total + passenger.trips.length,
        0
    );

    const openCreate = () => {
        setEditingId(null);
        setForm(emptyForm);
        setError("");
        setMessage("");
        setModal("form");
    };

    const openEdit = (passenger) => {
        setEditingId(passenger.id);
        setForm({
            email: passenger.email,
            phone: passenger.phone,
            address: passenger.address,
        });
        setSelectedPassenger(passenger);
        setError("");
        setMessage("");
        setModal("edit");
    };

    const openProfile = (passenger) => {
        setSelectedPassenger(passenger);
        setModal("profile");
        setError("");
    };

    const updateField = (field, value) => {
        setForm((current) => ({ ...current, [field]: value }));
        setError("");
    };

    const savePassenger = (event) => {
        event.preventDefault();
        setError("");
        setMessage("");

        if (modal === "form") {
            const requiredFields = [
                "fullName",
                "documentType",
                "documentNumber",
                "nationality",
                "birthDate",
                "email",
                "phone",
                "address",
            ];

            if (requiredFields.some((field) => !form[field]?.trim())) {
                setError("Completá todos los campos obligatorios.");
                return;
            }

            const duplicateDocument = passengers.some(
                (passenger) =>
                    passenger.documentNumber.trim().toLowerCase() ===
                    form.documentNumber.trim().toLowerCase()
            );

            if (duplicateDocument) {
                setError("Ya existe un pasajero con ese número de documento.");
                return;
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
                setError("Ingresá un correo electrónico válido.");
                return;
            }

            if (new Date(form.birthDate) > new Date(today())) {
                setError("La fecha de nacimiento no puede ser futura.");
                return;
            }

            const age =
                new Date(today()).getFullYear() -
                new Date(form.birthDate).getFullYear() -
                (today().slice(5) < form.birthDate.slice(5) ? 1 : 0);

            if (age < 18) {
                setError(
                    "El pasajero es menor de edad. Verificá las políticas de viaje antes de registrarlo."
                );
                return;
            }

            const nextNumber =
                passengers.reduce((max, passenger) => {
                    const number = Number(passenger.id.replace("PAS-", ""));
                    return Number.isFinite(number) ? Math.max(max, number) : max;
                }, 0) + 1;

            const newPassenger = {
                ...form,
                id: `PAS-${String(nextNumber).padStart(3, "0")}`,
                documentNumber: form.documentNumber.trim(),
                fullName: form.fullName.trim(),
                nationality: form.nationality.trim(),
                email: form.email.trim(),
                phone: form.phone.trim(),
                address: form.address.trim(),
                registrationDate: today(),
                status: "Activo",
                trips: [],
                audit: [],
            };

            setPassengers((current) => [...current, newPassenger]);
            setModal("");
            setForm(emptyForm);
            setMessage(`Pasajero ${newPassenger.id} registrado correctamente.`);
            setView("all");
            setSearch("");
            return;
        }

        if (modal === "edit" && selectedPassenger) {
            if (!form.email?.trim() || !form.phone?.trim() || !form.address?.trim()) {
                setError("Correo, teléfono y dirección son obligatorios.");
                return;
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
                setError("Ingresá un correo electrónico válido.");
                return;
            }

            const changedAt = new Date().toISOString();

            setPassengers((current) =>
                current.map((passenger) =>
                    passenger.id === editingId
                        ? {
                            ...passenger,
                            email: form.email.trim(),
                            phone: form.phone.trim(),
                            address: form.address.trim(),
                            audit: [
                                ...passenger.audit,
                                {
                                    date: changedAt,
                                    description: "Se actualizaron los datos de contacto.",
                                },
                            ],
                        }
                        : passenger
                )
            );

            setSelectedPassenger((current) => ({
                ...current,
                email: form.email.trim(),
                phone: form.phone.trim(),
                address: form.address.trim(),
                audit: [
                    ...(current?.audit || []),
                    {
                        date: changedAt,
                        description: "Se actualizaron los datos de contacto.",
                    },
                ],
            }));

            setModal("");
            setMessage(`Datos de ${selectedPassenger.fullName} actualizados.`);
        }
    };

    const toggleStatus = (passenger) => {
        if (
            !window.confirm(
                `¿Deseás ${passenger.status === "Activo" ? "desactivar" : "activar"
                } a ${passenger.fullName}?`
            )
        ) {
            return;
        }

        const newStatus = passenger.status === "Activo" ? "Inactivo" : "Activo";

        setPassengers((current) =>
            current.map((item) =>
                item.id === passenger.id
                    ? {
                        ...item,
                        status: newStatus,
                        audit: [
                            ...item.audit,
                            {
                                date: new Date().toISOString(),
                                description: `Estado cambiado a ${newStatus}.`,
                            },
                        ],
                    }
                    : item
            )
        );

        setSelectedPassenger((current) =>
            current?.id === passenger.id
                ? { ...current, status: newStatus }
                : current
        );

        setMessage(`Estado actualizado: ${newStatus}.`);
    };

    const deletePassenger = (passenger) => {
        const confirmed = window.confirm(
            `¿Estás segura de que deseas eliminar al pasajero ${passenger.fullName}? Esta acción no se puede deshacer.`
        );

        if (!confirmed) return;

        setPassengers((current) =>
            current.filter((item) => item.id !== passenger.id)
        );

        if (selectedPassenger?.id === passenger.id) {
            setSelectedPassenger(null);
            setModal("");
        }

        setMessage(`El pasajero ${passenger.fullName} fue eliminado.`);
    };

    const openTrips = (passenger) => {
        setSelectedPassenger(passenger);
        setModal("trips");
    };

    return (
        <main className="pm-page">
            <header className="pm-header">
                <div className="pm-heading">
                    <div className="pm-heading-icon">
                        <Users size={27} />
                    </div>
                    <div>
                        <h1>Gestión de Pasajeros</h1>
                        <p>
                            Administración de pasajeros, información personal e historial
                            de viajes.
                        </p>
                    </div>
                </div>

                <div className="pm-role-control">
                    <label htmlFor="pm-role">Vista de demostración</label>
                    <div className="pm-select-wrap">
                        <UserRound size={16} />
                        <select
                            id="pm-role"
                            value={role}
                            onChange={(event) => {
                                setRole(event.target.value);
                                setMessage("");
                            }}
                        >
                            <option value="Empleado">Empleado</option>
                            <option value="Cliente">Cliente</option>
                        </select>
                        <ChevronDown size={15} />
                    </div>
                </div>
            </header>

            {message && (
                <div className="pm-message" role="status">
                    <Check size={17} />
                    <span>{message}</span>
                    <button onClick={() => setMessage("")} aria-label="Cerrar mensaje">
                        <X size={16} />
                    </button>
                </div>
            )}

            <section className="pm-stats">
                <article className="pm-stat-card">
                    <div className="pm-stat-icon blue">
                        <Users size={21} />
                    </div>
                    <div>
                        <span>Total de pasajeros</span>
                        <strong>{passengers.length}</strong>
                        <small>Registros en la plataforma</small>
                    </div>
                </article>

                <article className="pm-stat-card">
                    <div className="pm-stat-icon green">
                        <UserCircle size={21} />
                    </div>
                    <div>
                        <span>Pasajeros activos</span>
                        <strong>{activeCount}</strong>
                        <small>Con estado activo</small>
                    </div>
                </article>

                <article className="pm-stat-card">
                    <div className="pm-stat-icon sky">
                        <Plane size={21} />
                    </div>
                    <div>
                        <span>Viajes registrados</span>
                        <strong>{totalTrips}</strong>
                        <small>En los historiales de prueba</small>
                    </div>
                </article>
            </section>

            <section className="pm-panel">
                <div className="pm-panel-heading">
                    <div>
                        <h2>Directorio de pasajeros</h2>
                        <p>Buscá y consultá la información registrada.</p>
                    </div>

                    {role === "Empleado" && (
                        <button className="pm-primary-btn" onClick={openCreate}>
                            <Plus size={18} />
                            Registrar pasajero
                        </button>
                    )}
                </div>

                <div className="pm-toolbar">
                    <div className="pm-search">
                        <Search size={18} />
                        <input
                            type="search"
                            placeholder="Buscar por nombre, documento o correo..."
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                        />
                        {search && (
                            <button
                                onClick={() => setSearch("")}
                                aria-label="Limpiar búsqueda"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    <select
                        aria-label="Filtrar por nacionalidad"
                        value={filters.nationality}
                        onChange={(event) =>
                            setFilters((current) => ({
                                ...current,
                                nationality: event.target.value,
                            }))
                        }
                    >
                        <option value="">Todas las nacionalidades</option>
                        {[...new Set(passengers.map((p) => p.nationality))]
                            .filter(Boolean)
                            .sort()
                            .map((nationality) => (
                                <option key={nationality} value={nationality}>
                                    {nationality}
                                </option>
                            ))}
                    </select>

                    <select
                        aria-label="Filtrar por estado"
                        value={filters.status}
                        onChange={(event) =>
                            setFilters((current) => ({
                                ...current,
                                status: event.target.value,
                            }))
                        }
                    >
                        <option value="">Todos los estados</option>
                        <option value="Activo">Activo</option>
                        <option value="Inactivo">Inactivo</option>
                    </select>
                </div>

                <div className="pm-tabs">
                    <button
                        className={view === "all" ? "active" : ""}
                        onClick={() => setView("all")}
                    >
                        Todos los pasajeros
                        <span>{passengers.length}</span>
                    </button>
                    <button
                        className={view === "active" ? "active" : ""}
                        onClick={() => setView("active")}
                    >
                        Activos
                        <span>{activeCount}</span>
                    </button>
                </div>

                <div className="pm-table-wrap">
                    <table className="pm-table">
                        <thead>
                            <tr>
                                <th>Pasajero</th>
                                <th>Documento</th>
                                <th>Nacionalidad</th>
                                <th>Contacto</th>
                                <th>Registro</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visiblePassengers.map((passenger) => (
                                <tr key={passenger.id}>
                                    <td>
                                        <div className="pm-person">
                                            <div className="pm-avatar">
                                                {passenger.fullName
                                                    .split(" ")
                                                    .slice(0, 2)
                                                    .map((part) => part[0])
                                                    .join("")
                                                    .toUpperCase()}
                                            </div>
                                            <div>
                                                <strong>{passenger.fullName}</strong>
                                                <small>{passenger.id}</small>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="pm-document">
                                            {passenger.documentType}
                                        </span>
                                        <small className="pm-secondary">
                                            {passenger.documentNumber}
                                        </small>
                                    </td>
                                    <td>{passenger.nationality}</td>
                                    <td>
                                        <div className="pm-contact">
                                            <span>
                                                <Mail size={13} />
                                                {passenger.email}
                                            </span>
                                            <span>
                                                <Phone size={13} />
                                                {passenger.phone}
                                            </span>
                                        </div>
                                    </td>
                                    <td>{formatDate(passenger.registrationDate)}</td>
                                    <td>
                                        <span
                                            className={`pm-status ${passenger.status === "Activo" ? "active" : "inactive"
                                                }`}
                                        >
                                            <span />
                                            {passenger.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="pm-actions">
                                            <button
                                                className="pm-icon-btn"
                                                title="Consultar perfil"
                                                aria-label={`Consultar perfil de ${passenger.fullName}`}
                                                onClick={() => openProfile(passenger)}
                                            >
                                                <Eye size={16} />
                                            </button>

                                            <button
                                                className="pm-icon-btn"
                                                title="Historial de viajes"
                                                aria-label={`Historial de ${passenger.fullName}`}
                                                onClick={() => openTrips(passenger)}
                                            >
                                                <History size={16} />
                                            </button>

                                            {role === "Empleado" && (
                                                <>
                                                    <button
                                                        className="pm-icon-btn"
                                                        title="Modificar pasajero"
                                                        aria-label={`Modificar ${passenger.fullName}`}
                                                        onClick={() => openEdit(passenger)}
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={`pm-toggle ${passenger.status === "Activo" ? "is-active" : "is-inactive"
                                                            }`}
                                                        title={
                                                            passenger.status === "Activo"
                                                                ? "Desactivar pasajero"
                                                                : "Activar pasajero"
                                                        }
                                                        aria-label={`Cambiar estado de ${passenger.fullName}`}
                                                        aria-pressed={passenger.status === "Activo"}
                                                        onClick={() => toggleStatus(passenger)}
                                                    >
                                                        <span className="pm-toggle-ball" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="pm-icon-btn pm-delete-btn"
                                                        title="Eliminar pasajero"
                                                        aria-label={`Eliminar a ${passenger.fullName}`}
                                                        onClick={() => deletePassenger(passenger)}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {visiblePassengers.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="pm-empty">
                                        <Search size={25} />
                                        <strong>No se encontraron pasajeros</strong>
                                        <span>Probá cambiar los filtros o el texto de búsqueda.</span>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="pm-table-footer">
                    <span>
                        Mostrando <strong>{visiblePassengers.length}</strong> de{" "}
                        <strong>{passengers.length}</strong> pasajeros
                    </span>
                    <span>Datos de demostración</span>
                </div>
            </section>

            {/* Formulario de registro */}
            {modal === "form" && (
                <div className="pm-overlay" onMouseDown={() => setModal("")}>
                    <section
                        className="pm-modal pm-modal-wide"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="pm-form-title"
                        onMouseDown={(event) => event.stopPropagation()}
                    >
                        <div className="pm-modal-header">
                            <div>
                                <h2 id="pm-form-title">Registrar pasajero</h2>
                                <p>Ingresá la información requerida para crear el registro.</p>
                            </div>
                            <button
                                className="pm-close"
                                onClick={() => setModal("")}
                                aria-label="Cerrar"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={savePassenger}>
                            <div className="pm-form-grid">
                                <label className="pm-field pm-full">
                                    Nombre completo *
                                    <input
                                        value={form.fullName || ""}
                                        onChange={(e) => updateField("fullName", e.target.value)}
                                        placeholder="Nombre y apellidos"
                                        required
                                    />
                                </label>

                                <label className="pm-field">
                                    Tipo de documento *
                                    <select
                                        value={form.documentType}
                                        onChange={(e) =>
                                            updateField("documentType", e.target.value)
                                        }
                                        required
                                    >
                                        <option value="Cédula">Cédula</option>
                                        <option value="Pasaporte">Pasaporte</option>
                                        <option value="Documento de Residencia">
                                            Documento de Residencia
                                        </option>
                                    </select>
                                </label>

                                <label className="pm-field">
                                    Número de documento *
                                    <input
                                        value={form.documentNumber || ""}
                                        onChange={(e) =>
                                            updateField("documentNumber", e.target.value)
                                        }
                                        placeholder="Número único de documento"
                                        required
                                    />
                                </label>

                                <label className="pm-field">
                                    Nacionalidad *
                                    <input
                                        value={form.nationality || ""}
                                        onChange={(e) =>
                                            updateField("nationality", e.target.value)
                                        }
                                        placeholder="Ej. Costarricense"
                                        required
                                    />
                                </label>

                                <label className="pm-field">
                                    Fecha de nacimiento *
                                    <input
                                        type="date"
                                        max={today()}
                                        value={form.birthDate || ""}
                                        onChange={(e) => updateField("birthDate", e.target.value)}
                                        required
                                    />
                                </label>

                                <label className="pm-field">
                                    Correo electrónico *
                                    <input
                                        type="email"
                                        value={form.email || ""}
                                        onChange={(e) => updateField("email", e.target.value)}
                                        placeholder="correo@ejemplo.com"
                                        required
                                    />
                                </label>

                                <label className="pm-field">
                                    Teléfono *
                                    <input
                                        type="tel"
                                        value={form.phone || ""}
                                        onChange={(e) => updateField("phone", e.target.value)}
                                        placeholder="8888-1234"
                                        required
                                    />
                                </label>

                                <label className="pm-field pm-full">
                                    Dirección *
                                    <input
                                        value={form.address || ""}
                                        onChange={(e) => updateField("address", e.target.value)}
                                        placeholder="Provincia, cantón y dirección"
                                        required
                                    />
                                </label>
                            </div>

                            <div className="pm-form-note">
                                <CalendarDays size={17} />
                                El ID, la fecha de registro y el estado Activo se asignan
                                automáticamente.
                            </div>

                            {error && <p className="pm-error">{error}</p>}

                            <div className="pm-modal-actions">
                                <button
                                    type="button"
                                    className="pm-secondary-btn"
                                    onClick={() => setModal("")}
                                >
                                    Cancelar
                                </button>
                                <button type="submit" className="pm-primary-btn">
                                    <Check size={17} />
                                    Guardar pasajero
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}

            {/* Formulario de modificación */}
            {modal === "edit" && selectedPassenger && (
                <div className="pm-overlay" onMouseDown={() => setModal("")}>
                    <section
                        className="pm-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="pm-edit-title"
                        onMouseDown={(event) => event.stopPropagation()}
                    >
                        <div className="pm-modal-header">
                            <div>
                                <h2 id="pm-edit-title">Modificar pasajero</h2>
                                <p>{selectedPassenger.fullName}</p>
                            </div>
                            <button
                                className="pm-close"
                                onClick={() => setModal("")}
                                aria-label="Cerrar"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="pm-readonly">
                            <FileText size={18} />
                            <div>
                                <span>Documento no modificable</span>
                                <strong>
                                    {selectedPassenger.documentType}:{" "}
                                    {selectedPassenger.documentNumber}
                                </strong>
                            </div>
                        </div>

                        <form onSubmit={savePassenger}>
                            <div className="pm-form-grid">
                                <label className="pm-field pm-full">
                                    Correo electrónico *
                                    <input
                                        type="email"
                                        value={form.email || ""}
                                        onChange={(e) => updateField("email", e.target.value)}
                                        required
                                    />
                                </label>
                                <label className="pm-field pm-full">
                                    Teléfono *
                                    <input
                                        type="tel"
                                        value={form.phone || ""}
                                        onChange={(e) => updateField("phone", e.target.value)}
                                        required
                                    />
                                </label>
                                <label className="pm-field pm-full">
                                    Dirección *
                                    <input
                                        value={form.address || ""}
                                        onChange={(e) => updateField("address", e.target.value)}
                                        required
                                    />
                                </label>
                            </div>

                            {error && <p className="pm-error">{error}</p>}

                            <div className="pm-form-note">
                                <History size={17} />
                                Los cambios se agregan al historial de auditoría de prueba.
                            </div>

                            <div className="pm-modal-actions">
                                <button
                                    type="button"
                                    className="pm-secondary-btn"
                                    onClick={() => setModal("")}
                                >
                                    Cancelar
                                </button>
                                <button type="submit" className="pm-primary-btn">
                                    <Check size={17} />
                                    Guardar cambios
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}

            {/* Perfil del pasajero */}
            {modal === "profile" && selectedPassenger && (
                <div className="pm-overlay" onMouseDown={() => setModal("")}>
                    <section
                        className="pm-modal pm-modal-wide"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="pm-profile-title"
                        onMouseDown={(event) => event.stopPropagation()}
                    >
                        <div className="pm-modal-header">
                            <div>
                                <h2 id="pm-profile-title">Perfil del pasajero</h2>
                                <p>Información personal registrada en Global Airport.</p>
                            </div>
                            <button
                                className="pm-close"
                                onClick={() => setModal("")}
                                aria-label="Cerrar"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="pm-profile-banner">
                            <div className="pm-profile-avatar">
                                {selectedPassenger.fullName
                                    .split(" ")
                                    .slice(0, 2)
                                    .map((part) => part[0])
                                    .join("")
                                    .toUpperCase()}
                            </div>
                            <div>
                                <h3>{selectedPassenger.fullName}</h3>
                                <p>{selectedPassenger.id}</p>
                            </div>
                            <span
                                className={`pm-status ${selectedPassenger.status === "Activo" ? "active" : "inactive"
                                    }`}
                            >
                                <span />
                                {selectedPassenger.status}
                            </span>
                        </div>

                        <div className="pm-profile-grid">
                            <ProfileItem
                                icon={<FileText size={17} />}
                                label="Documento de identidad"
                                value={`${selectedPassenger.documentType} · ${selectedPassenger.documentNumber}`}
                            />
                            <ProfileItem
                                icon={<Globe size={17} />}
                                label="Nacionalidad"
                                value={selectedPassenger.nationality}
                            />
                            <ProfileItem
                                icon={<CalendarDays size={17} />}
                                label="Fecha de nacimiento"
                                value={formatDate(selectedPassenger.birthDate)}
                            />
                            <ProfileItem
                                icon={<Mail size={17} />}
                                label="Correo electrónico"
                                value={selectedPassenger.email}
                            />
                            <ProfileItem
                                icon={<Phone size={17} />}
                                label="Teléfono"
                                value={selectedPassenger.phone}
                            />
                            <ProfileItem
                                icon={<MapPin size={17} />}
                                label="Dirección"
                                value={selectedPassenger.address}
                            />
                            <ProfileItem
                                icon={<Clock size={17} />}
                                label="Fecha de registro"
                                value={formatDate(selectedPassenger.registrationDate)}
                            />
                        </div>

                        {role === "Empleado" && (
                            <div className="pm-audit-section">
                                <h3>
                                    <History size={18} />
                                    Historial de modificaciones
                                </h3>
                                {selectedPassenger.audit?.length ? (
                                    [...selectedPassenger.audit].reverse().map((entry, index) => (
                                        <div className="pm-audit-entry" key={`${entry.date}-${index}`}>
                                            <strong>{entry.description}</strong>
                                            <span>{new Date(entry.date).toLocaleString("es-CR")}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="pm-muted">
                                        No hay modificaciones registradas en esta sesión.
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="pm-modal-actions">
                            <button
                                className="pm-secondary-btn"
                                onClick={() => setModal("")}
                            >
                                Cerrar
                            </button>
                            {role === "Empleado" && (
                                <button
                                    className="pm-primary-btn"
                                    onClick={() => openEdit(selectedPassenger)}
                                >
                                    <Pencil size={16} />
                                    Modificar contacto
                                </button>
                            )}
                        </div>
                    </section>
                </div>
            )}

            {/* Historial de viajes */}
            {modal === "trips" && selectedPassenger && (
                <div className="pm-overlay" onMouseDown={() => setModal("")}>
                    <section
                        className="pm-modal pm-modal-wide"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="pm-trips-title"
                        onMouseDown={(event) => event.stopPropagation()}
                    >
                        <div className="pm-modal-header">
                            <div>
                                <h2 id="pm-trips-title">Historial de viajes</h2>
                                <p>{selectedPassenger.fullName}</p>
                            </div>
                            <button
                                className="pm-close"
                                onClick={() => setModal("")}
                                aria-label="Cerrar"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="pm-trips-summary">
                            <Plane size={21} />
                            <div>
                                <strong>{selectedPassenger.trips.length} viajes registrados</strong>
                                <span>Incluye los registros disponibles en los datos de prueba.</span>
                            </div>
                        </div>

                        {selectedPassenger.trips.length ? (
                            <div className="pm-trips-list">
                                {[...selectedPassenger.trips]
                                    .sort((a, b) => b.date.localeCompare(a.date))
                                    .map((trip, index) => (
                                        <article className="pm-trip-card" key={`${trip.flight}-${index}`}>
                                            <div className="pm-trip-top">
                                                <strong>
                                                    <Plane size={17} />
                                                    {trip.flight}
                                                </strong>
                                                <span className="pm-trip-date">
                                                    <CalendarDays size={14} />
                                                    {formatDate(trip.date)}
                                                </span>
                                            </div>

                                            <div className="pm-trip-route">
                                                <div>
                                                    <small>Origen</small>
                                                    <strong>{trip.origin}</strong>
                                                </div>
                                                <div className="pm-route-line">
                                                    <span />
                                                    <Plane size={16} />
                                                    <span />
                                                </div>
                                                <div>
                                                    <small>Destino</small>
                                                    <strong>{trip.destination}</strong>
                                                </div>
                                            </div>

                                            <div className="pm-trip-details">
                                                <span>
                                                    Estado del vuelo: <strong>{trip.flightStatus}</strong>
                                                </span>
                                                <span>
                                                    Reservación: <strong>{trip.reservationStatus}</strong>
                                                </span>
                                                <span>
                                                    Piloto: <strong>{trip.pilot}</strong>
                                                </span>
                                            </div>
                                        </article>
                                    ))}
                            </div>
                        ) : (
                            <div className="pm-empty pm-trip-empty">
                                <Plane size={28} />
                                <strong>Sin viajes registrados</strong>
                                <span>Este pasajero todavía no tiene vuelos en los datos de prueba.</span>
                            </div>
                        )}

                        <div className="pm-modal-actions">
                            <button
                                className="pm-secondary-btn"
                                onClick={() => setModal("")}
                            >
                                Cerrar historial
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </main>
    );
}

function ProfileItem({ icon, label, value }) {
    return (
        <div className="pm-profile-item">
            <div className="pm-profile-item-icon">{icon}</div>
            <div>
                <span>{label}</span>
                <strong>{value || "—"}</strong>
            </div>
        </div>
    );
}
