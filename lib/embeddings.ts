interface VoyageEmbedResponse {
  data: { embedding: number[]; index: number }[]
  model: string
  usage: { total_tokens: number }
}

async function voyageEmbed(input: string | string[]): Promise<number[][]> {
  const texts = Array.isArray(input) ? input : [input]

  const res = await fetch('https://api.voyageai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.VOYAGE_API_KEY}`,
    },
    body: JSON.stringify({ input: texts, model: 'voyage-3-lite' }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Voyage AI error ${res.status}: ${err}`)
  }

  const json = (await res.json()) as VoyageEmbedResponse
  return json.data.sort((a, b) => a.index - b.index).map((d) => d.embedding)
}

export async function embedText(text: string): Promise<number[]> {
  const embeddings = await voyageEmbed(text)
  return embeddings[0]
}

export async function embedBatch(texts: string[]): Promise<number[][]> {
  return voyageEmbed(texts)
}
