# frontend

Next.js (App Router) dashboard: sign in with Clerk, connect WhatsApp numbers,
configure each one's persona, and read through every conversation in a
WhatsApp-Web-style split view.

## Pages

| Route | Purpose |
|---|---|
| `/` | Landing page, redirects signed-in users to `/dashboard` |
| `/sign-in`, `/sign-up` | Clerk auth pages |
| `/dashboard` | Redirects to your first tenant, or `/dashboard/new` if you have none |
| `/dashboard/new` | Connect a WhatsApp number + set its persona |
| `/dashboard/[tenantId]/conversations` | Split view: conversation list (left) + transcript (right) |
| `/dashboard/[tenantId]/conversations/[conversationId]` | Same view with a conversation selected |
| `/dashboard/[tenantId]/settings` | Edit persona config — age, gender, chat style, language, active flag |

## Approving, blocking, and deleting conversations

Every brand-new conversation starts `PENDING` — reply-consumer-service
persists incoming messages but does not call the LLM or send a WhatsApp
reply until it's approved, specifically to avoid burning LLM credits on
bots or unwanted contacts. `ConversationActions` (shown at the top of the
chat pane) surfaces this:

- **Pending** conversations show an "Approve" / "Block" prompt.
- **Blocked** conversations show an "Unblock" option and stay permanently
  silent otherwise — no replies are ever generated while blocked, regardless
  of how many new messages arrive.
- **Approved** conversations show a quiet "Block this person" link.
- **Delete conversation** is available in every state (click twice to
  confirm) — deletes the conversation and its messages entirely, for cleanup
  or easier testing.

All three actions call backend-api-service (`PATCH /api/conversations/{id}/status`,
`DELETE /api/conversations/{id}`) via the same-origin proxy routes under
`src/app/api/proxy/conversations/`.

## How auth flows through to the backend

1. `middleware.ts` protects everything under `/dashboard` with Clerk.
2. Server Components (pages/layouts) call `src/lib/api.ts`, which pulls the
   Clerk session token via `auth().getToken()` and attaches it as
   `Authorization: Bearer <token>` when calling backend-api-service. This
   works because backend-api-service verifies the same token as a standard
   Clerk-issued JWT (see its `CLERK_ISSUER_URI` config).
3. Client Components (the persona form) can't safely hold onto that token
   themselves, so they call same-origin routes under `src/app/api/proxy/*`
   instead — those routes run server-side, fetch the token the same way, and
   forward the request. The browser never sees a backend-api URL or token.

## Required environment variables

See `.env.example`. In short: your Clerk publishable + secret keys, and
`BACKEND_API_BASE_URL` pointing at your deployed backend-api-service.

## Design notes

- **Visual direction**: dark, "late-night texting" palette (deep plum/near-black
  background, warm rose "spark" accent) rather than copying WhatsApp's own
  green — this is a distinct product, not a WhatsApp clone. Space Grotesk for
  headings, Inter for body text, IBM Plex Mono for timestamps/ids.
- **The one signature detail**: the active conversation in the list gets a
  soft rose glow (`.conversation-row-active` in `globals.css`) instead of a
  flat highlight — used once, deliberately, so it stays a signal rather than
  becoming visual noise.
- **Chat bubbles**: `ASSISTANT` messages (what your number actually sent)
  render on the right in the spark gradient; `USER` messages (the match's
  incoming texts) render on the left — mirroring WhatsApp Web's own left/right
  convention for "them" vs "you."
- **No contact names yet** — WhatsApp only gives you a phone number for a new
  chat, so contacts show as `Match ···1234` (last 4 digits). Adding a
  "nickname this contact" field would be a natural next feature.
- **Pagination isn't wired into the UI yet** — `api.ts` accepts a `page`
  param and the backend returns proper `Page<T>` metadata, but the list
  views currently only render page 0. Fine while conversation counts are
  low; worth adding "load more" once they're not.
- I could not run `npm install` / `next build` in this environment (no
  network access), so treat this as a carefully-reasoned but unverified
  skeleton — run it locally first before deploying.
