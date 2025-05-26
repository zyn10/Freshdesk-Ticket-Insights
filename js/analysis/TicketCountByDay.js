import { sharedData } from "../sharedData.js";

Chart.register(window.ChartDataLabels);

export function renderTicketCountByDay() {
  const container = document.getElementById("chartContainer");
  container.innerHTML = '<canvas id="myChart"></canvas>';

  const ctx = document.getElementById("myChart").getContext("2d");

  const data = sharedData.get()?.ticketCountByDay;

  if (!data) {
    container.innerHTML = "<p>No data available.</p>";
    return;
  }

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: data.labels,
      datasets: [
        {
          label: "Tickets",
          data: data.values,
          backgroundColor: "#0e9ed5",
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
