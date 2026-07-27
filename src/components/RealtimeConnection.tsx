"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const INITIAL_RECONNECT_DELAY_MS = 1000;
const MAX_RECONNECT_DELAY_MS = 30000;

/**
 * Mounted once per tenant dashboard. Connects directly from the browser to
 * backend-api's WebSocket endpoint on Azure Container Apps (bypassing this
 * app's own Vercel-hosted server/proxy layer entirely, since Vercel's
 * serverless function duration cap doesn't apply there). No visible UI - on
 * any message it just calls router.refresh(), which re-fetches this route's
 * server components (conversation list / chat pane) with fresh data, so no
 * changes were needed to how those components consume their props.
 *
 * Clerk session tokens are short-lived (~60s) and only prove identity at
 * connect time, so a fresh one is fetched on every (re)connect attempt
 * rather than reused across the socket's lifetime.
 */
export function RealtimeConnection({ tenantId }: { tenantId: string }) {
  const { getToken } = useAuth();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    let socket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let reconnectDelay = INITIAL_RECONNECT_DELAY_MS;

    async function connect() {
      const wsBaseUrl = process.env.NEXT_PUBLIC_BACKEND_WS_URL;
      if (!wsBaseUrl) {
        console.warn("NEXT_PUBLIC_BACKEND_WS_URL is not set - realtime updates disabled");
        return;
      }

      const token = await getToken();
      if (cancelled || !token) return;

      const url = `${wsBaseUrl}?token=${encodeURIComponent(token)}&tenantId=${encodeURIComponent(tenantId)}`;
      socket = new WebSocket(url);

      socket.onopen = () => {
        reconnectDelay = INITIAL_RECONNECT_DELAY_MS;
      };

      socket.onmessage = () => {
        router.refresh();
      };

      socket.onclose = () => {
        if (cancelled) return;
        reconnectTimer = setTimeout(() => {
          reconnectDelay = Math.min(reconnectDelay * 2, MAX_RECONNECT_DELAY_MS);
          connect();
        }, reconnectDelay);
      };

      socket.onerror = () => {
        socket?.close();
      };
    }

    connect();

    return () => {
      cancelled = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, [tenantId, getToken, router]);

  return null;
}
