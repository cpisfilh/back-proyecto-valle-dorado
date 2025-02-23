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

export { getPredios, createPredio, updatePredio, deletePredio };
