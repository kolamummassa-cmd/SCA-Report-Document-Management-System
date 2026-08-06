/**
 * Transactional email service.
 * Dev: points at Mailhog (see infra/docker-compose.yml) — nothing is really
 * sent, view caught mail at http://localhost:8025.
 * Prod: point SMTP_* env vars at a real provider (Postmark/SES/etc. all
 * speak SMTP, or can be swapped in behind this same `sendMail` signature).
 */

import nodemailer from "nodemailer";
import { env } from "../config/env";
import { logger } from "./logger";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: false,
  auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD } : undefined,
});

// SCA brand tokens (see 2026-08-07-sca-ui-design-plan.md) used in email chrome.
const BRAND = {
  green: "#1B7A43",
  blue: "#1D5FA6",
  text: "#111827",
  muted: "#5B6B63",
};

function emailShell(bodyHtml: string): string {
  return `
  <div style="font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; background:#F7F9F8; padding:32px 0;">
    <table role="presentation" width="100%" style="max-width:520px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; border:1px solid #E2E8E5;">
      <tr>
        <td style="background:${BRAND.green}; padding:20px 28px;">
          <span style="color:#ffffff; font-size:18px; font-weight:600;">SCA — Stop Child Abuse</span><br/>
          <span style="color:#d9f2e3; font-size:12px;">Heal. Protect. Restore.</span>
        </td>
      </tr>
      <tr>
        <td style="padding:28px; color:${BRAND.text}; font-size:14px; line-height:1.6;">
          ${bodyHtml}
        </td>
      </tr>
      <tr>
        <td style="padding:16px 28px; background:#F7F9F8; color:${BRAND.muted}; font-size:12px;">
          SCA Report &amp; Document Management System — automated notification, please do not reply.
        </td>
      </tr>
    </table>
  </div>`;
}

export async function sendMail(to: string, subject: string, bodyHtml: string) {
  try {
    await transporter.sendMail({
      from: `"${env.EMAIL_FROM_NAME}" <${env.EMAIL_FROM_ADDRESS}>`,
      to,
      subject,
      html: emailShell(bodyHtml),
    });
  } catch (err) {
    // Email delivery failures should never crash the request that triggered
    // them (e.g. a password-reset request); log and move on.
    logger.error({ err, to, subject }, "Failed to send email");
  }
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  await sendMail(
    to,
    "Reset your SCA RDMS password",
    `<p>We received a request to reset your password.</p>
     <p><a href="${resetUrl}" style="color:${BRAND.blue};">Click here to choose a new password</a>. This link expires in ${env.PASSWORD_RESET_TOKEN_EXPIRES_IN}.</p>
     <p>If you didn't request this, you can safely ignore this email.</p>`
  );
}

export async function sendEmailVerificationEmail(to: string, verifyUrl: string) {
  await sendMail(
    to,
    "Verify your SCA RDMS email address",
    `<p>Please confirm your email address to activate your account.</p>
     <p><a href="${verifyUrl}" style="color:${BRAND.blue};">Click here to verify your email</a>. This link expires in ${env.EMAIL_VERIFICATION_TOKEN_EXPIRES_IN}.</p>`
  );
}
