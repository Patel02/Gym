import { Metadata } from "next";
import fs from "fs/promises";
import path from "path";
import Link from "next/link";
import { 
  Building2, 
  ChevronRight, 
  Mail, 
  Phone, 
  MapPin, 
  Landmark, 
  Users, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Globe2,
  Trophy,
  Dumbbell,
  Stethoscope,
  Award
} from "lucide-react";
import { AboutData } from "@/components/admin/AboutEditor";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import StateDirectoryInteractive from "@/components/governance/StateDirectoryInteractive";

export const metadata: Metadata = {
  title: "National Secretariat & 37 State Governance • Indian Powerlifting Federation",
  description: "Official apex headquarters, executive leadership, technical directorate, and directory of all 37 affiliated State Associations & Institutional Boards.",
};

const ABOUT_FILE_PATH = path.join(process.cwd(), "src", "data", "federation-about.json");

async function getAboutData(): Promise<AboutData> {
  try {
    const data = await fs.readFile(ABOUT_FILE_PATH, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    throw new Error("Failed to load about federation data");
  }
}

export default async function GovernancePage() {
  const about = await getAboutData();
  const WHATSAPP_PHONE = "917043951377";

  return (
    <div className="min-h-screen bg-gym-black text-white pt-28 sm:pt-32 lg:pt-36 pb-20 relative overflow-hidden">
      
      {/* Ambient Glows */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-gym-primary/15 blur-[120px]" />
      <div className="pointer-events-none absolute top-1/2 -right-40 h-96 w-96 rounded-full bg-blue-500/10 blur-[130px]" />

      <div className="relative mx-auto max-w-7xl px-6 md:px-12">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 mb-6">
          <Link href="/" className="hover:text-gym-primary transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3 text-gray-600" />
          <Link href="/about" className="hover:text-gym-primary transition-colors">About</Link>
          <ChevronRight className="h-3 w-3 text-gray-600" />
          <span className="text-gym-primary">National Secretariat & 37 State Chapters</span>
        </div>

        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-gym-primary/30 bg-gym-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-gym-primary mb-4 shadow-[0_0_20px_rgba(230,80,27,0.2)]">
            <Landmark className="h-3.5 w-3.5" />
            <span>Apex Federation Administration • Estd. 1975</span>
          </div>

          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white drop-shadow-xl">
            National Secretariat & <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-gym-primary via-[#ff7a45] to-gym-primary bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(230,80,27,0.5)]">
              Executive Governance
            </span>
          </h1>

          <p className="mt-4 text-sm sm:text-base md:text-lg text-gray-300 leading-relaxed font-normal">
            Governing 37 State and Union Territory Associations, 6 Institutional Office Boards, and over 10,000+ registered athletes with democratic transparency and strict Olympic standards.
          </p>
        </div>

        {/* Governance Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="rounded-3xl border border-white/10 bg-[#120402]/80 p-6 backdrop-blur-xl shadow-xl">
            <div className="text-xs font-bold uppercase tracking-wider text-gym-primary mb-1">State Chapters</div>
            <div className="font-heading text-3xl font-bold text-white">{about.governance.affiliatedUnitsCount}</div>
            <p className="text-xs text-gray-400 mt-2">Active state bodies holding sanctioned annual championships.</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#120402]/80 p-6 backdrop-blur-xl shadow-xl">
            <div className="text-xs font-bold uppercase tracking-wider text-gym-primary mb-1">Athlete Registry</div>
            <div className="font-heading text-3xl font-bold text-white">{about.governance.registeredAthletes}</div>
            <p className="text-xs text-gray-400 mt-2">Men and women competitors registered under national IPF ID.</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#120402]/80 p-6 backdrop-blur-xl shadow-xl">
            <div className="text-xs font-bold uppercase tracking-wider text-gym-primary mb-1">International Body</div>
            <div className="font-heading text-3xl font-bold text-white">IPF & APF</div>
            <p className="text-xs text-gray-400 mt-2">Official member of the International Powerlifting Federation.</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#120402]/80 p-6 backdrop-blur-xl shadow-xl">
            <div className="text-xs font-bold uppercase tracking-wider text-gym-primary mb-1">Olympic Affiliation</div>
            <div className="font-heading text-3xl font-bold text-white">IOA & MYAS</div>
            <p className="text-xs text-gray-400 mt-2">Recognized National Sports Federation under Govt. of India.</p>
          </div>
        </div>

        {/* Secretariat Details & Executive Offices */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Headquarters Info */}
          <div className="rounded-3xl border border-white/10 bg-[#120402]/80 p-8 sm:p-10 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <Building2 className="h-6 w-6 text-gym-primary" />
              <h3 className="font-heading text-2xl font-bold uppercase text-white">
                National Headquarters
              </h3>
            </div>
            
            <div className="space-y-4 text-xs sm:text-sm text-gray-300 mt-6">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gym-primary shrink-0 mt-0.5" />
                <span>{about.governance.headquarters}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gym-primary shrink-0" />
                <a href={`mailto:${about.governance.secretariatEmail}`} className="text-white hover:text-gym-primary transition-colors">
                  {about.governance.secretariatEmail}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gym-primary shrink-0" />
                <span>{about.governance.secretariatPhone}</span>
              </div>
              <div className="pt-2 text-xs text-gray-400">
                Official Working Hours: <span className="text-white font-bold">Monday – Saturday (09:00 AM – 06:00 PM IST)</span>
              </div>
            </div>
          </div>

          {/* Executive Offices */}
          <div className="rounded-3xl border border-white/10 bg-[#120402]/80 p-8 sm:p-10 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="h-6 w-6 text-emerald-400" />
              <h3 className="font-heading text-2xl font-bold uppercase text-white">
                Executive Leadership
              </h3>
            </div>

            <div className="space-y-4 mt-6">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-[11px] font-bold uppercase tracking-wider text-gym-primary">Presidency</div>
                <div className="font-heading text-lg font-bold text-white">{about.governance.presidentOffice}</div>
                <p className="text-xs text-gray-400 mt-1">Leading strategic international relations and national policy assembly.</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Secretariat Operations</div>
                <div className="font-heading text-lg font-bold text-white">{about.governance.secgenOffice}</div>
                <p className="text-xs text-gray-400 mt-1">Managing daily administration, state sanctioning, and technical delegates.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Directorate Hierarchy: Technical Directorate & Commissions */}
        <div className="mb-16">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-gray-300 mb-2">
              <Users className="h-3.5 w-3.5 text-gym-primary" />
              <span>National Hierarchy</span>
            </div>
            <h3 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-white">
              Technical Directorate & Commissions
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Technical & Coaching Directorate */}
            <div className="rounded-3xl border border-gym-primary/30 bg-gradient-to-b from-[#1c0803] to-[#120402] p-6 backdrop-blur-xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gym-primary/20 text-gym-primary mb-4">
                <Dumbbell className="h-6 w-6" />
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-gym-primary">Platform Standards</div>
              <h4 className="font-heading text-xl font-bold uppercase text-white mt-1">
                Technical & Coaching Directorate
              </h4>
              <p className="text-xs text-gray-400 mt-2">
                Directed by <span className="text-white font-bold">Coach Akash & Coach Tanvi</span>. Governs athlete platform training standards, national squad peaking, calibrated rack heights, and coaching accreditation.
              </p>
            </div>

            {/* National Referee & Jury Board */}
            <div className="rounded-3xl border border-white/10 bg-[#120402]/80 p-6 backdrop-blur-xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-400 mb-4">
                <Award className="h-6 w-6" />
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Rules Enforcement</div>
              <h4 className="font-heading text-xl font-bold uppercase text-white mt-1">
                Referees & Technical Jury
              </h4>
              <p className="text-xs text-gray-400 mt-2">
                Oversees Cat 1 and Cat 2 national referee certifications, official rulebook compliance, technical jury appeals, and equipment manufacturer inspections.
              </p>
            </div>

            {/* Anti-Doping Medical Commission */}
            <div className="rounded-3xl border border-white/10 bg-[#120402]/80 p-6 backdrop-blur-xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 mb-4">
                <Stethoscope className="h-6 w-6" />
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">100% Clean Sport</div>
              <h4 className="font-heading text-xl font-bold uppercase text-white mt-1">
                Anti-Doping Commission
              </h4>
              <p className="text-xs text-gray-400 mt-2">
                In strict coordination with NADA & WADA. Manages in-competition and out-of-competition testing pools, whereabouts compliance, and Therapeutic Use Exemptions (TUE).
              </p>
            </div>
          </div>
        </div>

        {/* Interactive State Associations Directory */}
        <StateDirectoryInteractive />

        {/* Affiliated Clubs Banner */}
        <div className="my-16 rounded-3xl border border-white/10 bg-gradient-to-r from-[#170503] via-[#210904] to-[#120402] p-8 sm:p-12 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-gym-primary/30 bg-gym-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-gym-primary mb-3">
              <Dumbbell className="h-3.5 w-3.5" />
              <span>National Gym Network</span>
            </div>
            <h3 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-white">
              Official Accredited Clubs & Training Gyms
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 mt-2 max-w-xl">
              Discover verified powerlifting academies across Indian states equipped with IPF-certified combo racks, calibrated steel plates, and accredited coaches. Gym owners can also apply online for official federation affiliation.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <Link
              href="/clubs"
              className="flex items-center gap-2 rounded-2xl bg-gym-primary px-6 py-3.5 font-heading text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_25px_rgba(230,80,27,0.4)] hover:brightness-110 transition-all"
            >
              <span>Explore Clubs Directory</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Bottom Navigation & Secretariat Contact */}
        <div className="rounded-3xl border border-gym-primary/30 bg-gradient-to-br from-[#1b0603] to-[#0c0201] p-8 sm:p-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-gym-primary mb-2">Federation Administration</div>
            <h3 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-white">
              Official Communication & Sanctioning
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-xl">
              State Associations, institutional delegates, and accredited clubs may contact the National Secretariat for official meeting notices, affiliation renewal, and state championship sanction forms.
            </p>
          </div>

          <a
            href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent("Hi Federation Secretariat, I am reaching out regarding administrative governance and state affiliation.")}`}
            target="_blank"
            rel="noreferrer"
            className="group flex items-center gap-2.5 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 px-7 py-3.5 font-heading text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-lg hover:brightness-105 transition-all cursor-pointer shrink-0"
          >
            <WhatsAppIcon variant="badge" className="h-6 w-6" />
            <span>Secretariat WhatsApp</span>
          </a>
        </div>

      </div>
    </div>
  );
}
