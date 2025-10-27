// =============================
// 🔧 CareTracker Extension Service Worker
// =============================

console.log("⚙️ CareTracker service worker loaded.");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "fetchChartDetails") {
    const { member_id, member_name } = message.payload;
    console.log(`📡 Fetching chart details for: ${member_name} (${member_id})`);

    (async () => {
      try {
        const res = await fetch("https://h4xqr89uik.execute-api.us-east-1.amazonaws.com/dev/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ member_id, member_name }),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);
        const data = await res.json();

        console.log("✅ Chart details fetched successfully.");
        sendResponse({ success: true, data });
      } catch (err) {
        console.error("❌ Chart fetch error:", err);
        sendResponse({ success: false, error: err.message });
      }
    })();

    return true; // Keep port open for async response
  }

  if (message.action === "fetchAuditDetails") {
    const { member_id } = message.payload;
    console.log(`📡 Fetching audit details for: ${member_id}`);

    (async () => {
      try {
        const res = await fetch("https://sfe5arbv61.execute-api.us-east-1.amazonaws.com/dev", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ member_id }),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);
        const data = await res.json();

        console.log("✅ Audit details fetched successfully.");
        sendResponse({ success: true, data });
      } catch (err) {
        console.error("❌ Audit fetch error:", err);
        sendResponse({ success: false, error: err.message });
      }
    })();

    return true; // Keep port open for async response
  }

  return false;
});
