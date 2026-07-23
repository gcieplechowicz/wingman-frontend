import { redirect } from "next/navigation";
import { api } from "@/lib/api";

export default async function DashboardIndexPage() {
  const tenants = await api.listTenants();

  if (tenants.length === 0) {
    redirect("/dashboard/new");
  }

  redirect(`/dashboard/${tenants[0].id}/conversations`);
}
