"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Tenant, TenantCreateInput, TenantUpdateInput } from "@/lib/types";

const CHAT_STYLES = [
  { value: "flirty", label: "Flirty" },
  { value: "fun", label: "Fun & playful" },
  { value: "normal", label: "Normal / down-to-earth" },
  { value: "witty", label: "Witty & sarcastic" },
];

const GENDERS = ["Woman", "Man", "Non-binary"];

type Props =
  | { mode: "create" }
  | { mode: "edit"; tenant: Tenant };

export function TenantForm(props: Props) {
  const router = useRouter();
  const existing = props.mode === "edit" ? props.tenant : undefined;

  const [name, setName] = useState(existing?.name ?? "");
  const [waPhoneNumberId, setWaPhoneNumberId] = useState(existing?.waPhoneNumberId ?? "");
  const [waAccessToken, setWaAccessToken] = useState("");
  const [personaAge, setPersonaAge] = useState(existing?.personaAge?.toString() ?? "");
  const [personaGender, setPersonaGender] = useState(existing?.personaGender ?? "Woman");
  const [chatStyle, setChatStyle] = useState(existing?.chatStyle ?? "flirty");
  const [language, setLanguage] = useState<"en" | "pl">((existing?.language as "en" | "pl") ?? "en");
  const [ownerEmail, setOwnerEmail] = useState(existing?.ownerEmail ?? "");
  const [active, setActive] = useState(existing?.active ?? true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (props.mode === "create") {
        const input: TenantCreateInput = {
          name,
          waPhoneNumberId,
          waAccessToken,
          personaAge: Number(personaAge),
          personaGender,
          chatStyle,
          language,
          ownerEmail: ownerEmail || undefined,
        };
        const res = await fetch("/api/proxy/tenants", {
          method: "POST",
          body: JSON.stringify(input),
        });
        if (!res.ok) throw new Error(await res.text());
        const created = await res.json();
        router.push(`/dashboard/${created.id}/conversations`);
      } else {
        const input: TenantUpdateInput = {
          personaAge: Number(personaAge),
          personaGender,
          chatStyle,
          language,
          ownerEmail: ownerEmail || undefined,
          active,
        };
        const res = await fetch(`/api/proxy/tenants/${props.tenant.id}`, {
          method: "PUT",
          body: JSON.stringify(input),
        });
        if (!res.ok) throw new Error(await res.text());
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-8">
      {props.mode === "create" && (
        <section className="space-y-4">
          <h2 className="font-display text-lg font-semibold">Connect the number</h2>
          <Field label="Assistant name" hint="How you'll recognize this account in the dashboard">
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Main Tinder number"
              className="input"
            />
          </Field>
          <Field label="WhatsApp phone_number_id" hint="From your Meta app dashboard">
            <input
              required
              value={waPhoneNumberId}
              onChange={(e) => setWaPhoneNumberId(e.target.value)}
              placeholder="1029384756"
              className="input font-mono text-sm"
            />
          </Field>
          <Field label="WhatsApp access token">
            <input
              required
              type="password"
              value={waAccessToken}
              onChange={(e) => setWaAccessToken(e.target.value)}
              placeholder="EAAG..."
              className="input font-mono text-sm"
            />
          </Field>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold">Persona</h2>
        <p className="text-sm text-text-muted -mt-2">
          This is what the assistant tells the model about itself before every reply.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Age">
            <input
              required
              type="number"
              min={18}
              max={100}
              value={personaAge}
              onChange={(e) => setPersonaAge(e.target.value)}
              placeholder="27"
              className="input"
            />
          </Field>
          <Field label="Gender">
            <select value={personaGender} onChange={(e) => setPersonaGender(e.target.value)} className="input">
              {GENDERS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Chat style" hint="Sets the overall tone the assistant replies with">
          <div className="grid grid-cols-2 gap-2">
            {CHAT_STYLES.map((style) => (
              <button
                type="button"
                key={style.value}
                onClick={() => setChatStyle(style.value)}
                className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors text-left
                  ${chatStyle === style.value
                    ? "border-spark bg-spark/10 text-spark"
                    : "border-border text-text-muted hover:text-text-primary hover:border-text-muted"}`}
              >
                {style.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Reply language">
          <select value={language} onChange={(e) => setLanguage(e.target.value as "en" | "pl")} className="input">
            <option value="en">English</option>
            <option value="pl">Polish</option>
          </select>
        </Field>

        <Field label="Notification email" hint="Where we'll email you when a new match starts texting">
          <input
            type="email"
            value={ownerEmail}
            onChange={(e) => setOwnerEmail(e.target.value)}
            placeholder="you@example.com"
            className="input"
          />
        </Field>

        {props.mode === "edit" && (
          <label className="flex items-center gap-3 text-sm text-text-muted pt-2">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="w-4 h-4 accent-spark"
            />
            Assistant is active and replying automatically
          </label>
        )}
      </section>

      {error && <p className="text-sm text-spark">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="bg-spark hover:bg-spark-glow disabled:opacity-50 transition-colors text-white font-medium px-6 py-2.5 rounded-full"
      >
        {submitting ? "Saving…" : props.mode === "create" ? "Connect & start replying" : "Save changes"}
      </button>
    </form>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-text-primary">{label}</span>
      {hint && <span className="block text-xs text-text-muted">{hint}</span>}
      {children}
    </label>
  );
}
