"use client";

import { useState } from "react";

type Step = "idle" | "sending" | "code-sent" | "verifying" | "need-password" | "done" | "error";

export function TelegramLoginWizard({
  apiId,
  apiHash,
  phoneNumber,
  onSessionReady,
}: {
  apiId: string;
  apiHash: string;
  phoneNumber: string;
  onSessionReady: (sessionString: string) => void;
}) {
  const [step, setStep] = useState<Step>("idle");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Held only in this component's state, passed along to /verify-code -
  // never touches the tenants table or any other part of the app. See
  // send-code/route.ts for why this can't just live server-side.
  const [transportSession, setTransportSession] = useState("");
  const [phoneCodeHash, setPhoneCodeHash] = useState("");

  const ready = Boolean(apiId.trim() && apiHash.trim() && phoneNumber.trim());

  async function sendCode() {
    setStep("sending");
    setError(null);
    try {
      const res = await fetch("/api/telegram-auth/send-code", {
        method: "POST",
        body: JSON.stringify({ apiId, apiHash, phoneNumber }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to send code");

      setTransportSession(data.transportSession);
      setPhoneCodeHash(data.phoneCodeHash);
      setStep("code-sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStep("error");
    }
  }

  async function verifyCode(withPassword?: string) {
    setStep("verifying");
    setError(null);
    try {
      const res = await fetch("/api/telegram-auth/verify-code", {
        method: "POST",
        body: JSON.stringify({
          apiId,
          apiHash,
          phoneNumber,
          phoneCodeHash,
          transportSession,
          code,
          password: withPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to verify code");

      if (data.requiresPassword) {
        setStep("need-password");
        return;
      }

      onSessionReady(data.sessionString);
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      // Drop back to the password step (to retry) if that's where the
      // failure happened, otherwise back to "enter code".
      setStep(withPassword ? "need-password" : "code-sent");
    }
  }

  if (step === "done") {
    return (
      <div className="flex items-center gap-2 text-sm text-online bg-online/10 border border-online/30 rounded-xl px-4 py-2.5">
        <span>✓</span> Telegram account connected
      </div>
    );
  }

  return (
    <div className="border border-border rounded-xl p-4 space-y-3 bg-surface">
      <p className="text-sm font-medium">Connect this account</p>

      {(step === "idle" || step === "sending" || step === "error") && (
        <>
          <p className="text-xs text-text-muted">
            Sends a login code to this phone number via Telegram/SMS. Nothing is saved until you finish.
          </p>
          <button
            type="button"
            disabled={!ready || step === "sending"}
            onClick={sendCode}
            className="text-xs font-medium bg-spark text-white px-4 py-2 rounded-full disabled:opacity-50"
          >
            {step === "sending" ? "Sending code…" : "Send login code"}
          </button>
        </>
      )}

      {(step === "code-sent" || step === "verifying") && (
        <>
          <label className="block space-y-1.5">
            <span className="text-xs text-text-muted">Enter the code Telegram just sent</span>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="12345"
              className="input font-mono text-sm"
              autoFocus
            />
          </label>
          <button
            type="button"
            disabled={!code.trim() || step === "verifying"}
            onClick={() => verifyCode()}
            className="text-xs font-medium bg-spark text-white px-4 py-2 rounded-full disabled:opacity-50"
          >
            {step === "verifying" ? "Verifying…" : "Verify"}
          </button>
        </>
      )}

      {step === "need-password" && (
        <>
          <label className="block space-y-1.5">
            <span className="text-xs text-text-muted">
              This account has two-factor authentication — enter its password
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input text-sm"
              autoFocus
            />
          </label>
          <button
            type="button"
            disabled={!password.trim()}
            onClick={() => verifyCode(password)}
            className="text-xs font-medium bg-spark text-white px-4 py-2 rounded-full disabled:opacity-50"
          >
            Confirm
          </button>
        </>
      )}

      {error && <p className="text-xs text-spark">{error}</p>}
    </div>
  );
}
