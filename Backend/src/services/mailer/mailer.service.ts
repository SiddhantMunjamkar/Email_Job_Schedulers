import nodemailer from "nodemailer";

export async function createEtherealTransporter() {
  const testAcc = await nodemailer.createTestAccount();

  return nodemailer.createTransport({
    host: testAcc.smtp.host,
    port: testAcc.smtp.port,
    secure: testAcc.smtp.secure,
    auth: {
      user: testAcc.user,
      pass: testAcc.pass,
    },
  });
}
