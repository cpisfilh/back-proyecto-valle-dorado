import prisma from "../orm/prismaClient.js";

async function getLotes(req) {

  const proyectoId = req.user.proyectoId;

  return await prisma.lote.findMany({
    where: {
      proyecto_id: proyectoId
    }
  });
}

async function createLote(req, data) {

  const proyectoId = req.user.proyectoId;

  return await prisma.lote.create({
    data: {
      ...data,
      proyecto_id: proyectoId
    }
  });
}

async function updateLote(req, id, data) {

  const proyectoId = req.user.proyectoId;

  return await prisma.lote.updateMany({
    where: {
      id,
      proyecto_id: proyectoId
    },
    data
  });
}

async function deleteLote(req, id) {

  const proyectoId = req.user.proyectoId;

  return await prisma.lote.deleteMany({
    where: {
      id,
      proyecto_id: proyectoId
    }
  });
}

export {
  getLotes,
  createLote,
  updateLote,
  deleteLote
};
