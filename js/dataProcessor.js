export function validateAndProcessFile(file, inputElement) {
  if (!file || !file.name.toLowerCase().endsWith(".csv")) {
    alert("Invalid file type! Please upload a CSV file.");
    inputElement.value = "";
    return;
  }
  processCSVFile(file);
}

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
