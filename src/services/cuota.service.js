import prisma from "../orm/prismaClient.js";
import {addExactMonthPreservingDate, parseFechaReferenciaUTC } from "../utils/generics.js";


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
  const cuotas = await prisma.cuota.findMany({ where: { id_pago }, include: { subcuota: true } });
  return cuotas;
}

async function createCuota(data) {
  const cuota = await prisma.cuota.create({ data });
  return cuota;
}

async function registrarCuotaInicial(data) {
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
    take: 10,
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

async function cuotasGenerate(data) {
  console.log(data);

  // Suponiendo que data.fechaInicio es la fecha de pago inicial (hoy si no está definida)
  const fechaInicio = parseFechaReferenciaUTC(data.fecha_referencia);

  //3 - crear cuotas (tenemos el precio total, cuota inicial y la cantidad de cuotas)
  const cuotas = Number(data.numero_cuotas);
  const total = Number(data.precioTotal);
  const inicial = Number(data.cuotaInicial);

  if (isNaN(cuotas) || isNaN(total) || isNaN(inicial)) {
    throw new Error("Datos numéricos inválidos.");
  }
  //
  for (let i = 0; i < Number(data.numero_cuotas); i++) {
    await prisma.cuota.create({
      data: {
        estado: false,
        monto: Math.ceil(Number(data.precioTotal - data.cuotaInicial) / Number(data.numero_cuotas)), //redondear al mayor
        numero_cuota: i + 1,
        fecha_vencimiento: addExactMonthPreservingDate(fechaInicio, i + 1), //se saca de mes a mes
        pago: {
          connect: { id: data.id_pago }, // <- conexión correcta con la relación
        },
      },
    });
  }
}

export {
  getCuotas,
  getCuotaXPago,
  createCuota,
  registrarCuotaInicial,
  updateCuota,
  payCuota,
  revertPayCuota,
  deleteCuota,
  getFirstToExpire,
  cuotasGenerate
};
