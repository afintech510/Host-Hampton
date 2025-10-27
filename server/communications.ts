import { storage } from './storage';
import type { InsertCommunication } from '@shared/schema';
import { sendEmail as resendSendEmail } from './email-service';

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
    try {
      const result = await resendSendEmail({
        to: params.to,
        from: params.from,
        subject: params.subject,
        html: params.html,
        text: params.text
      });

      if (!result.success) {
        console.error('Email send failed:', result.error);
        
        // Log failed communication
        const communication: InsertCommunication = {
          customerId: params.customerId,
          eventId: params.eventId,
          type: 'email',
          direction: 'outbound',
          subject: params.subject,
          content: `[FAILED: ${result.error}] ${params.html || params.text || ''}`,
          status: 'failed',
          provider: 'resend',
        };
        
        await storage.createCommunication(communication);
        return false;
      }
      
      // Log communication in database
      const communication: InsertCommunication = {
        customerId: params.customerId,
        eventId: params.eventId,
        type: 'email',
        direction: 'outbound',
        subject: params.subject,
        content: params.html || params.text || '',
        status: 'sent',
        provider: 'resend',
        externalId: result.messageId,
      };
      
      await storage.createCommunication(communication);
      console.log(`Email sent successfully to ${params.to}`);
      return true;
      
    } catch (error) {
      console.error('Email error:', error);
      
      // Log failed communication
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      const communication: InsertCommunication = {
        customerId: params.customerId,
        eventId: params.eventId,
        type: 'email',
        direction: 'outbound',
        subject: params.subject,
        content: `[ERROR: ${errorMsg}] ${params.html || params.text || ''}`,
        status: 'failed',
        provider: 'resend',
      };
      
      await storage.createCommunication(communication);
      return false;
    }
  }

  async sendSMS(params: SMSParams): Promise<boolean> {
    // TODO: Implement Twilio SMS when credentials are available
    console.log('SMS functionality not yet implemented');
    
    // Log attempted communication
    const communication: InsertCommunication = {
      customerId: params.customerId,
      eventId: params.eventId,
      type: 'sms',
      direction: 'outbound',
      subject: 'SMS Message',
      content: `[NOT CONFIGURED] ${params.body}`,
      status: 'failed',
      provider: 'twilio',
    };
    
    await storage.createCommunication(communication);
    return false;
  }

  async logInboundEmail(params: {
    customerId: number;
    eventId?: number;
    subject: string;
    content: string;
    externalId?: string;
  }): Promise<void> {
    const communication: InsertCommunication = {
      customerId: params.customerId,
      eventId: params.eventId,
      type: 'email',
      direction: 'inbound',
      subject: params.subject,
      content: params.content,
      status: 'received',
      provider: 'resend',
      externalId: params.externalId,
    };
    
    await storage.createCommunication(communication);
  }

  async logInboundSMS(params: {
    customerId: number;
    eventId?: number;
    content: string;
    externalId?: string;
  }): Promise<void> {
    const communication: InsertCommunication = {
      customerId: params.customerId,
      eventId: params.eventId,
      type: 'sms',
      direction: 'inbound',
      subject: 'SMS Message',
      content: params.content,
      status: 'received',
      provider: 'twilio',
      externalId: params.externalId,
    };
    
    await storage.createCommunication(communication);
  }

  async getCommunicationsForCustomer(customerId: number) {
    // TODO: Implement when storage method is added
    console.log('getCommunicationsForCustomer not yet implemented');
    return [];
  }

  async getCommunicationsForEvent(eventId: number) {
    // TODO: Implement when storage method is added
    console.log('getCommunicationsForEvent not yet implemented');
    return [];
  }

  async getAllCommunications() {
    // TODO: Implement when storage method is added
    console.log('getAllCommunications not yet implemented');
    return [];
  }

  async updateCommunicationStatus(
    id: number, 
    status: 'sent' | 'failed' | 'received' | 'bounced'
  ): Promise<void> {
    // TODO: Implement when storage method is added
    console.log('updateCommunicationStatus not yet implemented');
  }
}

export const communicationService = new CommunicationService();
