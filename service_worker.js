// =============================
// 🔧 CareTracker Extension Service Worker
// =============================

console.log("⚙️ Service worker loaded.");

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // =============================
  // 🩺 Handle Chart Details Fetch
  // =============================
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

        if (!res.ok) {
          throw new Error(`HTTP ${res.status} - ${res.statusText}`);
        }

        const data = await res.json();

        console.log("✅ Chart details fetched successfully:", data);
        sendResponse({ data });
      } catch (err) {
        console.error("❌ Chart details fetch error:", err);
        sendResponse({ error: err.message });
      }
    })();

    // Keep message channel open for async response
    return true;
  }

  // =============================
  // 📊 Handle Chart Summary Fetch
  // =============================
  if (message.action === "fetchChartSummary") {
    const { member_id, member_name } = message.payload;

    console.log(`📡 Fetching chart summary for: ${member_name} (${member_id})`);

    (async () => {
      try {
        const res = await fetch("https://sfe5arbv61.execute-api.us-east-1.amazonaws.com/dev", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ member_id, member_name }),
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status} - ${res.statusText}`);
        }

        const data = await res.json();

        console.log("✅ Chart summary fetched successfully:", data);
        sendResponse({ data });
      } catch (err) {
        console.error("❌ Chart summary fetch error:", err);
        sendResponse({ error: err.message });
      }
    })();

    // Keep message channel open for async response
    return true;
  }

  return false;
});
