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

      predio: {
            connect: {
              id: data.predio
            }
          },

      proyecto: {
        connect: {
          id: proyectoId
        }
      }
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
        proyecto: {
          connect: {
            id: proyectoId
          }
        },
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

async function createPagosByPredios(req, data) {
  const proyectoId = req.user.proyectoId;

  // Compatibilidad con la versión anterior:
  // - Nueva versión: data.predios = [1, 2, 3]
  // - Versión anterior: data.predio = 1
  const predios = data.predios ?? [data.predio];

  return await prisma.$transaction(
    async (tx) => {
      // ============================================================
      // 1. VALIDAR PREDIOS
      // ============================================================

      const prediosDb = await tx.predio.findMany({
        where: {
          id: {
            in: predios,
          },
          proyecto_id: proyectoId,
        },
      });

      if (prediosDb.length !== predios.length) {
        throw new Error("Uno o más predios no fueron encontrados.");
      }

      // ============================================================
      // 2. VALIDAR QUE LOS PREDIOS NO TENGAN UN PLAN DE PAGOS
      // ============================================================

      const pagosExistentes = await tx.pago.findMany({
        where: {
          proyecto_id: proyectoId,
          predio_id: {
            in: predios,
          },
        },
        include: {
          predio: {
            select: {
              id: true,
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
            },
          },
        },
      });

      if (pagosExistentes.length > 0) {
        const lista = pagosExistentes
          .map(
            (pago) =>
              `${pago.predio?.manzana?.valor ?? "N/A"} - ${
                pago.predio?.lote?.valor ?? "N/A"
              } (ID ${pago.predio_id})`
          )
          .join(", ");

        throw new Error(
          `Los siguientes predios ya tienen un plan de pagos: ${lista}`
        );
      }

      // ============================================================
      // 3. VALIDAR CLIENTES
      // ============================================================

      const clientes = await tx.cliente.findMany({
        where: {
          id: {
            in: data.clientes,
          },
          proyecto_id: proyectoId,
        },
      });

      if (clientes.length !== data.clientes.length) {
        throw new Error("Clientes inválidos.");
      }

      // ============================================================
      // 4. PREPARAR Y VALIDAR DATOS
      // ============================================================

      const fechaInicio = parseFechaReferenciaUTC(data.fechaCuotaInicial);

      const numeroCuotas = Number(data.numeroCuotas);
      const precioTotal = Number(data.precioTotal);
      const cuotaInicial = Number(data.cuotaInicial);

      if (
        Number.isNaN(numeroCuotas) ||
        Number.isNaN(precioTotal) ||
        Number.isNaN(cuotaInicial)
      ) {
        throw new Error("Datos numéricos inválidos.");
      }

      const montoCuota = Math.ceil(
        (precioTotal - cuotaInicial) / numeroCuotas
      );

      const pagos = [];

      // ============================================================
      // 5. CREAR UN PAGO POR CADA PREDIO
      // ============================================================

      for (const predioId of predios) {
        // ----------------------------------------------------------
        // CREAR PAGO
        // ----------------------------------------------------------

        const pago = await tx.pago.create({
          data: {
            // Mantengo los valores originales para conservar
            // exactamente el comportamiento anterior.
            cuota_inicial: data.cuotaInicial,
            precio_total: data.precioTotal,
            saldo: data.precioTotal,
            saldo_actual: data.precioTotal,

            predio: {
              connect: {
                id: predioId,
              },
            },

            proyecto: {
              connect: {
                id: proyectoId,
              },
            },
          },
        });

        // ----------------------------------------------------------
        // RELACIONAR CLIENTES
        // ----------------------------------------------------------
        // Antes se ejecutaba un create por cliente.
        // Ahora se realiza un solo INSERT múltiple.

        await tx.cliente_pago.createMany({
          data: data.clientes.map((clienteId) => ({
            pago_id: pago.id,
            cliente_id: clienteId,
          })),
        });

        // ----------------------------------------------------------
        // CREAR CUOTAS
        // ----------------------------------------------------------
        // Antes se ejecutaba un INSERT por cada cuota.
        // Ahora generamos las cuotas en memoria y realizamos
        // un solo INSERT múltiple.

        const cuotasData = Array.from(
          { length: numeroCuotas },
          (_, index) => ({
            estado: false,

            monto: montoCuota,

            numero_cuota: index + 1,

            fecha_vencimiento: addExactMonthPreservingDate(
              fechaInicio,
              index + 1
            ),

            proyecto_id: proyectoId,

            pago_id: pago.id,
          })
        );

        await tx.cuota.createMany({
          data: cuotasData,
        });

        pagos.push(pago);
      }

      // ============================================================
      // 6. ACTUALIZAR DISPONIBILIDAD DE TODOS LOS PREDIOS
      // ============================================================
      // Antes se realizaba un UPDATE por cada predio.
      // Ahora se actualizan todos con una sola consulta.

      await tx.predio.updateMany({
        where: {
          id: {
            in: predios,
          },
          proyecto_id: proyectoId,
        },
        data: {
          disponible: false,
        },
      });

      // ============================================================
      // 7. RETORNO COMPATIBLE CON LA VERSIÓN ANTERIOR
      // ============================================================

      if (pagos.length === 1) {
        return pagos[0];
      }

      return pagos;
    },
    {
      // Tiempo máximo esperando obtener una transacción disponible.
      maxWait: 10000,

      // Tiempo máximo que puede permanecer abierta la transacción.
      timeout: 30000,
    }
  );
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
  createPagosByPredios,
  updatePago,
  deletePago,
  getPagoXId,
  postSearchPagos,
  updateCurrentBalance
};
