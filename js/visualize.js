import { sharedData } from "./sharedData.js";
import { renderUnresolvedPriority } from "./analysis/3_UnresolvedPriority.js";
import { renderCountUnresolvedByCategory } from "./analysis/4_UnresolvedWorkCategory.js";
import { renderTicketsByStatus } from "./analysis/5_TicketsByStatus.js";
import { renderTopClientsByResolvedClosed } from "./analysis/6_TopResolvedClients.js";
import { renderUnresolvedTicketsByType } from "./analysis/7_renderUnresolvedTicketsByType.js";

function processCSV(rawData) {
  const [headers, ...rows] = rawData;

  const normalizedHeaders = headers.map((h) => h.trim().toLowerCase());
  const priorityIndex = normalizedHeaders.indexOf("priority");
  const statusIndex = normalizedHeaders.indexOf("status");
  const groupIndex = normalizedHeaders.indexOf("group");
  const clientIndex = normalizedHeaders.indexOf("tags");
  const typeIndex = normalizedHeaders.indexOf("type"); // <-- New index for type column

  if (
    priorityIndex === -1 ||
    statusIndex === -1 ||
    groupIndex === -1 ||
    clientIndex === -1 ||
    typeIndex === -1 //
  ) {
    alert(
      "Missing one or more required columns: Priority, Status, Group, Client, Type"
    );
    return {
      ticketsByStatus: { labels: [], values: [] },
      ticketsCountUnresolvedByCategory: { labels: [], values: [] },
      topResolvedClientsByPriority: { labels: [], values: [] },
      unresolvedTicketsByType: { labels: [], values: [] }, // add empty default
    };
  }

  const statusMap = {};
  const unresolvedCategoryMap = {};
  const resolvedByClientMap = {};
  const unresolvedByTypeMap = {}; // <-- new map for unresolved by type

  rows.forEach((row) => {
    const priority = row[priorityIndex]?.trim() || "Low";
    const status = row[statusIndex]?.trim().toLowerCase();
    const group = row[groupIndex]?.trim() || "Unknown";
    const client = row[clientIndex]?.trim() || "Unknown";
    const type = row[typeIndex]?.trim() || "Unknown"; // read type

    // Count tickets by status
    if (!statusMap[status]) statusMap[status] = 0;
    statusMap[status] += 1;

    // Unresolved tickets grouped by group
    if (!["closed", "resolved"].some((s) => status.includes(s))) {
      // Group + Priority unresolved aggregation
      if (!unresolvedCategoryMap[group]) {
        unresolvedCategoryMap[group] = {
          Urgent: 0,
          High: 0,
          Medium: 0,
          Low: 0,
        };
      }

      const normalized = priority.toLowerCase();
      if (normalized.includes("urgent"))
        unresolvedCategoryMap[group].Urgent += 1;
      else if (normalized.includes("high"))
        unresolvedCategoryMap[group].High += 1;
      else if (normalized.includes("med"))
        unresolvedCategoryMap[group].Medium += 1;
      else unresolvedCategoryMap[group].Low += 1;

      // New: count unresolved by type (simple count)
      if (!unresolvedByTypeMap[type]) unresolvedByTypeMap[type] = 0;
      unresolvedByTypeMap[type] += 1;
    }
    // Resolved tickets grouped by client (tags)
    else {
      if (!resolvedByClientMap[client]) {
        resolvedByClientMap[client] = {
          Urgent: 0,
          High: 0,
          Medium: 0,
          Low: 0,
        };
      }

      const normalized = priority.toLowerCase();
      if (normalized.includes("urgent"))
        resolvedByClientMap[client].Urgent += 1;
      else if (normalized.includes("high"))
        resolvedByClientMap[client].High += 1;
      else if (normalized.includes("med"))
        resolvedByClientMap[client].Medium += 1;
      else resolvedByClientMap[client].Low += 1;
    }
  });

  return {
    ticketsByStatus: {
      labels: Object.keys(statusMap),
      values: Object.values(statusMap),
    },
    ticketsCountUnresolvedByCategory: {
      labels: Object.keys(unresolvedCategoryMap),
      values: Object.values(unresolvedCategoryMap),
    },
    topResolvedClientsByPriority: {
      labels: Object.keys(resolvedByClientMap),
      values: Object.values(resolvedByClientMap),
    },
    unresolvedTicketsByType: {
      // new aggregated data for your new chart
      labels: Object.keys(unresolvedByTypeMap),
      values: Object.values(unresolvedByTypeMap),
    },
  };
}

document.addEventListener("DOMContentLoaded", () => {
  const raw = localStorage.getItem("parsedData");
  if (!raw) return alert("No data found in storage.");

  const parsed = JSON.parse(raw);
  const processedData = Array.isArray(parsed[0])
    ? processCSV(parsed)
    : processCSV(parsed.rawData || parsed.data || []);

  sharedData.set(processedData);

  const tabButtons = document.querySelectorAll("#vizFilterTabs button");

  if (
    !document.querySelector("#vizFilterTabs button.active") &&
    tabButtons.length > 0
  ) {
    tabButtons[0].classList.add("active");
  }

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      tabButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const chartType = btn.dataset.filter;
      switch (chartType) {
        case "unresolvedPriority":
          renderUnresolvedPriority();
          break;
        case "unresolvedByCategory":
          renderCountUnresolvedByCategory();
          break;
        case "ticketsByStatus":
          renderTicketsByStatus();
          break; // <-- Added missing break
        case "topResolvedClients":
          renderTopClientsByResolvedClosed();
          break;
        case "unresolvedTicketsByType":
          renderUnresolvedTicketsByType();
          break;
        default:
          console.warn("Unknown chart type:", chartType);
      }
    });
  });

  const activeTab = document.querySelector("#vizFilterTabs button.active");
  if (activeTab) {
    const chartType = activeTab.dataset.filter;
    switch (chartType) {
      case "unresolvedPriority":
        renderUnresolvedPriority();
        break;
      case "unresolvedByCategory":
        renderCountUnresolvedByCategory();
        break;
      case "ticketsByStatus":
        renderTicketsByStatus();
        break;
      case "topResolvedClients":
        renderTopClientsByResolvedClosed();
        break;
      case "unresolvedTicketsByType":
        renderUnresolvedTicketsByType();
        break;
    }
  } else if (tabButtons.length > 0) {
    tabButtons[0].click();
  }
});
