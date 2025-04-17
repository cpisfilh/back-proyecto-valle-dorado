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

  //traer el pago por id
  const pago = await prisma.pago.findUnique({
    where: { id: cuota.id_pago }
  });
  console.log(pago);
  //Actualizar saldo_actual del pago
  await prisma.pago.update({
    where: { id: cuota.id_pago },
    data: {
      saldo_actual: Number(pago.saldo_actual) - Number(cuota.monto)
    }
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

  //traer el pago por id
  const pago = await prisma.pago.findUnique({
    where: { id: cuota.id_pago }
  });
  //Actualizar saldo_actual del pago
  await prisma.pago.update({
    where: { id: cuota.id_pago },
    data: {
      saldo_actual: Number(pago.saldo_actual) + Number(cuota.monto)
    }
  });
  return cuota;
}

async function deleteCuota(id) {
  const cuota = await prisma.cuota.delete({ where: { id } });
  return cuota;
}
async function getFirstToExpire() {
  const cuotas = await prisma.cuota.findMany({
    where: { estado: false },
    orderBy: { fecha_vencimiento: "asc" },
    take: 5,
    select: {
      id: true,
      monto: true,
      fecha_vencimiento: true,
      pago: {
        select: {
          predio: {
            select: {
              manzana: {
                select: { valor: true },
              },
              lote: {
                select: { valor: true },
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

  const res = cuotas.map((cuota) => ({
    idCuota: cuota.id,
    monto: cuota.monto,
    fecha_vencimiento: cuota.fecha_vencimiento,
    manzana: cuota.pago.predio.manzana.valor,
    lote: cuota.pago.predio.lote.valor,
    clientes: cuota.pago.predio.cliente_predio.map(
      (cp) => `${cp.cliente.nombres} ${cp.cliente.apellidos}`
    ),
  }));

  return res;
}

export {
  getCuotas,
  getCuotaXPago,
  createCuota,
  updateCuota,
  payCuota,
  revertPayCuota,
  deleteCuota,
  getFirstToExpire
};
