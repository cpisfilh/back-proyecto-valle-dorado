import prisma from "../orm/prismaClient.js";

async function getClientes() {
  const clientes = await prisma.cliente.findMany({
    select: {
      id: true,
      nombres: true,
      apellidos: true,
      celular: true,
    },
  });

  return clientes;
}

async function createCliente(data) {
  const cliente = await prisma.cliente.create({ data });
  return cliente;
}

export { getClientes, createCliente };
