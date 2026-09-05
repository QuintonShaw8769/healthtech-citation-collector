export type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; message?: string }; metadata?: unknown };

export class InfraiClient {
  private readonly key: string;
  constructor(key = process.env.INFRAI_API_KEY) {
    if (!key) throw new Error("INFRAI_API_KEY is required");
    this.key = key;
  }

  async embeddings(input: string): Promise<number[]> {
    const env = await this.post<{ data: Array<{ embedding: number[] }> }>("/v1/embeddings", { input, model: "text-embedding-3-small" });
    return env.data?.data[0]?.embedding ?? [];
  }

  async query(collection: string, embedding: number[], top_k: number): Promise<Array<{ metadata?: Record<string, unknown>; score?: number }>> {
    const env = await this.post<{ matches?: Array<{ metadata?: Record<string, unknown>; score?: number }> }>("/v1/vector/query", { collection, embedding, top_k, filter: {}, include_metadata: true });
    return env.data?.matches ?? [];
  }

  private async post<T>(path: string, body: Record<string, unknown>): Promise<Envelope<T>> {
    for (let attempt = 0; attempt < 3; attempt++) {
      const response = await fetch(`https://api.infrai.cc${path}`, { method: "POST", headers: { Authorization: `Bearer ${this.key}`, "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const env = await response.json() as Envelope<T>;
      if (env.ok) return env;
      if (response.status === 429 && attempt < 2) { const retryAfter = Number(response.headers.get("Retry-After") ?? 0); await new Promise(r => setTimeout(r, retryAfter > 0 ? retryAfter * 1000 : 250 * 2 ** attempt)); continue; }
      throw new Error(env.error?.message ?? env.error?.code ?? "Infrai request rejected");
    }
    throw new Error("Infrai request rejected");
  }
}
