document.addEventListener("DOMContentLoaded", () => {
  console.log("fileUpload.js loaded successfully!"); // Debugging

  const fileInput = document.getElementById("fileInput");
  const uploadBtn = document.getElementById("uploadBtn");
  const dropArea = document.getElementById("dropArea");

  if (!fileInput || !uploadBtn || !dropArea) {
    console.error("File input elements not found!");
    return;
  }

  // ✅ Open file picker when clicking the button
  uploadBtn.addEventListener("click", () => {
    console.log("Browse button clicked"); // Debugging
    fileInput.click();
  });

  // ✅ File type validation on selection
  fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];

    if (file) {
      console.log(`File selected: ${file.name}`); // Debugging
      const allowedExtensions = ["csv", "xlsx"];
      const fileExtension = file.name.split(".").pop().toLowerCase();

      if (!allowedExtensions.includes(fileExtension)) {
        alert("Invalid file type! Please upload a CSV or XLSX file.");
        fileInput.value = ""; // Reset input
      } else {
        alert(`File "${file.name}" selected successfully.`);
      }
    }
  });

  // ✅ Drag & Drop functionality
  dropArea.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropArea.classList.add("drag-over");
  });

  dropArea.addEventListener("dragleave", () => {
    dropArea.classList.remove("drag-over");
  });

  dropArea.addEventListener("drop", (event) => {
    event.preventDefault();
    dropArea.classList.remove("drag-over");

    const file = event.dataTransfer.files[0];

    if (file) {
      console.log(`File dropped: ${file.name}`); // Debugging
      const allowedExtensions = ["csv", "xlsx"];
      const fileExtension = file.name.split(".").pop().toLowerCase();

      if (!allowedExtensions.includes(fileExtension)) {
        alert("Invalid file type! Please upload a CSV or XLSX file.");
      } else {
        // ✅ Assign dropped file to input field correctly
        let dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;

        alert(`File "${file.name}" selected successfully.`);
      }
    }
  });
});
