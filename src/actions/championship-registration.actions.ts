"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateQrDataUrl } from "@/lib/qr-generator";
import { Division, EquipmentType, Gender, MeetStatus, WeightClass } from "@prisma/client";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";

export interface MeetRegistrationFormInput {
  meetId: string;
  gender: "MALE" | "FEMALE";
  weightClass: string; // e.g. "83 KG"
  division: "OPEN" | "JUNIOR" | "SUB_JUNIOR" | "MASTER_1" | "MASTER_2" | "MASTER_3" | "MASTER_4";
  equipment: "RAW" | "CLASSIC_RAW" | "EQUIPPED";
  bodyweightEstimate?: number;
  squatOpener: number;
  benchOpener: number;
  deadliftOpener: number;
  squatRackPin?: number;
  benchRackPin?: number;
  benchSafetyPin?: number;
  coachName?: string;
  coachPhone?: string;
  antiDopingAccepted: boolean;
  medicalClearanceAccepted: boolean;
  paymentMethod?: string;
}

export interface DigitalMeetTicketPayload {
  registrationId: string;
  ticketCode: string;
  meetId: string;
  meetTitle: string;
  meetDate: string;
  meetVenue: string;
  meetCity: string;
  
  athleteId: string;
  athleteName: string;
  athleteEmail: string;
  athletePhoto: string | null;
  gender: string;
  weightClass: string;
  division: string;
  equipment: string;
  
  lotNumber: number;
  flight: string;
  weighInTime: string;
  liftingTime: string;
  
  squatOpener: number;
  benchOpener: number;
  deadliftOpener: number;
  squatRackPin: number;
  benchRackPin: number;
  
  paymentTxnId: string;
  amountPaid: number;
  status: string;
  qrDataUrl: string;
  verificationUrl: string;
  registeredAt: string;
}

export interface MeetRegistrationDetailsResponse {
  success: boolean;
  error?: string;
  meet?: {
    id: string;
    title: string;
    dates: string;
    city: string;
    venue: string;
    prizePool: string;
    entryFee: string;
    entryFeeNumeric: number;
    status: string;
    daysLeft: number;
    divisions: string[];
    circularUrl?: string;
  };
  currentUser?: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    role: string;
    gender?: string;
    weightClass?: string;
    activeMembershipCard?: string;
    hasActiveMembership: boolean;
  } | null;
  existingRegistration?: DigitalMeetTicketPayload | null;
}

/**
 * Ensure an event is in Postgres db by copying from federation-events.json if missing
 */
async function ensureEventExistsInDb(meetId: string) {
  let event = await prisma.event.findUnique({ where: { id: meetId } });
  if (!event) {
    try {
      const filePath = path.join(process.cwd(), "src", "data", "federation-events.json");
      const raw = await fs.readFile(filePath, "utf-8");
      const data = JSON.parse(raw);
      const jsonEvent = data.events?.find((e: any) => e.id === meetId);

      if (jsonEvent) {
        const numericFee = parseFloat((jsonEvent.entryFee || "0").replace(/[^0-9.]/g, "")) || 2500;
        event = await prisma.event.create({
          data: {
            id: jsonEvent.id,
            title: jsonEvent.title,
            date: new Date("2026-07-18"),
            location: `${jsonEvent.venue || "Indoor Arena"}, ${jsonEvent.city || "National"}`,
            status: jsonEvent.status || "REGISTRATION OPEN",
            entryFee: numericFee,
            registrationOpen: new Date(),
            registrationClose: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            maxAthletes: 150,
            meetDirector: "Indian Powerlifting Federation Technical Council",
          },
        });
      }
    } catch (err) {
      console.error("Failed to seed event from JSON:", err);
    }
  }
  return event;
}

/**
 * Parses paymentRef JSON safely to build a DigitalMeetTicketPayload
 */
