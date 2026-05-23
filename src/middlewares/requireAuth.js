import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const requireAuth = (req, res, next) => {

    // LEER COOKIE
    const token = req.cookies.token;

    if (!token) {
        return res.status(200).json({
            message: "No autorizado",
            error: "No autorizado. Falta token."
        });
    }

    jwt.verify(
        token,
        process.env.JTS,
        (err, user) => {

            if (err) {
                return res.status(200).json({
                    message: "No autorizado",
                    error: "No autorizado. Token inválido o expirado"
                });
            }

            // GUARDAR USUARIO EN REQUEST
            req.user = user;

            next();
        }
    );
};
