import {
  getProyectos
} from "../services/proyecto.service.js";

export const get = async (
  req,
  res
) => {

  try {

    const proyectos =
      await getProyectos();

    res.json({
      message: "exito",
      data: proyectos
    });

  } catch (error) {

    res.status(200).json({
      message: "error",
      error: error.message
    });
  }
};
