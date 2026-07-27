import { api } from "@/lib/api";
import { TenantRail } from "@/components/TenantRail";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const tenants = await api.listTenants();

  return (
    <div className="h-screen flex flex-col md:flex-row bg-bg overflow-hidden">
      <TenantRail tenants={tenants} />
      <div className="flex-1 min-w-0 min-h-0">{children}</div>
    </div>
  );
}
