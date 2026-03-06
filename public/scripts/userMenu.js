(function () {
  const NAME_KEY = "lander_nickname";

  function init() {
    const userMenu = document.getElementById("userMenu");
    const avatar = document.getElementById("userAvatar");
    const dropdown = document.getElementById("userDropdown");
    const userName = document.getElementById("userName");

    if (!userMenu || !avatar || !dropdown || !userName) return false;

    // выставить имя (если нет — "User")
    const nick = localStorage.getItem(NAME_KEY);
    userName.textContent = nick ? nick : "User";

    function setOpen(open) {
      dropdown.classList.toggle("is-open", open);
      userMenu.classList.toggle("is-open", open);
    }

    // toggle по клику
    avatar.addEventListener("click", (e) => {
      e.stopPropagation();
      setOpen(!dropdown.classList.contains("is-open"));
    });

    // закрывать по клику вне
    document.addEventListener("click", () => setOpen(false));

    // закрывать по Esc
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setOpen(false);
    });

    return true;
  }

  function initWhenReady() {
    let tries = 0;
    const t = setInterval(() => {
      tries++;
      if (init() || tries > 50) clearInterval(t);
    }, 100);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initWhenReady);
  } else {
    initWhenReady();
  }
})();