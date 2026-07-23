import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

const BASE_URL = process.env.BACKEND_API_BASE_URL;

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ conversationId: string }> }) {
  const { conversationId } = await params;
  const { getToken } = await auth();
  const token = await getToken();

  const response = await fetch(`${BASE_URL}/api/conversations/${conversationId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  return new NextResponse(null, { status: response.status });
}
