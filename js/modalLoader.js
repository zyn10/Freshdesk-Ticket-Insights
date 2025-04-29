// modalLoader.js
export async function loadProcessingModal() {
  const res = await fetch("processingModal.html");
  const html = await res.text();
  document.getElementById("modalContainer").innerHTML = html;
}

export function showModal(fileName = "Loading...") {
  const modal = new bootstrap.Modal(document.getElementById("processingModal"));
  document.getElementById("fileNameDisplay").textContent = fileName;
  modal.show();
}

export function hideModal() {
  const modalElement = document.getElementById("processingModal");
  const modalInstance = bootstrap.Modal.getInstance(modalElement);
  if (modalInstance) modalInstance.hide();
}
