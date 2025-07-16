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

async function createCuotaMensualPago(data) {
  //Crear la cuota
  const cuota = await prisma.cuota.create({ data });
  //Sumar el monto a MontoInicial y a SaldoActual del pago
  await prisma.pago.update({
    where: { id: cuota.id_pago },
    data: {
      saldo_actual: { increment: Number(cuota.monto) },
    },
  });
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
async function updateCuotaMensual(id, data) {
  // 1. Actualizar la cuota
  const cuotaActualizada = await prisma.cuota.update({ where: { id }, data });

  // 2. Verificar si es de tipo MENSUAL
  if (cuotaActualizada.tipo !== "MENSUAL") return cuotaActualizada;

  // 3. Obtener cuotas MENSUALES PENDIENTES restantes (incluyendo la actualizada si quedó pendiente)
  const cuotasPendientes = await prisma.cuota.findMany({
    where: {
      id_pago: cuotaActualizada.id_pago,
      tipo: "MENSUAL",
      estado: false, // pendientes
    },
    select: {
      monto: true
    }
  });

  // 4. Sumar montos de cuotas pendientes
  const totalPendiente = cuotasPendientes.reduce((acc, c) => acc + Number(c.monto), 0);

  // 5. Obtener cuota inicial
  const pago = await prisma.pago.findUnique({
    where: { id: cuotaActualizada.id_pago },
    select: {
      cuota_inicial: true
    }
  });

  // 6. Calcular nuevo saldo actual
  const nuevoSaldo = Number(pago.cuota_inicial) + totalPendiente;

  // 7. Actualizar saldo_actual en el pago
  await prisma.pago.update({
    where: { id: cuotaActualizada.id_pago },
    data: {
      saldo_actual: nuevoSaldo
    }
  });

  return cuotaActualizada;
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
async function deleteCuotaPago(id) {
  //traer cuota por id
  const cuota = await prisma.cuota.findUnique({ where: { id } });

  //verificar si su estado es pendiente (0) o pagado(1)
  if (cuota.estado == 0) {
    await prisma.cuota.delete({ where: { id } });
  } else {
    //si el estado es pagado, borrar y actualizar el saldo del pago
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
    await prisma.cuota.delete({ where: { id } });
  }

}
async function deleteCuotaMensualPago(id) {
  // 1. Obtener la cuota a eliminar
  const cuota = await prisma.cuota.findUnique({ where: { id } });
  if (!cuota) throw new Error("Cuota no encontrada");
  if (cuota.tipo !== "MENSUAL") throw new Error("Solo se pueden eliminar cuotas de tipo MENSUAL");

  // 2. Eliminar la cuota
  await prisma.cuota.delete({ where: { id } });

  // 3. Obtener el pago asociado y sus cuotas MENSUALES PENDIENTES restantes
  const cuotasRestantes = await prisma.cuota.findMany({
    where: {
      id_pago: cuota.id_pago,
      tipo: "MENSUAL",
      estado: false // pendientes
    },
    select: {
      monto: true
    }
  });

  // 4. Sumar montos de cuotas pendientes
  const sumaCuotasPendientes = cuotasRestantes.reduce((acc, c) => acc + Number(c.monto), 0);

  // 5. Obtener cuota_inicial
  const pago = await prisma.pago.findUnique({
    where: { id: cuota.id_pago },
    select: {
      cuota_inicial: true
    }
  });

  // 6. Calcular nuevo saldo_actual
  const nuevoSaldo = Number(pago.cuota_inicial) + sumaCuotasPendientes;

  // 7. Actualizar el saldo_actual en el pago
  await prisma.pago.update({
    where: { id: cuota.id_pago },
    data: {
      saldo_actual: nuevoSaldo
    }
  });
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
  cuotasGenerate
};
