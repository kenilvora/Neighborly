import nodemailer from "nodemailer";

export default async function mailSender(
  to: string,
  subject: string,
  html: string
) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: "Neighborly",
      to,
      subject,
      html,
    });
  } catch (error) {
    return "Error sending email";
  }
}
