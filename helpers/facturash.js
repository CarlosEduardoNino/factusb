import axios from "axios";

const FACTUS_AUTH_URL = "https://api-sandbox.factus.com.co/auth/token";
const CLIENT_ID = "9e2e186f-2719-42aa-8b59-e478780401d2";
const CLIENT_SECRET = "InE6kBPby1XhWyEi94J5WV3fQejhdL7khyTGlvKd";

// Obtener token de autenticación en Factus
export const obtenerTokenFactus = async () => {
    try {
        const response = await axios.post(FACTUS_AUTH_URL, {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            grant_type: "client_credentials"
        });

        return response.data.access_token;
    } catch (error) {
        console.error("Error obteniendo token de Factus:", error.response?.data || error.message);
        throw new Error("No se pudo autenticar con Factus");
    }
};

// Validar datos de la factura antes de guardarla
export const validarFactura = (factura) => {
    const { numbering_range_id, reference_code, payment_form, payment_due_date, customer, items } = factura;

    if (!numbering_range_id || !reference_code || !payment_form || !payment_due_date || !customer || !items || items.length === 0) {
        throw new Error("Todos los campos obligatorios deben ser proporcionados.");
    }
};
