import Anthropic from "@anthropic-ai/sdk"

// USE_MOCK = true means no API calls, no cost
// flip to false when you're ready to test real Claude
const USE_MOCK = true

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function POST(request) {
  try {
    // Step 1 — get the URL the user typed from the request
    const body = await request.json()
    const { url } = body

    // Step 2 — validate it
    if (!url) {
      return Response.json(
        { error: "No URL provided" },
        { status: 400 }
      )
    }

    // Step 3 — return mock or real response
    if (USE_MOCK) {
      return Response.json(getMockResponse(url))
    }

    // Step 4 — real Claude call (only runs when USE_MOCK = false)
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: buildPrompt(url)
        }
      ]
    })

    const text = response.content[0].text
    const parsed = JSON.parse(text)
    return Response.json(parsed)

  } catch (error) {
    console.error("API route error:", error)
    return Response.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

// the prompt we send to Claude
function buildPrompt(url) {
  return `You are a financial analyst assistant helping someone prepare for job interviews.
  
Analyse this financial article URL: ${url}

Return ONLY a JSON object with exactly this structure, no other text:
{
  "summary": "2-3 sentence summary of the article",
  "insights": ["insight 1", "insight 2", "insight 3"],
  "talking_points": ["talking point 1", "talking point 2"],
  "trend": "one short trend signal phrase"
}`
}

// mock response for UI development
function getMockResponse(url) {
  return {
    summary: "The Federal Reserve held interest rates steady amid cooling inflation signals, signalling a potential pivot in monetary policy approaching.",
    insights: [
      "Rate pause signals potential cuts in Q3 2026",
      "Bond markets rallying in response to dovish tone",
      "Emerging markets may benefit from weaker dollar outlook"
    ],
    talking_points: [
      "Monetary policy is shifting from restrictive to neutral",
      "Investors should watch PCE inflation data closely"
    ],
    trend: "Dovish pivot building momentum"
  }
}