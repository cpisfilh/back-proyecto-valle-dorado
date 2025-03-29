import {
  createPago,
  deletePago,
  getPagos,
  getPagoXId,
  updatePago,
} from "../services/pago.service.js";

export const get = async (req, res) => {
  try {
    const pagos = await getPagos();
    res.json({ message: "exito", data: pagos });
  } catch (error) {
    res.status(200).json({ message: "error", error: error.message });
  }
};

export const getOne = async (req, res) => {
  try {
    const { id } = req.body;
    const pago = await getPagoXId(id);
    res.json({ message: "exito", data: pago });
  } catch (error) {
    res.status(200).json({ message: "error", error: error.message });
  }
};

export const create = async (req, res) => {
  try {
    const pago = await createPago(req.body);
    res.json({ message: "exito", data: pago });
  } catch (error) {
    res.status(200).json({ message: "error", error: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.body;
    const pago = await updatePago(id, req.body);
    res.json({ message: "exito", data: pago });
  } catch (error) {
    res.status(200).json({ message: "error", error: error.message });
  }
};

export const remove = async (req, res) => {
  try {
    const { id } = req.body;
    await deletePago(id);
    res.json({ message: "exito" });
  } catch (error) {
    res.status(200).json({ message: "error", error: error.message });
  }
};
