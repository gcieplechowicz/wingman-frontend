import { StringSession } from "telegram/sessions";
import { AuthKey } from "telegram/crypto/AuthKey";


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
      "Missing GramJS auth key after load"
    );
  }


  const authKey =
    gram.authKey.getKey();


  const telethon =
    new StringSession("");


  telethon.setDC(
    gram.dcId!,
    gram.serverAddress!,
    gram.port!
  );


  (telethon as any).authKey =
    new AuthKey();

  (telethon as any).authKey.setKey(
    authKey
  );


  return telethon.save();

}