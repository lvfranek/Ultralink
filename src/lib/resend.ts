import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

/* -----------------------------------------------------------------------
   Sample: Welcome email template
   Usage (from a server action or API route):

   await resend.emails.send({
     from: "Ultralink <hello@ultralink.bio>",
     to: [userEmail],
     subject: "Welcome to Ultralink",
     html: welcomeEmail({ name: userName }),
   });
----------------------------------------------------------------------- */

export function inviteEmail({
  ownerUsername,
  token,
  siteUrl = "https://ultralink.bio",
}: {
  ownerUsername: string;
  token: string;
  siteUrl?: string;
}): string {
  const acceptUrl = `${siteUrl}/invite/accept?token=${encodeURIComponent(token)}`;
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You've been invited to Ultralink</title>
</head>
<body style="margin:0;padding:0;background:#0A0A0B;font-family:Inter,Arial,sans-serif;color:#F5F3EF;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:40px auto;">
    <tr>
      <td style="padding:40px 32px;background:#141417;border-radius:12px;border:1px solid rgba(255,255,255,0.08);">
        <p style="font-size:13px;letter-spacing:0.1em;text-transform:uppercase;color:#C9A86A;margin:0 0 24px;">
          ultralink
        </p>
        <h1 style="font-size:28px;font-weight:700;margin:0 0 16px;color:#F5F3EF;line-height:1.2;">
          You've been invited.
        </h1>
        <p style="font-size:16px;line-height:1.7;color:#9A9AA2;margin:0 0 32px;">
          <strong style="color:#F5F3EF;">${ownerUsername}</strong> has invited you to collaborate on their Ultralink pages as an Editor.
        </p>
        <a href="${acceptUrl}"
           style="display:inline-block;padding:14px 28px;background:#C9A86A;color:#0A0A0B;font-weight:600;font-size:15px;text-decoration:none;border-radius:8px;">
          Accept invite →
        </a>
        <p style="font-size:13px;color:#6B6B75;margin:40px 0 0;line-height:1.6;">
          This invite expires in 7 days. If you weren't expecting this, you can ignore the email.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function welcomeEmail({ name }: { name: string }): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Ultralink</title>
</head>
<body style="margin:0;padding:0;background:#0A0A0B;font-family:Inter,Arial,sans-serif;color:#F5F3EF;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:40px auto;">
    <tr>
      <td style="padding:40px 32px;background:#141417;border-radius:12px;border:1px solid rgba(255,255,255,0.08);">
        <p style="font-size:13px;letter-spacing:0.1em;text-transform:uppercase;color:#C9A86A;margin:0 0 24px;">
          ultralink
        </p>
        <h1 style="font-size:28px;font-weight:700;margin:0 0 16px;color:#F5F3EF;line-height:1.2;">
          Welcome, ${name}.
        </h1>
        <p style="font-size:16px;line-height:1.7;color:#9A9AA2;margin:0 0 32px;">
          Your link page is ready. Set it up in minutes and share it everywhere.
        </p>
        <a href="https://ultralink.bio/dashboard"
           style="display:inline-block;padding:14px 28px;background:#C9A86A;color:#0A0A0B;font-weight:600;font-size:15px;text-decoration:none;border-radius:8px;">
          Go to Dashboard →
        </a>
        <p style="font-size:13px;color:#6B6B75;margin:40px 0 0;line-height:1.6;">
          Questions? Reply to this email or contact us at support@ultralink.bio
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
