import { api } from "./api";

export const comprobantesService = {

    obtenerPorReservacion: (reservacionId) =>
        api(`/comprobantes/${reservacionId}`),

};