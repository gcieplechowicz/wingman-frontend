import { StringSession } from "telegram/sessions";

export async function convertTelegramSession(
  gramJsSessionString: string
): Promise<string> {

  const gram =
    new StringSession(
      gramJsSessionString
    );


  await gram.load();


  if (!gram.authKey) {
    throw new Error(
      "Missing GramJS auth key after load()"
    );
  }


  const telethon =
    new StringSession("");


  telethon.setDC(
    gram.dcId!,
    gram.serverAddress!,
    gram.port!
  );


  telethon.authKey =
    gram.authKey;


  return telethon.save();
}