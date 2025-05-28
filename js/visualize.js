import { sharedData } from "./sharedData.js";
import { renderUnresolvedPriority } from "./analysis/3_UnresolvedPriority.js";
import { renderCountUnresolvedByCategory } from "./analysis/4_UnresolvedWorkCategory.js";
import { renderTicketsByStatus } from "./analysis/5_TicketsByStatus.js";
import { renderTopClientsByResolvedClosed } from "./analysis/6_TopResolvedClients.js";
import { renderUnresolvedTicketsByType } from "./analysis/7_renderUnresolvedTicketsByType.js";
import { renderTopResolvedClients } from "./analysis/9_TopResolvedClients.js";
import { renderTopUnresolvedClients } from "./analysis/10_TopUnresolvedClients.js";

// You will need to implement this in analysis/8_TopOpenClientsByPriority.js (example path)
import { renderTopOpenClientsByPriority } from "./analysis/8_TopOpenClientsByPriority.js";

function processCSV(rawData) {
  const [headers, ...rows] = rawData;

  const normalizedHeaders = headers.map((h) => h.trim().toLowerCase());
  const priorityIndex = normalizedHeaders.indexOf("priority");
  const statusIndex = normalizedHeaders.indexOf("status");
  const groupIndex = normalizedHeaders.indexOf("group");
  const clientIndex = normalizedHeaders.indexOf("tags");
  const typeIndex = normalizedHeaders.indexOf("type");

  if (
    priorityIndex === -1 ||
    statusIndex === -1 ||
    groupIndex === -1 ||
    clientIndex === -1 ||
    typeIndex === -1
  ) {
    alert(
      "Missing one or more required columns: Priority, Status, Group, Client, Type"
    );
    return {
      ticketsByStatus: { labels: [], values: [] },
      ticketsCountUnresolvedByCategory: { labels: [], values: [] },
      topResolvedClientsByPriority: { labels: [], values: [] },
      unresolvedTicketsByType: { labels: [], values: [] },
      topUnresolvedClients: { labels: [], values: [] },
      topResolvedClients: { labels: [], values: [] },
      topOpenClientsByPriority: { labels: [], values: [] }, // new empty default
    };
  }

  const statusMap = {};
  const unresolvedCategoryMap = {};
  const resolvedByClientMap = {};
  const unresolvedByTypeMap = {};
  const topUnresolvedByClientMap = {};
  const topResolvedByClientMap = {};
  const topOpenByClientMap = {}; // For open tickets by client with priority counts

  rows.forEach((row) => {
    const priorityRaw = row[priorityIndex]?.trim() || "Low";
    const priority = priorityRaw.toLowerCase();
    const status = row[statusIndex]?.trim().toLowerCase();
    const group = row[groupIndex]?.trim() || "Unknown";
    const client = row[clientIndex]?.trim() || "Unknown";
    const type = row[typeIndex]?.trim() || "Unknown";

    // Count tickets by status
    if (!statusMap[status]) statusMap[status] = 0;
    statusMap[status] += 1;

    // Unresolved tickets (status not closed or resolved)
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

      if (priority.includes("urgent")) unresolvedCategoryMap[group].Urgent += 1;
      else if (priority.includes("high"))
        unresolvedCategoryMap[group].High += 1;
      else if (priority.includes("med"))
        unresolvedCategoryMap[group].Medium += 1;
      else unresolvedCategoryMap[group].Low += 1;

      // Count unresolved by type
      if (!unresolvedByTypeMap[type]) unresolvedByTypeMap[type] = 0;
      unresolvedByTypeMap[type] += 1;

      // Count unresolved by client
      if (!topUnresolvedByClientMap[client])
        topUnresolvedByClientMap[client] = 0;
      topUnresolvedByClientMap[client] += 1;
    }

    // Resolved tickets
    if (["closed", "resolved"].some((s) => status.includes(s))) {
      // Group + Priority resolved aggregation
      if (!resolvedByClientMap[client]) {
        resolvedByClientMap[client] = {
          Urgent: 0,
          High: 0,
          Medium: 0,
          Low: 0,
        };
      }

      if (priority.includes("urgent")) resolvedByClientMap[client].Urgent += 1;
      else if (priority.includes("high")) resolvedByClientMap[client].High += 1;
      else if (priority.includes("med"))
        resolvedByClientMap[client].Medium += 1;
      else resolvedByClientMap[client].Low += 1;

      // Count resolved by client
      if (!topResolvedByClientMap[client]) topResolvedByClientMap[client] = 0;
      topResolvedByClientMap[client] += 1;
    } else {
      // This is the open ticket case: NOT resolved or closed (for your new chart)

      // Initialize client entry for open tickets by priority if not present
      if (!topOpenByClientMap[client]) {
        topOpenByClientMap[client] = {
          Urgent: 0,
          High: 0,
          Medium: 0,
          Low: 0,
        };
      }

      if (priority.includes("urgent")) topOpenByClientMap[client].Urgent += 1;
      else if (priority.includes("high")) topOpenByClientMap[client].High += 1;
      else if (priority.includes("med")) topOpenByClientMap[client].Medium += 1;
      else topOpenByClientMap[client].Low += 1;
    }
  });

  // Process top 5 clients with most unresolved tickets
  const topUnresolvedClients = Object.entries(topUnresolvedByClientMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .reduce(
      (acc, [client, count]) => {
        acc.labels.push(client);
        acc.values.push(count);
        return acc;
      },
      { labels: [], values: [] }
    );

  // Process top 5 clients with most resolved tickets
  const topResolvedClients = Object.entries(topResolvedByClientMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .reduce(
      (acc, [client, count]) => {
        acc.labels.push(client);
        acc.values.push(count);
        return acc;
      },
      { labels: [], values: [] }
    );

  // Process top 5 clients with most open tickets by priority (new)
  const topOpenClientsByPriority = Object.entries(topOpenByClientMap)
    .sort((a, b) => {
      // Sort by total count descending (sum of priorities)
      const sumA = a[1].Urgent + a[1].High + a[1].Medium + a[1].Low;
      const sumB = b[1].Urgent + b[1].High + b[1].Medium + b[1].Low;
      return sumB - sumA;
    })
    .slice(0, 5)
    .reduce(
      (acc, [client, priorityCounts]) => {
        acc.labels.push(client);
        acc.values.push(priorityCounts);
        return acc;
      },
      { labels: [], values: [] }
    );

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
      labels: Object.keys(unresolvedByTypeMap),
      values: Object.values(unresolvedByTypeMap),
    },
    topUnresolvedClients: topUnresolvedClients,
    topResolvedClients: topResolvedClients,
    topOpenClientsByPriority: topOpenClientsByPriority, // NEW dataset
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
        case "topResolvedClientsClosed":
          renderTopClientsByResolvedClosed();
          break;
        case "unresolvedTicketsByType":
          renderUnresolvedTicketsByType();
          break;
        case "topResolvedClients":
          renderTopResolvedClients();
          break;
        case "topUnresolvedClients":
          renderTopUnresolvedClients();
          break;
        case "topOpenClientsByPriority": // NEW tab case
          renderTopOpenClientsByPriority();
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
      case "topResolvedClientsClosed":
        renderTopClientsByResolvedClosed();
        break;
      case "unresolvedTicketsByType":
        renderUnresolvedTicketsByType();
        break;
      case "topResolvedClients":
        renderTopResolvedClients();
        break;
      case "topUnresolvedClients":
        renderTopUnresolvedClients();
        break;
      case "topOpenClientsByPriority": // NEW default render
        renderTopOpenClientsByPriority();
        break;
    }
  } else if (tabButtons.length > 0) {
    tabButtons[0].click();
  }
});
