const TOTE_ITEMS = {
  "204376": {
    category: "GPON ONT",
    longName: "ONT-411",
    shortName: "GPON-411"
  },
  "213567": {
    category: "GPON ONT",
    longName: "ONT-611",
    shortName: "GPON-611"
  },
   "213566": {
    category: "GSPON ONT",
    longName: "ONT-611",
    shortName: "GSPON-611 Obsolete"
  },
  "214181": {
    category: "GPON ONT",
    longName: "ONT-601",
    shortName: "GPON-601"
  },
  "213155": {
    category: "XGSPON ONT",
    longName: "ONT-622",
    shortName: "XGSPON-622"
  },
   "214152": {
    category: "XGSPON ONT",
    longName: "ONT-632",
    shortName: "XGSPON-632"
  },
  "213484": {
    category: "Gateway",
    longName: "Modem-854",
    shortName: "Gateway-854"
  },
  "213850": {
    category: "Gateway",
    longName: "Modem-854 SOS",
    shortName: "Gateway-854 SOS"
  },
  "214278": {
    category: "Gateway",
    longName: "Modem-8612",
    shortName: "Gateway-8612"
  },
  "214595": {
    category: "Gateway",
    longName: "Modem-8612 SOS",
    shortName: "Gateway-8612 SOS"
  },
  "214570": {
    category: "Gateway",
    longName: "Zyxel EX5512",
    shortName: "Gateway-Zyxel 5512"  
  },
  "214802": {
    category: "Gateway",
    longName: "Zyxel EE6510",
    shortName: "Gateway-Zyxel 6510"
    },
  "213264": {
    category: "Extender",
    longName: "Extender-841",
    shortName: "Extender-841"
  },
  "213320": {
    category: "Extender",
    longName: "Extender-AX Pod",
    shortName: "Extender-AX Pod"
  },
  "213865": {
    category: "Extender",
    longName: "Extender-6E",
    shortName: "Extender-6E"
  }
};

const CATEGORY_LIMITS = {
  "GPON ONT": 8,
  "XGSPON ONT": 10,
  "Gateway": 18,
  "Extender": 6
};

const TOTE_DISPLAY_ORDER = [
  "204376", // 411
  "213567", // 611
  "214181", // 601
  "213155", // 622
  "214152", // 632
  "213484", // 854
  "213850", // 854 SOS
  "214278", // 8612
  "214595", // 8612 SOS
  "214570", // Zyxel 5512
  "214802", // Zyxel 6510
  "213264", // 841
  "213320", // AX Pod
  "213865"  // 6E
];

const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");
const fileStatus = document.getElementById("fileStatus");
const generateBtn = document.getElementById("generateBtn");
const printBtn = document.getElementById("printBtn");
const technicianNameInput = document.getElementById("technicianName");
const resultsDiv = document.getElementById("results");

let selectedFile = null;
let summaryGenerated = false;

function updatePrintButtonState() {
  printBtn.disabled = !summaryGenerated || !technicianNameInput.value.trim();
}

technicianNameInput.addEventListener("input", updatePrintButtonState);

function setLoadedFile(file) {
  selectedFile = file;

  fileStatus.textContent = file.name;
  fileStatus.classList.add("file-loaded");

  technicianNameInput.value = "";
  resultsDiv.innerHTML = "";
  summaryGenerated = false;

  const existingPrintReport = document.getElementById("printReport");

  if (existingPrintReport) {
    existingPrintReport.remove();
  }

  generateBtn.disabled = false;
  updatePrintButtonState();
}

dropZone.addEventListener("click", () => {
  fileInput.click();
});

fileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];

  if (!file) return;

  setLoadedFile(file);
});

dropZone.addEventListener("dragover", (event) => {
  event.preventDefault();
});

dropZone.addEventListener("drop", (event) => {
  event.preventDefault();

  const file = event.dataTransfer.files[0];

  if (!file) return;

  setLoadedFile(file);
});

