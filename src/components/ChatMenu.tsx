"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Conversation } from "@/lib/types";

/**
 * "..." overflow menu for Block/Delete on APPROVED conversations, on every
 * breakpoint - replaces what used to be two always-visible inline text
 * buttons (ConversationActions' old default branch, now a no-op for this
 * status). PENDING/BLOCKED conversations keep their existing banner
 * (ConversationActions) instead, since Approve/Unblock are primary
 * decisions worth staying visible, not tucked into a menu.
 */
export function ChatMenu({ tenantId, conversation }: { tenantId: string; conversation: Conversation }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
        setConfirmingDelete(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (conversation.status !== "APPROVED") return null;

  async function handleBlock() {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/proxy/conversations/${conversation.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: "BLOCKED" }),
      });
      if (!res.ok) throw new Error(await res.text());
      setOpen(false);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/proxy/conversations/${conversation.id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) throw new Error(await res.text());
      router.push(`/dashboard/${tenantId}/conversations`);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div ref={menuRef} className="relative shrink-0">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Conversation options"
        className="w-8 h-8 flex items-center justify-center rounded-full text-text-muted hover:text-text-primary hover:bg-surface transition-colors text-lg leading-none"
      >
        •••
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-56 bg-surface-raised border border-border rounded-xl shadow-lg py-1 z-20">
          <button
            disabled={submitting}
            onClick={handleBlock}
            className="w-full text-left px-4 py-2.5 text-sm text-text-primary hover:bg-surface transition-colors disabled:opacity-50"
          >
            Block this person
          </button>
          <button
            disabled={submitting}
            onClick={handleDelete}
            className={`w-full text-left px-4 py-2.5 text-sm transition-colors disabled:opacity-50 ${
              confirmingDelete ? "text-spark font-medium" : "text-text-primary hover:bg-surface"
            }`}
          >
            {confirmingDelete ? "Click again to permanently delete" : "Delete conversation"}
          </button>
        </div>
      )}
    </div>
  );
}
