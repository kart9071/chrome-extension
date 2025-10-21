(() => {
  const DIV_SELECTOR = "#page2";
  const UL_SELECTOR = "#ulReadPatientDetail"; // adjust if needed
  const BUTTON_ID = "ct-chart-details-li";

  console.log("🔍 CareTracker Extension content script loaded.");

  function labClick(chartNumber, el) {
    console.log(`✅ labClick triggered for Chart #: ${chartNumber}`);
    
    // Remove 'active' from all li siblings
    const parentUL = el.closest("ul");
    parentUL.querySelectorAll("li").forEach(li => li.classList.remove("active"));
    
    // Add 'active' to clicked li
    el.closest("li").classList.add("active");

    alert(`Chart Details clicked!\nChart #: ${chartNumber}`);
  }

  function createLi(chartNumber) {
    const li = document.createElement("li");
    li.classList.add(""); // initially no active class
    
    const a = document.createElement("a");
    a.href = "#";
    a.innerHTML = "Chart Details"; // inner HTML text
    a.title = `Chart #: ${chartNumber || "N/A"}`;

    a.addEventListener("click", (e) => {
      e.preventDefault();
      labClick(chartNumber, a);
    });

    li.appendChild(a);
    return li;
  }

  function injectLi() {
    console.log("🔎 Checking for div:", DIV_SELECTOR);
    const div = document.querySelector(DIV_SELECTOR);
    const ul = document.querySelector(UL_SELECTOR);

    if (!div || !ul) {
      console.log("⚠️ Div or UL not found yet. Will retry.");
      return;
    }

    // Prevent duplicate injection
    if (document.getElementById(BUTTON_ID)) {
      console.log("⚠️ Li already injected, skipping.");
      return;
    }

    const chartNumber = document.querySelector("#chartNumber")?.textContent?.trim() || "";

    console.log("✅ Chart Number fetched:", chartNumber);

    const li = createLi(chartNumber);
    li.id = BUTTON_ID;

    ul.appendChild(li);
    console.log("🎉 New <li> with <a> (Chart Details) injected successfully!");
  }

  // MutationObserver for dynamic DOM
  console.log("👀 Starting MutationObserver...");
  const observer = new MutationObserver(() => {
    injectLi();
  });
  observer.observe(document.body, { childList: true, subtree: true });
  console.log("🚀 MutationObserver started.");

  // Initial injection
  injectLi();

  // Fallback: periodic check
  setInterval(() => {
    injectLi();
  }, 5000);
})();
