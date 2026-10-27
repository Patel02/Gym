import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { InitialPasswordChangeForm } from "@/components/auth/InitialPasswordChangeForm";

export default async function ChangePasswordPage() {
  const session = await auth();
  if (!session?.user?.mustChangePassword || !session.user.email) {
    redirect("/login");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4 py-12 text-white">
      <section className="w-full max-w-md space-y-6 rounded-2xl border border-white/10 bg-white/[0.03] p-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gym-primary">
            Account security
          </p>
          <h1 className="mt-2 text-2xl font-bold">Change your temporary password</h1>
          <p className="mt-2 text-sm text-gray-400">
            Choose a unique password before continuing to the federation dashboard.
          </p>
        </div>
        <InitialPasswordChangeForm />
      </section>
    </main>
  );
}
