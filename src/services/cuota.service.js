import prisma from "../orm/prismaClient.js";
import {
  addExactMonthPreservingDate,
  parseFechaReferenciaUTC,
} from "../utils/generics.js";

async function getCuotas(req) {
  const proyectoId = req.user.proyectoId;

  const cuotas = await prisma.cuota.findMany({
    where: {
      proyecto_id: proyectoId,
    },
    include: {
      pago: {
        include: {
          predio: {
            include: {
              manzana: true,
              lote: true,
            },
          },
        },
      },
    },
  });

  return cuotas.map((cuota) => ({
    ...cuota,
    predio: {
      manzana: cuota.pago.predio.manzana.valor,
      lote: cuota.pago.predio.lote.valor,
    },
  }));
}

async function getCuotaXPago(req, id_pago) {
  const proyectoId = req.user.proyectoId;

  return await prisma.cuota.findMany({
    where: {
      id_pago,
      proyecto_id: proyectoId,
    },
    include: {
      subcuota: true,
    },
  });
}

async function createCuota(req, data) {
  const proyectoId = req.user.proyectoId;

  const pago = await prisma.pago.findFirst({
    where: {
      id: data.id_pago,
      proyecto_id: proyectoId,
    },
  });

  if (!pago) {
    throw new Error("Pago no encontrado.");
  }

  const { proyecto_id, ...safeData } = data;

  return await prisma.cuota.create({
    data: {
      ...safeData,

      proyecto: {
        connect: {
          id: proyectoId,
        },
      },
    },
  });
}

async function createCuotaMensualPago(req, data) {
  const proyectoId = req.user.proyectoId;

  const pago = await prisma.pago.findFirst({
    where: {
      id: data.id_pago,
      proyecto_id: proyectoId,
    },
  });

  if (!pago) {
    throw new Error("Pago no encontrado.");
  }

  const { proyecto_id, ...safeData } = data;

  const cuota = await prisma.cuota.create({
    data: {
      ...safeData,

      proyecto: {
        connect: {
          id: proyectoId,
        },
      },
    },
  });

  await prisma.pago.updateMany({
    where: {
      id: cuota.id_pago,
      proyecto_id: proyectoId,
    },
    data: {
      saldo_actual: {
        increment: Number(cuota.monto),
      },
    },
  });

  return cuota;
}

async function registrarCuotaInicial(req, data) {
  const proyectoId = req.user.proyectoId;

  const { proyecto_id, ...safeData } = data;

  return await prisma.cuota.create({
    data: {
      ...safeData,

      proyecto: {
        connect: {
          id: proyectoId,
        },
      },
    },
  });
}

async function updateCuota(req, id, data) {
  const proyectoId = req.user.proyectoId;

  return await prisma.cuota.updateMany({
    where: {
      id,
      proyecto_id: proyectoId,
    },
    data,
  });
}

async function updateCuotaMensual(req, id, data) {
  const proyectoId = req.user.proyectoId;

  const cuotaActualizada = await prisma.cuota.findFirst({
    where: {
      id,
      proyecto_id: proyectoId,
    },
  });

  if (!cuotaActualizada) {
    throw new Error("Cuota no encontrada.");
  }

  await prisma.cuota.updateMany({
    where: {
      id,
      proyecto_id: proyectoId,
    },
    data,
  });

  const cuotaNueva = await prisma.cuota.findFirst({
    where: {
      id,
      proyecto_id: proyectoId,
    },
  });

  if (cuotaNueva.tipo !== "MENSUAL") {
    return cuotaNueva;
  }

  const cuotasPendientes = await prisma.cuota.findMany({
    where: {
      id_pago: cuotaNueva.id_pago,
      tipo: "MENSUAL",
      estado: false,
      proyecto_id: proyectoId,
    },
    select: {
      monto: true,
    },
  });

  const totalPendiente = cuotasPendientes.reduce(
    (acc, c) => acc + Number(c.monto),
    0,
  );

  const pago = await prisma.pago.findFirst({
    where: {
      id: cuotaNueva.id_pago,
      proyecto_id: proyectoId,
    },
    select: {
      cuota_inicial: true,
    },
  });

  const nuevoSaldo = Number(pago.cuota_inicial) + totalPendiente;

  await prisma.pago.updateMany({
    where: {
      id: cuotaNueva.id_pago,
      proyecto_id: proyectoId,
    },
    data: {
      saldo_actual: nuevoSaldo,
    },
  });

  return cuotaNueva;
}

