import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Users, Shield, ArrowRight } from "lucide-react";
import { PageNavigation } from "@/components/ui/PageNavigation";

export const revalidate = 60;

export default async function AthletesDirectoryPage() {
  let athletes: any[] = [];

  try {
    athletes = await prisma.user.findMany({
      where: { role: "MEMBER" },
      include: {
        profile: { include: { club: true } },
        memberships: { where: { status: "ACTIVE" }, take: 1 },
      },
      orderBy: { name: "asc" },
    });
  } catch (err: any) {
    console.warn("Could not query athletes directory from database, using fallback:", err?.message || err);
    // Graceful offline fallback with Gujarat state athletes
    athletes = [
      {
        id: "ath-rakesh-patel",
        name: "Patel Rakesh",
        email: "rakesh.patel@wpi-gujarat.org",
        role: "MEMBER",
        profile: {
          weightClass: "WC_83",
          gender: "MALE",
          club: { name: "Baroda Barbell Club", state: "Gujarat" },
        },
        memberships: [{ id: "mem-01", status: "ACTIVE" }],
      },
      {
        id: "ath-amar-patel",
        name: "Patel Amar",
        email: "amar.patel@wpi-gujarat.org",
        role: "MEMBER",
        profile: {
          weightClass: "WC_83",
          gender: "MALE",
          club: { name: "Surat Powerlifting Academy", state: "Gujarat" },
        },
        memberships: [{ id: "mem-02", status: "ACTIVE" }],
      },
      {
        id: "ath-priya-sharma",
        name: "Priya Sharma",
        email: "priya.sharma@wpi-gujarat.org",
        role: "MEMBER",
        profile: {
          weightClass: "WC_63",
          gender: "FEMALE",
          club: { name: "Ahmedabad Iron Guild", state: "Gujarat" },
        },
        memberships: [{ id: "mem-03", status: "ACTIVE" }],
      },
      {
        id: "ath-aryan-mehta",
        name: "Aryan Mehta",
        email: "aryan.mehta@wpi-gujarat.org",
        role: "MEMBER",
        profile: {
          weightClass: "WC_74",
          gender: "MALE",
          club: { name: "Rajkot Barbell Foundry", state: "Gujarat" },
        },
        memberships: [{ id: "mem-04", status: "ACTIVE" }],
      },
      {
        id: "ath-neha-joshi",
        name: "Neha Joshi",
        email: "neha.joshi@wpi-gujarat.org",
        role: "MEMBER",
        profile: {
          weightClass: "WC_57",
          gender: "FEMALE",
          club: { name: "Kutch Strength Sanctuary", state: "Gujarat" },
        },
        memberships: [{ id: "mem-05", status: "ACTIVE" }],
      },
      {
        id: "ath-bhavin-vyas",
        name: "Bhavin Vyas",
        email: "bhavin.vyas@wpi-gujarat.org",
        role: "MEMBER",
        profile: {
          weightClass: "WC_93",
          gender: "MALE",
          club: { name: "Gandhinagar Barbell Club", state: "Gujarat" },
        },
        memberships: [{ id: "mem-06", status: "ACTIVE" }],
      },
    ];
  }

  return (
    <div className="min-h-screen bg-gym-black pt-32 sm:pt-36 lg:pt-40 pb-20 px-6 md:px-12">
      <div className="max-w-[1200px] mx-auto">
        <PageNavigation
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Rankings", href: "/leaderboard" },
            { label: "Elite Athlete Directory" },
          ]}
          badge="Federation Registry"
          className="mb-8"
        />

        <div className="mb-12 animate-slideUp">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-4 drop-shadow-xl">
            <Users className="text-gym-accent w-10 h-10 drop-shadow-[0_0_15px_rgba(230,80,27,0.5)]" />
            Athlete <span className="bg-metallic bg-clip-text text-transparent animate-glow">Directory</span>
          </h1>
          <p className="text-gym-grey font-medium text-sm md:text-base max-w-2xl">
            Browse all registered athletes, verify active federation memberships, and view competitive profiles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {athletes.length === 0 ? (
            <div className="col-span-full py-16 text-center text-gray-500 font-bold uppercase tracking-widest bg-[#0a0a0a] border border-white/10 rounded-xl">
              No athletes found in the directory.
            </div>
          ) : (
            athletes.map((athlete, index) => {
              const activeMembership = athlete.memberships?.[0];
              const weightClass = athlete.profile?.weightClass?.replace("WC_", "") || "N/A";
              
              return (
                <div 
                  key={athlete.id}
                  className="glass-panel p-6 flex flex-col justify-between hover:border-gym-accent/50 hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(230,80,27,0.2)] transition-all duration-300 rounded-2xl animate-fadeIn"
                  style={{ animationDelay: `${0.1 * index}s`, animationFillMode: 'both' }}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-black text-gym-accent uppercase tracking-widest bg-gym-accent/10 px-3 py-1 rounded-full border border-gym-accent/20 drop-shadow-sm">
                        {weightClass} KG Class
                      </span>
                      {activeMembership ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-green-500 uppercase tracking-widest bg-green-500/10 px-2 py-0.5 rounded">
                          <Shield className="w-3 h-3" /> Active ID
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded">
                          Unlicensed
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-white mb-1">{athlete.name || "Unnamed Athlete"}</h3>
                    <p className="text-xs text-gray-400 mb-6 font-medium">
                      Club: <span className="text-white">{athlete.profile?.club?.name || "Independent"}</span>
                    </p>
                  </div>

                  <Link
                    href={`/athletes/${athlete.id}`}
                    className="w-full bg-white/5 hover:bg-gym-accent hover:text-black text-white text-xs font-bold uppercase tracking-widest py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border border-white/10 hover:shadow-[0_0_15px_rgba(230,80,27,0.5)]"
                  >
                    View Profile <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
