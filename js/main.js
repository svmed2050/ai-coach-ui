import { CONFIG } from "./config.js";
import { getUI } from "./dom.js";
import { loadMemory, pickUserId } from "./memory.js";
import { TranscriptBuffer } from "./transcript.js";
import { createVapiController } from "./vapiSession.js";

const ui = getUI();

let profile = null;
let controller = null;

async function init() {
  try {
    ui.setStatus("Loading memory...");
    ui.setMemoryPill("Loading memory...");

    profile = await loadMemory(CONFIG.MEMORY_URL);

    ui.setMemoryPill("Memory loaded");
    ui.setFocus(profile?.current_focus ? ("Focus: " + profile.current_focus) : "");

    const userId = pickUserId(profile, CONFIG.FALLBACK_USER_ID);

    controller = createVapiController({
      publicKey: CONFIG.PUBLIC_KEY,
      assistantId: CONFIG.ASSISTANT_ID,
      ui,
      profile,
      userId,
      transcriptBuffer: new TranscriptBuffer(),
      transcriptWebhookUrl: CONFIG.TRANSCRIPT_WEBHOOK_URL
    });

    ui.setStatus("Ready");
  } catch (e) {
    ui.setMemoryPill("Memory failed");
    ui.setStatus("Fix memory endpoint / CORS");
    ui.showDebug({ error: String(e) });
  }
}

ui.btn.addEventListener("click", async () => {
  try {
    ui.hideDebug();
    if (!controller) throw new Error("App is not initialized yet");

    if (!controller.isStarted()) {
      await controller.start();
    } else {
      controller.stop();
    }
  } catch (e) {
    ui.setStatus("Error");
    ui.showDebug({
      name: e?.name,
      message: e?.message,
      origin: location.origin,
      secureContext: window.isSecureContext
    });
    console.error(e);
  }
});

init();
