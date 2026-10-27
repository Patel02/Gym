"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  runIPFAutomatedFlightSort,
  IPFFlightGroup,
  IPFSortingEngineResult,
  LifterRegistrationInput,
  MAX_LIFTERS_PER_FLIGHT,
} from "@/lib/ipf-flight-engine";

// ─────────────────────────────────────────────────────────────────────────────
// IPF FLIGHT MANAGER — Automatic lot assignment, flight sorting & lifting order
// Based on IPF Technical Rules 2024:
//   - Max 14 lifters per flight
//   - Separation by gender, division, and weight class
//   - Opener-based splitting for large categories (Flight A & B)
//   - Cryptographically fair CSPRNG lot randomizer
// ─────────────────────────────────────────────────────────────────────────────

export interface FlightLifter {
  userId: string;
  registrationId?: string;
  name: string;
  email: string | null;
  phone?: string | null;
  coachPhone?: string | null;
  coachName?: string | null;
  weightClass: string;
  gender: string;
  division: string;
  equipment: string;
  bodyweight: number;
  lotNumber: number;
  flightLabel: string;
  liftingOrder: number;
  projectedTotal?: number;
  squat1Declared: number;
  bench1Declared: number;
  deadlift1Declared: number;
}

export interface FlightGroup {
  label: string; // "A", "B", "C"
  fullLabel?: string;
  gender?: string;
  equipment?: string;
  weightClassesSummary?: string;
  sessionNumber?: number;
  lifters: FlightLifter[];
}

export interface FlightManagerData {
  eventId: string;
  eventTitle: string;
  eventDate?: Date | string;
  eventLocation?: string | null;
  eventStatus?: string;
  registrationClose?: Date | string;
  flights: FlightGroup[];
  ipfFlights?: IPFFlightGroup[];
  totalLifters: number;
  totalFlights: number;
  isLotAssigned: boolean;
  proofHash?: string;
  generatedAt?: string;
}

// Helper to verify admin, super admin, or referee clearance
async function ensureFlightAccess() {
  const session = await auth();
  const role = session?.user?.role;
  if (
    !session?.user?.id ||
    (role !== "ADMIN" && role !== "SUPER_ADMIN" && role !== "REFEREE" && role !== "MEET_DIRECTOR")
  ) {
    throw new Error("Unauthorized access. Admin, Meet Director, or Referee clearance required.");
  }
  return session.user;
}

// ─────────────────────────────────────────────────────────────────────────────
// GET FLIGHT DATA
// ─────────────────────────────────────────────────────────────────────────────

