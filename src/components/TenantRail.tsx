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
    <aside className="w-full h-16 md:h-auto md:w-20 shrink-0 bg-surface border-b md:border-b-0 md:border-r border-border flex flex-row md:flex-col items-center px-3 md:px-0 py-0 md:py-5 gap-3 md:gap-4 overflow-x-auto md:overflow-x-visible">
      <Link
        href="/dashboard"
        className="font-display text-spark text-2xl font-bold leading-none shrink-0"
        title="Afterhours"
      >
        ✦
      </Link>

      <div className="w-px h-6 md:w-8 md:h-px bg-border shrink-0" />

      <nav className="flex flex-row md:flex-col gap-3 overflow-x-auto md:overflow-x-visible md:overflow-y-auto shrink-0">
        {tenants.map((tenant) => {
          const isActive = tenant.id === activeTenantId;
          return (
            <Link
              key={tenant.id}
              href={`/dashboard/${tenant.id}/conversations`}
              title={tenant.name}
              className={`w-11 h-11 shrink-0 rounded-2xl flex items-center justify-center font-display text-sm font-semibold transition-all
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
        title="Add a Telegram account"
        className="w-11 h-11 shrink-0 rounded-2xl border border-dashed border-border text-text-muted hover:text-spark hover:border-spark flex items-center justify-center text-xl transition-colors"
      >
        +
      </Link>

      <div className="md:mt-auto ml-auto md:ml-0 shrink-0">
        <UserButton
          appearance={{
            elements: { userButtonAvatarBox: "w-9 h-9" },
          }}
        />
      </div>
    </aside>
  );
}
