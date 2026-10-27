import { resend } from "@/inngest/client";

function escapeHtml(val: string): string {
  return val.replace(/[&<>'"]/g, (c) => {
    switch (c) {
      case "&": return "&amp;";
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "'": return "&#39;";
      case '"': return "&quot;";
      default: return c;
    }
  });
}

export interface DispatchIdCardEmailOptions {
  recipientEmail: string;
  recipientName: string;
  cardNumber: string;
  pdfUrl: string;
  pdfBuffer: Buffer;
  badgeSvg: string;
  badgeUrl: string;
  shortHash: string;
  verificationUrl: string;
}

export interface DispatchCertificateEmailOptions {
  recipientEmail: string;
  recipientName: string;
  meetTitle: string;
  medalText: string;
  total: number;
  ipfGlPoints: number;
  pdfUrl: string;
  pdfBuffer: Buffer;
  badgeSvg: string;
  badgeUrl: string;
  shortHash: string;
  verificationCode: string;
  verificationUrl: string;
}

/**
 * Dispatch Official Athlete ID Card Email with embedded Digital Badge and PDF attachment
 */
export async function dispatchIdCardEmail(options: DispatchIdCardEmailOptions): Promise<{
  delivered: boolean;
  messageId?: string;
  error?: string;
}> {
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  if (!resend || !fromEmail) {
    throw new Error("Resend email delivery is not configured.");
  }

  const safeName = escapeHtml(options.recipientName);
  const safeCard = escapeHtml(options.cardNumber);
  const safeHash = escapeHtml(options.shortHash);

  const badgeBase64 = Buffer.from(options.badgeSvg).toString("base64");
  const badgeDataUri = `data:image/svg+xml;base64,${badgeBase64}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Your Official Athlete ID Card</title>
</head>
<body style="margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #ffffff;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #09090b; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #121215; border: 1px solid #27272a; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #ff4500 0%, #b45309 100%); padding: 24px; text-align: center;">
              <h1 style="margin: 0; font-size: 20px; font-weight: 900; letter-spacing: 2px; color: #ffffff; text-transform: uppercase;">
                INDIAN POWERLIFTING FEDERATION
              </h1>
              <p style="margin: 6px 0 0; font-size: 12px; color: #ffedd5; font-weight: 600; letter-spacing: 1px;">
                OFFICIAL ATHLETE PASS &amp; DIGITAL CREDENTIAL
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px 28px;">
              <h2 style="margin: 0 0 12px; font-size: 22px; font-weight: 800; color: #ffffff;">
                Welcome to the Platform, ${safeName}!
              </h2>
              <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #a1a1aa;">
                Your official federation membership has been ratified. Your high-resolution digital competition pass and verifiable badge have been generated and cryptographically signed.
              </p>

              <!-- Digital Badge Display -->
              <div style="text-align: center; margin: 28px 0; padding: 20px; background-color: #18181b; border: 1px solid #3f3f46; border-radius: 12px;">
                <p style="margin: 0 0 14px; font-size: 11px; text-transform: uppercase; font-weight: 700; color: #f59e0b; letter-spacing: 1.5px;">
                  Official Verifiable Digital Badge
                </p>
                <img src="${badgeDataUri}" alt="Athlete Badge" width="220" height="220" style="display: block; margin: 0 auto; max-width: 100%; height: auto;" />
                <div style="margin-top: 14px;">
                  <span style="display: inline-block; background-color: #166534; color: #4ade80; padding: 4px 14px; border-radius: 9999px; font-size: 11px; font-weight: 800; letter-spacing: 1px;">
                    ✓ ACTIVE COMPETITIVE CLEARANCE
                  </span>
                </div>
              </div>

              <!-- Credential Snapshot Box -->
              <table role="presentation" width="100%" style="background-color: #1c1917; border: 1px solid #44403c; border-radius: 10px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="margin: 0 0 4px; font-size: 11px; text-transform: uppercase; color: #a8a29e; font-weight: 600;">Federation ID Card Number</p>
                    <p style="margin: 0 0 12px; font-size: 20px; font-family: monospace; font-weight: 900; color: #f59e0b;">${safeCard}</p>
                    
                    <p style="margin: 0 0 4px; font-size: 11px; text-transform: uppercase; color: #a8a29e; font-weight: 600;">Cryptographic Security Seal</p>
                    <p style="margin: 0; font-size: 13px; font-family: monospace; font-weight: 700; color: #e7e5e4;">${safeHash} (HMAC-SHA256)</p>
                  </td>
                </tr>
              </table>

              <!-- Action Buttons -->
              <table role="presentation" width="100%" style="margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <a href="${options.verificationUrl}" target="_blank" style="display: inline-block; background-color: #ff4500; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-size: 14px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; box-shadow: 0 4px 14px rgba(255,69,0,0.4);">
                      Verify Digital Credential Online
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 13px; color: #71717a; text-align: center; line-height: 1.5;">
                Your official printable PDF pass is attached to this email and securely stored in your Athlete Portal. Present this card at technical inspection and weigh-ins.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #09090b; border-top: 1px solid #27272a; padding: 20px 24px; text-align: center;">
              <p style="margin: 0 0 4px; font-size: 11px; color: #71717a;">
                Indian Powerlifting Federation • Affiliated to International Powerlifting Federation (IPF)
              </p>
              <p style="margin: 0; font-size: 10px; color: #52525b;">
                Tamper-evident verification: <a href="${options.verificationUrl}" style="color: #f59e0b; text-decoration: none;">${options.verificationUrl}</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const result = await resend.emails.send({
      from: fromEmail,
      to: options.recipientEmail,
      subject: `Official Athlete ID Card & Digital Badge [${options.cardNumber}]`,
      html,
      attachments: [
        {
          filename: `${options.cardNumber}-Athlete-ID-Pass.pdf`,
          content: options.pdfBuffer,
        },
      ],
    });

  if (result.error || !result.data?.id) {
    throw new Error("Resend could not confirm athlete ID card delivery.");
  }
  return { delivered: true, messageId: result.data.id };
}

/**
 * Dispatch Official Competition Certificate Email with Podium Badge and PDF attachment
 */
export async function dispatchCertificateEmail(options: DispatchCertificateEmailOptions): Promise<{
  delivered: boolean;
  messageId?: string;
  error?: string;
}> {
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  if (!resend || !fromEmail) {
    throw new Error("Resend email delivery is not configured.");
  }

  const safeName = escapeHtml(options.recipientName);
  const safeMeet = escapeHtml(options.meetTitle);
  const safeMedal = escapeHtml(options.medalText);
  const safeCode = escapeHtml(options.verificationCode);
  const safeHash = escapeHtml(options.shortHash);

  const badgeBase64 = Buffer.from(options.badgeSvg).toString("base64");
  const badgeDataUri = `data:image/svg+xml;base64,${badgeBase64}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Official Competition Certificate</title>
</head>
<body style="margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #ffffff;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #09090b; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 620px; background-color: #121215; border: 1px solid #27272a; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #d97706 0%, #b45309 50%, #78350f 100%); padding: 26px; text-align: center;">
              <h1 style="margin: 0; font-size: 21px; font-weight: 900; letter-spacing: 2px; color: #ffffff; text-transform: uppercase;">
                INDIAN POWERLIFTING FEDERATION
              </h1>
              <p style="margin: 6px 0 0; font-size: 13px; color: #fef3c7; font-weight: 700; letter-spacing: 1px;">
                OFFICIAL RECORD &amp; PODIUM MERIT RATIFICATION
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px 28px;">
              <h2 style="margin: 0 0 10px; font-size: 22px; font-weight: 800; color: #ffffff;">
                Congratulations, ${safeName}!
              </h2>
              <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #a1a1aa;">
                Your performance at the <strong>${safeMeet}</strong> has been officially ratified by the technical committee. You have achieved:
              </p>

              <!-- Medal Announcement Pill -->
              <div style="background-color: #1c1917; border: 1px solid #f59e0b; border-radius: 12px; padding: 16px 20px; text-align: center; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 16px; font-weight: 900; color: #f59e0b; letter-spacing: 1px;">
                  ${safeMedal}
                </p>
              </div>

              <!-- Podium Digital Badge -->
              <div style="text-align: center; margin: 24px 0; padding: 20px; background-color: #18181b; border: 1px solid #3f3f46; border-radius: 12px;">
                <p style="margin: 0 0 14px; font-size: 11px; text-transform: uppercase; font-weight: 700; color: #f59e0b; letter-spacing: 1.5px;">
                  Official Podium Digital Badge
                </p>
                <img src="${badgeDataUri}" alt="Podium Badge" width="230" height="230" style="display: block; margin: 0 auto; max-width: 100%; height: auto;" />
              </div>

              <!-- Scores Summary Grid -->
              <table role="presentation" width="100%" style="background-color: #18181b; border: 1px solid #27272a; border-radius: 10px; margin-bottom: 24px;">
                <tr>
                  <td width="50%" style="padding: 16px; border-right: 1px solid #27272a; text-align: center;">
                    <p style="margin: 0 0 4px; font-size: 11px; text-transform: uppercase; color: #a1a1aa;">Official Total</p>
                    <p style="margin: 0; font-size: 22px; font-weight: 900; color: #ffffff;">${options.total} KG</p>
                  </td>
                  <td width="50%" style="padding: 16px; text-align: center;">
                    <p style="margin: 0 0 4px; font-size: 11px; text-transform: uppercase; color: #a1a1aa;">IPF GL Points</p>
                    <p style="margin: 0; font-size: 22px; font-weight: 900; color: #f59e0b;">${options.ipfGlPoints.toFixed(2)}</p>
                  </td>
                </tr>
              </table>

              <!-- Security Details -->
              <table role="presentation" width="100%" style="background-color: #1c1917; border: 1px solid #44403c; border-radius: 10px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="margin: 0 0 4px; font-size: 11px; text-transform: uppercase; color: #a8a29e; font-weight: 600;">Certificate Verification Code</p>
                    <p style="margin: 0 0 10px; font-size: 18px; font-family: monospace; font-weight: 900; color: #f59e0b;">${safeCode}</p>
                    <p style="margin: 0 0 4px; font-size: 11px; text-transform: uppercase; color: #a8a29e; font-weight: 600;">Cryptographic Hash</p>
                    <p style="margin: 0; font-size: 12px; font-family: monospace; font-weight: 700; color: #e7e5e4;">${safeHash} (HMAC-SHA256)</p>
                  </td>
                </tr>
              </table>

              <!-- Action Button -->
              <table role="presentation" width="100%" style="margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <a href="${options.verificationUrl}" target="_blank" style="display: inline-block; background-color: #d97706; color: #000000; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-size: 14px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase; box-shadow: 0 4px 14px rgba(217,119,6,0.4);">
                      Verify Certificate in National Registry
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 13px; color: #71717a; text-align: center; line-height: 1.5;">
                Your official high-resolution landscape certificate PDF is attached to this email and permanently preserved in the Federation cloud archives.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #09090b; border-top: 1px solid #27272a; padding: 20px 24px; text-align: center;">
              <p style="margin: 0 0 4px; font-size: 11px; color: #71717a;">
                Indian Powerlifting Federation • Affiliated to International Powerlifting Federation (IPF)
              </p>
              <p style="margin: 0; font-size: 10px; color: #52525b;">
                Verification Portal: <a href="${options.verificationUrl}" style="color: #f59e0b; text-decoration: none;">${options.verificationUrl}</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const result = await resend.emails.send({
      from: fromEmail,
      to: options.recipientEmail,
      subject: `🏆 Official Competition Certificate & Podium Badge [${options.verificationCode}]`,
      html,
      attachments: [
        {
          filename: `${options.verificationCode}-Certificate.pdf`,
          content: options.pdfBuffer,
        },
      ],
    });

  if (result.error || !result.data?.id) {
    throw new Error("Resend could not confirm certificate delivery.");
  }
  return { delivered: true, messageId: result.data.id };
}
