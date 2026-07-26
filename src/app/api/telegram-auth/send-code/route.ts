import { NextRequest, NextResponse } from "next/server";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";

/**
 * Starts a Telegram login. Deliberately does NOT keep the connection open
 * between requests - on Vercel, this route and /verify-code may run on
 * completely different serverless instances, possibly tens of seconds apart
 * while the person checks their phone for the code. Instead, the connection's
 * transport-level session (the MTProto auth key for this Telegram data
 * center - not yet tied to a logged-in user) is saved and sent back to the
 * browser, which passes it along to /verify-code to resume with the exact
 * same transport session and finish the login there.
 */
export async function POST(req: NextRequest) {
  const { apiId, apiHash, phoneNumber } = await req.json();

  if (!apiId || !apiHash || !phoneNumber) {
    return NextResponse.json({ error: "apiId, apiHash, and phoneNumber are required" }, { status: 400 });
  }

  const client = new TelegramClient(new StringSession(""), Number(apiId), apiHash, {
    connectionRetries: 3,
  });

  try {
    await client.connect();

    // NOTE: sendCode's exact signature is the one part of this route I
    // couldn't verify against GramJS's current docs/source without network
    // access - cross-check this against https://gram.js.org before trusting
    // it in production. The surrounding connect/session-save/disconnect
    // pattern is standard MTProto client usage and should hold regardless.
    const result = await client.sendCode({ apiId: Number(apiId), apiHash }, phoneNumber);

    const transportSession = client.session.save();
    await client.disconnect();

    return NextResponse.json({
      transportSession,
      phoneCodeHash: result.phoneCodeHash,
    });
  } catch (err) {
    await client.disconnect().catch(() => {});
    const message = err instanceof Error ? err.message : "Failed to send login code";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
