import { auth } from "@clerk/nextjs/server";
import type {
  Conversation,
  Message,
  Page,
  Tenant,
  TenantCreateInput,
  TenantUpdateInput,
} from "./types";

const BASE_URL = process.env.BACKEND_API_BASE_URL;

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/**
 * Server-side fetch helper: pulls the Clerk session token for the current
 * request and attaches it as a Bearer token, since backend-api-service
 * verifies it as a standard Clerk-issued JWT.
 */
async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const { getToken } = await auth();
  const token = await getToken();

  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new ApiError(response.status, body || response.statusText);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  listTenants: () => apiFetch<Tenant[]>("/api/tenants"),

  getTenant: (tenantId: string) => apiFetch<Tenant>(`/api/tenants/${tenantId}`),

  createTenant: (input: TenantCreateInput) =>
    apiFetch<Tenant>("/api/tenants", { method: "POST", body: JSON.stringify(input) }),

  updateTenant: (tenantId: string, input: TenantUpdateInput) =>
    apiFetch<Tenant>(`/api/tenants/${tenantId}`, { method: "PUT", body: JSON.stringify(input) }),

  listConversations: (tenantId: string, page = 0) =>
    apiFetch<Page<Conversation>>(
      `/api/tenants/${tenantId}/conversations?page=${page}&size=30&sort=updatedAt,desc`
    ),

  getConversation: (conversationId: string) =>
    apiFetch<Conversation>(`/api/conversations/${conversationId}`),

  listMessages: (conversationId: string, page = 0) =>
    apiFetch<Page<Message>>(`/api/conversations/${conversationId}/messages?page=${page}&size=100`),
};

export { ApiError };
