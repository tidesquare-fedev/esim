"use server";

// 서버 액션: Apollo 상품 상세 조회
// Authorization 토큰은 서버 환경변수 APOLLO_API_TOKEN 에서 읽습니다.
export async function getApolloProductDetail(productCode: string) {
  if (!productCode) {
    throw new Error("productCode가 필요합니다.");
  }

  const endpoint = `https://dev-apollo-api.tidesquare.com/tna-api-v2/apollo/product/detail/${productCode}`;
  const authorizationToken = process.env.APOLLO_API_TOKEN;

  if (!authorizationToken) {
    throw new Error("서버 환경변수 APOLLO_API_TOKEN 이 설정되지 않았습니다.");
  }

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: authorizationToken,
    },
    cache: "no-store",
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(
      `상품 상세 조회 실패: ${response.status} ${response.statusText} ${errorText}`.trim()
    );
  }

  return response.json();
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


