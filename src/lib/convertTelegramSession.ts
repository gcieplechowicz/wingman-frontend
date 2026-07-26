import { StringSession } from "telegram/sessions";


export function convertTelegramSession(
  gramJsSessionString: string
): string {


  const gram =
    new StringSession(
      gramJsSessionString
    );


  if (!gram.authKey) {
    throw new Error(
      "Missing GramJS auth key"
    );
  }


  const telethon =
    new StringSession("");



  telethon.setDC(
    gram.dcId,
    normalizeServer(
      gram.serverAddress
    ),
    443
  );



  (telethon as any).authKey =
    gram.authKey;



  return telethon.save();

}



function normalizeServer(
  server:string
):string {


  /*
   * GramJS czasami zwraca
   * zakodowany adres.
   *
   * Telethon potrzebuje normalnego IP.
   */


  if (
    server.startsWith("e:")
  ) {

    const decoded =
      Buffer.from(
        server.substring(2),
        "hex"
      )
      .toString("ascii");


    return decoded;

  }


  return server;

}