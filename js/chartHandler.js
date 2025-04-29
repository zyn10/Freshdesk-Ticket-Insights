import { addChartTitle } from "./utils.js";

const chartColors = ["#8ed973", "#ff0000", "#e97132", "#0e9ed5"];

export function loadChartData() {
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
  if (!ctx) return;

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
  if (!ctx) return;

  const labels = data.labels.slice(0, 5);

  const datasets = ["Urgent", "High", "Medium", "Low"].map((level, i) => ({
    label: level,
    data: labels.map((label) => data.values[labels.indexOf(label)] || 0),
    backgroundColor: chartColors[i],
  }));

  new Chart(ctx, {
    type: "bar",
    data: { labels, datasets },
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
