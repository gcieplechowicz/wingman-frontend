import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

const BASE_URL = process.env.BACKEND_API_BASE_URL;

export async function PUT(req: NextRequest, { params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  const { getToken } = await auth();
  const token = await getToken();
  const body = await req.text();

  const response = await fetch(`${BASE_URL}/api/tenants/${tenantId}`, {
    method: "PUT",
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
