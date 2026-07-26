import { NextRequest, NextResponse } from "next/server";


import { pending } from "../qr-start/route";


export async function POST(
  req: NextRequest
) {

  const {
    flowId
  } = await req.json();


  const item =
    pending.get(flowId);



  if (!item) {

    return NextResponse.json(
      {
        error: "QR expired"
      },
      {
        status:400
      }
    );
  }



  const {
    client
  } = item;



  const authorized =
    await client.isUserAuthorized();



  if (!authorized) {

    return NextResponse.json({
      status:"WAITING"
    });

  }



  const me =
    await client.getMe();



  const sessionString =
    client.session.save();



  await client.disconnect();


  pending.delete(flowId);



  return NextResponse.json({

    status:"AUTHORIZED",

    sessionString,

    user:{
      id:me.id,
      username:me.username,
      firstName:me.firstName
    }

  });

}