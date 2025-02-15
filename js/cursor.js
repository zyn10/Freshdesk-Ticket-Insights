// Create Cursor Elements
const cursor = document.createElement("div");
cursor.classList.add("custom-cursor");

const outline = document.createElement("div");
outline.classList.add("cursor-outline");

document.body.appendChild(cursor);
document.body.appendChild(outline);

// Move Cursor with Slight Delay
document.addEventListener("mousemove", (e) => {
  // Main red dot follows instantly
  cursor.style.left = `${e.clientX}px`;
  cursor.style.top = `${e.clientY}px`;

  // Outline follows with slight delay
  setTimeout(() => {
    outline.style.left = `${e.clientX}px`;
    outline.style.top = `${e.clientY}px`;
  }, 80); // Adjust delay for smooth trailing effect
});
