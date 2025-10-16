(() => {
  const TABLE_SELECTOR = "#ctl00_MainContent_ucPatientDetail_dlPatient";
  const BUTTON_ID = "ct-test-btn";

  console.log("🔍 CareTracker Extension content script loaded.");

  function createButton() {
    console.log("🧩 Creating test button...");
    const btn = document.createElement("button");
    btn.id = BUTTON_ID;
    btn.innerText = "Test Button";
    btn.style.cssText = `
      margin-left: 10px;
      padding: 6px 10px;
      border: 1px solid #007bff;
      border-radius: 5px;
      background: #fff;
      cursor: pointer;
      font-size: 12px;
      color: #007bff;
      transition: all 0.2s ease-in-out;
    `;
    btn.addEventListener("click", () => {
      console.log("✅ Button clicked!");
      alert("Button clicked!");
    });
    return btn;
  }

  function injectButton() {
    console.log("🔎 Checking for table:", TABLE_SELECTOR);
    const table = document.querySelector(TABLE_SELECTOR);

    if (!table) {
      console.log("⚠️ Table not found yet. Will retry when DOM changes.");
      return;
    }

    if (document.getElementById(BUTTON_ID)) {
      console.log("⚠️ Button already injected, skipping.");
      return;
    }

    console.log("✅ Table found! Injecting button...");
    const btn = createButton();
    table.insertAdjacentElement("afterend", btn);
    console.log("🎉 Button injected successfully next to CareTracker table.");
  }

  // Watch for dynamically added table
  console.log("👀 Starting MutationObserver...");
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.addedNodes && m.addedNodes.length > 0) {
        console.log("🧠 DOM changed, rechecking for table...");
        injectButton();
      }
    }
  });

  // Start observing DOM
  observer.observe(document.body, { childList: true, subtree: true });
  console.log("🚀 MutationObserver started and watching DOM.");

  // Initial check in case table already exists
  injectButton();

  // Fallback: periodic check (just in case)
  setInterval(() => {
    console.log("⏱️ Periodic check running...");
    injectButton();
  }, 5000);
})();
