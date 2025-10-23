(() => {
  const TABLE_SELECTOR = "#ctl00_MainContent_ucPatientDetail_dlPatient";
  const UL_SELECTOR = "#ulReadPatientDetail";
  const BUTTON_ID = "ct-chart-details-btn";

  let observer;
  let checkInterval;

  console.log("🔍 CareTracker Extension content script loaded.");

  // =========================
  // Create the button
  // =========================
  function createButton(patientName, chartNumber) {
    const btn = document.createElement("button");
    btn.id = BUTTON_ID;
    btn.innerText = patientName || "Unknown Patient";
    btn.title = `Chart #: ${chartNumber || "N/A"}`;
    btn.style.cssText = `
      padding: 4px 8px;
      border: 1px solid #007bff;
      border-radius: 5px;
      background: #fff;
      cursor: pointer;
      font-size: 12px;
      color: #007bff;
      transition: all 0.2s ease-in-out;
    `;
    btn.addEventListener("mouseover", () => {
      btn.style.background = "#007bff";
      btn.style.color = "#fff";
    });
    btn.addEventListener("mouseout", () => {
      btn.style.background = "#fff";
      btn.style.color = "#007bff";
    });

    btn.addEventListener("click", async () => {
      console.log(`✅ Button clicked for ${patientName} (Chart #: ${chartNumber})`);

      if (!chartNumber || !patientName) {
        alert("⚠️ Missing chart number or patient name!");
        return;
      }

      // Open new tab immediately
      const newTab = window.open("", "_blank");
      if (!newTab) {
        alert("⚠️ Popup blocked! Please allow popups for this site.");
        return;
      }

      newTab.document.write(`
        <html>
          <body style="font-family: Arial; padding: 40px; text-align:center;">
            <h2>Fetching chart details for ${patientName}...</h2>
          </body>
        </html>
      `);
      newTab.document.close();

      // Fetch API with timeout (15s)
      const TIMEOUT_MS = 15000;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      try {
        const response = await fetch(
          "https://h4xqr89uik.execute-api.us-east-1.amazonaws.com/prod/",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ member_id: chartNumber, member_name: patientName }),
            signal: controller.signal
          }
        );

        clearTimeout(timeoutId);

        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        const data = await response.json();
        console.log("API Response:", data);

        updateNewTab(newTab, data);

      } catch (error) {
        clearTimeout(timeoutId);
        console.error("❌ Error fetching chart details:", error);

        if (error.name === "AbortError") {
          newTab.document.body.innerHTML = `<p style="color:red;">Request timed out after ${TIMEOUT_MS / 1000} seconds.</p>`;
        } else {
          newTab.document.body.innerHTML = `<p style="color:red;">Failed to fetch chart details: ${error.message}</p>`;
        }
      }
    });

    return btn;
  }

  // =========================
  // Inject button inside UL
  // =========================
  function injectButton() {
    const table = document.querySelector(TABLE_SELECTOR);
    const ul = document.querySelector(UL_SELECTOR);
    if (!table || !ul) return;
    if (document.getElementById(BUTTON_ID)) return;

    const chartNumber = document.querySelector("#chartNumber")?.textContent?.trim() || "";
    const patientName = document.querySelector("#patientName")?.textContent?.trim() || "";

    const li = document.createElement("li");
    li.innerHTML = `<label style="margin-right:6px;">Chart Details:</label>`;
    const btn = createButton(patientName, chartNumber);
    const span = document.createElement("span");
    span.appendChild(btn);
    li.appendChild(span);

    ul.appendChild(li);
    console.log("✅ Button injected inside <ul> successfully!");
  }

  // =========================
  // Update the opened tab
  // =========================
  function updateNewTab(newTab, data) {
    const { member_id, member_name, appointment, chart_response } = data;
    const chartData = chart_response?.data || {};
    const medicalConditions = chartData?.medical_conditions || [];

    const html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Chart Details - ${member_name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin:0; padding:20px; background:#f9f9f9; }
            .container { max-width:900px; margin:0 auto; background:#fff; padding:20px; border-radius:10px; box-shadow:0 4px 10px rgba(0,0,0,0.1);}
            h2 { color:#007bff; text-align:center; }
            table { width:100%; border-collapse:collapse; margin-top:15px;}
            th, td { border:1px solid #ddd; padding:8px; text-align:left; }
            th { background:#007bff; color:#fff; }
            tr:nth-child(even) { background:#f2f2f2; }
            button { margin-top:20px; padding:8px 16px; background:#007bff; color:#fff; border:none; border-radius:5px; cursor:pointer; }
            button:hover { background:#0056b3; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Chart Details - ${member_name}</h2>
            <p><strong>Chart #: </strong>${member_id || "N/A"}</p>
            <p><strong>Appointment DOS: </strong>${appointment?.dos || "N/A"}</p>

            <h3>Medical Conditions</h3>
            <table>
              <thead>
                <tr>
                  <th>Condition Name</th>
                  <th>Diagnosis</th>
                  <th>ICD Code</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${medicalConditions.map(mc => `
                  <tr>
                    <td>${mc.condition_name || ""}</td>
                    <td>${mc.diagnosis || ""}</td>
                    <td>${mc.icd_code || ""}</td>
                    <td>${mc.code_status || ""}</td>
                  </tr>`).join("")}
              </tbody>
            </table>

            <button id="closeBtn">Close</button>
          </div>
          <script>
            document.getElementById("closeBtn").addEventListener("click", () => window.close());
          </script>
        </body>
      </html>
    `;

    newTab.document.open();
    newTab.document.write(html);
    newTab.document.close();
    console.log("✅ Updated new tab with chart details.");
  }

  // =========================
  // Start monitoring
  // =========================
  function stopMonitoring() {
    if (observer) observer.disconnect();
    if (checkInterval) clearInterval(checkInterval);
  }

  function startMonitoring() {
    stopMonitoring();
    observer = new MutationObserver(() => injectButton());
    observer.observe(document.body, { childList: true, subtree: true });
    checkInterval = setInterval(() => injectButton(), 5000);
  }

  startMonitoring();
})();
