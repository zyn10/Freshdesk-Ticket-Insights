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

  const tbody = document.createElement("tbody");
  data.slice(1).forEach((row) => {
    const tr = document.createElement("tr");
    row.forEach((cell) => {
      const td = document.createElement("td");
      td.textContent = cell?.trim?.() || "";
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
}
