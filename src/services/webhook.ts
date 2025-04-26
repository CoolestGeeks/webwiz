/**
 * Sends data to a specified webhook URL using a POST request.
 *
 * @param data The data object to send to the webhook.
 * @param webhookUrl The URL of the webhook.
 * @returns A promise that resolves when the data is successfully sent, or rejects on error.
 * @throws Will throw an error if the fetch request fails or the response status is not OK.
 */
export async function sendDataToWebhook(data: any, webhookUrl: string): Promise<void> {
  console.log(`Attempting to send data: ${JSON.stringify(data)} to webhook: ${webhookUrl}`);

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    console.log(`Webhook response status: ${response.status}`);

    if (!response.ok) {
      // Attempt to read the response body for more details, even on error
      let errorBody = 'No error details available.';
      try {
        errorBody = await response.text(); // Use text() as it might not be JSON
        console.error(`Webhook error response body: ${errorBody}`);
      } catch (parseError) {
        console.error('Could not parse error response body:', parseError);
      }
      throw new Error(`Webhook request failed with status ${response.status}: ${errorBody}`);
    }

    // Optionally process the response if needed, e.g., log success message
    console.log('Webhook request successful.');
    // const responseData = await response.json(); // Assuming webhook returns JSON
    // console.log('Webhook response data:', responseData);

  } catch (error) {
    console.error('Error during fetch operation to webhook:', error);
    // Re-throw the error so the caller (server action) can handle it
    throw error;
  }
}
