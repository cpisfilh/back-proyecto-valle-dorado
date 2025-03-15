import { createCuota, deleteCuota, getCuotas, updateCuota } from "../services/cuota.service.js";

export const get = async (req, res) => {
    try {
        const cuotas = await getCuotas();
        res.json({ message: "exito", data: cuotas });
    } catch (error) {
        res.status(200).json({ message: "error", error: error.message });
    }
};

export const create = async (req, res) => {
    try {
        const cuota = await createCuota(req.body);
        res.json({ message: "exito", data: cuota});
    } catch (error) {
        res.status(200).json({ message: "error", error: error.message });
    }
};

export const update = async (req, res) => {
    try {
        const { id } = req.body;
        const cuota = await updateCuota(id, req.body);
        res.json({ message: "exito", data: cuota});
    } catch (error) {
        res.status(200).json({ message: "error", error: error.message });
    }
};

export const remove = async (req, res) => {
    try {
        const { id } = req.body;
        await deleteCuota(id);
        res.json({ message: "exito" });
    } catch (error) {
        res.status(200).json({ message: "error", error: error.message });
    }
};
