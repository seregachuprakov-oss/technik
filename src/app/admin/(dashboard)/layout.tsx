import { requireAdmin } from "@/server/auth/admin";
import { Shell } from "@/components/admin/Shell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <Shell>{children}</Shell>;
}
