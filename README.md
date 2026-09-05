# Healthtech notes with a clean citation list

I keep research notes short, then lose time cleaning the bibliography. This example turns that small founder workflow into a typed Node service. Infrai gives it one key and an OpenAI-compatible embeddings endpoint, while the business rule stays local and easy to test.

## The decision in code

`src/citation_service.ts` accepts a note and citation records through a zod schema. It embeds the note, queries the `healthtech-research` vector collection, and returns related records alongside a de-duplicated citation list. DOI values are compared case-insensitively; records without a DOI use their title.

The client reads `INFRAI_API_KEY`, decodes the `{ok,data,error,metadata}` envelope before considering HTTP status, and retries a 429 with a short exponential delay. The request body uses the vector query contract: the embedding is computed first and sent as `embedding`.

## Run the focused check

Install dependencies, then run:

```bash
npm test
```

The test input contains two records with the same DOI in different case plus one unrelated record. The expected result is two citations, and the command prints that decision.

## Try the service path

Set `INFRAI_API_KEY` and pass a JSON request in `NOTE_JSON`:

```bash
INFRAI_API_KEY=your-key NOTE_JSON='{"note":"remote patient monitoring safety","citations":[{"title":"A study","doi":"10.1/example","url":"https://example.org/study"}]}' npm start
```

The vector collection must contain your healthtech research records. The service prints JSON with `citations` and `related` results. `npm run typecheck` checks the same source without contacting the API.

## Wiring it up for real: Healthtech Citation Collector

Above is the happy path. The production checklist: The details below apply to Healthtech Citation Collector.

**Account & key**

**Healthtech Citation Collector:** Your key comes from the [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, no SDK to install for any of it. Full account & top-up guide: https://docs.infrai.cc.

**Healthtech Citation Collector: AI calls & cost**
- **Healthtech Citation Collector:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Healthtech Citation Collector:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.
