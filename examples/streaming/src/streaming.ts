import * as webllm from "@mlc-ai/web-llm";

function setLabel(id: string, text: string) {
  const label = document.getElementById(id);
  if (label == null) {
    throw Error("Cannot find label " + id);
  }
  label.innerText = text;
}

/**
 * We domnstrate chat completion with streaming, where delta is sent while generating response.
 */
async function main() {
  const initProgressCallback = (report: webllm.InitProgressReport) => {
    setLabel("init-label", report.text);
  };
  const selectedModel = "Llama-2-7b-chat-hf-q4f32_1";
  const engine: webllm.EngineInterface = await webllm.CreateEngine(
    selectedModel,
    { initProgressCallback: initProgressCallback }
  );

  const request: webllm.ChatCompletionRequest = {
    stream: true,
    messages: [
      {
        "role": "system",
        "content": "[INST] <<SYS>>\n\nYou are a helpful, respectful and honest assistant. " +
          "Be as happy as you can when speaking please.\n<</SYS>>\n\n "
      },
      { "role": "user", "content": "Provide me three US states." },
      { "role": "assistant", "content": "California, New York, Pennsylvania." },
      { "role": "user", "content": "Two more please!" },
    ],
    temperature: 1.5,
    logprobs: true,
    top_logprobs: 2,
  };

  const asyncChunkGenerator = await engine.chat.completions.create(request);
  let message = "";
  for await (const chunk of asyncChunkGenerator) {
    console.log(chunk);
    if (chunk.choices[0].delta.content) {
      // Last chunk has undefined content
      message += chunk.choices[0].delta.content;
    }
    setLabel("generate-label", message);
    // engine.interruptGenerate();  // works with interrupt as well
  }
  console.log("Final message:\n", await engine.getMessage());  // the concatenated message
  console.log(await engine.runtimeStatsText());
}

main();
