import type { Response } from 'express';
import { prisma } from '../lib/prisma';
import { createError } from '../middleware/errorHandler';
import { format } from 'date-fns';

// Generates an HTML invoice and streams it as PDF-ready HTML.
// For true PDF: swap this with puppeteer or pdfkit in production.
export async function streamInvoice(shipmentId: string, res: Response) {
  const shipment = await prisma.shipment.findUnique({
    where: { id: shipmentId },
    include: {
      sender: { include: { profile: true } },
      recipient: { include: { profile: true } },
      pickupAddress: true,
      deliveryAddress: true,
      payment: true,
      trackingEvents: { orderBy: { timestamp: 'asc' } },
    },
  });

  if (!shipment) throw createError('Shipment not found', 404);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Invoice ${shipment.trackingNumber}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 13px; color: #1f2937; padding: 40px; max-width: 800px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 2px solid #E85D04; }
    .logo { font-size: 24px; font-weight: bold; color: #1f2937; }
    .logo span { color: #E85D04; }
    .invoice-meta { text-align: right; }
    .invoice-meta h1 { font-size: 28px; color: #E85D04; }
    .invoice-meta p { color: #6b7280; font-size: 12px; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
    .section-title { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #9ca3af; font-weight: 600; margin-bottom: 8px; }
    .info-block p { margin-bottom: 2px; font-size: 13px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    thead { background: #f9fafb; }
    th { text-align: left; padding: 10px 12px; font-size: 11px; text-transform: uppercase; color: #6b7280; letter-spacing: 0.05em; border-bottom: 1px solid #e5e7eb; }
    td { padding: 10px 12px; border-bottom: 1px solid #f3f4f6; }
    .total-row td { font-weight: bold; font-size: 16px; border-top: 2px solid #e5e7eb; }
    .total-row .amount { color: #E85D04; }
    .status { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; background: #dcfce7; color: #16a34a; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">TOLLOE <span>EXPRESS</span></div>
      <p style="color:#6b7280;font-size:12px;margin-top:4px;">Bole Road, Addis Ababa, Ethiopia</p>
      <p style="color:#6b7280;font-size:12px;">+251 911 000 000 · info@toloeexpress.com</p>
    </div>
    <div class="invoice-meta">
      <h1>INVOICE</h1>
      <p style="margin-top:8px;font-weight:600;color:#1f2937;">${shipment.trackingNumber}</p>
      <p>Date: ${format(shipment.createdAt, 'MMM dd, yyyy')}</p>
      <p style="margin-top:4px;"><span class="status">PAID</span></p>
    </div>
  </div>

  <div class="grid-2">
    <div>
      <p class="section-title">From (Sender)</p>
      <div class="info-block">
        <p><strong>${shipment.sender.profile?.firstName || ''} ${shipment.sender.profile?.lastName || ''}</strong></p>
        <p>${shipment.sender.email}</p>
        <p>${shipment.pickupAddress.street}</p>
        <p>${shipment.pickupAddress.city}, ${shipment.pickupAddress.region}</p>
      </div>
    </div>
    <div>
      <p class="section-title">To (Recipient)</p>
      <div class="info-block">
        <p><strong>${shipment.recipient.profile?.firstName || ''} ${shipment.recipient.profile?.lastName || ''}</strong></p>
        <p>${shipment.recipient.email}</p>
        <p>${shipment.deliveryAddress.street}</p>
        <p>${shipment.deliveryAddress.city}, ${shipment.deliveryAddress.region}</p>
      </div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th>Details</th>
        <th style="text-align:right;">Amount (ETB)</th>
      </tr>
    </thead>
    <tbody>
      <tr><td>${shipment.serviceType.replace('_', ' ')} Delivery</td><td>Tracking: ${shipment.trackingNumber}</td><td style="text-align:right;">${Number(shipment.totalPrice).toFixed(2)}</td></tr>
      <tr><td>Weight</td><td>${Number(shipment.weight)} kg</td><td style="text-align:right;">—</td></tr>
      ${shipment.isCOD ? `<tr><td>COD Service</td><td>Cash on Delivery</td><td style="text-align:right;">30.00</td></tr>` : ''}
    </tbody>
    <tfoot>
      <tr class="total-row">
        <td colspan="2">Total</td>
        <td style="text-align:right;" class="amount">${Number(shipment.totalPrice).toFixed(2)} ETB</td>
      </tr>
    </tfoot>
  </table>

  <div class="grid-2">
    <div>
      <p class="section-title">Payment Details</p>
      <div class="info-block">
        <p>Method: ${shipment.payment?.method || 'CASH'}</p>
        <p>Status: ${shipment.payment?.status || 'PENDING'}</p>
        ${shipment.payment?.transactionRef ? `<p>Ref: ${shipment.payment.transactionRef}</p>` : ''}
      </div>
    </div>
    <div>
      <p class="section-title">Shipment Status</p>
      <div class="info-block">
        <p>Current: ${shipment.status.replace(/_/g, ' ')}</p>
        ${shipment.actualDelivery ? `<p>Delivered: ${format(shipment.actualDelivery, 'MMM dd, yyyy HH:mm')}</p>` : ''}
        ${shipment.estimatedDelivery ? `<p>Est. Delivery: ${format(shipment.estimatedDelivery, 'MMM dd, yyyy')}</p>` : ''}
      </div>
    </div>
  </div>

  <div class="footer">
    <p>Thank you for choosing TOLLOE EXPRESS!</p>
    <p style="margin-top:4px;">Track your shipment at toloeexpress.com/track/${shipment.trackingNumber}</p>
    <p style="margin-top:4px;">Reg. No: ETH-BUS-2020-04521 · ETA-CRL-2021-0089</p>
  </div>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Content-Disposition', `attachment; filename="invoice-${shipment.trackingNumber}.html"`);
  res.send(html);
}
