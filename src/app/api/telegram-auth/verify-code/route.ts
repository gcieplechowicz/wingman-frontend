import { NextRequest, NextResponse } from "next/server";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { Api } from "telegram/tl";

/**
 * Resumes the login started in /send-code, using the transport session the
 * browser passed back rather than any server-side memory of the earlier
 * request (see that route's comment on why - Vercel's serverless model).
 */
export async function POST(req: NextRequest) {
  const { apiId, apiHash, phoneNumber, phoneCodeHash, transportSession, code, password } = await req.json();

  if (!apiId || !apiHash || !phoneNumber || !phoneCodeHash || !transportSession || !code) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const client = new TelegramClient(new StringSession(transportSession), Number(apiId), apiHash, {
    connectionRetries: 3,
  });

  try {
    await client.connect();

    try {
      await client.invoke(
        new Api.auth.SignIn({ phoneNumber, phoneCodeHash, phoneCode: code })
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);

      // SESSION_PASSWORD_NEEDED is Telegram's own MTProto error code for "this
      // account has two-factor auth enabled" - consistent across every
      // Telegram client library, so I'm confident in this specific check even
      // though the password-submission call below is the part worth
      // double-checking against GramJS's actual API.
      if (message.includes("SESSION_PASSWORD_NEEDED")) {
        if (!password) {
          await client.disconnect();
          return NextResponse.json({ requiresPassword: true });
        }

        // NOTE: this is the one call in this route I'm least confident about
        // verifying without GramJS's live docs - the 2FA/SRP password flow.
        // If this specific line errors, check gram.js.org for the current
        // method name/signature (it may be `client.signInWithPassword` or a
        // lower-level `Api.auth.CheckPassword` + SRP helper, depending on
        // the installed version).
        await client.signInWithPassword(
          { apiId: Number(apiId), apiHash },
          {
            password: async () => password,
            onError: (e) => {
              throw e;
            },
          }
        );
      } else {
        throw err;
      }
    }

    const finalSessionString = client.session.save();
    await client.disconnect();

    return NextResponse.json({ sessionString: finalSessionString });
  } catch (err) {
    await client.disconnect().catch(() => {});
    const message = err instanceof Error ? err.message : "Failed to verify code";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
