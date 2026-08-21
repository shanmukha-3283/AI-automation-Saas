import 'dotenv/config';
import twilio from 'twilio';
// --------------------------------------------------------
// WhatsApp Adapter (Twilio REST API)
// --------------------------------------------------------
export class WhatsAppAdapter {
    twilioAccountSid;
    twilioAuthToken;
    twilioWhatsAppNumber;
    client = null;
    constructor(accountSid, authToken, whatsAppNumber) {
        this.twilioAccountSid = accountSid || process.env.TWILIO_ACCOUNT_SID || '';
        this.twilioAuthToken = authToken || process.env.TWILIO_AUTH_TOKEN || '';
        this.twilioWhatsAppNumber = whatsAppNumber || process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';
    }
    isConfigured() {
        return this.twilioAccountSid.startsWith('AC') && this.twilioAuthToken.length > 0;
    }
    getClient() {
        if (!this.client) {
            this.client = twilio(this.twilioAccountSid, this.twilioAuthToken);
        }
        return this.client;
    }
    /**
     * Send a real message using Twilio's API.
     */
    async sendMessage(to, message) {
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
        }
        catch (error) {
            console.error('[Twilio Error] Failed to send message:', error);
            throw error;
        }
    }
    /**
     * Parses an incoming Twilio webhook payload into a clean, standardized format
     * for our internal agents to process.
     */
    static parseIncomingWebhook(body) {
        console.log('[Webhook Debug] Raw incoming body:', body);
        const cleanPhone = (phoneStr) => (phoneStr || '').replace('whatsapp:', '');
        return {
            messageId: body.MessageSid || `mock_${Date.now()}`,
            senderPhone: cleanPhone(body.From),
            recipientPhone: cleanPhone(body.To),
            text: body.Body || '',
            senderProfileName: body.ProfileName,
        };
    }
}
// Export a default instance for system-level notifications if needed
export const defaultWhatsAppAdapter = new WhatsAppAdapter();
