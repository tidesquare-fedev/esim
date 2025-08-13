import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(_req: Request, { params }: { params: { code: string } }) {
  try {
    const { code } = params
    console.log("=== API Route Called ===")
    console.log("Code:", code)

    if (!code) {
      return NextResponse.json({ error: "product code required" }, { status: 400 })
    }

    // 환경변수 확인
    const rawToken = process.env.APOLLO_API_TOKEN
    console.log("Environment variables:")
    console.log("- NODE_ENV:", process.env.NODE_ENV)
    console.log("- APOLLO_API_TOKEN exists:", !!rawToken)
    console.log("- APOLLO_API_TOKEN length:", rawToken?.length || 0)

    // Mock 요청 확인
    const url = new URL(_req.url)
    const useMock = url.searchParams.get("mock") === "1"
    console.log("Mock request:", useMock)

    if (useMock) {
      console.log("Returning mock data...")
      const mockData = {
        code,
        name: "베트남 eSIM (MOCK)",
        provider_code: "MOCK",
        options: [
          {
            code: "OP1",
            title: "매일 1GB",
            channel_labels: [
              {
                channel_id: 1,
                labels: [
                  { code: "L3", title: "3일", repr_price_currency: 3300 },
                  { code: "L5", title: "5일", repr_price_currency: 5500 },
                  { code: "L7", title: "7일", repr_price_currency: 7700 },
                ],
              },
            ],
          },
        ],
      }
      return NextResponse.json(mockData)
    }

    // 실제 API 호출
    if (!rawToken) {
      console.log("ERROR: No Apollo token")
      return NextResponse.json(
        {
          error: "APOLLO_API_TOKEN not configured",
          debug: { hasToken: false },
        },
        { status: 500 },
      )
    }

    const token = rawToken.startsWith("Bearer ") ? rawToken : `Bearer ${rawToken}`
    const endpoint = `https://apollo-api.tidesquare.com/tna-api-v2/apollo/product/detail/${code}`

    console.log("Making request to Apollo API...")
    console.log("Endpoint:", endpoint)
    console.log("Token preview:", token.substring(0, 30) + "...")

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: token,
          "User-Agent": "esim-service/1.0",
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      console.log("Apollo API Response:")
      console.log("- Status:", response.status)
      console.log("- Status Text:", response.statusText)
      console.log("- Content-Type:", response.headers.get("content-type"))

      if (!response.ok) {
        const errorText = await response.text()
        console.log("Error response body:", errorText.substring(0, 500))

        return NextResponse.json(
          {
            error: "Apollo API error",
            status: response.status,
            statusText: response.statusText,
            details: errorText.substring(0, 200),
          },
          { status: response.status },
        )
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text()
        console.log("Non-JSON response:", text.substring(0, 500))

        return NextResponse.json(
          {
            error: "Invalid response format",
            contentType,
            preview: text.substring(0, 200),
          },
          { status: 502 },
        )
      }

      const data = await response.json()
      console.log("Successfully received JSON data")
      return NextResponse.json(data)
    } catch (fetchError: any) {
      console.log("Fetch error:", fetchError.message)

      return NextResponse.json(
        {
          error: "Network error",
          message: fetchError.message,
          type: fetchError.name,
        },
        { status: 502 },
      )
    }
  } catch (error: any) {
    console.log("=== Unexpected Error ===")
    console.log("Error:", error.message)
    console.log("Stack:", error.stack?.split("\n").slice(0, 5))

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message,
        debug: {
          code: params?.code,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 },
    )
  }
}
