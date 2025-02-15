function generateCharts(data) {
  const rows = data.split("\n");
  const labels = rows[0].split(",");
  const chartData = rows.slice(1).map((row) => row.split(","));

  // Example: Pie Chart for Status-wise Distribution
  const statusData = chartData.map((row) => row[2]); // Assuming status is in the 3rd column
  const statusCounts = {};
  statusData.forEach((status) => {
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });

  const ctxPie = document.createElement("canvas");
  ctxPie.id = "statusPieChart";
  document.getElementById("charts").appendChild(ctxPie);

  new Chart(ctxPie, {
    type: "pie",
    data: {
      labels: Object.keys(statusCounts),
      datasets: [
        {
          data: Object.values(statusCounts),
          backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "top" },
        title: { display: true, text: "Status-wise Distribution" },
      },
    },
  });

  // Add more charts (Line, Bar, Heatmap) similarly
}
