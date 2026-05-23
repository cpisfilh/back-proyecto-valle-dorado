import { Prisma } from "@prisma/client";
import prisma from "../orm/prismaClient.js";

async function getSubCuotas(req) {

  const proyectoId = req.user.proyectoId;

  return await prisma.subcuota.findMany({
    where: {
      proyecto_id: proyectoId
    },
    include: {
      cuota: true
    }
  });
}

async function createSubCuota(req, data) {

  const proyectoId = req.user.proyectoId;

  // VALIDAR CUOTA
  const cuota = await prisma.cuota.findFirst({
    where: {
      id: data.id_cuota,
      proyecto_id: proyectoId
    },
    include: {
      pago: true
    }
  });

  if (!cuota) {
    throw new Error("Cuota no encontrada.");
  }

  // CONTAR SUBCUOTAS ACTIVAS
  const numeroCuotaActual = await prisma.subcuota.count({
    where: {
      id_cuota: data.id_cuota,
      estado: true,
      proyecto_id: proyectoId
    },
  });

  // CREAR SUBCUOTA
  const subcuota = await prisma.subcuota.create({
    data: {
      monto: new Prisma.Decimal(data.monto),

      fecha_pago: data.fecha_pago
        ? new Date(data.fecha_pago)
        : null,

      fecha_vencimiento: data.fecha_vencimiento
        ? new Date(data.fecha_vencimiento)
        : null,

      estado: true,

      numero_subcuota: numeroCuotaActual + 1,

      proyecto: {
            connect: {
              id: proyectoId
            }
          },

      cuota: {
        connect: {
          id: data.id_cuota,
        },
      },
    },

    include: {
      cuota: true,
    },
  });

  // ACTUALIZAR SALDO
  await prisma.pago.updateMany({
    where: {
      id: subcuota.cuota.id_pago,
      proyecto_id: proyectoId
    },

    data: {
      saldo_actual:
        Number(cuota.pago.saldo_actual)
        -
        Number(subcuota.monto),
    },
  });

  return subcuota;
}

async function updateSubCuota(req, id, data) {

  const proyectoId = req.user.proyectoId;

  return await prisma.subcuota.updateMany({
    where: {
      id,
      proyecto_id: proyectoId
    },
    data
  });
}

async function deleteSubCuota(req, id) {

  const proyectoId = req.user.proyectoId;

  // OBTENER SUBCUOTA
  const subcuota = await prisma.subcuota.findFirst({
    where: {
      id,
      proyecto_id: proyectoId
    },

    include: {
      cuota: {
        include: {
          pago: true,
        },
      },
    },
  });

  if (!subcuota || !subcuota.cuota) {
    throw new Error(
      "Subcuota o cuota no encontrada"
    );
  }

  // DEVOLVER SALDO
  await prisma.pago.updateMany({
    where: {
      id: subcuota.cuota.id_pago,
      proyecto_id: proyectoId
    },

    data: {
      saldo_actual:
        Number(
          subcuota.cuota.pago?.saldo_actual || 0
        )
        +
        Number(subcuota.monto),
    },
  });

  // BORRAR SUBCUOTA
  await prisma.subcuota.deleteMany({
    where: {
      id,
      proyecto_id: proyectoId
    }
  });

  return subcuota;
}

export {
  getSubCuotas,
  createSubCuota,
  updateSubCuota,
  deleteSubCuota
};
