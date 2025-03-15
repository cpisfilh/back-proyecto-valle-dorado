import {
  createPredio,
  deletePredio,
  deletePredioXCustomer,
  getPredios,
  getPrediosSelectModal,
  getPrediosxCustomer,
  postRelateClientProperty,
  updatePredio,
} from "../services/predio.service.js";

export const get = async (req, res) => {
  try {
    const predios = await getPredios();
    res.json({ message: "exito", data: predios });
  } catch (error) {
    res.status(200).json({ message: "error", error: error.message });
  }
};

export const create = async (req, res) => {
  try {
    const convertedObj = Object.fromEntries(
        Object.entries(req.body).map(([key, value]) => [key, Number(value)])
    );
    const predio = await createPredio(convertedObj);
    res.json({ message: "exito", data: predio });
  } catch (error) {
    res.status(200).json({ message: "error", error: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.body;
    const predio = await updatePredio(id, req.body);
    res.json({ message: "exito", data: predio });
  } catch (error) {
    res.status(200).json({ message: "error", error: error.message });
  }
};

export const remove = async (req, res) => {
  try {
    const { id } = req.body;
    await deletePredio(id);
    res.json({ message: "exito" });
  } catch (error) {
    res.status(200).json({ message: "error", error: error.message });
  }
};

export const removeXCustomer = async (req, res) => {
  try {
    const { id } = req.body;
    await deletePredioXCustomer(id);
    res.json({ message: "exito" });
  } catch (error) {
    res.status(200).json({ message: "error", error: error.message });
  }
};

export const prediosxCustomer = async (req, res) => {
  try {
    const { nombre } = req.body;
    const predios = await getPrediosxCustomer(nombre);
    res.json({ message: "exito", data: predios });
  } catch (error) {
    res.status(200).json({ message: "error", error: error.message });
  }
};

export const prediosSelectModal = async (req, res) => {
  try {
    const predios = await getPrediosSelectModal();
    res.json({ message: "exito", data: predios });
  } catch (error) {
    res.status(200).json({ message: "error", error: error.message });
  }
};
export const relateClientProperty = async (req, res) => {
  try {
    const predio = await postRelateClientProperty(req.body);
    res.json({ message: "exito", data: predio });
  } catch (error) {
    res.status(200).json({ message: "error", error: error.message });
  }
};
