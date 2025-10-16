(() => {
  const TABLE_SELECTOR = "#ctl00_MainContent_ucPatientDetail_dlPatient";
  const BUTTON_ID = "ct-test-btn";

  function createButton() {
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
    const table = document.querySelector(TABLE_SELECTOR);
    if (!table) return;

    if (document.getElementById(BUTTON_ID)) return; // Avoid duplicates

    const btn = createButton();
    table.insertAdjacentElement("afterend", btn);

    console.log("✅ Button injected next to CareTracker table.");
  }

  // Watch for dynamically added table
  const observer = new MutationObserver(() => injectButton());
  observer.observe(document.body, { childList: true, subtree: true });

  // Try immediately in case it's already loaded
  injectButton();
})();
