import prisma from "../orm/prismaClient.js";
import jwt from "jsonwebtoken";

import dotenv from "dotenv";

dotenv.config();

async function loginUser({ email, password }) {

    if (!email || !password) {
        throw new Error("Faltan datos.");
    }

    const user = await prisma.usuarios.findUnique({
        where: { email }
    });

    if (!user) {
        throw new Error("El usuario no existe.");
    }

    if (user.password !== password) {
        throw new Error("Contraseña incorrecta.");
    }

    // Proyecto por defecto
    const proyecto = await prisma.proyecto.findFirst({
        where: {
            estado: true
        },
        orderBy: {
            id: "asc"
        }
    });

    if (!proyecto) {
        throw new Error("No existe proyecto configurado.");
    }

    const token = jwt.sign(
        {
            id: user.id,
            email: user.email,
            proyectoId: proyecto.id
        },
        process.env.JTS,
        {
            expiresIn: "1h"
        }
    );

    return {
        token,
        proyecto
    };
}

async function getUserByToken(data) {

    if (!data.user) {
        throw new Error("No autorizado.");
    }

    const userActual = await prisma.usuarios.findUnique({
        where: {
            email: data.user.email
        }
    });

    if (!userActual) {
        throw new Error("No autorizado.");
    }

    const proyectoActual = await prisma.proyecto.findUnique({
        where: {
            id: data.user.proyectoId
        }
    });

    return {
        nombre: userActual.nombre,
        email: userActual.email,
        proyecto: proyectoActual
    };
}

async function changeProjectService(req) {

    if (!req.user) {
        throw new Error("No autorizado.");
    }

    const { proyectoId } = req.body;

    if (!proyectoId) {
        throw new Error("Proyecto requerido.");
    }

    const proyecto = await prisma.proyecto.findUnique({
        where: {
            id: proyectoId
        }
    });

    if (!proyecto) {
        throw new Error("Proyecto no encontrado.");
    }

    if (!proyecto.estado) {
        throw new Error("Proyecto inactivo.");
    }

    const token = jwt.sign(
        {
            id: req.user.id,
            email: req.user.email,
            proyectoId: proyecto.id
        },
        process.env.JTS,
        {
            expiresIn: "1h"
        }
    );

    return {
        token,
        proyecto
    };
}

export {
    loginUser,
    getUserByToken,
    changeProjectService
};
