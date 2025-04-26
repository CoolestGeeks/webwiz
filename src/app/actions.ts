'use server';

import { sendDataToWebhook } from '@/services/webhook';

const WEBHOOK_URL = 'https://aghabasadsad.app.n8n.cloud/webhook-test/48652a25-8d7c-4736-aba6-33c567d7e093';

interface FormData {
  sentence: string;
  style: string;
}

interface ActionResult {
  success: boolean;
  error?: string;
}

export async function sendToWebhookAction(formData: FormData): Promise<ActionResult> {
  console.log('Received form data:', formData); // Log received data

  // Basic validation on the server-side (optional, as Zod handles client-side)
  if (!formData.sentence || !formData.style) {
    return { success: false, error: 'Sentence and style are required.' };
  }

  const dataToSend = {
    text_input: formData.sentence,
    selected_style: formData.style,
    timestamp: new Date().toISOString(),
  };

  try {
    console.log('Sending data to webhook:', dataToSend); // Log data being sent
    await sendDataToWebhook(dataToSend, WEBHOOK_URL);
    console.log('Data successfully sent to webhook.'); // Log success
    return { success: true };
  } catch (error: any) {
    console.error('Error sending data to webhook:', error); // Log detailed error
    return { success: false, error: error.message || 'Failed to send data to webhook.' };
  }
}
