import Anthropic from "@anthropic-ai/sdk"
import { fetchArticle } from "@/lib/fetchArticle"

const USE_MOCK = false

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function POST(request) {
  try {
    const body = await request.json()
    const { url } = body

    if (!url) {
      return Response.json(
        { error: "No URL provided" },
        { status: 400 }
      )
    }

    if (USE_MOCK) {
      return Response.json(getMockResponse())
    }

    // fetch the article text first
    const articleText = await fetchArticle(url)

    if (!articleText) {
      return Response.json(
        { error: "Could not fetch article content" },
        { status: 400 }
      )
    }

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: buildPrompt(articleText)
        }
      ]
    })

    const text = response.content[0].text
    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim()

    const parsed = JSON.parse(cleaned)
    return Response.json(parsed)

  } catch (error) {
    console.error("API route error:", error)
    return Response.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

function buildPrompt(articleText) {
  return `You are a financial analyst assistant. You must respond with ONLY a valid JSON object, no other text, no markdown, no explanation before or after.

Analyse this financial article text:

${articleText}

Return ONLY this JSON structure:
{
  "summary": "2-3 sentence summary of the article",
  "insights": ["insight 1", "insight 2", "insight 3"],
  "talking_points": ["talking point 1", "talking point 2"],
  "trend": "one short trend signal phrase"
}`
}

function getMockResponse() {
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