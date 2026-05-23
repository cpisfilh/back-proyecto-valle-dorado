import prisma from "../orm/prismaClient.js";

async function getProyectos() {

  return await prisma.proyecto.findMany({
    where: {
      estado: true
    },

    orderBy: {
      id: "asc"
    },

    select: {
      id: true,
      nombre: true,
      code: true,
      direccion: true,
      partida_registral: true,
      registro_catastral: true,
    }
  });
}

export {
  getProyectos
};
