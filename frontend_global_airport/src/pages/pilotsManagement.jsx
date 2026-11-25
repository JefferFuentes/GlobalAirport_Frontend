
import { useEffect, useMemo, useState } from "react";
import {
  UserRound, Search, Pencil, Trash2, X, UserRoundX,
  UserRoundCheck,
} from "lucide-react";
import { api } from "../services/api";
import { pilotosService } from "../services/pilotosService";
import StatCard from "../components/management/StatCard";
import PageHeader from "../components/management/PageHeader";
import { useAuth } from "../context/AuthContext";
import { tienePermiso } from "../config/permissions";

const formularioVacio = {
  nombreCompleto: "",
  tipoDocumento: "",
  numeroDocumento: "",
  correo: "",
  telefono: "",
  aeropuertoId: "",
  numeroLicencia: "",
  nacionalidad: "Costa Rica",
  fechaNacimiento: "",
  horasVuelo: 0,
};

const estados = ["ACTIVO", "INACTIVO"];

export default function Pilotos() {
  //1. Estados de React
  const [pilotos, setPilotos] = useState([]);
  const [aeropuertos, setAeropuertos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [form, setForm] = useState(formularioVacio);
  const [editando, setEditando] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [mostrarForm, setMostrarForm] = useState(false);

  //2. Estilos compartidos
  const input =
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100";

  const label =
    "mb-1.5 block text-sm font-medium text-slate-700";

  async function cambiarEstado(piloto) {
    if (guardando) return;

    const desactivando = piloto.estado === "ACTIVO";

    if (
      (desactivando && !puedeDesactivar) ||
      (!desactivando && !puedeReactivar)
    ) {
      setError("No tenés permiso para realizar esta acción.");
      return;
    }

    const accion = desactivando ? "desactivar" : "reactivar";

    const confirmar = window.confirm(
      `¿Estás seguro de que deseas ${accion} a ${piloto.nombreCompleto}?`
    );

    if (!confirmar) return;

    try {
      setGuardando(true);
      setError("");
      setMensaje("");

      if (desactivando) {
        await pilotosService.eliminar(piloto.id);
      } else {
        await pilotosService.reactivar(piloto.id);
      }

      await cargarDatos();

      setMensaje(
        desactivando
          ? "Piloto desactivado correctamente."
          : "Piloto reactivado correctamente."
      );

    } catch (err) {
      console.error("Error al cambiar estado:", err);
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  //3. Funciones de carga de datos
  async function cargarPilotos() {
    try {
      setCargando(true);
      setError("");
      setMensaje("");

      const respuesta = await pilotosService.obtenerTodos();

      console.log("Pilotos:", respuesta);

      const lista = Array.isArray(respuesta)
        ? respuesta
        : Array.isArray(respuesta?.data)
          ? respuesta.data
          : null;

      if (!lista) {
        throw new Error("La API no devolvió una lista de pilotos.");
      }

      setPilotos(lista);
    } catch (err) {
      console.error("Error al cargar pilotos:", err);
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  async function cargarDatos() {
    await Promise.all([
      cargarPilotos(),
      cargarAeropuertos(),
    ]);
  }

  //4. Carga inicial
  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarAeropuertos() {
    try {
      const respuesta = await api("/aeropuertos");

      console.log("Respuesta de aeropuertos:", respuesta);

      const datos = Array.isArray(respuesta)
        ? respuesta
        : Array.isArray(respuesta?.data)
          ? respuesta.data
          : [];

      console.log("Aeropuertos procesados:", datos);

      setAeropuertos(datos);

    } catch (err) {
      console.error("Error al cargar aeropuertos:", err);
      setError(err.message);
    }
  }

  //5. Filtrado y búsqueda
  const resultados = useMemo(() => {
    return pilotos.filter((p) => {
      const texto = `
      ${p.nombreCompleto || ""}
      ${p.numeroDocumento || ""}
      ${p.correo || ""}
      ${p.telefono || ""}
      ${p.numeroLicencia || ""}
      ${p.nacionalidad || ""}
    `.toLowerCase();

      return (
        texto.includes(busqueda.toLowerCase().trim()) &&
        (filtroEstado === "Todos" ||
          p.estado === filtroEstado.toUpperCase())
      );
    });
  }, [pilotos, busqueda, filtroEstado]);


  //6. Funciones de formulario
  function cancelar() {
    setForm(formularioVacio);
    setEditando(null);
    setMostrarForm(false);
  }

  function nuevoPiloto() {
    if (!puedeCrear) {
      setError("No tenés permiso para registrar pilotos.");
      return;
    }

    cancelar();
    setError("");
    setMensaje("");

    setForm({
      ...formularioVacio,
      aeropuertoId:
        rol === "ADMIN_AEROPUERTO"
          ? String(aeropuertoActivo?.id ?? "")
          : "",
    });

    setMostrarForm(true);
  }
  function editar(piloto) {
    if (!puedeEditar) {
      setError("No tenés permiso para editar pilotos.");
      return;
    }

    setError("");
    setMensaje("");

    setForm({
      nombreCompleto: piloto.nombreCompleto || "",
      tipoDocumento: piloto.tipoDocumento || "",
      numeroDocumento: piloto.numeroDocumento || "",
      correo: piloto.correo || "",
      telefono: piloto.telefono || "",
      aeropuertoId: String(piloto.aeropuertoId ?? ""),
      numeroLicencia: piloto.numeroLicencia || "",
      nacionalidad: piloto.nacionalidad || "",
      fechaNacimiento: piloto.fechaNacimiento
        ? piloto.fechaNacimiento.substring(0, 10)
        : "",
      horasVuelo: piloto.horasVuelo ?? 0,
    });

    setEditando(piloto.id);
    setMostrarForm(true);
  }

  async function guardar(e) {
    e.preventDefault();

    if (guardando) return;

    if (editando === null && !puedeCrear) {
      setError("No tenés permiso para registrar pilotos.");
      return;
    }

    if (editando !== null && !puedeEditar) {
      setError("No tenés permiso para editar pilotos.");
      return;
    }

    setError("");
    setMensaje("");

    const datosPiloto = {
      nombreCompleto: form.nombreCompleto.trim(),
      tipoDocumento: form.tipoDocumento.trim(),
      numeroDocumento: form.numeroDocumento.trim(),
      correo: form.correo.trim() || null,
      telefono: form.telefono.trim() || null,
      numeroLicencia: form.numeroLicencia.trim(),
      nacionalidad: form.nacionalidad.trim(),
      fechaNacimiento: form.fechaNacimiento,
      horasVuelo: Number(form.horasVuelo),
    };

    try {
      setGuardando(true);

      if (
        form.horasVuelo === "" ||
        !Number.isFinite(datosPiloto.horasVuelo) ||
        datosPiloto.horasVuelo < 0
      ) {
        throw new Error("Las horas de vuelo deben ser válidas.");
      }

      if (editando !== null) {

        // Actualizar piloto
        await pilotosService.modificar(editando, datosPiloto);

        cancelar();
        await cargarDatos();

        setMensaje("Piloto actualizado correctamente.");

      } else {

        // Registrar piloto
        const aeropuertoId =
          rol === "ADMIN_AEROPUERTO"
            ? Number(aeropuertoActivo?.id)
            : Number(form.aeropuertoId);

        if (!Number.isInteger(aeropuertoId) || aeropuertoId <= 0) {
          throw new Error("Debés seleccionar un aeropuerto válido.");
        }

        await pilotosService.registrar({
          ...datosPiloto,
          aeropuertoId,
        });

        cancelar();
        await cargarDatos();

        setMensaje("Piloto registrado correctamente.");
      }

    } catch (err) {
      console.error("Error al guardar piloto:", err);
      setError(err.message);

    } finally {
      setGuardando(false);
    }
  }


  // 7. Eliminar
  function eliminar(id) {
    if (confirm("¿Deseás eliminar este piloto?")) {
      setPilotos((actuales) =>
        actuales.filter((p) => p.id !== id)
      );
    }
  }

  const { rol, aeropuertoActivo } = useAuth();

  const puedeCrear = tienePermiso(rol, "pilotos", "crear");

  const puedeEditar = tienePermiso(rol, "pilotos", "editar");

  const puedeDesactivar = tienePermiso(
    rol, "pilotos", "desactivar"
  );

  const puedeReactivar = tienePermiso(
    rol, "pilotos", "reactivar"
  );

  //8. Interfaz
  return (
    <>
      <header className="border-b border-sky-100 bg-white px-5 py-5">
        <h1 className="text-2xl font-bold text-[#0C2D57]">
          Pilotos
        </h1>
      </header>
      <div className="min-h-screen bg-slate-50 p-4 md:p-6 xl:p-8">
        <div className="mx-auto w-full max-w-[1600px]">
          <PageHeader
            icono={UserRound}
            titulo="Gestión de pilotos"
            descripcion="Administrá los datos y el estado laboral de los pilotos."
            onActualizar={cargarDatos}
            onNuevo={puedeCrear ? nuevoPiloto : undefined}
            textoBoton="Nuevo piloto"
          />

          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <StatCard
              titulo="Total de pilotos"
              valor={pilotos.length}
            />

            <StatCard
              titulo="Activos"
              valor={pilotos.filter((p) => p.estado === "ACTIVO").length}
            />

            <StatCard
              titulo="Inactivos"
              valor={pilotos.filter((p) => p.estado === "INACTIVO").length}
            />
          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {mensaje && (
            <div
              role="status"
              className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700"
            >
              {mensaje}
            </div>
          )}

          {mostrarForm &&
            (editando !== null ? puedeEditar : puedeCrear) && (
              <form
                onSubmit={guardar}
                className="mb-6 rounded-2xl bg-white p-5 shadow-sm sm:p-7"
              >
                <div className="mb-5 flex items-center justify-between">

                  <div className="flex flex-col">
                    <h2 className="text-xl font-bold text-[#0C2D57]">
                      {editando !== null ? "Editar piloto" : "Registrar piloto"}
                    </h2>

                    {editando !== null && (
                      <p className="mt-1 text-sm text-slate-500">
                        Editando a:{" "}
                        <span className="font-semibold text-[#0C2D57]">
                          {form.nombreCompleto}
                        </span>
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={cancelar}
                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                  >
                    <X size={20} />
                  </button>

                </div>

                <div className="space-y-6">

                  {/* Información personal */}
                  <div>
                    <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-[#0C2D57]">
                      Información personal
                    </h3>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                      {/* Nombre completo */}
                      <div>
                        <label className={label}>Nombre completo</label>
                        <input
                          required
                          className={input}
                          placeholder="Nombre y apellidos"
                          value={form.nombreCompleto}
                          onChange={(e) =>
                            setForm({ ...form, nombreCompleto: e.target.value })
                          }
                        />
                      </div>

                      {/* Tipo de documento */}
                      <div>
                        <label className={label}>Tipo de documento</label>
                        <select
                          required
                          className={input}
                          value={form.tipoDocumento}
                          onChange={(e) =>
                            setForm({ ...form, tipoDocumento: e.target.value })
                          }
                        >
                          <option value="">Seleccionar documento</option>
                          <option value="CEDULA">Cédula</option>
                          <option value="PASAPORTE">Pasaporte</option>
                          <option value="DIMEX">DIMEX</option>
                        </select>
                      </div>

                      {/* Número de documento */}
                      <div>
                        <label className={label}>Número de documento</label>
                        <input
                          required
                          className={input}
                          placeholder="Número de identificación"
                          value={form.numeroDocumento}
                          onChange={(e) =>
                            setForm({ ...form, numeroDocumento: e.target.value })
                          }
                        />
                      </div>

                      {/* Fecha de nacimiento */}
                      <div>
                        <label className={label}>Fecha de nacimiento</label>
                        <input
                          required
                          type="date"
                          className={input}
                          value={form.fechaNacimiento}
                          onChange={(e) =>
                            setForm({ ...form, fechaNacimiento: e.target.value })
                          }
                        />
                      </div>

                      {/* Nacionalidad */}
                      <div>
                        <label className={label}>Nacionalidad</label>
                        <input
                          required
                          className={input}
                          placeholder="Costa Rica"
                          value={form.nacionalidad}
                          onChange={(e) =>
                            setForm({ ...form, nacionalidad: e.target.value })
                          }
                        />
                      </div>

                      {/* Correo electrónico */}
                      <div>
                        <label className={label}>Correo electrónico</label>
                        <input
                          type="email"
                          className={input}
                          placeholder="correo@ejemplo.com"
                          value={form.correo}
                          onChange={(e) =>
                            setForm({ ...form, correo: e.target.value })
                          }
                        />
                      </div>

                      {/* Teléfono */}
                      <div>
                        <label className={label}>Teléfono</label>
                        <input
                          type="tel"
                          className={input}
                          placeholder="Número de teléfono"
                          value={form.telefono}
                          onChange={(e) =>
                            setForm({ ...form, telefono: e.target.value })
                          }
                        />
                      </div>

                    </div>
                  </div>

                  {/* Información profesional */}
                  <div className="border-t border-slate-200 pt-6">

                    <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-[#0C2D57]">
                      Información profesional
                    </h3>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                      {/* Número de licencia */}
                      <div>
                        <label className={label}>Número de licencia</label>
                        <input
                          required
                          className={input}
                          placeholder="PIL-CR-001"
                          value={form.numeroLicencia}
                          onChange={(e) =>
                            setForm({ ...form, numeroLicencia: e.target.value })
                          }
                        />
                      </div>

                      {/* Horas de vuelo */}
                      <div>
                        <label className={label}>Horas de vuelo</label>
                        <input
                          required
                          type="number"
                          min="0"
                          step="any"
                          className={input}
                          value={form.horasVuelo}
                          onChange={(e) =>
                            setForm({ ...form, horasVuelo: e.target.value })
                          }
                        />
                      </div>

                      {/* Aeropuerto asignado */}
                      <div>
                        <label className={label}>Aeropuerto asignado</label>
                        <select
                          required
                          disabled={
                            editando !== null || rol === "ADMIN_AEROPUERTO"
                          }
                          className={`${input} disabled:cursor-not-allowed disabled:bg-slate-100`}
                          value={form.aeropuertoId}
                          onChange={(e) =>
                            setForm({ ...form, aeropuertoId: e.target.value })
                          }
                        >
                          <option value="">Seleccionar aeropuerto</option>

                          {aeropuertos
                            .filter(
                              (a) =>
                                rol === "ADMIN_GENERAL" ||
                                Number(a.id) === Number(aeropuertoActivo?.id)
                            )
                            .map((a) => (
                              <option key={a.id} value={a.id}>
                                {a.nombre}
                              </option>
                            ))}
                        </select>

                        {editando !== null && (
                          <p className="mt-1 text-xs text-slate-500">
                            El aeropuerto asignado no se puede modificar.
                          </p>
                        )}
                      </div>

                    </div>
                  </div>

                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={cancelar}
                    className="rounded-xl border px-5 py-2.5 font-semibold text-slate-600"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={guardando}
                    className="rounded-xl bg-[#0284C7] px-5 py-2.5 font-semibold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {guardando
                      ? "Guardando..."
                      : editando !== null
                        ? "Guardar cambios"
                        : "Registrar piloto"}
                  </button>
                </div>

              </form>
            )}

          <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b p-5 md:flex-row">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por nombre, identificación, licencia o contacto..."
                  className={`${input} pl-10`}
                />
              </div>

              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className={`${input} md:max-w-56`}
              >
                <option>Todos</option>
                {estados.map((estado) => (
                  <option key={estado}>{estado}</option>
                ))}
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    {[
                      "Piloto",
                      "Nacionalidad",
                      "Licencia",
                      "Teléfono",
                      "Estado laboral",
                      "Acciones",
                    ].map((titulo) => (
                      <th key={titulo} className="px-5 py-4">
                        {titulo}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {resultados.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <p className="font-bold text-[#0C2D57]">
                          {p.nombreCompleto}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {p.correo}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        {p.nacionalidad}
                      </td>

                      <td className="px-5 py-4">
                        {p.numeroLicencia}
                      </td>

                      <td className="px-5 py-4">
                        {p.telefono}
                      </td>

                      <td className="px-5 py-4">
                        {p.estado}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">

                          {puedeEditar && (
                            <button
                              type="button"
                              title="Editar piloto"
                              disabled={guardando}
                              onClick={() => editar(p)}
                              className="rounded-lg bg-sky-50 p-2 text-sky-600
                   transition hover:bg-sky-100
                   disabled:opacity-50"
                            >
                              <Pencil size={17} />
                            </button>
                          )}

                          {p.estado === "ACTIVO" && puedeDesactivar && (
                            <button
                              type="button"
                              title="Desactivar piloto"
                              disabled={guardando}
                              onClick={() => cambiarEstado(p)}
                              className="rounded-lg bg-red-50 p-2 text-red-600
                   transition hover:bg-red-100
                   disabled:opacity-50"
                            >
                              <UserRoundX size={17} />
                            </button>
                          )}

                          {p.estado === "INACTIVO" && puedeReactivar && (
                            <button
                              type="button"
                              title="Reactivar piloto"
                              disabled={guardando}
                              onClick={() => cambiarEstado(p)}
                              className="rounded-lg bg-emerald-50 p-2
                   text-emerald-600 transition
                   hover:bg-emerald-100 disabled:opacity-50"
                            >
                              <UserRoundCheck size={17} />
                            </button>
                          )}

                          {!puedeEditar &&
                            !puedeDesactivar &&
                            !puedeReactivar && (
                              <span className="text-xs text-slate-400">
                                Solo consulta
                              </span>
                            )}

                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {resultados.length === 0 && (
                <p className="p-8 text-center text-slate-500">
                  No se encontraron pilotos.
                </p>
              )}
            </div>
          </section>
        </div>
      </div >
    </>
  );
}
