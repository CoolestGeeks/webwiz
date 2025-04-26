
/**
 * Sends data to a specified webhook URL using a POST request and returns the parsed JSON response.
 *
 * @param data The data object to send to the webhook.
 * @param webhookUrl The URL of the webhook.
 * @returns A promise that resolves with the parsed JSON response from the webhook.
 * @throws Will throw an error if the fetch request fails, the response status is not OK, or the response is not valid JSON.
 */
export async function sendDataToWebhook(data: any, webhookUrl: string): Promise<any> { // Changed return type
  console.log(`Attempting to send data: ${JSON.stringify(data)} to webhook: ${webhookUrl}`);

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add Accept header if the webhook specifically requires it for JSON response
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });

    console.log(`Webhook response status: ${response.status}`);

    // Check if the response content type is JSON, handle non-JSON responses gracefully
    const contentType = response.headers.get('content-type');
    let responseData: any;

    if (contentType && contentType.includes('application/json')) {
        responseData = await response.json(); // Parse JSON only if header indicates it
        console.log('Webhook response data (JSON):', responseData);
    } else {
        // Handle non-JSON responses (e.g., plain text, HTML error pages)
        responseData = await response.text();
        console.log('Webhook response data (non-JSON):', responseData);
        // If the response wasn't OK but wasn't JSON, throw an error with the text content
        if (!response.ok) {
             throw new Error(`Webhook request failed with status ${response.status}: ${responseData}`);
        }
         // If response was OK but not JSON, maybe return it or handle as needed
         // For this app, we expect JSON, so maybe warn or return a specific structure
         console.warn("Webhook returned a non-JSON response.");
         // You might want to return an empty object or null if JSON is strictly expected downstream
         // return { message: "Received non-JSON response", content: responseData };
         // Returning the text directly might break downstream expectations if JSON is assumed
         return {}; // Return empty object if non-JSON response is not expected downstream
    }


    if (!response.ok) {
      // Even if JSON parsing succeeded above, check the status code
      // Throw error using the parsed JSON error message if available, otherwise use status text
      const errorMessage = responseData?.message || responseData?.error || response.statusText;
      throw new Error(`Webhook request failed with status ${response.status}: ${errorMessage}`);
    }


    console.log('Webhook request successful.');
    return responseData; // Return the parsed data

  } catch (error) {
    console.error('Error during fetch operation or JSON parsing for webhook:', error);
    // Re-throw the error so the caller (server action) can handle it
    // Ensure it's an Error object for consistent handling
    if (error instanceof Error) {
        throw error;
    } else {
        throw new Error(String(error));
    }
  }
}
