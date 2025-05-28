import { sharedData } from "./sharedData.js";
import { renderUnresolvedPriority } from "./analysis/3_UnresolvedPriority.js";
import { renderCountUnresolvedByCategory } from "./analysis/4_UnresolvedWorkCategory.js";
import { renderTicketsByStatus } from "./analysis/5_TicketsByStatus.js";

function processCSV(rawData) {
  const [headers, ...rows] = rawData;

  const normalizedHeaders = headers.map((h) => h.trim().toLowerCase());
  const priorityIndex = normalizedHeaders.indexOf("priority");
  const statusIndex = normalizedHeaders.indexOf("status");
  const groupIndex = normalizedHeaders.indexOf("group");

  if (priorityIndex === -1 || statusIndex === -1 || groupIndex === -1) {
    alert("Missing one or more required columns: Priority, Status, Group");
    return {
      ticketsByStatus: { labels: [], values: [] },
      ticketsCountUnresolvedByCategory: { labels: [], values: [] },
    };
  }

  const statusMap = {};
  const unresolvedCategoryMap = {};
  const resolvedByClientMap = {};

  rows.forEach((row) => {
    const priority = row[priorityIndex]?.trim() || "Low";
    const status = row[statusIndex]?.trim().toLowerCase();
    const group = row[groupIndex]?.trim() || "Unknown";

    // Count tickets by status
    if (!statusMap[status]) statusMap[status] = 0;
    statusMap[status] += 1;

    // Count unresolved tickets by category
    if (!["solved", "closed", "resolved"].some((s) => status.includes(s))) {
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
    }
  });

  // Sort statuses using preferred order
  const preferredOrder = [
    "new",
    "open",
    "pending",
    "in progress",
    "on hold",
    "waiting",
    "solved",
    "resolved",
    "closed",
  ];

  const sortedStatuses = Object.entries(statusMap).sort(([a], [b]) => {
    const aIndex = preferredOrder.indexOf(a);
    const bIndex = preferredOrder.indexOf(b);
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return 0;
  });

  return {
    ticketsByStatus: {
      labels: sortedStatuses.map(([s]) => s),
      values: sortedStatuses.map(([, v]) => v),
    },
    ticketsCountUnresolvedByCategory: {
      labels: Object.keys(unresolvedCategoryMap),
      values: Object.values(unresolvedCategoryMap),
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
    }
  } else if (tabButtons.length > 0) {
    tabButtons[0].click();
  }
});
