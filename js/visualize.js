import { sharedData } from "./sharedData.js";
import { renderTopClients } from "./analysis/rendertopClients.js";
import { renderTicketsByStatus } from "./analysis/TicketsByStatus.js";
//import { renderUnresolvedByType } from "./analysis/unresolvedByType.js";
// import { renderUnresolvedByCustomer } from "./analysis/unresolvedByCustomer.js";

function processCSV(rawData) {
  const [headers, ...rows] = rawData;
  console.log("CSV Headers:", headers);

  const normalizedHeaders = headers.map((h) => h.trim().toLowerCase());

  const priorityIndex = normalizedHeaders.indexOf("priority");
  const tagsIndex = normalizedHeaders.indexOf("tags");
  const statusIndex = normalizedHeaders.indexOf("status");

  if (priorityIndex === -1 || tagsIndex === -1 || statusIndex === -1) {
    alert("Missing one or more required columns: Priority, Tags, Status");
    return {
      topClientsByPriority: { labels: [], values: [] },
      ticketsByStatus: { labels: [], values: [] },
    };
  }

  const clientMap = {};
  const statusMap = {};

  rows.forEach((row) => {
    const client = row[tagsIndex]?.trim() || "Unknown";
    const priority = row[priorityIndex]?.trim() || "Low";
    const status = row[statusIndex]?.trim() || "Unknown";

    if (!clientMap[client]) {
      clientMap[client] = { Urgent: 0, High: 0, Medium: 0, Low: 0 };
    }

    const normalized = priority.toLowerCase();
    if (normalized.includes("urgent")) clientMap[client].Urgent += 1;
    else if (normalized.includes("high")) clientMap[client].High += 1;
    else if (normalized.includes("med")) clientMap[client].Medium += 1;
    else clientMap[client].Low += 1;

    if (!statusMap[status]) {
      statusMap[status] = 0;
    }
    statusMap[status] += 1;
  });

  const labels = Object.keys(clientMap);
  const values = Object.values(clientMap);

  const statusLabels = Object.keys(statusMap);
  const statusValues = Object.values(statusMap);

  return {
    topClientsByPriority: {
      labels,
      values,
    },
    ticketsByStatus: {
      labels: statusLabels,
      values: statusValues,
    },
  };
}

document.addEventListener("DOMContentLoaded", () => {
  const raw = localStorage.getItem("parsedData");
  if (!raw) return alert("No data found in storage.");

  const parsed = JSON.parse(raw);

  if (Array.isArray(parsed[0])) {
    const processed = processCSV(parsed);
    console.log("Processed from CSV:", processed);
    sharedData.set(processed);
  } else {
    if (!parsed.ticketsByStatus || !parsed.topClientsByPriority) {
      console.warn("Missing keys in saved data. Reprocessing...");
      const fallbackRaw = parsed.rawData || parsed.data || [];
      const processed = processCSV(fallbackRaw);
      sharedData.set(processed);
    } else {
      console.log("Loaded parsed data:", parsed);
      sharedData.set(parsed);
    }
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
        case "ticketsByStatus":
          renderTicketsByStatus();
          break;
        case "unresolvedByType":
          // renderUnresolvedByType();
          break;
        case "unresolvedByCustomer":
          // renderUnresolvedByCustomer();
          break;
      }
    });
  });

  renderTopClients();
});
