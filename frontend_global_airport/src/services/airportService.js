import api from "../api/axios";

const airportService = {
  listar: async () => (await api.get("/aeropuertos")).data,
  crear: async (datos) => (await api.post("/aeropuertos", datos)).data,
  actualizar: async (id, datos) => (await api.patch(`/aeropuertos/${id}`, datos)).data,
  eliminar: async (id) => (await api.delete(`/aeropuertos/${id}`)).data,
};

export default airportService;
