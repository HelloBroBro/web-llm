# Awesome WebLLM

This page contains a curated list of examples, tutorials, blogs about WebLLM usecases.
Please send a pull request if you find things that belongs to here.

## Tutorial Examples

Note that all examples below run in-browser and use WebGPU as a backend.

#### Basic Chat Completion
- [get-started](get-started): minimum get started example with chat completion.
- [get-started-web-worker](get-started-web-worker): same as get-started, but using web worker.
- [multi-round-chat](multi-round-chat): while APIs are functional, we internally optimize so that multi round chat usage can reuse KV cache
- [simple-chat](simple-chat): a mininum and complete chat bot app.
- [next-simple-chat](next-simple-chat): a mininum and complete chat bot app with [Next.js](https://nextjs.org/).

#### Advanced OpenAI API Capabilities
These examples demonstrate various capabilities via WebLLM's OpenAI-like API.
- [streaming](streaming): return output as chunks in real-time in the form of an AsyncGenerator
- [json-mode](json-mode): efficiently ensure output is in json format, see [OpenAI Reference](https://platform.openai.com/docs/guides/text-generation/chat-completions-api) for more.
- [function-calling](function-calling): function calling with fields `tools` and `tool_choice`.
- [seed-to-reproduce](seed-to-reproduce): use seeding to ensure reproducible output with fields `seed`.

#### Chrome Extension
- [chrome-extension](chrome-extension): chrome extension that does not have a persistent background
- [chrome-extension-webgpu-service-worker](chrome-extension-webgpu-service-worker): chrome extension using service worker, hence having a persistent background

#### Others
- [logit-processor](logit-processor): while `logit_bias` is supported, we additionally support stateful logit processing where users can specify their own rules. We also expose low-level API `forwardTokensAndSample()`.
- [cache-usage](cache-usage): demonstrates how WebLLM supports both the [Cache API](https://developer.mozilla.org/en-US/docs/Web/API/Cache) and [IndexedDB cache](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API), and
users can pick with `appConfig.useIndexedDBCache`. Also demonstrates various cache utils such as checking
whether a model is cached, deleting a model's weights from cache, deleting a model library wasm from cache, etc.

## Demo Spaces

- [web-llm-embed](https://huggingface.co/spaces/matthoffner/web-llm-embed): document chat prototype using react-llm with transformers.js embeddings 
- [DeVinci](https://x6occ-biaaa-aaaai-acqzq-cai.icp0.io/): AI chat app based on WebLLM and hosted on decentralized cloud platform