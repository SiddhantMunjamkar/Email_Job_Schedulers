import nodemailer from "nodemailer";

export async function createEtherealTransporter() {
  const testAcc = await nodemailer.createTestAccount();

  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    // secure: testAcc.smtp.secure,
    auth: {
      user: "luz.smitham@ethereal.email",
      pass: "7FEm23kkJh2Vc8PGdN",
    },
  });
}
