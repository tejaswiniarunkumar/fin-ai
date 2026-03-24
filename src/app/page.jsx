"use client"

import { useState } from "react"

export default function HomePage() {
  const [url, setUrl] = useState("")
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [marketData, setMarketData] = useState({})
  const [marketLoading, setMarketLoading] = useState(false)

  async function handleAnalyse() {
    setLoading(true)
    setError(null)
    setResult(null)
    setMarketData({})

    try {
      const response = await fetch("/api/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Something went wrong")
        return
      }

      setResult(data)

      // fetch live prices for stocks Claude identified
      if (data.affected_stocks && data.affected_stocks.length > 0) {
        fetchMarketData(data.affected_stocks.map(s => s.ticker))
      }

    } catch (err) {
      setError("Failed to connect to the server")
    } finally {
      setLoading(false)
    }
  }

  async function fetchMarketData(tickers) {
    setMarketLoading(true)
    try {
      const response = await fetch("/api/market", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tickers })
      })

      const data = await response.json()

      // convert array to map keyed by ticker for easy lookup
      // { "JPM": { price: 289.91 ... }, "GS": { price: 831.27 ... } }
      const mapped = {}
      data.market_data.forEach(stock => {
        mapped[stock.ticker] = stock
      })
      setMarketData(mapped)

    } catch (err) {
      console.error("Market data fetch failed:", err)
    } finally {
      setMarketLoading(false)
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-8">

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-2">fin-ai</h1>
        <p className="text-gray-500">
          Paste a financial article URL to analyse its market impact
        </p>
      </div>

      {/* Input */}
      <div className="flex gap-2 mb-8">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://reuters.com/article..."
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
        <div className="space-y-6">

          {/* Summary + Signal + Risk */}
          <div className="border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                result.market_signal === "Bullish"
                  ? "bg-green-100 text-green-700"
                  : result.market_signal === "Bearish"
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-700"
              }`}>
                {result.market_signal}
              </span>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                result.risk_level === "High"
                  ? "bg-red-100 text-red-700"
                  : result.risk_level === "Medium"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-green-100 text-green-700"
              }`}>
                {result.risk_level} Risk
              </span>
            </div>
            <p className="text-gray-800 text-sm mb-2">{result.summary}</p>
            <p className="text-gray-500 text-xs">{result.risk_reason}</p>
          </div>

          {/* Affected Stocks with live prices */}
          <div className="border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Affected Stocks
              </h2>
              {marketLoading && (
                <span className="text-xs text-gray-400">fetching live prices...</span>
              )}
            </div>
            <div className="space-y-4">
              {result.affected_stocks.map((stock, i) => {
                const live = marketData[stock.ticker]
                return (
                  <div key={i} className="flex items-start justify-between gap-3">

                    {/* Left — ticker + name + reason */}
                    <div className="flex items-start gap-3">
                      <span className="bg-black text-white text-xs px-2 py-1 rounded font-mono mt-0.5">
                        {stock.ticker}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{stock.name}</span>
                          <span className={`text-xs ${
                            stock.impact === "positive"
                              ? "text-green-600"
                              : stock.impact === "negative"
                              ? "text-red-600"
                              : "text-gray-500"
                          }`}>
                            {stock.impact === "positive" ? "↑" : stock.impact === "negative" ? "↓" : "→"} {stock.impact}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">{stock.reason}</p>
                      </div>
                    </div>

                    {/* Right — live price */}
                    {live && live.price && (
                      <div className="text-right shrink-0">
                        <div className="text-sm font-semibold">
                          {live.currency === "USD" ? "$" : "£"}{live.price}
                        </div>
                        <div className={`text-xs font-medium ${
                          live.change_pct > 0
                            ? "text-green-600"
                            : live.change_pct < 0
                            ? "text-red-600"
                            : "text-gray-500"
                        }`}>
                          {live.change_pct > 0 ? "+" : ""}{live.change_pct}% today
                        </div>
                      </div>
                    )}

                  </div>
                )
              })}
            </div>
          </div>

          {/* Sectors + Indices + Commodities */}
          <div className="grid grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-xl p-4">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Sectors
              </h2>
              <div className="space-y-1">
                {result.affected_sectors.map((sector, i) => (
                  <span key={i} className="block text-sm text-gray-700">• {sector}</span>
                ))}
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl p-4">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Indices
              </h2>
              <div className="space-y-2">
                {result.affected_indices.map((index, i) => (
                  <div key={i}>
                    <span className="text-sm font-medium">{index.name}</span>
                    <span className={`ml-2 text-xs ${
                      index.impact === "positive" ? "text-green-600"
                      : index.impact === "negative" ? "text-red-600"
                      : "text-gray-500"
                    }`}>
                      {index.impact === "positive" ? "↑" : index.impact === "negative" ? "↓" : "→"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl p-4">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Commodities
              </h2>
              <div className="space-y-2">
                {result.affected_commodities.map((commodity, i) => (
                  <div key={i}>
                    <span className="text-sm font-medium">{commodity.name}</span>
                    <span className={`ml-2 text-xs ${
                      commodity.impact === "positive" ? "text-green-600"
                      : commodity.impact === "negative" ? "text-red-600"
                      : "text-gray-500"
                    }`}>
                      {commodity.impact === "positive" ? "↑" : commodity.impact === "negative" ? "↓" : "→"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Historical Examples */}
          <div className="border border-gray-200 rounded-xl p-6">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Historical Examples
            </h2>
            <div className="space-y-3">
              {result.historical_examples.map((example, i) => (
                <div key={i} className="border-l-2 border-gray-200 pl-4">
                  <span className="text-xs font-semibold text-gray-400">{example.year}</span>
                  <p className="text-sm text-gray-700">{example.event}</p>
                  <p className="text-xs text-gray-500 mt-1">→ {example.outcome}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Insights + Talking Points */}
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-xl p-6">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
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

            <div className="border border-gray-200 rounded-xl p-6">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
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

        </div>
      )}
    </main>
  )
}