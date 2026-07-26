try {

  console.log("STEP 1 - before connect");

  await client.connect();

  console.log("STEP 2 - connected");


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
    "STEP 3 - import token result",
    result.className
  );


  if (
    result instanceof Api.auth.LoginTokenSuccess
  ) {

    console.log("STEP 4 - login success");


    const gramJsSession =
      client.session.save();


    console.log(
      "GRAM SESSION:",
      gramJsSession
    );


    const telethonSession =
      await convertTelegramSession(
        gramJsSession
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


  console.log(
    "NOT AUTHORIZED RESULT",
    result.className
  );
