// js/viewer.js
import { setupPagination } from "./pagination.js";

export function renderTableFromStorage() {
  const data = JSON.parse(localStorage.getItem("parsedData"));
  const table = document.getElementById("dataTable");

  if (!data || data.length === 0 || !table) {
    table.innerHTML = "<tr><td>No data found</td></tr>";
    return;
  }

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  data[0].forEach((header) => {
    const th = document.createElement("th");
    th.textContent = header.trim();
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const rowsData = data.slice(1);

  setupPagination({
    data: rowsData,
    rowsPerPage: 10,
    onPageChange: (pageData) => {
      const tbody = document.createElement("tbody");
      pageData.forEach((row) => {
        const tr = document.createElement("tr");
        row.forEach((cell) => {
          const td = document.createElement("td");
          td.textContent = cell?.trim?.() || "";
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
      // Clear previous table body and add new one
      table.querySelector("tbody")?.remove();
      table.appendChild(tbody);
    },
  });
}
