
/**
 * Sends data to a specified webhook URL using a POST request and returns the response.
 * Handles both JSON and direct HTML/text responses.
 *
 * @param data The data object to send to the webhook.
 * @param webhookUrl The URL of the webhook.
 * @returns A promise that resolves with the parsed JSON response object or the raw text/HTML string from the webhook.
 * @throws Will throw an error if the fetch request fails or the response status indicates an error (not 2xx).
 */
export async function sendDataToWebhook(data: any, webhookUrl: string): Promise<any> { // Return type is any as structure depends on n8n/webhook
  console.log(`Attempting to send data: ${JSON.stringify(data)} to webhook: ${webhookUrl}`);

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Accept header might encourage JSON, but we need to handle whatever the webhook sends
        // 'Accept': 'application/json, text/html, text/plain',
      },
      body: JSON.stringify(data),
    });

    console.log(`Webhook response status: ${response.status}`);
    const contentType = response.headers.get('content-type');
    console.log(`Webhook response content-type: ${contentType}`);

    // Check if the response status indicates success (e.g., 200 OK, 201 Created, 204 No Content)
    if (!response.ok) {
       const responseBodyText = await response.text(); // Get body text for error context
       console.error(`Webhook request failed with status ${response.status}. Body: ${responseBodyText}`);
       // Attempt to parse as JSON for potential error details, but prioritize status code error
       let jsonError = null;
       try {
           jsonError = JSON.parse(responseBodyText);
       } catch (e) { /* Ignore parsing error if body is not JSON */ }
       const errorMessage = jsonError?.message || jsonError?.error || response.statusText || `HTTP status ${response.status}`;
       throw new Error(`Webhook request failed: ${errorMessage}`);
    }

    // Handle successful response (2xx)
    if (contentType && contentType.includes('application/json')) {
      // If response is JSON, parse and return it
      const responseData = await response.json();
      console.log('Webhook response data (JSON):', responseData);
      return responseData; // Action handler will look for 'styled_sentence' inside this
    } else {
      // If response is not JSON (likely HTML or plain text), return the raw text
      const responseBodyText = await response.text();
      console.log('Webhook response data (non-JSON):', responseBodyText);
      // Return the raw HTML/text string directly
      return responseBodyText;
    }

  } catch (error) {
    // Catch fetch errors, network errors, or errors thrown above
    console.error('Error during webhook interaction:', error);
    if (error instanceof Error) {
      throw error; // Re-throw known errors
    } else {
      throw new Error(`An unexpected error occurred during webhook interaction: ${String(error)}`); // Wrap unknown errors
    }
  }
}
