import { StringSession } from "telegram/sessions";

export function convertTelegramSession(
  convertTelegramSession:string
):string {

  const gram =
    new StringSession(
      convertTelegramSession
    );


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


  return telethon.save();
}