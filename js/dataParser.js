export function parseAndStoreFile(file) {
  const isCSV = file.name.endsWith(".csv");
  const isXLSX = file.name.endsWith(".xlsx");

  const columnsToKeep = [
    "Ticket ID",
    "Subject",
    "Status",
    "Priority",
    "Tags",
    "Group",
    "Type",
  ];

  if (isCSV) {
    Papa.parse(file, {
      complete: function (results) {
        const rows = results.data;

        const headerRow = rows[0];
        const dataRows = rows.slice(1);
        const indicesToKeep = columnsToKeep.map((col) =>
          headerRow.indexOf(col)
        );

        const reducedRows = [
          columnsToKeep,
          ...dataRows.map((row) => indicesToKeep.map((i) => row[i] ?? "")),
        ];

        localStorage.setItem("parsedData", JSON.stringify(reducedRows));
      },
      skipEmptyLines: true,
    });
  } else if (isXLSX) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const headerRow = rows[0];
      const dataRows = rows.slice(1);
      const indicesToKeep = columnsToKeep.map((col) => headerRow.indexOf(col));

      const reducedRows = [
        columnsToKeep,
        ...dataRows.map((row) => indicesToKeep.map((i) => row[i] ?? "")),
      ];

      localStorage.setItem("parsedData", JSON.stringify(reducedRows));
    };

    reader.readAsArrayBuffer(file);
  } else {
    alert("Unsupported file type");
  }
}
