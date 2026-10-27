import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getPendingDeletionRequestsAction } from "@/actions/admin-deletion.actions";
import DeletionRequestsDesk from "@/components/admin/DeletionRequestsDesk";

export const revalidate = 30;

export const metadata = {
  title: "Account Deletion Approval Desk | A&T Powerlifting Federation Admin",
  description: "Review and approve athlete account deletion requests with permanent data cleanup.",
};

export default async function DeletionRequestsPage() {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const res = await getPendingDeletionRequestsAction();
  const requests = res.success && res.data ? res.data : [];

  return <DeletionRequestsDesk initialRequests={requests} />;
}
