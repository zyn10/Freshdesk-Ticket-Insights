import ChartDataLabels from "chartjs-plugin-datalabels";
import { sharedData } from "../sharedData.js";

Chart.register(ChartDataLabels);

const chartColors = ["#8ed973", "#ff0000", "#e97132", "#0e9ed5"];

export function renderUnresolvedByCustomer() {
  const container = document.getElementById("chartContainer");
  container.innerHTML = '<canvas id="myChart"></canvas>';

  const ctx = document.getElementById("myChart").getContext("2d");
  const chartData = sharedData.get().unresolvedByCustomer;

  const labels = chartData.labels.slice(0, 5);
  const datasets = ["Urgent", "High", "Medium", "Low"].map((level, i) => ({
    label: level,
    data: chartData.values.map((client) => client[level] || 0),
    backgroundColor: chartColors[i],
  }));

  new Chart(ctx, {
    type: "bar",
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { stacked: true, ticks: { font: { size: 14 } } },
        y: { stacked: true, ticks: { font: { size: 14 } }, beginAtZero: true },
      },
      plugins: {
        legend: { display: true },
        datalabels: {
          anchor: "end",
          align: "end",
          color: "#000",
          font: { weight: "bold", size: 14 },
        },
      },
    },
  });
}