async function payCuota(req, id, data) {
  const proyectoId = req.user.proyectoId;

  const cuota = await prisma.cuota.findFirst({
    where: {
      id,
      proyecto_id: proyectoId,
    },
  });

  if (!cuota) {
    throw new Error("Cuota no encontrada.");
  }

  await prisma.cuota.updateMany({
    where: {
      id,
      proyecto_id: proyectoId,
    },
    data: {
      estado: true,
      fecha_pago: data.fecha_pago,
    },
  });

  const pago = await prisma.pago.findFirst({
    where: {
      id: cuota.id_pago,
      proyecto_id: proyectoId,
    },
  });

  await prisma.pago.updateMany({
    where: {
      id: cuota.id_pago,
      proyecto_id: proyectoId,
    },
    data: {
      saldo_actual: Number(pago.saldo_actual) - Number(cuota.monto),
    },
  });

  return cuota;
}

async function revertPayCuota(req, id) {
  const proyectoId = req.user.proyectoId;

  const cuota = await prisma.cuota.findFirst({
    where: {
      id,
      proyecto_id: proyectoId,
    },
  });

  if (!cuota) {
    throw new Error("Cuota no encontrada.");
  }

  await prisma.cuota.updateMany({
    where: {
      id,
      proyecto_id: proyectoId,
    },
    data: {
      estado: false,
      fecha_pago: null,
    },
  });

  const pago = await prisma.pago.findFirst({
    where: {
      id: cuota.id_pago,
      proyecto_id: proyectoId,
    },
  });

  await prisma.pago.updateMany({
    where: {
      id: cuota.id_pago,
      proyecto_id: proyectoId,
    },
    data: {
      saldo_actual: Number(pago.saldo_actual) + Number(cuota.monto),
    },
  });

  return cuota;
}

async function deleteCuota(req, id) {
  const proyectoId = req.user.proyectoId;

  return await prisma.cuota.deleteMany({
    where: {
      id,
      proyecto_id: proyectoId,
    },
  });
}

async function deleteCuotaPago(req, id) {
  const proyectoId = req.user.proyectoId;

  const cuota = await prisma.cuota.findFirst({
    where: {
      id,
      proyecto_id: proyectoId,
    },
  });

  if (!cuota) {
    throw new Error("Cuota no encontrada.");
  }

  if (cuota.estado == 0) {
    await prisma.cuota.deleteMany({
      where: {
        id,
        proyecto_id: proyectoId,
      },
    });
  } else {
    const pago = await prisma.pago.findFirst({
      where: {
        id: cuota.id_pago,
        proyecto_id: proyectoId,
      },
    });

    await prisma.pago.updateMany({
      where: {
        id: cuota.id_pago,
        proyecto_id: proyectoId,
      },
      data: {
        saldo_actual: Number(pago.saldo_actual) + Number(cuota.monto),
      },
    });

    await prisma.cuota.deleteMany({
      where: {
        id,
        proyecto_id: proyectoId,
      },
    });
  }
}

