import { Resend } from "resend";
import * as React from "react";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = `${process.env.FROM_NAME ?? "Your App"} <${process.env.FROM_EMAIL ?? "hello@example.com"}>`;

interface SendOptions {
  to: string;
  subject: string;
  react: React.ReactElement;
}

export async function sendEmail({ to, subject, react }: SendOptions) {
  const { data, error } = await resend.emails.send({ from: FROM, to, subject, react });
  if (error) throw new Error(`Email send failed: ${error.message}`);
  return data;
}

// ─── Invite email ───────────���──────────────────────────────────────────────
// Drop-in: swap this for your react-email-kit InviteEmail component
export async function sendInviteEmail({
  to,
  inviterName,
  orgName,
  inviteUrl,
}: {
  to: string;
  inviterName: string;
  orgName: string;
  inviteUrl: string;
}) {
  return sendEmail({
    to,
    subject: `${inviterName} invited you to join ${orgName}`,
    react: React.createElement(
      "div",
      null,
      React.createElement("h2", null, `You're invited to join ${orgName}`),
      React.createElement(
        "p",
        null,
        `${inviterName} has invited you to collaborate on ${orgName}.`
      ),
      React.createElement(
        "a",
        { href: inviteUrl, style: { color: "#0070f3" } },
        "Accept invitation"
      ),
      React.createElement(
        "p",
        { style: { color: "#9ca3af", fontSize: "13px" } },
        "If you weren't expecting this, you can safely ignore it."
      )
    ),
  });
}
