(() => {
  const TABLE_SELECTOR = "#ctl00_MainContent_ucPatientDetail_dlPatient";
  const UL_SELECTOR = "#ulReadPatientDetail";
  const FLOATING_DIV_ID = "ct-chart-floating";

  let observer;
  let hasLoaded = false;
  let retryCount = 0;

  console.log("🔍 CareTracker extension: chart + audit loader running.");

  // 🧩 Floating UI
  function createFloatingDiv() {
    const existing = document.getElementById(FLOATING_DIV_ID);
    if (existing) return existing;

    const div = document.createElement("div");
    div.id = FLOATING_DIV_ID;
    div.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      width: 700px;
      max-height: 90vh;
      overflow-y: auto;
      background: #fff;
      border: 1px solid #ccc;
      box-shadow: 0 4px 12px rgba(0,0,0,0.25);
      border-radius: 10px;
      z-index: 9999;
      padding: 12px;
      font-family: Arial, sans-serif;
      font-size: 13px;
      color: #333;
    `;

    div.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <h3 id="chartTitle" style="margin:0; font-size:15px; color:#007bff;">Chart & Audit Details</h3>
        <button id="closeChartDiv" style="background:#f33; color:#fff; border:none; border-radius:5px; cursor:pointer; padding:2px 6px;">✕</button>
      </div>
      <div id="chartContent" style="margin-top:10px;">Loading...</div>
    `;

    document.body.appendChild(div);
    document.getElementById("closeChartDiv").addEventListener("click", () => {
      div.remove();
      hasLoaded = false;
    });

    return div;
  }

  // 🧩 Fetch both APIs through service worker
  async function fetchData(member_id, member_name) {
    const contentDiv = document.getElementById("chartContent");
    contentDiv.innerHTML = `<p>Fetching chart and audit data...</p>`;

    // Helper to wrap a message call in a promise
    const callBackground = (action) =>
      new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
          { action, payload: { member_id, member_name } },
          (response) => {
            if (chrome.runtime.lastError)
              return reject(chrome.runtime.lastError.message);
            if (!response)
              return reject("No response from background script.");
            if (response.error)
              return reject(response.error);
            resolve(response.data);
          }
        );
      });

    try {
      const [chartData, auditData] = await Promise.allSettled([
        callBackground("fetchChartDetails"),
        callBackground("fetchAuditDetails"),
      ]);

      contentDiv.innerHTML = "";

      // 🩺 Chart Data
      if (chartData.status === "fulfilled" && chartData.value) {
        renderChartSection(contentDiv, chartData.value);
      } else {
        contentDiv.innerHTML += `<p style="color:red;">❌ Chart API failed: ${chartData.reason}</p>`;
      }

      // 🧾 Audit Data
      if (auditData.status === "fulfilled" && auditData.value) {
        renderAuditSection(contentDiv, auditData.value);
      } else {
        contentDiv.innerHTML += `<p style="color:red;">❌ Audit API failed: ${auditData.reason}</p>`;
      }
    } catch (err) {
      contentDiv.innerHTML = `<p style="color:red;">❌ Error: ${err}</p>`;
    }
  }

  // =====================
  // 🩺 Render Chart Details
  // =====================
  function renderChartSection(container, data) {
    const patient = data.chart_response?.data?.member;
    const appt = data.chart_response?.data?.appointment;
    const conditions = data.chart_response?.data?.medical_conditions || [];

    const section = document.createElement("section");
    section.style.marginBottom = "16px";
    section.innerHTML = `<h4 style="color:#007bff;">📋 Chart Details</h4>`;

    if (patient) {
      section.innerHTML += `
        <p><strong>Name:</strong> ${patient.fname} ${patient.lname}</p>
        <p><strong>DOB:</strong> ${patient.DOB}</p>
        <p><strong>EMR Chart #:</strong> ${patient.emr_chart_number}</p>
        <p><strong>PCP:</strong> ${patient.pcp?.name || "N/A"}</p>
      `;
    }

    if (appt) {
      section.innerHTML += `
        <p><strong>Date of Service:</strong> ${new Date(appt.DOS).toLocaleDateString()}</p>
        <p><strong>Facility:</strong> ${appt.facility}</p>
      `;
    }

    if (conditions.length > 0) {
      const condDiv = document.createElement("div");
      condDiv.innerHTML = `<h5>Medical Conditions</h5>`;
      conditions.forEach((c) => {
        condDiv.innerHTML += `
          <div style="margin-bottom:10px; padding:8px; border-left:3px solid #007bff; background:#f9f9f9;">
            <p><strong>${c.condition_name}</strong> (${c.icd_code})</p>
            <p><em>${c.code_status}</em></p>
            <p>${c.clinical_indicators}</p>
            <p><strong>Docs:</strong> ${c.documented_in}</p>
          </div>
        `;
      });
      section.appendChild(condDiv);
    }

    container.appendChild(section);
  }

  // =====================
  // 🧾 Render Audit Details
  // =====================
  function renderAuditSection(container, data) {
    const chart = data.api_response?.data;
    const codes = chart?.coding || [];

    const section = document.createElement("section");
    section.style.marginBottom = "16px";
    section.innerHTML = `<h4 style="color:#28a745;">🧾 Audit Details</h4>`;

    if (chart?.member) {
      section.innerHTML += `
        <p><strong>Patient:</strong> ${chart.member.fname} ${chart.member.lname}</p>
        <p><strong>DOB:</strong> ${chart.member.DOB}</p>
        <p><strong>Facility:</strong> ${chart.appointment?.facility}</p>
        <p><strong>DOS:</strong> ${new Date(chart.appointment?.DOS).toLocaleDateString()}</p>
      `;
    }

    if (codes.length > 0) {
      const codeDiv = document.createElement("div");
      codeDiv.innerHTML = `<h5>Approved Codes</h5>`;
      codes.forEach((c) => {
        codeDiv.innerHTML += `
          <div style="margin-bottom:8px; padding:6px; border-left:3px solid #28a745; background:#f6fff7;">
            <p><strong>${c.code}</strong> - ${c.description}</p>
            <p><strong>Status:</strong> ${c.code_status}</p>
            <p><strong>Rationale:</strong> ${c.rationale}</p>
          </div>
        `;
      });
      section.appendChild(codeDiv);
    }

    container.appendChild(section);
  }

  // =====================
  // 🔍 Auto Trigger
  // =====================
  function tryAutoLoad() {
    if (hasLoaded) return;

    const table = document.querySelector(TABLE_SELECTOR);
    const ul = document.querySelector(UL_SELECTOR);
    if (!table || !ul) return;

    const member_id = document.querySelector("#chartNumber")?.textContent?.trim();
    const member_name = document.querySelector("#patientName")?.textContent?.trim();

    if (member_id && member_name) {
      console.log(`🧩 Found patient: ${member_name} (${member_id})`);
      createFloatingDiv();
      fetchData(member_id, member_name);
      hasLoaded = true;
    } else if (retryCount < 3) {
      retryCount++;
      console.warn(`⏳ Retrying to find patient info (${retryCount}/3)...`);
      setTimeout(tryAutoLoad, 1000);
    }
  }

  observer = new MutationObserver(() => tryAutoLoad());
  observer.observe(document.body, { childList: true, subtree: true });

  tryAutoLoad();
})();
