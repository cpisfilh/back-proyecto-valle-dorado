import prisma from "../orm/prismaClient.js";

async function getCuotas() {
  const cuotas = await prisma.cuota.findMany({
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

async function getCuotaXPago(id_pago) {
  const cuotas = await prisma.cuota.findMany({ where: { id_pago } });
  return cuotas;
}

async function createCuota(data) {
  const cuota = await prisma.cuota.create({ data });
  return cuota;
}

async function updateCuota(id, data) {
  const cuota = await prisma.cuota.update({ where: { id }, data });
  return cuota;
}

async function payCuota(id, data) {
  console.log(data);

  const cuota = await prisma.cuota.update({
    where: { id },
    data: {
      estado: true,
      fecha_pago: data.fecha_pago
    },
  });
  return cuota;
}

async function revertPayCuota(id) {

  const cuota = await prisma.cuota.update({
    where: { id },
    data: {
      estado: false,
      fecha_pago: null
    },
  });
  return cuota;
}

async function deleteCuota(id) {
  const cuota = await prisma.cuota.delete({ where: { id } });
  return cuota;
}

export {
  getCuotas,
  getCuotaXPago,
  createCuota,
  updateCuota,
  payCuota,
  revertPayCuota,
  deleteCuota,
};
