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


    await client.connect();



    const result =
      await client.invoke(
        new Api.auth.ImportLoginToken({
          token: Buffer.from(
            token,
            "base64url"
          ),
        })
      );



    if (
      result instanceof Api.auth.LoginTokenSuccess
    ) {


      /*
       * At this point GramJS has the
       * authorized auth key.
       *
       * Convert BEFORE disconnect.
       */

      const gramJsSession = (
        client.session.save as unknown as () => string
      )();

      console.log(
         "GRAM SESSION:",
         gramJsSession
       );

      const telethonSession: string =
        convertTelegramSession(
          gramJsSession
        );



      await client.disconnect();



      return NextResponse.json({

        status:"AUTHORIZED",

        sessionString:
          telethonSession

      });

    }



    await client.disconnect();



    return NextResponse.json({

      status:"pending"

    });



  } catch(err) {


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