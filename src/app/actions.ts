
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
  styledSentence?: string; // Ensure this is a string to hold HTML
}

export async function sendToWebhookAction(formData: FormData): Promise<ActionResult> {
  console.log('Received form data:', formData);

  if (!formData.sentence || !formData.style) {
    return { success: false, error: 'Sentence and style are required.' };
  }

  const dataToSend = {
    text_input: formData.sentence,
    selected_style: formData.style,
    timestamp: new Date().toISOString(),
  };

  try {
    console.log('Sending data to webhook:', dataToSend);
    // Assume sendDataToWebhook returns the parsed JSON response from the webhook
    const responseData = await sendDataToWebhook(dataToSend, WEBHOOK_URL);
    console.log('Data successfully sent to webhook. Response:', responseData);

    // Extract the HTML styled sentence from the response
    // *** IMPORTANT: Adjust 'styled_sentence' if the actual field name in your n8n JSON response is different ***
    const styledSentence = responseData?.styled_sentence; // Expecting HTML string here

    // Check if styledSentence is actually a string (could be undefined or null)
    if (typeof styledSentence === 'string') {
       return { success: true, styledSentence: styledSentence };
    } else {
        // Handle case where the field exists but isn't a string or doesn't exist
        console.warn(`Webhook response did not contain a valid string in 'styled_sentence'. Received:`, styledSentence);
        return { success: true, styledSentence: "<p class='text-destructive'>Error: Webhook response did not contain the expected styled sentence format.</p>" };
    }

  } catch (error: any) {
    console.error('Error sending data to webhook:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to send data to webhook.';
    return { success: false, error: errorMessage };
  }
}
