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

    const rawToken = process.env.APOLLO_API_TOKEN;
    if (!rawToken) {
      return NextResponse.json({ error: "APOLLO_API_TOKEN not configured" }, { status: 500 });
    }
    const token = rawToken.startsWith("Bearer ") ? rawToken : `Bearer ${rawToken}`;

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
      let body: any = null;
      try { body = await res.json(); } catch { body = await res.text().catch(() => ""); }
      return NextResponse.json(
        { error: "upstream_error", status: res.status, statusText: res.statusText, body },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "unexpected error" }, { status: 500 });
  }
}


