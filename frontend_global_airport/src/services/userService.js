import api from "../api/axios";

const usuarioService = {
  listar: async () => {
    const response = await api.get("/usuarios");
    return response.data;
  },

  crear: async (datos) => {
    const response = await api.post("/usuarios", datos);
    return response.data;
  },

  actualizar: async (id, datos) => {
    const response = await api.patch(`/usuarios/${id}`, datos);
    return response.data;
  },

  eliminar: async (id) => {
    const response = await api.delete(`/usuarios/${id}`);
    return response.data;
  },

  desactivar: async (id) => {
    const response = await api.patch(`/usuarios/${id}/desactivar`);
    return response.data;
  },

  reactivar: async (id) => {
    const response = await api.patch(`/usuarios/${id}/reactivar`);
    return response.data;
  },

  perfil: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },
};

export default usuarioService;
