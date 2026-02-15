export async function sendTranscript({ webhookUrl, userId, docId, transcript, meta }) {
  const payload = {
    user_id: userId,
    doc_id: docId,
    transcript,
    source: "ui",
    meta: meta || {}
  };

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || `Webhook HTTP ${res.status}`);
  }
  return data;
}

export function makeDocId(prefix = "call") {
  const iso = new Date().toISOString().replace(/[:.]/g, "-");
  const rnd = Math.random().toString(16).slice(2, 8);
  return `${prefix}_${iso}_${rnd}`;
}
