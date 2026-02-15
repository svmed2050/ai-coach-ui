import Vapi from "https://cdn.jsdelivr.net/npm/@vapi-ai/web/+esm";
import { buildSystemPrompt } from "./memory.js";
import { sendTranscript, makeDocId } from "./webhook.js";

export function createVapiController({
  publicKey,
  assistantId,
  ui,
  profile,
  userId,
  transcriptBuffer,
  transcriptWebhookUrl
}) {
  const vapi = new (Vapi.default || Vapi)(publicKey);

  let started = false;
  let injected = false;
  let currentDocId = null;
  let callStartTs = null;

  function isStarted() {
    return started;
  }

  async function start() {
    ui.hideDebug();

    if (!profile) throw new Error("No memory loaded yet");

    ui.setStatus("Requesting microphone...");
    await navigator.mediaDevices.getUserMedia({ audio: true });

    ui.setStatus("Starting call...");
    injected = false;

    transcriptBuffer.reset();
    currentDocId = makeDocId("call");
    callStartTs = Date.now();

    await vapi.start(assistantId);
  }

  function stop() {
    vapi.stop();
  }

  vapi.on("call-start", async () => {
    started = true;
    ui.setButtonStarted(true);
    ui.setStatus("Connected. Injecting memory...");

    try {
      // 1) Inject memory as a system message
      vapi.send({
        type: "add-message",
        message: { role: "system", content: buildSystemPrompt(profile) }
      });

      // 2) Kick off first assistant message (helps ensure system prompt is used)
      await vapi.say(
        "Hi! I loaded your coaching profile. Let's start. In one sentence, what is the main outcome you want from today?"
      );

      injected = true;
      ui.setStatus("Ready. Speak now.");
    } catch (e) {
      ui.setStatus("Connected, but injection failed");
      ui.showDebug({ error: String(e) });
    }
  });

  vapi.on("message", (message) => {
    transcriptBuffer.addFromVapiMessage(message);
  });

  vapi.on("call-end", async () => {
    started = false;
    const wasInjected = injected;
    ui.setButtonStarted(false);

    // Send transcript to n8n webhook (best-effort)
    try {
      const transcript = transcriptBuffer.toPlainText();
      if (transcript.trim().length) {
        ui.setStatus("Session ended. Sending transcript...");

        const meta = {
          injected_memory: wasInjected,
          transcript_items: transcriptBuffer.count(),
          call_started_at_ms: callStartTs,
          call_ended_at_ms: Date.now()
        };

        const resp = await sendTranscript({
          webhookUrl: transcriptWebhookUrl,
          userId,
          docId: currentDocId,
          transcript,
          meta
        });

        ui.setStatus("Transcript sent");
        ui.showDebug({ ok: true, webhook_response: resp, doc_id: currentDocId });
      } else {
        ui.setStatus("Session ended (no transcript captured yet)");
      }
    } catch (e) {
      ui.setStatus("Session ended (transcript send failed)");
      ui.showDebug({ error: String(e), doc_id: currentDocId });
    } finally {
      transcriptBuffer.reset();
      currentDocId = null;
      callStartTs = null;
    }
  });

  vapi.on("error", (e) => {
    ui.setStatus("Vapi error");
    ui.showDebug(e);
    console.error("Vapi error", e);
  });

  return {
    start,
    stop,
    isStarted
  };
}
