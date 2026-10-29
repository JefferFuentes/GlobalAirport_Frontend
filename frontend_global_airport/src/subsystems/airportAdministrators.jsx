
import { useState } from "react";
import {
  ArrowLeft,
  Building2,
  UserRound,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
} from "lucide-react";
import "./css/airportAdministrators.css";

const airportsDemo = [
  {
    id: "AER-001",
    name: "Aeropuerto Internacional Juan Santamaría",
    iata: "SJO",
    status: "Activo",
  },
  {
    id: "AER-002",
    name: "Aeropuerto Internacional Daniel Oduber Quirós",
    iata: "LIR",
    status: "Activo",
  },
  {
    id: "AER-003",
    name: "Aeropuerto Internacional Tobías Bolaños",
    iata: "SYQ",
    status: "Activo",
  },
  {
    id: "AER-004",
    name: "Aeropuerto de Limón",
    iata: "LIO",
    status: "Inactivo",
  },
];


const usersDemo = [
  {
    id: "USR-001",
    name: "María Fernanda Rodríguez",
    email: "maria.rodriguez@globalairport.com",
    phone: "8888-1200",
    role: "Administrador de Aeropuerto",
    status: "Activo",
  },
  {
    id: "USR-002",
    name: "Carlos Andrés Jiménez",
    email: "carlos.jimenez@globalairport.com",
    phone: "8555-2400",
    role: "Empleado",
    status: "Activo",
  },
  {
    id: "USR-005",
    name: "Andrea Mora Vargas",
    email: "andrea.mora@globalairport.com",
    phone: "8777-3600",
    role: "Administrador de Aeropuerto",
    status: "Activo",
  },
];


