import prisma from "../orm/prismaClient.js";
import { addExactMonthPreservingDate, parseFechaReferenciaUTC } from "../utils/generics.js";
// import {addMonths} from "date-fns";

async function getPagos() {
  const pagos = await prisma.pago.findMany({
    include: {
      predio: {
        include: {
          manzana: true,
          lote: true,
        }
      },
      cliente_pago: {
        include: {
          cliente: true
        }
      }
    }
  });

  return pagos.map(pago => ({
    id: pago.id,
    cuota_inicial: pago.cuota_inicial,
    fecha_cuota_inicial : pago.fecha_cuota_inicial,
    precio_total: pago.precio_total,
    saldo: pago.saldo,
    saldo_actual: pago.saldo_actual,
    predio: {
      id: pago.predio.id,
      manzana: pago.predio.manzana.valor,
      lote: pago.predio.lote.valor
    },
    cliente_pago: [
      ...pago.cliente_pago.map(cp => ({
        id: cp.id,
        cliente_id: cp.cliente.id,
        cliente_nombre: cp.cliente.nombres,
        cliente_apellido: cp.cliente.apellidos,
        cliente_dni: cp.cliente.dni
      }))
    ]
  }));
}

async function getPagoXId(id) {
  const pago = await prisma.pago.findUnique({
    where: { id },
    include: {
      predio: {
        include: {
          manzana: true,
          lote: true,
        }
      },
      cliente_pago: {
        include: {
          cliente: true
        }
      }
    }
  });
  return {...pago,
    cliente_pago: [
      ...pago.cliente_pago.map(cp => ({
        id: cp.id,
        cliente_id: cp.cliente.id,
        cliente_nombre: cp.cliente.nombres,
        cliente_apellido: cp.cliente.apellidos,
        cliente_dni: cp.cliente.dni
      }))
    ],
    predio: {
      id: pago.predio.id,
      manzana: pago.predio.manzana.valor,
      lote: pago.predio.lote.valor
    }
  };
}

async function createPago(data) {
  //   body que llegará al servicio:
  //   {
  //     "clientes": [
  //         2
  //     ],
  //     "precioTotal": "10000",
  //     "cuotaInicial": "1234",
  //     "saldo": "343",
  //     "predio": 1
  // }
  // 1 - Crear el pago
  //
  const pago = await prisma.pago.create(
    {
      data: {
        cuota_inicial: data.cuotaInicial,
        precio_total: data.precioTotal,
        saldo: data.precioTotal,
        saldo_actual: data.precioTotal,
        predio_id: data.predio,
        // fecha_cuota_inicial: data.fechaCuotaInicial
      },
    }
  );

  // 2 - Relacionar el pago con los clientes
  //
  await Promise.all(
    data.clientes.map(clienteId =>
      prisma.cliente_pago.create({
        data: {
          pago_id: pago.id,
          cliente_id: clienteId,
        },
      })
    )
  );

  // Suponiendo que data.fechaInicio es la fecha de pago inicial (hoy si no está definida)
    const fechaInicio = parseFechaReferenciaUTC(data.fechaCuotaInicial);
  
    //3 - crear cuotas (tenemos el precio total, cuota inicial y la cantidad de cuotas)
    const cuotas = Number(data.numeroCuotas);
    const total = Number(data.precioTotal);
    const inicial = Number(data.cuotaInicial);
  
    if (isNaN(cuotas) || isNaN(total) || isNaN(inicial)) {
      throw new Error("Datos numéricos inválidos.");
    }
    //
    for (let i = 0; i < Number(data.numeroCuotas
    ); i++) {
      await prisma.cuota.create({
        data: {
          estado: false,
          monto: Math.ceil(Number(data.precioTotal - data.cuotaInicial) / Number(data.numeroCuotas)), //redondear al mayor
          numero_cuota: i + 1,
          fecha_vencimiento: addExactMonthPreservingDate(fechaInicio, i + 1), //se saca de mes a mes
          pago: {
          connect: { id: pago.id }, // <- conexión correcta con la relación
        },
        },
      });
    }

  // 4 - cambiar campo disponifle a false
  await prisma.predio.update({
    where: { id: data.predio },
    data: {
      disponible: false,
    },
  });

  return pago;
}

async function updatePago(id, data) {
  console.log(`Actualizando pago con ID: ${id}`, data);

  // 1 - Actualizar el pago
  const pago = await prisma.pago.update({
    where: { id },
    data: {
      cuota_inicial: data.cuotaInicial,
      precio_total: data.precioTotal,
      saldo: data.saldo,
      predio_id: data.predio,
    },
  });

  // 2 - Eliminar relaciones previas con clientes
  await prisma.cliente_pago.deleteMany({
    where: { pago_id: id },
  });

  // 3 - Insertar nuevas relaciones con clientes
  await Promise.all(
    data.clientes.map(clienteId =>
      prisma.cliente_pago.create({
        data: {
          pago_id: id,
          cliente_id: clienteId,
        },
      })
    )
  );

  return pago;
}


async function deletePago(id) {
  const pago = await prisma.pago.delete({ where: { id } });
  //Actualizar predio disponible a true
  await prisma.predio.update({
    where: { id: pago.predio_id },
    data: {
      disponible: true,
    },
  });
  return pago;
}



export { getPagos, createPago, updatePago, deletePago, getPagoXId };
