import { initCursor } from "./cursor.js";
import { renderTableFromStorage } from "./viewer.js";
import { loadProcessingModal } from "./modalLoader.js";
import { initializeFileHandlers } from "./fileHandler.js";

function isViewerPage() {
  return window.location.pathname.endsWith("viewer.html");
}

document.addEventListener("DOMContentLoaded", () => {
  try {
    initCursor();
    loadProcessingModal();
    initializeFileHandlers();

    if (isViewerPage()) {
      renderTableFromStorage();
    }
  } catch (error) {
    console.error("Error during initialization:", error);
  }
});
