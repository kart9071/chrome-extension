console.log("🧠 CareTracker Service Worker loaded.");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "fetchChartDetails") {
    const { member_id, member_name } = message.payload;

    console.log("📡 Fetching chart details from API:", member_id, member_name);

    fetch("https://h4xqr89uik.execute-api.us-east-1.amazonaws.com/dev/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ member_id, member_name })
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        const data = await res.json();
        sendResponse({ data });
      })
      .catch((err) => {
        console.error("❌ Fetch failed:", err);
        sendResponse({ error: err.message });
      });

    // Required for async response
    return true;
  }
});