async function deleteCuotaMensualPago(req, id) {
  const proyectoId = req.user.proyectoId;

  const cuota = await prisma.cuota.findFirst({
    where: {
      id,
      proyecto_id: proyectoId,
    },
  });

  if (!cuota) {
    throw new Error("Cuota no encontrada");
  }

  if (cuota.tipo !== "MENSUAL") {
    throw new Error("Solo se pueden eliminar cuotas de tipo MENSUAL");
  }

  await prisma.cuota.deleteMany({
    where: {
      id,
      proyecto_id: proyectoId,
    },
  });

  const cuotasRestantes = await prisma.cuota.findMany({
    where: {
      id_pago: cuota.id_pago,
      tipo: "MENSUAL",
      estado: false,
      proyecto_id: proyectoId,
    },
    select: {
      monto: true,
    },
  });

  const sumaCuotasPendientes = cuotasRestantes.reduce(
    (acc, c) => acc + Number(c.monto),
    0,
  );

  const pago = await prisma.pago.findFirst({
    where: {
      id: cuota.id_pago,
      proyecto_id: proyectoId,
    },
    select: {
      cuota_inicial: true,
    },
  });

  const nuevoSaldo = Number(pago.cuota_inicial) + sumaCuotasPendientes;

  await prisma.pago.updateMany({
    where: {
      id: cuota.id_pago,
      proyecto_id: proyectoId,
    },
    data: {
      saldo_actual: nuevoSaldo,
    },
  });
}

async function getFirstToExpire(req) {
  const proyectoId = req.user.proyectoId;

  const cuotas = await prisma.cuota.findMany({
    where: {
      estado: false,
      proyecto_id: proyectoId,
    },
    orderBy: {
      fecha_vencimiento: "asc",
    },
    take: 20,
    select: {
      id: true,
      monto: true,
      fecha_vencimiento: true,
      pago: {
        select: {
          predio: {
            select: {
              manzana: {
                select: {
                  valor: true,
                },
              },
              lote: {
                select: {
                  valor: true,
                },
              },
              cliente_predio: {
                select: {
                  cliente: {
                    select: {
                      nombres: true,
                      apellidos: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  return cuotas.map((cuota) => ({
    idCuota: cuota.id,
    monto: cuota.monto,
    fecha_vencimiento: cuota.fecha_vencimiento,
    manzana: cuota.pago.predio.manzana.valor,
    lote: cuota.pago.predio.lote.valor,
    clientes: cuota.pago.predio.cliente_predio.map(
      (cp) => `${cp.cliente.nombres} ${cp.cliente.apellidos}`,
    ),
  }));
}

async function cuotasGenerate(req, data) {
  const proyectoId = req.user.proyectoId;

  const pago = await prisma.pago.findFirst({
    where: {
      id: data.id_pago,
      proyecto_id: proyectoId,
    },
  });

  if (!pago) {
    throw new Error("Pago no encontrado.");
  }

  const fechaInicio = parseFechaReferenciaUTC(data.fecha_referencia);

  const cuotas = Number(data.numero_cuotas);
  const total = Number(data.precioTotal);
  const inicial = Number(data.cuotaInicial);

  if (isNaN(cuotas) || isNaN(total) || isNaN(inicial)) {
    throw new Error("Datos numéricos inválidos.");
  }

  for (let i = 0; i < Number(data.numero_cuotas); i++) {
    await prisma.cuota.create({
      data: {
        estado: false,
        monto: Math.ceil(
          Number(data.precioTotal - data.cuotaInicial) /
            Number(data.numero_cuotas),
        ),
        numero_cuota: i + 1,
        fecha_vencimiento: addExactMonthPreservingDate(fechaInicio, i + 1),
        proyecto: {
          connect: {
            id: proyectoId,
          },
        },
        pago: {
          connect: {
            id: data.id_pago,
          },
        },
      },
    });
  }
}

export {
  getCuotas,
  getCuotaXPago,
  createCuota,
  createCuotaMensualPago,
  registrarCuotaInicial,
  updateCuota,
  updateCuotaMensual,
  payCuota,
  revertPayCuota,
  deleteCuota,
  deleteCuotaPago,
  deleteCuotaMensualPago,
  getFirstToExpire,
  cuotasGenerate,
};
