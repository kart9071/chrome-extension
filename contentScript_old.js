(() => {
  const TABLE_SELECTOR = "#ctl00_MainContent_ucPatientDetail_dlPatient";
  const UL_SELECTOR = "#ulReadPatientDetail";
  const BUTTON_ID = "ct-chart-details-btn";

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
      alert(`Chart #: ${chartNumber}\nPatient: ${patientName}`);
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
    li.innerHTML = `
      <label style="margin-right:6px;">Chart Details:</label>
    `;
    const btn = createButton(patientName, chartNumber);
    const span = document.createElement("span");
    span.appendChild(btn);
    li.appendChild(span);

    ul.appendChild(li);
    console.log("🎉 Button injected inside <ul> as new <li> successfully!");
  }

  // MutationObserver to handle dynamic DOM
  console.log("👀 Starting MutationObserver...");
  const observer = new MutationObserver(() => {
    injectButton();
  });
  observer.observe(document.body, { childList: true, subtree: true });
  console.log("🚀 MutationObserver started.");

  // Initial check
  injectButton();

  // Fallback: periodic check
  setInterval(() => {
    injectButton();
  }, 5000);
})();
