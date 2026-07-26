import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

const BASE_URL = process.env.BACKEND_API_BASE_URL;

export async function POST(req: NextRequest, { params }: { params: Promise<{ loginId: string }> }) {
  const { loginId } = await params;
  const { getToken } = await auth();
  const token = await getToken();

  const response = await fetch(`${BASE_URL}/api/telegram-qr-login/${loginId}/poll`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });

  const responseBody = await response.text();
  return new NextResponse(responseBody, {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  });
}
