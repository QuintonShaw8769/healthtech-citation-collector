import assert from "node:assert/strict";
import { dedupeCitations } from "./citation_service.js";

const input = [
  { title: "Remote monitoring", doi: "10.1000/ABC", url: "https://example.org/a" },
  { title: "Remote monitoring (copy)", doi: "10.1000/abc", url: "https://example.org/b" },
  { title: "Medication safety", url: "https://example.org/c" }
];
assert.deepEqual(dedupeCitations(input), [input[0], input[2]]);
console.log("dedupe decision: DOI matching is case-insensitive; 2 citations remain");
