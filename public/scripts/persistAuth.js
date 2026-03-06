// public/scripts/persistAuth.js
// Пункты 4–5:
// 4) Восстановление UI юзера (ник справа + буква в аватарке) при перезагрузке
// 5) При перезагрузке ВСЕГДА сбрасываем загруженную картинку/превью и выключаем "Обработать"

(function () {
  const LS_AUTH_KEY = "lander_auth"; // "1" | "0"
  const LS_USER_KEY = "lander_user"; // {"nickname","email","role"}

  function setAuthed(isAuthed) {
    if (isAuthed) {
      document.body.classList.add("authenticated");
      document.body.classList.remove("locked");
      localStorage.setItem(LS_AUTH_KEY, "1");
    } else {
      document.body.classList.remove("authenticated");
      document.body.classList.add("locked");
      localStorage.setItem(LS_AUTH_KEY, "0");
    }
  }

  function applyUserUI(nickname) {
    const userName = document.getElementById("userName");
    const avatar = document.getElementById("userAvatar");

    const safe = String(nickname || "").trim();

    if (userName) userName.textContent = safe;
    if (avatar) avatar.textContent = safe ? safe.charAt(0).toUpperCase() : "";
  }

  function clearUploadUI() {
    const dropZone = document.getElementById("dropZone");
    const fileInput = document.getElementById("photo");
    const preview = document.getElementById("previewImage");
    const uploadBtn = document.getElementById("uploadBtn"); // кнопке "Обработать" дай id="uploadBtn"
    const removeBtn = document.getElementById("removeBtn");

    if (preview) preview.src = "";
    if (fileInput) fileInput.value = "";
    if (dropZone) dropZone.classList.remove("has-image", "dragover");
    if (removeBtn) removeBtn.style.display = "none";
    if (uploadBtn) uploadBtn.disabled = true;
  }

  function restoreAuthAndUI() {
    const isAuthed = localStorage.getItem(LS_AUTH_KEY) === "1";

    // (5) всегда сбрасываем картинку при перезагрузке
    clearUploadUI();

    if (!isAuthed) {
      setAuthed(false);
      applyUserUI("");
      document.body.classList.remove("admin");
      return;
    }

    // (4) восстановить юзера/ник/аватар
    try {
      const raw = localStorage.getItem(LS_USER_KEY);
      const user = raw ? JSON.parse(raw) : null;

      setAuthed(true);
      applyUserUI(user?.nickname || "User");

      // если у тебя есть admin логика через body.admin
      if (user?.role === "admin") document.body.classList.add("admin");
      else document.body.classList.remove("admin");
    } catch (_) {
      setAuthed(true);
      applyUserUI("User");
      document.body.classList.remove("admin");
    }
  }

  function wireLoginLogoutHooks() {
    const signInForm = document.getElementById("signInForm");
    const signUpForm = document.getElementById("signUpForm");
    const logoutBtn = document.getElementById("logoutBtn");

    // login (sign in): просто фиксируем auth=1, ник берём из сохранённого lander_user (если есть)
    if (signInForm && signInForm.dataset.persistWired !== "1") {
      signInForm.dataset.persistWired = "1";
      signInForm.addEventListener("submit", () => {
        localStorage.setItem(LS_AUTH_KEY, "1");

        // на всякий случай подтянем UI из lander_user
        try {
          const raw = localStorage.getItem(LS_USER_KEY);
          const user = raw ? JSON.parse(raw) : null;
          applyUserUI(user?.nickname || "User");
        } catch (_) {
          applyUserUI("User");
        }
      });
    }

    // signup: сохраняем nickname/email в lander_user + auth=1
    if (signUpForm && signUpForm.dataset.persistWired !== "1") {
      signUpForm.dataset.persistWired = "1";
      signUpForm.addEventListener("submit", () => {
        const fd = new FormData(signUpForm);
        const nickname = String(fd.get("nickname") || "").trim();
        const email = String(fd.get("email") || "").trim();

        if (nickname) {
          const user = { nickname, email, role: "user" };
          localStorage.setItem(LS_USER_KEY, JSON.stringify(user));
          localStorage.setItem(LS_AUTH_KEY, "1");
          applyUserUI(nickname);
          document.body.classList.remove("admin");
        }
      });
    }

    // logout
    if (logoutBtn && logoutBtn.dataset.persistWired !== "1") {
      logoutBtn.dataset.persistWired = "1";
      logoutBtn.addEventListener("click", () => {
        localStorage.setItem(LS_AUTH_KEY, "0");
        localStorage.removeItem(LS_USER_KEY);

        setAuthed(false);
        applyUserUI("");
        document.body.classList.remove("admin");

        // очистить формы + пароль
        const signIn = document.getElementById("signInForm");
        const signUp = document.getElementById("signUpForm");
        if (signIn) signIn.reset();
        if (signUp) signUp.reset();

        const pwd = signIn?.querySelector('input[name="password"]');
        if (pwd) pwd.type = "password";

        const eyeOpen = document.querySelector(".eye-open");
        const eyeClosed = document.querySelector(".eye-closed");
        if (eyeOpen) eyeOpen.hidden = true;
        if (eyeClosed) eyeClosed.hidden = false;

        // сбросить загрузку картинки
        clearUploadUI();
      });
    }
  }

  function initWhenReady() {
    restoreAuthAndUI();

    let tries = 0;
    const maxTries = 50;
    const timer = setInterval(() => {
      tries += 1;
      wireLoginLogoutHooks();
      if (tries >= maxTries) clearInterval(timer);
    }, 100);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initWhenReady);
  } else {
    initWhenReady();
  }
})();