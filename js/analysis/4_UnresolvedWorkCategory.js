import { sharedData } from "../sharedData.js";
Chart.register(ChartDataLabels);

export function renderCountUnresolvedByCategory() {
  const container = document.getElementById("chartContainer");

  // Clear and inject chart title and canvas
  container.innerHTML = `
    <div style="height: 500px; display: flex; flex-direction: column; margin-top: 2rem;">
      <div style="text-align: center; color: #191919; font-weight: 600; font-size: 2rem; margin-bottom: 1rem;">
        Count of Unresolved Tickets by Work Category
      </div>
      <canvas id="myChart" style="flex-grow: 1; margin-top: 3rem;"></canvas>
    </div>
  `;

  const ctx = document.getElementById("myChart").getContext("2d");
  const data = sharedData.get();

  if (!data || !data.ticketsCountUnresolvedByCategory) {
    container.innerHTML = "<p>No data available.</p>";
    return;
  }

  const chartData = data.ticketsCountUnresolvedByCategory;

  const categoriesWithTotal = chartData.values.map((cat, index) => {
    const total =
      (cat.Urgent || 0) + (cat.High || 0) + (cat.Medium || 0) + (cat.Low || 0);
    return {
      label: chartData.labels[index],
      Urgent: cat.Urgent || 0,
      High: cat.High || 0,
      Medium: cat.Medium || 0,
      Low: cat.Low || 0,
      total,
    };
  });

  const filteredCategories = categoriesWithTotal
    .filter((cat) => cat.total > 0)
    .sort((a, b) => b.total - a.total);

  const labels = filteredCategories.map((cat) => cat.label);
  const totals = filteredCategories.map((cat) => cat.total);

  const priorityOrder = ["Urgent", "High", "Medium", "Low"];
  const priorityColors = {
    Low: "#a8e063",
    Medium: "#1e88e5",
    High: "#ff5252",
    Urgent: "#ff8a50",
    Unknown: "#bdc3c7", // Neutral Gray – for undefined cases
  };

  const datasets = priorityOrder.map((level) => ({
    label: level,
    data: filteredCategories.map((cat) => cat[level]),
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
        },
        y: {
          stacked: true,
          beginAtZero: true,
          grid: { display: true },
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
