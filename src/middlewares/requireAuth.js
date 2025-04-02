import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
export const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(200).json({ message:"No autorizado", error: "No autorizado. Falta token." });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(200).json({ message: "No autorizado", error: "No autorizado. Token inválido" });
    }

    jwt.verify(token, process.env.JTS, (err, user) => {
        if (err) {
            return res.status(200).json({ message: "No autorizado", error: "No autorizado. Token inválido o expirado" });
        }

        req.user = user; // Asigna el usuario decodificado a `req.user`
        next(); // Llama a `next()` solo si el token es válido
    });
};