import { Resend } from "resend";

export const sendEmail = async ({ to, subject, react }) => {
  const resend = new Resend(process.env.RESENDKEY || "");

  try {
    const data = await resend.emails.send({
      from: "Welth ( AI Finance Platform ) <onboarding@resend.dev>",
      to,
      subject,
      react,
    });

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.log(error, "SEND-EMAIL-ERROR");
    return {
      success: false,
      error,
    };
  }
};
