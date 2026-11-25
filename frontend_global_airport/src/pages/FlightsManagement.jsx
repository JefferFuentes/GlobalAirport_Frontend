import { useEffect, useMemo, useState } from "react";
import { Plane, Plus, Search, Pencil, X, RefreshCw, UserRoundPlus, } from "lucide-react";
import { api } from "../services/api";
import { vuelosService } from "../services/vuelosService";
import { aeropuertosService } from "../services/aeropuertosService";
import { aeronavesService } from "../services/aeronavesService";
import { pilotosService } from "../services/pilotosService";
import { asignacionesService } from "../services/asignacionesService";
import { useAuth } from "../context/AuthContext";
import { tienePermiso } from "../config/permissions";

const formularioVacio = {
  numeroVuelo: "",
  aeropuertoOrigenId: "",
  aeropuertoDestinoId: "",
  aeronaveId: "",
  salidaProgramada: "",
  llegadaProgramada: "",
  estado: "PROGRAMADO",
};

const estados = [
  "PROGRAMADO",
  "ABORDANDO",
  "EN_VUELO",
  "COMPLETADO",
  "CANCELADO",
];

const nombresEstados = {
  PROGRAMADO: "Programado",
  ABORDANDO: "Abordando",
  EN_VUELO: "En vuelo",
  COMPLETADO: "Completado",
  CANCELADO: "Cancelado",
};

const estilosEstados = {
  PROGRAMADO: "bg-blue-100 text-blue-700",
  ABORDANDO: "bg-amber-100 text-amber-700",
  EN_VUELO: "bg-sky-100 text-sky-700",
  COMPLETADO: "bg-green-100 text-green-700",
  CANCELADO: "bg-red-100 text-red-700",
};

function obtenerLista(respuesta) {
  if (Array.isArray(respuesta)) return respuesta;
  if (Array.isArray(respuesta?.data)) return respuesta.data;
  throw new Error("La API no devolvió una lista válida.");
}

function fechaParaInput(fecha) {
  if (!fecha) return "";

  const valor = new Date(fecha);
  if (Number.isNaN(valor.getTime())) return "";

  const local = new Date(
    valor.getTime() - valor.getTimezoneOffset() * 60000
  );

  return local.toISOString().slice(0, 16);
}

function fechaParaMostrar(fecha) {
  if (!fecha) return "Sin fecha";

  const valor = new Date(fecha);

  return Number.isNaN(valor.getTime())
    ? "Fecha inválida"
    : valor.toLocaleString("es-CR", {
      dateStyle: "medium",
      timeStyle: "short",
    });
}

