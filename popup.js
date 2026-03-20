async function getActiveTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0] || null;
}

let activeTabId = null;

function renderState(analysis) {
  const summaryNode = document.getElementById("summary");
  const pillNode = document.getElementById("pill");
  const subheadNode = document.getElementById("subhead");
  const confidenceNode = document.getElementById("confidence");
  const evidenceNode = document.getElementById("evidence");
  const noteNode = document.getElementById("note");
  const deepCheckButton = document.getElementById("deep-check");

  summaryNode.textContent = analysis.summary;
  pillNode.textContent = (analysis.type || "unknown").replace("-", " ");
  pillNode.className = `pill ${analysis.type || ""}`;
  subheadNode.textContent = analysis.handle ? `@${analysis.handle}` : "";
  confidenceNode.textContent = analysis.confidence ? `Confidence: ${analysis.confidence}/100` : "";

  evidenceNode.innerHTML = "";
  for (const item of analysis.evidence || []) {
    const li = document.createElement("li");
    li.textContent = item;
    evidenceNode.appendChild(li);
  }

  noteNode.textContent = analysis.note || "";
  deepCheckButton.disabled = !activeTabId || analysis.type === "not-profile" || analysis.type === "loading";
}

function sendMessage(message) {
  return new Promise((resolve) => {
    if (!activeTabId) {
      resolve(null);
      return;
    }

    chrome.tabs.sendMessage(activeTabId, message, (response) => {
      if (chrome.runtime.lastError) {
        resolve(null);
        return;
      }

      resolve(response || null);
    });
  });
}

async function init() {
  const tab = await getActiveTab();
  activeTabId = tab?.id || null;

  if (!tab?.id || !/^https:\/\/x\.com\//i.test(tab.url || "")) {
    renderState({
      type: "not-profile",
      summary: "Open an X profile page to inspect it.",
      handle: "",
      confidence: 0,
      evidence: [],
      note: "This extension only runs on x.com."
    });
    return;
  }

  const response = await sendMessage({ type: "XIC_GET_ANALYSIS" });
  if (!response) {
    renderState({
      type: "inconclusive",
      summary: "The X page is still loading or the profile header is not available yet.",
      handle: "",
      confidence: 0,
      evidence: [],
      note: "Reload the page if the profile was already visible."
    });
    return;
  }

  renderState(response);
}

document.getElementById("deep-check").addEventListener("click", async () => {
  renderState({
    type: "loading",
    summary: "Querying X profile data…",
    handle: "",
    confidence: 0,
    evidence: [],
    note: "Reading X's internal account-profile response."
  });

  const response = await sendMessage({ type: "XIC_RUN_DEEP_CHECK" });
  if (!response) {
    renderState({
      type: "inconclusive",
      summary: "Could not read the X account-profile response.",
      handle: "",
      confidence: 0,
      evidence: [],
      note: "Make sure you are logged into X in this tab and try again."
    });
    return;
  }

  renderState(response);
});

init().catch(() => {
  renderState({
    type: "inconclusive",
    summary: "Unable to read the current X page.",
    handle: "",
    confidence: 0,
    evidence: [],
    note: "Try reloading the tab and opening the popup again."
  });
});
