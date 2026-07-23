"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import type { Tenant } from "@/lib/types";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function TenantRail({ tenants }: { tenants: Tenant[] }) {
  const pathname = usePathname();
  const activeTenantId = pathname.split("/")[2];
  return (
    <aside className="w-20 shrink-0 bg-surface border-r border-border flex flex-col items-center py-5 gap-4">
      <Link
        href="/dashboard"
        className="font-display text-spark text-2xl font-bold leading-none"
        title="Afterhours"
      >
        ✦
      </Link>

      <div className="w-8 border-t border-border" />

      <nav className="flex flex-col gap-3 overflow-y-auto">
        {tenants.map((tenant) => {
          const isActive = tenant.id === activeTenantId;
          return (
            <Link
              key={tenant.id}
              href={`/dashboard/${tenant.id}/conversations`}
              title={tenant.name}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center font-display text-sm font-semibold transition-all
                ${isActive
                  ? "bg-spark text-white shadow-spark-glow"
                  : "bg-surface-raised text-text-muted hover:text-text-primary hover:bg-surface-hover"}`}
            >
              {initials(tenant.name)}
            </Link>
          );
        })}
      </nav>

      <Link
        href="/dashboard/new"
        title="Add a WhatsApp number"
        className="w-11 h-11 rounded-2xl border border-dashed border-border text-text-muted hover:text-spark hover:border-spark flex items-center justify-center text-xl transition-colors"
      >
        +
      </Link>

      <div className="mt-auto">
        <UserButton
          appearance={{
            elements: { userButtonAvatarBox: "w-9 h-9" },
          }}
        />
      </div>
    </aside>
  );
}
