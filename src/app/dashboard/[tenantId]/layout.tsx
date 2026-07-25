import Link from "next/link";
import { api } from "@/lib/api";
import { TenantNav } from "@/components/TenantNav";

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  const tenant = await api.getTenant(tenantId);

  return (
    <div className="h-screen flex flex-col">
      <header className="border-b border-border px-8 py-4 flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-lg font-semibold">{tenant.name}</h1>
            <span
              className={`text-[10px] font-mono uppercase tracking-wide px-2 py-0.5 rounded-full ${
                tenant.active ? "bg-online/15 text-online" : "bg-text-muted/15 text-text-muted"
              }`}
            >
              {tenant.active ? "Active" : "Paused"}
            </span>
          </div>
          <p className="text-xs text-text-muted mt-0.5">
            {tenant.personaAge ? `${tenant.personaAge} · ` : ""}
            {tenant.personaGender ?? "—"} · {tenant.chatStyle ?? "normal"} · {tenant.language.toUpperCase()}
          </p>
        </div>
        <TenantNav tenantId={tenant.id} />
      </header>
      <div className="flex-1 min-h-0">{children}</div>
    </div>
  );
}
