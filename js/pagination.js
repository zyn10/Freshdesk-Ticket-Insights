// js/pagination.js

export function setupPagination({ data, rowsPerPage = 10, onPageChange }) {
  let currentPage = 1;
  const totalPages = Math.ceil(data.length / rowsPerPage);

  const prevBtn = document.getElementById("prevPage");
  const nextBtn = document.getElementById("nextPage");
  const pageInfo = document.getElementById("pageInfo");

  function renderPage() {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const currentData = data.slice(start, end);

    onPageChange(currentData, currentPage, totalPages);
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
  }

  prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderPage();
    }
  });

  nextBtn.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderPage();
    }
  });

  renderPage(); // Initial render
}
