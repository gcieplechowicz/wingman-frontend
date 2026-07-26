import { StringSession } from "telegram/sessions";


export function convertTelegramSession(
  gram: StringSession
): string {


  if (!gram.authKey) {
    throw new Error(
      "Missing auth key"
    );
  }


  const telethon =
    new StringSession("");


  telethon.setDC(
    gram.dcId,
    gram.serverAddress,
    gram.port
  );


  (telethon as any).authKey =
    gram.authKey;


  const result =
    (telethon as any).save();


  if (typeof result !== "string") {
    throw new Error(
      "Failed generating Telethon session"
    );
  }


  return result;
}