import { createCuota, deleteCuota, getCuotas, getCuotaXPago, payCuota, updateCuota,revertPayCuota, getFirstToExpire, registrarCuotaInicial, cuotasGenerate } from "../services/cuota.service.js";

export const get = async (req, res) => {
    try {
        const cuotas = await getCuotas();
        res.json({ message: "exito", data: cuotas });
    } catch (error) {
        res.status(200).json({ message: "error", error: error.message });
    }
};
export const cuotaXPago = async (req, res) => {
    try {
        const cuotas = await getCuotaXPago( req.body.id_pago);
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

export const createCuotaInicial = async (req, res) => {
    try {
        const cuota = await registrarCuotaInicial(req.body);
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

export const pay = async (req, res) => {
    try {
        const { id } = req.body;
        const cuota = await payCuota(id, req.body);
        res.json({ message: "exito", data: cuota});
    } catch (error) {
        res.status(200).json({ message: "error", error: error.message });
    }
};

export const revertpay = async (req, res) => {
    try {
        const { id } = req.body;
        const cuota = await revertPayCuota(id, req.body);
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

export const firstToExpire = async (req, res) => {
    try {
        const cuota = await getFirstToExpire();
        res.json({ message: "exito", data: cuota});
    } catch (error) {
        res.status(200).json({ message: "error", error: error.message });
    }
};

export const postCuotasGenerate = async (req, res) => {
    try {
        const cuota = await cuotasGenerate(req.body);
        res.json({ message: "exito", data: cuota});
    } catch (error) {
        res.status(200).json({ message: "error", error: error.message });
    }
};
