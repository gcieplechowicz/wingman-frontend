"use client";

import { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

type Step =
  | "idle"
  | "starting"
  | "waiting"
  | "password"
  | "done"
  | "error";

type QRData = {
  loginId: string;
  qrLoginUrl: string;
};

/**
 * Drives telegram-integration-service's QR login flow via backend-api-service
 * (see /api/proxy/telegram-qr-login/*) - this component never talks to
 * Telegram itself. The actual MTProto handshake happens server-side in
 * telegram-integration-service's Telethon sidecar; here we just render the
 * QR code it hands back and poll for the scan.
 */
export function TelegramLoginWizard({
  apiId,
  apiHash,
  onSessionReady,
  onPhoneNumberReady,
}: {
  apiId: string;
  apiHash: string;
  onSessionReady: (sessionString: string) => void;
  onPhoneNumberReady: (phoneNumber: string) => void;
}) {
  const [step, setStep] = useState<Step>("idle");
  const [qrData, setQrData] = useState<QRData | null>(null);
  const [password, setPassword] = useState("");
  const [submittingPassword, setSubmittingPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ready = Boolean(apiId.trim() && apiHash.trim());

  // Cancel any still-pending login on unmount (component swapped out, user
  // navigates away mid-scan) so telegram-integration-service doesn't keep an
  // unauthorized Telethon client connected forever.
  const qrDataRef = useRef(qrData);
  const stepRef = useRef(step);
  useEffect(() => {
    qrDataRef.current = qrData;
    stepRef.current = step;
  });
  useEffect(() => {
    return () => {
      if (qrDataRef.current && stepRef.current !== "done") {
        cancelQrLogin(qrDataRef.current.loginId);
      }
    };
  }, []);

  async function startQrLogin() {
    setStep("starting");
    setError(null);

    try {
      const res = await fetch("/api/proxy/telegram-qr-login/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiId, apiHash }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to start QR login");
      }

      setQrData({ loginId: data.loginId, qrLoginUrl: data.qrLoginUrl });
      setStep("waiting");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStep("error");
    }
  }

  useEffect(() => {
    if (step !== "waiting" || !qrData) {
      return;
    }

    let cancelled = false;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/proxy/telegram-qr-login/${qrData.loginId}/poll`, {
          method: "POST",
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error ?? "QR verification failed");
        }
        if (cancelled) {
          return;
        }

        if (data.status === "AUTHORIZED") {
          clearInterval(interval);
          onSessionReady(data.sessionString);
          onPhoneNumberReady(data.phoneNumber);
          setStep("done");
        } else if (data.status === "PASSWORD_REQUIRED") {
          clearInterval(interval);
          setStep("password");
        } else if (data.status === "EXPIRED") {
          const recreateRes = await fetch(`/api/proxy/telegram-qr-login/${qrData.loginId}/recreate`, {
            method: "POST",
          });
          const recreateData = await recreateRes.json();

          if (!recreateRes.ok) {
            throw new Error(recreateData.error ?? "QR code expired");
          }
          if (!cancelled) {
            setQrData({ loginId: qrData.loginId, qrLoginUrl: recreateData.qrLoginUrl });
          }
        }
        // PENDING -> keep polling
      } catch (err) {
        clearInterval(interval);
        setError(err instanceof Error ? err.message : "QR verification failed");
        setStep("error");
      }
    }, 3000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [step, qrData, onSessionReady, onPhoneNumberReady]);

  async function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!qrData) {
      return;
    }

    setSubmittingPassword(true);
    setError(null);

    try {
      const res = await fetch(`/api/proxy/telegram-qr-login/${qrData.loginId}/password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Incorrect password");
      }

      onSessionReady(data.sessionString);
      onPhoneNumberReady(data.phoneNumber);
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Incorrect password");
    } finally {
      setSubmittingPassword(false);
    }
  }

  if (step === "done") {
    return (
      <div className="flex items-center gap-2 text-sm text-online bg-online/10 border border-online/30 rounded-xl px-4 py-2.5">
        ✓ Telegram account connected
      </div>
    );
  }

  return (
    <div className="border border-border rounded-xl p-4 space-y-4 bg-surface">
      <p className="text-sm font-medium">Connect Telegram account</p>

      {(step === "idle" || step === "error") && (
        <button
          type="button"
          disabled={!ready}
          onClick={startQrLogin}
          className="text-xs font-medium bg-spark text-white px-4 py-2 rounded-full disabled:opacity-50"
        >
          Connect with Telegram QR
        </button>
      )}

      {step === "starting" && <p className="text-sm">Generating QR...</p>}

      {step === "waiting" && qrData && (
        <div className="space-y-3">
          <p className="text-xs text-text-muted">Telegram → Settings → Devices → Link Desktop Device</p>
          <QRCodeSVG value={qrData.qrLoginUrl} size={220} />
          <p className="text-xs text-text-muted">Waiting for scan...</p>
        </div>
      )}

      {step === "password" && (
        <form onSubmit={submitPassword} className="space-y-3">
          <p className="text-xs text-text-muted">
            This account has a 2FA password set — enter it to finish connecting.
          </p>
          <input
            type="password"
            required
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="2FA password"
            className="input text-sm"
          />
          <button
            type="submit"
            disabled={submittingPassword}
            className="text-xs font-medium bg-spark text-white px-4 py-2 rounded-full disabled:opacity-50"
          >
            {submittingPassword ? "Verifying..." : "Confirm"}
          </button>
        </form>
      )}

      {error && <p className="text-xs text-spark">{error}</p>}
    </div>
  );
}

function cancelQrLogin(loginId: string) {
  fetch(`/api/proxy/telegram-qr-login/${loginId}/cancel`, { method: "POST" }).catch(() => {});
}
