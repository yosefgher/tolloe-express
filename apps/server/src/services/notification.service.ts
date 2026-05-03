import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { prisma } from '../lib/prisma';

// Create transporter — falls back to Ethereal (test SMTP) if not configured
let transporter: nodemailer.Transporter;

async function getTransporter() {
  if (transporter) return transporter;

  if (env.SMTP_HOST && env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });
  } else {
    // Use Ethereal for development
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    console.log('📧 Using Ethereal test email. Preview at: https://ethereal.email');
  }

  return transporter;
}

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    const t = await getTransporter();
    const info = await t.sendMail({ from: env.EMAIL_FROM, to, subject, html });

    if (env.NODE_ENV === 'development') {
      console.log(`📧 Email sent: ${nodemailer.getTestMessageUrl(info)}`);
    }
    return info;
  } catch (err) {
    console.error('Email send failed:', err);
  }
}

export async function sendSMS(to: string, message: string) {
  // Stub — replace with Africastalking SDK
  if (env.AT_API_KEY && env.AT_USERNAME) {
    console.log(`📱 SMS to ${to}: ${message}`);
    // TODO: integrate africastalking SDK
  } else {
    console.log(`[SMS STUB] To: ${to} | Message: ${message}`);
  }
}

export async function sendShipmentCreatedNotification(userId: string, shipmentData: {
  trackingNumber: string;
  recipientEmail: string;
  serviceType: string;
  totalPrice: number;
}) {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { profile: true } });
  if (!user) return;

  const subject = `Shipment Booked — ${shipmentData.trackingNumber}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px;">
      <h2 style="color: #E85D04;">TOLLOE EXPRESS</h2>
      <p>Dear ${user.profile?.firstName || 'Customer'},</p>
      <p>Your shipment has been booked successfully.</p>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Tracking Number</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${shipmentData.trackingNumber}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Service</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${shipmentData.serviceType}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Total Price</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${shipmentData.totalPrice} ETB</td></tr>
      </table>
      <p>Track your shipment at: <a href="http://toloeexpress.com/track/${shipmentData.trackingNumber}">
        toloeexpress.com/track/${shipmentData.trackingNumber}
      </a></p>
      <p>Thank you for choosing TOLLOE EXPRESS!</p>
    </div>
  `;

  await Promise.all([
    sendEmail(user.email, subject, html),
    prisma.notification.create({
      data: { userId, channel: 'EMAIL', subject, body: html, status: 'SENT', sentAt: new Date() },
    }),
  ]);

  // SMS notification
  if (user.phone) {
    await sendSMS(user.phone, `TOLLOE EXPRESS: Your shipment ${shipmentData.trackingNumber} has been booked. Total: ${shipmentData.totalPrice} ETB`);
  }
}
