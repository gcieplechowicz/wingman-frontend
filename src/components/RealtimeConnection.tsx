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
 * There's no replay/backfill on the server side - a broadcast that fires
 * while this socket is disconnected is just gone for this client. Mobile
 * browsers (Safari in particular) suspend backgrounded tabs' WebSocket
 * connections aggressively - locking the screen or switching apps for even
 * a few seconds can drop it - so this leans on two things to catch up
 * afterward rather than trying to prevent the disconnect: refreshing on
 * every successful (re)connect (not just the first), and reconnecting +
 * refreshing immediately when the tab becomes visible again, via the Page
 * Visibility API, instead of waiting for the backoff timer or the next
 * unrelated event to reveal the connection is stale.
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
    let hasConnectedOnce = false;

    function clearReconnectTimer() {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
    }

    async function connect() {
      clearReconnectTimer();

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
        // Skip the very first connect - the page just loaded with fresh
        // data. Every connect after that (including ones triggered by the
        // tab becoming visible again below) means we were disconnected for
        // some stretch of time and may have missed a broadcast, so catch up.
        if (hasConnectedOnce) {
          router.refresh();
        }
        hasConnectedOnce = true;
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

    function handleVisibilityChange() {
      if (document.visibilityState !== "visible") return;
      if (socket && socket.readyState === WebSocket.OPEN) return;
      // Tab came back into view and the socket isn't open (most likely the
      // browser suspended it while backgrounded) - reconnect right away
      // instead of waiting out whatever backoff delay is currently pending.
      reconnectDelay = INITIAL_RECONNECT_DELAY_MS;
      connect();
    }

    connect();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearReconnectTimer();
      socket?.close();
    };
  }, [tenantId, getToken, router]);

  return null;
}
