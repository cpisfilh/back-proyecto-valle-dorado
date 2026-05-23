import {
    createCliente,
    deleteCliente,
    getClientes,
    updateCliente
} from "../services/cliente.service.js";

export const get = async (req, res) => {
    try {

        const clientes = await getClientes(req);

        res.json({
            message: "exito",
            data: clientes
        });

    } catch (error) {

        res.status(200).json({
            message: "error",
            error: error.message
        });

    }
};

export const create = async (req, res) => {
    try {

        const cliente = await createCliente(req, req.body);

        res.json({
            message: "exito",
            data: cliente
        });

    } catch (error) {

        res.status(200).json({
            message: "error",
            error: error.message
        });

    }
};

export const update = async (req, res) => {
    try {

        const { id } = req.body;

        const cliente = await updateCliente(
            req,
            id,
            req.body
        );

        res.json({
            message: "exito",
            data: cliente
        });

    } catch (error) {

        res.status(200).json({
            message: "error",
            error: error.message
        });

    }
};

export const remove = async (req, res) => {
    try {

        const { id } = req.body;

        await deleteCliente(req, id);

        res.json({
            message: "exito"
        });

    } catch (error) {

        res.status(200).json({
            message: "error",
            error: error.message
        });

    }
};
