import { sharedData } from "../sharedData.js";
Chart.register(ChartDataLabels);

export function renderTopOpenClientsByPriority() {
  const container = document.getElementById("chartContainer");

  // Clear and inject chart title and canvas with the same design as your example
  container.innerHTML = `
    <div style="height: 500px; display: flex; flex-direction: column; margin-top: 2rem;">
      <div style="text-align: center; color: #191919; font-weight: 600; font-size: 2rem; margin-bottom: 1rem;">
        Top 5 Clients by Unresolved Tickets
      </div>
      <canvas id="myChart" style="flex-grow: 1; margin-top: 3rem;"></canvas>
    </div>
  `;

  const ctx = document.getElementById("myChart").getContext("2d");
  const data = sharedData.get();

  if (!data || !data.topOpenClientsByPriority) {
    container.innerHTML = "<p>No data available.</p>";
    return;
  }

  const chartData = data.topOpenClientsByPriority;

  // Calculate total per client for filtering and sorting
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

  // Filter out clients with zero total, sort descending by total, take top 5
  const filteredClients = clientsWithTotal
    .filter((client) => client.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const labels = filteredClients.map((client) => client.label);
  const totals = filteredClients.map((client) => client.total);

  // Priority order and colors matching your example's style
  const priorityOrder = ["Urgent", "High", "Medium", "Low"];
  const priorityColors = {
    Urgent: "#ff8a50",
    High: "#ff5252",
    Medium: "#1e88e5",
    Low: "#a8e063",
    Unknown: "#bdc3c7",
  };

  const datasets = priorityOrder.map((level) => ({
    label: level,
    data: filteredClients.map((client) => client[level]),
    backgroundColor: priorityColors[level],
    barPercentage: 0.6,
    categoryPercentage: 0.7,
  }));

  new Chart(ctx, {
    type: "bar",
    data: { labels, datasets },
    options: {
      indexAxis: "x", // vertical bars
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: { top: 20 },
      },
      scales: {
        x: {
          stacked: true,
          grid: { display: false },
          title: {
            display: true,
            text: "Clients",
            color: "#191919",
            font: { size: 14, weight: "600" },
          },
        },
        y: {
          stacked: true,
          beginAtZero: true,
          grid: { display: true },
          title: {
            display: true,
            text: "Number of Open Tickets",
            color: "#191919",
            font: { size: 14, weight: "600" },
          },
          ticks: {
            precision: 0,
          },
        },
      },
      plugins: {
        datalabels: {
          color: "#fff",
          font: { weight: "bold", size: 12 },
          display: (ctx) => ctx.dataset.data[ctx.dataIndex] > 0,
          formatter: (value) => (value > 0 ? value : ""),
        },
        legend: {
          position: "bottom",
          labels: {
            color: "#333",
            font: { size: 14 },
            usePointStyle: true,
            pointStyle: "circle",
            padding: 20,
          },
        },
        title: { display: false },
      },
      interaction: {
        mode: "nearest",
        axis: "x",
        intersect: false,
      },
    },
    plugins: [
      {
        id: "showTotals",
        afterDatasetsDraw(chart) {
          const {
            ctx,
            data,
            chartArea: { top },
            scales: { x, y },
          } = chart;

          ctx.font = "bold 14px Arial";
          ctx.textAlign = "center";
          ctx.fillStyle = "#333";

          data.datasets[0].data.forEach((_, index) => {
            const total = totals[index];
            if (total > 0) {
              const xPos = x.getPixelForValue(index);
              const yPos = y.getPixelForValue(total) - 10; // above the stacked bar
              ctx.fillText(total, xPos, yPos);
            }
          });
        },
      },
    ],
  });
}
