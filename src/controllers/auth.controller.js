import {
  loginUser,
  getUserByToken,
  changeProjectService
} from "../services/auth.service.js";

export const login = async (req, res) => {
  try {

    const user = await loginUser(req.body);

    // GUARDAR JWT EN COOKIE
    res.cookie("token", user.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 60 // 1 hora
    });

    // YA NO DEVOLVEMOS TOKEN
    res.json({
      message: "exito",
      data: {
        proyecto: user.proyecto
      }
    });

  } catch (error) {

    res.status(200).json({
      message: "error",
      error: error.message
    });

  }
};

export const getUser = async (req, res) => {
  try {

    const user = await getUserByToken(req);

    res.json({
      message: "exito",
      data: user
    });

  } catch (error) {

    res.status(200).json({
      message: "error",
      error: error.message
    });

  }
};

export const changeProject = async (req, res) => {
  try {

    const response = await changeProjectService(req);

    // REEMPLAZAR COOKIE CON NUEVO TOKEN
    res.cookie("token", response.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 60 // 1 hora
    });

    // YA NO DEVOLVEMOS TOKEN
    res.json({
      message: "exito",
      data: {
        proyecto: response.proyecto
      }
    });

  } catch (error) {

    res.status(200).json({
      message: "error",
      error: error.message
    });

  }
};

export const logout = async (
    req,
    res
) => {

  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
  });

    res.json({
        message: "exito"
    });
};
