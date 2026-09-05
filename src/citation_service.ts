import { z } from "zod";
import { InfraiClient } from "./infrai_client.js";

export const noteRequest = z.object({ note: z.string().min(1), citations: z.array(z.object({ title: z.string().min(1), doi: z.string().optional(), url: z.string().url(), year: z.number().int().optional() })).min(1) });
export type NoteRequest = z.infer<typeof noteRequest>;
export type Citation = NoteRequest["citations"][number];

export function dedupeCitations(citations: Citation[]): Citation[] {
  const seen = new Set<string>();
  return citations.filter(citation => { const key = (citation.doi ?? citation.title).trim().toLowerCase(); if (seen.has(key)) return false; seen.add(key); return true; });
}

export async function collectCitations(input: unknown, client = new InfraiClient()): Promise<{ citations: Citation[]; related: Array<{ metadata?: Record<string, unknown>; score?: number }> }> {
  const request = noteRequest.parse(input);
  const embedding = await client.embeddings(request.note);
  const related = await client.query("healthtech-research", embedding, 5);
  return { citations: dedupeCitations(request.citations), related };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const raw = process.env.NOTE_JSON;
  if (!raw) throw new Error("Set NOTE_JSON to a JSON request body");
  collectCitations(JSON.parse(raw)).then(result => console.log(JSON.stringify(result, null, 2)));
}
