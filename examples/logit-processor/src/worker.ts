// Serve the chat workload through web worker
import * as webllm from "@mlc-ai/web-llm";
import { MyLogitProcessor } from "./my_logit_processor";

console.log("Use web worker for logit processor");

const myLogitProcessor = new MyLogitProcessor();
const logitProcessorRegistry = new Map<string, webllm.LogitProcessor>();
logitProcessorRegistry.set("Phi2-q4f32_1", myLogitProcessor);

const engine = new webllm.Engine();
engine.setLogitProcessorRegistry(logitProcessorRegistry);
const handler = new webllm.EngineWorkerHandler(engine);
self.onmessage = (msg: MessageEvent) => {
  handler.onmessage(msg);
};
