export const getProyectoId = (req) => {

    if (!req.user?.proyectoId) {
        throw new Error("Proyecto no encontrado.");
    }

    return req.user.proyectoId;
};
