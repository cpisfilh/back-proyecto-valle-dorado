import {
    createSubCuota,
  deleteSubCuota,
  getSubCuotas,
  updateSubCuota,
} from "../services/subcuota.service.js";

export const get = async (req, res) => {
  try {
    const subcuotas = await getSubCuotas();
    res.json({ message: "exito", data: subcuotas });
  } catch (error) {
    res.status(200).json({ message: "error", error: error.message });
  }
};

export const create = async (req, res) => {
  try {
    const subcuota = await createSubCuota(req.body);
    res.json({ message: "exito", data: subcuota });
  } catch (error) {
    res.status(200).json({ message: "error", error: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.body;
    const subcuota = await updateSubCuota(id, req.body);
    res.json({ message: "exito", data: subcuota });
  } catch (error) {
    res.status(200).json({ message: "error", error: error.message });
  }
};

export const remove = async (req, res) => {
  try {
    const { id } = req.body;
    await deleteSubCuota(id);
    res.json({ message: "exito" });
  } catch (error) {
    res.status(200).json({ message: "error", error: error.message });
  }
};
