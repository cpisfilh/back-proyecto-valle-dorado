import prisma from "../orm/prismaClient.js";

async function getManzanas(req) {

  const proyectoId = req.user.proyectoId;

  return await prisma.manzana.findMany({
    where: {
      proyecto_id: proyectoId
    }
  });
}

async function createManzana(req, data) {

  const proyectoId = req.user.proyectoId;

  const { proyecto_id, ...safeData } = data;

  return await prisma.manzana.create({
    data: {
      ...safeData,

      proyecto: {
        connect: {
          id: proyectoId
        }
      }
    }
  });
}

async function updateManzana(req, id, data) {

  const proyectoId = req.user.proyectoId;

  return await prisma.manzana.updateMany({
    where: {
      id,
      proyecto_id: proyectoId
    },
    data
  });
}

async function deleteManzana(req, id) {

  const proyectoId = req.user.proyectoId;

  return await prisma.manzana.deleteMany({
    where: {
      id,
      proyecto_id: proyectoId
    }
  });
}

async function getManzana(req, id) {

  const proyectoId = req.user.proyectoId;

  return await prisma.manzana.findFirst({
    where: {
      id,
      proyecto_id: proyectoId
    }
  });
}

export {
  getManzanas,
  createManzana,
  updateManzana,
  deleteManzana,
  getManzana
};
