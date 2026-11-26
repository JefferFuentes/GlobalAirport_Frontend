import axios from "axios";

import {
    obtenerToken,
    EVENTO_SESION_INVALIDA,
} from "../services/api";

const api = axios.create({

    baseURL: import.meta.env.VITE_API_URL,

    headers: {
        "Content-Type": "application/json",
    },

});

// =====================================
// INTERCEPTOR DE SOLICITUDES
// =====================================

api.interceptors.request.use((config) => {

    const token = obtenerToken();

    if (token) {

        config.headers.Authorization =
            `Bearer ${token}`;

    } else {

        delete config.headers.Authorization;
    }

    config.tokenUtilizado = token;

    return config;
});

// =====================================
// INTERCEPTOR DE RESPUESTAS
// =====================================

api.interceptors.response.use(

    respuesta => respuesta,

    error => {

        const tokenUtilizado =
            error.config?.tokenUtilizado;

        if (
            error.response?.status === 401 &&

            tokenUtilizado &&

            obtenerToken() === tokenUtilizado
        ) {

            window.dispatchEvent(

                new CustomEvent(

                    EVENTO_SESION_INVALIDA,

                    {
                        detail: {
                            token: tokenUtilizado,
                        },
                    }
                )
            );
        }

        return Promise.reject(error);
    }
);

export default api;