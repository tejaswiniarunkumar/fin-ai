export async function POST(request) {
  try {
    const body = await request.json()
    const { tickers } = body

    if (!tickers || tickers.length === 0) {
      return Response.json(
        { error: "No tickers provided" },
        { status: 400 }
      )
    }

    // call FastAPI Python service
    const response = await fetch("http://127.0.0.1:8000/market", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tickers })
    })

    const data = await response.json()
    return Response.json(data)

  } catch (error) {
    console.error("Market route error:", error)
    return Response.json(
      { error: "Could not fetch market data" },
      { status: 500 }
    )
  }
}