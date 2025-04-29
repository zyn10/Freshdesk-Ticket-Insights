export async function loadProcessingModal() {
  try {
    const res = await fetch("popupModal.html");
    if (!res.ok) throw new Error("Failed to fetch modal HTML");

    const html = await res.text();
    const modalContainer = document.getElementById("modalContainer");

    if (!modalContainer) {
      console.error('Element with id "modalContainer" not found.');
      return;
    }

    modalContainer.innerHTML = html;
  } catch (error) {
    console.error("Error loading processing modal:", error);
  }
}
