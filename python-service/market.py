import yfinance as yf

def get_market_data(tickers: list) -> list:
    results = []

    for ticker in tickers:
        try:
            stock = yf.Ticker(ticker)
            info = stock.info

            current_price = info.get("currentPrice") or info.get("regularMarketPrice")
            previous_close = info.get("previousClose") or info.get("regularMarketPreviousClose")

            if current_price and previous_close:
                change = current_price - previous_close
                change_pct = (change / previous_close) * 100
            else:
                change = None
                change_pct = None

            results.append({
                "ticker": ticker,
                "name": info.get("shortName", ticker),
                "price": round(current_price, 2) if current_price else None,
                "change": round(change, 2) if change else None,
                "change_pct": round(change_pct, 2) if change_pct else None,
                "currency": info.get("currency", "USD"),
                "sector": info.get("sector", "Unknown")
            })

        except Exception as e:
            print(f"Error fetching {ticker}: {e}")
            results.append({
                "ticker": ticker,
                "name": ticker,
                "price": None,
                "change": None,
                "change_pct": None,
                "currency": None,
                "sector": None
            })

    return results