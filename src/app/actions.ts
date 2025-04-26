
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
  styledSentence?: string; // Add optional field for the styled sentence
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
    // Assume sendDataToWebhook now returns the parsed JSON response from the webhook
    const responseData = await sendDataToWebhook(dataToSend, WEBHOOK_URL);
    console.log('Data successfully sent to webhook. Response:', responseData); // Log success and response

    // Extract the styled sentence from the response - adjust 'styled_sentence' based on actual n8n response structure
    const styledSentence = responseData?.styled_sentence;

    return { success: true, styledSentence: styledSentence };

  } catch (error: any) {
    console.error('Error sending data to webhook:', error); // Log detailed error
    // Ensure the error message is propagated correctly
    const errorMessage = error instanceof Error ? error.message : 'Failed to send data to webhook.';
    return { success: false, error: errorMessage };
  }
}
