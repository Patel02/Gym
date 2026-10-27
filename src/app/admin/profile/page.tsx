import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AdminProfileEditor from "@/components/admin/AdminProfileEditor";

export const revalidate = 30;

export const metadata = {
  title: "Admin Profile & Master Credentials | A&T Powerlifting Federation",
  description: "Administrative profile management, photo upload, and multi-factor OTP password security.",
};

export default async function AdminProfilePage() {
  const session = await auth();

  // Strict Admin Role Guard
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const admin = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!admin || admin.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const serializedData = {
    id: admin.id,
    name: admin.name || "Administrator",
    email: admin.email || "",
    image: admin.image || null,
    role: admin.role,
    createdAt: admin.createdAt.toISOString(),
    updatedAt: admin.updatedAt.toISOString(),
  };

  return <AdminProfileEditor initialData={serializedData} />;
}
