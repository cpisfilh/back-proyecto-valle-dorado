import {
  createCuota,
  deleteCuota,
  getCuotas,
  getCuotaXPago,
  payCuota,
  updateCuota,
  revertPayCuota,
  getFirstToExpire,
  registrarCuotaInicial,
  cuotasGenerate,
  deleteCuotaPago,
  createCuotaMensualPago,
  deleteCuotaMensualPago,
  updateCuotaMensual
} from "../services/cuota.service.js";

export const get = async (req, res) => {
  try {

    const cuotas = await getCuotas(req);

    res.json({
      message: "exito",
      data: cuotas
    });

  } catch (error) {

    res.status(200).json({
      message: "error",
      error: error.message
    });

  }
};

export const cuotaXPago = async (req, res) => {
  try {

    const cuotas = await getCuotaXPago(
      req,
      req.body.id_pago
    );

    res.json({
      message: "exito",
      data: cuotas
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

    const cuota = await createCuota(
      req,
      req.body
    );

    res.json({
      message: "exito",
      data: cuota
    });

  } catch (error) {

    res.status(200).json({
      message: "error",
      error: error.message
    });

  }
};

export const createCuotaInicial = async (req, res) => {
  try {

    const cuota = await registrarCuotaInicial(
      req,
      req.body
    );

    res.json({
      message: "exito",
      data: cuota
    });

  } catch (error) {

    res.status(200).json({
      message: "error",
      error: error.message
    });

  }
};

export const createCuotaMensual = async (req, res) => {
  try {

    const cuota = await createCuotaMensualPago(
      req,
      req.body
    );

    res.json({
      message: "exito",
      data: cuota
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

    const cuota = await updateCuota(
      req,
      id,
      req.body
    );

    res.json({
      message: "exito",
      data: cuota
    });

  } catch (error) {

    res.status(200).json({
      message: "error",
      error: error.message
    });

  }
};

export const updatemensual = async (req, res) => {
  try {

    const { id } = req.body;

    const cuota = await updateCuotaMensual(
      req,
      id,
      req.body
    );

    res.json({
      message: "exito",
      data: cuota
    });

  } catch (error) {

    res.status(200).json({
      message: "error",
      error: error.message
    });

  }
};

export const pay = async (req, res) => {
  try {

    const { id } = req.body;

    const cuota = await payCuota(
      req,
      id,
      req.body
    );

    res.json({
      message: "exito",
      data: cuota
    });

  } catch (error) {

    res.status(200).json({
      message: "error",
      error: error.message
    });

  }
};

export const revertpay = async (req, res) => {
  try {

    const { id } = req.body;

    const cuota = await revertPayCuota(
      req,
      id
    );

    res.json({
      message: "exito",
      data: cuota
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

    await deleteCuota(req, id);

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

export const removeOfPago = async (req, res) => {
  try {

    const { id } = req.body;

    await deleteCuotaPago(req, id);

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

export const removeMensualOfPago = async (req, res) => {
  try {

    const { id } = req.body;

    await deleteCuotaMensualPago(
      req,
      id
    );

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

export const firstToExpire = async (req, res) => {
  try {

    const cuota = await getFirstToExpire(req);

    res.json({
      message: "exito",
      data: cuota
    });

  } catch (error) {

    res.status(200).json({
      message: "error",
      error: error.message
    });

  }
};

export const postCuotasGenerate = async (req, res) => {
  try {

    const cuota = await cuotasGenerate(
      req,
      req.body
    );

    res.json({
      message: "exito",
      data: cuota
    });

  } catch (error) {

    res.status(200).json({
      message: "error",
      error: error.message
    });

  }
};
