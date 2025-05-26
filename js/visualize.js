import { sharedData } from "./sharedData.js";
import { renderTopClients } from "./analysis/rendertopClients.js";
import { renderTicketCountByDay } from "./analysis/TicketCountByDay.js";
// import { renderTicketsByStatus } from "./analysis/ticketsByStatus.js";
// import { renderUnresolvedByType } from "./analysis/unresolvedByType.js";
// import { renderUnresolvedByCustomer } from "./analysis/unresolvedByCustomer.js";

// 🔧 CSV Preprocessing Logic
function processCSV(rawData) {
  const [headers, ...rows] = rawData;
  const priorityIndex = headers.indexOf("Priority");
  const tagsIndex = headers.indexOf("Tags");

  const clientMap = {};

  rows.forEach((row) => {
    const client = row[tagsIndex] || "Unknown";
    const priority = row[priorityIndex] || "Low";

    if (!clientMap[client]) {
      clientMap[client] = { Urgent: 0, High: 0, Medium: 0, Low: 0 };
    }

    const normalized = priority.toLowerCase();
    if (normalized.includes("urgent")) clientMap[client].Urgent += 1;
    else if (normalized.includes("high")) clientMap[client].High += 1;
    else if (normalized.includes("med")) clientMap[client].Medium += 1;
    else clientMap[client].Low += 1;
  });

  const labels = Object.keys(clientMap);
  const values = Object.values(clientMap);

  return {
    topClientsByPriority: {
      labels,
      values,
    },
  };
}

document.addEventListener("DOMContentLoaded", () => {
  const raw = localStorage.getItem("parsedData");
  if (!raw) return alert("No data found in storage.");

  const parsed = JSON.parse(raw);

  // Determine if raw CSV array or already processed JSON
  if (Array.isArray(parsed[0])) {
    const processed = processCSV(parsed);
    sharedData.set(processed);
  } else {
    sharedData.set(parsed);
  }

  const tabButtons = document.querySelectorAll("#vizFilterTabs button");

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const type = btn.getAttribute("data-filter");

      switch (type) {
        case "topClients":
          renderTopClients();
          break;
        case "ticketCountByDay":
          renderTicketCountByDay();
          break;
        case "ticketsByStatus":
          renderTicketsByStatus();
          break;
        case "unresolvedByType":
          renderUnresolvedByType();
          break;
        case "unresolvedByCustomer":
          renderUnresolvedByCustomer();
          break;
      }
    });
  });

  renderTopClients(); // Default chart
});
