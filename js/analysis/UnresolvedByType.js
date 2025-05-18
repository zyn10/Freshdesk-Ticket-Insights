import ChartDataLabels from "chartjs-plugin-datalabels";
import { sharedData } from "../sharedData.js";

Chart.register(ChartDataLabels);

export function renderUnresolvedByType() {
  const container = document.getElementById("chartContainer");
  container.innerHTML = '<canvas id="myChart"></canvas>';

  const ctx = document.getElementById("myChart").getContext("2d");
  const data = sharedData.get().unresolvedByType;

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: data.labels,
      datasets: [
        {
          label: "Unresolved by Type",
          data: data.values,
          backgroundColor: "#e97132",
          borderRadius: 5,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        datalabels: {
          anchor: "end",
          align: "end",
          color: "#000",
          font: { weight: "bold", size: 14 },
        },
      },
      scales: {
        x: { ticks: { font: { size: 14 } } },
        y: { beginAtZero: true, ticks: { font: { size: 14 } } },
      },
    },
  });
}
