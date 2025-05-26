import { sharedData } from "../sharedData.js";
Chart.register(ChartDataLabels);

export function renderTopClients() {
  const container = document.getElementById("chartContainer");

  // Clear and inject canvas + chart title container
  container.innerHTML = `
    <div style="height: 500px; display: flex; flex-direction: column;">
      <div style="text-align: center; font-weight: 600; font-size: 1.1rem; margin-bottom: 0.5rem;">
        Top 5 Clients by Total Ticket Priority
      </div>
      <canvas id="myChart" style="flex-grow: 1;"></canvas>
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
  const totals = topClients.map((client) => client.total);

  const chartColors = ["#e97132", "#ff0000", "#0e9ed5", "#8ed973"];
  const datasets = ["Urgent", "High", "Medium", "Low"].map((level, i) => ({
    label: level,
    data: topClients.map((client) => client[level]),
    backgroundColor: chartColors[i],
    barPercentage: 0.5,
    categoryPercentage: 0.6,
  }));

  new Chart(ctx, {
    type: "bar",
    data: { labels, datasets },
    options: {
      indexAxis: "y", // horizontal bars
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          right: 30,
        },
      },
      scales: {
        x: {
          stacked: true,
          beginAtZero: true,
          grid: { display: false },
          ticks: { display: false },
        },
        y: {
          stacked: true,
          grid: { display: false },
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
            font: { size: 12 },
            usePointStyle: true, // <--- enable point style
            pointStyle: "circle", // <--- make it a circle
            padding: 20, // optional: space around each legend item
          },
        },

        title: {
          display: false,
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
            font: { size: 12 },
            usePointStyle: true,
            pointStyle: "circle",
            padding: 20,
          },
        },
        title: {
          display: false,
        },
      },
    },
    plugins: [
      {
        id: "showTotals",
        afterDatasetsDraw(chart) {
          const {
            ctx,
            data,
            chartArea: { left, right, top, bottom, width, height },
            scales: { x, y },
          } = chart;

          ctx.font = "bold 12px Arial";
          ctx.textAlign = "left";
          ctx.fillStyle = "#333";

          data.datasets[0].data.forEach((value, index) => {
            const total = totals[index];
            if (total > 0) {
              // x position at the end of stacked bar
              const xPos = x.getPixelForValue(total) + 5; // 5px padding to right
              // y position centered on the bar
              const yPos = y.getPixelForValue(index);

              ctx.fillText(total, xPos, yPos + 4); // +4 to align vertically better
            }
          });
        },
      },
    ],
  });
}
