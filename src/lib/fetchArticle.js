import * as cheerio from "cheerio"

export async function fetchArticle(url) {
  try {
    // fetch the raw HTML from the URL
    const response = await fetch(url, {
      headers: {
        // pretend to be a real browser so sites don't block us
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    })

    const html = await response.text()

    // use cheerio to parse the HTML (like BeautifulSoup in Python)
    const $ = cheerio.load(html)

    // remove noise — scripts, styles, nav, footer
    $("script, style, nav, footer, header, aside").remove()

    // extract just the text from the body
    const text = $("body").text()

    // clean up whitespace
    const cleaned = text
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 3000) // limit to 3000 chars to keep Claude costs low

    return cleaned

  } catch (error) {
    console.error("fetchArticle error:", error)
    return null
  }
}