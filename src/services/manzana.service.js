import prisma from "../orm/prismaClient.js";

async function getManzanas() {
  const manzanas = await prisma.manzana.findMany();

  return manzanas;
}

async function createManzana(data) {
  const manzana = await prisma.manzana.create({ data });
  return manzana;
}

async function updateManzana(id, data) {
  const manzana = await prisma.manzana.update({ where: { id }, data });
  return manzana;
}

async function deleteManzana(id) {
  const manzana = await prisma.manzana.delete({ where: { id } });
  return manzana;
}

export { getManzanas, createManzana, updateManzana, deleteManzana };
