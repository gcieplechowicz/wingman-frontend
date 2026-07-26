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
        error: "Missing QR data"
      },
      {
        status: 400
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
        connectionRetries: 3,
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
      result instanceof Api.auth.LoginTokenMigrateTo
    ) {

      console.log(
        "MIGRATE REQUIRED TO DC:",
        result.dcId
      );


      await client._switchDC(
        result.dcId
      );


      const migrated =
        await client.invoke(
          new Api.auth.ImportLoginToken({
            token: Buffer.from(
              token,
              "base64url"
            ),
          })
        );


      if (
        !(migrated instanceof Api.auth.LoginTokenSuccess)
      ) {

        await client.disconnect();

        return NextResponse.json({
          status: "pending"
        });

      }


    }


    if (
      result instanceof Api.auth.LoginTokenSuccess ||
      result instanceof Api.auth.LoginTokenMigrateTo
    ) {


      console.log(
        "LOGIN SUCCESS"
      );


      /*
       * Bardzo ważne:
       * używamy TEGO SAMEGO clienta.
       * Tutaj jest authKey po QR login.
       */


      const me =
        await client.getMe();


      console.log(
        "AUTHORIZED USER:",
        me.id
      );


      const gramJsSession =
        (client.session as any).save() as string;


      console.log(
        "GRAM SESSION PREFIX:",
        gramJsSession.substring(0, 40)
      );


      console.log(
        "DC:",
        client.session.dcId
      );


      console.log(
        "SERVER:",
        client.session.serverAddress
      );


      console.log(
        "HAS AUTH:",
        Boolean(
          client.session.authKey
        )
      );


      await client.disconnect();


      return NextResponse.json({

        status: "AUTHORIZED",

        sessionString:
          gramJsSession

      });

    }



    await client.disconnect();


    return NextResponse.json({

      status: "pending"

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
        status: "error",

        error:
          err instanceof Error
            ? err.message
            : "QR check failed"
      }
    );

  }

}