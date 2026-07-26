import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

const BASE_URL = process.env.BACKEND_API_BASE_URL;

export async function POST(req: NextRequest) {
  const { getToken } = await auth();
  const token = await getToken();
  const body = await req.text();

  const response = await fetch(`${BASE_URL}/api/telegram-qr-login/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body,
  });

  const responseBody = await response.text();
  return new NextResponse(responseBody, {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  });
}
