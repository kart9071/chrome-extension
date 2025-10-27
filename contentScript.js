(() => {
  const TABLE_SELECTOR = "#ctl00_MainContent_ucPatientDetail_dlPatient";
  const UL_SELECTOR = "#ulReadPatientDetail";
  const FLOATING_DIV_ID_1 = "ct-chart-floating-1";
  const FLOATING_DIV_ID_2 = "ct-chart-floating-2";
  const FLOATING_ICON_ID_1 = "ct-chart-icon-1";
  const FLOATING_ICON_ID_2 = "ct-chart-icon-2";

  let observer;
  let hasLoaded = false;
  let isOpen1 = false;
  let isOpen2 = false;

  console.log("🔍 CareTracker extension: dual chart details icon loader running.");

  // ==============================
  // 🩺 Create Floating Icon 1 (Chart Details)
  // ==============================
  function createFloatingIcon1() {
    const existing = document.getElementById(FLOATING_ICON_ID_1);
    if (existing) return existing;

    const icon = document.createElement("div");
    icon.id = FLOATING_ICON_ID_1;
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
      if (!isOpen1) {
        const div = createFloatingDiv1();
        div.style.display = "block";
        icon.style.display = "none";
        isOpen1 = true;
      }
    });

    return icon;
  }

  // ==============================
  // 📋 Create Floating Icon 2 (Audit Details)
  // ==============================
  function createFloatingIcon2() {
    const existing = document.getElementById(FLOATING_ICON_ID_2);
    if (existing) return existing;

    const icon = document.createElement("div");
    icon.id = FLOATING_ICON_ID_2;
    icon.title = "View Audit Details";
    icon.style.cssText = `
      position: fixed;
      top: 150px;
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
    icon.textContent = "📋";
    document.body.appendChild(icon);

    icon.addEventListener("click", () => {
      if (!isOpen2) {
        const div = createFloatingDiv2();
        div.style.display = "block";
        icon.style.display = "none";
        isOpen2 = true;
      }
    });

    return icon;
  }

  // ==============================
  // 🩺 Floating Div 1 (Chart Details)
  // ==============================
  function createFloatingDiv1() {
    const existing = document.getElementById(FLOATING_DIV_ID_1);
    if (existing) return existing;

    const div = document.createElement("div");
    div.id = FLOATING_DIV_ID_1;
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
        <h3 id="chartTitle1" style="margin:0; font-size:15px; color:#007bff;">Chart Details</h3>
        <button id="closeChartDiv1" 
          style="background:#f33; color:#fff; border:none; border-radius:5px; cursor:pointer; padding:2px 6px;">
          ✕
        </button>
      </div>
      <div id="chartContent1" style="margin-top:10px;">Loading...</div>
    `;

    document.body.appendChild(div);

    document.getElementById("closeChartDiv1").addEventListener("click", () => {
      div.style.display = "none";
      const icon = document.getElementById(FLOATING_ICON_ID_1);
      if (icon) icon.style.display = "flex";
      isOpen1 = false;
    });

    return div;
  }

  // ==============================
  // 📋 Floating Div 2 (Audit Details)
  // ==============================
  function createFloatingDiv2() {
    const existing = document.getElementById(FLOATING_DIV_ID_2);
    if (existing) return existing;

    const div = document.createElement("div");
    div.id = FLOATING_DIV_ID_2;
    div.style.cssText = `
      position: fixed;
      top: 80px;
      right: 690px;
      width: 600px;
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
        <h3 id="chartTitle2" style="margin:0; font-size:15px; color:#28a745;">Audit Details</h3>
        <button id="closeChartDiv2" 
          style="background:#f33; color:#fff; border:none; border-radius:5px; cursor:pointer; padding:2px 6px;">
          ✕
        </button>
      </div>
      <div id="chartContent2" style="margin-top:10px;">Loading...</div>
    `;

    document.body.appendChild(div);

    document.getElementById("closeChartDiv2").addEventListener("click", () => {
      div.style.display = "none";
      const icon = document.getElementById(FLOATING_ICON_ID_2);
      if (icon) icon.style.display = "flex";
      isOpen2 = false;
    });

    return div;
  }

  // ==============================
  // 🧩 Fetch Chart Details API (existing)
  // ==============================
  function fetchChartDetails(member_id, member_name) {
    const contentDiv = document.getElementById("chartContent1");
    document.getElementById("chartTitle1").textContent = `Chart Details - ${member_name}`;
    contentDiv.innerHTML = "<p>Loading...</p>";

    chrome.runtime.sendMessage(
      { action: "fetchChartDetails", payload: { member_id, member_name } },
      (response) => handleChartResponse(response, contentDiv)
    );
  }

  // ==============================
  // 📋 Fetch Audit Details API (new)
  // ==============================
  function fetchAuditDetails(member_id, member_name) {
    const contentDiv = document.getElementById("chartContent2");
    document.getElementById("chartTitle2").textContent = `Audit Details - ${member_name}`;
    contentDiv.innerHTML = "<p>Loading...</p>";

    chrome.runtime.sendMessage(
      { action: "fetchAuditDetails", payload: { member_id, member_name } },
      (response) => {
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
          contentDiv.innerHTML = `<p>No audit details available.</p>`;
          return;
        }

        contentDiv.innerHTML = `
          <p><strong>Audit ID:</strong> ${data.audit_id || "N/A"}</p>
          <p><strong>Status:</strong> ${data.status || "Pending"}</p>
          <p><strong>Reviewed By:</strong> ${data.reviewer || "Unknown"}</p>
          <p><strong>Notes:</strong> ${data.notes || "—"}</p>
        `;
      }
    );
  }

  // ==============================
  // 📦 Handle Chart API Response
  // ==============================
  function handleChartResponse(response, contentDiv) {
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
      contentDiv.innerHTML = `<p>No chart details available.</p>`;
      return;
    }

    // 🩺 Patient Info
    const patient = data.chart_response?.data?.member;
    if (patient) {
      const section = document.createElement("section");
      section.innerHTML = `
        <h4>Patient Info</h4>
        <p><strong>Name:</strong> ${patient.fname} ${patient.lname}</p>
        <p><strong>DOB:</strong> ${patient.DOB}</p>
        <p><strong>EMR Chart #:</strong> ${patient.emr_chart_number}</p>
        <p><strong>PCP:</strong> ${patient.pcp?.name || "N/A"}</p>
      `;
      contentDiv.appendChild(section);
    }

    // 🗓️ Appointment Info
    const appt = data.chart_response?.data?.appointment;
    if (appt) {
      const section = document.createElement("section");
      section.innerHTML = `
        <h4>Appointment Info</h4>
        <p><strong>Date of Service:</strong> ${new Date(appt.DOS).toLocaleDateString()}</p>
        <p><strong>Facility:</strong> ${appt.facility}</p>
      `;
      contentDiv.appendChild(section);
    }

    // 📋 Medical Conditions
    const conditions = data.chart_response?.data?.medical_conditions || [];
    if (conditions.length > 0) {
      const section = document.createElement("section");
      section.innerHTML = `<h4>Medical Conditions</h4>`;
      conditions.forEach((cond) => {
        const div = document.createElement("div");
        div.className = "medical-condition";
        div.style.marginBottom = "10px";
        div.innerHTML = `
          <p><strong>Condition:</strong> ${cond.condition_name}</p>
          <p><strong>ICD Code:</strong> ${cond.icd_code}</p>
          <p><strong>Clinical Indicators:</strong> ${cond.clinical_indicators}</p>
          <p><strong>Documentation:</strong> ${cond.documented_in}</p>
          <p><strong>Code Status:</strong> ${cond.code_status}</p>
          <p><strong>Code Explanation:</strong> ${cond.code_explanation}</p>
        `;
        section.appendChild(div);
      });
      contentDiv.appendChild(section);
    }
  }

  // ==============================
  // 🔍 Auto-Detect and Load
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
      createFloatingDiv1();
      createFloatingIcon2();
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
