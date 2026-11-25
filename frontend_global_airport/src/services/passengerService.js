import api from "../api/axios";

const passengerService = {
  listar: async () => {
    const response = await api.get("/pasajeros");
    return response.data;
  },

  crear: async (datos) => {
    const response = await api.post("/pasajeros", datos);
    return response.data;
  },

  actualizar: async (id, datos) => {
    const response = await api.patch(`/pasajeros/${id}`, datos);
    return response.data;
  },

  eliminar: async (id) => {
    const response = await api.delete(`/pasajeros/${id}`);
    return response.data;
  },
};

export default passengerService;
