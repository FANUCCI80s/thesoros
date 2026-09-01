

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

const HOSTINGER_API_URL = "https://api.mail.hostinger.com";

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: SendEmailOptions): Promise<void> {
  const apiToken = process.env.HOSTINGER_MAIL_API_TOKEN;
  const mailboxId = process.env.HOSTINGER_MAILBOX_ID;
  const fromEmail = process.env.EMAIL_FROM;

  if (!apiToken) {
    throw new Error("HOSTINGER_MAIL_API_TOKEN is not configured.");
  }

  if (!mailboxId) {
    throw new Error("HOSTINGER_MAILBOX_ID is not configured.");
  }

  if (!fromEmail) {
    throw new Error("EMAIL_FROM is not configured.");
  }

  const response = await fetch(
    `${HOSTINGER_API_URL}/api/v1/mailboxes/${encodeURIComponent(
      mailboxId
    )}/send`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject,
        html,
        text,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Hostinger Mail API error (${response.status}): ${errorText}`
    );
  }
}

