import { Resend } from 'resend';
import dotenv from 'dotenv';
import { Lead, User } from '@prisma/client';

dotenv.config();

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.FROM_EMAIL || 'leads@redlead.net';
const appUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

// --- DIAGNOSTIC LOGGING ---
// Let's check if the API key is loaded correctly.
if (!resendApiKey) {
    console.error("🔴 FATAL: RESEND_API_KEY environment variable is not set!");
} else {
    console.log(`🟢 Resend API Key loaded successfully (starts with: ${resendApiKey.substring(0, 5)}...)`);
}
// -------------------------

const resend = new Resend(resendApiKey);


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
        console.error(`User ${user.id} does not have an email address. Cannot send notification.`);
        return;
    }

    if (!resendApiKey) {
        console.error("Cannot send new leads notification because RESEND_API_KEY is not configured.");
        return;
    }

    const subject = `✨ ${leads.length} New Leads Discovered in "${campaignName}"!`;

    // Create an HTML list of the first 5 leads as a preview
    const leadsHtmlPreview = leads
        .slice(0, 5)
        .map(lead => `
            <li style="margin-bottom: 10px; padding: 5px; border-left: 3px solid #f97316;">
                <strong>${lead.title}</strong><br/>
                <small style="color: #888;">${lead.body ? lead.body.substring(0, 120) + '...' : 'No additional content available.'}</small>
            </li>
        `)
        .join('');

    const htmlBody = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
        <h2 style="color: #111;">Hi ${user.firstName || 'there'},</h2>
        <p>Great news! We've just discovered a fresh batch of <strong>${leads.length} new leads</strong> for your campaign: <strong>"${campaignName}"</strong>.</p>
        <p>Here's a sneak peek:</p>
        <ul style="list-style-type: none; padding-left: 0;">
            ${leadsHtmlPreview}
        </ul>
        <p>Click the button below to view all your new leads, see their AI-generated summaries, and start engaging with them.</p>
        <a href="${appUrl}/dashboard" style="background-color: #f97316; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; text-align: center;">
            View Leads in Dashboard
        </a>
        <p style="margin-top: 25px; font-size: 0.9em; color: #555;">Happy lead hunting!</p>
        <p style="font-size: 0.9em; color: #555;"><em>The RedLead Team</em></p>
    </div>
    `;

    try {
        console.log(`Attempting to send new leads notification to ${user.email}...`);
        const { data, error } = await resend.emails.send({
            from: `RedLead <${fromEmail}>`,
            to: user.email,
            subject,
            html: htmlBody,
        });

        // --- DIAGNOSTIC LOGGING ---
        if (error) {
            console.error("🔴 Resend API returned an error:", JSON.stringify(error, null, 2));
            return;
        }
        // -------------------------

        console.log(`✅ New leads notification sent successfully to ${user.email}. Email ID: ${data?.id}`);
    } catch (error) {
        // This outer catch will handle network errors or other unexpected issues.
        console.error("🔴 An unexpected exception occurred while trying to send email:", error);
    }
};
