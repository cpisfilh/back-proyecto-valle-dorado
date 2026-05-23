import prisma from "../orm/prismaClient.js";

async function getClientes(req) {

  const proyectoId = req.user.proyectoId;

  return await prisma.cliente.findMany({
    where: {
      proyecto_id: proyectoId,
    },
    orderBy: {
      id: "desc",
    },
  });
}

async function createCliente(req, data) {

  const proyectoId = req.user.proyectoId;

  return await prisma.cliente.create({
    data: {
      ...data,
      proyecto_id: proyectoId,
    },
  });
}

async function updateCliente(req, id, data) {

  const proyectoId = req.user.proyectoId;

  return await prisma.cliente.updateMany({
    where: {
      id,
      proyecto_id: proyectoId,
    },
    data,
  });
}

async function deleteCliente(req, id) {

  const proyectoId = req.user.proyectoId;

  return await prisma.cliente.deleteMany({
    where: {
      id,
      proyecto_id: proyectoId,
    },
  });
}

export {
  getClientes,
  createCliente,
  updateCliente,
  deleteCliente,
};
