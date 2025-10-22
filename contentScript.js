(() => {
  const TABLE_SELECTOR = "#ctl00_MainContent_ucPatientDetail_dlPatient";
  const UL_SELECTOR = "#ulReadPatientDetail";
  const BUTTON_ID = "ct-chart-details-btn";
  const FLOATING_DIV_ID = "chartDetailsFloatingDiv";
  const FLOATING_CONTAINER_ID = "chartDetailsContainer";
  let observer;
  let checkInterval;

  console.log("🔍 CareTracker Extension content script loaded.");

  function createButton(patientName, chartNumber) {
    console.log("🧩 Creating Chart Details button...");
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
    btn.addEventListener("click", () => {
      console.log(`✅ Button clicked for ${patientName} (Chart #: ${chartNumber})`);
      showFloatingDiv(patientName, chartNumber);
      stopMonitoring(); // Stop checking for the button once clicked
    });
    return btn;
  }

  function injectButton() {
    console.log("🔎 Checking for table:", TABLE_SELECTOR);
    const table = document.querySelector(TABLE_SELECTOR);
    const ul = document.querySelector(UL_SELECTOR);

    if (!table || !ul) {
      console.log("⚠️ Table or UL not found yet. Will retry.");
      return;
    }

    if (document.getElementById(BUTTON_ID)) {
      console.log("⚠️ Button already injected, skipping.");
      return;
    }

    const chartNumber = document.querySelector("#chartNumber")?.textContent?.trim() || "";
    const patientName = document.querySelector("#patientName")?.textContent?.trim() || "";

    console.log("✅ Data fetched:", { chartNumber, patientName });

    const li = document.createElement("li");
    li.innerHTML = `<label style="margin-right:6px;">Chart Details:</label>`;
    const btn = createButton(patientName, chartNumber);
    const span = document.createElement("span");
    span.appendChild(btn);
    li.appendChild(span);

    ul.appendChild(li);
    console.log("🎉 Button injected inside <ul> as new <li> successfully!");
  }

  function showFloatingDiv(patientName, chartNumber) {
    // Create or get persistent container outside the dynamic body
    let container = document.getElementById(FLOATING_CONTAINER_ID);
    if (!container) {
      container = document.createElement("div");
      container.id = FLOATING_CONTAINER_ID;
      container.style.cssText = `
        position: relative;
        z-index: 9999;
      `;
      document.documentElement.appendChild(container);
      console.log("📦 Created persistent floating div container.");
    }

    // If div already exists, skip recreating
    const existingDiv = document.getElementById(FLOATING_DIV_ID);
    if (existingDiv) {
      console.log("⚠️ Floating div already exists.");
      return;
    }

    // Create floating div
    const floatingDiv = document.createElement("div");
    floatingDiv.id = FLOATING_DIV_ID;
    floatingDiv.style.cssText = `
      position: fixed;
      right: 20px;
      top: 50%;
      transform: translateY(-50%);
      background-color: #fff;
      border: 1px solid #007bff;
      border-radius: 10px;
      padding: 20px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      z-index: 10000;
      width: 300px;
      font-family: Arial, sans-serif;
      font-size: 14px;
      color: #333;
      text-align: center;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    `;

    const header = document.createElement("h3");
    header.innerText = `Chart Details - ${patientName}`;
    header.style.margin = "0 0 10px";

    const details = document.createElement("p");
    details.innerHTML = `
      <strong>Chart #: </strong>${chartNumber || "N/A"}<br>
      <strong>Patient: </strong>${patientName || "Unknown Patient"}
    `;
    details.style.marginBottom = "20px";

    const closeButton = document.createElement("button");
    closeButton.innerText = "Close";
    closeButton.style.cssText = `
      padding: 6px 12px;
      background-color: #007bff;
      color: #fff;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      transition: background-color 0.3s ease;
    `;
    closeButton.addEventListener("mouseover", () => {
      closeButton.style.backgroundColor = "#0056b3";
    });
    closeButton.addEventListener("mouseout", () => {
      closeButton.style.backgroundColor = "#007bff";
    });
    closeButton.addEventListener("click", () => {
      console.log("❌ Closing floating div.");
      floatingDiv.remove();
      startMonitoring(); // Restart monitoring after closing
    });

    floatingDiv.appendChild(header);
    floatingDiv.appendChild(details);
    floatingDiv.appendChild(closeButton);

    // Append floating div into persistent container
    container.appendChild(floatingDiv);
    console.log("🎉 Floating div created and displayed in persistent container!");
  }

  function stopMonitoring() {
    if (observer) {
      observer.disconnect();
      console.log("⛔ Stopped MutationObserver.");
    }
    if (checkInterval) {
      clearInterval(checkInterval);
      console.log("⛔ Stopped periodic checks.");
    }
  }

  function startMonitoring() {
    console.log("🧭 Starting MutationObserver and periodic checks...");
    observer = new MutationObserver(() => {
      injectButton();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    console.log("🚀 MutationObserver started.");

    checkInterval = setInterval(() => {
      injectButton();
    }, 5000);
  }

  // Initial setup
  startMonitoring();
})();