import prisma from "../orm/prismaClient.js";

async function getPredios() {
  const predios = await prisma.predio.findMany();

  return predios;
}

async function createPredio(data) {
  const predio = await prisma.predio.create({ data });
  return predio;
}

async function updatePredio(id, data) {
  const predio = await prisma.predio.update({ where: { id }, data });
  return predio;
}

async function deletePredio(id) {
  const predio = await prisma.predio.delete({ where: { id } });
  return predio;
}

async function deletePredioXCustomer(id) {
  const predio = await prisma.cliente_predio.delete({ where: { id } });
  return predio;
}

async function getPrediosxCustomer(nombre) {
  try {
    const whereClause =
      nombre === ""
        ? {} // Si nombre está vacío, traemos todos los registros
        : {
            cliente: {
              nombres: { contains: nombre },
            },
          };

    const clientePredios = await prisma.cliente_predio.findMany({
      where: whereClause,
      include: {
        cliente: true,
        predio: {
          include: {
            manzana: true,
            lote: true,
          },
        },
      },
    });

    // Formateamos la respuesta
    return clientePredios.map((cp) => ({
      id: cp.id,
      nombre_cliente: cp.cliente.nombres,
      apellido_cliente: cp.cliente.apellidos,
      manzana: cp.predio.manzana.valor,
      lote: cp.predio.lote.valor,
    }));
  } catch (error) {
    console.error("Error obteniendo predios:", error);
    throw new Error("Ocurrió un error al obtener los predios");
  }
}



async function getPrediosSelectModal() {
  const predios = await prisma.predio.findMany({
    include: {
      manzana: true, // Trae directamente los datos de la manzana
      lote: true, // Trae directamente los datos del lote
      cliente_predio: {
        include: {
          cliente: true
        }
      }
    },
  });

  // Formatear la salida
  return predios.map(predio => ({
    id: predio.id,
    id_manzana: predio.manzana.id,
    manzana: predio.manzana.valor,
    lote: predio.lote.valor,
    lote_id: predio.lote.id
  }));
}

async function postRelateClientProperty(data) {
  try {
    const predio = await prisma.cliente_predio.create({ data });
    return predio;
  } catch (error) {
    throw new Error(error);
  }
}



export { getPredios, createPredio, updatePredio, deletePredio, getPrediosxCustomer, getPrediosSelectModal, postRelateClientProperty,deletePredioXCustomer };
