import 'dotenv/config';

import twilio from 'twilio';

// --------------------------------------------------------
// Twilio Interfaces (Shape matching real Twilio API)
// --------------------------------------------------------

/**
 * Shape of the payload Twilio sends to our webhook on incoming messages.
 * Note: Twilio sends application/x-www-form-urlencoded, so keys are capitalized.
 */
export interface TwilioIncomingWebhook {
  MessageSid: string;
  SmsSid: string;
  AccountSid: string;
  MessagingServiceSid?: string;
  From: string; // e.g., 'whatsapp:+15005550006'
  To: string;   // e.g., 'whatsapp:+14155238886'
  Body: string;
  NumMedia: string;
  ProfileName?: string;
}

/**
 * Standardized internal message format so our LangGraph agent
 * doesn't need to care about Twilio-specific fields.
 */
export interface StandardizedMessage {
  messageId: string;
  senderPhone: string; // Cleaned phone without 'whatsapp:' prefix
  recipientPhone: string;
  text: string;
  senderProfileName?: string;
}

/**
 * Shape of the options for sending a message via Twilio API.
 */
export interface TwilioSendMessageOptions {
  from: string;
  to: string;
  body: string;
}

// --------------------------------------------------------
// WhatsApp Adapter (Twilio REST API)
// --------------------------------------------------------

export class WhatsAppAdapter {
  private twilioAccountSid: string;
  private twilioAuthToken: string;
  private twilioWhatsAppNumber: string;
  private client: twilio.Twilio | null = null;

  constructor(accountSid?: string, authToken?: string, whatsAppNumber?: string) {
    this.twilioAccountSid = accountSid || process.env.TWILIO_ACCOUNT_SID || '';
    this.twilioAuthToken = authToken || process.env.TWILIO_AUTH_TOKEN || '';
    this.twilioWhatsAppNumber = whatsAppNumber || process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';
  }

  private isConfigured(): boolean {
    return this.twilioAccountSid.startsWith('AC') && this.twilioAuthToken.length > 0;
  }

  private getClient(): twilio.Twilio {
    if (!this.client) {
      this.client = twilio(this.twilioAccountSid, this.twilioAuthToken);
    }
    return this.client;
  }

  /**
   * Send a real message using Twilio's API.
   */
  async sendMessage(to: string, message: string): Promise<{ sid: string; status: string }> {
    const fromNumber = this.twilioWhatsAppNumber.startsWith('whatsapp:') 
      ? this.twilioWhatsAppNumber 
      : `whatsapp:${this.twilioWhatsAppNumber}`;
      
    const toNumber = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

    console.log(`\n[Twilio] Sending WhatsApp Message:`);
    console.log(`[Twilio] From: ${fromNumber} | To: ${toNumber}`);
    console.log(`[Twilio] Body: "${message}"`);

    try {
      // If Twilio isn't configured, simulate success (mock mode)
      if (!this.isConfigured()) {
        console.log(`[Twilio Mock] Simulating send (no valid credentials configured).`);
        await new Promise((resolve) => setTimeout(resolve, 300));
        return { sid: `SM${Math.random().toString(36).substring(2, 15)}`, status: 'queued' };
      }

      const response = await this.getClient().messages.create({
        from: fromNumber,
        to: toNumber,
        body: message,
      });

      console.log(`[Twilio] Sent! SID: ${response.sid}`);
      return {
        sid: response.sid,
        status: response.status,
      };
    } catch (error) {
      console.error('[Twilio Error] Failed to send message:', error);
      throw error;
    }
  }

  /**
   * Parses an incoming Twilio webhook payload into a clean, standardized format
   * for our internal agents to process.
   */
  static parseIncomingWebhook(body: TwilioIncomingWebhook | Record<string, any>): StandardizedMessage {
    console.log('[Webhook Debug] Raw incoming body:', body);
    const cleanPhone = (phoneStr?: string) => (phoneStr || '').replace('whatsapp:', '');

    return {
      messageId: body.MessageSid || `mock_${Date.now()}`,
      senderPhone: cleanPhone(body.From as string),
      recipientPhone: cleanPhone(body.To as string),
      text: body.Body || '',
      senderProfileName: body.ProfileName as string,
    };
  }
}

// Export a default instance for system-level notifications if needed
export const defaultWhatsAppAdapter = new WhatsAppAdapter();
