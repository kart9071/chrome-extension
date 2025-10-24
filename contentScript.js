(() => {
  const TABLE_SELECTOR = "#ctl00_MainContent_ucPatientDetail_dlPatient";
  const UL_SELECTOR = "#ulReadPatientDetail";
  const BUTTON_ID = "ct-chart-details-btn";

  let observer;

  console.log("🔍 CareTracker extension content script loaded.");

  // 🧩 Create button
  function createButton(patientName, chartNumber) {
    const btn = document.createElement("button");
    btn.id = BUTTON_ID;
    btn.innerText = "Open Chart Details";
    btn.title = `Chart #: ${chartNumber || "N/A"}`;
    btn.style.cssText = `
      padding: 4px 8px;
      border: 1px solid #007bff;
      border-radius: 5px;
      background: #fff;
      cursor: pointer;
      font-size: 12px;
      color: #007bff;
      transition: all 0.2s ease-in-out;
    `;
    btn.addEventListener("mouseover", () => {
      btn.style.background = "#007bff";
      btn.style.color = "#fff";
    });
    btn.addEventListener("mouseout", () => {
      btn.style.background = "#fff";
      btn.style.color = "#007bff";
    });

    // When button is clicked, open new tab and send data
    btn.addEventListener("click", () => {
      const member_id = chartNumber || prompt("Enter member_id:", "");
      const member_name = patientName || prompt("Enter patient_name:", "");

      if (!member_id || !member_name) {
        alert("⚠️ Both member_id and patient_name are required!");
        return;
      }

      console.log("🪄 Opening new tab for chart details...");

      // Ask background to open new tab and pass data
      chrome.runtime.sendMessage({
        action: "openChartDetailsTab",
        payload: { member_id, member_name },
      });
    });

    return btn;
  }

  // 🧩 Inject button inside UL
  function injectButton() {
    const table = document.querySelector(TABLE_SELECTOR);
    const ul = document.querySelector(UL_SELECTOR);
    if (!table || !ul) return;
    if (document.getElementById(BUTTON_ID)) return;

    const chartNumber =
      document.querySelector("#chartNumber")?.textContent?.trim() || "";
    const patientName =
      document.querySelector("#patientName")?.textContent?.trim() || "";

    const li = document.createElement("li");
    li.innerHTML = `<label style="margin-right:6px;">Chart Details:</label>`;
    const btn = createButton(patientName, chartNumber);
    li.appendChild(btn);

    ul.appendChild(li);
    console.log("✅ Button injected successfully!");
  }

  // ✅ Observe DOM for first-time injection only
  function startMonitoring() {
    injectButton(); // Try immediately

    observer = new MutationObserver(() => {
      if (!document.getElementById(BUTTON_ID)) injectButton();
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  startMonitoring();
})();
