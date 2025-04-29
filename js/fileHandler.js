import { validateAndProcessFile } from "./dataProcessor.js";

export function initializeFileHandlers() {
  const fileInput = document.getElementById("fileInput");
  const dropArea = document.getElementById("dropArea");

  if (!fileInput || !dropArea) {
    console.error("File input elements not found!");
    return;
  }

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
}

function handleFileSelection(event) {
  const file = event.target.files[0];
  validateAndProcessFile(file, event.target);
}

function handleFileDrop(event, fileInput) {
  event.preventDefault();
  event.currentTarget.classList.remove("drag-over");

  const file = event.dataTransfer.files[0];
  if (file) {
    let dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    fileInput.files = dataTransfer.files;
    validateAndProcessFile(file, fileInput);
  }
}
