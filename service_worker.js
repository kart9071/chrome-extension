chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "FETCH_CHART_DETAILS") {
    const { chartNumber, patientName } = message;

    // Make POST request
    fetch("https://h4xqr89uik.execute-api.us-east-1.amazonaws.com/dev/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add authorization headers if needed
        // "Authorization": "Bearer YOUR_TOKEN"
      },
      body: JSON.stringify({
        member_id: chartNumber,
        member_name: patientName
      })
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch chart details");
        return res.json();
      })
      .then((data) => {
        console.log("📦 API Response from Service Worker:", data);
        sendResponse({ success: true, data });
      })
      .catch((error) => {
        console.error("❌ Service Worker fetch error:", error);
        sendResponse({ success: false, error: error.message });
      });

    // Return true to keep the message channel open for async response
    return true;
  }
});
