const TOTE_ITEMS = [

{
    partNumber: "214152",
    category: "ONT",
    description: "ONT, ADTRAN, 632 V Indoor XGS 10G/2.5",
    shorthand: "632",
    maxQty: 10
},

{
    partNumber: "214181",
    category: "ONT",
    description: "ADTRAN SDX601QV, GPON 2.5G/1P",
    shorthand: "601",
    maxQty: 2
},

{
    partNumber: "213567",
    category: "ONT",
    description: "ADTRAN SDX611 ONT 1GE C-Chip",
    shorthand: "611",
    maxQty: 6
},

{
    partNumber: "213484",
    category: "Gateway",
    description: "ADTRAN 854-6 DHCP",
    shorthand: "854",
    maxQty: 10
},

{
    partNumber: "214278",
    category: "Gateway",
    description: "ADTRAN, Plume, SDG 8612 Gateway",
    shorthand: "8612",
    maxQty: 10
},

{
    partNumber: "213264",
    category: "Extender",
    description: "Adtran 841-T6 WIFI 6 MESH EXT",
    shorthand: "841",
    maxQty: 6
}

];

const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");
const fileStatus = document.getElementById("fileStatus");
const generateBtn = document.getElementById("generateBtn");
const printBtn = document.getElementById("printBtn");

let selectedFile = null;
let currentPickList = [];
let currentTotalPieces = 0;

function setLoadedFile(file) {
  selectedFile = file;

  fileStatus.textContent = file.name;
  fileStatus.classList.add("file-loaded");

  generateBtn.disabled = false;
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

const resultsDiv = document.getElementById("results");

generateBtn.addEventListener("click", () => {

  if (!selectedFile) return;

  const reader = new FileReader();

  reader.onload = (e) => {

    const csvText = e.target.result;

    const lines = csvText.split(/\r?\n/);

    const counts = {};

   TOTE_ITEMS.forEach(item => {
    counts[item.partNumber] = 0;
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

    let rows = "";
    let totalPieces = 0;
    
    currentPickList = [];

    TOTE_ITEMS.forEach((item) => {

    const partNumber = item.partNumber;

      const currentQty = counts[partNumber] || 0;
      const neededQty = Math.max(0, item.maxQty - currentQty);

      if (neededQty > 0) {

       totalPieces += neededQty;
        
      currentPickList.push({
    item: item.shorthand,
    max: item.maxQty,
    current: currentQty,
    toAdd: neededQty
});

}

rows += `
  <tr>
    <td>${item.shorthand}</td>
    <td>${item.maxQty}</td>
    <td>${currentQty}</td>
    <td>${neededQty}</td>
  </tr>
`;

    });

  if (totalPieces === 0) {

  resultsDiv.innerHTML = `
    <div class="result-item">
      <div class="result-part">
        Tote is fully stocked
      </div>
    </div>
  `;

  printBtn.disabled = true;
  return;
}

  const generatedAt = new Date().toLocaleString([], {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit"
});

resultsDiv.innerHTML = `
  <div class="generated-time">
    Pick List Generated: ${generatedAt}
  </div>

  <table class="pick-table">
    <thead>
     <tr>
  <th>Item</th>
<th>Max</th>
<th>Current</th>
<th>To Add</th>
</tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>

  <div class="pick-summary">
    Total Pieces To Pick: ${totalPieces}
  </div>
`;

    currentTotalPieces = totalPieces;
    printBtn.disabled = false;

  };

  reader.readAsText(selectedFile);

});

printBtn.addEventListener("click", () => {

  const { jsPDF } = window.jspdf;

  const doc = new jsPDF();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("TOTE REPLENISHMENT PICK LIST", 20, 20);

  doc.text(
    "Tech Name: ______________________________",
    20,
    45
  );

  const generatedAt = new Date().toLocaleString([], {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });

  doc.text(`Generated: ${generatedAt}`, 20, 58);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);

doc.text("Item", 28, 74);
doc.text("Pick Quantity", 135, 74);
doc.text("Pulled", 173, 74);
doc.line(20, 77, 190, 77);

let y = 80;

doc.setFont("helvetica", "normal");

currentPickList.forEach((row) => {

   // Item name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(row.item, 28, y + 2);

   doc.setFontSize(13);
  doc.text(String(row.toAdd), 145, y + 2);


    // Checkbox
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.rect(178, y - 1.5, 4, 4);

    doc.setDrawColor(150);

doc.line(20, y + 5, 190, y + 5);

doc.setDrawColor(0);

  // Next row
  y += 10;
    
});

doc.setFont("helvetica", "bold");
    doc.setFontSize(16);

doc.rect(135, y + 5, 50, 12);

doc.text(
  `Total Pieces: ${currentTotalPieces}`,
  140,
  y + 13
);

const pdfUrl = URL.createObjectURL(doc.output("blob"));
const printFrame = document.createElement("iframe");

printFrame.style.display = "none";
printFrame.src = pdfUrl;
printFrame.onload = () => {
  printFrame.contentWindow.addEventListener("afterprint", () => {
    URL.revokeObjectURL(pdfUrl);
    printFrame.remove();
  }, { once: true });
  printFrame.contentWindow.print();
};

document.body.appendChild(printFrame);

});
