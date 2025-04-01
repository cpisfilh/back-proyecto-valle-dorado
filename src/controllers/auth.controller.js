import {
    loginUser,
    getUserByToken
  } from "../services/auth.service.js";
  
  export const login = async (req, res) => {
    try {
      const user = await loginUser(req.body);
      res.json({ message: "exito", data: user });
    } catch (error) {
      res.status(200).json({ message: "error", error: error.message });
    }
  };

  export const getUser = async (req, res) => {
    try {
      const user = await getUserByToken(req);
      res.json({ message: "exito", data: user });
    } catch (error) {
      res.status(200).json({ message: "error", error: error.message });
    }
  };