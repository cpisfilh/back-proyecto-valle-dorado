import prisma from "../orm/prismaClient.js";

async function getPredios(req) {

  const proyectoId = req.user.proyectoId;

  return await prisma.predio.findMany({
    where: {
      proyecto_id: proyectoId
    }
  });
}

async function createPredio(req, data) {

  const proyectoId = req.user.proyectoId;

  const manzana = await prisma.manzana.findFirst({
    where: {
      id: data.manzana_id,
      proyecto_id: proyectoId
    }
  });

  if (!manzana) {
    throw new Error("Manzana no encontrada.");
  }

  const lote = await prisma.lote.findFirst({
    where: {
      id: data.lote_id,
      proyecto_id: proyectoId
    }
  });

  if (!lote) {
    throw new Error("Lote no encontrado.");
  }

  const { proyecto_id, manzana_id, lote_id, ...safeData } = data;

  return await prisma.predio.create({
    data: {
      ...safeData,

      manzana: {
        connect: {
          id: manzana.id
        }
      },

      lote: {
        connect: {
          id: lote.id
        }
      },

      proyecto: {
        connect: {
          id: proyectoId
        }
      }
    }
  });
}

async function updatePredio(req, id, data) {

  const proyectoId = req.user.proyectoId;

  return await prisma.predio.updateMany({
    where: {
      id,
      proyecto_id: proyectoId
    },
    data
  });
}

async function deletePredio(req, id) {

  const proyectoId = req.user.proyectoId;

  return await prisma.predio.deleteMany({
    where: {
      id,
      proyecto_id: proyectoId
    }
  });
}

async function deletePredioXCustomer(req, id) {

  const proyectoId = req.user.proyectoId;

  return await prisma.cliente_predio.deleteMany({
    where: {
      id,
      predio: {
        proyecto_id: proyectoId
      }
    }
  });
}

async function getPrediosxCustomer(req, nombre) {

  const proyectoId = req.user.proyectoId;

  const whereClause = {
    predio: {
      proyecto_id: proyectoId
    }
  };

  if (nombre !== "") {
    whereClause.cliente = {
      nombres: {
        contains: nombre
      }
    };
  }

  const clientePredios = await prisma.cliente_predio.findMany({
    where: whereClause,
    include: {
      cliente: true,
      predio: {
        include: {
          manzana: true,
          lote: true,
        },
      },
    },
  });

  return clientePredios.map((cp) => ({
    id: cp.id,
    nombre_cliente: cp.cliente.nombres,
    apellido_cliente: cp.cliente.apellidos,
    manzana: cp.predio.manzana.valor,
    lote: cp.predio.lote.valor,
  }));
}

async function getPrediosSelectModal(req) {

  const proyectoId = req.user.proyectoId;

  const predios = await prisma.predio.findMany({
    where: {
      proyecto_id: proyectoId
    },
    include: {
      manzana: true,
      lote: true,
      cliente_predio: {
        include: {
          cliente: true
        }
      }
    },
  });

  return predios.map(predio => ({
    id: predio.id,
    id_manzana: predio.manzana.id,
    manzana: predio.manzana.valor,
    lote: predio.lote.valor,
    lote_id: predio.lote.id
  }));
}

async function postRelateClientProperty(req, data) {

  const proyectoId = req.user.proyectoId;

  const predio = await prisma.predio.findFirst({
    where: {
      id: data.predio_id,
      proyecto_id: proyectoId
    }
  });

  if (!predio) {
    throw new Error("Predio no encontrado.");
  }

  const cliente = await prisma.cliente.findFirst({
    where: {
      id: data.cliente_id,
      proyecto_id: proyectoId
    }
  });

  if (!cliente) {
    throw new Error("Cliente no encontrado.");
  }

  return await prisma.cliente_predio.create({
    data
  });
}

export {
  getPredios,
  createPredio,
  updatePredio,
  deletePredio,
  getPrediosxCustomer,
  getPrediosSelectModal,
  postRelateClientProperty,
  deletePredioXCustomer
};
