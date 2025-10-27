(() => {
  const TABLE_SELECTOR = "#ctl00_MainContent_ucPatientDetail_dlPatient";
  const UL_SELECTOR = "#ulReadPatientDetail";
  const FLOATING_DIV_ID = "ct-chart-floating";
  const FLOATING_ICON_ID = "ct-chart-icon";

  const FLOATING_DIV_ID_2 = "ct-audit-floating";
  const FLOATING_ICON_ID_2 = "ct-audit-icon";

  let observer;
  let hasLoaded = false;
  let isOpenChart = false;
  let isOpenAudit = false;

  console.log("🔍 CareTracker extension: auto chart & audit icon loader running.");

  // ==============================
  // 🩺 Create Chart Details Icon
  // ==============================
  function createFloatingIcon1() {
    const existing = document.getElementById(FLOATING_ICON_ID);
    if (existing) return existing;

    const icon = document.createElement("div");
    icon.id = FLOATING_ICON_ID;
    icon.title = "View Chart Details";
    icon.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      width: 50px;
      height: 50px;
      background: #007bff;
      color: white;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 24px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      cursor: pointer;
      z-index: 9999;
    `;
    icon.textContent = "🩺";
    document.body.appendChild(icon);

    icon.addEventListener("click", () => {
      if (!isOpenChart) {
        const div = createFloatingDiv1();
        div.style.display = "block";
        icon.style.display = "none";
        isOpenChart = true;
      }
    });

    return icon;
  }

  // ==============================
  // 🧾 Create Audit Details Icon
  // ==============================
  function createFloatingIcon2() {
    const existing = document.getElementById(FLOATING_ICON_ID_2);
    if (existing) return existing;

    const icon = document.createElement("div");
    icon.id = FLOATING_ICON_ID_2;
    icon.title = "View Audit Details";
    icon.style.cssText = `
      position: fixed;
      top: 140px;
      right: 20px;
      width: 50px;
      height: 50px;
      background: #28a745;
      color: white;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 24px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      cursor: pointer;
      z-index: 9999;
    `;
    icon.textContent = "🧾";
    document.body.appendChild(icon);

    icon.addEventListener("click", () => {
      if (!isOpenAudit) {
        const div = createFloatingDiv2();
        div.style.display = "block";
        icon.style.display = "none";
        isOpenAudit = true;
      }
    });

    return icon;
  }

  // ==============================
  // Floating Div 1 - Chart Details
  // ==============================
  function createFloatingDiv1() {
    const existing = document.getElementById(FLOATING_DIV_ID);
    if (existing) return existing;

    const div = document.createElement("div");
    div.id = FLOATING_DIV_ID;
    div.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      width: 650px;
      max-height: 90vh;
      overflow-y: auto;
      background: #fff;
      border: 1px solid #ccc;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      border-radius: 10px;
      z-index: 9999;
      padding: 12px;
      font-family: Arial, sans-serif;
      font-size: 13px;
      color: #333;
      display: none;
    `;

    div.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <h3 id="chartTitle" style="margin:0; font-size:15px; color:#007bff;">Chart Details</h3>
        <button id="closeChartDiv"
          style="background:#f33; color:#fff; border:none; border-radius:5px; cursor:pointer; padding:2px 6px;">
          ✕
        </button>
      </div>
      <div id="chartContent" style="margin-top:10px;">Loading...</div>
    `;

    document.body.appendChild(div);

    document.getElementById("closeChartDiv").addEventListener("click", () => {
      div.style.display = "none";
      const icon = document.getElementById(FLOATING_ICON_ID);
      if (icon) icon.style.display = "flex";
      isOpenChart = false;
    });

    return div;
  }

  // ==============================
  // Floating Div 2 - Audit Details
  // ==============================
  function createFloatingDiv2() {
    const existing = document.getElementById(FLOATING_DIV_ID_2);
    if (existing) return existing;

    const div = document.createElement("div");
    div.id = FLOATING_DIV_ID_2;
    div.style.cssText = `
      position: fixed;
      top: 140px;
      right: 20px;
      width: 650px;
      max-height: 90vh;
      overflow-y: auto;
      background: #fff;
      border: 1px solid #ccc;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      border-radius: 10px;
      z-index: 9999;
      padding: 12px;
      font-family: Arial, sans-serif;
      font-size: 13px;
      color: #333;
      display: none;
    `;

    div.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <h3 id="auditTitle" style="margin:0; font-size:15px; color:#28a745;">Audit Details</h3>
        <button id="closeAuditDiv"
          style="background:#f33; color:#fff; border:none; border-radius:5px; cursor:pointer; padding:2px 6px;">
          ✕
        </button>
      </div>
      <div id="auditContent" style="margin-top:10px;">Loading...</div>
    `;

    document.body.appendChild(div);

    document.getElementById("closeAuditDiv").addEventListener("click", () => {
      div.style.display = "none";
      const icon = document.getElementById(FLOATING_ICON_ID_2);
      if (icon) icon.style.display = "flex";
      isOpenAudit = false;
    });

    return div;
  }

  // ==============================
  // Fetch Chart Details
  // ==============================
  function fetchChartDetails(member_id, member_name) {
    const contentDiv = document.getElementById("chartContent");
    document.getElementById("chartTitle").textContent = `Chart Details - ${member_name}`;
    contentDiv.innerHTML = "<p>Loading...</p>";

    chrome.runtime.sendMessage(
      { action: "fetchChartDetails", payload: { member_id, member_name } },
      (response) => {
        contentDiv.innerHTML = response?.error
          ? `<p style="color:red;">❌ ${response.error}</p>`
          : `<pre>${JSON.stringify(response.data, null, 2)}</pre>`;
      }
    );
  }

  // ==============================
  // Fetch Audit Details
  // ==============================
  function fetchAuditDetails(member_id, member_name) {
    const contentDiv = document.getElementById("auditContent");
    document.getElementById("auditTitle").textContent = `Audit Details - ${member_name}`;
    contentDiv.innerHTML = "<p>Loading...</p>";

    chrome.runtime.sendMessage(
      { action: "fetchAuditDetails", payload: { member_id, member_name } },
      (response) => {
        contentDiv.innerHTML = response?.error
          ? `<p style="color:red;">❌ ${response.error}</p>`
          : `<pre>${JSON.stringify(response.data, null, 2)}</pre>`;
      }
    );
  }

  // ==============================
  // Detect Patient and Load Icons
  // ==============================
  function tryAutoLoad() {
    if (hasLoaded) return;
    const table = document.querySelector(TABLE_SELECTOR);
    const ul = document.querySelector(UL_SELECTOR);
    if (!table || !ul) return;

    const chartNumber = document.querySelector("#chartNumber")?.textContent?.trim();
    const patientName = document.querySelector("#patientName")?.textContent?.trim();

    if (chartNumber && patientName) {
      console.log(`🧩 Found patient: ${patientName} (${chartNumber})`);
      createFloatingIcon1();
      createFloatingIcon2();
      createFloatingDiv1();
      createFloatingDiv2();
      fetchChartDetails(chartNumber, patientName);
      fetchAuditDetails(chartNumber, patientName);
      hasLoaded = true;
    }
  }

  observer = new MutationObserver(() => tryAutoLoad());
  observer.observe(document.body, { childList: true, subtree: true });

  tryAutoLoad();
})();
