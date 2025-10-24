(() => {
  const TABLE_SELECTOR = "#ctl00_MainContent_ucPatientDetail_dlPatient";
  const UL_SELECTOR = "#ulReadPatientDetail";
  const BUTTON_ID = "ct-chart-details-btn";

  let observer;
  let checkInterval;

  console.log("🔍 Local CareTracker extension loaded.");

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
      const member_id = chartNumber || prompt("Enter member_id:", "");
      const member_name = patientName || prompt("Enter patient_name:", "");

      if (!member_id || !member_name) {
        alert("⚠️ Both member_id and patient_name are required!");
        return;
      }

      // Open new tab immediately
      const newTab = window.open("", "_blank");
      if (!newTab) {
        alert("⚠️ Popup blocked! Please allow popups.");
        return;
      }

      // Create skeleton for new tab
      const doc = newTab.document;
      doc.head.innerHTML = `
        <meta charset="UTF-8">
        <title>Chart Details</title>
        <style>
          body { font-family: Arial, sans-serif; margin:0; padding:20px; background:#f9f9f9; }
          .container { max-width:900px; margin:0 auto; background:#fff; padding:20px; border-radius:10px; box-shadow:0 4px 10px rgba(0,0,0,0.1);}
          h2 { color:#007bff; text-align:center; }
          pre { background:#f4f4f4; padding:15px; border-radius:5px; overflow:auto; }
          button { margin-top:20px; padding:8px 16px; background:#007bff; color:#fff; border:none; border-radius:5px; cursor:pointer; display:block; margin-left:auto; margin-right:auto; }
          button:hover { background:#0056b3; }
        </style>
      `;
      doc.body.innerHTML = `<h2 style="text-align:center;">Fetching chart details for ${member_name}...</h2>`;

      try {
        const response = await fetch(
          "https://h4xqr89uik.execute-api.us-east-1.amazonaws.com/dev/", // replace with prod if needed
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ member_id, member_name })
          }
        );

        if (!response.ok) throw new Error(`Server returned ${response.status}`);
        const data = await response.json();
        console.log("✅ API Response:", data);

        // Update new tab DOM directly
        doc.body.innerHTML = ""; // clear previous content
        const container = doc.createElement("div");
        container.className = "container";

        const h2 = doc.createElement("h2");
        h2.textContent = `Chart Details - ${member_name}`;
        container.appendChild(h2);

        const pre = doc.createElement("pre");
        pre.textContent = JSON.stringify(data, null, 2);
        container.appendChild(pre);

        const closeBtn = doc.createElement("button");
        closeBtn.textContent = "Close";
        closeBtn.addEventListener("click", () => newTab.close());
        container.appendChild(closeBtn);

        doc.body.appendChild(container);

      } catch (error) {
        console.error("❌ Error fetching chart details:", error);
        doc.body.innerHTML = `<p style="color:red;">Failed to fetch chart details: ${error.message}</p>`;
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

    const chartNumber =
      document.querySelector("#chartNumber")?.textContent?.trim() || "";
    const patientName =
      document.querySelector("#patientName")?.textContent?.trim() || "";

    const li = document.createElement("li");
    li.innerHTML = `<label style="margin-right:6px;">Chart Details:</label>`;
    const btn = createButton(patientName, chartNumber);
    const span = document.createElement("span");
    span.appendChild(btn);
    li.appendChild(span);

    ul.appendChild(li);
    console.log("✅ Button injected successfully!");
  }

  // =========================
  // Start monitoring DOM
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
