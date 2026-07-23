import { TenantForm } from "@/components/TenantForm";

export default function NewTenantPage() {
  return (
    <main className="h-full overflow-y-auto px-10 py-12">
      <p className="font-mono text-xs tracking-[0.2em] text-spark uppercase mb-2">New assistant</p>
      <h1 className="font-display text-3xl font-semibold mb-8">Connect a WhatsApp number</h1>
      <TenantForm mode="create" />
    </main>
  );
}