export default function AirportAdministrators() {
  const [airportId, setAirportId] = useState("");
  const [userId, setUserId] = useState("");
  const [assignments, setAssignments] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const availableAirports = airportsDemo.filter(
    (airport) => airport.status === "Activo"
  );

  const availableAdmins = usersDemo.filter(
    (user) =>
      user.role === "Administrador de Aeropuerto" &&
      user.status === "Activo"
  );

  function handleAssignment(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!airportId || !userId) {
      setError("Seleccione un aeropuerto y un administrador.");
      return;
    }

    const airport = availableAirports.find(
      (item) => item.id === airportId
    );

    const admin = availableAdmins.find(
      (item) => item.id === userId
    );

    if (!airport || !admin) {
      setError(
        "Seleccione un aeropuerto y un usuario válidos."
      );
      return;
    }

    const currentAssignment = assignments.find(
      (item) =>
        item.airportId === airportId &&
        item.status === "Activo"
    );

    if (currentAssignment?.userId === userId) {
      setError(
        "Este administrador ya está asignado a ese aeropuerto."
      );
      return;
    }

    const now = new Date();

    const date = now.toLocaleDateString("es-CR");
    const time = now.toLocaleTimeString("es-CR", {
      hour: "2-digit",
      minute: "2-digit",
    });


    const newAssignment = {
      id: `ASG-${String(assignments.length + 1).padStart(3, "0")}`,
      airportId: airport.id,
      airportName: airport.name,
      iata: airport.iata,
      userId: admin.id,
      adminName: admin.name,
      email: admin.email,
      phone: admin.phone,
      date,
      time,
      status: "Activo",
      responsible: "Administrador General",
    };


    setAssignments((current) => [
      ...current.map((item) =>
        item.airportId === airportId &&
          item.status === "Activo"
          ? { ...item, status: "Inactivo" }
          : item
      ),
      newAssignment,
    ]);

    setMessage(
      `Se asignó a ${admin.name} al aeropuerto ${airport.iata}.`
    );

    setAirportId("");
    setUserId("");
  }


  const activeAssignments = assignments.filter((item) => {
    const admin = usersDemo.find(
      (user) => user.id === item.userId
    );

    return (
      item.status === "Activo" &&
      admin?.status === "Activo" &&
      admin?.role === "Administrador de Aeropuerto"
    );
  });

  return (
    <div className="aa-page">
      <header className="aa-topbar">
        <div>
          <div className="aa-breadcrumb">
            Global Airport / Administración / Asignaciones
          </div>
          <h2>Asignación de administradores</h2>
        </div>

        <div className="aa-avatar">GA</div>
      </header>

      <main className="aa-content">
        <button
          className="aa-back"
          onClick={() => {
            window.location.href = "/gestion-aeropuertos";
          }}
          type="button"
        >
          <ArrowLeft size={17} />
          Volver
        </button>

        <div className="aa-heading">
          <div className="aa-heading-icon">
            <ClipboardCheck size={26} />
          </div>
          <div>
            <h1>Asignar administrador de aeropuerto</h1>
            <p>
              Seleccione una sede y un usuario autorizado
              para gestionar sus operaciones.
            </p>
          </div>
        </div>


        <div className="aa-admin-notice">
          <UserRound size={19} />
          <div>
            <strong>Consulta administrativa</strong>
            <p>
              Vista destinada al Administrador General para
              supervisar las asignaciones de administradores
              de aeropuerto.
            </p>
          </div>
        </div>


        <section className="aa-card">
          <div className="aa-card-heading">
            <div>
              <h3>Datos de la asignación</h3>
              <p>
                La fecha y el responsable se registran automáticamente.
              </p>
            </div>
            <span className="aa-required">* Obligatorio</span>
          </div>

          <form onSubmit={handleAssignment}>
            {error && (
              <div className="aa-alert aa-error">
                {error}
              </div>
            )}

            {message && (
              <div className="aa-alert aa-success">
                <CheckCircle2 size={18} />
                {message}
              </div>
            )}

            <div className="aa-form-grid">
              <div className="aa-field">
                <label htmlFor="airport">
                  Aeropuerto <span>*</span>
                </label>
                <div className="aa-input-icon">
                  <Building2 size={18} />
                  <select
                    id="airport"
                    value={airportId}
                    onChange={(event) =>
                      setAirportId(event.target.value)
                    }
                    required
                  >
                    <option value="">
                      Seleccione un aeropuerto
                    </option>
                    {availableAirports.map((airport) => (
                      <option
                        key={airport.id}
                        value={airport.id}
                      >
                        {airport.name} ({airport.iata})
                      </option>
                    ))}
                  </select>
                </div>
                <small>
                  Solo se muestran aeropuertos activos.
                </small>
              </div>

              <div className="aa-field">
                <label htmlFor="admin">
                  Administrador de Aeropuerto <span>*</span>
                </label>
                <div className="aa-input-icon">
                  <UserRound size={18} />
                  <select
                    id="admin"
                    value={userId}
                    onChange={(event) =>
                      setUserId(event.target.value)
                    }
                    required
                  >
                    <option value="">
                      Seleccione un administrador
                    </option>
                    {availableAdmins.map((admin) => (
                      <option
                        key={admin.id}
                        value={admin.id}
                      >
                        {admin.name}
                      </option>
                    ))}
                  </select>
                </div>
                <small>
                  Solo usuarios activos con el rol requerido.
                </small>
              </div>

              <div className="aa-readonly">
                <CalendarDays size={20} />
                <div>
                  <span>Fecha de asignación</span>
                  <strong>Automática al confirmar</strong>
                </div>
              </div>

              <div className="aa-readonly">
                <CheckCircle2 size={20} />
                <div>
                  <span>Estado de asignación</span>
                  <strong>Activo al confirmar</strong>
                </div>
              </div>
            </div>

            <div className="aa-form-footer">
              <button
                className="aa-secondary"
                type="button"
                onClick={() => {
                  setAirportId("");
                  setUserId("");
                  setError("");
                  setMessage("");
                }}
              >
                Limpiar
              </button>
              <button className="aa-primary" type="submit">
                <CheckCircle2 size={18} />
                Confirmar asignación
              </button>
            </div>
          </form>
        </section>

        <section className="aa-card">
          <div className="aa-card-heading">
            <div>
              <h3>Administradores asignados</h3>
              <p>
                Listado de asignaciones actualmente activas.
              </p>
            </div>
            <span className="aa-count">
              {activeAssignments.length} activas
            </span>
          </div>

          <div className="aa-table-wrap">
            <table className="aa-table">

              <thead>
                <tr>
                  <th>Aeropuerto</th>
                  <th>Administrador</th>
                  <th>Teléfono</th>
                  <th>Correo electrónico</th>
                  <th>Fecha de asignación</th>
                  <th>Estado</th>
                  <th>Responsable</th>
                </tr>
              </thead>

              <tbody>
                {activeAssignments.map((item) => (
                  <tr key={item.id}>

                    <td>
                      <strong>{item.adminName}</strong>
                      <small>{item.userId}</small>
                    </td>
                    <td>{item.email}</td>
                    <td>{item.phone}</td>

                    <td>
                      <strong>{item.adminName}</strong>
                      <small>{item.email}</small>
                    </td>
                    <td>
                      {item.date} · {item.time}
                    </td>
                    <td>
                      <span className="aa-status">
                        <span />
                        {item.status}
                      </span>
                    </td>
                    <td>{item.responsible}</td>
                  </tr>
                ))}

                {activeAssignments.length === 0 && (
                  <tr>
                    <td colSpan={7} className="aa-empty">
                      <UserRound size={28} />
                      <strong>No hay asignaciones todavía</strong>
                      <span>
                        Las asignaciones aparecerán aquí después
                        de confirmar el formulario.
                      </span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="aa-note">
          <CheckCircle2 size={18} />
          <p>
            <strong>Modo demostración:</strong> los datos son
            temporales y se mantienen en el estado de React.
            La persistencia y la integración con usuarios y
            aeropuertos reales se realizarán cuando exista el backend.
          </p>
        </div>
      </main>
    </div>
  );
}
