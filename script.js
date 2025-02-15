document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("fileInput");
  const dropArea = document.getElementById("dropArea");

  if (!fileInput || !dropArea) {
    return console.error("File input elements not found!");
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

// **Allow only CSV files**
function isValidFileType(filename) {
  return filename.split(".").pop().toLowerCase() === "csv";
}

function handleFileSelection(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!isValidFileType(file.name)) {
    alert("Invalid file type! Please upload a CSV file.");
    event.target.value = "";
  } else {
    alert(`File "${file.name}" selected successfully.`);
    processCSVFile(file);
  }
}

function handleFileDrop(event, fileInput) {
  event.preventDefault();
  event.currentTarget.classList.remove("drag-over");

  const file = event.dataTransfer.files[0];
  if (!file) return;

  if (!isValidFileType(file.name)) {
    alert("Invalid file type! Please upload a CSV file.");
  } else {
    let dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    fileInput.files = dataTransfer.files;

    alert(`File "${file.name}" selected successfully.`);
    processCSVFile(file);
  }
}

// **Process CSV File**
function processCSVFile(file) {
  const reader = new FileReader();

  reader.onload = function (event) {
    const text = event.target.result;
    const rows = text.split("\n").map((row) => row.split(","));

    if (rows.length < 2) {
      alert("Invalid data format in file!");
      return;
    }

    // Extract headers and data rows
    const headers = rows[0].map((header) => header.trim());
    const dataRows = rows
      .slice(1)
      .filter((row) => row.length === headers.length);

    // Find required column indexes
    const statusIndex = headers.indexOf("Status");
    const priorityIndex = headers.indexOf("Priority");
    const typeIndex = headers.indexOf("Type");
    const tagsIndex = headers.indexOf("Tags");

    if ([statusIndex, priorityIndex, typeIndex, tagsIndex].includes(-1)) {
      alert("Missing required columns in file!");
      return;
    }

    let chartsData = {
      ticketsByStatus: {},
      unresolvedByType: {},
      topClientsByPriority: {},
      unresolvedByCustomer: {},
    };

    // Process data rows
    dataRows.forEach((row) => {
      const status = row[statusIndex]?.trim() || "";
      const priority = row[priorityIndex]?.trim() || "";
      const type = row[typeIndex]?.trim() || "";
      const tags = row[tagsIndex]?.trim() || "";

      // Extract customer name from Tags column
      const customer = tags.split(";")[0] || "Unknown"; // Assuming customers are separated by ";"

      // Chart 1: Count of tickets by Status
      if (status) {
        chartsData.ticketsByStatus[status] =
          (chartsData.ticketsByStatus[status] || 0) + 1;
      }

      // Chart 2: Unresolved Tickets by Type
      if (["Waiting on ThingTrax", "Waiting on Customer"].includes(status)) {
        chartsData.unresolvedByType[type] =
          (chartsData.unresolvedByType[type] || 0) + 1;
      }

      // Chart 3: Top 5 Clients by Resolved Ticket Priority
      if (["Resolved", "Closed"].includes(status)) {
        chartsData.topClientsByPriority[customer] =
          (chartsData.topClientsByPriority[customer] || 0) + 1;
      }

      // Chart 4: Unresolved Tickets by Customer (from Tags)
      if (["Waiting on ThingTrax", "Waiting on Customer"].includes(status)) {
        chartsData.unresolvedByCustomer[customer] =
          (chartsData.unresolvedByCustomer[customer] || 0) + 1;
      }
    });

    // Convert object to array format for charts
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

    // Save to session storage and redirect to chart page
    sessionStorage.setItem("chartsData", JSON.stringify(finalChartsData));
    window.location.href = "chart.html";
  };

  reader.readAsText(file);
}
