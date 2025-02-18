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

export { getClientes };
