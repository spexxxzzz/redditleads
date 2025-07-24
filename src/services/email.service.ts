// import { Resend } from 'resend';
// import nodemailer from 'nodemailer';

// // --- Production Email Service (Resend) ---
// const isProduction = process.env.NODE_ENV === 'production';
// const resendApiKey = process.env.RESEND_API_KEY;
// const fromEmail = process.env.EMAIL_FROM;

// let resend: Resend | null = null;

// if (resendApiKey) {
//   resend = new Resend(resendApiKey);
//   console.log('✅ Resend email service initialized.');
// } else {
//   console.warn('⚠️ RESEND_API_KEY is not set. Production emails will be disabled.');
// }

// // --- Development Email Service (Nodemailer + Ethereal) ---
// let devMailTransporter: nodemailer.Transporter | null = null;

// const initializeDevMailer = async () => {
//   if (devMailTransporter) return; // Already initialized

//   // Create a temporary test account on Ethereal
//   const testAccount = await nodemailer.createTestAccount();
//   console.log('📬 Created Ethereal test account for development emails.');

//   devMailTransporter = nodemailer.createTransport({
//     host: 'smtp.ethereal.email',
//     port: 587,
//     secure: false, // true for 465, false for other ports
//     auth: {
//       user: testAccount.user, // generated ethereal user
//       pass: testAccount.pass, // generated ethereal password
//     },
//   });
// };

// /**
//  * Sends an email, using Resend in production or a local Ethereal account for development.
//  * This function is optimized for both environments.
//  *
//  * @param to The recipient's email address.
//  * @param subject The subject line of the email.
//  * @param html The HTML body of the email.
//  */
// export const sendEmail = async (to: string, subject: string, html: string): Promise<void> => {
//   // --- Use Resend for Production ---
//   if (isProduction && resend && fromEmail) {
//     console.log(`[PROD] Attempting to send email to: ${to} via Resend`);
//     try {
//       const { data, error } = await resend.emails.send({
//         from: fromEmail,
//         to: [to],
//         subject: subject,
//         html: html,
//       });

//       if (error) {
//         console.error(`Resend API error sending to ${to}:`, error);
//         throw new Error(error.message);
//       }
//       console.log(`✅ [PROD] Email sent successfully to ${to}. Message ID: ${data?.id}`);
//     } catch (exception) {
//       console.error(`An unexpected exception occurred sending email to ${to}:`, exception);
//       throw exception;
//     }
//     return;
//   }

//   // --- Use Ethereal for Development ---
//   if (!isProduction) {
//     await initializeDevMailer(); // Ensure mailer is ready
//     if (!devMailTransporter) {
//         console.error("Development mailer could not be initialized.");
//         return;
//     }

//     console.log(`[DEV] Attempting to send email to: ${to} via Ethereal`);
//     try {
//         const info = await devMailTransporter.sendMail({
//             from: '"RedLead Dev" <dev@redlead.io>',
//             to: to,
//             subject: subject,
//             html: html,
//         });

//         console.log(`✅ [DEV] Email sent. Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
//     } catch(error) {
//         console.error(`[DEV] Failed to send ethereal email:`, error);
//     }
//     return;
//   }
  
//   // --- Fallback if production is misconfigured ---
//   console.error('Email service is not configured for production. Missing RESEND_API_KEY or EMAIL_FROM.');
// };
