// import { RequestHandler } from 'express';
// import { PrismaClient } from '@prisma/client';
// import { sendEmail } from '../services/email.service';

// const prisma = new PrismaClient();

// export const getEmailSettings: RequestHandler = async (req: any, res, next) => {
//   const { userId } = req.auth;
//   try {
//     const settings = await prisma.emailNotificationSetting.findUnique({
//       where: { userId },
//     });
//     res.json(settings);
//   } catch (error) {
//     next(error);
//   }
// };

// export const updateEmailSettings: RequestHandler = async (req: any, res, next) => {
//   const { userId } = req.auth;
//   const { email, enabled } = req.body;
//   try {
//     const settings = await prisma.emailNotificationSetting.upsert({
//       where: { userId },
//       update: { email, enabled },
//       create: { userId, email, enabled },
//     });
//     res.json(settings);
//   } catch (error) {
//     next(error);
//   }
// };

// export const sendTestEmail: RequestHandler = async (req: any, res, next) => {
//   const { userId } = req.auth;
//   try {
//     const settings = await prisma.emailNotificationSetting.findUnique({
//       where: { userId },
//     });
//     if (settings && settings.enabled) {
//       await sendEmail(
//         settings.email,
//         'Test Email from RedLead',
//         '<h1>This is a test email to confirm your settings are correct.</h1>'
//       );
//       res.json({ success: true });
//     } else {
//       res.status(400).json({ message: 'Email notifications are not enabled.' });
//     }
//   } catch (error) {
//     next(error);
//   }
// };