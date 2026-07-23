import { api } from "@/lib/api";
import { TenantForm } from "@/components/TenantForm";

export default async function TenantSettingsPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  const tenant = await api.getTenant(tenantId);

  return (
    <main className="h-full overflow-y-auto px-10 py-10">
      <TenantForm mode="edit" tenant={tenant} />
    </main>
  );
}
