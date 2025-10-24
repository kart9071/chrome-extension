chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "openChartDetailsTab") {
    const { member_id, member_name } = message.payload;

    // Open a new tab for chart details
    chrome.tabs.create(
      {
        url: chrome.runtime.getURL(
          `chart-details.html?member_id=${encodeURIComponent(member_id)}&member_name=${encodeURIComponent(member_name)}`
        ),
      },
      () => sendResponse({ success: true })
    );

    return true; // Keeps message channel open
  }
});
