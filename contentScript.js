(() => {
  const TABLE_SELECTOR = "#ctl00_MainContent_ucPatientDetail_dlPatient";
  const UL_SELECTOR = "#ulReadPatientDetail";
  const FLOATING_DIV_ID = "ct-chart-floating";
  const FLOATING_ICON_ID = "ct-chart-icon";
  const FLOATING_SUMMARY_DIV_ID = "ct-summary-floating";
  const FLOATING_SUMMARY_ICON_ID = "ct-summary-icon";

  let observer;
  let hasLoaded = false;
  let isOpen = false;
  let isSummaryOpen = false;

  console.log("🔍 CareTracker extension: auto chart details icon loader running.");

  // ============================
  // 🩺 Create Floating Icon (Chart Details)
  // ============================
  function createFloatingIcon() {
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
      if (!isOpen) {
        const div = createFloatingDiv();
        div.style.display = "block";
        icon.style.display = "none";
        isOpen = true;
      }
    });

    return icon;
  }

  // ============================
  // 🧩 Floating Div (Chart Details)
  // ============================
  function createFloatingDiv() {
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
      isOpen = false;
    });

    return div;
  }

  // ============================
  // 📊 Create Floating Icon (Chart Summary)
  // ============================
  function createSummaryIcon() {
    const existing = document.getElementById(FLOATING_SUMMARY_ICON_ID);
    if (existing) return existing;

    const icon = document.createElement("div");
    icon.id = FLOATING_SUMMARY_ICON_ID;
    icon.title = "View Chart Summary";
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
      font-size: 22px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      cursor: pointer;
      z-index: 9999;
    `;
    icon.textContent = "📊";
    document.body.appendChild(icon);

    icon.addEventListener("click", () => {
      if (!isSummaryOpen) {
        const div = createSummaryDiv();
        div.style.display = "block";
        icon.style.display = "none";
        isSummaryOpen = true;
      }
    });

    return icon;
  }

  // ============================
  // 📋 Floating Div (Chart Summary)
  // ============================
  function createSummaryDiv() {
    const existing = document.getElementById(FLOATING_SUMMARY_DIV_ID);
    if (existing) return existing;

    const div = document.createElement("div");
    div.id = FLOATING_SUMMARY_DIV_ID;
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
        <h3 id="summaryTitle" style="margin:0; font-size:15px; color:#28a745;">Chart Summary</h3>
        <button id="closeSummaryDiv"
          style="background:#f33; color:#fff; border:none; border-radius:5px; cursor:pointer; padding:2px 6px;">
          ✕
        </button>
      </div>
      <div id="summaryContent" style="margin-top:10px;">Loading...</div>
    `;

    document.body.appendChild(div);

    document.getElementById("closeSummaryDiv").addEventListener("click", () => {
      div.style.display = "none";
      const icon = document.getElementById(FLOATING_SUMMARY_ICON_ID);
      if (icon) icon.style.display = "flex";
      isSummaryOpen = false;
    });

    return div;
  }

  // ============================
  // 🔍 Fetch Chart Details
  // ============================
  function fetchChartDetails(member_id, member_name) {
    const contentDiv = document.getElementById("chartContent");
    document.getElementById("chartTitle").textContent = `Chart Details - ${member_name}`;
    contentDiv.innerHTML = "<p>Loading...</p>";

    chrome.runtime.sendMessage(
      { action: "fetchChartDetails", payload: { member_id, member_name } },
      (response) => handleResponse(response, contentDiv)
    );
  }

  // ============================
  // 📊 Fetch Chart Summary
  // ============================
  function fetchChartSummary(member_id, member_name) {
    const contentDiv = document.getElementById("summaryContent");
    document.getElementById("summaryTitle").textContent = `Chart Summary - ${member_name}`;
    contentDiv.innerHTML = "<p>Loading...</p>";

    chrome.runtime.sendMessage(
      { action: "fetchChartSummary", payload: { member_id, member_name } },
      (response) => handleResponse(response, contentDiv)
    );
  }

  // ============================
  // 💡 Handle Response (Smart Renderer)
  // ============================
  function handleResponse(response, contentDiv) {
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
      return;
    }

    const data = response.data;
    if (!data) {
      contentDiv.innerHTML = `<p>No data available.</p>`;
      return;
    }

    const chart = data.api_response?.data;
    if (chart?.member && chart?.appointment) {
      const member = chart.member;
      const appt = chart.appointment;
      const codings = chart.coding || [];

      contentDiv.innerHTML = `
        <section style="margin-bottom:12px;">
          <h4 style="color:#007bff; margin:4px 0;">Patient Info</h4>
          <p><strong>Name:</strong> ${member.fname} ${member.lname}</p>
          <p><strong>DOB:</strong> ${member.DOB}</p>
          <p><strong>EMR Chart #:</strong> ${member.emr_chart_number}</p>
          <p><strong>PCP:</strong> ${member.pcp?.name || "N/A"}</p>
          <p><strong>Subscriber:</strong> ${member.subscriber}</p>
        </section>

        <section style="margin-bottom:12px;">
          <h4 style="color:#28a745; margin:4px 0;">Appointment Info</h4>
          <p><strong>Date of Service:</strong> ${new Date(appt.DOS).toLocaleDateString()}</p>
          <p><strong>Facility:</strong> ${appt.facility}</p>
        </section>

        <section>
          <h4 style="color:#6f42c1; margin:4px 0;">Coding Summary (${codings.length})</h4>
          ${
            codings.length
              ? codings
                  .map(
                    (c) => `
              <div style="border:1px solid #ddd; border-radius:6px; padding:6px; margin-bottom:8px;">
                <p><strong>Code:</strong> ${c.code} (${c.description})</p>
                <p><strong>Status:</strong> ${c.code_status}</p>
                <p><strong>Type:</strong> ${c.code_type}</p>
                <p><strong>Terminology:</strong> ${c.provider_terminology}</p>
                <p><strong>Rationale:</strong> ${c.rationale}</p>
                <p><strong>Confidence Score:</strong> ${c.confidence_score}/10</p>
              </div>`
                  )
                  .join("")
              : "<p>No coding data found.</p>"
          }
        </section>
      `;
      return;
    }

    // 🧾 Default Fallback → Pretty JSON
    contentDiv.innerHTML = `<pre style="white-space:pre-wrap; background:#f9f9f9; padding:8px; border-radius:6px;">${JSON.stringify(
      data,
      null,
      2
    )}</pre>`;
  }

  // ============================
  // 🧠 Auto Detect Patient Info
  // ============================
  function tryAutoLoad() {
    if (hasLoaded) return;

    const table = document.querySelector(TABLE_SELECTOR);
    const ul = document.querySelector(UL_SELECTOR);
    if (!table || !ul) return;

    const chartNumber = document.querySelector("#chartNumber")?.textContent?.trim();
    const patientName = document.querySelector("#patientName")?.textContent?.trim();

    if (chartNumber && patientName) {
      console.log(`🧩 Found patient: ${patientName} (${chartNumber})`);
      createFloatingIcon();
      createSummaryIcon();
      createFloatingDiv();
      createSummaryDiv();
      fetchChartDetails(chartNumber, patientName);
      fetchChartSummary(chartNumber, patientName);
      hasLoaded = true;
    }
  }

  observer = new MutationObserver(() => tryAutoLoad());
  observer.observe(document.body, { childList: true, subtree: true });

  tryAutoLoad();
})();
