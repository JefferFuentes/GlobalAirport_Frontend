import api from "../api/axios";

const airportAdministratorService = {
  listar: async () => (await api.get("/asignaciones-administradores")).data,
  crear: async (datos) => (await api.post("/asignaciones-administradores", datos)).data,
  actualizar: async (id, datos) => (await api.patch(`/asignaciones-administradores/${id}`, datos)).data,
  eliminar: async (id) => (await api.delete(`/asignaciones-administradores/${id}`)).data,
};

export default airportAdministratorService;
