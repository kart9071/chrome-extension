chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "openChartDetailsTab") {
    const { member_id, member_name } = message.payload;
    chrome.tabs.create({
      url: chrome.runtime.getURL(
        `chart-details.html?member_id=${encodeURIComponent(member_id)}&member_name=${encodeURIComponent(member_name)}`
      ),
    });
    return true; // optional, no async response needed here
  }

  if (message.action === "fetchChartDetails") {
    const { member_id, member_name } = message.payload;
    (async () => {
      try {
        const res = await fetch("https://h4xqr89uik.execute-api.us-east-1.amazonaws.com/dev/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ member_id, member_name }),
        });
        const data = await res.json();
        sendResponse({ data });
      } catch (err) {
        sendResponse({ error: err.message });
      }
    })();
    return true; // must keep port open for async
  }
});
