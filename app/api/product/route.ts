import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = params;
    if (!code) {
      return NextResponse.json({ error: "product code required" }, { status: 400 });
    }

    const token = process.env.APOLLO_API_TOKEN;
    if (!token) {
      return NextResponse.json({ error: "APOLLO_API_TOKEN not configured" }, { status: 500 });
    }

    const endpoint = `https://dev-apollo-api.tidesquare.com/tna-api-v2/apollo/product/detail/${code}`;
    const res = await fetch(endpoint, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: token,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json(
        { error: `upstream error ${res.status} ${res.statusText}`, detail: text },
        { status: 502 }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "unexpected error" }, { status: 500 });
  }
}