export default function Vuelos() {
  const [vuelos, setVuelos] = useState([]);
  const [aeropuertos, setAeropuertos] = useState([]);
  const [aeronaves, setAeronaves] = useState([]);
  const [pilotos, setPilotos] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);

  const [form, setForm] = useState(formularioVacio);
  const [editando, setEditando] = useState(null);

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos");

  const [mostrarForm, setMostrarForm] = useState(false);
  const [mostrarAsignacion, setMostrarAsignacion] = useState(false);

  const [vueloSeleccionado, setVueloSeleccionado] = useState(null);
  const [pilotoSeleccionado, setPilotoSeleccionado] = useState("");

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const input =
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100";

  const label =
    "mb-1.5 block text-sm font-medium text-slate-700";


  async function cargarDatos() {
    console.log("INICIANDO CARGA DE DATOS...");
    try {
      setCargando(true);
      setError("");

      const [
        respuestaVuelos,
        respuestaAeropuertos,
        respuestaAeronaves,
        respuestaPilotos,
        respuestaAsignaciones,
      ] = await Promise.all([
        vuelosService.obtenerTodos(),
        aeropuertosService.obtenerTodos(),
        aeronavesService.obtenerTodos(),
        pilotosService.obtenerTodos(),
        asignacionesService.obtenerTodos(),
      ]);

      console.log("Vuelos:", respuestaVuelos);
      console.log("Aeropuertos:", respuestaAeropuertos);
      console.log("Aeronaves:", respuestaAeronaves);
      console.log("Pilotos:", respuestaPilotos);
      console.log("Asignaciones:", respuestaAsignaciones);
      setVuelos(obtenerLista(respuestaVuelos));
      setAeropuertos(obtenerLista(respuestaAeropuertos));
      setAeronaves(obtenerLista(respuestaAeronaves));
      setPilotos(obtenerLista(respuestaPilotos));
      setAsignaciones(obtenerLista(respuestaAsignaciones));

    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }


  useEffect(() => {
    cargarDatos();
  }, []);

  const aeropuertosPorId = useMemo(
    () => new Map(aeropuertos.map((a) => [a.id, a])),
    [aeropuertos]
  );

  const aeronavesPorId = useMemo(
    () => new Map(aeronaves.map((a) => [a.id, a])),
    [aeronaves]
  );

  const pilotosPorId = useMemo(
    () => new Map(pilotos.map((p) => [p.id, p])),
    [pilotos]
  );

  function nombreAeropuerto(id) {
    const aeropuerto = aeropuertosPorId.get(id);

    if (!aeropuerto) return `Aeropuerto #${id}`;

    return `${aeropuerto.nombre} (${aeropuerto.codigoIata})`;
  }

  function nombrePiloto(piloto) {
    if (!piloto) return "Piloto no encontrado";

    return (
      piloto.usuario?.nombreCompleto ||
      piloto.nombreCompleto ||
      `Piloto #${piloto.id}`
    );
  }

  function pilotosDelVuelo(vueloId) {
    return asignaciones
      .filter((a) => a.vueloId === vueloId)
      .map((a) => pilotosPorId.get(a.pilotoId))
      .filter(Boolean);
  }

  const resultados = useMemo(() => {
    return vuelos.filter((vuelo) => {
      const origen = aeropuertosPorId.get(
        vuelo.aeropuertoOrigenId
      );

      const destino = aeropuertosPorId.get(
        vuelo.aeropuertoDestinoId
      );

      const nombresPilotos = asignaciones
        .filter((a) => a.vueloId === vuelo.id)
        .map((a) => {
          const piloto = pilotosPorId.get(a.pilotoId);

          return (
            piloto?.usuario?.nombreCompleto ||
            piloto?.nombreCompleto ||
            ""
          );
        })
        .join(" ");

      const texto = [
        vuelo.numeroVuelo,
        origen?.nombre,
        origen?.codigoIata,
        destino?.nombre,
        destino?.codigoIata,
        nombresPilotos,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        texto.includes(busqueda.toLowerCase()) &&
        (filtroEstado === "Todos" ||
          vuelo.estado === filtroEstado)
      );
    });
  }, [
    vuelos,
    busqueda,
    filtroEstado,
    aeropuertosPorId,
    pilotosPorId,
    asignaciones,
  ]);

  function cancelar() {
    setForm({ ...formularioVacio });
    setEditando(null);
    setMostrarForm(false);
  }

  function nuevoVuelo() {
    if (!puedeCrear) {
      setError("No tenés permiso para registrar vuelos.");
      return;
    }

    cancelar();
    setError("");
    setMensaje("");
    setMostrarForm(true);
  }

  function editar(vuelo) {
    if (!puedeEditar) {
      setError("No tenés permiso para editar vuelos.");
      return;
    }
    setForm({
      numeroVuelo: vuelo.numeroVuelo || "",
      aeropuertoOrigenId: String(
        vuelo.aeropuertoOrigenId ?? ""
      ),
      aeropuertoDestinoId: String(
        vuelo.aeropuertoDestinoId ?? ""
      ),
      aeronaveId: String(vuelo.aeronaveId ?? ""),
      salidaProgramada: fechaParaInput(
        vuelo.salidaProgramada
      ),
      llegadaProgramada: fechaParaInput(
        vuelo.llegadaProgramada
      ),
      estado: vuelo.estado || "PROGRAMADO",
    });

    setEditando(vuelo.id);
    setMostrarForm(true);
    setError("");
    setMensaje("");
  }

  async function guardar(e) {
    e.preventDefault();

    if (editando === null && !puedeCrear) {
      setError("No tenés permiso para registrar vuelos.");
      return;
    }

    if (editando !== null && !puedeEditar) {
      setError("No tenés permiso para editar vuelos.");
      return;
    }

    setError("");
    setMensaje("");

    if (
      form.aeropuertoOrigenId ===
      form.aeropuertoDestinoId
    ) {
      setError(
        "El aeropuerto de origen y destino deben ser diferentes."
      );
      return;
    }

    if (
      new Date(form.salidaProgramada) >=
      new Date(form.llegadaProgramada)
    ) {
      setError(
        "La llegada debe ser posterior a la salida."
      );
      return;
    }

    const datos = {
      aeropuertoOrigenId: Number(
        form.aeropuertoOrigenId
      ),
      aeropuertoDestinoId: Number(
        form.aeropuertoDestinoId
      ),
      aeronaveId: Number(form.aeronaveId),
      salidaProgramada: new Date(
        form.salidaProgramada
      ).toISOString(),
      llegadaProgramada: new Date(
        form.llegadaProgramada
      ).toISOString(),
    };

    try {
      setGuardando(true);

      if (editando !== null) {
        const datosActualizados = {
          ...datos,
          numeroVuelo: form.numeroVuelo.trim(),
          ...(puedeCambiarEstado
            ? { estado: form.estado }
            : {}),
        };

        console.log("Formulario:", form);
        console.log("Enviando al backend:", datosActualizados);

        await vuelosService.modificar(editando, datosActualizados);

        setMensaje("Vuelo actualizado correctamente.");
      } else {
        await vuelosService.registrar({
          ...datos,
          numeroVuelo: form.numeroVuelo.trim(),
        });

        setMensaje("Vuelo registrado correctamente.");
      }

      cancelar();
      await cargarDatos();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  function abrirAsignacion(vuelo) {
    if (!puedeAsignarPiloto) {
      setError("No tenés permiso para asignar pilotos.");
      return;
    }

    setVueloSeleccionado(vuelo);
    setPilotoSeleccionado("");
    setMostrarAsignacion(true);
    setError("");
    setMensaje("");
  }

  async function asignarPiloto(e) {
    e.preventDefault();

    if (!puedeAsignarPiloto) {
      setError("No tenés permiso para asignar pilotos.");
      return;
    }

    if (!pilotoSeleccionado || !vueloSeleccionado) {
      return;
    }

    try {
      setGuardando(true);
      setError("");

      await asignacionesService.registrar(
        vueloSeleccionado.id,
        Number(pilotoSeleccionado)
      );

      setMostrarAsignacion(false);
      setVueloSeleccionado(null);
      setPilotoSeleccionado("");

      setMensaje("Piloto asignado correctamente.");

      await cargarDatos();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  const { rol } = useAuth();

  const puedeCrear = tienePermiso(rol, "vuelos", "crear");

  const puedeEditar = tienePermiso(rol, "vuelos", "editar");

  const puedeCambiarEstado = tienePermiso(
    rol, "vuelos", "cambiarEstado"
  );

  const puedeAsignarPiloto = tienePermiso(
    rol, "vuelos", "asignarPiloto"
  );

  return (
    <>
      <header className="border-b border-sky-100 bg-white px-5 py-5">
        <h1 className="text-2xl font-bold text-[#0C2D57]">
          Vuelos
        </h1>
      </header>

      <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
        <div className="mx-auto w-full max-w-[1600px]">

          <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
                <Plane size={28} />
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-sky-700">
                  Global Airport
                </p>

                <h1 className="text-3xl font-bold text-[#0C2D57]">
                  Gestión de vuelos
                </h1>

                <p className="mt-1 text-slate-500">
                  Administrá rutas, horarios, pilotos y
                  estados de los vuelos.
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={cargarDatos}
                className="rounded-xl border border-slate-200 bg-white p-3 text-slate-600 hover:bg-slate-100"
                title="Actualizar"
              >
                <RefreshCw size={19} />
              </button>

              {puedeCrear && (
                <button
                  type="button"
                  onClick={nuevoVuelo}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0C2D57] px-5 py-3 font-semibold text-white hover:bg-[#0284C7]"
                >
                  <Plus size={18} />
                  Nuevo vuelo
                </button>
              )}
            </div>
          </header>

          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            {[
              ["Total de vuelos", vuelos.length],
              [
                "Programados",
                vuelos.filter(
                  (v) => v.estado === "PROGRAMADO"
                ).length,
              ],
              [
                "En vuelo",
                vuelos.filter(
                  (v) => v.estado === "EN_VUELO"
                ).length,
              ],
            ].map(([titulo, valor]) => (
              <div
                key={titulo}
                className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
              >
                <p className="text-sm text-slate-500">
                  {titulo}
                </p>

                <p className="mt-2 text-3xl font-bold text-[#0C2D57]">
                  {valor}
                </p>
              </div>
            ))}
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
                  <h2 className="text-xl font-bold text-[#0C2D57]">
                    {editando !== null
                      ? "Editar vuelo"
                      : "Registrar vuelo"}
                  </h2>

                  <button
                    type="button"
                    onClick={cancelar}
                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label className={label}>
                      Número de vuelo
                    </label>

                    <input
                      required
                      disabled={editando !== null}
                      className={input}
                      placeholder="Ej. GA-301"
                      value={form.numeroVuelo}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          numeroVuelo: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className={label}>
                      Aeropuerto de origen
                    </label>

                    <select
                      required
                      className={input}
                      value={form.aeropuertoOrigenId}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          aeropuertoOrigenId: e.target.value,
                        })
                      }
                    >
                      <option value="">
                        Seleccionar origen
                      </option>

                      {aeropuertos.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.nombre} ({a.codigoIata})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={label}>
                      Aeropuerto de destino
                    </label>

                    <select
                      required
                      className={input}
                      value={form.aeropuertoDestinoId}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          aeropuertoDestinoId: e.target.value,
                        })
                      }
                    >
                      <option value="">
                        Seleccionar destino
                      </option>

                      {aeropuertos.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.nombre} ({a.codigoIata})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={label}>
                      Aeronave
                    </label>

                    <select
                      required
                      className={input}
                      value={form.aeronaveId}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          aeronaveId: e.target.value,
                        })
                      }
                    >
                      <option value="">
                        Seleccionar aeronave
                      </option>

                      {aeronaves.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.matricula} - {a.modelo}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={label}>
                      Salida programada
                    </label>

                    <input
                      required
                      type="datetime-local"
                      className={input}
                      value={form.salidaProgramada}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          salidaProgramada: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className={label}>
                      Llegada programada
                    </label>

                    <input
                      required
                      type="datetime-local"
                      className={input}
                      value={form.llegadaProgramada}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          llegadaProgramada: e.target.value,
                        })
                      }
                    />
                  </div>

                  {editando !== null && puedeCambiarEstado && (
                    <div>
                      <label className={label}>
                        Estado
                      </label>

                      <select
                        className={input}
                        value={form.estado}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            estado: e.target.value,
                          })
                        }
                      >
                        {estados.map((estado) => (
                          <option
                            key={estado}
                            value={estado}
                          >
                            {nombresEstados[estado]}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
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
                    className="rounded-xl bg-[#0284C7] px-5 py-2.5 font-semibold text-white hover:bg-sky-700 disabled:opacity-50"
                  >
                    {guardando
                      ? "Guardando..."
                      : editando !== null
                        ? "Guardar cambios"
                        : "Registrar vuelo"}
                  </button>
                </div>
              </form>
            )}

          {mostrarAsignacion &&
            vueloSeleccionado &&
            puedeAsignarPiloto && (
              <form
                onSubmit={asignarPiloto}
                className="mb-6 rounded-2xl bg-white p-5 shadow-sm sm:p-7"
              >
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-[#0C2D57]">
                    Asignar piloto
                  </h2>

                  <button
                    type="button"
                    onClick={() => setMostrarAsignacion(false)}
                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                  >
                    <X size={20} />
                  </button>
                </div>

                <p className="mb-4 text-sm text-slate-500">
                  Vuelo:{" "}
                  <strong>
                    {vueloSeleccionado.numeroVuelo}
                  </strong>
                </p>

                <div className="max-w-md">
                  <label className={label}>
                    Seleccionar piloto
                  </label>

                  <select
                    required
                    className={input}
                    value={pilotoSeleccionado}
                    onChange={(e) =>
                      setPilotoSeleccionado(e.target.value)
                    }
                  >
                    <option value="">
                      Seleccionar piloto
                    </option>

                    {pilotos
                      .filter((p) => p.estado === "ACTIVO")
                      .map((piloto) => (
                        <option
                          key={piloto.id}
                          value={piloto.id}
                        >
                          {nombrePiloto(piloto)}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setMostrarAsignacion(false)
                    }
                    className="rounded-xl border px-5 py-2.5 font-semibold text-slate-600"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={guardando}
                    className="rounded-xl bg-[#0284C7] px-5 py-2.5 font-semibold text-white disabled:opacity-50"
                  >
                    {guardando
                      ? "Asignando..."
                      : "Asignar piloto"}
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
                  onChange={(e) =>
                    setBusqueda(e.target.value)
                  }
                  placeholder="Buscar por vuelo, aeropuerto o piloto..."
                  className={`${input} pl-10`}
                />
              </div>

              <select
                value={filtroEstado}
                onChange={(e) =>
                  setFiltroEstado(e.target.value)
                }
                className={`${input} md:max-w-52`}
              >
                <option value="Todos">
                  Todos los estados
                </option>

                {estados.map((estado) => (
                  <option
                    key={estado}
                    value={estado}
                  >
                    {nombresEstados[estado]}
                  </option>
                ))}
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    {[
                      "Vuelo",
                      "Origen",
                      "Destino",
                      "Salida",
                      "Aeronave",
                      "Pilotos",
                      "Estado",
                      "Acciones",
                    ].map((titulo) => (
                      <th
                        key={titulo}
                        className="px-5 py-4"
                      >
                        {titulo}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {resultados.map((vuelo) => {
                    const aeronave =
                      aeronavesPorId.get(
                        vuelo.aeronaveId
                      );

                    const pilotosAsignados =
                      pilotosDelVuelo(vuelo.id);

                    return (
                      <tr
                        key={vuelo.id}
                        className="hover:bg-slate-50"
                      >
                        <td className="px-5 py-4 font-bold text-[#0C2D57]">
                          {vuelo.numeroVuelo}
                        </td>

                        <td className="px-5 py-4">
                          {nombreAeropuerto(
                            vuelo.aeropuertoOrigenId
                          )}
                        </td>

                        <td className="px-5 py-4">
                          {nombreAeropuerto(
                            vuelo.aeropuertoDestinoId
                          )}
                        </td>

                        <td className="px-5 py-4">
                          {fechaParaMostrar(
                            vuelo.salidaProgramada
                          )}
                        </td>

                        <td className="px-5 py-4">
                          {aeronave?.matricula || "—"}
                        </td>

                        <td className="px-5 py-4">
                          {pilotosAsignados.length > 0
                            ? pilotosAsignados
                              .map(nombrePiloto)
                              .join(", ")
                            : "Sin asignar"}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${estilosEstados[
                              vuelo.estado
                            ] ||
                              "bg-slate-100 text-slate-600"
                              }`}
                          >
                            {nombresEstados[
                              vuelo.estado
                            ] || vuelo.estado}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex gap-2">

                            {puedeEditar && (
                              <button
                                type="button"
                                onClick={() => editar(vuelo)}
                                title="Editar vuelo"
                                className="rounded-lg p-2 text-sky-700 hover:bg-sky-50"
                              >
                                <Pencil size={17} />
                              </button>
                            )}

                            {puedeAsignarPiloto && (
                              <button
                                type="button"
                                onClick={() => abrirAsignacion(vuelo)}
                                title="Asignar piloto"
                                className="rounded-lg p-2 text-indigo-700 hover:bg-indigo-50"
                              >
                                <UserRoundPlus size={17} />
                              </button>
                            )}

                            {!puedeEditar && !puedeAsignarPiloto && (
                              <span className="text-xs text-slate-400">
                                Solo consulta
                              </span>
                            )}

                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {cargando && (
                <p className="p-8 text-center text-slate-500">
                  Cargando vuelos...
                </p>
              )}

              {!cargando &&
                resultados.length === 0 && (
                  <p className="p-8 text-center text-slate-500">
                    No se encontraron vuelos.
                  </p>
                )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
