"use server";

// 서버 액션: Apollo 상품 상세 조회
// Authorization 토큰은 서버 환경변수 APOLLO_API_TOKEN 에서 읽습니다.
export async function getApolloProductDetail(productCode: string) {
  if (!productCode) {
    throw new Error("productCode가 필요합니다.");
  }

  // (선택) 운영 화이트리스트: 환경변수에 등록된 코드만 허용
  const allowRaw = process.env.ALLOWED_PRODUCT_CODES ?? "";
  const allow = allowRaw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  if (allow.length > 0 && !allow.includes(productCode)) {
    throw new Error("상품을 찾을 수 없습니다.");
  }

  const rawToken = process.env.APOLLO_API_TOKEN;
  if (!rawToken) {
    throw new Error("서버 환경변수 APOLLO_API_TOKEN 이 설정되지 않았습니다.");
  }
  const auth = rawToken.startsWith("Bearer ") ? rawToken : `Bearer ${rawToken}`;

  const endpoint = `https://dev-apollo-api.tidesquare.com/tna-api-v2/apollo/product/detail/${productCode}`;

  const retryable = (s: number) => [502, 503, 504].includes(s);
  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
  const timeoutMs = Number(process.env.APOLLO_TIMEOUT_MS ?? "5000");

  for (let attempt = 1; attempt <= 3; attempt++) {
    const ac = new AbortController();
    const to = setTimeout(() => ac.abort(), timeoutMs);
    try {
      const res = await fetch(endpoint, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: auth,
          "User-Agent": "esim-5/server",
        },
        cache: "no-store",
        next: { revalidate: 0 },
        signal: ac.signal,
      });
      clearTimeout(to);

      if (res.ok) {
        return res.json();
      }

      const status = res.status;
      if (!retryable(status) || attempt === 3) {
        throw new Error(`상품 상세 조회 실패: ${status} ${res.statusText || "upstream error"}`);
      }
      await delay(200 * attempt);
    } catch (e: any) {
      clearTimeout(to);
      if (attempt === 3) {
        throw new Error(e?.message ?? "network error");
      }
      await delay(200 * attempt);
    }
  }

  throw new Error("unreachable");
}

// 서버 액션: 마케팅 시트에서 Hero 이미지 조회
export async function fetchHeroImages() {
  const endpoint =
    "https://tourvis.com/api/marketing-sheet/1fPCV1XVd3sAV14hK1AJLJtm-tEP_BOtzFBsvhwWnKUc/values/Hero Images!A2:C7";

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("서버 환경변수 API_KEY 가 설정되지 않았습니다.");
  }

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(
      `Hero 이미지 조회 실패: ${response.status} ${response.statusText} ${errorText}`.trim()
    );
  }

  const data = await response.json();
  const rows: any[] = (data?.data as any[]) || (data?.values as any[]) || [];

  const pcImages = rows
    .filter((row) => row?.[1] === "pc")
    .map((row, index: number) => ({ id: index + 1, image_url: row?.[0] ?? "" }));

  const mobileImages = rows
    .filter((row) => row?.[1] === "mobile")
    .map((row, index: number) => ({ id: index + 1, image_url: row?.[0] ?? "" }));

  return { pcImages, mobileImages } as {
    pcImages: { id: number; image_url: string }[];
    mobileImages: { id: number; image_url: string }[];
  };
}
