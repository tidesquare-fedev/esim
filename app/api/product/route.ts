import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

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

    // 0) 간단한 보안/유효성 강화
    // - 허용된 코드 패턴만 통과 (문자열 템플릿 그대로 들어오는 케이스 차단: "${code}")
		const codePattern = /^[A-Z0-9_-]+$/;
    if (!codePattern.test(code)) {
      return NextResponse.json({ error: "invalid product code" }, { status: 400 });
    }

		// - 허용 코드 화이트리스트 (환경변수 설정 시에만 적용)
		const allowedListRaw = process.env.ALLOWED_PRODUCT_CODES ?? "";
		const allowedCodes = allowedListRaw
			.split(",")
			.map((s) => s.trim())
			.filter((s) => s.length > 0);
		if (allowedCodes.length > 0 && !allowedCodes.includes(code)) {
			return NextResponse.json({ error: "not found" }, { status: 404 });
		}

    // - 크롤러/미리보기 봇 차단 (Slack/FB/Twitter 등)
    const ua = _req.headers.get("user-agent") || "";
    const isPreviewBot = /Slackbot|Slackbot-LinkExpanding|facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp|SkypeUriPreview/i.test(ua);
    if (isPreviewBot) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

		// - 내부 토큰 인증 (환경변수 설정 시 강제)
		const expectedInternalToken = process.env.APOLLO_PROXY_TOKEN;
		if (expectedInternalToken) {
			const got = _req.headers.get("x-internal-token");
			if (!got || got !== expectedInternalToken) {
				return NextResponse.json({ error: "forbidden" }, { status: 403 });
			}
		}

		// - HMAC 서명 검증 (환경변수 설정 시 강제)
		const hmacSecret = process.env.APOLLO_PROXY_HMAC_SECRET;
		if (hmacSecret) {
			const u = new URL(_req.url);
			const ts = u.searchParams.get("ts");
			const sig = u.searchParams.get("sig");
			if (!ts || !sig) {
				return NextResponse.json({ error: "forbidden" }, { status: 403 });
			}
			if (!/^[0-9]+$/.test(ts)) {
				return NextResponse.json({ error: "forbidden" }, { status: 403 });
			}
			const now = Date.now();
			if (Math.abs(now - Number(ts)) > 60_000) {
				return NextResponse.json({ error: "expired" }, { status: 403 });
			}
			const base = `${u.pathname}?ts=${ts}`;
			const digest = createHmac("sha256", hmacSecret).update(base).digest("hex");
			try {
				const ok = timingSafeEqual(Buffer.from(digest), Buffer.from(sig));
				if (!ok) return NextResponse.json({ error: "forbidden" }, { status: 403 });
			} catch {
				return NextResponse.json({ error: "forbidden" }, { status: 403 });
			}
		}

    // mock=1 쿼리로 모킹 응답 제공 (502 등으로 테스트가 막힐 때 임시 확인용)
    const url = new URL(_req.url);
		const useMock = url.searchParams.get("mock") === "1";
    const isProd = process.env.NODE_ENV === "production";
    const mockEnabled = !isProd || process.env.ENABLE_PRODUCT_MOCK === "1";
    if (useMock && mockEnabled) {
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
    // 프로덕션에서 mock 요청이 들어오면 차단
    if (useMock && !mockEnabled) {
      return NextResponse.json({ error: "mock disabled" }, { status: 404 });
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
				// 요청 타임아웃 적용
				const controller = new AbortController();
				const timeoutMs = Number(process.env.APOLLO_TIMEOUT_MS ?? "5000");
				const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        const res = await fetch(endpoint, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: token,
            "User-Agent": "esim-5/1.0 (+next.js)",
          },
					cache: "no-store",
					signal: controller.signal,
        });
				clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          return NextResponse.json(data);
        }

        // 비정상 응답 처리 (민감 정보는 응답에 포함하지 않음)
        const status = res.status;
        // 상세 body나 외부 endpoint를 그대로 노출하지 않음
        let bodySummary: any = null;
        try {
          const raw = await res.json();
          // 가능한 필드만 요약
          bodySummary = typeof raw === "object" && raw ? { message: raw.message ?? "upstream error" } : null;
        } catch {
          bodySummary = null;
        }
        if (!retryable(status) || attempt === maxAttempts) {
          return NextResponse.json(
            { error: "upstream_error", status, statusText: res.statusText, upstream: "apollo", details: bodySummary },
            { status }
          );
        }
        // 재시도 대기 (지수 백오프)
        await delay(200 * attempt);
      } catch (e: any) {
        lastError = e;
        if (attempt === maxAttempts) {
          return NextResponse.json({ error: e?.message ?? "network error", upstream: "apollo" }, { status: 502 });
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


