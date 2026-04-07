"use server";
import nodemailer from "nodemailer";
 
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_SERVER_HOST || "smtp.gmail.com", // e.g. smtp.gmail.com
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_SERVER_USERNAME || "random.00147@gmail.com",
        pass: process.env.SMTP_SERVER_PASSWORD || "zwfpzzaxiapcmoof", // use App Password for Gmail
    },
});
export async function sendMail({  sendTo, subject, text, html }) {
    try {
        await transporter.verify();
    } catch (error) {
        console.error("SMTP Error:", error);
        return { success: false, error: "SMTP failed" };
    }
    try {
        const info = await transporter.sendMail({
            from: `<${process.env.SMTP_SERVER_USERNAME}>`,
            replyTo: `<${process.env.SMTP_SERVER_USERNAME}>`,
            to: sendTo,
            subject,
            text,
            html: html || "",
        });
 
        return {
            success: true,
            messageId: info.messageId,
        };
    } catch (error) {
        console.error("Send Mail Error:", error);
        return { success: false, error: "Send failed" };
    }
}
 