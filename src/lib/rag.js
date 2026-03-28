import { createClient } from "@supabase/supabase-js"
import OpenAI from "openai"

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// convert text to a vector embedding using OpenAI
export async function embedText(text) {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text.slice(0, 8000) // limit to 8000 chars
  })
  return response.data[0].embedding
}

export async function storeArticle(articleData) {
  try {
    const { url, content, summary, market_signal, risk_level,
            affected_sectors, affected_stocks, 
            historical_examples, insights } = articleData

    console.log("Storing article:", url)

    // generate embedding from the article content
    const embedding = await embedText(content)
    console.log("Embedding generated, length:", embedding.length)

    const { data, error } = await supabase
      .from("articles")
      .insert({
        url,
        content,
        summary,
        market_signal,
        risk_level,
        affected_sectors,
        affected_stocks,
        historical_examples,
        insights,
        embedding
      })

    if (error) {
      console.error("Supabase insert error:", error)
      return null
    }

    console.log("Article stored successfully!")
    return data

  } catch (error) {
    console.error("storeArticle error:", error)
    return null
  }
}

// find similar past articles using vector similarity search
export async function findSimilarArticles(text, limit = 3) {
  try {
    // convert the new article to a vector
    const embedding = await embedText(text)

    // search Supabase for the most similar past articles
    const { data, error } = await supabase.rpc(
      "match_articles",
      {
        query_embedding: embedding,
        match_threshold: 0.7,
        match_count: limit
      }
    )

    if (error) {
      console.error("Similarity search error:", error)
      return []
    }

    return data || []

  } catch (error) {
    console.error("findSimilarArticles error:", error)
    return []
  }
}

// format similar articles as context for Claude
export function formatContext(similarArticles) {
  if (!similarArticles || similarArticles.length === 0) {
    return ""
  }

  const context = similarArticles.map((article, i) => `
Past Article ${i + 1}:
- Summary: ${article.summary}
- Market Signal: ${article.market_signal}
- Risk Level: ${article.risk_level}
- What happened: ${article.insights?.join(", ")}
  `).join("\n")

  return `
Here are similar financial articles you have previously analysed.
Use these as real context for your historical examples:

${context}
`
}