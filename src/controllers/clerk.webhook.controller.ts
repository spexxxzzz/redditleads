// src/controllers/clerk.webhook.controller.ts
import { Request, RequestHandler, Response } from 'express';
import { Webhook } from 'svix';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// This interface defines the structure of the data object within the webhook event
interface UserWebhookEventData {
    id: string;
    email_addresses: {
        email_address: string;
        verification?: {
            status: string;
        };
    }[];
    first_name: string | null;
    last_name: string | null;
    image_url: string;
}

export const handleClerkWebhook: RequestHandler = async (req, res, next) => {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
    if (!WEBHOOK_SECRET) {
        console.error('Error: CLERK_WEBHOOK_SECRET is not set in .env file.');
        res.status(500).send('Server configuration error: Webhook secret not found.');
        return; // Use a simple return
    }

    const headers = req.headers;
    const payload = req.body;

    const svix_id = headers['svix-id'] as string;
    const svix_timestamp = headers['svix-timestamp'] as string;
    const svix_signature = headers['svix-signature'] as string;

    if (!svix_id || !svix_timestamp || !svix_signature) {
        res.status(400).send('Error occured -- no svix headers');
        return;
    }

    const wh = new Webhook(WEBHOOK_SECRET);
    let evt: { data: any; type: string; };

    try {
        evt = wh.verify(payload, {
            'svix-id': svix_id,
            'svix-timestamp': svix_timestamp,
            'svix-signature': svix_signature,
        }) as { data: any; type: string };
    } catch (err: any) {
        console.error('Error verifying webhook:', err.message);
        res.status(400).send('Error occured during verification');
        return;
    }

    const eventType = evt.type;
    console.log(`✅ Clerk Webhook received: ${eventType}`);

    if (eventType === 'user.created') {
        const { id, email_addresses }: UserWebhookEventData = evt.data;
        const primaryEmail = email_addresses.find(e => e.verification?.status === 'verified')?.email_address;
        
        if (!primaryEmail) {
            console.error('Webhook Error: No verified primary email for new user.');
            res.status(400).send('No verified primary email address provided.');
            return;
        }

        try {
            await prisma.user.create({
                data: { id: id, email: primaryEmail },
            });
            console.log(`✅ New user ${id} successfully synced to database.`);
        } catch (dbError) {
            console.error('Database error while creating user:', dbError);
            res.status(500).send('Failed to create user in database.');
            return;
        }
    }
    
    if (eventType === 'user.deleted') {
        try {
            const { id } = evt.data;
            await prisma.user.delete({ where: { id } });
            console.log(`✅ User ${id} successfully deleted from database.`);
        } catch (dbError) {
            // It's safe to ignore errors here if the user might already be deleted.
            console.warn('Could not delete user from DB, they may have already been removed.');
        }
    }

    res.status(200).send('Webhook processed successfully.');
};
