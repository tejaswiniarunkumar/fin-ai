import Anthropic from "@anthropic-ai/sdk"
import { fetchArticle } from "@/lib/fetchArticle"

const USE_MOCK = true

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

    const articleText = await fetchArticle(url)

    if (!articleText) {
      return Response.json(
        { error: "Could not fetch article content" },
        { status: 400 }
      )
    }

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2000,
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
  return `You are a senior financial analyst. You must respond with ONLY a valid JSON object, no other text, no markdown, no explanation before or after.

Analyse this financial article and assess its market impact:

${articleText}

Return ONLY this JSON structure:
{
  "summary": "2-3 sentence summary of the article",
  "market_signal": "Bullish or Bearish or Neutral",
  "risk_level": "High or Medium or Low",
  "risk_reason": "one sentence explaining the risk level",
  "affected_sectors": ["sector 1", "sector 2", "sector 3"],
  "affected_stocks": [
    { "ticker": "AAPL", "name": "Apple", "impact": "positive or negative or neutral", "reason": "one sentence" },
    { "ticker": "JPM", "name": "JPMorgan", "impact": "positive or negative or neutral", "reason": "one sentence" }
  ],
  "affected_indices": [
    { "name": "S&P 500", "impact": "positive or negative or neutral", "reason": "one sentence" }
  ],
  "affected_commodities": [
    { "name": "Gold", "impact": "positive or negative or neutral", "reason": "one sentence" }
  ],
  "historical_examples": [
    { "year": "2018", "event": "similar event description", "outcome": "what happened to markets" }
  ],
  "insights": ["insight 1", "insight 2", "insight 3"],
  "talking_points": ["talking point 1", "talking point 2"]
}`
}

function getMockResponse() {
  return {
    summary: "The Federal Reserve held interest rates steady amid cooling inflation signals, signalling a potential pivot in monetary policy approaching.",
    market_signal: "Bullish",
    risk_level: "Medium",
    risk_reason: "Rate pause reduces borrowing cost pressure but uncertainty around timing of cuts remains.",
    affected_sectors: ["Banking", "Real Estate", "Technology"],
    affected_stocks: [
      { ticker: "JPM", name: "JPMorgan Chase", impact: "positive", reason: "Lower rates improve lending margins and loan demand." },
      { ticker: "BLK", name: "BlackRock", impact: "positive", reason: "Bond rally benefits asset managers with fixed income exposure." },
      { ticker: "TSLA", name: "Tesla", impact: "positive", reason: "Growth stocks benefit from lower discount rates." }
    ],
    affected_indices: [
      { name: "S&P 500", impact: "positive", reason: "Broad market rallies on dovish Fed signals." },
      { name: "FTSE 100", impact: "neutral", reason: "Limited direct exposure to Fed policy." }
    ],
    affected_commodities: [
      { name: "Gold", impact: "positive", reason: "Lower rates reduce opportunity cost of holding gold." },
      { name: "Oil", impact: "neutral", reason: "Rate decisions have limited direct impact on oil supply/demand." }
    ],
    historical_examples: [
      { year: "2019", event: "Fed paused rate hikes amid trade war uncertainty", outcome: "S&P 500 rallied 28% over the following 12 months." },
      { year: "2015", event: "Fed delayed rate hike cycle citing global risks", outcome: "Markets volatile short term but recovered within 6 months." }
    ],
    insights: [
      "Rate pause signals potential cuts in Q3 2026",
      "Bond markets rallying in response to dovish tone",
      "Emerging markets may benefit from weaker dollar outlook"
    ],
    talking_points: [
      "Monetary policy is shifting from restrictive to neutral",
      "Investors should watch PCE inflation data closely"
    ]
  }
}