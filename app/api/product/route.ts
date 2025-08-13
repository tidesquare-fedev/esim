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

    // mock=1 쿼리로 모킹 응답 제공 (502 등으로 테스트가 막힐 때 임시 확인용)
    const url = new URL(_req.url);
    const useMock = url.searchParams.get("mock") === "1";
    if (useMock) {
      const mock = {
        code,
        provider_code: "MOCK",
        outer_id: "MOCK-OUTER",
        name: "베트남 eSIM (MOCK)",
        sort_order: 0,
        calendar_type: "DATE",
        price_scope: "LABEL",
        inventory_scope: "NONE",
        working_date_type: "PROVIDER",
        min_book_days: 0,
        booking_type: "CONFIRM",
        latitude: "",
        longitude: "",
        per_min: 0,
        per_max: 0,
        draft_rev: 0,
        product_rev: 0,
        delivery_type: "AUTO",
        refund_type: "UNAVAILABLE",
        cancel_type: "CONFIRM",
        cancel_time: "PROVIDER",
        ars: "",
        review_status: "NONE",
        soldout: false,
        sys_close: false,
        sys_close_reason: "",
        outer_auto_registered: false,
        expose: true,
        active_channel_count: 1,
        options: [
          {
            code: "OP1",
            outer_id: "",
            sort_order: 0,
            title: "매일 1GB",
            description: "일사용량형",
            per_min: 0,
            per_max: 0,
            resell_is: true,
            labels: [
              { code: "L3", outer_id: "", title: "3일", sort_order: 0, net_price_currency: 3300, required: true, per_min: 0, per_max: 0 },
              { code: "L5", outer_id: "", title: "5일", sort_order: 1, net_price_currency: 5500, required: true, per_min: 0, per_max: 0 },
              { code: "L7", outer_id: "", title: "7일", sort_order: 2, net_price_currency: 7700, required: true, per_min: 0, per_max: 0 },
            ],
            channel_labels: [
              {
                channel_id: 1,
                channel_name: "Default",
                labels: [
                  { code: "CL3", title: "3일", sort_order: 0, net_price_currency: 3300, markup_amount_currency: 0, repr_price_currency: 3300, required: true, default_is: true },
                  { code: "CL5", title: "5일", sort_order: 1, net_price_currency: 5500, markup_amount_currency: 0, repr_price_currency: 5500, required: true, default_is: false },
                  { code: "CL7", title: "7일", sort_order: 2, net_price_currency: 7700, markup_amount_currency: 0, repr_price_currency: 7700, required: true, default_is: false },
                ],
              },
            ],
            timeslots: [],
            extra_info: { title: "시간표", description: "10:00 시작 \n 18:00 종료" },
          },
        ],
        use_date_soldout: true,
        last_use_date: "",
        last_use_date_updated_at: new Date().toISOString(),
        channel_product_default_markups: [],
        notification_collect_sale: true,
        notification_collect_stock: true,
        currency: "KRW",
        naver_trip_updated_at: new Date().toISOString(),
      };
      return NextResponse.json(mock);
    }

    const rawToken = process.env.APOLLO_API_TOKEN;
    if (!rawToken) {
      return NextResponse.json({ error: "APOLLO_API_TOKEN not configured" }, { status: 500 });
    }
    const token = rawToken.startsWith("Bearer ") ? rawToken : `Bearer ${rawToken}`;

    const endpoint = `https://dev-apollo-api.tidesquare.com/tna-api-v2/apollo/product/detail/${code}`;

    const retryable = (status: number) => [502, 503, 504].includes(status);
    const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

    const maxAttempts = 3;
    let lastError: any = null;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const res = await fetch(endpoint, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: token,
            "User-Agent": "esim-5/1.0 (+next.js)",
          },
          cache: "no-store",
        });

        if (res.ok) {
          const data = await res.json();
          return NextResponse.json(data);
        }

        // 비정상 응답 처리
        const status = res.status;
        let body: any = null;
        try { body = await res.json(); } catch { body = await res.text().catch(() => ""); }
        if (!retryable(status) || attempt === maxAttempts) {
          return NextResponse.json(
            { error: "upstream_error", status, statusText: res.statusText, body, endpoint },
            { status }
          );
        }
        // 재시도 대기 (지수 백오프)
        await delay(200 * attempt);
      } catch (e: any) {
        lastError = e;
        if (attempt === maxAttempts) {
          return NextResponse.json({ error: e?.message ?? "network error", endpoint }, { status: 502 });
        }
        await delay(200 * attempt);
      }
    }

    // 논리적으로 여기 도달하지 않음
    return NextResponse.json({ error: "unreachable" }, { status: 500 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "unexpected error" }, { status: 500 });
  }
}


