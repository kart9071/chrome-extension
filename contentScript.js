(() => {
  const TABLE_SELECTOR = "#ctl00_MainContent_ucPatientDetail_dlPatient";
  const UL_SELECTOR = "#ulReadPatientDetail";
  const FLOATING_BUTTONS_ID = "floatingButtons";
  const FLOATING_RESPONSE_ID = "floatingResponse";
  let observer;
  let hasLoaded = false;

  console.log("🔍 CareTracker extension: chart + audit button loader running.");

  // =============================
  // 🧩 Inject Floating Buttons
  // =============================
  function createFloatingButtons() {
    if (document.getElementById(FLOATING_BUTTONS_ID)) return;

    console.log("📊 Injecting floating Chart & Audit buttons...");

    // Inject Styles
    const style = document.createElement("style");
    style.textContent = `
      .floating-buttons {
        position: fixed;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 8px;
        background: #007bff;
        border-radius: 20px 0 0 20px;
        padding: 15px 8px 15px 15px;
        box-shadow: -4px 0 12px rgba(0, 123, 255, 0.3);
        transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      }

      .floating-icon-btn {
        width: 45px;
        height: 45px;
        background: #fff;
        color: #007bff;
        border: none;
        border-radius: 50%;
        font-size: 20px;
        cursor: pointer;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      }

      .floating-icon-btn:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      }

      .floating-icon-btn.active {
        background: #28a745;
        color: #fff;
      }

      #${FLOATING_RESPONSE_ID} {
        position: fixed;
        top: 80px;
        right: 80px;
        width: 500px;
        max-height: 70vh;
        overflow-y: auto;
        background: #fff;
        border: 1px solid #ccc;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        border-radius: 8px;
        z-index: 10001;
        padding: 12px;
        font-family: 'Segoe UI', sans-serif;
        font-size: 14px;
        color: #333;
      }
    `;
    document.head.appendChild(style);

    // Floating Button Container
    const container = document.createElement("div");
    container.className = "floating-buttons";
    container.id = FLOATING_BUTTONS_ID;

    // Chart Button
    const chartBtn = document.createElement("button");
    chartBtn.className = "floating-icon-btn chart-btn";
    chartBtn.innerHTML = "📊";
    chartBtn.title = "Chart Details";
    chartBtn.addEventListener("click", () => showChartDetails(chartBtn));

    // Audit Button
    const auditBtn = document.createElement("button");
    auditBtn.className = "floating-icon-btn audit-btn";
    auditBtn.innerHTML = "📋";
    auditBtn.title = "Audit Details";
    auditBtn.addEventListener("click", () => showAuditTable(auditBtn));

    container.appendChild(chartBtn);
    container.appendChild(auditBtn);
    document.body.appendChild(container);
  }

  // =============================
  // 📊 Fetch Chart Details
  // =============================
  function showChartDetails(chartBtn) {
    const auditBtn = document.querySelector(".audit-btn");
    chartBtn.classList.add("active");
    auditBtn?.classList.remove("active");

    const chartNumber = document.querySelector("#chartNumber")?.textContent?.trim();
    const memberName = document.querySelector("#patientName")?.textContent?.trim();
    if (!chartNumber || !memberName) {
      return alert("⚠️ Patient ID or name not found on page.");
    }

    console.log(`📡 Fetching Chart Details for: ${memberName} (${chartNumber})`);
    showResponsePanel(`<p>Loading chart details...</p>`);

    chrome.runtime.sendMessage(
      { action: "fetchChartDetails", payload: { member_id: chartNumber, member_name: memberName } },
      (response) => {
        if (chrome.runtime.lastError)
          return showResponsePanel(`<p style="color:red;">${chrome.runtime.lastError.message}</p>`);
        if (!response)
          return showResponsePanel(`<p style="color:red;">No response from background.</p>`);
        if (response.error)
          return showResponsePanel(`<p style="color:red;">❌ ${response.error}</p>`);

        showResponsePanel(`<pre>${JSON.stringify(response.data, null, 2)}</pre>`);
      }
    );
  }

  // =============================
  // 📋 Fetch Audit Details
  // =============================
  function showAuditTable(auditBtn) {
    const chartBtn = document.querySelector(".chart-btn");
    auditBtn.classList.add("active");
    chartBtn?.classList.remove("active");

    const chartNumber = document.querySelector("#chartNumber")?.textContent?.trim();
    const memberName = document.querySelector("#patientName")?.textContent?.trim();
    if (!chartNumber || !memberName) {
      return alert("⚠️ Patient ID or name not found on page.");
    }

    console.log(`📡 Fetching Audit Details for: ${memberName} (${chartNumber})`);
    showResponsePanel(`<p>Loading audit details...</p>`);

    chrome.runtime.sendMessage(
      { action: "fetchAuditDetails", payload: { member_id: chartNumber, member_name: memberName } },
      (response) => {
        if (chrome.runtime.lastError)
          return showResponsePanel(`<p style="color:red;">${chrome.runtime.lastError.message}</p>`);
        if (!response)
          return showResponsePanel(`<p style="color:red;">No response from background.</p>`);
        if (response.error)
          return showResponsePanel(`<p style="color:red;">❌ ${response.error}</p>`);

        showResponsePanel(`<pre>${JSON.stringify(response.data, null, 2)}</pre>`);
      }
    );
  }

  // =============================
  // 🪟 Display Floating Response
  // =============================
  function showResponsePanel(content) {
    let panel = document.getElementById(FLOATING_RESPONSE_ID);
    if (!panel) {
      panel = document.createElement("div");
      panel.id = FLOATING_RESPONSE_ID;
      document.body.appendChild(panel);
    }
    panel.innerHTML = content;
  }

  // =============================
  // 🧠 Detect Patient & Auto-load
  // =============================
  function tryAutoLoad() {
    if (hasLoaded) return;

    const table = document.querySelector(TABLE_SELECTOR);
    const ul = document.querySelector(UL_SELECTOR);
    if (!table || !ul) return;

    const chartNumber = document.querySelector("#chartNumber")?.textContent?.trim();
    const patientName = document.querySelector("#patientName")?.textContent?.trim();

    if (chartNumber && patientName) {
      console.log(`🧩 Found patient: ${patientName} (${chartNumber})`);
      createFloatingButtons();
      hasLoaded = true;
    }
  }

  // Watch DOM for patient info
  observer = new MutationObserver(() => tryAutoLoad());
  observer.observe(document.body, { childList: true, subtree: true });

  // Initial check
  tryAutoLoad();
})();
