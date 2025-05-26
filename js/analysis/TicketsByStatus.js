import { sharedData } from "../sharedData.js";
Chart.register(ChartDataLabels);

export function renderTicketsByStatus() {
  const container = document.getElementById("chartContainer");
  if (!container) {
    console.error("Container not found:");
    return null;
  }

  container.innerHTML = `
    <div style="height: 500px; display: flex; flex-direction: column;">
      <div style="text-align: center; font-weight: 600; font-size: 1.1rem; margin-bottom: 0.5rem;">
        Tickets by Status
      </div>
      <canvas id="statusChart" style="flex-grow: 1;"></canvas>
    </div>
  `;

  const ctx = container.querySelector("#statusChart").getContext("2d");
  const data = sharedData.get();

  if (!data || !data.ticketsByStatus) {
    container.innerHTML = "<p>No data available to display.</p>";
    return null;
  }

  // Prepare chart data sorted descending
  const entries = data.ticketsByStatus.labels
    .map((label, i) => [label, data.ticketsByStatus.values[i]])
    .sort((a, b) => b[1] - a[1]);

  const labels = entries.map((e) => e[0]);
  const counts = entries.map((e) => e[1]);

  const colors = {
    Open: "#e97132",
    "In Progress": "#ff0000",
    Pending: "#0e9ed5",
    Resolved: "#8ed973",
    Closed: "#9966FF",
    Reopened: "#FFCE56",
  };

  return new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Tickets Count",
          data: counts,
          backgroundColor: labels.map((l) => colors[l] || "#ccc"),
          barPercentage: 0.5,
          categoryPercentage: 0.6,
        },
      ],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          beginAtZero: true,
          grid: { display: false },
          ticks: { display: false },
        },
        y: { grid: { display: false } },
      },
      plugins: {
        datalabels: {
          color: "#fff",
          font: { weight: "bold", size: 12 },
          display: (ctx) => ctx.dataset.data[ctx.dataIndex] > 0,
          formatter: (value) => (value > 0 ? value : ""),
          anchor: "end",
          align: "start",
        },
        legend: {
          display: true,
          position: "bottom",
          labels: {
            color: "#333",
            font: { size: 12 },
            usePointStyle: true,
            pointStyle: "circle",
            padding: 20,
            generateLabels(chart) {
              const data = chart.data;
              if (!data) {
                return [];
              }
              return data.labels.map((label, i) => ({
                text: label,
                fillStyle: colors[label] || "#ccc",
                strokeStyle: colors[label] || "#ccc",
                index: i,
                hidden: false,
                lineCap: "round",
                lineDash: [],
                lineDashOffset: 0,
                pointStyle: "circle",
                rotation: 0,
              }));
            },
          },
        },
        title: {
          display: false,
        },
      },
    },
  });
}
