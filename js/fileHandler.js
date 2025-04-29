import { parseAndStoreFile } from "./dataParser.js";

export function initializeFileHandlers() {
  const fileInput = document.getElementById("fileInput");
  const dropArea = document.getElementById("dropArea");

  if (!fileInput || !dropArea) {
    console.error("File input elements not found!");
    return;
  }

  fileInput.addEventListener("change", handleFileSelection);
  dropArea.addEventListener("dragover", handleDragOver);
  dropArea.addEventListener("dragleave", handleDragLeave);
  dropArea.addEventListener("drop", handleFileDrop.bind(null, fileInput));
}

function handleDragOver(event) {
  event.preventDefault();
  event.currentTarget.classList.add("drag-over");
}

function handleDragLeave(event) {
  event.currentTarget.classList.remove("drag-over");
}

function handleFileSelection(event) {
  const file = event.target.files[0];
  if (file) {
    parseAndRedirect(file);
  }
}

function handleFileDrop(fileInput, event) {
  event.preventDefault();
  event.currentTarget.classList.remove("drag-over");

  const file = event.dataTransfer.files[0];
  if (file) {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    fileInput.files = dataTransfer.files;
    parseAndRedirect(file);
  }
}

function parseAndRedirect(file) {
  if (!isValidFileType(file)) {
    alert("Invalid file type. Please upload a CSV or XLSX file.");
    return;
  }

  showLoadingModal(file);

  parseAndStoreFile(file);

  setTimeout(() => {
    window.location.href = "viewer.html"; // Navigate to the next page
  }, 2000);
}

function isValidFileType(file) {
  const validExtensions = ["csv", "xlsx"];
  const fileExtension = file.name.split(".").pop().toLowerCase();
  return validExtensions.includes(fileExtension);
}

function showLoadingModal(file) {
  const modal = new bootstrap.Modal(document.getElementById("loadingModal"), {
    backdrop: "static",
    keyboard: false,
  });

  document.getElementById("fileNameDisplay").textContent = `File: ${file.name}`;
  modal.show();
}
