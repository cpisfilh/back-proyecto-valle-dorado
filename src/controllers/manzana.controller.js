import { createManzana, deleteManzana, getManzanas, updateManzana } from "../services/manzana.service.js";

export const get = async (req, res) => {
    try {
        const manzanas = await getManzanas();
        res.json({ message: "exito", data: manzanas });
    } catch (error) {
        res.status(200).json({ message: "error", error: error.message });
    }
};

export const create = async (req, res) => {
    try {
        const manzana = await createManzana(req.body);
        res.json({ message: "exito", data: manzana});
    } catch (error) {
        res.status(200).json({ message: "error", error: error.message });
    }
};

export const update = async (req, res) => {
    try {
        const { id } = req.body;
        const manzana = await updateManzana(id, req.body);
        res.json({ message: "exito", data: manzana});
    } catch (error) {
        res.status(200).json({ message: "error", error: error.message });
    }
};

export const remove = async (req, res) => {
    try {
        const { id } = req.body;
        await deleteManzana(id);
        res.json({ message: "exito" });
    } catch (error) {
        res.status(200).json({ message: "error", error: error.message });
    }
};
