import { sharedData } from "../sharedData.js";
Chart.register(ChartDataLabels);

export function renderTopClientsByResolvedClosed() {
  const container = document.getElementById("chartContainer");
  if (!container) {
    console.error("Container #chartContainer not found.");
    return;
  }

  container.innerHTML = `
    <div style="height: 500px; display: flex; flex-direction: column; margin-top: 2rem;">
      <div style="text-align: center; color: #191919; font-weight: 600; font-size: 2rem; margin-bottom: 1rem;">
        Top 5 Clients by Resolved Tickets (Priority Breakdown)
      </div>
      <canvas id="myChart" style="flex-grow: 1; margin-top: 3rem;"></canvas>
    </div>
  `;

  const ctx = container.querySelector("#myChart").getContext("2d");
  const data = sharedData.get();

  if (!data || !data.topResolvedClientsByPriority) {
    container.innerHTML = "<p>No data available.</p>";
    return;
  }

  const chartData = data.topResolvedClientsByPriority;
  console.log("chartData", chartData);

  // Check data validity
  if (
    !Array.isArray(chartData.labels) ||
    !Array.isArray(chartData.values) ||
    chartData.labels.length !== chartData.values.length
  ) {
    container.innerHTML = "<p>Invalid data format.</p>";
    return;
  }

  // Prepare data - ensure we have all priority levels for each client
  const priorityLevels = ["Urgent", "High", "Medium", "Low"];
  const colors = {
    Urgent: "#e97132",
    High: "#ff0000",
    Medium: "#0e9ed5",
    Low: "#8ed973",
  };

  // Calculate totals and prepare top 5 clients
  const clientsWithData = chartData.labels.map((label, index) => {
    const clientData = chartData.values[index] || {};
    return {
      label,
      Urgent: clientData.Urgent || 0,
      High: clientData.High || 0,
      Medium: clientData.Medium || 0,
      Low: clientData.Low || 0,
      total:
        (clientData.Urgent || 0) +
        (clientData.High || 0) +
        (clientData.Medium || 0) +
        (clientData.Low || 0),
    };
  });

  const topClients = [...clientsWithData]
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  if (topClients.length === 0) {
    container.innerHTML = "<p>No clients with resolved tickets.</p>";
    return;
  }

  // Prepare datasets for each priority level
  const datasets = priorityLevels.map((level) => ({
    label: level,
    data: topClients.map((client) => client[level]),
    backgroundColor: colors[level],
    borderColor: "#fff",
    borderWidth: 1,
    barPercentage: 0.8,
    categoryPercentage: 0.8,
  }));

  // Create the chart
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: topClients.map((c) => c.label),
      datasets: datasets,
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          stacked: true,
          beginAtZero: true,
          title: {
            display: true,
            text: "Number of Resolved Tickets",
          },
          grid: {
            display: false,
          },
        },
        y: {
          stacked: true,
          grid: {
            display: false,
          },
        },
      },
      plugins: {
        datalabels: {
          color: "#fff",
          font: {
            weight: "bold",
            size: 12,
          },
          display: (ctx) => ctx.dataset.data[ctx.dataIndex] > 0,
          formatter: (value) => (value > 0 ? value : ""),
          anchor: "center",
          align: "center",
        },
        legend: {
          position: "bottom",
          labels: {
            color: "#333",
            font: {
              size: 12,
            },
            padding: 20,
            usePointStyle: true,
            pointStyle: "circle",
          },
        },
        tooltip: {
          callbacks: {
            afterBody: (context) => {
              const clientIndex = context[0].dataIndex;
              const total = topClients[clientIndex].total;
              return `Total Resolved: ${total}`;
            },
          },
        },
      },
    },
    plugins: [ChartDataLabels],
  });
}
