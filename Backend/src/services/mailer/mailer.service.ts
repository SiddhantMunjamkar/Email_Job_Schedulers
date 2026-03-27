import nodemailer from "nodemailer";

export async function createEtherealTransporter() {
  const testAcc = await nodemailer.createTestAccount();

  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    // secure: testAcc.smtp.secure,
    auth: {
      user: "jaren.goodwin59@ethereal.email",
      pass: "n5AFycN2RU7tuP17Ka",
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

