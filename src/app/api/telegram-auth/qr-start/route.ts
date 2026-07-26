import { NextRequest, NextResponse } from "next/server";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { Api } from "telegram/tl";


export async function POST(req: NextRequest) {

  const {
    apiId,
    apiHash,
  } = await req.json();


  if (!apiId || !apiHash) {
    return NextResponse.json(
      { error: "apiId and apiHash required" },
      { status: 400 }
    );
  }


  const client = new TelegramClient(
    new StringSession(""),
    Number(apiId),
    apiHash,
    {
      connectionRetries: 3,
    }
  );


  try {

    await client.connect();


    const result = await client.invoke(
      new Api.auth.ExportLoginToken({
        apiId: Number(apiId),
        apiHash,
        exceptIds: [],
      })
    );


    if (!(result instanceof Api.auth.LoginToken)) {
      throw new Error("Unexpected Telegram response");
    }


    const transportSession = client.session.save();


    await client.disconnect();


    const token = Buffer
      .from(result.token)
      .toString("base64url");


    const qrUrl =
      `tg://login?token=${token}`;


    return NextResponse.json({

      qrUrl,

      token,

      transportSession,

      apiId,

      apiHash,

    });


  } catch (err) {

    await client.disconnect().catch(() => {});


    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "QR start failed",
      },
      {
        status: 400,
      }
    );
  }
}