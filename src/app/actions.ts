
'use server';

import { sendDataToWebhook } from '@/services/webhook';

const WEBHOOK_URL = 'https://aghabasadsad.app.n8n.cloud/webhook/48652a25-8d7c-4736-aba6-33c567d7e093'; // Updated Webhook URL

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
    // sendDataToWebhook now returns either a JSON object or a raw string
    const responseData = await sendDataToWebhook(dataToSend, WEBHOOK_URL);
    console.log('Response received from webhook service:', responseData);

    let finalStyledSentence: string | null = null;

    // Check the type of response received from the service
    if (typeof responseData === 'string') {
        // If it's a string, assume it's the direct HTML response
        finalStyledSentence = responseData;
        console.log('Received direct HTML string from webhook.');
    } else if (responseData && typeof responseData === 'object' && typeof responseData.styled_sentence === 'string') {
        // If it's an object and contains the 'styled_sentence' key as a string
        finalStyledSentence = responseData.styled_sentence;
        console.log('Received JSON object with styled_sentence from webhook.');
    } else {
        // Handle unexpected response structure (neither string nor object with styled_sentence)
        console.warn(`Webhook response was successful but did not contain a direct string or a 'styled_sentence' field. Response:`, responseData);
        // Return a generic success but indicate the issue in the message
        return { success: true, styledSentence: "<p class='text-destructive'>Error: Webhook response format was unexpected. Check n8n workflow output.</p>" };
    }

    // Ensure we have a non-empty string before returning
    if (finalStyledSentence && finalStyledSentence.trim() !== '') {
        return { success: true, styledSentence: finalStyledSentence };
    } else {
        // Handle cases where the string might be empty or only whitespace
        console.warn('Webhook response contained an empty or whitespace-only styled sentence.');
        return { success: true, styledSentence: "<p class='text-muted-foreground'>Webhook returned an empty styled sentence.</p>" };
    }

  } catch (error: any) {
    console.error('Error in sendToWebhookAction:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to process webhook request.';
    return { success: false, error: errorMessage };
  }
}