async function parseRegistrationTicket(
  reg: any,
  user: any,
  event: any
): Promise<DigitalMeetTicketPayload> {
  let meta: any = {};
  try {
    if (reg.paymentRef && reg.paymentRef.startsWith("{")) {
      meta = JSON.parse(reg.paymentRef);
    }
  } catch {}

  const ticketCode = meta.ticketCode || `IPF-MEET-2026-${reg.id.slice(-6).toUpperCase()}`;
  const verificationUrl = `https://ipf-federation.in/verify/${ticketCode}`;
  const qrDataUrl = await generateQrDataUrl(verificationUrl, { width: 300, margin: 1 });

  return {
    registrationId: reg.id,
    ticketCode,
    meetId: event.id,
    meetTitle: event.title,
    meetDate: event.date
      ? new Date(event.date).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "July 18 – 22, 2026",
    meetVenue: event.location.split(",")[0]?.trim() || "National Stadium",
    meetCity: event.location.split(",")[1]?.trim() || "Mumbai",

    athleteId: user.id,
    athleteName: user.name || "Federation Lifter",
    athleteEmail: user.email || "",
    athletePhoto: user.image || null,
    gender: user.profile?.gender || meta.gender || "MALE",
    weightClass: meta.declaredWeightClass || user.profile?.weightClass?.replace("WC_", "") || "83 KG",
    division: (reg.division || "OPEN").replace(/_/g, " "),
    equipment: (reg.equipment || "RAW").replace(/_/g, " "),

    lotNumber: reg.lotNumber || meta.lotNumber || 42,
    flight:
      meta.flight ||
      (reg.lotNumber
        ? `Flight ${String.fromCharCode(65 + Math.min(Math.floor((reg.lotNumber - 1) / 14), 5))}`
        : "Flight A (Premier)"),
    weighInTime: meta.weighInTime || "07:00 AM – 09:00 AM (Scale 1)",
    liftingTime: meta.liftingTime || "10:00 AM Sharp",

    squatOpener: meta.squatOpener || 210,
    benchOpener: meta.benchOpener || 140,
    deadliftOpener: meta.deadliftOpener || 230,
    squatRackPin: meta.squatRackPin || 12,
    benchRackPin: meta.benchRackPin || 8,

    paymentTxnId: meta.paymentTxnId || `UPI-${reg.id.slice(-8).toUpperCase()}`,
    amountPaid: meta.amountPaid || event.entryFee || 2500,
    status: reg.status || "APPROVED",
    qrDataUrl,
    verificationUrl,
    registeredAt: meta.registeredAt || new Date().toISOString(),
  };
}

/**
 * Fetch meet registration details, current athlete profile, and existing registration
 */
export async function getMeetRegistrationDetailsAction(
  meetId: string
): Promise<MeetRegistrationDetailsResponse> {
  try {
    const session = await auth();
    const event = await ensureEventExistsInDb(meetId);

    if (!event) {
      return { success: false, error: "Championship meet not found." };
    }

    // Load JSON event info for rich metadata if available
    let jsonMeetData: any = {};
    try {
      const filePath = path.join(process.cwd(), "src", "data", "federation-events.json");
      const raw = await fs.readFile(filePath, "utf-8");
      const data = JSON.parse(raw);
      jsonMeetData = data.events?.find((e: any) => e.id === meetId) || {};
    } catch {}

    const meetDetails = {
      id: event.id,
      title: event.title,
      dates: jsonMeetData.dates || "July 18 – 22, 2026",
      city: jsonMeetData.city || event.location,
      venue: jsonMeetData.venue || event.location,
      prizePool: jsonMeetData.prizePool || "₹5,00,000",
      entryFee: jsonMeetData.entryFee || `₹${event.entryFee.toLocaleString("en-IN")}`,
      entryFeeNumeric: event.entryFee || 2500,
      status: event.status,
      daysLeft: jsonMeetData.daysLeft || 45,
      divisions: jsonMeetData.divisions || ["Senior Men", "Senior Women", "Junior", "Sub-Junior"],
      circularUrl: jsonMeetData.circularUrl || "/circulars",
    };

    if (!session?.user?.id) {
      return {
        success: true,
        meet: meetDetails,
        currentUser: null,
        existingRegistration: null,
      };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        profile: true,
        memberships: {
          where: { status: "ACTIVE" },
          orderBy: { endDate: "desc" },
          take: 1,
        },
        registrations: {
          where: { eventId: event.id },
          include: { event: true },
        },
      },
    });

    if (!user) {
      return {
        success: true,
        meet: meetDetails,
        currentUser: null,
        existingRegistration: null,
      };
    }

    const activeMembership = user.memberships[0];
    const currentUserInfo = {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
      gender: user.profile?.gender,
      weightClass: user.profile?.weightClass?.replace("WC_", ""),
      activeMembershipCard: activeMembership?.cardNumber,
      hasActiveMembership: !!activeMembership,
    };

    let existingRegistrationPayload: DigitalMeetTicketPayload | null = null;
    const existingReg = user.registrations[0];
    if (existingReg) {
      existingRegistrationPayload = await parseRegistrationTicket(existingReg, user, event);
    }

    return {
      success: true,
      meet: meetDetails,
      currentUser: currentUserInfo,
      existingRegistration: existingRegistrationPayload,
    };
  } catch (err: any) {
    console.error("Failed to load meet registration details:", err);
    return { success: false, error: err.message || "Failed to load registration details." };
  }
}

