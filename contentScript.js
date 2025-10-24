(() => {
  const TABLE_SELECTOR = "#ctl00_MainContent_ucPatientDetail_dlPatient";
  const UL_SELECTOR = "#ulReadPatientDetail";
  const BUTTON_ID = "ct-chart-details-btn";
  const SHADOW_HOST_ID = "ct-shadow-host";
  const RESULT_DIV_ID = "chartDetailsResult";

  let observer;
  let shadowRoot;

  console.log("🔍 CareTracker extension content script loaded.");

  // 🧩 Create floating container completely OUTSIDE the page DOM
  function createShadowContainer() {
    if (document.getElementById(SHADOW_HOST_ID)) return;

    const host = document.createElement("div");
    host.id = SHADOW_HOST_ID;
    host.style.cssText = `
      all: initial;
      position: fixed;
      top: 0;
      left: 0;
      z-index: 2147483647; /* Highest z-index */
    `;

    // 🚀 Mount outside <html>, so it’s fully isolated
    (document.head || document.documentElement).insertAdjacentElement("beforebegin", host);

    shadowRoot = host.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = `
      #${RESULT_DIV_ID} {
        position: fixed;
        top: 60px;
        right: 20px;
        width: 400px;
        height: 500px;
        background: #fff;
        border: 1px solid #ccc;
        border-radius: 8px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.15);
        padding: 10px;
        overflow-y: auto;
        z-index: 9999;
        display: none;
        font-family: Arial, sans-serif;
      }
      button {
        font-family: Arial, sans-serif;
      }
    `;
    shadowRoot.appendChild(style);

    const div = document.createElement("div");
    div.id = RESULT_DIV_ID;
    shadowRoot.appendChild(div);

    console.log("🧩 Shadow container created outside page DOM");
  }

  // 🧩 Get reference to result div inside Shadow DOM
  function getResultDiv() {
    if (!shadowRoot) createShadowContainer();
    return shadowRoot.getElementById(RESULT_DIV_ID);
  }

  // 🧩 Create button
  function createButton(patientName, chartNumber) {
    const btn = document.createElement("button");
    btn.id = BUTTON_ID;
    btn.innerText = "Open Chart Details";
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

      const resultDiv = getResultDiv();
      resultDiv.style.display = "block";
      resultDiv.innerHTML = `<h3 style="color:#007bff;">Fetching chart details for ${member_name}...</h3>`;

      // 📨 Send data to service worker
      chrome.runtime.sendMessage(
        {
          action: "fetchChartDetails",
          payload: { member_id, member_name },
        },
        (response) => {
          if (chrome.runtime.lastError) {
            resultDiv.innerHTML = `<p style="color:red;">Error: ${chrome.runtime.lastError.message}</p>`;
            return;
          }

          if (!response) {
            resultDiv.innerHTML = `<p style="color:red;">No response from background script.</p>`;
            return;
          }

          if (response.error) {
            resultDiv.innerHTML = `<p style="color:red;">❌ ${response.error}</p>`;
          } else {
            resultDiv.innerHTML = `
              <h3 style="color:#007bff;">Chart Details - ${member_name}</h3>
              <pre style="background:#f4f4f4;padding:10px;border-radius:5px;overflow:auto;">
${JSON.stringify(response.data, null, 2)}
              </pre>
              <button id="closeChartDiv" style="margin-top:10px;padding:6px 10px;background:#007bff;color:#fff;border:none;border-radius:4px;cursor:pointer;">Close</button>
            `;
            resultDiv.querySelector("#closeChartDiv").addEventListener("click", () => {
              resultDiv.style.display = "none";
            });
          }
        }
      );
    });

    return btn;
  }

  // 🧩 Inject button inside UL
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
    li.appendChild(btn);

    ul.appendChild(li);
    console.log("✅ Button injected successfully!");

    createShadowContainer();
  }

  // ✅ Observe DOM for first-time injection only
  function startMonitoring() {
    injectButton(); // Try immediately

    observer = new MutationObserver(() => {
      if (!document.getElementById(BUTTON_ID)) injectButton();
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  startMonitoring();
})();
