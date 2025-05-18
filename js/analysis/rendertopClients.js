import { sharedData } from "../sharedData.js";

Chart.register(ChartDataLabels);

export function renderTopClients() {
  const container = document.getElementById("chartContainer");
  container.innerHTML = '<canvas id="myChart"></canvas>';

  const ctx = document.getElementById("myChart").getContext("2d");
  const data = sharedData.get();

  if (!data || !data.topClientsByPriority) {
    container.innerHTML = "<p>No data available.</p>";
    return;
  }

  const chartData = data.topClientsByPriority;
  const labels = chartData.labels.slice(0, 5);

  const chartColors = ["#8ed973", "#ff0000", "#e97132", "#0e9ed5"];
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
        x: { stacked: true },
        y: { stacked: true },
      },
      plugins: {
        datalabels: {
          color: "#000",
          font: { weight: "bold", size: 14 },
        },
      },
    },
  });
}
