import { createLote, deleteLote, getLotes, updateLote } from "../services/lote.service.js";

export const get = async (req, res) => {
    try {
        const lotes = await getLotes();
        res.json({ message: "exito", data: lotes });
    } catch (error) {
        res.status(200).json({ message: "error", error: error.message });
    }
};

export const create = async (req, res) => {
    try {
        const lote = await createLote(req.body);
        res.json({ message: "exito", data: lote});
    } catch (error) {
        res.status(200).json({ message: "error", error: error.message });
    }
};

export const update = async (req, res) => {
    try {
        const { id } = req.body;
        const lote = await updateLote(id, req.body);
        res.json({ message: "exito", data: lote});
    } catch (error) {
        res.status(200).json({ message: "error", error: error.message });
    }
};

export const remove = async (req, res) => {
    try {
        const { id } = req.body;
        await deleteLote(id);
        res.json({ message: "exito" });
    } catch (error) {
        res.status(200).json({ message: "error", error: error.message });
    }
};
