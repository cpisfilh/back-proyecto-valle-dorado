import prisma from "../orm/prismaClient.js";
import jwt from "jsonwebtoken";

async function loginUser({ email, password }) {

    const token = jwt.sign({ email }, "secret", { expiresIn: "1h" });

    if (!email || !password) throw new Error("Faltan datos.");
    const user = await prisma.usuarios.findUnique({ where: { email } });
    if (!user) throw new Error("El usuario no existe.");
    if (user.password !== password) throw new Error("Contraseña incorrecta.");
    return { token };
}

async function getUserByToken(data) {

    if (!data.user) throw new Error("No autorizado.");

    const userActual = await prisma.usuarios.findUnique({ where: { email: data.user.email } });

    if (!userActual) throw new Error("No autorizado.");

    return { nombre: userActual.nombre, email: userActual.email };
}
export { loginUser, getUserByToken };
