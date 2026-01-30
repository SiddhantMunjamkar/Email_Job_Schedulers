import { prisma } from "../../config/prisma";

export async function createSender(params: {
  userId: string;
  name: string;
  fromEamil: string;
}) {
  return await prisma.sender.create({
    data: {
      userId: params.userId,
      name: params.name,
      fromemail: params.fromEamil,
    },
    select: {
      id: true,
      name: true,
      fromemail: true,
      createdAt: true,
    },
  });
}

export async function listSenders(userId: string) {
  return await prisma.sender.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      fromemail: true,
      createdAt: true,
    },
  });
}
