"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
type Step =
  | "idle"
  | "starting"
  | "waiting"
  | "done"
  | "error";


type QRData = {
  qrUrl: string;
  token: string;
  transportSession: string;
  apiId: string;
  apiHash: string;
};


export function TelegramLoginWizard({
  apiId,
  apiHash,
  onSessionReady,
}: {
  apiId: string;
  apiHash: string;
  onSessionReady: (sessionString: string) => void;
}) {


  const [step, setStep] = useState<Step>("idle");

  const [qrData, setQrData] = useState<QRData | null>(null);

  const [error, setError] = useState<string | null>(null);



  const ready = Boolean(
    apiId.trim() &&
    apiHash.trim()
  );



  async function startQrLogin() {

    setStep("starting");
    setError(null);


    try {

      const res = await fetch(
        "/api/telegram-auth/qr-start",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            apiId,
            apiHash,
          }),
        }
      );


      const data = await res.json();


      if (!res.ok) {
        throw new Error(
          data.error ?? "Failed to start QR login"
        );
      }


      setQrData(data);

      setStep("waiting");


    } catch(err) {

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong"
      );

      setStep("error");
    }

  }



  useEffect(() => {


    if (
      step !== "waiting" ||
      !qrData
    ) {
      return;
    }


    const interval = setInterval(
      async () => {


        try {


          const res = await fetch(
            "/api/telegram-auth/qr-status",
            {
              method:"POST",
              headers:{
                "Content-Type":"application/json",
              },
              body:JSON.stringify({

                apiId: qrData.apiId,

                apiHash: qrData.apiHash,

                token: qrData.token,

                transportSession:
                  qrData.transportSession,

              }),
            }
          );



          const data = await res.json();



          if (!res.ok) {

            throw new Error(
              data.error ??
              "QR verification failed"
            );

          }



          if (
            data.status === "AUTHORIZED"
          ) {


            clearInterval(interval);


            onSessionReady(
              data.sessionString
            );


            setStep("done");

          }



        } catch(err) {


          clearInterval(interval);


          setError(
            err instanceof Error
              ? err.message
              : "QR verification failed"
          );


          setStep("error");

        }


      },
      3000
    );



    return () => {
      clearInterval(interval);
    };


  }, [
    step,
    qrData,
    onSessionReady
  ]);





  if(step==="done") {

    return (

      <div className="
        flex items-center gap-2
        text-sm text-online
        bg-online/10
        border border-online/30
        rounded-xl px-4 py-2.5
      ">

        ✓ Telegram account connected

      </div>

    );

  }





  return (

    <div className="
      border border-border
      rounded-xl p-4
      space-y-4
      bg-surface
    ">


      <p className="text-sm font-medium">
        Connect Telegram account
      </p>




      {(step==="idle" || step==="error") && (

        <button

          type="button"

          disabled={!ready}

          onClick={startQrLogin}

          className="
            text-xs font-medium
            bg-spark text-white
            px-4 py-2
            rounded-full
            disabled:opacity-50
          "

        >
          Connect with Telegram QR

        </button>

      )}






      {step==="starting" && (

        <p className="text-sm">
          Generating QR...
        </p>

      )}






      {step==="waiting" && qrData && (

        <div className="space-y-3">


          <p className="text-xs text-text-muted">

            Telegram →
            Settings →
            Devices →
            Link Desktop Device

          </p>



          <QRCodeSVG

            value={qrData.qrUrl}

            size={220}

          />



          <p className="text-xs text-text-muted">

            Waiting for scan...

          </p>


        </div>

      )}






      {error && (

        <p className="text-xs text-spark">

          {error}

        </p>

      )}



    </div>

  );

}