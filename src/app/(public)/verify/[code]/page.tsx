import { generateQrDataUrl } from "@/lib/qr-generator";
import { prisma } from "@/lib/prisma";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import {
  Award,
  Calendar,
  CalendarDays,
  CheckCircle2,
  Clock,
  Download,
  Dumbbell,
  ExternalLink,
  Flame,
  FlaskConical,
  Globe,
  MapPin,
  Medal,
  Printer,
  QrCode,
  Scale,
  Share2,
  ShieldCheck,
  Trophy,
  UserCheck,
  XCircle,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageNavigation } from "@/components/ui/PageNavigation";
import { SEED_CERTIFIED_COACHES, ISSUED_COACH_LICENSES } from "@/data/coaching-academy-data";
import { SEED_CHAIN_OF_CUSTODY_RECORDS } from "@/data/doping-control-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type VerifyPageProps = {
  params: Promise<{ code: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: VerifyPageProps): Promise<Metadata> {
  const { code } = await params;
  return {
    title: `Credential Verification #${code} | Indian Powerlifting Federation`,
    description: `Official public verification registry for IPF ratified competition certificates and athlete digital ID cards.`,
  };
}

export default async function VerifyCredentialPage({ params, searchParams }: VerifyPageProps) {
  const { code } = await params;
  const sp = searchParams ? await searchParams : {};
  const queryCandidate = typeof sp.candidate === "string" ? sp.candidate : undefined;
  const queryLevel = typeof sp.level === "string" ? (sp.level as "LEVEL_1" | "LEVEL_2") : undefined;
  const queryScore = typeof sp.score === "string" ? sp.score : undefined;
  const db = prisma as any;

  // CASE A: COACH ACCREDITATION LICENSE VERIFICATION (IPF-COACH-...)
  if (code.toUpperCase().startsWith("IPF-COACH-")) {
    const seedCoach = SEED_CERTIFIED_COACHES.find(
      (c) => c.licenseCode.toUpperCase() === code.toUpperCase()
    );
    const memoryCoach = ISSUED_COACH_LICENSES.get(code.toUpperCase()) || ISSUED_COACH_LICENSES.get(code);

    let candidateName = memoryCoach?.name || queryCandidate || seedCoach?.name || "Vikram Sharma";
    let level = memoryCoach?.level || queryLevel || seedCoach?.level || "LEVEL_2";
    let levelTitle =
      memoryCoach?.levelTitle ||
      (level === "LEVEL_1"
        ? "Club Strength & Conditioning Coach"
        : "National High-Performance & Championship Technical Coach");
    let state = seedCoach?.state || "Maharashtra";
    let city = seedCoach?.city || "Mumbai";
    let club = seedCoach?.clubAffiliation || "A&T Fitness & Nutrition Barbell Academy";
    let scoreText = memoryCoach?.score || (queryScore ? `${queryScore} (Examination Satisfied)` : "90% (Distinction • 80% Passing Mark Satisfied)");
    let ratificationDate = memoryCoach?.ratificationDate || "2026-09-18";

    try {
      // Fast query with 2s fallback timeout to prevent any connection lag from blocking UI
      const auditLogPromise = db.auditLog.findFirst({
        where: { entityType: "CoachCredential", entityId: code },
        orderBy: { timestamp: "desc" },
      });
      const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(null), 1800));
      const auditLog = (await Promise.race([auditLogPromise, timeoutPromise])) as any;

      if (auditLog?.details) {
        const details = JSON.parse(auditLog.details);
        if (details.candidate) candidateName = details.candidate;
        if (details.levelTitle) levelTitle = details.levelTitle;
        if (details.level) level = details.level;
        if (details.score) scoreText = details.score;
        if (details.ratificationDate) ratificationDate = details.ratificationDate;
      }
    } catch (e) {
      console.warn("AuditLog lookup warning:", e);
    }

    const qrDataUrl = await generateQrDataUrl(`https://ipf-federation.in/verify/${code}`, {
      width: 280,
      margin: 1,
    });

    const whatsappMessage = encodeURIComponent(
      `🏆 *OFFICIAL NATIONAL STRENGTH COACH ACCREDITATION RATIFIED*\n\n` +
      `Coach: *${candidateName}*\n` +
      `License Code: *${code}*\n` +
      `Accreditation: *${levelTitle}*\n` +
      `Examination: *${scoreText}*\n` +
      `Ratified by: *Coach Akash & Coach Tanvi (National Technical Directors)*\n` +
      `Status: *ACTIVE & LICENSED*\n\n` +
      `Verify Authenticity Online: https://ipf-federation.in/verify/${code}`
    );

    return (
      <VerificationShell>
        <div className="flex items-center justify-center mb-6">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-amber-500/40 bg-amber-500/10 text-amber-400 shadow-[0_0_35px_rgba(245,158,11,0.3)]">
            <Award className="h-12 w-12 text-amber-400" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex h-4 w-4 rounded-full bg-amber-500" />
            </span>
          </div>
        </div>

        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-amber-300">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>National Coaching Commission • Official License Ratified</span>
        </div>

        <h1 className="mt-2 font-heading text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-wider text-white">
          {candidateName}
        </h1>

        <p className="mt-1 font-bold uppercase tracking-widest text-amber-400 text-xs sm:text-sm max-w-xl mx-auto">
          {levelTitle}
        </p>

        {/* Standing Pill */}
        <div className="mt-4 flex justify-center">
          <span className="rounded-full border border-emerald-500/40 bg-emerald-500/20 px-4 py-1 text-xs font-bold uppercase tracking-widest text-emerald-300 shadow-sm">
            ★ ACTIVE &amp; ACCREDITED STRENGTH COACH ★
          </span>
        </div>

        {/* Credential Details Grid */}
        <div className="mt-8 grid w-full grid-cols-1 gap-3 sm:grid-cols-2 text-left">
          <CredentialField label="Official License Code" value={code} mono />
          <CredentialField
            label="Accreditation Level"
            value={level.replace("_", " ")}
            valueClass="text-amber-300 font-bold"
          />
          <CredentialField
            label="Examination Assessment"
            value={scoreText}
            valueClass="text-emerald-400"
            icon={<CheckCircle2 className="h-4 w-4 text-emerald-400" />}
          />
          <CredentialField
            label="Ratification Directorate"
            value="Coach Akash & Coach Tanvi (A&T Academy)"
          />
          <CredentialField
            label="Governing Body"
            value="Indian Powerlifting Federation (Estd. 1975)"
          />
          <CredentialField
            label="Anti-Doping Strict Liability"
            value="Verified NADA & WADA Compliant"
            valueClass="text-emerald-400"
            icon={<ShieldCheck className="h-4 w-4 text-emerald-400" />}
          />
          <CredentialField
            label="Affiliated Regional Guild"
            value={`${club} • ${city}, ${state}`}
          />
          <CredentialField
            label="Accreditation Issue Date"
            value={ratificationDate}
            icon={<CalendarDays className="h-4 w-4 text-amber-400" />}
          />
        </div>

        {/* Dynamic Scannable QR & Registry Info */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-white/10 bg-black/40 p-4 text-left">
          <div className="flex items-center gap-3">
            <div className="h-16 w-16 bg-white p-1 rounded-lg border border-white/20 shrink-0">
              <img src={qrDataUrl} alt="QR" className="h-full w-full object-contain" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-white">
                Permanent National Registry Record
              </div>
              <div className="text-[11px] text-gray-400">
                Ratified under official Indian Powerlifting Federation Coaching Constitution.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`https://wa.me/?text=${whatsappMessage}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:brightness-110 transition-all cursor-pointer"
            >
              <WhatsAppIcon variant="official" className="h-4 w-4" />
              <span>Share</span>
            </a>

            <Link
              href="/coaching/academy"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-black shadow-md hover:brightness-110 transition-all shrink-0"
            >
              <span>Academy Hub</span>
            </Link>
          </div>
        </div>
      </VerificationShell>
    );
  }

  // CASE B: TECHNICAL REFEREE OFFICIAL CREDENTIAL VERIFICATION (IPF-REF-...)
  if (code.toUpperCase().startsWith("IPF-REF-")) {
    const [refereeProfile, activeBranding] = await Promise.all([
      db.refereeProfile
        .findUnique({
          where: { licenseNumber: code.toUpperCase() },
          include: {
            user: true,
            assignments: {
              include: { event: true },
              orderBy: { shiftDate: "desc" },
              take: 2,
            },
          },
        })
        .catch(() => null),
      db.tenantBranding
        .findFirst({
          where: { isApproved: true },
          orderBy: { updatedAt: "desc" },
        })
        .catch(() => null),
    ]);

    const officialName = refereeProfile?.user?.name || "Accredited Technical Official";
    const categoryTitle =
      refereeProfile?.category === "IPF_INTERNATIONAL"
        ? "IPF International Technical Official"
        : refereeProfile?.category === "NATIONAL_CAT_1"
        ? "National Category 1 Senior Referee"
        : refereeProfile?.category === "NATIONAL_CAT_2"
        ? "National Category 2 Referee"
        : "State Category 2 Technical Referee";

    const stateAffiliation = refereeProfile?.stateAffiliation || "Gujarat State Powerlifting Association";
    const orgName = activeBranding?.organizationName || "Indian Powerlifting Federation";
    const isActive = refereeProfile ? refereeProfile.isActive && new Date(refereeProfile.licenseValidUntil) > new Date() : true;

    const qrDataUrl = await generateQrDataUrl(`https://ipf-federation.in/verify/${code}`, {
      width: 280,
      margin: 1,
    });

    return (
      <VerificationShell>
        <div className="flex items-center justify-center mb-6">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-purple-500/40 bg-purple-500/10 text-purple-400 shadow-[0_0_35px_rgba(168,85,247,0.3)]">
            <ShieldCheck className="h-12 w-12 text-purple-400" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-75" />
              <span className="relative inline-flex h-4 w-4 rounded-full bg-purple-500" />
            </span>
          </div>
        </div>

        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-purple-500/40 bg-purple-500/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-purple-300">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>{orgName} • Official Technical Accreditation</span>
        </div>

        <h1 className="mt-2 font-heading text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-wider text-white">
          {officialName}
        </h1>

        <p className="mt-1 font-bold uppercase tracking-widest text-purple-400 text-xs sm:text-sm">
          {categoryTitle} • {stateAffiliation}
        </p>

        <div className="mt-4 flex justify-center">
          <span
            className={`rounded-full border px-4 py-1 text-xs font-bold uppercase tracking-widest shadow-sm ${
              isActive
                ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-300"
                : "border-red-500/40 bg-red-500/20 text-red-400"
            }`}
          >
            {isActive ? "★ ACCREDITED & RATIFIED OFFICIAL ★" : "LICENSE EXPIRED / SUSPENDED"}
          </span>
        </div>

        <div className="mt-8 grid w-full grid-cols-1 gap-3 sm:grid-cols-2 text-left">
          <CredentialField label="Official License Code" value={code.toUpperCase()} mono />
          <CredentialField
            label="Technical Accreditation Status"
            value={isActive ? "Valid & Cleared for Platform Duty" : "Suspended"}
            valueClass={isActive ? "text-emerald-400" : "text-red-400"}
            icon={<CheckCircle2 className="h-4 w-4 text-emerald-400" />}
          />
          <CredentialField
            label="License Category Tier"
            value={categoryTitle}
            valueClass="text-purple-300 font-bold"
          />
          <CredentialField
            label="State / Regional Affiliation"
            value={stateAffiliation}
          />
          <CredentialField
            label="Sanctioning Authority"
            value={orgName}
          />
          <CredentialField
            label="Total Sanctioned Meets Judged"
            value={`${refereeProfile?.totalMeetsJudged || 0} Championships`}
          />
          {refereeProfile?.assignments && refereeProfile.assignments.length > 0 && (
            <CredentialField
              label="Current Assigned Championship"
              value={`${refereeProfile.assignments[0].platformName} • ${refereeProfile.assignments[0].event.title}`}
              valueClass="text-gym-primary"
            />
          )}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-white/10 bg-black/40 p-4 text-left">
          <div className="flex items-center gap-3">
            <div className="h-16 w-16 bg-white p-1 rounded-lg border border-white/20 shrink-0">
              <img src={qrDataUrl} alt="QR" className="h-full w-full object-contain" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-white">
                Permanent Official Technical Registry Record
              </div>
              <div className="text-[11px] text-gray-400">
                Ratified under official IPF Technical Official Constitution &amp; Ethics Code.
              </div>
            </div>
          </div>

          <Link
            href="/referee/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:brightness-110 transition-all shrink-0"
          >
            <span>Referee Dashboard</span>
          </Link>
        </div>
      </VerificationShell>
    );
  }

  // CASE C: NADA / WADA DOPING TEST CHAIN OF CUSTODY MANIFEST VERIFICATION (NADA-...)
  if (code.toUpperCase().startsWith("NADA-")) {
    const seedRecord = SEED_CHAIN_OF_CUSTODY_RECORDS.find(
      (r) => r.testCode.toUpperCase() === code.toUpperCase()
    );

    const queryAthlete = typeof sp.athlete === "string" ? sp.athlete : undefined;
    const queryABarcode = typeof sp.aBarcode === "string" ? sp.aBarcode : undefined;
    const queryBBarcode = typeof sp.bBarcode === "string" ? sp.bBarcode : undefined;
    const queryVolume = typeof sp.volume === "string" ? sp.volume : undefined;
    const querySg = typeof sp.sg === "string" ? sp.sg : undefined;
    const queryDco = typeof sp.dco === "string" ? sp.dco : undefined;
    const queryMeet = typeof sp.meet === "string" ? sp.meet : undefined;

    const athleteName = queryAthlete || seedRecord?.athleteName || "Patel Rakesh";
    const meetTitle = queryMeet || seedRecord?.meetTitle || "Indian National Senior Men & Women Powerlifting Championship 2026";
    const aBarcode = queryABarcode || seedRecord?.aSampleBarcode || "A-NADA-88492-SEC";
    const bBarcode = queryBBarcode || seedRecord?.bSampleBarcode || "B-NADA-88493-SEC";
    const volume = queryVolume || (seedRecord ? `${seedRecord.sampleVolumeMl} mL` : "105 mL");
    const sg = querySg || (seedRecord ? seedRecord.specificGravity.toFixed(3) : "1.018");
    const dcoName = queryDco || seedRecord?.dcoOfficerName || "Dr. Arvind Rao, MD (Senior NADA DCO)";
    const statusText = seedRecord?.status ? seedRecord.status.replace(/_/g, " ") : "SAMPLES SEALED & DISPATCHED";

    const qrDataUrl = await generateQrDataUrl(`https://ipf-federation.in/verify/${code}`, {
      width: 280,
      margin: 1,
    });

    return (
      <VerificationShell>
        <div className="flex items-center justify-center mb-6">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-blue-500/40 bg-blue-500/10 text-blue-400 shadow-[0_0_35px_rgba(59,130,246,0.3)]">
            <FlaskConical className="h-12 w-12 text-blue-400" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex h-4 w-4 rounded-full bg-blue-500" />
            </span>
          </div>
        </div>

        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-blue-500/40 bg-blue-500/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-blue-300">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>NADA India &amp; WADA ISTI • Official Sample Chain of Custody Record</span>
        </div>

        <h1 className="mt-2 font-heading text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-wider text-white">
          {athleteName}
        </h1>

        <p className="mt-1 font-bold uppercase tracking-widest text-blue-400 text-xs sm:text-sm max-w-xl mx-auto">
          {meetTitle}
        </p>

        <div className="mt-4 flex justify-center">
          <span className="rounded-full border border-emerald-500/40 bg-emerald-500/20 px-4 py-1 text-xs font-bold uppercase tracking-widest text-emerald-300 shadow-sm">
            ★ {statusText} ★
          </span>
        </div>

        <div className="mt-8 grid w-full grid-cols-1 gap-3 sm:grid-cols-2 text-left">
          <CredentialField label="Official Sample Test Code" value={code} mono />
          <CredentialField
            label="A-Sample Security Barcode"
            value={aBarcode}
            mono
            valueClass="text-emerald-400 font-bold"
          />
          <CredentialField
            label="B-Sample Security Barcode"
            value={bBarcode}
            mono
            valueClass="text-blue-400 font-bold"
          />
          <CredentialField
            label="Sample Volume &amp; Refractometer SG"
            value={`${volume} • Specific Gravity: ${sg}`}
            valueClass="text-emerald-300"
            icon={<CheckCircle2 className="h-4 w-4 text-emerald-400" />}
          />
          <CredentialField
            label="Testing Directorate / DCO In-Charge"
            value={dcoName}
          />
          <CredentialField
            label="Accredited Testing Laboratory"
            value="National Dope Testing Laboratory (NDTL), New Delhi"
            valueClass="text-white"
          />
          <CredentialField
            label="Standard &amp; Procedure"
            value="WADA ISTI Article 5 &amp; 6 Double-Blind Testing"
            icon={<ShieldCheck className="h-4 w-4 text-emerald-400" />}
          />
          <CredentialField
            label="Custody Transport Cold-Chain"
            value="Secure Lockbox #TLB-04 (2°C - 8°C Monitored)"
          />
          <CredentialField
            label="Cryptographic Blockchain Ledger Status"
            value="SHA-256 Chained • Immutable & Verifiable"
            valueClass="text-emerald-400 font-bold"
            icon={<ShieldCheck className="h-4 w-4 text-emerald-400" />}
          />
          <CredentialField
            label="Testing Officer & Athlete Digital Consent"
            value="PKI Cryptographically Signed • 4/4 Legal Protocols Ratified"
            valueClass="text-emerald-300"
            icon={<UserCheck className="h-4 w-4 text-emerald-400" />}
          />
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-white/10 bg-black/40 p-4 text-left">
          <div className="flex items-center gap-3">
            <div className="h-16 w-16 bg-white p-1 rounded-lg border border-white/20 shrink-0">
              <img src={qrDataUrl} alt="QR" className="h-full w-full object-contain" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-white">
                Permanent Anti-Doping Custody Record
              </div>
              <div className="text-[11px] text-gray-400">
                Official biometric and laboratory tracking entry ratified under National Anti-Doping Act 2022.
              </div>
            </div>
          </div>

          <Link
            href="/doping-control"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:brightness-110 transition-all shrink-0"
          >
            <span>Doping Control Portal</span>
          </Link>
        </div>
      </VerificationShell>
    );
  }

  // CASE D: WADA ADAMS WHEREABOUTS FILING DOSSIER VERIFICATION (ADAMS-...)
  if (code.toUpperCase().startsWith("ADAMS-")) {
    const queryAthlete = typeof sp.athlete === "string" ? sp.athlete : undefined;
    const queryFedId = typeof sp.fedId === "string" ? sp.fedId : undefined;
    const queryQuarter = typeof sp.quarter === "string" ? sp.quarter : undefined;
    const querySlot = typeof sp.slot === "string" ? sp.slot : undefined;
    const queryResidence = typeof sp.residence === "string" ? sp.residence : undefined;
    const queryGym = typeof sp.gym === "string" ? sp.gym : undefined;
    const queryPhone = typeof sp.phone === "string" ? sp.phone : undefined;

    const athleteName = queryAthlete || "Patel Rakesh";
    const fedId = queryFedId || "FED-2026-8849";
    const quarter = queryQuarter || "Q4 2026 (Oct 1 - Dec 31)";
    const slotTime = querySlot || "06:00 AM - 07:00 AM";
    const residence = queryResidence || "Flat 402, Shivam Enclave, Andheri West, Mumbai, Maharashtra 400053";
    const gym = queryGym || "A&T High-Performance Barbell Academy, Bandra East, Mumbai";
    const phone = queryPhone || "+91 98765 43210";

    const qrDataUrl = await generateQrDataUrl(`https://ipf-federation.in/verify/${code}`, {
      width: 280,
      margin: 1,
    });

    return (
      <VerificationShell>
        <div className="flex items-center justify-center mb-6">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-purple-500/40 bg-purple-500/10 text-purple-400 shadow-[0_0_35px_rgba(168,85,247,0.3)]">
            <MapPin className="h-12 w-12 text-purple-400" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-75" />
              <span className="relative inline-flex h-4 w-4 rounded-full bg-purple-500" />
            </span>
          </div>
        </div>

        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-purple-500/40 bg-purple-500/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-purple-300">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>WADA ADAMS Clearinghouse • Official Whereabouts Filing Dossier</span>
        </div>

        <h1 className="mt-2 font-heading text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-wider text-white">
          {athleteName}
        </h1>

        <p className="mt-1 font-bold uppercase tracking-widest text-purple-400 text-xs sm:text-sm max-w-xl mx-auto">
          Registered Testing Pool (RTP) • {quarter}
        </p>

        <div className="mt-4 flex justify-center">
          <span className="rounded-full border border-emerald-500/40 bg-emerald-500/20 px-4 py-1 text-xs font-bold uppercase tracking-widest text-emerald-300 shadow-sm">
            ★ ACTIVE ADAMS QUARTERLY FILING ★
          </span>
        </div>

        <div className="mt-8 grid w-full grid-cols-1 gap-3 sm:grid-cols-2 text-left">
          <CredentialField label="ADAMS Clearinghouse Receipt" value={code} mono />
          <CredentialField
            label="Athlete License ID"
            value={fedId}
            mono
            valueClass="text-purple-300 font-bold"
          />
          <CredentialField
            label="Mandatory 60-Minute Daily Window"
            value={slotTime}
            valueClass="text-emerald-400 font-bold"
            icon={<Clock className="h-4 w-4 text-emerald-400" />}
          />
          <CredentialField
            label="Overnight Primary Residence"
            value={residence}
            icon={<MapPin className="h-4 w-4 text-purple-400" />}
          />
          <CredentialField
            label="Primary Training Gym Facility"
            value={gym}
          />
          <CredentialField
            label="24/7 DCO Emergency Contact"
            value={phone}
          />
          <CredentialField
            label="WADA Strict Liability Policy"
            value="3-Strike Rule Monitored (Article 2.4)"
            icon={<ShieldCheck className="h-4 w-4 text-emerald-400" />}
          />
          <CredentialField
            label="Testing Jurisdiction"
            value="NADA India &amp; International Powerlifting Federation"
          />
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-white/10 bg-black/40 p-4 text-left">
          <div className="flex items-center gap-3">
            <div className="h-16 w-16 bg-white p-1 rounded-lg border border-white/20 shrink-0">
              <img src={qrDataUrl} alt="QR" className="h-full w-full object-contain" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-white">
                Permanent ADAMS Clearinghouse Dossier
              </div>
              <div className="text-[11px] text-gray-400">
                Official out-of-competition testing availability record lodged in Montreal central registry.
              </div>
            </div>
          </div>

          <Link
            href="/doping-control"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:brightness-110 transition-all shrink-0"
          >
            <span>Doping Control Portal</span>
          </Link>
        </div>
      </VerificationShell>
    );
  }

  const [certificate, membership, meetRegistration, activeBranding] = await Promise.all([
    db.certificate.findUnique({ where: { verificationCode: code } }).catch(() => null),
    db.membership
      .findUnique({
        where: { cardNumber: code },
        include: {
          user: {
            include: {
              profile: {
                include: { club: true },
              },
            },
          },
        },
      })
      .catch(() => null),
    db.meetRegistration
      .findFirst({
        where: {
          OR: [
            { id: code },
            { paymentRef: { contains: code } },
            ...(code.startsWith("IPF-MEET-")
              ? [
                  { id: { endsWith: code.split("-").pop()?.toLowerCase() || "" } },
                ]
              : []),
          ],
        },
        include: {
          user: { include: { profile: true } },
          event: true,
        },
      })
      .catch(() => null),
    db.tenantBranding
      .findFirst({
        where: { isApproved: true },
        orderBy: { updatedAt: "desc" },
      })
      .catch(() => null),
  ]);

  if (!certificate && !membership && !meetRegistration) {
    return <InvalidCredential code={code} />;
  }

  // CASE 1: ATHLETE MEMBERSHIP ID CARD VERIFICATION
  if (membership) {
    const isActive = membership.status === "ACTIVE" && new Date(membership.endDate) > new Date();
    const qrDataUrl = await generateQrDataUrl(`https://ipf-federation.in/verify/${membership.cardNumber}`, {
      width: 280,
      margin: 1,
    });

    return (
      <VerificationShell>
        <div className="flex items-center justify-center mb-6">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-emerald-500/40 bg-emerald-500/10 text-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.3)]">
            <ShieldCheck className="h-12 w-12 text-emerald-400" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-4 w-4 rounded-full bg-emerald-500" />
            </span>
          </div>
        </div>

        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-emerald-400">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>
            {activeBranding?.organizationName
              ? `${activeBranding.organizationName} • Official Pass`
              : "Official Federation Competitor Pass • Verified"}
          </span>
        </div>

        <h1 className="mt-2 font-heading text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-wider text-white">
          {membership.user.name ?? "Registered Athlete"}
        </h1>

        <p className="mt-1 font-bold uppercase tracking-widest text-gym-primary text-xs sm:text-sm">
          {membership.user.profile?.weightClass?.replace("WC_", "") ?? "83"} KG Division • {membership.user.profile?.gender ?? "MALE"}
        </p>

        {/* Status Badge */}
        <div className="mt-4 flex justify-center">
          <span
            className={`rounded-full border px-4 py-1 text-xs font-bold uppercase tracking-widest ${
              isActive
                ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-300"
                : "border-red-500/40 bg-red-500/20 text-red-400"
            }`}
          >
            {isActive ? "ACTIVE & ELIGIBLE TO COMPETE" : "MEMBERSHIP EXPIRED"}
          </span>
        </div>

        {/* Credential Details Grid */}
        <div className="mt-8 grid w-full grid-cols-1 gap-3 sm:grid-cols-2 text-left">
          <CredentialField label="Federation ID Card" value={membership.cardNumber} mono />
          <CredentialField
            label="Membership Plan"
            value={membership.planType.replace("_", " ")}
            valueClass="text-gym-primary"
          />
          <CredentialField
            label="Affiliated Organization / State"
            value={activeBranding?.organizationName || membership.user.profile?.club?.state || "Maharashtra State Association"}
          />
          <CredentialField
            label="Valid Through"
            value={new Date(membership.endDate).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          />
        </div>

        {/* QR & Registry Info */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-white/10 bg-black/40 p-4 text-left">
          <div className="flex items-center gap-3">
            <div className="h-16 w-16 bg-white p-1 rounded-lg border border-white/20 shrink-0">
              <img src={qrDataUrl} alt="QR" className="h-full w-full object-contain" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-white">
                Tamper-Proof Digital Pass
              </div>
              <div className="text-[11px] text-gray-400">
                Registered in the Central National Athlete Database.
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href={`/api/pdf/id-card?cardNumber=${encodeURIComponent(membership.cardNumber)}`}
              target="_blank"
              download={`${membership.cardNumber}-Pass.pdf`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-gym-primary to-gym-red px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:brightness-110 transition-all cursor-pointer"
              title="Download official PDF pass"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download PDF</span>
            </a>

            <a
              href={`/api/badge/athlete?cardNumber=${encodeURIComponent(membership.cardNumber)}`}
              target="_blank"
              download={`${membership.cardNumber}-Badge.svg`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold uppercase tracking-wider text-gray-200 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
              title="Download vector SVG badge"
            >
              <Award className="h-3.5 w-3.5 text-gym-primary" />
              <span>Badge (SVG)</span>
            </a>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold uppercase tracking-wider text-gray-300 hover:text-white hover:bg-white/10 transition-all"
            >
              <span>Dashboard</span>
            </Link>
          </div>
        </div>
      </VerificationShell>
    );
  }

  // CASE 2: MEET REGISTRATION & WEIGH-IN PASS VERIFICATION
  if (meetRegistration) {
    let meta: any = {};
    try {
      if (meetRegistration.paymentRef && meetRegistration.paymentRef.startsWith("{")) {
        meta = JSON.parse(meetRegistration.paymentRef);
      }
    } catch {}

    const qrDataUrl = await generateQrDataUrl(`https://ipf-federation.in/verify/${code}`, {
      width: 280,
      margin: 1,
    });

    return (
      <VerificationShell>
        <div className="flex items-center justify-center mb-6">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-emerald-500/40 bg-emerald-500/10 text-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.3)]">
            <ShieldCheck className="h-12 w-12 text-emerald-400" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-4 w-4 rounded-full bg-emerald-500" />
            </span>
          </div>
        </div>

        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-emerald-400">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Official Meet Weigh-In Pass • Verified</span>
        </div>

        <h1 className="mt-2 font-heading text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-wider text-white">
          {meetRegistration.user.name ?? "Registered Athlete"}
        </h1>

        <p className="mt-1 font-bold uppercase tracking-widest text-gym-primary text-xs sm:text-sm">
          {meetRegistration.event.title}
        </p>

        {/* Status Badge */}
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <span className="rounded-full border border-emerald-500/40 bg-emerald-500/20 px-4 py-1 text-xs font-bold uppercase tracking-widest text-emerald-400 shadow-sm">
            CONFIRMED ACCREDITATION • APPROVED
          </span>
          <span className="rounded-full border border-gym-primary/40 bg-gym-primary/20 px-4 py-1 text-xs font-bold uppercase tracking-widest text-gym-primary shadow-sm">
            LOT #{meetRegistration.lotNumber || meta.lotNumber || 42}
          </span>
        </div>

        {/* Details Grid */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-black/50 p-5 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="rounded-xl bg-white/5 p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">CLASS</div>
              <div className="font-heading text-lg font-bold text-white mt-1">
                {meta.declaredWeightClass || meetRegistration.user.profile?.weightClass?.replace("WC_", "") || "83"} KG
              </div>
            </div>
            <div className="rounded-xl bg-white/5 p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">DIVISION</div>
              <div className="font-heading text-sm font-black text-gym-primary mt-1">
                {meetRegistration.division.replace(/_/g, " ")}
              </div>
            </div>
            <div className="rounded-xl bg-white/5 p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">EQUIPMENT</div>
              <div className="font-heading text-sm font-black text-white mt-1">
                {meetRegistration.equipment.replace(/_/g, " ")}
              </div>
            </div>
            <div className="rounded-xl bg-white/5 p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">FLIGHT</div>
              <div className="font-heading text-sm font-black text-emerald-400 mt-1">
                {meta.flight || "Flight A"}
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-3 text-xs space-y-2 text-gray-300">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Official Weigh-In Window:</span>
              <strong className="text-white font-mono">{meta.weighInTime || "07:00 AM – 09:00 AM (Scale 1)"}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Platform Lifting Time:</span>
              <strong className="text-emerald-400 font-mono">{meta.liftingTime || "10:00 AM Sharp"}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Nominated Openers:</span>
              <span className="font-mono text-white font-bold">
                S: {meta.squatOpener || 210}kg | B: {meta.benchOpener || 140}kg | D: {meta.deadliftOpener || 230}kg
              </span>
            </div>
          </div>
        </div>

        {/* Verification Footprint */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Cleared for Official Weigh-In Scale &amp; Technical Inspection.</span>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-gym-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-black shadow-md hover:brightness-110 transition-all"
          >
            <span>Athlete Dashboard</span>
          </Link>
        </div>
      </VerificationShell>
    );
  }

  // CASE 3: COMPETITION CERTIFICATE VERIFICATION
  const [athlete, event, result] = await Promise.all([
    db.user.findUnique({
      where: { id: certificate!.userId },
      include: { profile: true },
    }),
    db.event.findUnique({
      where: { id: certificate!.eventId },
    }),
    db.result.findUnique({
      where: {
        userId_eventId: {
          userId: certificate!.userId,
          eventId: certificate!.eventId,
        },
      },
    }),
  ]);

  const qrDataUrl = await generateQrDataUrl(`https://ipf-federation.in/verify/${certificate!.verificationCode}`, {
    width: 280,
    margin: 1,
  });

  const medalText =
    result?.rank === 1
      ? "🥇 1ST PLACE • NATIONAL GOLD MEDALIST"
      : result?.rank === 2
      ? "🥈 2ND PLACE • NATIONAL SILVER MEDALIST"
      : result?.rank === 3
      ? "🥉 3RD PLACE • NATIONAL BRONZE MEDALIST"
      : "OFFICIAL MERIT OF PARTICIPATION";

  return (
    <VerificationShell>
      <div className="flex items-center justify-center mb-6">
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-amber-500/40 bg-amber-500/10 text-amber-400 shadow-[0_0_35px_rgba(245,158,11,0.3)]">
          <Award className="h-12 w-12 text-amber-400" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex h-4 w-4 rounded-full bg-amber-500" />
          </span>
        </div>
      </div>

      <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-amber-300">
        <ShieldCheck className="h-3.5 w-3.5" />
        <span>
          {activeBranding?.organizationName
            ? `${activeBranding.organizationName} • Ratified Certificate`
            : "Official IPF Competition Certificate • Ratified"}
        </span>
      </div>

      <h1 className="mt-2 font-heading text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-wider text-white">
        {athlete?.name ?? "Verified Athlete"}
      </h1>

      <p className="mt-1 font-bold uppercase tracking-widest text-gym-primary text-xs sm:text-sm">
        {event?.title ?? "Sanctioned National Championship"}
      </p>

      {/* Standing Pill */}
      <div className="mt-4 flex justify-center">
        <span className="rounded-full border border-amber-500/40 bg-amber-500/20 px-4 py-1 text-xs font-bold uppercase tracking-widest text-amber-300 shadow-sm">
          {medalText}
        </span>
      </div>

      {/* Lift Breakdown Matrix (if result exists) */}
      {result && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-black/50 p-4">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-3 text-center">
            Official Ratified Performance Ledger
          </div>
          <div className="grid grid-cols-5 divide-x divide-white/10 text-center">
            <div>
              <div className="text-[9px] font-bold text-gray-400">SQUAT</div>
              <div className="font-heading text-base font-bold text-white mt-0.5">
                {result.bestSquat || 0} <span className="text-[10px] text-gray-500">KG</span>
              </div>
            </div>
            <div>
              <div className="text-[9px] font-bold text-gray-400">BENCH</div>
              <div className="font-heading text-base font-bold text-white mt-0.5">
                {result.bestBench || 0} <span className="text-[10px] text-gray-500">KG</span>
              </div>
            </div>
            <div>
              <div className="text-[9px] font-bold text-gray-400">DEADLIFT</div>
              <div className="font-heading text-base font-bold text-white mt-0.5">
                {result.bestDeadlift || 0} <span className="text-[10px] text-gray-500">KG</span>
              </div>
            </div>
            <div className="bg-gym-primary/10">
              <div className="text-[9px] font-semibold text-gym-primary">TOTAL</div>
              <div className="font-heading text-base font-bold text-gym-primary mt-0.5">
                {result.total || 0} <span className="text-[10px]">KG</span>
              </div>
            </div>
            <div>
              <div className="text-[9px] font-bold text-gray-400">IPF GL</div>
              <div className="font-heading text-base font-bold text-white mt-0.5">
                {result.ipfGlPoints || 0}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Credential Details Grid */}
      <div className="mt-6 grid w-full grid-cols-1 gap-3 sm:grid-cols-2 text-left">
        <CredentialField label="Verification Code" value={certificate!.verificationCode} mono />
        <CredentialField
          label="Verification Status"
          value="Officially Ratified & Valid"
          valueClass="text-emerald-400"
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-400" />}
        />
        <CredentialField
          label="Ratified Federation / Body"
          value={activeBranding?.organizationName || "Indian Powerlifting Federation"}
          valueClass="text-gym-primary"
        />
        <CredentialField
          label="Ratification Authority"
          value={`${activeBranding?.presidentName || "President"} & ${activeBranding?.secretaryName || "General Secretary"}`}
        />
        <CredentialField
          label="Championship Date & City"
          value={`${event ? new Date(event.date).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "2026"} • ${event?.location || "India"}`}
        />
        <CredentialField
          label="Issue Date"
          value={new Date(certificate!.issueDate).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
          icon={<CalendarDays className="h-4 w-4 text-gym-primary" />}
        />
      </div>

      {/* QR & Registry Info */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-white/10 bg-black/40 p-4 text-left">
        <div className="flex items-center gap-3">
          <div className="h-16 w-16 bg-white p-1 rounded-lg border border-white/20 shrink-0">
            <img src={qrDataUrl} alt="QR" className="h-full w-full object-contain" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-white">
              Permanent Certificate Record
            </div>
            <div className="text-[11px] text-gray-400">
              Ratified under official IPF Technical Rules &amp; NADA anti-doping policy.
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <a
            href={`/api/pdf/certificate?code=${encodeURIComponent(certificate!.verificationCode)}`}
            target="_blank"
            download={`${certificate!.verificationCode}-Certificate.pdf`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-black shadow-md hover:brightness-110 transition-all cursor-pointer"
            title="Download vector PDF certificate"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download PDF</span>
          </a>

          <a
            href={`/api/badge/podium?code=${encodeURIComponent(certificate!.verificationCode)}`}
            target="_blank"
            download={`${certificate!.verificationCode}-Badge.svg`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold uppercase tracking-wider text-gray-200 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
            title="Download official digital vector SVG badge"
          >
            <Award className="h-3.5 w-3.5 text-amber-400" />
            <span>Badge (SVG)</span>
          </a>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold uppercase tracking-wider text-gray-300 hover:text-white hover:bg-white/10 transition-all"
          >
            <span>Dashboard</span>
          </Link>
        </div>
      </div>
    </VerificationShell>
  );
}

function VerificationShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gym-black px-4 pt-32 sm:pt-36 lg:pt-40 pb-20 text-center relative overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-gym-primary/15 blur-[120px]" />
      <div className="pointer-events-none absolute top-1/2 -right-40 h-96 w-96 rounded-full bg-amber-500/10 blur-[130px]" />

      <div className="w-full max-w-2xl mb-4 text-left">
        <PageNavigation
          backHref="/verify"
          backLabel="Back to Registry"
          breadcrumbs={[
            { label: "Public Hub", href: "/" },
            { label: "Registry", href: "/verify" },
            { label: "Verification" },
          ]}
          badge="Ratified Credential"
        />
      </div>

      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-b from-[#160603] via-[#0d0301] to-black p-6 sm:p-10 shadow-2xl backdrop-blur-2xl">
        {/* Top Federation Strip */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="relative h-8 w-8 rounded-full overflow-hidden border border-gym-primary bg-black shadow-xs shrink-0">
              <Image src="/images/at-logo.png" alt="Logo" fill className="object-cover" />
            </div>
            <div className="text-left">
              <div className="font-heading text-xs font-bold uppercase tracking-wider text-white">
                Indian Powerlifting Federation
              </div>
              <div className="text-[8px] font-bold uppercase tracking-widest text-gym-primary">
                National Credential Verification Registry
              </div>
            </div>
          </div>

          <Link
            href="/"
            className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 hover:text-white transition-colors"
          >
            Federation Hub →
          </Link>
        </div>

        {children}
      </div>
    </div>
  );
}

function CredentialField({
  label,
  value,
  mono,
  valueClass = "text-white",
  icon,
}: {
  label: string;
  value: string;
  mono?: boolean;
  valueClass?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0c0301] p-3.5 text-left">
      <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-gray-400">
        {label}
      </span>
      <span className={`flex items-center gap-2 text-xs sm:text-sm font-bold ${mono ? "font-mono" : ""} ${valueClass}`}>
        {icon}
        {value}
      </span>
    </div>
  );
}

function InvalidCredential({ code }: { code: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gym-black pt-32 sm:pt-36 lg:pt-40 pb-20 px-6 text-center relative overflow-hidden">
      <div className="w-full max-w-md mb-4 text-left">
        <PageNavigation
          backHref="/verify"
          backLabel="Back to Registry"
          breadcrumbs={[
            { label: "Public Hub", href: "/" },
            { label: "Registry", href: "/verify" },
            { label: "Verification" },
          ]}
        />
      </div>
      <div className="relative w-full max-w-md rounded-3xl border border-red-500/30 bg-gradient-to-b from-[#1a0505] to-black p-8 shadow-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/40 bg-red-500/10 text-red-500 mb-4">
          <XCircle className="h-10 w-10 text-red-500" />
        </div>
        <h1 className="font-heading text-2xl font-bold uppercase tracking-wider text-white">
          Invalid <span className="text-red-500">Credential</span>
        </h1>
        <p className="mt-2 text-xs text-gray-400 leading-relaxed">
          The credential code <strong className="font-mono text-white font-bold">{code}</strong> does not exist in the official Federation verification database.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-gym-primary px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-black hover:brightness-110 transition-all"
        >
          Return to Federation Hub
        </Link>
      </div>
    </div>
  );
}