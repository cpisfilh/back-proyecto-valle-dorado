import prisma from "../orm/prismaClient.js";

async function getClientes() {
  const clientes = await prisma.cliente.findMany({
    orderBy: {
      id: "desc", // Ordena por ID de manera descendente (de más reciente a más antiguo)
    },
  });

  return clientes;
}

async function createCliente(data) {
  const cliente = await prisma.cliente.create({ data });
  return cliente;
}

async function deleteCliente(id) {
  const cliente = await prisma.cliente.delete({ where: { id } });
  return cliente;
}

export { getClientes, createCliente, deleteCliente };