export async function getFlightManagerDataAction(eventId: string): Promise<{
  success: boolean;
  data?: FlightManagerData;
  error?: string;
}> {
  try {
    await ensureFlightAccess();

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return { success: false, error: "Event not found." };

    const registrations = await prisma.meetRegistration.findMany({
      where: { eventId, status: "APPROVED" },
      include: {
        user: {
          include: { profile: true },
        },
      },
      orderBy: [{ lotNumber: "asc" }],
    });

    if (registrations.length === 0) {
      return {
        success: true,
        data: {
          eventId,
          eventTitle: event.title,
          eventDate: event.date,
          eventLocation: event.location,
          flights: [],
          ipfFlights: [],
          totalLifters: 0,
          totalFlights: 0,
          isLotAssigned: false,
        },
      };
    }

    const isLotAssigned = registrations.some((r) => r.lotNumber !== null && r.lotNumber > 0);

    // Map registrations to IPF Engine format
    const engineInputs: LifterRegistrationInput[] = registrations.map((reg) => ({
      registrationId: reg.id,
      userId: reg.userId,
      name: reg.user.name || reg.user.email || "Competitor",
      email: reg.user.email,
      phone: reg.contactPhone || reg.user.phone || reg.user.profile?.phoneNumber || null,
      coachPhone: reg.coachPhone || reg.user.profile?.coachPhone || null,
      coachName: reg.user.profile?.coachName || null,
      gender: reg.user.profile?.gender || "MALE",
      weightClass: reg.user.profile?.weightClass || "WC_83",
      division: reg.division,
      equipment: reg.equipment,
      bodyweight: reg.bodyweight,
      currentLotNumber: reg.lotNumber,
    }));

    // Run IPF compliant flight sorting engine
    const sortResult = runIPFAutomatedFlightSort(eventId, engineInputs, {
      preserveExistingLots: isLotAssigned,
    });

    // Format flight groups for backward-compatible frontend consumers
    const flightGroups: FlightGroup[] = sortResult.flights.map((f) => ({
      label: f.flightLabel.replace("Flight ", "").split(" ")[0] || "A",
      fullLabel: f.flightLabel,
      gender: f.gender,
      equipment: f.equipment,
      weightClassesSummary: f.weightClassesSummary,
      sessionNumber: f.sessionNumber,
      lifters: f.lifters.map((l) => ({
        userId: l.userId,
        registrationId: l.registrationId,
        name: l.name,
        email: l.email || null,
        phone: l.phone || null,
        coachPhone: l.coachPhone || null,
        coachName: l.coachName || null,
        weightClass: l.normalizedWeightClass,
        gender: l.gender,
        division: l.division || "OPEN",
        equipment: l.equipment || "RAW",
        bodyweight: l.bodyweight || 83,
        lotNumber: l.lotNumber,
        flightLabel: l.flightLabel,
        liftingOrder: l.liftingOrderInFlight,
        projectedTotal: l.projectedTotal,
        squat1Declared: estimateOpeningAttempt(l.bodyweight, "squat"),
        bench1Declared: estimateOpeningAttempt(l.bodyweight, "bench"),
        deadlift1Declared: estimateOpeningAttempt(l.bodyweight, "deadlift"),
      })),
    }));

    return {
      success: true,
      data: {
        eventId,
        eventTitle: event.title,
        eventDate: event.date,
        eventLocation: event.location,
        eventStatus: event.status,
        registrationClose: event.registrationClose,
        flights: flightGroups,
        ipfFlights: sortResult.flights,
        totalLifters: registrations.length,
        totalFlights: flightGroups.length,
        isLotAssigned,
        proofHash: sortResult.proofHash,
        generatedAt: sortResult.generatedAt,
      },
    };
  } catch (err: any) {
    console.error("Flight manager error:", err);
    return { success: false, error: err.message || "Failed to load flight data." };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// LIST MANAGEABLE EVENTS FOR FLIGHT CONTROL ROOM
// ─────────────────────────────────────────────────────────────────────────────

export async function listManageableEventsAction(): Promise<{
  success: boolean;
  events?: Array<{
    id: string;
    title: string;
    date: Date | string;
    location: string;
    status: string;
    registrationClose?: Date | string;
    maxAthletes: number;
    approvedCount: number;
    pendingCount: number;
  }>;
  error?: string;
}> {
  try {
    await ensureFlightAccess();

    const events = await prisma.event.findMany({
      orderBy: { date: "desc" },
      include: {
        registrations: {
          select: { status: true },
        },
      },
    });

    const formatted = events.map((e) => {
      const approvedCount = e.registrations.filter((r) => r.status === "APPROVED").length;
      const pendingCount = e.registrations.filter((r) => r.status === "PENDING_PAYMENT").length;

      return {
        id: e.id,
        title: e.title,
        date: e.date,
        location: e.location,
        status: e.status,
        registrationClose: e.registrationClose,
        maxAthletes: e.maxAthletes,
        approvedCount,
        pendingCount,
      };
    });

    return { success: true, events: formatted };
  } catch (err: any) {
    console.error("Failed to list events:", err);
    return { success: false, error: err.message || "Failed to list events." };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GENERATE & PERSIST IPF FLIGHTS & LOTS (CSPRNG + SHA-256 PROOF)
// ─────────────────────────────────────────────────────────────────────────────

export async function generateIPFFlightsAction(
  eventId: string,
  options?: { reshuffleLots?: boolean }
): Promise<{
  success: boolean;
  message?: string;
  proofHash?: string;
  totalAssigned?: number;
  totalFlights?: number;
  error?: string;
}> {
  try {
    const caller = await ensureFlightAccess();

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return { success: false, error: "Event not found." };

    const registrations = await prisma.meetRegistration.findMany({
      where: { eventId, status: "APPROVED" },
      include: {
        user: {
          include: { profile: true },
        },
      },
    });

    if (registrations.length === 0) {
      return { success: false, error: "No approved lifter registrations found for this meet." };
    }

    const engineInputs: LifterRegistrationInput[] = registrations.map((reg) => ({
      registrationId: reg.id,
      userId: reg.userId,
      name: reg.user.name || reg.user.email || "Competitor",
      email: reg.user.email,
      phone: reg.contactPhone || reg.user.phone || reg.user.profile?.phoneNumber || null,
      coachPhone: reg.coachPhone || reg.user.profile?.coachPhone || null,
      coachName: reg.user.profile?.coachName || null,
      gender: reg.user.profile?.gender || "MALE",
      weightClass: reg.user.profile?.weightClass || "WC_83",
      division: reg.division,
      equipment: reg.equipment,
      bodyweight: reg.bodyweight,
      currentLotNumber: options?.reshuffleLots ? undefined : reg.lotNumber,
    }));

    const sortResult = runIPFAutomatedFlightSort(eventId, engineInputs, {
      preserveExistingLots: !options?.reshuffleLots,
    });

    // Save assigned lots in database transaction
    await prisma.$transaction(
      sortResult.allLifters.map((lifter) =>
        prisma.meetRegistration.update({
          where: { id: lifter.registrationId },
          data: { lotNumber: lifter.lotNumber },
        })
      )
    );

    // Audit log
    await prisma.auditLog.create({
      data: {
        adminId: caller.id,
        action: "GENERATE_IPF_FLIGHTS",
        entityType: "EVENT",
        entityId: eventId,
        details: JSON.stringify({
          totalAthletes: sortResult.totalAthletes,
          totalFlights: sortResult.totalFlights,
          proofHash: sortResult.proofHash,
          seedHex: sortResult.seedHex,
          method: "IPF_CSPRNG_FISHER_YATES_SHA256",
          flightsSummary: sortResult.flights.map((f) => ({
            label: f.flightLabel,
            classes: f.weightClassesSummary,
            count: f.totalLifters,
          })),
        }),
      },
    });

    revalidatePath("/admin/flights");
    revalidatePath("/admin/weigh-in");
    revalidatePath("/admin/live-scoring");
    revalidatePath("/referee/dashboard");
    revalidatePath("/dashboard");
    revalidatePath("/championships");

    return {
      success: true,
      message: `🎉 Successfully created ${sortResult.totalFlights} IPF Compliant Flights and assigned lot numbers to ${sortResult.totalAthletes} athletes!`,
      proofHash: sortResult.proofHash,
      totalAssigned: sortResult.totalAthletes,
      totalFlights: sortResult.totalFlights,
    };
  } catch (err: any) {
    console.error("Generate IPF flights failed:", err);
    return { success: false, error: err.message || "Failed to generate IPF flights." };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// BROADCAST FLIGHT WHATSAPP ALERTS (1-Click & API Dispatch)
// ─────────────────────────────────────────────────────────────────────────────

export async function broadcastFlightWhatsAppAlertsAction(
  eventId: string,
  flightLabel: string
): Promise<{
  success: boolean;
  message?: string;
  alerts?: Array<{
    name: string;
    phone: string | null;
    lotNumber: number;
    weightClass: string;
    waUrl: string;
  }>;
  error?: string;
}> {
  try {
    await ensureFlightAccess();

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return { success: false, error: "Event not found." };

    const dataRes = await getFlightManagerDataAction(eventId);
    if (!dataRes.success || !dataRes.data) {
      return { success: false, error: "Flight data not available." };
    }

    const flight = dataRes.data.flights.find(
      (f) =>
        f.label === flightLabel ||
        f.fullLabel === flightLabel ||
        `Flight ${f.label}` === flightLabel
    );

    if (!flight) {
      return { success: false, error: `Flight ${flightLabel} not found in this meet.` };
    }

    const eventDateStr = event.date ? new Date(event.date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    }) : "Match Day";

    const alerts = flight.lifters.map((l) => {
      const cleanPhone = l.phone ? l.phone.replace(/[^0-9]/g, "") : "";
      const text =
        `🚨 *OFFICIAL IPF FLIGHT ALLOTMENT ALERT* 🚨\n\n` +
        `Dear *${l.name}*,\n` +
        `Your official flight allotment for *${event.title}* (${eventDateStr}) is confirmed:\n\n` +
        `🥋 *Flight:* ${flight.fullLabel || `Flight ${flight.label}`}\n` +
        `🔢 *Official Lot:* #${l.lotNumber}\n` +
        `⚖️ *Weight Class:* ${l.weightClass}\n` +
        `⏱️ *Weigh-In:* Mandatory 2 hours prior to flight start.\n\n` +
        `Good luck on the platform! — Technical Committee, WPI Gujarat`;

      const waUrl = cleanPhone
        ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`
        : "";

      return {
        name: l.name,
        phone: l.phone || null,
        lotNumber: l.lotNumber,
        weightClass: l.weightClass,
        waUrl,
      };
    });

    return {
      success: true,
      message: `Generated alerts for ${alerts.length} lifters in ${flightLabel}.`,
      alerts,
    };
  } catch (err: any) {
    console.error("Broadcast error:", err);
    return { success: false, error: err.message || "Failed to generate flight alerts." };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ASSIGN LOT NUMBERS (Random draw at weigh-in - Backward Compatibility)
// ─────────────────────────────────────────────────────────────────────────────

export async function assignLotNumbersAction(eventId: string): Promise<{
  success: boolean;
  error?: string;
  message?: string;
  totalAssigned?: number;
}> {
  const res = await generateIPFFlightsAction(eventId, { reshuffleLots: true });
  return {
    success: res.success,
    error: res.error,
    message: res.message,
    totalAssigned: res.totalAssigned,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// RESHUFFLE LOTS (Re-run the draw)
// ─────────────────────────────────────────────────────────────────────────────

export async function reshuffleLotNumbersAction(eventId: string): Promise<{
  success: boolean;
  error?: string;
  message?: string;
}> {
  return generateIPFFlightsAction(eventId, { reshuffleLots: true });
}

// ─────────────────────────────────────────────────────────────────────────────
// MANUALLY SET SINGLE LOT NUMBER
// ─────────────────────────────────────────────────────────────────────────────

export async function setManualLotNumberAction(
  userId: string,
  eventId: string,
  lotNumber: number
): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    const session = await auth();
    const adminId = session?.user?.id;
    const role = session?.user?.role;
    if (!adminId || (role !== "ADMIN" && role !== "REFEREE")) {
      return { success: false, error: "Unauthorized." };
    }

    if (lotNumber < 1 || lotNumber > 999) {
      return { success: false, error: "Invalid lot number (must be between 1 and 999)." };
    }

    // Check for collision
    const conflict = await prisma.meetRegistration.findFirst({
      where: { eventId, lotNumber, NOT: { userId } },
      include: { user: { select: { name: true } } },
    });

    if (conflict) {
      return {
        success: false,
        error: `Lot #${lotNumber} is already assigned to ${conflict.user.name || "another athlete"}.`,
      };
    }

    await prisma.meetRegistration.update({
      where: { userId_eventId: { userId, eventId } },
      data: { lotNumber },
    });

    revalidatePath("/referee/dashboard");
    revalidatePath("/admin/flights");
    revalidatePath("/admin/weigh-in");
    revalidatePath("/dashboard");

    return { success: true, message: `Lot #${lotNumber} manually assigned.` };
  } catch (err: any) {
    console.error("Manual lot set failed:", err);
    return { success: false, error: err.message || "Failed to set lot number." };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// LOCK REGISTRATIONS & FINALIZE IPF FLIGHTS
// ─────────────────────────────────────────────────────────────────────────────

export async function lockRegistrationAndSortFlightsAction(eventId: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    await ensureFlightAccess();

    await prisma.event.update({
      where: { id: eventId },
      data: {
        status: "REGISTRATION CLOSED",
        registrationClose: new Date(),
      },
    });

    const res = await generateIPFFlightsAction(eventId, { reshuffleLots: false });
    if (!res.success) {
      return { success: false, error: res.error || "Failed to finalize flights." };
    }

    revalidatePath("/admin/flights");
    revalidatePath("/admin/events");
    revalidatePath("/championships");

    return {
      success: true,
      message: `Registration deadline closed and ${res.totalFlights} IPF Flights officially locked!`,
    };
  } catch (err: any) {
    console.error("Lock registrations failed:", err);
    return { success: false, error: err.message || "Failed to lock registrations." };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SEED REALISTIC IPF DEMO ROSTER (For testing multi-flight grouping & splitting)
// ─────────────────────────────────────────────────────────────────────────────

export async function seedDemoIPFRosterAction(eventId: string): Promise<{
  success: boolean;
  message?: string;
  count?: number;
  error?: string;
}> {
  try {
    await ensureFlightAccess();

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return { success: false, error: "Event not found." };

    const demoAthletes = [
      // 16 Athletes in WC_83 (will split into Flight A & B based on openers!)
      { name: "Arjun Verma", weightClass: "WC_83", bw: 82.4, sq: 240, bp: 160, dl: 280, phone: "+919876500101" },
      { name: "Vikram Rathore", weightClass: "WC_83", bw: 82.9, sq: 235, bp: 155, dl: 275, phone: "+919876500102" },
      { name: "Devansh Mehra", weightClass: "WC_83", bw: 81.8, sq: 230, bp: 150, dl: 270, phone: "+919876500103" },
      { name: "Rohan Joshi", weightClass: "WC_83", bw: 82.7, sq: 225, bp: 147.5, dl: 265, phone: "+919876500104" },
      { name: "Kabir Sengupta", weightClass: "WC_83", bw: 82.2, sq: 220, bp: 145, dl: 260, phone: "+919876500105" },
      { name: "Nikhil Chawla", weightClass: "WC_83", bw: 83.0, sq: 215, bp: 142.5, dl: 255, phone: "+919876500106" },
      { name: "Sameer Kulkarni", weightClass: "WC_83", bw: 81.5, sq: 210, bp: 140, dl: 250, phone: "+919876500107" },
      { name: "Manish Nair", weightClass: "WC_83", bw: 82.1, sq: 205, bp: 137.5, dl: 245, phone: "+919876500108" },
      { name: "Kunal Singhania", weightClass: "WC_83", bw: 82.6, sq: 200, bp: 135, dl: 240, phone: "+919876500109" },
      { name: "Harsh Vardhan", weightClass: "WC_83", bw: 82.3, sq: 195, bp: 130, dl: 235, phone: "+919876500110" },
      { name: "Prateek Deshmukh", weightClass: "WC_83", bw: 81.9, sq: 190, bp: 125, dl: 230, phone: "+919876500111" },
      { name: "Akash Solanki", weightClass: "WC_83", bw: 82.8, sq: 185, bp: 122.5, dl: 225, phone: "+919876500112" },
      { name: "Gaurav Malhotra", weightClass: "WC_83", bw: 82.0, sq: 180, bp: 120, dl: 220, phone: "+919876500113" },
      { name: "Amanpreet Singh", weightClass: "WC_83", bw: 82.5, sq: 175, bp: 115, dl: 215, phone: "+919876500114" },
      { name: "Bhavin Patel", weightClass: "WC_83", bw: 81.7, sq: 170, bp: 112.5, dl: 210, phone: "+919876500115" },
      { name: "Chirag Thakkar", weightClass: "WC_83", bw: 82.9, sq: 165, bp: 110, dl: 205, phone: "+919876500116" },

      // 4 Athletes in WC_59 and 4 Athletes in WC_66 (small adjacent categories combined)
      { name: "Karan Roy", weightClass: "WC_59", bw: 58.4, sq: 160, bp: 105, dl: 200, phone: "+919876500117" },
      { name: "Rajat Pandey", weightClass: "WC_59", bw: 58.9, sq: 155, bp: 100, dl: 195, phone: "+919876500118" },
      { name: "Varun Bajaj", weightClass: "WC_59", bw: 57.8, sq: 150, bp: 97.5, dl: 190, phone: "+919876500119" },
      { name: "Tejas Shah", weightClass: "WC_59", bw: 58.2, sq: 145, bp: 95, dl: 185, phone: "+919876500120" },

      { name: "Deepak Yadav", weightClass: "WC_66", bw: 65.2, sq: 185, bp: 125, dl: 225, phone: "+919876500121" },
      { name: "Siddharth Bose", weightClass: "WC_66", bw: 65.7, sq: 180, bp: 120, dl: 220, phone: "+919876500122" },
      { name: "Anish Aggarwal", weightClass: "WC_66", bw: 64.9, sq: 175, bp: 117.5, dl: 215, phone: "+919876500123" },
      { name: "Jayesh Parmar", weightClass: "WC_66", bw: 65.5, sq: 170, bp: 115, dl: 210, phone: "+919876500124" },

      // 2 Athletes in WC_105
      { name: "Gurpreet Dhillon", weightClass: "WC_105", bw: 104.2, sq: 275, bp: 185, dl: 310, phone: "+919876500125" },
      { name: "Yashvardhan Rana", weightClass: "WC_105", bw: 103.8, sq: 260, bp: 175, dl: 295, phone: "+919876500126" },
    ];

    let createdCount = 0;
    for (let i = 0; i < demoAthletes.length; i++) {
      const a = demoAthletes[i];
      const demoEmail = `demo.lifter.${i + 1}@wpigujarat.in`;

      const user = await prisma.user.upsert({
        where: { email: demoEmail },
        update: {
          name: a.name,
          phone: a.phone,
        },
        create: {
          email: demoEmail,
          name: a.name,
          phone: a.phone,
          role: "MEMBER",
        },
      });

      await prisma.profile.upsert({
        where: { userId: user.id },
        update: {
          gender: "MALE",
          weightClass: a.weightClass as any,
          phoneNumber: a.phone,
        },
        create: {
          userId: user.id,
          gender: "MALE",
          weightClass: a.weightClass as any,
          phoneNumber: a.phone,
        },
      });

      await prisma.meetRegistration.upsert({
        where: {
          userId_eventId: {
            userId: user.id,
            eventId,
          },
        },
        update: {
          status: "APPROVED",
          division: "OPEN",
          equipment: "RAW",
          bodyweight: a.bw,
          contactPhone: a.phone,
        },
        create: {
          userId: user.id,
          eventId,
          status: "APPROVED",
          division: "OPEN",
          equipment: "RAW",
          bodyweight: a.bw,
          contactPhone: a.phone,
        },
      });

      createdCount++;
    }

    // Auto run flight generation on newly seeded lifters
    await generateIPFFlightsAction(eventId, { reshuffleLots: true });

    revalidatePath("/admin/flights");
    revalidatePath("/admin/weigh-in");
    revalidatePath("/admin/live-scoring");

    return {
      success: true,
      message: `🎉 Successfully seeded ${createdCount} IPF lifters and partitioned into flights A, B, and C!`,
      count: createdCount,
    };
  } catch (err: any) {
    console.error("Seed demo roster failed:", err);
    return { success: false, error: err.message || "Failed to seed demo roster." };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CLEAR DEMO ROSTER
// ─────────────────────────────────────────────────────────────────────────────

export async function clearDemoRosterAction(eventId: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    await ensureFlightAccess();

    const demoUsers = await prisma.user.findMany({
      where: {
        email: {
          startsWith: "demo.lifter.",
        },
      },
      select: { id: true },
    });

    const userIds = demoUsers.map((u) => u.id);

    if (userIds.length > 0) {
      await prisma.meetRegistration.deleteMany({
        where: {
          eventId,
          userId: { in: userIds },
        },
      });
    }

    revalidatePath("/admin/flights");
    revalidatePath("/admin/weigh-in");

    return {
      success: true,
      message: "Demo lifters removed from this championship.",
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to clear demo roster." };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET LIFTING ORDER FOR CURRENT DISCIPLINE
// IPF Rule: Within a flight, lifting order for each round is:
//   Lowest declared weight → ties broken by lot number
// ─────────────────────────────────────────────────────────────────────────────

export interface LiftingOrderEntry {
  userId?: string;
  registrationId?: string;
  liftingPosition: number;
  lotNumber: number;
  name: string;
  weightClass: string;
  bodyweight: number;
  declaredWeight: number;
  resultId: string | null;
}

export async function getLiftingOrderAction(
  eventId: string,
  discipline: "squat" | "bench" | "deadlift",
  attemptNum: 1 | 2 | 3,
  flightLabel: string
): Promise<{
  success: boolean;
  order?: LiftingOrderEntry[];
  error?: string;
}> {
  try {
    const session = await auth();
    const role = session?.user?.role;
    if (role !== "ADMIN" && role !== "REFEREE" && role !== "MEET_DIRECTOR") {
      return { success: false, error: "Unauthorized access." };
    }

    const liftField = `${discipline}${attemptNum}` as
      | "squat1"
      | "squat2"
      | "squat3"
      | "bench1"
      | "bench2"
      | "bench3"
      | "deadlift1"
      | "deadlift2"
      | "deadlift3";

    // Get all approved registrations in this flight
    const registrations = await prisma.meetRegistration.findMany({
      where: { eventId, status: "APPROVED" },
      include: {
        user: {
          include: {
            profile: true,
            results: {
              where: { eventId },
            },
          },
        },
      },
      orderBy: [{ lotNumber: "asc" }],
    });

    // Filter to the specific flight (same chunking logic)
    const flightAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const flightIndex = flightAlphabet.indexOf(flightLabel.toUpperCase());
    const start = flightIndex * MAX_LIFTERS_PER_FLIGHT;
    const end = start + MAX_LIFTERS_PER_FLIGHT;
    const flightRegs = registrations.slice(start, end);

    if (flightRegs.length === 0) {
      return { success: false, error: `No lifters found in Flight ${flightLabel}.` };
    }

    // Build lifting order entries
    const entries: LiftingOrderEntry[] = flightRegs.map((reg) => {
      const result = reg.user.results[0] || null;
      const attemptWeight: number | null = result
        ? (result as any)[liftField] ?? null
        : null;

      // Use last successful or declared weight as ordering key
      const prevField = attemptNum > 1
        ? (`${discipline}${attemptNum - 1}` as string)
        : null;
      const prevWeight: number | null =
        prevField && result ? Math.abs((result as any)[prevField] ?? 0) || null : null;

      const declaredWeight = estimateOpeningAttempt(reg.bodyweight, discipline);
      const orderingWeight =
        attemptWeight !== null
          ? Math.abs(attemptWeight)
          : prevWeight !== null
          ? prevWeight + (prevWeight > 0 ? 2.5 : 2.5)
          : declaredWeight;

      return {
        userId: reg.userId,
        registrationId: reg.id,
        liftingPosition: 0, // Will be set after sort
        lotNumber: reg.lotNumber || 999,
        name: reg.user.name || reg.user.email || "Competitor",
        weightClass: reg.user.profile?.weightClass?.replace("WC_", "") + " KG" || "N/A",
        bodyweight: reg.bodyweight || 83,
        declaredWeight: orderingWeight,
        resultId: result?.id ?? null,
        _orderingWeight: orderingWeight, // temp for sorting
      } as LiftingOrderEntry & { _orderingWeight: number };
    });

    // Sort: lowest declared weight first, then lot number for ties
    entries.sort((a: any, b: any) => {
      if (a._orderingWeight !== b._orderingWeight) {
        return a._orderingWeight - b._orderingWeight;
      }
      return a.lotNumber - b.lotNumber;
    });

    // Assign lifting positions
    entries.forEach((e, idx) => {
      e.liftingPosition = idx + 1;
      delete (e as any)._orderingWeight;
    });

    return { success: true, order: entries };
  } catch (err: any) {
    console.error("Lifting order error:", err);
    return { success: false, error: err.message || "Failed to generate lifting order." };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function estimateOpeningAttempt(
  bodyweight: number | null | undefined,
  discipline: "squat" | "bench" | "deadlift"
): number {
  const bw = bodyweight || 83;
  const multipliers = { squat: 1.8, bench: 1.1, deadlift: 2.2 };
  const raw = Math.round((bw * multipliers[discipline]) / 2.5) * 2.5;
  // Clamp to reasonable minimums
  const minimums = { squat: 60, bench: 40, deadlift: 80 };
  return Math.max(raw, minimums[discipline]);
}
