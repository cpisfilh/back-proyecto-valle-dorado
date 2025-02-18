import { getClientes } from "../services/cliente.service.js";

export const get = async (req, res) => {
    const clientes = await getClientes();
    try {
        res.json({ message: "exito", data: clientes });
    } catch (error) {
        res.status(200).json({ message: "error", error: error.message });
    }
    
};
