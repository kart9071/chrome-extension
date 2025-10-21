(() => {
  const TABLE_SELECTOR = "#ctl00_MainContent_ucPatientDetail_dlPatient";
  const UL_SELECTOR = "#ulReadPatientDetail";
  const BUTTON_ID = "ct-chart-details-btn";

  const PAGE2_DIV_SELECTOR = "#page2 ul";
  const LINK_ID = "ct-chart-details-link";

  console.log("🔍 CareTracker Extension content script loaded.");

  // --- Existing Button Logic (unchanged) ---
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
    li.innerHTML = `<label style="margin-right:6px;">Chart Details:</label>`;
    const btn = createButton(patientName, chartNumber);
    const span = document.createElement("span");
    span.appendChild(btn);
    li.appendChild(span);

    ul.appendChild(li);
    console.log("🎉 Button injected inside <ul> as new <li> successfully!");
  }

  // --- New Tab Link Logic (kept separate) ---
  function createLink(patientName, chartNumber) {
    console.log("🧩 Creating Chart Details tab...");

    const li = document.createElement("li");
    const a = document.createElement("a");
    a.id = LINK_ID;
    a.href = "#";
    a.innerText = "Chart Details";
    a.setAttribute("onclick", `labClick('${chartNumber}', this)`);
    a.style.cssText = `
      cursor: pointer;
      color: #007bff;
      text-decoration: none;
      font-size: 12px;
      margin-right: 6px;
    `;
    a.addEventListener("mouseover", () => a.style.textDecoration = "underline");
    a.addEventListener("mouseout", () => a.style.textDecoration = "none");

    li.appendChild(a);
    return li;
  }

  function injectTab() {
    const table = document.querySelector(TABLE_SELECTOR);
    const page2UL = document.querySelector(PAGE2_DIV_SELECTOR);

    if (!table) {
      console.log("⚠️ Patient table not found yet. Will retry.");
      return;
    }

    if (!page2UL) {
      console.log("⚠️ #page2 ul not found yet. Will retry.");
      return;
    }

    if (document.getElementById(LINK_ID)) {
      console.log("⚠️ Tab already injected, skipping.");
      return;
    }

    const chartNumber = document.querySelector("#chartNumber")?.textContent?.trim() || "";
    const patientName = document.querySelector("#patientName")?.textContent?.trim() || "";

    console.log("✅ Data fetched for tab:", { chartNumber, patientName });

    const li = createLink(patientName, chartNumber);
    page2UL.appendChild(li);
    console.log("🎉 Chart Details tab injected successfully!");
  }

  // --- MutationObserver to handle dynamic DOM ---
  console.log("👀 Starting MutationObserver...");
  const observer = new MutationObserver(() => {
    injectButton();
    injectTab();
  });
  observer.observe(document.body, { childList: true, subtree: true });
  console.log("🚀 MutationObserver started.");

  // Initial check
  injectButton();
  injectTab();

  // Fallback: periodic check
  setInterval(() => {
    injectButton();
    injectTab();
  }, 5000);
})();
