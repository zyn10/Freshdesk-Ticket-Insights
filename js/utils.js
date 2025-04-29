export function addChartTitle(ctx, label) {
  const chartContainer = ctx.parentElement;
  let existingTitle = chartContainer.querySelector(".chart-title");
  if (!existingTitle) {
    const title = document.createElement("div");
    title.className = "chart-title";
    title.innerText = label;
    title.style.textAlign = "center";
    title.style.marginTop = "10px";
    title.style.fontWeight = "bold";
    chartContainer.appendChild(title);
  }
}
