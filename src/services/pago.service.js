import prisma from "../orm/prismaClient.js";
import {
  addExactMonthPreservingDate,
  parseFechaReferenciaUTC
} from "../utils/generics.js";

async function getPagos(req) {

  const proyectoId = req.user.proyectoId;

  const pagos = await prisma.pago.findMany({
    where: {
      proyecto_id: proyectoId
    },
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
    fecha_cuota_inicial: pago.fecha_cuota_inicial,
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

async function getPagoXId(req, id) {

  const proyectoId = req.user.proyectoId;

  const pago = await prisma.pago.findFirst({
    where: {
      id,
      proyecto_id: proyectoId
    },
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

  if (!pago) {
    throw new Error("Pago no encontrado.");
  }

  return {
    ...pago,
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

async function createPago(req, data) {

  const proyectoId = req.user.proyectoId;

  // VALIDAR PREDIO
  const predio = await prisma.predio.findFirst({
    where: {
      id: data.predio,
      proyecto_id: proyectoId
    }
  });

  if (!predio) {
    throw new Error("Predio no encontrado.");
  }

  // VALIDAR CLIENTES
  const clientes = await prisma.cliente.findMany({
    where: {
      id: {
        in: data.clientes
      },
      proyecto_id: proyectoId
    }
  });

  if (clientes.length !== data.clientes.length) {
    throw new Error("Clientes inválidos.");
  }

  // CREAR PAGO
  const pago = await prisma.pago.create({
    data: {
      cuota_inicial: data.cuotaInicial,
      precio_total: data.precioTotal,
      saldo: data.precioTotal,
      saldo_actual: data.precioTotal,
      predio_id: data.predio,
      proyecto_id: proyectoId,
    },
  });

  // RELACIONAR CLIENTES
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

  const fechaInicio = parseFechaReferenciaUTC(
    data.fechaCuotaInicial
  );

  const cuotas = Number(data.numeroCuotas);
  const total = Number(data.precioTotal);
  const inicial = Number(data.cuotaInicial);

  if (
    isNaN(cuotas) ||
    isNaN(total) ||
    isNaN(inicial)
  ) {
    throw new Error("Datos numéricos inválidos.");
  }

  // CREAR CUOTAS
  for (let i = 0; i < Number(data.numeroCuotas); i++) {

    await prisma.cuota.create({
      data: {
        estado: false,
        monto: Math.ceil(
          Number(data.precioTotal - data.cuotaInicial)
          /
          Number(data.numeroCuotas)
        ),
        numero_cuota: i + 1,
        fecha_vencimiento: addExactMonthPreservingDate(
          fechaInicio,
          i + 1
        ),
        proyecto_id: proyectoId,
        pago: {
          connect: {
            id: pago.id
          },
        },
      },
    });
  }

  // ACTUALIZAR DISPONIBILIDAD
  await prisma.predio.updateMany({
    where: {
      id: data.predio,
      proyecto_id: proyectoId
    },
    data: {
      disponible: false,
    },
  });

  return pago;
}

async function updatePago(req, id, data) {

  const proyectoId = req.user.proyectoId;

  const pago = await prisma.pago.updateMany({
    where: {
      id,
      proyecto_id: proyectoId
    },
    data: {
      cuota_inicial: data.cuotaInicial,
      precio_total: data.precioTotal,
      saldo: data.saldo,
      predio_id: data.predio,
    },
  });

  // ELIMINAR CLIENTES RELACIONADOS
  await prisma.cliente_pago.deleteMany({
    where: {
      pago_id: id
    },
  });

  // INSERTAR NUEVOS CLIENTES
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

async function deletePago(req, id) {

  const proyectoId = req.user.proyectoId;

  const pago = await prisma.pago.findFirst({
    where: {
      id,
      proyecto_id: proyectoId
    }
  });

  if (!pago) {
    throw new Error("Pago no encontrado.");
  }

  await prisma.pago.deleteMany({
    where: {
      id,
      proyecto_id: proyectoId
    }
  });

  // LIBERAR PREDIO
  await prisma.predio.updateMany({
    where: {
      id: pago.predio_id,
      proyecto_id: proyectoId
    },
    data: {
      disponible: true,
    },
  });

  return pago;
}

async function postSearchPagos(req, nombre) {

  const proyectoId = req.user.proyectoId;

  try {

    const nombreTrim = nombre.trim();

    const applyFilter = nombreTrim !== "";

    const pagos = await prisma.pago.findMany({
      where: {
        proyecto_id: proyectoId
      },
      include: {
        predio: {
          include: {
            manzana: true,
            lote: true,
          },
        },
        cliente_pago: {
          include: {
            cliente: true,
          },
        },
      },
    });

    const pagosFiltrados = applyFilter
      ? pagos.filter((pago) => {

          const manzana =
            pago.predio.manzana?.valor || "";

          const lote =
            pago.predio.lote?.valor || "";

          const combinado =
            `${manzana}-${lote}`.toLowerCase();

          return (
            pago.cliente_pago.some((cp) =>
              cp.cliente.nombres
                ?.toLowerCase()
                .includes(nombreTrim.toLowerCase())
              ||
              cp.cliente.apellidos
                ?.toLowerCase()
                .includes(nombreTrim.toLowerCase())
              ||
              cp.cliente.dni
                ?.toLowerCase()
                .includes(nombreTrim.toLowerCase())
            )
            ||
            combinado.includes(
              nombreTrim.toLowerCase()
            )
          );
        })
      : pagos;

    return pagosFiltrados.map((pago) => ({
      id: pago.id,
      precio_total: pago.precio_total,
      cuota_inicial: pago.cuota_inicial,
      saldo_actual: pago.saldo_actual,
      fecha_cuota_inicial: pago.fecha_cuota_inicial,
      cliente_pago: pago.cliente_pago.map((cp) => ({
        id: cp.id,
        cliente_id: cp.cliente.id,
        cliente_nombre: cp.cliente.nombres,
        cliente_apellido: cp.cliente.apellidos,
        cliente_dni: cp.cliente.dni,
      })),
      predio: {
        manzana: pago.predio.manzana?.valor,
        lote: pago.predio.lote?.valor,
      },
    }));

  } catch (error) {

    console.error("Error obteniendo pagos:", error);

    throw new Error(
      "Ocurrió un error al obtener los pagos"
    );
  }
}

async function updateCurrentBalance(req, id, data) {

  const proyectoId = req.user.proyectoId;

  await prisma.pago.updateMany({
    where: {
      id,
      proyecto_id: proyectoId
    },
    data: {
      saldo_actual: Number(data.data),
    },
  });
}

export {
  getPagos,
  createPago,
  updatePago,
  deletePago,
  getPagoXId,
  postSearchPagos,
  updateCurrentBalance
};
