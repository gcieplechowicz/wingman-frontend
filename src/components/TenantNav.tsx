"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function TenantNav({ tenantId }: { tenantId: string }) {
  const pathname = usePathname();
  const isSettings = pathname.includes("/settings");

  const tabClass = (active: boolean) =>
    `text-sm font-medium px-4 py-1.5 rounded-full transition-colors ${
      active ? "bg-spark text-white" : "text-text-muted hover:text-text-primary"
    }`;

  return (
    <nav className="flex gap-1 bg-surface rounded-full p-1">
      <Link href={`/dashboard/${tenantId}/conversations`} className={tabClass(!isSettings)}>
        Conversations
      </Link>
      <Link href={`/dashboard/${tenantId}/settings`} className={tabClass(isSettings)}>
        Settings
      </Link>
    </nav>
  );
}
