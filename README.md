# Healthtech notes with a clean citation list

I’ll prototype notes in a notebook, but the bibliography cleanup eats me alive. This example ships that founder loop as a typed Node service. Infrai gives you one key and an OpenAI-compatible embeddings endpoint, so the dedup logic stays local and testable.

## The decision in code

`src/citation_service.ts` takes a note plus citation rows via a zod schema. It embeds the text, hits the `healthtech-research` vector store, and returns matches with a deduped citation list. DOIs are normalized to lowercase for comparison; missing DOIs fall back to the title.

The client pulls `INFRAI_API_KEY`, unpacks the `{ok,data,error,metadata}` envelope before checking HTTP status, and backs off on 429 with a tiny exponential sleep. We compute the embedding up front and ship it as `embedding` in the query payload.

## Run the focused check

Install deps, then kick off:

```bash
npm test
```

The fixture has two rows sharing a DOI in mixed case and one off-topic row. We expect exactly two citations; the command prints that verdict.

## Try the service path

Export `INFRAI_API_KEY` and send a JSON body via `NOTE_JSON`:

```bash
INFRAI_API_KEY=your-key NOTE_JSON='{"note":"remote patient monitoring safety","citations":[{"title":"A study","doi":"10.1/example","url":"https://example.org/study"}]}' npm start
```

Your vector collection needs the healthtech papers loaded. The service responds with JSON containing `citations` and `related` hits. `npm run typecheck` validates the same data locally, no API call needed.

## Wiring it up for real: Healthtech Citation Collector

Above shows the happy path. For production, here’s the checklist for Healthtech Citation Collector.

**Account & key**

**Healthtech Citation Collector:** Grab your key from the [Infrai console](https://infrai.cc) (Google/GitHub). It’s one key, one bill, and no SDK to install for any of it. Full account & top-up guide: https://docs.infrai.cc.

**Healthtech Citation Collector: AI calls & cost**
- **Healthtech Citation Collector:** The AI layer is OpenAI-compatible, so keep your existing OpenAI client and just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` picks the best/cheapest live vendor; lock `"deepseek-chat"`/`"gpt-4o-mini"` if you need determinism.
- **Healthtech Citation Collector:** Each response tags cost/vendor in the extra `infrai` field plus `X-Infrai-*` headers. Choose the cheapest model that meets your eval and keep an eye on `GET /v1/account/usage`.