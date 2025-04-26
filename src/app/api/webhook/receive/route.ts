import { type NextRequest, NextResponse } from 'next/server';

/**
 * Handles POST requests to the /api/webhook/receive endpoint.
 * This endpoint is intended to receive data pushed from an external webhook (e.g., n8n).
 *
 * @param req The incoming NextRequest object.
 * @returns A NextResponse object indicating success or failure.
 */
export async function POST(req: NextRequest) {
  console.log('Webhook received POST request');

  try {
    // 1. Parse the incoming JSON data from the request body
    const receivedData = await req.json();
    console.log('Received data from webhook:', JSON.stringify(receivedData, null, 2));

    // 2. Process the received data (add your logic here)
    //    - Validate the data structure
    //    - Store it in a database
    //    - Trigger other actions based on the data
    // Example: Log the styled sentence if present
    if (receivedData?.styled_sentence) {
        console.log(`Styled Sentence: ${receivedData.styled_sentence}`);
        // Here you could potentially update the UI or store this result
    }


    // 3. Send a success response
    //    It's good practice to acknowledge receipt of the webhook data.
    return NextResponse.json({ message: 'Webhook data received successfully.' }, { status: 200 });

  } catch (error: any) {
    // 4. Handle errors during processing
    console.error('Error processing webhook data:', error);

    // Determine the type of error for a more specific response
    if (error instanceof SyntaxError) {
      // Error parsing JSON
      return NextResponse.json({ error: 'Invalid JSON received.' }, { status: 400 });
    }

    // Generic server error
    return NextResponse.json({ error: 'Failed to process webhook data.', details: error.message }, { status: 500 });
  }
}

/**
 * Handles GET requests to the /api/webhook/receive endpoint.
 * Useful for simple checks or verification if needed, though webhooks typically use POST.
 *
 * @param req The incoming NextRequest object.
 * @returns A NextResponse object.
 */
export async function GET(req: NextRequest) {
  console.log('Webhook received GET request');
  // You could add verification logic here if the webhook provider supports it
  return NextResponse.json({ message: 'Webhook endpoint is active. Use POST to send data.' }, { status: 200 });
}
