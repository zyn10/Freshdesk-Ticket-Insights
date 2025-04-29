// dataParser.js
export function parseAndStoreFile(file) {
  const reader = new FileReader();
  const isCSV = file.name.endsWith(".csv");
  const isXLSX = file.name.endsWith(".xlsx");

  reader.onload = (e) => {
    let rows;

    if (isCSV) {
      const text = e.target.result;
      rows = text
        .split("\n")
        .filter((row) => row.trim() !== "")
        .map((row) => row.split(","));
    } else if (isXLSX) {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    } else {
      alert("Unsupported file type");
      return;
    }

    localStorage.setItem("parsedData", JSON.stringify(rows));
  };

  if (isCSV) {
    reader.readAsText(file);
  } else if (isXLSX) {
    reader.readAsArrayBuffer(file);
  } else {
    alert("Unsupported file type");
  }
}
