(() => {
  const TABLE_SELECTOR = "#ctl00_MainContent_ucPatientDetail_dlPatient";
  const UL_SELECTOR = "#ulReadPatientDetail";
  const FLOATING_BUTTONS_ID = "floatingButtons";
  const FLOATING_PANEL_ID = "ct-chart-floating";
  const BACKDROP_ID = "backdrop";
  let observer;
  let hasLoaded = false;
  let currentType = null;

  console.log("🔍 CareTracker extension: chart + audit button loader running.");

  // =============================
  // 🧩 Create Floating Buttons
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

      .floating-icon-input {
        width: 45px;
        height: 45px;
        background: #fff;
        color: #007bff;
        border: none;
        border-radius: 50%;
        font-size: 22px;
        font-weight: bold;
        cursor: pointer;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 0;
      }

      .floating-icon-input:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      }

      .floating-icon-input.active {
        background: #28a745;
        color: #fff;
      }

      #${FLOATING_PANEL_ID} {
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
        opacity: 0;
        transform: translateY(-20px);
        transition: all 0.3s ease;
      }

      #${FLOATING_PANEL_ID}.show {
        opacity: 1;
        transform: translateY(0);
      }

      #${BACKDROP_ID} {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.4);
        z-index: 10000;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s ease;
      }

      #${BACKDROP_ID}.visible {
        opacity: 1;
        pointer-events: all;
      }

      .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
      }

      .close-btn {
        background: #ff4d4d;
        border: none;
        color: white;
        font-size: 16px;
        border-radius: 4px;
        padding: 4px 8px;
        cursor: pointer;
      }
    `;
    document.head.appendChild(style);

    // Floating Button Container
    const container = document.createElement("div");
    container.className = "floating-buttons";
    container.id = FLOATING_BUTTONS_ID;

    // Chart Input Button
    const chartBtn = document.createElement("input");
    chartBtn.type = "button";
    chartBtn.id = "chartBtn";
    chartBtn.className = "floating-icon-input chart-btn";
    chartBtn.value = "📊";
    chartBtn.title = "Chart Details";
    chartBtn.addEventListener("click", () => showChartDetails());

    // Audit Input Button
    const auditBtn = document.createElement("input");
    auditBtn.type = "button";
    auditBtn.id = "auditBtn";
    auditBtn.className = "floating-icon-input audit-btn";
    auditBtn.value = "📋";
    auditBtn.title = "Audit Details";
    auditBtn.addEventListener("click", () => showAuditDetails());

    container.appendChild(chartBtn);
    container.appendChild(auditBtn);
    document.body.appendChild(container);
  }

  // =============================
  // 🎯 Ensure Panel Exists
  // =============================
  function ensurePanelExists() {
    let backdrop = document.getElementById(BACKDROP_ID);
    if (!backdrop) {
      backdrop = document.createElement("div");
      backdrop.id = BACKDROP_ID;
      backdrop.addEventListener("click", hidePanel);
      document.body.appendChild(backdrop);
    }

    let panel = document.getElementById(FLOATING_PANEL_ID);
    if (!panel) {
      panel = document.createElement("div");
      panel.id = FLOATING_PANEL_ID;
      panel.innerHTML = `
        <div class="panel-header">
          <h3 id="chartTitle">Details</h3>
          <button class="close-btn" id="closePanelBtn">✖</button>
        </div>
        <div id="panelContent">Loading...</div>
      `;
      document.body.appendChild(panel);
      document.getElementById("closePanelBtn").addEventListener("click", hidePanel);
    }
  }

  // =============================
  // 🧭 Show Panel (Chart / Audit)
  // =============================
  function showPanel(type, title, contentHtml) {
    ensurePanelExists();

    const panel = document.getElementById(FLOATING_PANEL_ID);
    const backdrop = document.getElementById(BACKDROP_ID);
    const chartBtn = document.getElementById("chartBtn");
    const auditBtn = document.getElementById("auditBtn");
    const content = document.getElementById("panelContent");
    const titleEl = document.getElementById("chartTitle");

    panel.classList.remove("show");
    setTimeout(() => panel.classList.add("show"), 10);
    backdrop.classList.add("visible");

    currentType = type;
    titleEl.textContent = title;
    content.innerHTML = contentHtml;

    if (type === "chart") {
      chartBtn.classList.add("active");
      auditBtn.classList.remove("active");
    } else if (type === "audit") {
      auditBtn.classList.add("active");
      chartBtn.classList.remove("active");
    }
  }

  function hidePanel() {
    const panel = document.getElementById(FLOATING_PANEL_ID);
    const backdrop = document.getElementById(BACKDROP_ID);
    panel?.classList.remove("show");
    backdrop?.classList.remove("visible");
  }

  // =============================
  // 📊 Chart Details
  // =============================
  function showChartDetails() {
    const chartNumber = document.querySelector("#chartNumber")?.textContent?.trim();
    const memberName = document.querySelector("#patientName")?.textContent?.trim();
    if (!chartNumber || !memberName) return alert("⚠️ Patient info not found.");

    console.log(`📡 Fetching Chart Details for ${memberName} (${chartNumber})`);
    showPanel("chart", `Chart Details - ${memberName}`, `<p>Loading chart details...</p>`);

    chrome.runtime.sendMessage(
      { action: "fetchChartDetails", payload: { member_id: chartNumber, member_name: memberName } },
      (response) => {
        const content = document.getElementById("panelContent");
        if (!content) return;
        if (chrome.runtime.lastError)
          return (content.innerHTML = `<p style="color:red;">${chrome.runtime.lastError.message}</p>`);
        if (!response)
          return (content.innerHTML = `<p style="color:red;">No response from background.</p>`);
        if (response.error)
          return (content.innerHTML = `<p style="color:red;">❌ ${response.error}</p>`);
        content.innerHTML = `<pre>${JSON.stringify(response.data, null, 2)}</pre>`;
      }
    );
  }

  // =============================
  // 📋 Audit Details
  // =============================
  function showAuditDetails() {
    const chartNumber = document.querySelector("#chartNumber")?.textContent?.trim();
    const memberName = document.querySelector("#patientName")?.textContent?.trim();
    if (!chartNumber || !memberName) return alert("⚠️ Patient info not found.");

    console.log(`📡 Fetching Audit Details for ${memberName} (${chartNumber})`);
    showPanel("audit", `Audit Details - ${memberName}`, `<p>Loading audit details...</p>`);

    chrome.runtime.sendMessage(
      { action: "fetchAuditDetails", payload: { member_id: chartNumber, member_name: memberName } },
      (response) => {
        const content = document.getElementById("panelContent");
        if (!content) return;
        if (chrome.runtime.lastError)
          return (content.innerHTML = `<p style="color:red;">${chrome.runtime.lastError.message}</p>`);
        if (!response)
          return (content.innerHTML = `<p style="color:red;">No response from background.</p>`);
        if (response.error)
          return (content.innerHTML = `<p style="color:red;">❌ ${response.error}</p>`);
        content.innerHTML = `<pre>${JSON.stringify(response.data, null, 2)}</pre>`;
      }
    );
  }

  // =============================
  // 🧠 Auto-load when patient found
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

  observer = new MutationObserver(() => tryAutoLoad());
  observer.observe(document.body, { childList: true, subtree: true });
  tryAutoLoad();
})();
