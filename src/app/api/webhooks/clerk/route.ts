import { IncomingHttpHeaders } from 'http';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
// @ts-ignore
import { WebhookEvent } from '@clerk/nextjs/server';
import { createUser, getUserByClerkId, updateUser } from '@/lib/auth';

// This endpoint handles Clerk webhooks to synchronize user data with our database
export async function POST(req: Request) {
  // Get the headers
  const headersList = headers();
  const svix_id = headersList.get('svix-id');
  const svix_timestamp = headersList.get('svix-timestamp');
  const svix_signature = headersList.get('svix-signature');

  // If there are no SVIX headers, return 400
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new NextResponse('Missing svix headers', { status: 400 });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Get the Clerk webhook secret from environment variables
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return new NextResponse('Webhook secret not set', { status: 500 });
  }

  // Verify the webhook payload
  let event: WebhookEvent;
  try {
    event = payload as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new NextResponse('Error verifying webhook', { status: 400 });
  }

  // Process the webhook based on the event type
  try {
    switch (event.type) {
      case 'user.created':
        await handleUserCreated(event.data);
        break;
      case 'user.updated':
        await handleUserUpdated(event.data);
        break;
      // Add other event types as needed
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new NextResponse('Error processing webhook', { status: 500 });
  }
}

// Handle user.created event
async function handleUserCreated(userData: any) {
  // Check if user already exists (should not, but check to be safe)
  const existingUser = await getUserByClerkId(userData.id);
  if (existingUser) {
    return; // User already exists, no need to create
  }

  // Create a new user with default role of ENGINEER
  await createUser({
    clerkUserId: userData.id,
    role: 'ENGINEER', // Default role
    name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim(),
    email: userData.email_addresses?.[0]?.email_address,
  });
}

// Handle user.updated event
async function handleUserUpdated(userData: any) {
  // Find the user in our database
  const user = await getUserByClerkId(userData.id);
  if (!user) {
    // If user doesn't exist, create them
    return handleUserCreated(userData);
  }

  // Update the user's info (but not their role)
  await updateUser(user.id, {
    name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim(),
    email: userData.email_addresses?.[0]?.email_address,
  });
} 