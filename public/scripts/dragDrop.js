(function () {
  function init() {
    const dropZone = document.getElementById("dropZone");
    const fileInput = document.getElementById("photo");
    const preview = document.getElementById("previewImage");
    const placeholder = document.getElementById("placeholder");
    const removeBtn = document.getElementById("removeBtn");
    const uploadBtn = document.getElementById("uploadBtn");

    if (!dropZone || !fileInput || !preview || !placeholder || !removeBtn || !uploadBtn) {
      return false;
    }

    // защита от повторной инициализации
    if (dropZone.dataset.ddInited === "1") return true;
    dropZone.dataset.ddInited = "1";

    function setHasImage(has) {
      dropZone.classList.toggle("has-image", has);
      removeBtn.style.display = has ? "flex" : "none";
      uploadBtn.disabled = !has;
    }

    function handleFile(file) {
      if (!file || !file.type || !file.type.startsWith("image/")) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        preview.src = e.target?.result || "";
        setHasImage(true); // ← ключевое
      };
      reader.readAsDataURL(file);
    }

    // click -> open picker
    dropZone.addEventListener("click", () => fileInput.click());

    // drag ui
    dropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropZone.classList.add("dragover");
    });

    dropZone.addEventListener("dragleave", () => {
      dropZone.classList.remove("dragover");
    });

    // drop file
    dropZone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropZone.classList.remove("dragover");

      const file = e.dataTransfer?.files?.[0];
      if (!file) return;

      // пробуем положить файл в input чтобы работал submit формы
      try {
        const dt = new DataTransfer();
        dt.items.add(file);
        fileInput.files = dt.files;
      } catch (_) {}

      handleFile(file);
    });

    // picker change
    fileInput.addEventListener("change", () => {
      const file = fileInput.files?.[0];
      if (file) handleFile(file);
    });

    // remove
    removeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      preview.src = "";
      fileInput.value = "";
      setHasImage(false);
    });

    // initial state
    setHasImage(false);

    return true;
  }

  function initWhenReady() {
    let tries = 0;
    const maxTries = 50;

    const timer = setInterval(() => {
      tries += 1;
      const ok = init();
      if (ok || tries >= maxTries) clearInterval(timer);
    }, 100);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initWhenReady);
  } else {
    initWhenReady();
  }
})();