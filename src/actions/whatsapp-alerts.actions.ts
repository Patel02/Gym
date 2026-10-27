"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  formatQueueAlertMessage,
  generateFreeWhatsAppLink,
  sanitizePhoneNumber,
  sendTwilioWhatsAppApi,
  type QueuePosition,
} from "@/lib/whatsapp-alerts";

export type { QueuePosition };

export interface DispatchAlertInput {
  meetId: string;
  meetTitle: string;
  lifterId: string;
  lifterName: string;
  phoneNumber?: string | null;
  coachPhone?: string | null;
  coachName?: string | null;
  queuePosition: QueuePosition;
  discipline: "squat" | "bench" | "deadlift";
  attemptNumber: 1 | 2 | 3;
  weightKg: number;
  flight?: string;
  forceManual?: boolean;
}

export interface DispatchAlertResult {
  success: boolean;
  method: "TWILIO_API" | "MANUAL_WA_ME" | "FALLBACK_WA_ME";
  messageText: string;
  waUrl: string;
  coachWaUrl?: string;
  error?: string;
}

/**
 * 1. Dispatch individual queue alert (Hybrid: Twilio Auto with 100% Free wa.me Fallback)
 */
export async function dispatchLifterQueueAlertAction(
  data: DispatchAlertInput
): Promise<DispatchAlertResult> {
  try {
    const session = await auth();
    const role = session?.user?.role;
    const sentByRole = role || "SYSTEM";

    // Format standardized message
    const messageText = formatQueueAlertMessage({
      lifterName: data.lifterName,
      phoneNumber: data.phoneNumber,
      coachPhone: data.coachPhone,
      coachName: data.coachName,
      meetTitle: data.meetTitle,
      discipline: data.discipline,
      attemptNumber: data.attemptNumber,
      weightKg: data.weightKg,
      flight: data.flight || "Flight A",
      queuePosition: data.queuePosition,
    });

    const waUrl = generateFreeWhatsAppLink(data.phoneNumber, messageText);
    const coachWaUrl = data.coachPhone
      ? generateFreeWhatsAppLink(data.coachPhone, messageText)
      : undefined;

    // Check SaaS Settings
    const config = await prisma.whatsappSaaSConfig.findUnique({
      where: { id: "default" },
    }).catch(() => null);

    const isAutoEnabled = !data.forceManual && Boolean(config?.isAutoDispatchEnabled);

    // If auto-dispatch is enabled and recipient phone exists, attempt Twilio
    if (isAutoEnabled && data.phoneNumber) {
      const twilioRes = await sendTwilioWhatsAppApi(data.phoneNumber, messageText, {
        accountSid: config?.twilioAccountSid || undefined,
        authToken: config?.twilioAuthToken || undefined,
        fromPhone: config?.twilioPhoneNumber || undefined,
      });

      if (twilioRes.success) {
        // Log successful automated delivery
        await prisma.whatsappQueueAlertLog.create({
          data: {
            meetId: data.meetId,
            lifterId: data.lifterId,
            lifterName: data.lifterName,
            phoneNumber: data.phoneNumber,
            queuePosition: data.queuePosition,
            attemptInfo: `${data.discipline.toUpperCase()} Attempt ${data.attemptNumber} @ ${data.weightKg} KG`,
            messageText,
            channel: "TWILIO_API",
            status: "SENT",
            sentByRole,
          },
        }).catch(() => {});

        revalidatePath("/live/warmup");
        revalidatePath("/admin/live-scoring");

        return {
          success: true,
          method: "TWILIO_API",
          messageText,
          waUrl,
          coachWaUrl,
        };
      }

      // If Twilio failed (e.g. balance out or API downtime), seamlessly fallback to manual free wa.me link!
      console.warn(
        `[WhatsApp Queue Alert] Twilio API failed (${twilioRes.error}), switching to 1-Click Free Fallback.`
      );

      await prisma.whatsappQueueAlertLog.create({
        data: {
          meetId: data.meetId,
          lifterId: data.lifterId,
          lifterName: data.lifterName,
          phoneNumber: data.phoneNumber,
          queuePosition: data.queuePosition,
          attemptInfo: `${data.discipline.toUpperCase()} Attempt ${data.attemptNumber} @ ${data.weightKg} KG`,
          messageText,
          channel: "TWILIO_API",
          status: "FAILED",
          errorDetails: `Twilio failed: ${twilioRes.error}. Fallback wa.me link generated.`,
          sentByRole,
        },
      }).catch(() => {});

      return {
        success: true,
        method: "FALLBACK_WA_ME",
        messageText,
        waUrl,
        coachWaUrl,
        error: `Twilio issue (${twilioRes.error}). Switched to 1-Click Free WhatsApp Link.`,
      };
    }

    // Manual 1-Click mode (Free wa.me)
    await prisma.whatsappQueueAlertLog.create({
      data: {
        meetId: data.meetId,
        lifterId: data.lifterId,
        lifterName: data.lifterName,
        phoneNumber: data.phoneNumber || "UNSPECIFIED",
        queuePosition: data.queuePosition,
        attemptInfo: `${data.discipline.toUpperCase()} Attempt ${data.attemptNumber} @ ${data.weightKg} KG`,
        messageText,
        channel: "MANUAL_WA_ME",
        status: "CLICKED",
        sentByRole,
      },
    }).catch(() => {});

    return {
      success: true,
      method: "MANUAL_WA_ME",
      messageText,
      waUrl,
      coachWaUrl,
    };
  } catch (err: any) {
    console.error("Failed to dispatch WhatsApp alert:", err);
    return {
      success: false,
      method: "MANUAL_WA_ME",
      messageText: "",
      waUrl: generateFreeWhatsAppLink(data.phoneNumber, "WPI Alert: Please report to platform staging area."),
      error: err.message || "Failed to dispatch alert.",
    };
  }
}

