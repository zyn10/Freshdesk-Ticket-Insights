import { sharedData } from "../sharedData.js";
Chart.register(ChartDataLabels);

export function renderTopClients() {
  const container = document.getElementById("chartContainer");

  // Clear and inject canvas + chart title container
  container.innerHTML = `
    <div style="height: 500px; display: flex; flex-direction: column;">
      <canvas id="myChart" style="flex-grow: 1;"></canvas>
      <div style="text-align: center; margin-top: 1rem; font-weight: 600; font-size: 1.1rem;">
        Top 5 Clients by Total Ticket Priority
      </div>
    </div>
  `;

  const ctx = document.getElementById("myChart").getContext("2d");
  const data = sharedData.get();

  if (!data || !data.topClientsByPriority) {
    container.innerHTML = "<p>No data available.</p>";
    return;
  }

  const chartData = data.topClientsByPriority;

  const clientsWithTotal = chartData.values.map((client, index) => {
    const total =
      (client.Urgent || 0) +
      (client.High || 0) +
      (client.Medium || 0) +
      (client.Low || 0);

    return {
      label: chartData.labels[index],
      Urgent: client.Urgent || 0,
      High: client.High || 0,
      Medium: client.Medium || 0,
      Low: client.Low || 0,
      total,
    };
  });

  const topClients = clientsWithTotal
    .filter((client) => client.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const labels = topClients.map((client) => client.label);

  const chartColors = ["#8ed973", "#ff0000", "#e97132", "#0e9ed5"];
  const datasets = ["Urgent", "High", "Medium", "Low"].map((level, i) => ({
    label: level,
    data: topClients.map((client) => client[level]),
    backgroundColor: chartColors[i],
    barPercentage: 0.5, // reduce bar width
    categoryPercentage: 0.6,
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
        },
        y: {
          stacked: true,
          grid: { display: false },
          ticks: { display: false },
        },
      },
      plugins: {
        datalabels: {
          color: "#fff",
          font: { weight: "bold", size: 12 },
          display: (ctx) => ctx.dataset.data[ctx.dataIndex] > 0,
        },
        legend: {
          labels: { color: "#ccc" },
        },
      },
    },
  });
}
