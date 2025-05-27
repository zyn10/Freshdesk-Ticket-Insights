import { sharedData } from "../sharedData.js";

export function renderUnresolvedPriority() {
  const ctxContainer = document.getElementById("chartContainer");

  ctxContainer.innerHTML = `
  <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center;">
    <div style="font-size: 1.5rem; font-weight: 700; margin-top: 15rem; color: #212529;">
      Unresolved Tickets by Priority
    </div>
    <div style="width: 100%; max-width: 500px;margin-top: 2rem;">
      <canvas id="mainChart"></canvas>
    </div>
  </div>
`;

  const ctx = document.getElementById("mainChart").getContext("2d");

  const raw = sharedData.get();
  const data = localStorage.getItem("parsedData");
  if (!data || !raw) {
    alert("Raw data not available.");
    return;
  }

  const parsed = JSON.parse(data);
  const [headers, ...rows] = parsed;
  const headerIndex = headers.reduce((acc, h, i) => {
    acc[h.trim().toLowerCase()] = i;
    return acc;
  }, {});

  const priorityIndex = headerIndex["priority"];
  const statusIndex = headerIndex["status"];
  if (priorityIndex === undefined || statusIndex === undefined) {
    alert("Missing 'Priority' or 'Status' column.");
    return;
  }

  const unresolved = rows.filter((row) => {
    const status = row[statusIndex]?.toLowerCase();
    return status !== "resolved" && status !== "closed";
  });

  if (!unresolved.length) {
    alert("No unresolved tickets found.");
    return;
  }

  const counts = {};
  unresolved.forEach((row) => {
    const priority = row[priorityIndex]?.trim() || "Unknown";
    counts[priority] = (counts[priority] || 0) + 1;
  });

  const labels = Object.keys(counts);
  const values = Object.values(counts);
  const colors = {
    Low: "#8ed973", // Green
    Medium: "#0e9ed5", // Blue
    High: "#ff0000", // Red
    Urgent: "#e97132", // Orange
    Unknown: "#95a5a6", // Fallback for unrecognized priorities
  };

  const chart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          label: "Unresolved Tickets by Priority",
          data: values,
          backgroundColor: labels.map((label) => colors[label] || "#CCCCCC"),
          borderColor: "#fff",
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom",
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `${context.label}: ${context.parsed}`;
            },
          },
        },
        datalabels: {
          color: "#fff",
          font: {
            weight: "bold",
            size: 12,
          },
          formatter: (value, context) => {
            return value > 0
              ? `${context.chart.data.labels[context.dataIndex]} ${value}`
              : "";
          },
        },
      },
    },
    plugins: [ChartDataLabels],
  });
}
