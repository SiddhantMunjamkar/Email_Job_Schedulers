import { Request, Response } from "express";
import { createSender, listSenders } from "./sender.repo";

export async function createSenderController(req: Request, res: Response) {
  const user = req.authUser;
  const { name, fromEmail } = req.body;

  const sender = await createSender({
    userId: user!.id,
    name,
    fromEamil: fromEmail,
  });

  return res.status(201).json({
    message: "Sender created",
    sender,
  });
}

export async function listSendersController(req: Request, res: Response) {
  const user = req.authUser;
  const senders = await listSenders(user!.id);

  return res.status(200).json({
    items: senders,
  });
}
