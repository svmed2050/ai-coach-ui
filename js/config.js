// Central config for the UI
export const CONFIG = {
  PUBLIC_KEY: "8904cfd2-8271-40eb-93cf-93778350e587",
  ASSISTANT_ID: "027e16e8-3853-4f51-86ef-df10a11d3aec",

  // Memory endpoint (GET) that returns { ok: true, profile: {...} }
  MEMORY_URL: "https://growthautomation-leadgen.app.n8n.cloud/webhook/coach",

  // Transcript webhook (POST)
  TRANSCRIPT_WEBHOOK_URL: "https://growthautomation-leadgen.app.n8n.cloud/webhook/call-transcript",

  // If your memory endpoint already includes a user id inside profile, you can keep this null.
  // Otherwise set it here (uuid string) to always send user_id.
  FALLBACK_USER_ID: "0421330f-84f2-494d-a0ed-628b31293b51"
};
