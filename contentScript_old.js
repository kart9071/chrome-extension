(() => {
  const TABLE_SELECTOR = "#ctl00_MainContent_ucPatientDetail_dlPatient";
  const UL_SELECTOR = "#ulReadPatientDetail";
  const FLOATING_DIV_ID = "ct-floating-panel";
  const FLOATING_ICON_ID = "ct-floating-icon";

  let observer;
  let hasLoaded = false;
  let activeTab = "chart"; // or 'audit'

  console.log("🔍 CareTracker extension: auto chart + audit details loader running.");

  // =============================
  // 🧩 Create Floating Icon
  // =============================
  function createFloatingIcon() {
    if (document.getElementById(FLOATING_ICON_ID)) return;

    const icon = document.createElement("div");
    icon.id = FLOATING_ICON_ID;
    icon.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      width: 50px;
      height: 50px;
      background: #007bff;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.3);
      cursor: pointer;
      z-index: 9999;
      transition: transform 0.2s;
    `;
    icon.innerHTML = "📋";
    icon.title = "View Chart Details";

    icon.addEventListener("mouseenter", () => (icon.style.transform = "scale(1.1)"));
    icon.addEventListener("mouseleave", () => (icon.style.transform = "scale(1.0)"));

    icon.addEventListener("click", () => {
      const panel = document.getElementById(FLOATING_DIV_ID);
      if (panel) {
        panel.remove();
      } else {
        createFloatingPanel();
      }
    });

    document.body.appendChild(icon);
  }

  // =============================
  // 🧩 Create Floating Panel (UI)
  // =============================
  function createFloatingPanel() {
    const existing = document.getElementById(FLOATING_DIV_ID);
    if (existing) return existing;

    const div = document.createElement("div");
    div.id = FLOATING_DIV_ID;
    div.style.cssText = `
      position: fixed;
      top: 80px;
      right: 80px;
      width: 700px;
      max-height: 90vh;
      overflow-y: auto;
      background: #fff;
      border: 1px solid #ccc;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      border-radius: 10px;
      z-index: 10000;
      padding: 0;
      font-family: 'Segoe UI', sans-serif;
      font-size: 14px;
      color: #333;
      display: flex;
      flex-direction: column;
    `;

    div.innerHTML = `
      <div style="background:#007bff; color:#fff; padding:10px 15px; border-top-left-radius:10px; border-top-right-radius:10px; display:flex; justify-content:space-between; align-items:center;">
        <h3 id="ctTitle" style="margin:0; font-size:16px;">Chart & Audit Details</h3>
        <button id="ctCloseBtn" style="background:#f33; color:#fff; border:none; border-radius:5px; cursor:pointer; padding:2px 8px;">✕</button>
      </div>

      <div style="display:flex; background:#f8f9fa; border-bottom:1px solid #ccc;">
        <button id="chartTab" style="flex:1; padding:10px; border:none; background:#007bff; color:#fff; cursor:pointer;">Chart</button>
        <button id="auditTab" style="flex:1; padding:10px; border:none; background:#e9ecef; color:#333; cursor:pointer;">Audit</button>
      </div>

      <div id="ctContent" style="padding:15px;">Loading...</div>
    `;

    document.body.appendChild(div);

    // Event Listeners
    document.getElementById("ctCloseBtn").addEventListener("click", () => div.remove());
    document.getElementById("chartTab").addEventListener("click", () => switchTab("chart"));
    document.getElementById("auditTab").addEventListener("click", () => switchTab("audit"));

    return div;
  }

  // =============================
  // 🧭 Switch Tabs
  // =============================
  function switchTab(tab) {
    if (activeTab === tab) return;
    activeTab = tab;

    const chartBtn = document.getElementById("chartTab");
    const auditBtn = document.getElementById("auditTab");

    chartBtn.style.background = tab === "chart" ? "#007bff" : "#e9ecef";
    chartBtn.style.color = tab === "chart" ? "#fff" : "#333";
    auditBtn.style.background = tab === "audit" ? "#007bff" : "#e9ecef";
    auditBtn.style.color = tab === "audit" ? "#fff" : "#333";

    const chartNumber = document.querySelector("#chartNumber")?.textContent?.trim();
    const patientName = document.querySelector("#patientName")?.textContent?.trim();
    if (!chartNumber || !patientName) return;

    if (tab === "chart") {
      fetchChartDetails(chartNumber, patientName);
    } else {
      fetchAuditDetails(chartNumber, patientName);
    }
  }

  // =============================
  // 📡 Fetch Chart Details
  // =============================
  function fetchChartDetails(member_id, member_name) {
    const contentDiv = document.getElementById("ctContent");
    contentDiv.innerHTML = "<p>Loading chart details...</p>";

    chrome.runtime.sendMessage(
      { action: "fetchChartDetails", payload: { member_id, member_name } },
      (response) => {
        if (chrome.runtime.lastError)
          return (contentDiv.innerHTML = `<p style="color:red;">${chrome.runtime.lastError.message}</p>`);
        if (!response) return (contentDiv.innerHTML = `<p style="color:red;">No response from background.</p>`);
        if (response.error) return (contentDiv.innerHTML = `<p style="color:red;">❌ ${response.error}</p>`);

        const data = response.data;
        if (!data) return (contentDiv.innerHTML = `<p>No data available.</p>`);

        const patient = data.chart_response?.data?.member;
        const appt = data.chart_response?.data?.appointment;
        const conditions = data.chart_response?.data?.medical_conditions || [];

        let html = "";
        if (patient) {
          html += `
            <section>
              <h4>Patient Info</h4>
              <p><strong>Name:</strong> ${patient.fname} ${patient.lname}</p>
              <p><strong>DOB:</strong> ${patient.DOB}</p>
              <p><strong>EMR Chart #:</strong> ${patient.emr_chart_number}</p>
              <p><strong>PCP:</strong> ${patient.pcp?.name || "N/A"}</p>
            </section>`;
        }

        if (appt) {
          html += `
            <section>
              <h4>Appointment Info</h4>
              <p><strong>Date of Service:</strong> ${new Date(appt.DOS).toLocaleDateString()}</p>
              <p><strong>Facility:</strong> ${appt.facility}</p>
            </section>`;
        }

        if (conditions.length > 0) {
          html += `<section><h4>Medical Conditions</h4>`;
          conditions.forEach((cond) => {
            html += `
              <div style="margin-bottom:10px; border-bottom:1px solid #eee; padding-bottom:5px;">
                <p><strong>Condition:</strong> ${cond.condition_name}</p>
                <p><strong>ICD Code:</strong> ${cond.icd_code}</p>
                <p><strong>Clinical Indicators:</strong> ${cond.clinical_indicators}</p>
                <p><strong>Documentation:</strong> ${cond.documented_in}</p>
                <p><strong>Code Status:</strong> ${cond.code_status}</p>
                <p><strong>Code Explanation:</strong> ${cond.code_explanation}</p>
              </div>`;
          });
          html += `</section>`;
        }

        contentDiv.innerHTML = html || `<p>No chart data found.</p>`;
      }
    );
  }

  // =============================
  // 📡 Fetch Audit Details
  // =============================
  function fetchAuditDetails(member_id, member_name) {
    const contentDiv = document.getElementById("ctContent");
    contentDiv.innerHTML = "<p>Loading audit details...</p>";

    chrome.runtime.sendMessage(
      { action: "fetchAuditDetails", payload: { member_id, member_name } },
      (response) => {
        if (chrome.runtime.lastError)
          return (contentDiv.innerHTML = `<p style="color:red;">${chrome.runtime.lastError.message}</p>`);
        if (!response) return (contentDiv.innerHTML = `<p style="color:red;">No response from background.</p>`);
        if (response.error) return (contentDiv.innerHTML = `<p style="color:red;">❌ ${response.error}</p>`);

        const data = response.data;
        if (!data) return (contentDiv.innerHTML = `<p>No data available.</p>`);

        const audits = data.audit_response?.data || [];
        let html = "<h4>Audit Details</h4>";

        if (audits.length === 0) {
          html += `<p>No audit data found.</p>`;
        } else {
          html += `<table style="width:100%; border-collapse:collapse;">
            <tr style="background:#007bff; color:#fff;">
              <th style="padding:6px; text-align:left;">Date</th>
              <th style="padding:6px; text-align:left;">User</th>
              <th style="padding:6px; text-align:left;">Action</th>
            </tr>`;
          audits.forEach((row) => {
            html += `
              <tr style="border-bottom:1px solid #ddd;">
                <td style="padding:6px;">${row.date}</td>
                <td style="padding:6px;">${row.user}</td>
                <td style="padding:6px;">${row.action}</td>
              </tr>`;
          });
          html += `</table>`;
        }

        contentDiv.innerHTML = html;
      }
    );
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
      createFloatingIcon();
      hasLoaded = true;
    }
  }

  // Observe DOM changes
  observer = new MutationObserver(() => tryAutoLoad());
  observer.observe(document.body, { childList: true, subtree: true });

  tryAutoLoad();
})();
