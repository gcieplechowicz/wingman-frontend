import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  TelegramClient,
} from "telegram";

import {
  StringSession,
} from "telegram/sessions";

import {
  Api,
} from "telegram/tl";

import {
  convertTelegramSession,
} from "@/lib/convertTelegramSession";


export async function POST(
  req: NextRequest
) {

  const {
    apiId,
    apiHash,
    token,
    transportSession,
  } = await req.json();


  if (
    !apiId ||
    !apiHash ||
    !token ||
    !transportSession
  ) {
    return NextResponse.json(
      {
        error:"Missing QR data"
      },
      {
        status:400
      }
    );
  }


  const client =
    new TelegramClient(
      new StringSession(
        transportSession
      ),
      Number(apiId),
      apiHash,
      {
        connectionRetries:3,
      }
    );


  try {

    console.log(
      "STEP 1 - before connect"
    );


    await client.connect();


    console.log(
      "STEP 2 - connected"
    );


    const result =
      await client.invoke(
        new Api.auth.ImportLoginToken({
          token: Buffer.from(
            token,
            "base64url"
          ),
        })
      );


    console.log(
      "STEP 3 RESULT:",
      result.className
    );


    if (
      result instanceof Api.auth.LoginTokenSuccess
    ) {


      console.log(
        "STEP 4 LOGIN SUCCESS"
      );


      const telethonSession =
        convertTelegramSession(
          client.session as StringSession
        );


      console.log(
        "TELETHON SESSION:",
        telethonSession
      );


      await client.disconnect();


      return NextResponse.json({
        status:"AUTHORIZED",
        sessionString: telethonSession
      });

    }


    if (
      result instanceof Api.auth.LoginTokenMigrateTo
    ) {

      console.log(
        "MIGRATE REQUIRED:",
        result.dcId
      );


      await client.disconnect();


      return NextResponse.json({
        status:"migrate",
        dcId: result.dcId
      });
    }


    await client.disconnect();


    return NextResponse.json({
      status:"pending"
    });


  } catch(err) {


    console.error(
      "QR ERROR",
      err
    );


    await client.disconnect()
      .catch(()=>{});


    return NextResponse.json(
      {
        status:"error",
        error:
          err instanceof Error
            ? err.message
            : "QR check failed"
      }
    );

  }

}