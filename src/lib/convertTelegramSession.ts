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


  const dcId =
    gram.dcId;


  const ip =
    gram.serverAddress;


  const port =
    gram.port;


  const authKey =
    Buffer.from(
      gram.authKey.getKey()
    );



  /*
   Telethon StringSession format:

   version byte
   dc_id
   ip length
   ip
   port
   auth_key

  */


  const ipBuffer =
    Buffer.from(ip);



  const buffer =
    Buffer.concat([

      Buffer.from([1]),

      Buffer.from([
        dcId
      ]),


      Buffer.from([
        ipBuffer.length
      ]),

      ipBuffer,


      Buffer.from([
        port >> 8,
        port & 0xff
      ]),


      authKey

    ]);



  return buffer
    .toString("base64")
    .replace(/=+$/, "");

}