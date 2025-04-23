import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.CLERK_SIGNING_WEBHOOK_SECRET

  if (!SIGNING_SECRET) {
    throw new Error('Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env.local')
  }

  // Create new Svix instance with secret
  const wh = new Webhook(SIGNING_SECRET)

  // Get headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing Svix headers', {
      status: 400,
    })
  }

  // Get body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  let evt: WebhookEvent

  // Verify payload with headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error: Could not verify webhook:', err)
    return new Response('Error: Verification error', {
      status: 400,
    })
  }

  // Do something with payload
  // For this guide, log payload to console
  const eventType = evt.type
  // console.log(`Received webhook with ID ${id} and event type of ${eventType}`)
  console.log('Webhook payload:', body)
  if (eventType === 'user.created') {
    const { data } = evt;
    await db.insert(users).values({
      clerkId: data.id,
      firstName: data.first_name,
      lastName: data.last_name,
      phone: data.phone_numbers[0]?.phone_number,
      email: data.email_addresses[0]?.email_address,
      imageUrl: data.image_url,
    });
  }
  if (eventType === 'user.deleted') {
    const { data } = evt;
    if (!data.id) {
      return new Response('Missing UserID', { status: 400 })
    }
    await db.delete(users).where(eq(users.clerkId, data.id));
  }
  if (eventType === 'user.updated') {
    const { data } = evt;
    await db.update(users).set({
      firstName: data.first_name ?? '',
      lastName: data.last_name ?? '',
      phone: data.phone_numbers[0]?.phone_number,
      email: data.email_addresses[0]?.email_address,
      imageUrl: data.image_url,
    }).where(eq(users.clerkId, data.id));
  }

  return new Response('Webhook received', { status: 200 })
}