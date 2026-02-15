export function getUI() {
  const btn = document.getElementById("btn");
  const statusEl = document.getElementById("status");
  const debugEl = document.getElementById("debug");
  const memPill = document.getElementById("memPill");
  const focusEl = document.getElementById("focus");

  function setStatus(text) {
    statusEl.textContent = text;
  }

  function setButtonStarted(isStarted) {
    if (isStarted) {
      btn.textContent = "Stop Session";
      btn.classList.add("active");
    } else {
      btn.textContent = "Start Session";
      btn.classList.remove("active");
    }
  }

  function setMemoryPill(text) {
    memPill.textContent = text;
  }

  function setFocus(text) {
    focusEl.textContent = text || "";
  }

  function showDebug(obj) {
    debugEl.style.display = "block";
    debugEl.textContent = typeof obj === "string" ? obj : JSON.stringify(obj, null, 2);
  }

  function hideDebug() {
    debugEl.style.display = "none";
    debugEl.textContent = "";
  }

  return {
    btn,
    setStatus,
    setButtonStarted,
    setMemoryPill,
    setFocus,
    showDebug,
    hideDebug
  };
}
