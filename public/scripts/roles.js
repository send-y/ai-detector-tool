(function () {
  const AUTH_KEY = "lander_auth";    // "1" или "0"
  const ROLE_KEY = "lander_role";    // "user" | "admin"

  function applyRoleToBody() {
    const isAuthed = localStorage.getItem(AUTH_KEY) === "1";
    const role = localStorage.getItem(ROLE_KEY) || "user";

    // если не залогинен — роль не применяем
    document.body.classList.toggle("admin", isAuthed && role === "admin");
  }

  // демо: назначение админа по email (замени на свой)
  function isAdminEmail(email) {
    return String(email).trim().toLowerCase() === "admin@lander.com";
  }

  function wire() {
    const signInForm = document.getElementById("signInForm");
    if (signInForm && signInForm.dataset.rolesWired !== "1") {
      signInForm.dataset.rolesWired = "1";

      signInForm.addEventListener("submit", (e) => {
        const fd = new FormData(e.currentTarget);
        const email = String(fd.get("email") || "");

        localStorage.setItem(ROLE_KEY, isAdminEmail(email) ? "admin" : "user");
        applyRoleToBody();
      });
    }

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn && logoutBtn.dataset.rolesWired !== "1") {
      logoutBtn.dataset.rolesWired = "1";

      logoutBtn.addEventListener("click", () => {
        localStorage.setItem(ROLE_KEY, "user");
        applyRoleToBody();
      });
    }

    const adminBtn = document.getElementById("adminBtn");
    if (adminBtn && adminBtn.dataset.rolesWired !== "1") {
      adminBtn.dataset.rolesWired = "1";

      adminBtn.addEventListener("click", () => {
        // тут можно открыть отдельный модал или перейти на /admin
        // пока просто алерт
        alert("Админ панель (в разработке)");
      });
    }
  }

  function initWhenReady() {
    applyRoleToBody();

    let tries = 0;
    const maxTries = 50;
    const timer = setInterval(() => {
      tries += 1;
      wire();
      if (tries >= maxTries) clearInterval(timer);
    }, 100);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initWhenReady);
  } else {
    initWhenReady();
  }

  // на всякий случай обновлять роль при изменении localStorage в других вкладках
  window.addEventListener("storage", applyRoleToBody);
})();