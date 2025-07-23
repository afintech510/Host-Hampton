import { MailService } from '@sendgrid/mail';
import { storage } from './storage';
import type { InsertCommunication } from '@shared/schema';

// Initialize SendGrid
let mailService: MailService | null = null;
if (process.env.SENDGRID_API_KEY) {
  mailService = new MailService();
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

// TODO: Initialize Twilio for SMS when API keys are provided
// import twilio from 'twilio';
// let twilioClient: twilio.Twilio | null = null;

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
  customerId: number;
  eventId?: number;
}

interface SMSParams {
  to: string;
  from: string;
  body: string;
  customerId: number;
  eventId?: number;
}

export class CommunicationService {
  
  async sendEmail(params: EmailParams): Promise<boolean> {
    if (!mailService) {
      console.error('SendGrid not configured - SENDGRID_API_KEY missing');
      return false;
    }

    try {
      const msg = {
        to: params.to,
        from: params.from,
        subject: params.subject,
        ...(params.html ? { html: params.html } : {}),
        ...(params.text ? { text: params.text } : {}),
      };

      const response = await mailService.send(msg);
      
      // Log communication in database
      const communication: InsertCommunication = {
        customerId: params.customerId,
        eventId: params.eventId,
        type: 'email',
        direction: 'outbound',
        subject: params.subject,
        content: params.html || params.text || '',
        status: 'sent',
        provider: 'sendgrid',
        externalId: response[0].headers['x-message-id'] as string,
      };
      
      await storage.createCommunication(communication);
      console.log(`Email sent successfully to ${params.to}`);
      return true;
      
    } catch (error) {
      console.error('SendGrid email error:', error);
      
      // Log failed communication
      const communication: InsertCommunication = {
        customerId: params.customerId,
        eventId: params.eventId,
        type: 'email',
        direction: 'outbound',
        subject: params.subject,
        content: params.html || params.text || '',
        status: 'failed',
        provider: 'sendgrid',
      };
      
      await storage.createCommunication(communication);
      return false;
    }
  }

  async sendSMS(params: SMSParams): Promise<boolean> {
    // TODO: Implement Twilio SMS when API keys are provided
    console.log('SMS service not yet configured - TWILIO credentials needed');
    
    // Log communication attempt in database
    const communication: InsertCommunication = {
      customerId: params.customerId,
      eventId: params.eventId,
      type: 'sms',
      direction: 'outbound',
      content: params.body,
      status: 'failed',
      provider: 'twilio',
    };
    
    await storage.createCommunication(communication);
    return false;
  }

  // Email templates for common scenarios
  async sendBookingConfirmation(customerId: number, eventId: number, customerEmail: string, eventDetails: any): Promise<boolean> {
    const subject = `Booking Confirmation - ${eventDetails.eventType}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: hsl(155,40%,25%);">Booking Confirmation</h2>
        <p>Thank you for booking with Host Hampton!</p>
        
        <div style="background: hsl(15,40%,95%); padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3>Event Details:</h3>
          <p><strong>Event Type:</strong> ${eventDetails.eventType}</p>
          <p><strong>Date:</strong> ${eventDetails.date}</p>
          <p><strong>Guest Count:</strong> ${eventDetails.guestCount}</p>
          <p><strong>Status:</strong> ${eventDetails.status}</p>
        </div>
        
        <p>We'll be in touch soon with more details about your event!</p>
        <p>Best regards,<br>The Host Hampton Team</p>
      </div>
    `;

    return this.sendEmail({
      to: customerEmail,
      from: 'events@hosthampton.com',
      subject,
      html,
      customerId,
      eventId,
    });
  }

  async sendPaymentReminder(customerId: number, eventId: number, customerEmail: string, invoiceDetails: any): Promise<boolean> {
    const subject = `Payment Reminder - ${invoiceDetails.eventType}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: hsl(155,40%,25%);">Payment Reminder</h2>
        <p>This is a friendly reminder about your upcoming event payment.</p>
        
        <div style="background: hsl(15,40%,95%); padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3>Invoice Details:</h3>
          <p><strong>Total Amount:</strong> $${(invoiceDetails.total / 100).toFixed(2)}</p>
          <p><strong>Balance Due:</strong> $${(invoiceDetails.balanceDue / 100).toFixed(2)}</p>
          <p><strong>Event Date:</strong> ${invoiceDetails.eventDate}</p>
        </div>
        
        <p>Please contact us to complete your payment: (631) 998-9325</p>
        <p>Best regards,<br>The Host Hampton Team</p>
      </div>
    `;

    return this.sendEmail({
      to: customerEmail,
      from: 'billing@hosthampton.com',
      subject,
      html,
      customerId,
      eventId,
    });
  }

  async sendEventReminder(customerId: number, eventId: number, customerEmail: string, eventDetails: any): Promise<boolean> {
    const subject = `Event Reminder - Tomorrow is your special day!`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: hsl(155,40%,25%);">Your Event is Tomorrow!</h2>
        <p>We're excited to celebrate with you tomorrow!</p>
        
        <div style="background: hsl(15,40%,95%); padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3>Event Details:</h3>
          <p><strong>Event:</strong> ${eventDetails.eventType}</p>
          <p><strong>Date:</strong> ${eventDetails.date}</p>
          <p><strong>Time:</strong> ${eventDetails.time}</p>
          <p><strong>Location:</strong> 295 Montauk Hwy, Speonk, NY 11972</p>
        </div>
        
        <p>If you have any last-minute questions, please call us at (631) 998-9325</p>
        <p>See you tomorrow!<br>The Host Hampton Team</p>
      </div>
    `;

    return this.sendEmail({
      to: customerEmail,
      from: 'events@hosthampton.com',
      subject,
      html,
      customerId,
      eventId,
    });
  }
}

export const communicationService = new CommunicationService();