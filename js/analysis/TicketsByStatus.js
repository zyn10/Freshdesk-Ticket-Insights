import { sharedData } from "../sharedData.js";
Chart.register(ChartDataLabels);

export function renderTicketsByStatus() {
  const container = document.getElementById("chartContainer");
  if (!container) {
    console.error("Container not found:");
    return null;
  }

  const data = sharedData.get();

  if (!data || !data.ticketsByStatus) {
    container.innerHTML = "<p>No data available to display.</p>";
    return null;
  }

  // Calculate total tickets
  const totalTickets = data.ticketsByStatus.values.reduce(
    (acc, val) => acc + val,
    0
  );

  // Combine Resolved and Closed into Completed
  const combinedData = {};
  let completedCount = 0;

  data.ticketsByStatus.labels.forEach((label, i) => {
    const count = data.ticketsByStatus.values[i];
    if (label === "Resolved" || label === "Closed") {
      completedCount += count;
    } else {
      combinedData[label] = count;
    }
  });

  if (completedCount > 0) {
    combinedData["Resolved/Closed"] = completedCount;
  }

  const entries = Object.entries(combinedData).sort((a, b) => b[1] - a[1]);

  const labels = entries.map((e) => e[0]);
  const counts = entries.map((e) => e[1]);

  const colors = {
    Open: "#e97132",
    "Waiting on ThingTrax": "#ff0000",
    "Waiting on Customer": "#0e9ed5",
    "Fixed/Waiting for Release": "#8ed973",
    "Resolved/Closed": "#9966FF",
    "Resloved/Testing Phase": "#FFCE56",
  };

  const maxCount = Math.max(...counts);

  container.innerHTML = `
    <div style="height: 500px; display: flex; flex-direction: column;">
      <div style="text-align: center; font-weight: 600; font-size: 1.8rem; margin-bottom: 0.5rem;">
        Tickets by Status
      </div>
      <div style="text-align: center; font-weight: 600; font-size: 1rem; color: #555;">
        Total Tickets: <span style="color: #e97132; font-size: 1rem;">${totalTickets}</span>
      </div>
      <canvas id="statusChart" style="flex-grow: 1;"></canvas>
    </div>
  `;

  const ctx = container.querySelector("#statusChart").getContext("2d");

  return new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: `Tickets Count`,
          data: counts,
          backgroundColor: labels.map((l) => colors[l] || "#ccc"),
          barPercentage: 1,
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
          max: maxCount * 1.1,
          grid: { display: false },
          ticks: { display: false },
        },
        y: { grid: { display: false } },
      },
      plugins: {
        datalabels: {
          color: "#000",
          font: { weight: "bold", size: 14 },
          display: (ctx) => ctx.dataset.data[ctx.dataIndex] > 0,
          formatter: (value) => (value > 0 ? value : ""),
          anchor: "end",
          align: "right",
          clamp: true,
          offset: 6,
        },
        legend: {
          display: true,
          position: "bottom",
          labels: {
            color: "#333",
            font: { size: 14 },
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
