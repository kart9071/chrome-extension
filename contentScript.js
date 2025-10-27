(() => {
  const AUDIT_ICON_ID = "ct-audit-icon";
  const AUDIT_DIV_ID = "ct-audit-floating";

  let isAuditOpen = false;

  console.log("🧾 CareTracker extension: audit details icon loader running.");

  // =============================
  // Create Audit Floating Icon
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

        // Fetch Audit Details
        const chartNumber = document.querySelector("#chartNumber")?.textContent?.trim();
        if (chartNumber) {
          fetchAuditDetails(chartNumber);
        }
      }
    });

    return icon;
  }

  // =============================
  // Create Audit Floating Div
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
  // Fetch Audit Details via Service Worker
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

        // 🩺 Member Info
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

        // 📋 Coding Info
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
  // Auto-Initialize Icon when Patient Detected
  // =============================
  function tryAutoLoadAuditIcon() {
    const table = document.querySelector("#ctl00_MainContent_ucPatientDetail_dlPatient");
    const ul = document.querySelector("#ulReadPatientDetail");
    if (!table || !ul) return;

    const chartNumber = document.querySelector("#chartNumber")?.textContent?.trim();
    if (chartNumber) {
      createAuditIcon();
    }
  }

  const observer = new MutationObserver(() => tryAutoLoadAuditIcon());
  observer.observe(document.body, { childList: true, subtree: true });
  tryAutoLoadAuditIcon();
})();
