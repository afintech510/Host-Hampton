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
        <p>Best regards,<br>The Host Hampton Team<br>hosthampton295@gmail.com</p>
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
        <p>Ready to book? Reply to this email or call us at 631-998-9325.</p>
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
        <p>Questions? Contact us anytime at hosthampton295@gmail.com</p>
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
        <p>Best regards,<br>{{senderName}}<br>Host Hampton Events<br>hosthampton295@gmail.com</p>
      </div>
    `,
    variables: ['customerName', 'eventType', 'eventDate', 'availabilityDays', 'senderName']
  },
  order_confirmation: {
    id: 'order_confirmation',
    name: 'Order Confirmation',
    subject: '🎉 Order Confirmed - Your Host Hampton Experience Awaits!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation - Host Hampton</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
            <div style="background-color: white; display: inline-block; padding: 15px 25px; border-radius: 50px; margin-bottom: 20px;">
              <h1 style="margin: 0; color: #667eea; font-size: 24px; font-weight: bold;">HOST HAMPTON</h1>
            </div>
            <h2 style="color: white; margin: 0; font-size: 28px; font-weight: 300;">Order Confirmed!</h2>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">Thank you \${customerName}, your magical experience is booked! ✨</p>
          </div>
          
          <!-- Order Summary -->
          <div style="padding: 30px;">
            <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 25px; border-radius: 12px; margin-bottom: 30px;">
              <h3 style="color: white; margin: 0 0 15px; font-size: 20px;">Order Summary</h3>
              <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
                <p style="color: white; margin: 5px 0; font-size: 16px;"><strong>Order ID:</strong> #\${orderId}</p>
                <p style="color: white; margin: 5px 0; font-size: 16px;"><strong>Order Date:</strong> \${orderDate}</p>
                <p style="color: white; margin: 5px 0; font-size: 18px; font-weight: bold;"><strong>Total Paid:</strong> $\${totalAmount}</p>
              </div>
            </div>
            
            <!-- Items Ordered -->
            <div style="margin-bottom: 30px;">
              <h3 style="color: #2d3748; margin: 0 0 20px; font-size: 22px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Your Events & Experiences</h3>
              \${orderItems.map(item => \`
                <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 15px; background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); position: relative; overflow: hidden;">
                  <div style="position: absolute; top: -50%; right: -50%; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%; transform: rotate(45deg);"></div>
                  <div style="position: relative; z-index: 1;">
                    <h4 style="color: #2d3748; margin: 0 0 10px; font-size: 18px; font-weight: bold;">\${item.product?.name || 'Event Experience'}</h4>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                      <span style="background: rgba(255,255,255,0.8); padding: 5px 12px; border-radius: 20px; font-size: 14px; color: #4a5568;">
                        Qty: \${item.quantity} | $\${(item.price / 100).toFixed(2)} each
                      </span>
                      <span style="background: #48bb78; color: white; padding: 5px 12px; border-radius: 20px; font-weight: bold; font-size: 14px;">
                        $\${((item.price * item.quantity) / 100).toFixed(2)}
                      </span>
                    </div>
                    \${item.sessionInfo ? \`
                      <div style="background: rgba(102, 126, 234, 0.1); border: 1px solid rgba(102, 126, 234, 0.3); padding: 12px; border-radius: 8px; margin-top: 10px;">
                        <p style="margin: 0; color: #4c51bf; font-weight: bold; font-size: 14px;">📅 Session Details</p>
                        <p style="margin: 5px 0 0; color: #553c9a; font-size: 14px;">\${item.sessionInfo}</p>
                      </div>
                    \` : ''}
                    \${item.product?.eventDate && !item.sessionInfo ? \`
                      <div style="background: rgba(72, 187, 120, 0.1); border: 1px solid rgba(72, 187, 120, 0.3); padding: 12px; border-radius: 8px; margin-top: 10px;">
                        <p style="margin: 0; color: #2f855a; font-weight: bold; font-size: 14px;">📅 Event Date</p>
                        <p style="margin: 5px 0 0; color: #276749; font-size: 14px;">\${new Date(item.product.eventDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      </div>
                    \` : ''}
                  </div>
                </div>
              \`).join('')}
            </div>
            
            <!-- What's Next -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 12px; margin-bottom: 30px;">
              <h3 style="color: white; margin: 0 0 15px; font-size: 20px;">🚀 What Happens Next?</h3>
              <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px;">
                <ul style="color: white; margin: 0; padding-left: 20px; line-height: 1.6;">
                  <li style="margin-bottom: 8px;">📧 You'll receive event details and instructions 1 week before your scheduled date</li>
                  <li style="margin-bottom: 8px;">📞 Our team will contact you to confirm final arrangements and answer any questions</li>
                  <li style="margin-bottom: 8px;">⏰ Please arrive 15 minutes early on your event day for check-in</li>
                  <li style="margin-bottom: 8px;">🎉 Get ready for an amazing, unforgettable experience!</li>
                </ul>
              </div>
            </div>
            
            <!-- Contact Info -->
            <div style="text-align: center; padding: 20px; background: #f7fafc; border-radius: 12px;">
              <h3 style="color: #2d3748; margin: 0 0 15px; font-size: 18px;">Need Help? We're Here for You!</h3>
              <p style="color: #4a5568; margin: 0 0 10px; font-size: 16px;">
                📧 <a href="mailto:hosthampton295@gmail.com" style="color: #667eea; text-decoration: none;">hosthampton295@gmail.com</a>
              </p>
              <p style="color: #4a5568; margin: 0 0 15px; font-size: 16px;">
                📞 <a href="tel:631-998-9325" style="color: #667eea; text-decoration: none;">631-998-9325</a>
              </p>
              <p style="color: #718096; margin: 0; font-size: 14px; font-style: italic;">
                Follow us on social media for event inspiration and behind-the-scenes content!
              </p>
            </div>
            
          </div>
          
          <!-- Footer -->
          <div style="background: #2d3748; padding: 25px; text-align: center;">
            <p style="color: #cbd5e0; margin: 0 0 10px; font-size: 16px; font-weight: bold;">Thank you for choosing Host Hampton!</p>
            <p style="color: #a0aec0; margin: 0; font-size: 14px;">Creating magical moments, one event at a time ✨</p>
          </div>
        </div>
      </body>
      </html>
    `,
    variables: ['customerName', 'orderId', 'orderDate', 'totalAmount', 'orderItems']
  },
  business_order_notification: {
    id: 'business_order_notification',
    name: 'New Order Notification (Business)',
    subject: '🛍️ New Order Alert - Host Hampton Order #${orderId}',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Order - Host Hampton</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">🛍️ NEW ORDER RECEIVED</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">Order #\${orderId} requires your attention</p>
          </div>
          
          <!-- Customer Info -->
          <div style="padding: 30px;">
            <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 20px; border-radius: 12px; margin-bottom: 25px;">
              <h3 style="color: white; margin: 0 0 15px; font-size: 18px;">👤 Customer Details</h3>
              <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px;">
                <p style="color: white; margin: 5px 0; font-size: 16px;"><strong>Name:</strong> \${customerName}</p>
                <p style="color: white; margin: 5px 0; font-size: 16px;"><strong>Email:</strong> \${customerEmail}</p>
                <p style="color: white; margin: 5px 0; font-size: 16px;"><strong>Phone:</strong> \${customerPhone}</p>
                <p style="color: white; margin: 5px 0; font-size: 16px;"><strong>Order Date:</strong> \${orderDate}</p>
              </div>
            </div>
            
            <!-- Order Summary -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 12px; margin-bottom: 25px;">
              <h3 style="color: white; margin: 0 0 15px; font-size: 18px;">📊 Order Summary</h3>
              <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px;">
                <p style="color: white; margin: 5px 0; font-size: 18px; font-weight: bold;">Total Revenue: $\${totalAmount}</p>
                <p style="color: white; margin: 5px 0; font-size: 14px;">Payment Status: Completed ✅</p>
              </div>
            </div>
            
            <!-- Items Ordered -->
            <div style="margin-bottom: 25px;">
              <h3 style="color: #2d3748; margin: 0 0 20px; font-size: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">🎯 Items Purchased</h3>
              \${orderItems.map(item => \`
                <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 12px; background: #f7fafc;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="flex: 1;">
                      <h4 style="color: #2d3748; margin: 0 0 8px; font-size: 16px; font-weight: bold;">\${item.product?.name || 'Event Experience'}</h4>
                      <p style="color: #4a5568; margin: 0; font-size: 14px;">Quantity: \${item.quantity} × $\${(item.price / 100).toFixed(2)}</p>
                      \${item.sessionInfo ? \`
                        <div style="background: #edf2f7; padding: 8px; border-radius: 4px; margin-top: 8px;">
                          <p style="margin: 0; color: #2d3748; font-size: 13px;"><strong>📅 Session:</strong> \${item.sessionInfo}</p>
                        </div>
                      \` : ''}
                    </div>
                    <div style="text-align: right;">
                      <span style="background: #48bb78; color: white; padding: 5px 10px; border-radius: 6px; font-weight: bold; font-size: 14px;">
                        $\${((item.price * item.quantity) / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              \`).join('')}
            </div>
            
            <!-- Next Steps -->
            <div style="background: #fff5f5; border: 1px solid #fed7d7; padding: 20px; border-radius: 8px;">
              <h3 style="color: #c53030; margin: 0 0 15px; font-size: 16px;">⚡ Action Required</h3>
              <ul style="color: #742a2a; margin: 0; padding-left: 20px; line-height: 1.6;">
                <li>Review customer details and contact information</li>
                <li>Confirm event dates and session availability</li>
                <li>Prepare any necessary materials or setup requirements</li>
                <li>Contact customer within 24 hours if needed</li>
              </ul>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background: #2d3748; padding: 20px; text-align: center;">
            <p style="color: #cbd5e0; margin: 0; font-size: 14px;">Host Hampton Business Dashboard</p>
          </div>
        </div>
      </body>
      </html>
    `,
    variables: ['orderId', 'customerName', 'customerEmail', 'customerPhone', 'orderDate', 'totalAmount', 'orderItems']
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

    const msg: any = {
      to: params.to,
      from: {
        email: params.from || 'hosthampton295@gmail.com',
        name: 'Host Hampton'
      },
      subject: params.subject,
    };

    if (params.templateId) {
      msg.templateId = params.templateId;
      msg.dynamicTemplateData = params.dynamicTemplateData;
    } else {
      if (params.html) {
        msg.html = params.html;
      }
      if (params.text) {
        msg.text = params.text;
      }
    }

    const [response] = await sgMail.send(msg);
    
    return {
      success: true,
      messageId: response.headers['x-message-id'] as string
    };
  } catch (error: any) {
    console.error('SendGrid email error:', error);
    
    // Log more detailed error information
    if (error.response) {
      console.error('SendGrid response status:', error.response.status);
      console.error('SendGrid response body:', error.response.body);
    }
    
    return {
      success: false,
      error: error.response?.body?.errors?.[0]?.message || error.message || 'Failed to send email'
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
    // Handle both {{variable}} and ${variable} syntax
    const regexCurly = new RegExp(`{{${key}}}`, 'g');
    const regexDollar = new RegExp(`\\$\\{${key}\\}`, 'g');
    
    html = html.replace(regexCurly, String(value));
    html = html.replace(regexDollar, String(value));
    subject = subject.replace(regexCurly, String(value));
    subject = subject.replace(regexDollar, String(value));
  }

  return sendEmail({
    to,
    from: from || 'hosthampton295@gmail.com',
    subject,
    html
  });
}

export async function getEmailTemplates(): Promise<EmailTemplate[]> {
  return Object.values(EMAIL_TEMPLATES);
}