import { sharedData } from "../sharedData.js";
Chart.register(ChartDataLabels);

export function renderUnresolvedTicketsByType() {
  const container = document.getElementById("chartContainer");

  // Clear and add chart title and canvas
  container.innerHTML = `
    <div style="height: 500px; display: flex; flex-direction: column; margin-top: 2rem;">
      <div style="text-align: center; color: #191919; font-weight: 600; font-size: 2rem; margin-bottom: 1rem;">
        Unresolved Tickets by Type
      </div>
      <canvas id="unresolvedTypeChart" style="flex-grow: 1; margin-top: 3rem;"></canvas>
    </div>
  `;

  const ctx = document.getElementById("unresolvedTypeChart").getContext("2d");
  const data = sharedData.get();

  if (!data || !data.unresolvedTicketsByType) {
    container.innerHTML = "<p>No unresolved tickets data available.</p>";
    return;
  }

  const chartData = data.unresolvedTicketsByType;

  // Expecting chartData to be like { labels: ["type1", "type2"], values: [count1, count2] }
  if (
    !Array.isArray(chartData.labels) ||
    !Array.isArray(chartData.values) ||
    chartData.labels.length !== chartData.values.length
  ) {
    container.innerHTML =
      "<p>Invalid data format for unresolved tickets by type.</p>";
    return;
  }

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: chartData.labels,
      datasets: [
        {
          label: "Unresolved Tickets",
          data: chartData.values,
          backgroundColor: "#ff6f61", // nice red-orange color for unresolved
          barPercentage: 0.6,
          categoryPercentage: 0.7,
        },
      ],
    },
    options: {
      indexAxis: "x",
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: { display: false },
        },
        y: {
          beginAtZero: true,
          grid: { display: true },
          ticks: { precision: 0 }, // integer ticks
        },
      },
      plugins: {
        legend: { display: false },
        datalabels: {
          color: "#333",
          anchor: "end",
          align: "top",
          font: { weight: "bold", size: 12 },
          formatter: (value) => (value > 0 ? value : ""),
        },
        title: { display: false },
      },
    },
  });
}