/**
 * 2. Update athlete's phone & coach phone directly from Backstage Desk or Profile
 */
export async function updateLifterContactAction(data: {
  userId: string;
  phoneNumber: string;
  coachPhone?: string;
  coachName?: string;
}): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Authentication required." };
    }

    const cleanPhone = sanitizePhoneNumber(data.phoneNumber);
    const cleanCoachPhone = data.coachPhone ? sanitizePhoneNumber(data.coachPhone) : null;

    // Update User model
    if (cleanPhone) {
      await prisma.user.update({
        where: { id: data.userId },
        data: { phone: cleanPhone },
      }).catch(() => {});
    }

    // Update Profile model
    await prisma.profile.upsert({
      where: { userId: data.userId },
      update: {
        phoneNumber: cleanPhone,
        coachPhone: cleanCoachPhone,
        coachName: data.coachName || undefined,
      },
      create: {
        userId: data.userId,
        gender: "MALE",
        weightClass: "WC_83",
        phoneNumber: cleanPhone,
        coachPhone: cleanCoachPhone,
        coachName: data.coachName || undefined,
      },
    });

    revalidatePath("/live/warmup");
    revalidatePath("/admin/live-scoring");
    revalidatePath("/dashboard/profile");

    return {
      success: true,
      message: "Contact phone numbers saved successfully for live call room alerts.",
    };
  } catch (err: any) {
    console.error("Failed to update contact:", err);
    return { success: false, error: err.message || "Could not save contact numbers." };
  }
}

/**
 * 3. Get WhatsApp Alert Logs for Super Admin / Admin Desk
 */
