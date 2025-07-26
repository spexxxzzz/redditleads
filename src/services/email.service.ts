import { Resend } from 'resend';
import dotenv from 'dotenv';
import { Lead, User } from '@prisma/client';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.FROM_EMAIL || 'leads@redlead.app';
const appUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

/**
 * Sends a generic email.
 */
export const sendEmail = async (to: string, subject: string, html: string) => {
    try {
        await resend.emails.send({
            from: `RedLead <${fromEmail}>`,
            to,
            subject,
            html,
        });
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

/**
 * Sends a notification email when new leads are discovered for a campaign.
 * @param user The user to notify.
 * @param leads The array of new leads that were discovered.
 * @param campaignName The name of the campaign the leads belong to.
 */
export const sendNewLeadsNotification = async (user: User, leads: Lead[], campaignName: string) => {
    if (!user.email) {
        console.error(`User ${user.id} does not have an email address.`);
        return;
    }

    const subject = `✨ ${leads.length} New Leads Discovered in "${campaignName}"!`;

    // Create an HTML list of the first 5 leads as a preview
    const leadsHtmlPreview = leads
        .slice(0, 5)
        .map(lead => `
            <li style="margin-bottom: 10px;">
                <strong>${lead.title}</strong><br/>
                <small style="color: #666;">${lead.title? lead.body?.substring(0, 120) : ''}...</small>
            </li>
        `)
        .join('');

    const htmlBody = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>Hi ${user.firstName || 'there'},</h2>
        <p>Great news! We've just discovered a fresh batch of <strong>${leads.length} new leads</strong> for your campaign: <strong>"${campaignName}"</strong>.</p>
        <p>Here's a sneak peek:</p>
        <ul style="list-style-type: none; padding-left: 0;">
            ${leadsHtmlPreview}
        </ul>
        <p>Click the button below to view all your new leads, see their AI-generated summaries, and start engaging with them.</p>
        <a href="${appUrl}/dashboard" style="background-color: #f97316; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
            View Leads in Dashboard
        </a>
        <p style="margin-top: 25px;">Happy lead hunting!</p>
        <p><em>The RedLead Team</em></p>
    </div>
    `;

    try {
        await resend.emails.send({
            from: `RedLead <${fromEmail}>`,
            to: user.email,
            subject,
            html: htmlBody,
        });
        console.log(`New leads notification sent to ${user.email} for campaign "${campaignName}".`);
    } catch (error) {
        console.error(`Error sending new leads notification to ${user.email}:`, error);
        // It's recommended to add more robust error handling here if needed
    }
};