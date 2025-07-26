import sgMail from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  console.warn("SENDGRID_API_KEY not found. Email functionality will be disabled.");
}

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

interface EmailParams {
  to: string;
  from?: string;
  subject: string;
  text?: string;
  html?: string;
  templateId?: string;
  dynamicTemplateData?: any;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html: string;
  variables: string[];
}

// Email templates for common communications
export const EMAIL_TEMPLATES: { [key: string]: EmailTemplate } = {
  lead_welcome: {
    id: 'lead_welcome',
    name: 'Welcome & Initial Contact',
    subject: 'Thank you for your interest in Host Hampton!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <img src="https://hosthampton.com/logo.png" alt="Host Hampton" style="width: 200px; margin-bottom: 20px;">
        <h2>Hi {{customerName}},</h2>
        <p>Thank you for reaching out about your upcoming {{eventType}}! We're excited to help make your event magical.</p>
        <p><strong>Event Details:</strong></p>
        <ul>
          <li>Date: {{eventDate}}</li>
          <li>Time: {{eventTime}}</li>
          <li>Guest Count: {{guestCount}}</li>
        </ul>
        <p>We'll be in touch within 24 hours with a personalized quote and availability confirmation.</p>
        <p>In the meantime, feel free to browse our gallery at <a href="https://hosthampton.com">hosthampton.com</a></p>
        <p>Best regards,<br>The Host Hampton Team<br>events@hosthampton.com</p>
      </div>
    `,
    variables: ['customerName', 'eventType', 'eventDate', 'eventTime', 'guestCount']
  },
  quote_sent: {
    id: 'quote_sent',
    name: 'Quote Sent',
    subject: 'Your personalized quote from Host Hampton',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hi {{customerName}},</h2>
        <p>We've prepared a personalized quote for your {{eventType}}:</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Quote Summary</h3>
          <p><strong>Event Date:</strong> {{eventDate}}</p>
          <p><strong>Time:</strong> {{eventTime}}</p>
          <p><strong>Estimated Total:</strong> $\{{totalAmount}}</p>
          <p><strong>Deposit Required:</strong> $\{{depositAmount}}</p>
        </div>
        <p>This quote is valid for 7 days. To secure your date, we require a 50% deposit.</p>
        <p>Ready to book? Reply to this email or call us at (757) 123-4567.</p>
        <p>Best regards,<br>The Host Hampton Team</p>
      </div>
    `,
    variables: ['customerName', 'eventType', 'eventDate', 'eventTime', 'totalAmount', 'depositAmount']
  },
  booking_confirmed: {
    id: 'booking_confirmed',
    name: 'Booking Confirmed',
    subject: 'Your event is confirmed! 🎉',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Congratulations {{customerName}}!</h2>
        <p>Your {{eventType}} is officially confirmed! We can't wait to help you celebrate.</p>
        <div style="background: #e6f7ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Event Confirmation</h3>
          <p><strong>Event ID:</strong> #{{eventId}}</p>
          <p><strong>Date:</strong> {{eventDate}}</p>
          <p><strong>Time:</strong> {{eventTime}}</p>
          <p><strong>Venue:</strong> Host Hampton</p>
        </div>
        <p><strong>Next Steps:</strong></p>
        <ul>
          <li>We'll contact you 1 week before your event to confirm final details</li>
          <li>Balance payment is due 48 hours before your event</li>
          <li>Our team will arrive 30 minutes early for setup</li>
        </ul>
        <p>Questions? Contact us anytime at events@hosthampton.com</p>
        <p>Best regards,<br>The Host Hampton Team</p>
      </div>
    `,
    variables: ['customerName', 'eventType', 'eventDate', 'eventTime', 'eventId']
  },
  follow_up: {
    id: 'follow_up',
    name: 'Follow Up',
    subject: 'Following up on your Host Hampton inquiry',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hi {{customerName}},</h2>
        <p>I wanted to follow up on your inquiry about your {{eventType}} on {{eventDate}}.</p>
        <p>We'd love to help make your event special! Are you still looking for a venue and party planning services?</p>
        <p>Here's what makes Host Hampton different:</p>
        <ul>
          <li>✨ Completely customized themes and decorations</li>
          <li>🎪 Professional setup and cleanup included</li>
          <li>📸 Beautiful, Instagram-worthy moments guaranteed</li>
          <li>👥 Experienced team handles every detail</li>
        </ul>
        <p>Would you like to schedule a quick call to discuss your vision? I'm available {{availabilityDays}}.</p>
        <p>Best regards,<br>{{senderName}}<br>Host Hampton Events<br>events@hosthampton.com</p>
      </div>
    `,
    variables: ['customerName', 'eventType', 'eventDate', 'availabilityDays', 'senderName']
  }
};

export async function sendEmail(params: EmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      return {
        success: false,
        error: "SendGrid API key not configured"
      };
    }

    const msg = {
      to: params.to,
      from: params.from || 'events@hosthampton.com', // Default from address
      subject: params.subject,
      text: params.text,
      html: params.html,
      ...(params.templateId && {
        templateId: params.templateId,
        dynamicTemplateData: params.dynamicTemplateData
      })
    };

    const [response] = await sgMail.send(msg);
    
    return {
      success: true,
      messageId: response.headers['x-message-id'] as string
    };
  } catch (error: any) {
    console.error('SendGrid email error:', error);
    return {
      success: false,
      error: error.message || 'Failed to send email'
    };
  }
}

export async function sendTemplateEmail(
  templateId: string, 
  to: string, 
  templateData: any,
  from?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const template = EMAIL_TEMPLATES[templateId];
  if (!template) {
    return {
      success: false,
      error: `Template ${templateId} not found`
    };
  }

  // Replace template variables in HTML
  let html = template.html;
  let subject = template.subject;
  
  for (const [key, value] of Object.entries(templateData)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    html = html.replace(regex, String(value));
    subject = subject.replace(regex, String(value));
  }

  return sendEmail({
    to,
    from: from || 'events@hosthampton.com',
    subject,
    html
  });
}

export async function getEmailTemplates(): Promise<EmailTemplate[]> {
  return Object.values(EMAIL_TEMPLATES);
}