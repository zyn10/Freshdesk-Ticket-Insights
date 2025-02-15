function startUploading() {
  const uploadBox = document.querySelector(".upload-box");

  if (!uploadBox) {
    console.error("Upload box not found!");
    return;
  }

  uploadBox.classList.add("uploading"); // Start animation

  setTimeout(() => {
    uploadBox.classList.remove("uploading"); // Stop animation after 2s
    alert("File uploaded successfully! ✅");
  }, 2000); // Simulated upload time
}
