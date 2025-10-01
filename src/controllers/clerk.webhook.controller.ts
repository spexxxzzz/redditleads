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
    // We add username here as it's used in the creation logic now
    username: string | null;
}

export const handleClerkWebhook: RequestHandler = async (req, res, next) => {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
    if (!WEBHOOK_SECRET) {
        console.error('Error: CLERK_WEBHOOK_SECRET is not set in .env file.');
        res.status(500).send('Server configuration error: Webhook secret not found.');
        return;
    }

    const headers = req.headers;
    const payload = req.body;

    const svix_id = headers['svix-id'] as string;
    const svix_timestamp = headers['svix-timestamp'] as string;
    const svix_signature = headers['svix-signature'] as string;

    if (!svix_id || !svix_timestamp || !svix_signature) {
        res.status(400).send('Error occurred -- no svix headers');
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
        res.status(400).send('Error occurred during verification');
        return;
    }

    const eventType = evt.type;
    console.log(`✅ Clerk Webhook received: ${eventType}`);

    // --- MODIFIED: USER CREATION LOGIC WITH 7-DAY PRO TRIAL ---
    if (eventType === 'user.created') {
        const { id, email_addresses, first_name, last_name, image_url, username }: UserWebhookEventData = evt.data;
        const primaryEmail = email_addresses.find(e => e.verification?.status === 'verified')?.email_address;
        
        if (!primaryEmail) {
            console.error('Webhook Error: No verified primary email for new user.');
            res.status(400).send('No verified primary email address provided.');
            return;
        }

        try {
            await prisma.user.create({
                data: {
                    id: id,
                    email: primaryEmail,
                    firstName: first_name ? first_name : '',
                    lastName: last_name? last_name : '',
                    subscriptionStatus : 'inactive',
                    plan: 'basic', // Set the plan to 'basic' (free) for new users
                },
            });
            console.log(`✅ New user ${id} successfully synced to database with basic (free) plan.`);
        } catch (dbError) {
            console.error('Database error while creating user:', dbError);
            res.status(500).send('Failed to create user in database.');
            return;
        }
    }
    
    // --- NO CHANGES to user.deleted logic ---
    if (eventType === 'user.deleted') {
        try {
            const { id } = evt.data;
            // Use findUnique to ensure we don't error on an already-deleted user
            const userExists = await prisma.user.findUnique({ where: { id } });
            if (userExists) {
                await prisma.user.delete({ where: { id } });
                console.log(`✅ User ${id} successfully deleted from database.`);
            } else {
                 console.log(`Webhook info: Attempted to delete user ${id}, but they were not found in the DB.`);
            }
        } catch (dbError) {
            console.warn('Could not delete user from DB, they may have already been removed.', dbError);
        }
    }

    res.status(200).send('Webhook processed successfully.');
};