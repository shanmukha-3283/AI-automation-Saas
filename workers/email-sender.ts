/**
 * Mock Email Sender implementation for Step 5.
 * This simulates sending an email to a lead.
 */
export async function sendEmail(to: string, subject: string, body: string): Promise<boolean> {
  console.log(`\n[EMAIL MOCK] Preparing to send email to: ${to}`);
  console.log(`[EMAIL MOCK] Subject: ${subject}`);
  
  // Simulate network delay (500ms to 2000ms)
  const delay = Math.floor(Math.random() * 1500) + 500;
  
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`[EMAIL MOCK] Successfully sent email to ${to} (simulated delay: ${delay}ms)`);
      resolve(true);
    }, delay);
  });
}
