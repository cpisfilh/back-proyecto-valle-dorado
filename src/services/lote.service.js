import prisma from "../orm/prismaClient.js";

async function getLotes() {
  const lotes = await prisma.lote.findMany();

  return lotes;
}

async function createLote(data) {
  const lote = await prisma.lote.create({ data });
  return lote;
}

async function updateLote(id, data) {
  const lote = await prisma.lote.update({ where: { id }, data });
  return lote;
}

async function deleteLote(id) {
  const lote = await prisma.lote.delete({ where: { id } });
  return lote;
}

export { getLotes, createLote, updateLote, deleteLote };