/**
 * Register Athlete for a Championship Meet
 */
export async function registerAthleteForMeetAction(
  input: MeetRegistrationFormInput
): Promise<{
  success: boolean;
  error?: string;
  ticket?: DigitalMeetTicketPayload;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Please sign in to register for championship meets." };
    }

    if (!input.antiDopingAccepted) {
      return { success: false, error: "You must accept the WADA/NADA Anti-Doping declaration." };
    }

    if (!input.squatOpener || !input.benchOpener || !input.deadliftOpener) {
      return { success: false, error: "Please enter planned opening attempts for Squat, Bench, and Deadlift." };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { profile: true },
    });

    if (!user) {
      return { success: false, error: "User account not found." };
    }

    const event = await ensureEventExistsInDb(input.meetId);
    if (!event) {
      return { success: false, error: "Selected meet does not exist." };
    }

    // Map weight class to WeightClass enum
    const cleanWc = input.weightClass.replace(/[^0-9+]/g, "");
    let enumWc: WeightClass = WeightClass.WC_83;
    if (cleanWc === "47") enumWc = WeightClass.WC_47;
    else if (cleanWc === "52") enumWc = WeightClass.WC_52;
    else if (cleanWc === "57") enumWc = WeightClass.WC_57;
    else if (cleanWc === "59") enumWc = WeightClass.WC_59;
    else if (cleanWc === "63") enumWc = WeightClass.WC_63;
    else if (cleanWc === "66") enumWc = WeightClass.WC_66;
    else if (cleanWc === "69") enumWc = WeightClass.WC_69;
    else if (cleanWc === "74") enumWc = WeightClass.WC_74;
    else if (cleanWc === "76") enumWc = WeightClass.WC_76;
    else if (cleanWc === "83") enumWc = WeightClass.WC_83;
    else if (cleanWc === "84") enumWc = WeightClass.WC_84;
    else if (cleanWc === "84+" || cleanWc === "+84") enumWc = WeightClass.WC_84_PLUS;
    else if (cleanWc === "93") enumWc = WeightClass.WC_93;
    else if (cleanWc === "105") enumWc = WeightClass.WC_105;
    else if (cleanWc === "120") enumWc = WeightClass.WC_120;
    else if (cleanWc === "120+" || cleanWc === "+120") enumWc = WeightClass.WC_120_PLUS;

    // Map division
    let enumDivision: Division = Division.OPEN;
    if (input.division === "JUNIOR") enumDivision = Division.JUNIOR;
    else if (input.division === "SUB_JUNIOR") enumDivision = Division.SUB_JUNIOR;
    else if (input.division === "MASTER_1") enumDivision = Division.MASTER_1;
    else if (input.division === "MASTER_2") enumDivision = Division.MASTER_2;
    else if (input.division === "MASTER_3") enumDivision = Division.MASTER_3;
    else if (input.division === "MASTER_4") enumDivision = Division.MASTER_4;

    // Map equipment
    let enumEquip: EquipmentType = EquipmentType.RAW;
    if (input.equipment === "EQUIPPED") enumEquip = EquipmentType.EQUIPPED;
    else if (input.equipment === "CLASSIC_RAW") enumEquip = EquipmentType.CLASSIC_RAW;

    // Determine estimated bodyweight
    const bodyweight = input.bodyweightEstimate || (input.gender === "FEMALE" ? 62.5 : 82.5);

    // Generate unique lot number (between 1 and 120)
    const existingLots = await prisma.meetRegistration.findMany({
      where: { eventId: event.id },
      select: { lotNumber: true },
    });
    const takenLots = new Set(existingLots.map((r) => r.lotNumber).filter(Boolean));
    let assignedLot = Math.floor(Math.random() * 99) + 1;
    while (takenLots.has(assignedLot) && takenLots.size < 120) {
      assignedLot = (assignedLot % 120) + 1;
    }

    // Determine flight group based on weight class & division
    const heavyClasses = ["93", "105", "120", "+120", "120+"];
    const flight = heavyClasses.includes(cleanWc) ? "Flight B (Heavyweights)" : "Flight A (Middleweights)";

    const ticketCode = `IPF-MEET-2026-${cleanWc}${input.gender.charAt(0)}-${String(assignedLot).padStart(3, "0")}`;
    const paymentTxnId = `UPI-PAY-2026-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // Metadata payload saved in paymentRef
    const metadataPayload = {
      ticketCode,
      paymentTxnId,
      paymentMethod: input.paymentMethod || "UPI Express QR",
      amountPaid: event.entryFee || 2500,
      gender: input.gender,
      declaredWeightClass: `${cleanWc} KG`,
      squatOpener: input.squatOpener,
      benchOpener: input.benchOpener,
      deadliftOpener: input.deadliftOpener,
      squatRackPin: input.squatRackPin || 12,
      benchRackPin: input.benchRackPin || 8,
      benchSafetyPin: input.benchSafetyPin || 5,
      coachName: input.coachName || "Self-Coached / Corner Support",
      coachPhone: input.coachPhone || "+91 7043951377",
      flight,
      weighInTime: "07:00 AM – 09:00 AM (Official Weigh-In Scale Room)",
      liftingTime: "10:00 AM Sharp (Championship Platform)",
      lotNumber: assignedLot,
      registeredAt: new Date().toISOString(),
    };

    const registration = await prisma.$transaction(async (tx) => {
      // 1. Update or create Profile with category/gender
      await tx.profile.upsert({
        where: { userId: user.id },
        update: {
          gender: input.gender as Gender,
          weightClass: enumWc,
        },
        create: {
          userId: user.id,
          gender: input.gender as Gender,
          weightClass: enumWc,
        },
      });

      // 2. Upsert MeetRegistration
      const reg = await tx.meetRegistration.upsert({
        where: {
          userId_eventId: {
            userId: user.id,
            eventId: event.id,
          },
        },
        update: {
          division: enumDivision,
          equipment: enumEquip,
          status: MeetStatus.APPROVED,
          bodyweight,
          lotNumber: assignedLot,
          paymentRef: JSON.stringify(metadataPayload),
        },
        create: {
          userId: user.id,
          eventId: event.id,
          division: enumDivision,
          equipment: enumEquip,
          status: MeetStatus.APPROVED,
          bodyweight,
          lotNumber: assignedLot,
          paymentRef: JSON.stringify(metadataPayload),
        },
      });

      // 3. Auto-enroll into Result table for Match Day platform scoring with planned openers
      await tx.result.upsert({
        where: {
          userId_eventId: {
            userId: user.id,
            eventId: event.id,
          },
        },
        update: {
          squat1: input.squatOpener,
          bench1: input.benchOpener,
          deadlift1: input.deadliftOpener,
        },
        create: {
          userId: user.id,
          eventId: event.id,
          version: 1,
          squat1: input.squatOpener,
          bench1: input.benchOpener,
          deadlift1: input.deadliftOpener,
          total: 0,
          ipfGlPoints: 0,
        },
      });

      // 4. Create Audit Log entry
      await tx.auditLog.create({
        data: {
          adminId: user.id,
          action: "CHAMPIONSHIP_ONLINE_ENTRY_APPROVED",
          entityType: "MEET_REGISTRATION",
          entityId: reg.id,
          details: JSON.stringify({
            meetTitle: event.title,
            ticketCode,
            weightClass: `${cleanWc} KG`,
            division: input.division,
            equipment: input.equipment,
            lotNumber: assignedLot,
          }),
        },
      });

      return reg;
    });

    revalidatePath("/dashboard");
    revalidatePath("/championships");
    revalidatePath(`/championships/${event.id}/register`);
    revalidatePath("/admin/live-scoring");
    revalidatePath("/admin/weigh-in");
    revalidatePath("/live");

    const fullTicket = await parseRegistrationTicket(registration, user, event);

    return {
      success: true,
      ticket: fullTicket,
    };
  } catch (err: any) {
    console.error("Failed to register athlete for meet:", err);
    return { success: false, error: err.message || "Failed to submit registration." };
  }
}

/**
 * Fetch all active meet registrations for the logged-in athlete to display in Dashboard
 */
export async function getUserActiveRegistrationsAction(): Promise<{
  success: boolean;
  registrations?: DigitalMeetTicketPayload[];
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: true, registrations: [] };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        profile: true,
        registrations: {
          include: { event: true },
          orderBy: { event: { date: "asc" } },
        },
      },
    });

    if (!user || !user.registrations.length) {
      return { success: true, registrations: [] };
    }

    const ticketPromises = user.registrations.map((reg) =>
      parseRegistrationTicket(reg, user, reg.event)
    );
    const tickets = await Promise.all(ticketPromises);

    return {
      success: true,
      registrations: tickets,
    };
  } catch (err: any) {
    console.error("Failed to fetch athlete active registrations:", err);
    return { success: false, error: err.message || "Failed to load active registrations." };
  }
}
