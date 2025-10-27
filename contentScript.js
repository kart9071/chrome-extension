(() => {
  const TABLE_SELECTOR = "#ctl00_MainContent_ucPatientDetail_dlPatient";
  const UL_SELECTOR = "#ulReadPatientDetail";
  const FLOATING_DIV_ID = "ct-chart-floating";
  const FLOATING_ICON_ID = "ct-chart-icon";
  const AUDIT_ICON_ID = "ct-audit-icon";
  const AUDIT_DIV_ID = "ct-audit-floating";

  let observer;
  let hasLoaded = false;
  let isOpen = false;
  let isAuditOpen = false;

  console.log("🔍 CareTracker extension: auto chart & audit details icon loader running.");

  // =============================
  // 🩺 Create Chart Details Icon
  // =============================
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

  // =============================
  // 🩺 Chart Details Panel
  // =============================
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

  // =============================
  // 🩺 Fetch Chart Details
  // =============================
  function fetchChartDetails(member_id, member_name) {
    const contentDiv = document.getElementById("chartContent");
    document.getElementById("chartTitle").textContent = `Chart Details - ${member_name}`;
    contentDiv.innerHTML = "<p>Loading...</p>";

    chrome.runtime.sendMessage(
      { action: "fetchChartDetails", payload: { member_id, member_name } },
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
          contentDiv.innerHTML = `<p>No chart details available.</p>`;
          return;
        }

        contentDiv.innerHTML = "";

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
    );
  }

  // =============================
  // 🧾 Create Audit Icon
  // =============================
  function createAuditIcon() {
    const existing = document.getElementById(AUDIT_ICON_ID);
    if (existing) return existing;

    const icon = document.createElement("div");
    icon.id = AUDIT_ICON_ID;
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
      font-size: 22px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      cursor: pointer;
      z-index: 9999;
    `;
    icon.textContent = "🧾";
    document.body.appendChild(icon);

    icon.addEventListener("click", () => {
      if (!isAuditOpen) {
        const div = createAuditDiv();
        div.style.display = "block";
        icon.style.display = "none";
        isAuditOpen = true;

        const chartNumber = document.querySelector("#chartNumber")?.textContent?.trim();
        if (chartNumber) fetchAuditDetails(chartNumber);
      }
    });

    return icon;
  }

  // =============================
  // 🧾 Audit Details Panel
  // =============================
  function createAuditDiv() {
    const existing = document.getElementById(AUDIT_DIV_ID);
    if (existing) return existing;

    const div = document.createElement("div");
    div.id = AUDIT_DIV_ID;
    div.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      width: 700px;
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
      const icon = document.getElementById(AUDIT_ICON_ID);
      if (icon) icon.style.display = "flex";
      isAuditOpen = false;
    });

    return div;
  }

  // =============================
  // 🧾 Fetch Audit Details
  // =============================
  function fetchAuditDetails(member_id) {
    const contentDiv = document.getElementById("auditContent");
    document.getElementById("auditTitle").textContent = `Audit Details - ${member_id}`;
    contentDiv.innerHTML = "<p>Loading audit data...</p>";

    chrome.runtime.sendMessage(
      { action: "fetchAuditDetails", payload: { member_id } },
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

        const data = response.data?.api_response?.data;
        if (!data) {
          contentDiv.innerHTML = `<p>No audit details available.</p>`;
          return;
        }

        contentDiv.innerHTML = "";

        const member = data.member;
        const appt = data.appointment;

        if (member) {
          const section = document.createElement("section");
          section.innerHTML = `
            <h4>Patient Info</h4>
            <p><strong>Name:</strong> ${member.fname} ${member.lname}</p>
            <p><strong>DOB:</strong> ${member.DOB}</p>
            <p><strong>EMR Chart #:</strong> ${member.emr_chart_number}</p>
            <p><strong>Subscriber:</strong> ${member.subscriber}</p>
            <p><strong>PCP:</strong> ${member.pcp?.name || "N/A"}</p>
          `;
          contentDiv.appendChild(section);
        }

        if (appt) {
          const section = document.createElement("section");
          section.innerHTML = `
            <h4>Appointment Info</h4>
            <p><strong>Date of Service:</strong> ${new Date(appt.DOS).toLocaleDateString()}</p>
            <p><strong>Facility:</strong> ${appt.facility}</p>
          `;
          contentDiv.appendChild(section);
        }

        const coding = data.coding || [];
        if (coding.length > 0) {
          const section = document.createElement("section");
          section.innerHTML = `<h4>Audit Coding Details</h4>`;
          coding.forEach((item) => {
            const div = document.createElement("div");
            div.style.marginBottom = "12px";
            div.innerHTML = `
              <p><strong>Code:</strong> ${item.code} (${item.code_type})</p>
              <p><strong>Description:</strong> ${item.description}</p>
              <p><strong>Status:</strong> ${item.code_status}</p>
              <p><strong>Provider Term:</strong> ${item.provider_terminology}</p>
              <p><strong>Rationale:</strong> ${item.rationale}</p>
              <p><strong>Confidence Score:</strong> ${item.confidence_score}</p>
            `;
            section.appendChild(div);
          });
          contentDiv.appendChild(section);
        }
      }
    );
  }

  // =============================
  // Auto-Load Icons
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
      createFloatingDiv();
      createAuditIcon();
      createAuditDiv();
      fetchChartDetails(chartNumber, patientName);
      hasLoaded = true;
    }
  }

  observer = new MutationObserver(() => tryAutoLoad());
  observer.observe(document.body, { childList: true, subtree: true });
  tryAutoLoad();
})();
