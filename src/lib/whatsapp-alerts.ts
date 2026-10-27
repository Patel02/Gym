/**
 * Hybrid WhatsApp Queue Alert & Backstage Call Room Service
 * 
 * Features:
 * 1. Twilio / Cloud API direct background dispatch (Automatic mode)
 * 2. 100% Free wa.me deep link generator for manual 1-click fallback
 * 3. Graceful error handling (if Twilio API is down or balance exhausted, seamlessly fallback)
 * 4. Multi-role support: Athlete, Coach, Admin, Super Admin
 */

export type QueuePosition =
  | "ON_PLATFORM"
  | "IN_THE_HOLE"
  | "IN_HOLE"
  | "IN_THE_RACK"
  | "IN_RACK";

export interface QueueAlertPayload {
  lifterName: string;
  phoneNumber?: string | null;
  coachPhone?: string | null;
  coachName?: string | null;
  meetTitle: string;
  discipline: "squat" | "bench" | "deadlift";
  attemptNumber: 1 | 2 | 3;
  weightKg: number;
  flight?: string;
  queuePosition: QueuePosition;
  estMinutesAway?: number;
}

export interface TwilioConfig {
  accountSid?: string | null;
  authToken?: string | null;
  fromPhone?: string | null;
}

/**
 * Standardize phone numbers to international format (Defaulting to +91 India if 10 digits)
 */
export function sanitizePhoneNumber(phone: string | null | undefined): string | null {
  if (!phone) return null;
  let digits = phone.replace(/[^0-9]/g, "");
  if (!digits) return null;

  // If 10 digits (Standard Indian mobile), prepend 91
  if (digits.length === 10) {
    digits = `91${digits}`;
  } else if (digits.length === 11 && digits.startsWith("0")) {
    digits = `91${digits.slice(1)}`;
  }

  return digits;
}

/**
 * Formats official, high-impact WhatsApp notification message
 */
export function formatQueueAlertMessage(data: QueueAlertPayload): string {
  const disciplineName = data.discipline.toUpperCase();
  const flightName = data.flight || "Flight A";

  let statusBadge = "";
  let directive = "";

  if (data.queuePosition === "ON_PLATFORM") {
    statusBadge = "🚨 1. NOW ON PLATFORM (ATTEMPT CLOCK RUNNING)";
    directive =
      "⚡ You are ON PLATFORM NOW! Report to chalk box immediately. 60-second attempt clock is ticking.";
  } else if (data.queuePosition === "IN_THE_HOLE" || data.queuePosition === "IN_HOLE") {
    statusBadge = "⚠️ 2. IN THE HOLE (NEXT LIFTER • ~1.5 MINS)";
    directive =
      "🦵 Knee sleeves/wraps ON, belt strapped, chalk up and report to the backstage curtain staging area right now.";
  } else {
    statusBadge = "⏳ 3. IN THE RACK (2ND NEXT • ~3.0 MINS)";
    directive =
      "🏋️ Take your final warm-up bar touch and mental cue. You are 2 attempts away from platform entry.";
  }

  const coachInfo = data.coachName
    ? `\n👤 Coach: *${data.coachName}*`
    : "";

  return (
`🏆 *WPI GUJARAT PLATFORM CALL ROOM ALERT* 🏆

${statusBadge}

🏋️ Lifter: *${data.lifterName}*${coachInfo}
📋 Flight: *${flightName}*
🎯 Lift: *${disciplineName} Attempt ${data.attemptNumber}*
⚖️ Loaded Weight: *${data.weightKg} KG*
⏱️ Estimated Platform Time: *~${data.estMinutesAway ?? (data.queuePosition === "ON_PLATFORM" ? 0 : data.queuePosition === "IN_THE_HOLE" ? 1.5 : 3)} Mins*

👉 *Backstage Directive:*
${directive}

🏟️ *${data.meetTitle}*
📡 Live Scoreboard: https://powerlifting.gujarat.in/live`
  ).trim();
}

/**
 * Generates direct wa.me link for 1-Click FREE WhatsApp sending
 */
export function generateFreeWhatsAppLink(phoneNumber: string | null | undefined, message: string): string {
  const cleanPhone = sanitizePhoneNumber(phoneNumber);
  const encodedText = encodeURIComponent(message);
  if (cleanPhone) {
    return `https://wa.me/${cleanPhone}?text=${encodedText}`;
  }
  return `https://wa.me/?text=${encodedText}`;
}

/**
 * Sends message via Twilio WhatsApp API using lightweight fetch (Zero extra dependencies)
 */
export async function sendTwilioWhatsAppApi(
  toPhone: string,
  message: string,
  config?: TwilioConfig
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const cleanTo = sanitizePhoneNumber(toPhone);
  if (!cleanTo) {
    return { success: false, error: "Invalid recipient phone number." };
  }

  const sid = config?.accountSid || process.env.TWILIO_ACCOUNT_SID;
  const token = config?.authToken || process.env.TWILIO_AUTH_TOKEN;
  let from = config?.fromPhone || process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+14155238886";

  if (!sid || !token) {
    return {
      success: false,
      error: "Twilio credentials not configured in environment or database.",
    };
  }

  if (!from.startsWith("whatsapp:")) {
    from = `whatsapp:${from.replace(/[^0-9+]/g, "")}`;
  }

  const formattedTo = `whatsapp:+${cleanTo}`;

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
    const params = new URLSearchParams();
    params.append("From", from);
    params.append("To", formattedTo);
    params.append("Body", message);

    const authHeader = `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const data = await res.json();

    if (!res.ok) {
      console.warn("[Twilio API Error]:", data?.message || data);
      return {
        success: false,
        error: data?.message || `Twilio HTTP ${res.status}: ${res.statusText}`,
      };
    }

    return {
      success: true,
      messageId: data.sid,
    };
  } catch (err: any) {
    console.error("[Twilio Network Error]:", err);
    return {
      success: false,
      error: err.message || "Failed to connect to Twilio WhatsApp service.",
    };
  }
}
