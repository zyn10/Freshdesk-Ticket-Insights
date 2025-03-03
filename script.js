document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname.includes("chart.html")) {
    loadChartData();
  } else {
    initializeFileHandlers();
  }
});

// File Handling and Data Processing (unchanged)
function initializeFileHandlers() {
  const fileInput = document.getElementById("fileInput");
  const dropArea = document.getElementById("dropArea");

  if (!fileInput || !dropArea) {
    console.error("File input elements not found!");
    return;
  }

  fileInput.addEventListener("change", handleFileSelection);
  dropArea.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropArea.classList.add("drag-over");
  });

  dropArea.addEventListener("dragleave", () =>
    dropArea.classList.remove("drag-over")
  );

  dropArea.addEventListener("drop", (event) =>
    handleFileDrop(event, fileInput)
  );
}

function handleFileSelection(event) {
  const file = event.target.files[0];
  validateAndProcessFile(file, event.target);
}

function handleFileDrop(event, fileInput) {
  event.preventDefault();
  event.currentTarget.classList.remove("drag-over");

  const file = event.dataTransfer.files[0];
  if (file) {
    let dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    fileInput.files = dataTransfer.files;
    validateAndProcessFile(file, fileInput);
  }
}

function validateAndProcessFile(file, inputElement) {
  if (!file || !file.name.toLowerCase().endsWith(".csv")) {
    alert("Invalid file type! Please upload a CSV file.");
    inputElement.value = "";
    return;
  }
  processCSVFile(file);
}

// Data Processing
function processCSVFile(file) {
  const reader = new FileReader();

  reader.onload = function (event) {
    const text = event.target.result;
    const rows = text
      .split("\n")
      .map((row) => row.split(",").map((cell) => cell.trim()));

    if (rows.length < 2) {
      alert("Invalid data format in file!");
      return;
    }

    const headers = rows[0];
    const requiredColumns = ["Status", "Priority", "Type", "Tags"];
    const columnIndexes = requiredColumns.map((col) => headers.indexOf(col));

    if (columnIndexes.includes(-1)) {
      alert(
        "Missing required columns! Expected: Status, Priority, Type, Tags."
      );
      return;
    }

    const [statusIndex, priorityIndex, typeIndex, tagsIndex] = columnIndexes;
    let chartsData = initializeChartData();

    rows.slice(1).forEach((row) =>
      processRow(row, headers.length, chartsData, {
        statusIndex,
        priorityIndex,
        typeIndex,
        tagsIndex,
      })
    );

    sessionStorage.setItem(
      "chartsData",
      JSON.stringify(convertToChartData(chartsData))
    );
    window.location.href = "chart.html";
  };

  reader.readAsText(file);
}

function initializeChartData() {
  return {
    ticketsByStatus: {},
    unresolvedByType: {},
    topClientsByPriority: {},
    unresolvedByCustomer: {},
  };
}

function processRow(row, headerLength, chartsData, indexes) {
  if (row.length !== headerLength) return;

  const { statusIndex, priorityIndex, typeIndex, tagsIndex } = indexes;
  const status = row[statusIndex];
  const priority = row[priorityIndex];
  const type = row[typeIndex];
  const tags = row[tagsIndex];
  const customer = tags ? tags.split(";")[0] : "Unknown";

  if (status)
    chartsData.ticketsByStatus[status] =
      (chartsData.ticketsByStatus[status] || 0) + 1;
  if (["Waiting on ThingTrax", "Waiting on Customer"].includes(status))
    chartsData.unresolvedByType[type] =
      (chartsData.unresolvedByType[type] || 0) + 1;
  if (["Resolved", "Closed"].includes(status))
    chartsData.topClientsByPriority[customer] =
      (chartsData.topClientsByPriority[customer] || 0) + 1;
  if (["Waiting on ThingTrax", "Waiting on Customer"].includes(status))
    chartsData.unresolvedByCustomer[customer] =
      (chartsData.unresolvedByCustomer[customer] || 0) + 1;
}

function convertToChartData(obj) {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key,
      { labels: Object.keys(value), values: Object.values(value) },
    ])
  );
}

// Chart Handling
const chartColors = ["#8ed973", "#ff0000", "#e97132", "#0e9ed5"];

function loadChartData() {
  const storedData = sessionStorage.getItem("chartsData");
  if (!storedData) {
    console.error("No chart data found.");
    return;
  }

  const chartsData = JSON.parse(storedData);
  createChart(
    "ticketsByStatusChart",
    "Tickets by Status",
    chartsData.ticketsByStatus,
    true
  );
  createChart(
    "unresolvedByTypeChart",
    "Unresolved Tickets by Type",
    chartsData.unresolvedByType,
    false
  );
  createStackedBarChart(
    "topClientsByPriorityChart",
    "Top 5 Clients by Resolved Priority",
    chartsData.topClientsByPriority
  );
  createStackedBarChart(
    "unresolvedByCustomerChart",
    "Unresolved Tickets by Priority",
    chartsData.unresolvedByCustomer
  );
}

function createChart(canvasId, label, data, isHorizontal) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) {
    console.error(`Canvas ${canvasId} not found.`);
    return;
  }

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: data.labels,
      datasets: [
        {
          label,
          data: data.values,
          backgroundColor: chartColors,
          borderRadius: 5,
        },
      ],
    },
    options: {
      indexAxis: isHorizontal ? "y" : "x",
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          beginAtZero: true,
          grid: { display: false },
          ticks: { font: { size: 14 } },
        },
        y: { grid: { display: false }, ticks: { font: { size: 14 } } },
      },
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true },
        datalabels: {
          anchor: "end",
          align: "end",
          color: "#000",
          font: { weight: "bold", size: 14 },
          formatter: (value) => value,
        },
      },
    },
    plugins: [ChartDataLabels],
  });

  addChartTitle(ctx, label);
}

function createStackedBarChart(canvasId, label, data) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) {
    console.error(`Canvas ${canvasId} not found.`);
    return;
  }

  const labels = data.labels.slice(0, 5); // Top 5 clients
  const datasets = [
    {
      label: "Urgent",
      data: labels.map((label) => data.values[labels.indexOf(label)] || 0),
      backgroundColor: "#ff0000",
    },
    {
      label: "High",
      data: labels.map((label) => data.values[labels.indexOf(label)] || 0),
      backgroundColor: "#e97132",
    },
    {
      label: "Medium",
      data: labels.map((label) => data.values[labels.indexOf(label)] || 0),
      backgroundColor: "#0e9ed5",
    },
    {
      label: "Low",
      data: labels.map((label) => data.values[labels.indexOf(label)] || 0),
      backgroundColor: "#8ed973",
    },
  ];

  new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          stacked: true,
          grid: { display: false },
          ticks: { font: { size: 14 } },
        },
        y: {
          stacked: true,
          grid: { display: false },
          ticks: { font: { size: 14 } },
        },
      },
      plugins: {
        legend: { display: true },
        tooltip: { enabled: true },
        datalabels: {
          anchor: "end",
          align: "end",
          color: "#000",
          font: { weight: "bold", size: 14 },
          formatter: (value) => value,
        },
      },
    },
    plugins: [ChartDataLabels],
  });

  addChartTitle(ctx, label);
}

function addChartTitle(ctx, label) {
  const chartContainer = ctx.parentElement;
  let existingTitle = chartContainer.querySelector(".chart-title");
  if (!existingTitle) {
    const title = document.createElement("div");
    title.className = "chart-title";
    title.innerText = label;
    title.style.textAlign = "center";
    title.style.marginTop = "10px";
    title.style.fontWeight = "bold";
    chartContainer.appendChild(title);
  }
}
