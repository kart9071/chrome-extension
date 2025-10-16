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

    // Don’t inject multiple buttons
    if (document.getElementById(BUTTON_ID)) return;

    // Add button after the table
    const btn = createButton();
    table.insertAdjacentElement("afterend", btn);

    console.log("✅ Button injected next to CareTracker table.");
  }

  // Watch for table being added dynamically
  const observer = new MutationObserver(() => injectButton());
  observer.observe(document.body, { childList: true, subtree: true });

  // Try initially
  injectButton();
})();
