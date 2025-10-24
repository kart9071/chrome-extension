const urlParams = new URLSearchParams(window.location.search);
const member_id = urlParams.get("member_id");
const member_name = urlParams.get("member_name");

document.getElementById("heading").textContent = `Chart Details - ${member_name}`;

document.getElementById("closeBtn").addEventListener("click", () => {
  window.close();
});

// Send message to background to fetch data (avoids CORS)
chrome.runtime.sendMessage(
  {
    action: "fetchChartDetails",
    payload: { member_id, member_name }
  },
  (response) => {
    const contentDiv = document.getElementById("content");

    if (chrome.runtime.lastError) {
      contentDiv.innerHTML = `<p style="color:red;">Error: ${chrome.runtime.lastError.message}</p>`;
      return;
    }

    if (!response) {
      contentDiv.innerHTML = `<p style="color:red;">No response from background script.</p>`;
      return;
    }

    if (response.error) {
      contentDiv.innerHTML = `<p style="color:red;">❌ ${response.error}</p>`;
    } else {
      contentDiv.innerHTML = `<pre>${JSON.stringify(response.data, null, 2)}</pre>`;
    }
  }
);
