import { sharedData } from "../sharedData.js";
Chart.register(ChartDataLabels);

export function renderTopResolvedClients() {
  const container = document.getElementById("chartContainer");

  container.innerHTML = `
    <div style="height: 500px; display: flex; flex-direction: column; margin-top: 2rem;">
      <div style="text-align: center; color: #191919; font-weight: 600; font-size: 2rem; margin-bottom: 1rem;">
        Top 5 Clients with Resolved Tickets
      </div>
      <canvas id="renderTopResolvedClients" style="flex-grow: 1; margin-top: 3rem;"></canvas>
    </div>
  `;

  const ctx = document
    .getElementById("renderTopResolvedClients")
    .getContext("2d");
  const data = sharedData.get();

  if (
    !data ||
    !data.topResolvedClients ||
    data.topResolvedClients.labels.length === 0
  ) {
    container.innerHTML = "<p>No resolved client data available.</p>";
    return;
  }

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: data.topResolvedClients.labels,
      datasets: [
        {
          label: "Resolved Tickets",
          data: data.topResolvedClients.values,
          backgroundColor: "#a8e063",
          barPercentage: 0.6,
          categoryPercentage: 0.7,
        },
      ],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: { left: 20, right: 20, top: 30 },
      },
      scales: {
        x: {
          beginAtZero: true,
          grid: { display: true },
          ticks: { precision: 0 },
        },
        y: {
          grid: { display: false },
        },
      },
      plugins: {
        legend: { display: false },
        datalabels: {
          color: "#333",
          anchor: "end",
          align: "end",
          font: { weight: "bold", size: 12 },
          formatter: (value) => (value > 0 ? value : ""),
        },
      },
    },
  });
}
