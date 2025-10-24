(() => {
  const TABLE_SELECTOR = "#ctl00_MainContent_ucPatientDetail_dlPatient";
  const UL_SELECTOR = "#ulReadPatientDetail";
  const FLOATING_DIV_ID = "ct-chart-floating";

  let observer;
  let hasLoaded = false;

  console.log("🔍 CareTracker extension: auto chart details loader running.");

  // 🧩 Create floating div
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
    `;

    div.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <h3 id="chartTitle" style="margin:0; font-size:15px; color:#007bff;">Chart Details</h3>
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

  // 🧩 Fetch chart details from background
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

        // Clear loading
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

  // 🧩 Detect patient info and trigger automatically
  function tryAutoLoad() {
    if (hasLoaded) return;

    const table = document.querySelector(TABLE_SELECTOR);
    const ul = document.querySelector(UL_SELECTOR);
    if (!table || !ul) return;

    const chartNumber = document.querySelector("#chartNumber")?.textContent?.trim();
    const patientName = document.querySelector("#patientName")?.textContent?.trim();

    if (chartNumber && patientName) {
      console.log(`🧩 Found patient: ${patientName} (${chartNumber})`);
      const div = createFloatingDiv();
      fetchChartDetails(chartNumber, patientName);
      hasLoaded = true;
    }
  }

  // 🧠 Observe DOM changes
  observer = new MutationObserver(() => tryAutoLoad());
  observer.observe(document.body, { childList: true, subtree: true });

  // Try once immediately
  tryAutoLoad();
})();
