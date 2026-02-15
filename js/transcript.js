function pad2(n) { return String(n).padStart(2, "0"); }

function fmtTime(ts) {
  const d = new Date(ts);
  return pad2(d.getHours()) + ":" + pad2(d.getMinutes()) + ":" + pad2(d.getSeconds());
}

export class TranscriptBuffer {
  constructor() {
    this.reset();
  }

  reset() {
    this.items = [];
  }

  addFromVapiMessage(message) {
    // Vapi Web SDK sends transcripts via the "message" event, with message.type === "transcript"
    if (!message || message.type !== "transcript") return;

    // If transcriptType exists, prefer only final transcripts
    if (message.transcriptType && message.transcriptType !== "final") return;

    const text = (message.transcript ?? "").trim();
    if (!text) return;

    const role = message.role || "unknown";
    const ts = Date.now();

    const last = this.items[this.items.length - 1];
    if (last && last.role === role && last.text === text) return; // cheap dedup

    this.items.push({ role, text, ts });
  }

  toPlainText() {
    if (!this.items.length) return "";
    return this.items
      .map(x => `[${fmtTime(x.ts)}] ${String(x.role).toUpperCase()}: ${x.text}`)
      .join("\n");
  }

  count() {
    return this.items.length;
  }
}
