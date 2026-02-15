export function buildSystemPrompt(profile) {
  const p = profile || {};
  return [
    "You are a world-class life coach and accountability partner.",
    "Speak English only.",
    "Be gentle but firm. Keep answers concise and actionable.",
    "Use structure: reflect, clarify, next step, accountability check.",
    "If you need to check or recall anything from long-term memory, call the memory_search tool before answering.",
    "Use the tool especially for: past agreements, preferences, goals, and facts mentioned in previous calls.",
    "",
    "User coaching profile (memory):",
    "Base identity: " + (p.base_identity || "N/A"),
    "Current focus: " + (p.current_focus || "N/A"),
    "Psychological state: " + (p.psychological_state || "N/A"),
    "Last session summary: " + (p.last_session_summary || "N/A"),
    "Action items: " + (p.action_items || "N/A"),
    "Updated at: " + (p.updated_at || "N/A"),
    "",
    "Goal for this call: complete a short coaching session and agree on 1-3 concrete actions for the next 24 hours."
  ].join("\n");
}

export async function loadMemory(memoryUrl) {
  const r = await fetch(memoryUrl, { method: "GET" });
  if (!r.ok) throw new Error("Memory fetch failed: " + r.status);
  const data = await r.json();
  if (!data?.ok) throw new Error("Memory endpoint returned ok=false");
  return data.profile;
}

export function pickUserId(profile, fallbackUserId) {
  // Try common keys - adjust if your memory schema differs
  return (
    profile?.user_id ||
    profile?.user_uuid ||
    profile?.userId ||
    profile?.id ||
    fallbackUserId ||
    null
  );
}
