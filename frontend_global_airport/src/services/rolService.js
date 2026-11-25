import api from "../api/axios";

const rolService = {
  listar: async () => {
    const response = await api.get("/roles");
    return response.data;
  },
};

export default rolService;