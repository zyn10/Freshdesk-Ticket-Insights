document.addEventListener("DOMContentLoaded", () => {
  const scripts = ["cursor.js", "fileUpload.js"];

  scripts.forEach((script) => {
    const scriptTag = document.createElement("script");
    scriptTag.src = `js/${script}`;
    scriptTag.defer = true;
    document.body.appendChild(scriptTag);
  });
});