export async function getWhatsappAlertLogsAction(meetId?: string): Promise<{
  success: boolean;
  logs: any[];
  error?: string;
}> {
  try {
    const session = await auth();
    const role = session?.user?.role;
    if (role !== "ADMIN" && role !== "SUPER_ADMIN" && role !== "REFEREE") {
      return { success: false, logs: [], error: "Unauthorized access." };
    }

    const logs = await prisma.whatsappQueueAlertLog.findMany({
      where: meetId ? { meetId } : undefined,
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return { success: true, logs };
  } catch (err: any) {
    return { success: false, logs: [], error: err.message || "Failed to load logs." };
  }
}

/**
 * 4. Get and Update SaaS WhatsApp Configuration (Super Admin / Admin)
 */
export async function getWhatsappSaaSConfigAction(): Promise<{
  success: boolean;
  config: {
    twilioAccountSid: string;
    twilioPhoneNumber: string;
    isAutoDispatchEnabled: boolean;
    alertCurtainMinutes: number;
    fallbackToManual: boolean;
    hasAuthToken: boolean;
  };
}> {
  try {
    const record = await prisma.whatsappSaaSConfig.findUnique({
      where: { id: "default" },
    }).catch(() => null);

    return {
      success: true,
      config: {
        twilioAccountSid: record?.twilioAccountSid || process.env.TWILIO_ACCOUNT_SID || "",
        twilioPhoneNumber: record?.twilioPhoneNumber || process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+14155238886",
        isAutoDispatchEnabled: record?.isAutoDispatchEnabled ?? false,
        alertCurtainMinutes: record?.alertCurtainMinutes ?? 3,
        fallbackToManual: record?.fallbackToManual ?? true,
        hasAuthToken: Boolean(record?.twilioAuthToken || process.env.TWILIO_AUTH_TOKEN),
      },
    };
  } catch {
    return {
      success: true,
      config: {
        twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || "",
        twilioPhoneNumber: process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+14155238886",
        isAutoDispatchEnabled: false,
        alertCurtainMinutes: 3,
        fallbackToManual: true,
        hasAuthToken: Boolean(process.env.TWILIO_AUTH_TOKEN),
      },
    };
  }
}

export async function saveWhatsappSaaSConfigAction(data: {
  twilioAccountSid?: string;
  twilioAuthToken?: string;
  twilioPhoneNumber?: string;
  isAutoDispatchEnabled: boolean;
  alertCurtainMinutes?: number;
}): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const session = await auth();
    const role = session?.user?.role;
    if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
      return { success: false, error: "Only administrators can configure WhatsApp services." };
    }

    await prisma.whatsappSaaSConfig.upsert({
      where: { id: "default" },
      update: {
        twilioAccountSid: data.twilioAccountSid || undefined,
        twilioAuthToken: data.twilioAuthToken || undefined,
        twilioPhoneNumber: data.twilioPhoneNumber || undefined,
        isAutoDispatchEnabled: data.isAutoDispatchEnabled,
        alertCurtainMinutes: data.alertCurtainMinutes || 3,
      },
      create: {
        id: "default",
        twilioAccountSid: data.twilioAccountSid || null,
        twilioAuthToken: data.twilioAuthToken || null,
        twilioPhoneNumber: data.twilioPhoneNumber || "whatsapp:+14155238886",
        isAutoDispatchEnabled: data.isAutoDispatchEnabled,
        alertCurtainMinutes: data.alertCurtainMinutes || 3,
      },
    });

    revalidatePath("/admin/saas");
    revalidatePath("/admin/live-scoring");
    revalidatePath("/live/warmup");

    return {
      success: true,
      message: `WhatsApp queue configuration updated. Mode: ${
        data.isAutoDispatchEnabled ? "⚡ Automatic Twilio Dispatch (with Free Fallback)" : "📲 1-Click Free Manual Fallback"
      }`,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to save configuration." };
  }
}

/**
 * 5. Test Send WhatsApp alert to verify Twilio credentials or generate test link
 */
export async function testSendWhatsappAlertAction(data: {
  testPhoneNumber: string;
  queuePosition?: QueuePosition;
}): Promise<{
  success: boolean;
  message: string;
  waUrl: string;
  method: "TWILIO_API" | "MANUAL_WA_ME" | "FALLBACK_WA_ME";
  error?: string;
}> {
  try {
    const session = await auth();
    const role = session?.user?.role;
    if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
      return {
        success: false,
        message: "Unauthorized",
        waUrl: "",
        method: "MANUAL_WA_ME",
        error: "Only administrators can run test dispatches.",
      };
    }

    const cleanPhone = sanitizePhoneNumber(data.testPhoneNumber);
    if (!cleanPhone) {
      return {
        success: false,
        message: "Invalid phone number",
        waUrl: "",
        method: "MANUAL_WA_ME",
        error: "Please enter a valid phone number with country code (e.g., +919876543210).",
      };
    }

    const testInput: DispatchAlertInput = {
      meetId: "test-meet",
      meetTitle: "Test Gujarat State Powerlifting Championship",
      lifterId: "test-user",
      lifterName: "Test Athlete",
      phoneNumber: cleanPhone,
      queuePosition: data.queuePosition || "IN_HOLE",
      discipline: "squat",
      attemptNumber: 2,
      weightKg: 225,
      flight: "Flight A",
    };

    const res = await dispatchLifterQueueAlertAction(testInput);

    return {
      success: res.success,
      message:
        res.method === "TWILIO_API"
          ? "✅ Automated Twilio WhatsApp message delivered successfully!"
          : res.method === "FALLBACK_WA_ME"
          ? "⚠️ Twilio API failed or balance out. Switched to Free 1-Click wa.me fallback link."
          : "📲 1-Click Free WhatsApp link generated successfully.",
      waUrl: res.waUrl,
      method: res.method,
      error: res.error,
    };
  } catch (err: any) {
    return {
      success: false,
      message: "Test dispatch failed",
      waUrl: "",
      method: "MANUAL_WA_ME",
      error: err.message || "Unexpected error during test dispatch.",
    };
  }
}

