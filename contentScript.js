(() => {
  const TABLE_SELECTOR = "#ctl00_MainContent_ucPatientDetail_dlPatient";
  const UL_SELECTOR = "#ulReadPatientDetail";
  const BUTTON_ID = "ct-chart-details-btn";

  let observer;
  let checkInterval;

  console.log("🔍 Local CareTracker extension loaded.");

  // default timeouts (ms)
  const DEFAULT_TIMEOUT = 15000; // 15s
  const LONG_TIMEOUT = 60000; // 60s

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

      // Open new tab immediately (user gesture preserved)
      const newTab = window.open("", "_blank");
      if (!newTab) {
        alert("⚠️ Popup blocked! Please allow popups for this site.");
        return;
      }

      // Prepare skeleton UI in new tab
      const doc = newTab.document;
      doc.head.innerHTML = `
        <meta charset="UTF-8">
        <title>Chart Details - ${escapeHtml(member_name)}</title>
        <style>
          body { font-family: Arial, sans-serif; margin:0; padding:20px; background:#f9f9f9; color:#222; }
          .container { max-width:1000px; margin:0 auto; background:#fff; padding:20px; border-radius:10px; box-shadow:0 4px 10px rgba(0,0,0,0.08);}
          h2 { color:#007bff; text-align:center; margin-top:0;}
          .meta { display:flex; gap:12px; justify-content:center; margin-bottom:12px; }
          .meta span { font-weight:600; }
          .status { text-align:center; margin:18px 0; }
          .prebox { background:#f4f4f4; padding:15px; border-radius:6px; overflow:auto; max-height:500px; white-space:pre-wrap; word-break:break-word; }
          .controls { display:flex; gap:8px; justify-content:center; margin-top:16px; }
          button { padding:8px 12px; background:#007bff; color:#fff; border:none; border-radius:6px; cursor:pointer; }
          button.secondary { background:#6c757d; }
          button.ghost { background:transparent; color:#007bff; border:1px solid #007bff; }
          .countdown { font-size:14px; color:#555; margin-top:6px; }
          .error { color:#b91c1c; font-weight:600; }
        </style>
      `;
      doc.body.innerHTML = `
        <div class="container">
          <h2>Chart Details - ${escapeHtml(member_name)}</h2>
          <div class="meta">
            <span>Chart #:</span><span>${escapeHtml(member_id)}</span>
          </div>
          <div class="status">
            <div id="loadingMsg">Fetching chart details…</div>
            <div class="countdown" id="countdown"></div>
          </div>
          <div id="result" class="prebox" style="display:none;"></div>
          <div id="errorBox" style="display:none;text-align:center;margin-top:12px;"></div>
          <div class="controls" id="controls"></div>
        </div>
      `;

      // Start initial fetch with timeout and provide retry handlers
      startFetchWithUi({
        doc,
        url: "https://h4xqr89uik.execute-api.us-east-1.amazonaws.com/dev/", // change if needed
        payload: { member_id, member_name },
        initialTimeout: DEFAULT_TIMEOUT
      });
    });

    return btn;
  }

  // =========================
  // Start fetch + UI logic
  // =========================
  function startFetchWithUi({ doc, url, payload, initialTimeout }) {
    const loadingMsgEl = doc.getElementById("loadingMsg");
    const countdownEl = doc.getElementById("countdown");
    const resultEl = doc.getElementById("result");
    const errorBox = doc.getElementById("errorBox");
    const controls = doc.getElementById("controls");

    function showLoading(timeoutMs) {
      loadingMsgEl.textContent = `Fetching chart details (timeout ${Math.round(timeoutMs/1000)}s)…`;
      countdownEl.textContent = `Time remaining: ${Math.round(timeoutMs/1000)}s`;
      resultEl.style.display = "none";
      errorBox.style.display = "none";
      controls.innerHTML = "";
    }

    function showResult(data) {
      loadingMsgEl.textContent = "Response received";
      countdownEl.textContent = "";
      resultEl.style.display = "block";
      errorBox.style.display = "none";
      // pretty JSON
      resultEl.textContent = JSON.stringify(data, null, 2);
      controls.innerHTML = `<button id="closeBtn">Close</button>`;
      doc.getElementById("closeBtn").addEventListener("click", () => doc.defaultView.close());
    }

    function showError(message) {
      loadingMsgEl.textContent = "";
      countdownEl.textContent = "";
      resultEl.style.display = "none";
      errorBox.style.display = "block";
      errorBox.innerHTML = `
        <div class="error">${escapeHtml(message)}</div>
        <div style="margin-top:12px;">You can retry with a longer timeout or without timeout.</div>
      `;
      controls.innerHTML = `
        <button id="retryLong">Retry (60s)</button>
        <button id="retryNoTimeout" class="secondary">Retry (no timeout)</button>
        <button id="closeBtn" class="ghost">Close</button>
      `;
      doc.getElementById("retryLong").addEventListener("click", () => {
        startFetchWithUi({ doc, url, payload, initialTimeout: LONG_TIMEOUT });
      });
      doc.getElementById("retryNoTimeout").addEventListener("click", () => {
        startFetchWithUi({ doc, url, payload, initialTimeout: 0 }); // 0 => no abort
      });
      doc.getElementById("closeBtn").addEventListener("click", () => doc.defaultView.close());
    }

    // perform the fetch with abort + countdown
    performFetchWithTimeout(url, payload, initialTimeout,
      // progress callback
      (remainingMs) => {
        if (remainingMs === null) {
          countdownEl.textContent = "Waiting (no timeout)…";
        } else {
          countdownEl.textContent = `Time remaining: ${Math.round(remainingMs/1000)}s`;
        }
      }
    ).then((data) => {
      showResult(data);
    }).catch((err) => {
      const msg = err && err.message ? err.message : String(err);
      console.error("Fetch error:", err);
      showError(msg);
    });

    // show initial loading UI
    showLoading(initialTimeout || "∞");
  }

  // =========================
  // Fetch with abort and progress-callback for countdown
  // timeoutMs = 0 => no timeout
  // progressCb receives remainingMs or null (if no timeout)
  // =========================
  function performFetchWithTimeout(url, payload, timeoutMs = DEFAULT_TIMEOUT, progressCb = () => {}) {
    return new Promise(async (resolve, reject) => {
      const controller = new AbortController();
      const signal = controller.signal;
      let timeoutId = null;
      let start = Date.now();

      // Set up timeout if requested (>0)
      if (timeoutMs && timeoutMs > 0) {
        timeoutId = setTimeout(() => {
          controller.abort();
        }, timeoutMs);
      }

      // Countdown interval to update progress every 250ms
      let countdownInterval = null;
      if (timeoutMs && timeoutMs > 0) {
        countdownInterval = setInterval(() => {
          const elapsed = Date.now() - start;
          const remaining = Math.max(0, timeoutMs - elapsed);
          progressCb(remaining);
        }, 250);
      } else {
        // no timeout
        progressCb(null);
      }

      try {
        const resp = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal
        });

        if (timeoutId) { clearTimeout(timeoutId); timeoutId = null; }
        if (countdownInterval) { clearInterval(countdownInterval); countdownInterval = null; }

        if (!resp.ok) {
          // try to extract text for better error
          let txt = "";
          try { txt = await resp.text(); } catch (e) { /* noop */ }
          return reject(new Error(`Server returned ${resp.status} ${resp.statusText}${txt ? ` — ${txt}` : ""}`));
        }

        // parse JSON (may throw)
        const data = await resp.json();
        resolve(data);
      } catch (err) {
        if (timeoutId) { clearTimeout(timeoutId); timeoutId = null; }
        if (countdownInterval) { clearInterval(countdownInterval); countdownInterval = null; }

        if (err.name === "AbortError") {
          return reject(new Error(`Request timed out after ${Math.round(timeoutMs/1000)}s`));
        }
        return reject(err);
      }
    });
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

  // small helper to avoid XSS in inserted strings
  function escapeHtml(str) {
    if (!str && str !== 0) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

})();
