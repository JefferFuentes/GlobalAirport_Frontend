import { api } from "./api";

export const checkinService = {

  registrar: (reservacionId) =>
    api("/checkin", {
      method: "POST",
      body: JSON.stringify({
        reservacionId: Number(reservacionId),
      }),
    }),

  obtenerPorReservacion: (reservacionId) =>
    api(`/checkin/reservacion/${reservacionId}`),

};