generateBtn.addEventListener("click", () => {

  if (!selectedFile) return;

  const reader = new FileReader();

  reader.onload = (e) => {

    const csvText = e.target.result;

    const lines = csvText.split(/\r?\n/);

    const counts = {};

   Object.keys(TOTE_ITEMS).forEach(partNumber => {
    counts[partNumber] = 0;
});

    for (let i = 1; i < lines.length; i++) {

      const line = lines[i];

      if (!line.trim()) continue;

      const match = line.match(/(\d{6})-/);

      if (!match) continue;

      const partNumber = match[1];

      if (counts.hasOwnProperty(partNumber)) {
        counts[partNumber]++;
      }
    }

    const categoryTotals = {};

    Object.keys(CATEGORY_LIMITS).forEach((category) => {
      categoryTotals[category] = 0;
    });

    Object.entries(TOTE_ITEMS).forEach(([partNumber, item]) => {
      categoryTotals[item.category] += counts[partNumber];
    });

    const inventoryTotal = Object.values(counts).reduce((total, count) => total + count, 0);

    const inventoryRows = Object.keys(CATEGORY_LIMITS).map((category) => {
  return TOTE_DISPLAY_ORDER
    .map((partNumber) => [partNumber, TOTE_ITEMS[partNumber]])
    .filter(([, item]) => item.category === category)
        .map(([partNumber, item]) => `
          <tr>
            <td>${item.shortName}</td>
            <td>${counts[partNumber]}</td>
          </tr>
        `).join("");
    }).join("");

    const categorySummaries = Object.entries(CATEGORY_LIMITS).map(([category, limit]) => {
      const currentTotal = categoryTotals[category];
      const over = Math.max(0, currentTotal - limit);
      const add = Math.max(0, limit - currentTotal);

      return { category, limit, currentTotal, over, add };
    });

    const categoryRows = categorySummaries.map(({ category, limit, currentTotal, over, add }) => `
        <tr>
          <td>${category}</td>
          <td>${limit}</td>
          <td>${currentTotal}</td>
          <td>${over}</td>
          <td>${add}</td>
        </tr>
      `).join("");

    const printCategoryColgroup = `
      <colgroup>
        <col class="print-category-column">
        <col class="print-numeric-column">
        <col class="print-numeric-column print-current-column">
        <col class="print-numeric-column">
        <col class="print-numeric-column">
      </colgroup>
    `;

    const categoryMaxTotal = categorySummaries.reduce((total, summary) => total + summary.limit, 0);
    const categoryCurrentTotal = categorySummaries.reduce((total, summary) => total + summary.currentTotal, 0);
    const categoryOverTotal = categorySummaries.reduce((total, summary) => total + summary.over, 0);
    const categoryAddTotal = categorySummaries.reduce((total, summary) => total + summary.add, 0);

  const generatedAt = new Date().toLocaleString([], {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit"
});

resultsDiv.innerHTML = `
  <div class="generated-time">
    Summary Generated: ${generatedAt}
  </div>

  <div class="results-grid">
    <div class="results-panel">
      <h2>Current Inventory</h2>
      <table class="pick-table current-inventory-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Current</th>
          </tr>
        </thead>
        <tbody>
          ${inventoryRows}
        </tbody>
      </table>
      <div class="table-summary inventory-summary">
        <span>TOTAL:</span>
        <span>${inventoryTotal}</span>
      </div>
    </div>

    <div class="results-panel">
      <h2>Category Summary</h2>
      <table class="pick-table category-summary-table">
        <colgroup>
          <col class="category-column">
          <col class="numeric-column">
          <col class="numeric-column">
          <col class="numeric-column">
          <col class="numeric-column">
        </colgroup>
        <thead>
          <tr>
            <th>Category</th>
            <th>Max</th>
            <th>Current</th>
            <th>Over</th>
            <th>Add</th>
          </tr>
        </thead>
        <tbody>
          ${categoryRows}
        </tbody>
      </table>
      <div class="table-summary category-summary">
        <span>TOTAL</span>
        <span>${categoryMaxTotal}</span>
        <span>${categoryCurrentTotal}</span>
        <span>${categoryOverTotal}</span>
        <span>${categoryAddTotal}</span>
      </div>
    </div>
  </div>
`;

    const existingPrintReport = document.getElementById("printReport");

    if (existingPrintReport) {
      existingPrintReport.remove();
    }

    const printReport = document.createElement("div");
    printReport.id = "printReport";
    printReport.className = "print-report";
    printReport.innerHTML = `
      <h1 class="print-title">TOTE INVENTORY SUMMARY</h1>

      <div class="print-technician">
        Technician Name: <span></span>
      </div>

      <div class="print-generated">
        Summary Generated: ${generatedAt}
      </div>

      <div class="print-summary-grid">
        <section class="print-section">
          <h2>Current Inventory</h2>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Current</th>
              </tr>
            </thead>
            <tbody>
              ${inventoryRows}
            </tbody>
          </table>
          <div class="print-total print-inventory-total">
            <span>TOTAL:</span>
            <span>${inventoryTotal}</span>
          </div>
        </section>

        <div class="print-right-column">
          <section class="print-section">
            <h2>Category Summary</h2>
            <table class="print-category-table">
              ${printCategoryColgroup}
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Max</th>
                  <th>Current</th>
                  <th>Over</th>
                  <th>Add</th>
                </tr>
              </thead>
              <tbody>
                ${categoryRows}
              </tbody>
            </table>
            <table class="print-total print-category-total">
              ${printCategoryColgroup}
              <tbody>
                <tr>
                  <td>TOTAL</td>
                  <td>${categoryMaxTotal}</td>
                  <td>${categoryCurrentTotal}</td>
                  <td>${categoryOverTotal}</td>
                  <td>${categoryAddTotal}</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section class="print-pick-section">
            <h2>Items to Pick</h2>
            <div class="print-pick-columns">
              <div>
                ${["411", "611", "601", "622", "632", "841"].map((name) => `
                  <div class="print-pick-item"><span>${name}</span><span></span></div>
                `).join("")}
              </div>
              <div>
                ${["854", "854 SOS", "8612", "8612 SOS", "Zyxel 5512", "Zyxel 6510"].map((name) => `
                  <div class="print-pick-item"><span>${name}</span><span></span></div>
                `).join("")}
              </div>
            </div>
          </section>
        </div>
      </div>

    `;

    document.body.appendChild(printReport);
    summaryGenerated = true;
    updatePrintButtonState();

  };

  reader.readAsText(selectedFile);

});

printBtn.addEventListener("click", () => {
  if (printBtn.disabled) return;

  const printTechnicianName = document.querySelector("#printReport .print-technician span");
  printTechnicianName.textContent = technicianNameInput.value;

  window.print();
});
