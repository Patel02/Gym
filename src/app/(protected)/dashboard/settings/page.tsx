import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Settings } from "lucide-react";
import { revalidatePath } from "next/cache";
import { Gender, WeightClass } from "@prisma/client";

export default async function AthleteSettingsPage() {
  const session = await auth();
  if (!session || !session.user?.id) redirect("/login");

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    include: { club: true }
  });

  const updateProfile = async (formData: FormData) => {
    "use server";
    const gender = formData.get("gender") as Gender;
    const weightClass = formData.get("weightClass") as WeightClass;
    const clubName = formData.get("club") as string;

    let clubId: string | undefined = undefined;
    if (clubName && clubName.trim()) {
      const club = await prisma.club.upsert({
        where: { name: clubName.trim() },
        update: {},
        create: { name: clubName.trim(), state: "Maharashtra" },
      });
      clubId = club.id;
    }

    await prisma.profile.upsert({
      where: { userId: session.user.id },
      update: { gender, weightClass, ...(clubId ? { clubId } : {}) },
      create: { userId: session.user.id!, gender, weightClass, ...(clubId ? { clubId } : {}) },
    });

    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard");
  };

  return (
    <div className="max-w-[800px] mx-auto bg-[#0a0a0a] border border-white/10 rounded-xl p-8 shadow-2xl">
      <h1 className="text-2xl font-heading font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
        <Settings className="text-gym-primary w-6 h-6" />
        Athlete <span className="text-gym-primary">Settings</span>
      </h1>
      <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-8">
        Manage your competitive category and federation profile details.
      </p>

      <form action={updateProfile} className="flex flex-col gap-6">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Gender</label>
          <select 
            name="gender" 
            defaultValue={profile?.gender || "MALE"}
            className="w-full bg-[#151515] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-gym-primary focus:outline-none"
          >
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Weight Class</label>
          <select 
            name="weightClass" 
            defaultValue={profile?.weightClass || "WC_83"}
            className="w-full bg-[#151515] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-gym-primary focus:outline-none"
          >
            <option value="WC_59">59 KG</option>
            <option value="WC_66">66 KG</option>
            <option value="WC_74">74 KG</option>
            <option value="WC_83">83 KG</option>
            <option value="WC_93">93 KG</option>
            <option value="WC_105">105 KG</option>
            <option value="WC_120">120 KG</option>
            <option value="WC_120P">120+ KG</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Gym / Club Affiliation</label>
          <input 
            type="text" 
            name="club" 
            defaultValue={profile?.club?.name || ""}
            placeholder="e.g. Iron Clad Gym Ahmedabad"
            className="w-full bg-[#151515] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-gym-primary focus:outline-none"
          />
        </div>

        <button 
          type="submit"
          className="bg-gym-primary hover:bg-orange-600 text-black font-bold uppercase tracking-widest text-xs py-3 rounded-lg transition-colors mt-4"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
