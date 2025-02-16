document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname.includes("chart.html")) {
    loadChartData();
    return;
  }

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
});

const chartColors = ["#8ed973", "#ff0000", "#e97132", "#0e9ed5"];

// **Handle File Selection**
function handleFileSelection(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.name.toLowerCase().endsWith(".csv")) {
    alert("Invalid file type! Please upload a CSV file.");
    event.target.value = "";
  } else {
    processCSVFile(file);
  }
}

// **Handle File Drop**
function handleFileDrop(event, fileInput) {
  event.preventDefault();
  event.currentTarget.classList.remove("drag-over");

  const file = event.dataTransfer.files[0];
  if (!file) return;

  if (!file.name.toLowerCase().endsWith(".csv")) {
    alert("Invalid file type! Please upload a CSV file.");
  } else {
    let dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    fileInput.files = dataTransfer.files;

    processCSVFile(file);
  }
}

// **Process CSV File**
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
        "Missing required columns in file! Expected: Status, Priority, Type, Tags."
      );
      return;
    }

    const [statusIndex, priorityIndex, typeIndex, tagsIndex] = columnIndexes;

    let chartsData = {
      ticketsByStatus: {},
      unresolvedByType: {},
      topClientsByPriority: {},
      unresolvedByCustomer: {},
    };

    // Process data rows
    rows.slice(1).forEach((row) => {
      if (row.length !== headers.length) return;

      const status = row[statusIndex];
      const priority = row[priorityIndex];
      const type = row[typeIndex];
      const tags = row[tagsIndex];

      const customer = tags ? tags.split(";")[0] : "Unknown";

      if (status)
        chartsData.ticketsByStatus[status] =
          (chartsData.ticketsByStatus[status] || 0) + 1;

      if (["Waiting on ThingTrax", "Waiting on Customer"].includes(status)) {
        chartsData.unresolvedByType[type] =
          (chartsData.unresolvedByType[type] || 0) + 1;
      }

      if (["Resolved", "Closed"].includes(status)) {
        chartsData.topClientsByPriority[customer] =
          (chartsData.topClientsByPriority[customer] || 0) + 1;
      }

      if (["Waiting on ThingTrax", "Waiting on Customer"].includes(status)) {
        chartsData.unresolvedByCustomer[customer] =
          (chartsData.unresolvedByCustomer[customer] || 0) + 1;
      }
    });

    function convertToChartData(obj) {
      return {
        labels: Object.keys(obj),
        values: Object.values(obj),
      };
    }

    let finalChartsData = {
      ticketsByStatus: convertToChartData(chartsData.ticketsByStatus),
      unresolvedByType: convertToChartData(chartsData.unresolvedByType),
      topClientsByPriority: convertToChartData(chartsData.topClientsByPriority),
      unresolvedByCustomer: convertToChartData(chartsData.unresolvedByCustomer),
    };

    sessionStorage.setItem("chartsData", JSON.stringify(finalChartsData));
    window.location.href = "chart.html";
  };

  reader.readAsText(file);
}

// **Load Chart Data**
function loadChartData() {
  const storedData = sessionStorage.getItem("chartsData");
  if (!storedData) {
    console.error("No chart data found in sessionStorage.");
    return;
  }

  const chartsData = JSON.parse(storedData);

  createChart(
    "ticketsByStatusChart",
    "Tickets by Status",
    chartsData.ticketsByStatus,
    true // ✅ Only this chart is horizontal
  );
  createChart(
    "unresolvedByTypeChart",
    "Unresolved Tickets by Type",
    chartsData.unresolvedByType,
    false
  );
  createChart(
    "topClientsByPriorityChart",
    "Top Clients by Resolved Priority",
    chartsData.topClientsByPriority,
    false
  );
  createChart(
    "unresolvedByCustomerChart",
    "Unresolved Tickets by Customer",
    chartsData.unresolvedByCustomer,
    false
  );
}

// **Create Chart with Total Counters**
function createChart(canvasId, label, data, isHorizontal) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) {
    console.error(`Canvas element ${canvasId} not found.`);
    return;
  }

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: data.labels,
      datasets: [
        {
          label: label,
          data: data.values,
          backgroundColor: chartColors,
          borderRadius: 5,
        },
      ],
    },
    options: {
      indexAxis: isHorizontal ? "y" : "x", // ✅ Horizontal for Chart 1, Vertical for others
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          beginAtZero: true,
          grid: { display: false },
          ticks: { font: { size: 14 } },
        },
        y: {
          grid: { display: false },
          ticks: { font: { size: 14 } },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true },
        datalabels: {
          anchor: "end",
          align: "end",
          color: "#000",
          font: { weight: "bold", size: 14 },
          formatter: (value) => value, // ✅ Show total count at end of each bar
        },
      },
    },
    plugins: [ChartDataLabels],
  });

  // **Add title below the chart**
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
