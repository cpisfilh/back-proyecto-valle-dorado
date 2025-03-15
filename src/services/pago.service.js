import prisma from "../orm/prismaClient.js";

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
    precio_total: pago.precio_total,
    saldo: pago.saldo,
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
  console.log(data);
  const pago = await prisma.pago.create(
    {
      data: {
        cuota_inicial: data.cuotaInicial,
        precio_total: data.precioTotal,
        saldo: data.saldo,
        predio_id: data.predio,
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
  return pago;
}



export { getPagos, createPago, updatePago, deletePago };
