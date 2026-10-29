import {
  ArrowLeft,
  History,
  Search,
  CalendarClock,
  UserRound,
  ShieldCheck,
} from "lucide-react";
import { useMemo, useState } from "react";
import "./css/roleChangeHistory.css";

export default function RoleChangeHistory({ records = [], onBack }) {
  const [search, setSearch] = useState("");

  const filteredRecords = useMemo(() => {
    const term = search.trim().toLowerCase();

    return records.filter((record) =>
      [
        record.userId,
        record.userName,
        record.email,
        record.previousRole,
        record.newRole,
        record.responsible,
      ].some((value) =>
        (value || "").toLowerCase().includes(term)
      )
    );
  }, [records, search]);

  return (
    <div className="role-history-page">
      <header className="rh-topbar">
        <div>
          <div className="rh-breadcrumb">
            Global Airport / Usuarios / Historial de roles
          </div>
          <h2>Historial de cambios de roles</h2>
        </div>

        <button className="rh-back-button" onClick={onBack}>
          <ArrowLeft size={17} />
          Volver a usuarios
        </button>
      </header>

      <main className="rh-content">
        <div className="rh-heading">
          <div>
            <div className="rh-eyebrow">
              Auditoría y control de acceso
            </div>
            <h1>Historial de cambios de roles</h1>
            <p>
              Consulta los cambios realizados en los roles asignados
              a las cuentas de usuario.
            </p>
          </div>

          <div className="rh-heading-icon">
            <History size={30} />
          </div>
        </div>

        <section className="rh-summary">
          <div className="rh-summary-icon">
            <CalendarClock size={25} />
          </div>
          <div>
            <span>Total de cambios registrados</span>
            <strong>{records.length}</strong>
          </div>
        </section>

        <section className="rh-panel">
          <div className="rh-panel-heading">
            <div>
              <h3>Registro de auditoría</h3>
              <p>
                Consulta el rol anterior, el nuevo rol y quién realizó
                el cambio.
              </p>
            </div>
          </div>

          <label className="rh-search">
            <Search size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por usuario, rol o responsable..."
            />
          </label>

          <div className="rh-table-wrap">
            <table className="rh-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>ID usuario</th>
                  <th>Rol anterior</th>
                  <th>Nuevo rol</th>
                  <th>Fecha y hora</th>
                  <th>Responsable</th>
                </tr>
              </thead>

              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.id}>
                    <td>
                      <div className="rh-user">
                        <div className="rh-user-avatar">
                          <UserRound size={19} />
                        </div>
                        <div>
                          <strong>{record.userName}</strong>
                          <span>{record.email}</span>
                        </div>
                      </div>
                    </td>

                    <td>{record.userId}</td>

                    <td>
                      <span className="rh-old-role">
                        {record.previousRole}
                      </span>
                    </td>

                    <td>
                      <span className="rh-new-role">
                        <ShieldCheck size={14} />
                        {record.newRole}
                      </span>
                    </td>

                    <td>{record.dateTime}</td>
                    <td>{record.responsible}</td>
                  </tr>
                ))}

                {filteredRecords.length === 0 && (
                  <tr>
                    <td colSpan={6} className="rh-empty">
                      {records.length === 0
                        ? "Todavía no hay cambios de roles registrados."
                        : "No hay registros que coincidan con la búsqueda."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <footer className="rh-footer">
            <span>
              Mostrando {filteredRecords.length} de {records.length} cambios
            </span>
            <span>Global Airport · Registro de auditoría</span>
          </footer>
        </section>

        <p className="rh-note">
          Historial demostrativo de frontend. Los registros se mantienen
          en memoria mientras la aplicación está abierta.
        </p>
      </main>
    </div>
  );
}