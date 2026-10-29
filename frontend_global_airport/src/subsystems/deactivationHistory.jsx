
import { ArrowLeft, History, Search, CalendarClock, UserRound, FileText } from "lucide-react";
import { useMemo, useState } from "react";
import "./css/deactivationHistory.css";

export default function DeactivationHistory({ records = [], onBack }) {
  const [search, setSearch] = useState("");

  const filteredRecords = useMemo(() => {
    const term = search.trim().toLowerCase();

    return records.filter((record) =>
      [
        record.userId,
        record.userName,
        record.email,
        record.responsible,
        record.reason,
      ].some((value) => (value || "").toLowerCase().includes(term))
    );
  }, [records, search]);

  return (
    <div className="deactivation-page">
      <header className="dh-topbar">
        <div>
          <div className="dh-breadcrumb">Global Airport / Usuarios / Historial</div>
          <h2>Historial de desactivaciones</h2>
        </div>

        <button className="dh-back-button" onClick={onBack}>
          <ArrowLeft size={17} />
          Volver a usuarios
        </button>
      </header>

      <main className="dh-content">
        <div className="dh-heading">
          <div>
            <div className="dh-eyebrow">Auditoría y control de acceso</div>
            <h1>Historial de desactivaciones</h1>
            <p>
              Consulta las cuentas desactivadas y los datos registrados durante
              cada operación.
            </p>
          </div>

          <div className="dh-heading-icon">
            <History size={30} />
          </div>
        </div>

        <section className="dh-summary">
          <div className="dh-summary-icon"><CalendarClock size={25} /></div>
          <div>
            <span>Total de eventos registrados</span>
            <strong>{records.length}</strong>
          </div>
        </section>

        <section className="dh-panel">
          <div className="dh-panel-heading">
            <div>
              <h3>Registro de auditoría</h3>
              <p>Los registros se muestran del más reciente al más antiguo.</p>
            </div>
          </div>

          <label className="dh-search">
            <Search size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por usuario, ID, responsable o motivo..."
            />
          </label>

          <div className="dh-table-wrap">
            <table className="dh-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>ID usuario</th>
                  <th>Fecha y hora</th>
                  <th>Responsable</th>
                  <th>Motivo de desactivación</th>
                  <th>Estado registrado</th>
                </tr>
              </thead>

              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.id}>
                    <td>
                      <div className="dh-user">
                        <div className="dh-user-avatar">
                          <UserRound size={19} />
                        </div>
                        <div>
                          <strong>{record.userName}</strong>
                          <span>{record.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>{record.userId}</td>
                    <td>{record.dateTime}</td>
                    <td>{record.responsible}</td>
                    <td>
                      <div className="dh-reason">
                        <FileText size={15} />
                        {record.reason || "No especificado"}
                      </div>
                    </td>
                    <td>
                      <span className="dh-status">Inactivo</span>
                    </td>
                  </tr>
                ))}

                {filteredRecords.length === 0 && (
                  <tr>
                    <td colSpan={6} className="dh-empty">
                      {records.length === 0
                        ? "Todavía no hay desactivaciones registradas."
                        : "No hay registros que coincidan con la búsqueda."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <footer className="dh-footer">
            <span>Mostrando {filteredRecords.length} de {records.length} eventos</span>
            <span>Global Airport · Registro de auditoría</span>
          </footer>
        </section>

        <p className="dh-note">
          Esta versión es una demostración frontend. Los registros se conservan
          en el estado de la aplicación y no constituyen todavía una bitácora
          persistente ni inalterable.
        </p>
      </main>
    </div>
  );
}
