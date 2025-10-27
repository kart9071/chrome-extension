(() => {
  const TABLE_SELECTOR = "#ctl00_MainContent_ucPatientDetail_dlPatient";
  const UL_SELECTOR = "#ulReadPatientDetail";
  const DETAILS_BUTTON_ID = "ct-chart-details-btn";
  const SUMMARY_BUTTON_ID = "ct-chart-summary-btn";

  console.log("🔍 CareTracker Extension content script loaded.");

  function createButton(label, color, title, onClick) {
    const btn = document.createElement("button");
    btn.innerText = label;
    btn.title = title;
    btn.style.cssText = `
      padding: 4px 8px;
      border: 1px solid ${color};
      border-radius: 5px;
      background: #fff;
      cursor: pointer;
      font-size: 12px;
      color: ${color};
      margin-left: 8px;
      transition: all 0.2s ease-in-out;
    `;
    btn.addEventListener("mouseover", () => {
      btn.style.background = color;
      btn.style.color = "#fff";
    });
    btn.addEventListener("mouseout", () => {
      btn.style.background = "#fff";
      btn.style.color = color;
    });
    btn.addEventListener("click", onClick);
    return btn;
  }

  function injectButtons() {
    const table = document.querySelector(TABLE_SELECTOR);
    const ul = document.querySelector(UL_SELECTOR);

    if (!table || !ul) return;

    if (document.getElementById(DETAILS_BUTTON_ID) && document.getElementById(SUMMARY_BUTTON_ID)) {
      return; // both buttons already exist
    }

    const chartNumber = document.querySelector("#chartNumber")?.textContent?.trim() || "";
    const patientName = document.querySelector("#patientName")?.textContent?.trim() || "";

    const li = document.createElement("li");
    li.innerHTML = `<label style="margin-right:6px;">Chart Actions:</label>`;

    // Button 1 → Existing chart details API
    const detailsBtn = createButton("📋 Details", "#007bff", `Fetch details for ${patientName}`, () => {
      chrome.runtime.sendMessage(
        {
          action: "fetchChartDetails",
          payload: { member_id: chartNumber, member_name: patientName },
        },
        (response) => {
          if (response?.data) {
            alert("✅ Chart Details:\n" + JSON.stringify(response.data, null, 2));
          } else {
            alert("❌ Failed to fetch chart details: " + response?.error);
          }
        }
      );
    });
    detailsBtn.id = DETAILS_BUTTON_ID;

    // Button 2 → NEW summary API
    const summaryBtn = createButton("📑 Summary", "#28a745", `Fetch summary for ${patientName}`, () => {
      chrome.runtime.sendMessage(
        {
          action: "fetchChartSummary",
          payload: { member_id: chartNumber, member_name: patientName },
        },
        (response) => {
          if (response?.data) {
            alert("✅ Chart Summary:\n" + JSON.stringify(response.data, null, 2));
          } else {
            alert("❌ Failed to fetch chart summary: " + response?.error);
          }
        }
      );
    });
    summaryBtn.id = SUMMARY_BUTTON_ID;

    // Append both buttons
    const span = document.createElement("span");
    span.appendChild(detailsBtn);
    span.appendChild(summaryBtn);
    li.appendChild(span);
    ul.appendChild(li);

    console.log("🎉 Both buttons injected inside <ul> successfully!");
  }

  // MutationObserver to handle dynamic DOM
  const observer = new MutationObserver(injectButtons);
  observer.observe(document.body, { childList: true, subtree: true });

  injectButtons();
  setInterval(injectButtons, 5000);
})();
