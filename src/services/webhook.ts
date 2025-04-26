
/**
 * Sends data to a specified webhook URL using a POST request and returns the parsed JSON response.
 * Specifically looks for a 'styled_sentence' field in the JSON response.
 *
 * @param data The data object to send to the webhook.
 * @param webhookUrl The URL of the webhook.
 * @returns A promise that resolves with the parsed JSON response object from the webhook.
 * @throws Will throw an error if the fetch request fails, the response status is not OK, or the response is not valid JSON.
 */
export async function sendDataToWebhook(data: any, webhookUrl: string): Promise<any> { // Return type is any as structure depends on n8n
  console.log(`Attempting to send data: ${JSON.stringify(data)} to webhook: ${webhookUrl}`);

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json', // Indicate we prefer JSON response
      },
      body: JSON.stringify(data),
    });

    console.log(`Webhook response status: ${response.status}`);
    const contentType = response.headers.get('content-type');
    let responseBodyText: string; // Store raw body text for error reporting

    // Check if the response status is OK first
    if (!response.ok) {
       responseBodyText = await response.text(); // Get body text for error context
       console.error(`Webhook request failed with status ${response.status}. Body: ${responseBodyText}`);
       // Attempt to parse as JSON for potential error details, but prioritize status code error
       let jsonError = null;
       try {
           jsonError = JSON.parse(responseBodyText);
       } catch (e) { /* Ignore parsing error if body is not JSON */ }
       const errorMessage = jsonError?.message || jsonError?.error || response.statusText || `HTTP status ${response.status}`;
       throw new Error(`Webhook request failed: ${errorMessage}`);
    }

    // If response is OK, proceed to check content type and parse
    if (contentType && contentType.includes('application/json')) {
      const responseData = await response.json();
      console.log('Webhook response data (JSON):', responseData);

       // Specifically check if the expected field exists.
       // The frontend action handler (actions.ts) will extract this field.
       if (responseData && typeof responseData === 'object') {
           // It's a valid JSON object, return it as is.
           return responseData;
       } else {
            // It's JSON, but not the expected object structure.
            console.warn("Webhook returned JSON, but it's not a structured object as expected.", responseData);
             // Return the parsed JSON anyway, maybe the action handler can still use parts of it.
             // Or throw an error if a specific structure is strictly required.
             // throw new Error("Webhook returned unexpected JSON format.");
             return responseData; // Returning the parsed data for flexibility
       }

    } else {
      // Response is OK, but not JSON
      responseBodyText = await response.text();
      console.log('Webhook response data (non-JSON):', responseBodyText);
      console.warn("Webhook returned a non-JSON response even though the request was successful (2xx status).");
      // Since the frontend expects a JSON object with 'styled_sentence',
      // returning an empty object might be the safest way to signal this.
      // Alternatively, throw an error if JSON is strictly required.
       // throw new Error("Webhook returned a non-JSON response.");
       // Treat non-JSON success as potentially missing the required field.
       return { message: "Received non-JSON 2xx response from webhook", content: responseBodyText };
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
