"use client"

import { useState } from "react"

export default function HomePage() {
  const [url, setUrl] = useState("")
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleAnalyse() {
    setLoading(true)
    setError(null)
    setResult(null)

    // mock response for now — no API cost
    setTimeout(() => {
      setResult({
        summary: "The Federal Reserve held interest rates steady amid cooling inflation signals.",
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
      })
      setLoading(false)
    }, 1500)
  }

  return (
    <main className="max-w-2xl mx-auto p-8">

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-2">fin-ai</h1>
        <p className="text-gray-500">
          Paste a financial article URL to get AI-powered insights
        </p>
      </div>

      {/* Input */}
      <div className="flex gap-2 mb-8">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://ft.com/article..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />
        <button
          onClick={handleAnalyse}
          disabled={!url || loading}
          className="bg-black text-white px-6 py-2 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-800"
        >
          {loading ? "Analysing..." : "Analyse"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm mb-6">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="border border-gray-200 rounded-xl p-6 space-y-6">

          {/* Summary */}
          <div>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Summary
            </h2>
            <p className="text-gray-800 text-sm">{result.summary}</p>
          </div>

          {/* Trend */}
          <div>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Trend Signal
            </h2>
            <span className="bg-black text-white text-xs px-3 py-1 rounded-full">
              {result.trend}
            </span>
          </div>

          {/* Insights */}
          <div>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Actionable Insights
            </h2>
            <ul className="space-y-2">
              {result.insights.map((insight, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-700">
                  <span className="text-black font-bold">→</span>
                  {insight}
                </li>
              ))}
            </ul>
          </div>

          {/* Talking Points */}
          <div>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Interview Talking Points
            </h2>
            <ul className="space-y-2">
              {result.talking_points.map((point, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-700">
                  <span className="text-black font-bold">•</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>

        </div>
      )}
    </main>
  )
}