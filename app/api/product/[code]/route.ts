import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(_req: Request, { params }: { params: { code: string } }) {
  try {
    const { code } = params
    if (!code) {
      return NextResponse.json({ error: "product code required" }, { status: 400 })
    }

    const rawToken = process.env.APOLLO_API_TOKEN

    // Mock 지원: /api/product/PRDxxxx?mock=1
    const url = new URL(_req.url)
    const useMock = url.searchParams.get("mock") === "1"
    if (useMock) {
      const mockData = {
        code,
        name: "MOCK eSIM",
        provider_code: "MOCK",
        options: [
          {
            code: "OP1",
            title: "매일 1GB",
            channel_labels: [
              { channel_id: 1, labels: [
                { code: "L3", title: "3일", repr_price_currency: 3300 },
                { code: "L5", title: "5일", repr_price_currency: 5500 },
                { code: "L7", title: "7일", repr_price_currency: 7700 },
              ]}
            ],
          },
        ],
      }
      return NextResponse.json(mockData)
    }

    if (!rawToken) {
      return NextResponse.json(
        { error: "APOLLO_API_TOKEN not configured" },
        { status: 500 },
      )
    }

    const token = rawToken.startsWith("Bearer ") ? rawToken : `Bearer ${rawToken}`
    const endpoint = `https://apollo-api.tidesquare.com/tna-api-v2/apollo/product/detail/${code}`

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

      if (!response.ok) {
        const errorText = await response.text()
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
        return NextResponse.json(
          { error: "Invalid response format", contentType, preview: text.substring(0, 200) },
          { status: 502 },
        )
      }

      const data = await response.json()
      return NextResponse.json(data)
    } catch (fetchError: any) {
      return NextResponse.json(
        { error: "Network error", message: fetchError.message, type: fetchError.name },
        { status: 502 },
      )
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 },
    )
  }
}


