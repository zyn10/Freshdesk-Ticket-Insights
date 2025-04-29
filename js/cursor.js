// cursor.js
export function initCursor() {
  const cursor = document.createElement("div");
  cursor.classList.add("custom-cursor");

  const outline = document.createElement("div");
  outline.classList.add("cursor-outline");

  document.body.appendChild(cursor);
  document.body.appendChild(outline);

  document.addEventListener("mousemove", (e) => {
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top = `${e.clientY}px`;

    setTimeout(() => {
      outline.style.left = `${e.clientX}px`;
      outline.style.top = `${e.clientY}px`;
    }, 80);
  });
}
