function startUploading() {
  const uploadBox = document.querySelector(".upload-box");
  if (!uploadBox) return console.error("Upload box not found!");

  uploadBox.classList.add("uploading");

  setTimeout(() => {
    uploadBox.classList.remove("uploading");
    alert("File uploaded successfully!");
  }, 2000);
}

function isValidFileType(filename) {
  return ["csv", "xlsx"].includes(filename.split(".").pop().toLowerCase());
}

function handleFileSelection(event) {
  const fileInput = event.target;
  const file = fileInput.files[0];
  if (!file) return;

  if (!isValidFileType(file.name)) {
    alert("Invalid file type! Please upload a CSV or XLSX file.");
    fileInput.value = "";
  } else {
    alert(`File "${file.name}" selected successfully.`);
    startUploading();
  }
}

function handleFileDrop(event, fileInput) {
  event.preventDefault();
  event.currentTarget.classList.remove("drag-over");

  const file = event.dataTransfer.files[0];
  if (!file) return;

  if (!isValidFileType(file.name)) {
    alert("Invalid file type! Please upload a CSV or XLSX file.");
  } else {
    let dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    fileInput.files = dataTransfer.files;

    alert(`File "${file.name}" selected successfully.`);
    startUploading();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("fileInput");
  const dropArea = document.getElementById("dropArea");
  if (!fileInput || !dropArea)
    return console.error("File input elements not found!");

  fileInput.addEventListener("change", handleFileSelection);

  dropArea.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropArea.classList.add("drag-over");
  });

  dropArea.addEventListener("dragleave", () =>
    dropArea.classList.remove("drag-over")
  );
  dropArea.addEventListener("drop", (event) =>
    handleFileDrop(event, fileInput)
  );
});
