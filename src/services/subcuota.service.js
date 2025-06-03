import { Prisma } from "@prisma/client";
import prisma from "../orm/prismaClient.js";

async function getSubCuotas() {
    //   const subcuotas = await prisma.subcuota.findMany({
    //     include: {
    //       pago: {
    //         include: {
    //           predio: {
    //             include: {
    //               manzana: true,
    //               lote: true,
    //             },
    //           },
    //         },
    //       },
    //     },
    //   });
    //   return subcuotas.map((subcuota) => ({
    //     ...subcuota,
    //     predio: {
    //       manzana: subcuota.pago.predio.manzana.valor,
    //       lote: subcuota.pago.predio.lote.valor,
    //     },
    //   }));
    return {};
}

async function createSubCuota(data) {
  // Contar subcuotas actuales activas
  const numeroCuotaActual = await prisma.subcuota.count({
    where: {
      id_cuota: data.id_cuota,
      estado: true,
    },
  });

  // Crear nueva subcuota (usando conexión de relación con cuota)
  const subcuota = await prisma.subcuota.create({
    data: {
      monto: new Prisma.Decimal(data.monto),
      fecha_pago: data.fecha_pago ? new Date(data.fecha_pago) : null,
      fecha_vencimiento: data.fecha_vencimiento ? new Date(data.fecha_vencimiento) : null,
      estado: true,
      numero_subcuota: numeroCuotaActual + 1,
      cuota: {
        connect: {
          id: data.id_cuota,
        },
      },
    },
    include: {
      cuota: true, // 👈 Necesario para acceder a cuota.id_pago
    },
  });

  // Obtener pago asociado a la cuota
  const pago = await prisma.pago.findUnique({
    where: { id: subcuota.cuota.id_pago },
  });

  // Actualizar saldo_actual restando el monto de la subcuota
  await prisma.pago.update({
    where: { id: subcuota.cuota.id_pago },
    data: {
      saldo_actual: Number(pago.saldo_actual) - Number(subcuota.monto),
    },
  });

  return subcuota;
}


async function updateSubCuota(id, data) {
    const subcuota = await prisma.subcuota.update({ where: { id }, data });
    return subcuota;
}

async function deleteSubCuota(id) {
    // Primero obtenemos la subcuota con su cuota
    const subcuota = await prisma.subcuota.findUnique({
        where: { id },
        include: {
            cuota: {
                include: {
                    pago: true,
                },
            },
        },
    });

    if (!subcuota || !subcuota.cuota) {
        throw new Error("Subcuota o cuota no encontrada");
    }

    // Actualizar el saldo del pago (sumar de nuevo el monto eliminado)
    await prisma.pago.update({
        where: { id: subcuota.cuota.id_pago },
        data: {
            saldo_actual: Number(subcuota.cuota.pago?.saldo_actual || 0) + Number(subcuota.monto),
        },
    });

    // Luego borramos la subcuota
    await prisma.subcuota.delete({ where: { id } });

    return subcuota;
}


export { getSubCuotas, createSubCuota, updateSubCuota, deleteSubCuota };
