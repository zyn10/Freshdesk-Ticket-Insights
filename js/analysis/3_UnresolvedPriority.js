import { sharedData } from "../sharedData.js";

export function renderUnresolvedPriority() {
  const ctxContainer = document.getElementById("chartContainer");

  ctxContainer.innerHTML = `
  <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center;">
    <div style="font-size: 1.4rem; font-weight: 700; margin-top: 15rem; color: #212529;">
      Unresolved Tickets by Priority
    </div>
    <div style="width: 100%; max-width: 500px; margin-top: 2rem; position: relative;">
      <canvas id="mainChart"></canvas>
      <div id="chartShadow" style="
        position: absolute;
        width: 70%;
        height: 20px;
        bottom: -15px;
        left: 15%;
        border-radius: 50%;
        background: radial-gradient(ellipse at center, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0) 70%);
        filter: blur(3px);
        z-index: -1;
      "></div>
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

  // Colors for slices
  const colors = {
    Low: "#a8e063",
    Medium: "#1e88e5",
    High: "#ff5252",
    Urgent: "#ff8a50",
    Unknown: "#bdc3c7",
  };

  // Plugin for 3D shadow effect - reduced opacity for lighter shadow
  const threeDPlugin = {
    id: "threeD",
    beforeDraw(chart) {
      const { ctx } = chart;

      chart.data.datasets.forEach((dataset, i) => {
        const meta = chart.getDatasetMeta(i);
        if (!meta.hidden) {
          meta.data.forEach((element) => {
            ctx.save();
            ctx.beginPath();
            ctx.arc(
              element.x,
              element.y + 7, // smaller shadow offset
              element.outerRadius * 0.95,
              element.startAngle,
              element.endAngle
            );
            ctx.arc(
              element.x,
              element.y + 1,
              element.innerRadius,
              element.endAngle,
              element.startAngle,
              true
            );
            ctx.closePath();
            ctx.fillStyle = "rgba(0, 0, 0, 0.07)";
            ctx.fill();
            ctx.restore();
          });
        }
      });
    },
  };

  // Start rotation angle
  let rotation = -30;

  // Create chart instance
  const chart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          label: "Unresolved Tickets by Priority",
          data: values,
          backgroundColor: labels.map((label) => colors[label] || "#999999"),
          borderColor: "#fff",
          borderWidth: 1,
          weight: 0.5,
        },
      ],
    },
    options: {
      responsive: true,
      cutout: "55%",
      rotation: rotation,
      borderRadius: 10,
      spacing: 2,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            padding: 20,
            usePointStyle: true,
            pointStyle: "circle",
            font: {
              size: 12,
            },
          },
        },
        tooltip: {
          enabled: false, // Disabled tooltip on hover
        },
        datalabels: {
          color: "#fff",
          font: {
            weight: "bold",
            size: 14,
          },
          formatter: function (value, context) {
            return `${context.chart.data.labels[context.dataIndex]}: ${value}`;
          },
        },
      },
      animation: {
        animateScale: true,
        animateRotate: false, // We'll handle rotation manually for smooth slow rotation
      },
    },
    plugins: [ChartDataLabels, threeDPlugin],
  });

  // Animate slow continuous rotation
  function rotateChart() {
    rotation += 0.1; // Adjust speed here (smaller number = slower)
    chart.options.rotation = rotation;
    chart.update("none"); // Update without animation for smoothness
    requestAnimationFrame(rotateChart);
  }
  rotateChart();
}
