import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

(function () {
  const LS_USER_KEY = "lander_user";

  const fb = window.__fb;
  if (!fb?.app) {
    console.error("Firebase not initialized. Check public/scripts/firebase.js and index.html order.");
    return;
  }

  const auth = getAuth(fb.app);
  const db = getFirestore(fb.app);

  function applyUserUI(nickname) {
    const userName = document.getElementById("userName");
    const userNameTop = document.getElementById("userNameTop");
    const userAvatar = document.getElementById("userAvatar");
    const userAvatarBig = document.getElementById("userAvatarBig");

    const name = (nickname || "").trim();
    const letter = name ? name.charAt(0).toUpperCase() : "";

    if (userName) userName.textContent = name || "User";
    if (userNameTop) userNameTop.textContent = name || "";
    if (userAvatar) userAvatar.textContent = letter;
    if (userAvatarBig) userAvatarBig.textContent = letter;
  }

  function setAuth(isAuthed) {
    if (isAuthed) {
      document.body.classList.add("authenticated");
      document.body.classList.remove("locked");
    } else {
      document.body.classList.remove("authenticated");
      document.body.classList.add("locked");
    }
  }

  async function loadProfile(uid, fallbackEmail) {
    const snap = await getDoc(doc(db, "users", uid));
    if (!snap.exists()) {
      return {
        nickname: (fallbackEmail || "User").split("@")[0] || "User",
        email: fallbackEmail || "",
        role: "user",
      };
    }
    return snap.data();
  }

  function prettyAuthError(err) {
    const code = err?.code || "";
    if (code === "auth/user-not-found") return "User not found (email not registered).";
    if (code === "auth/wrong-password") return "Wrong password.";
    if (code === "auth/invalid-email") return "Invalid email format.";
    if (code === "auth/too-many-requests") return "Too many attempts. Try later.";
    if (code === "auth/email-already-in-use") return "Email already in use.";
    if (code === "auth/weak-password") return "Weak password (min 6 chars).";
    if (code === "auth/operation-not-allowed") return "Email/Password provider is disabled in Firebase Auth.";
    return err?.message || "Auth error";
  }

  function init() {
    const openBtn = document.getElementById("openAuth");
    const closeBtn = document.getElementById("closeAuth");
    const backdrop = document.getElementById("authBackdrop");
    const lockLoginBtn = document.getElementById("lockLoginBtn");

    const tabIn = document.getElementById("tabSignIn");
    const tabUp = document.getElementById("tabSignUp");
    const formIn = document.getElementById("signInForm");
    const formUp = document.getElementById("signUpForm");
    const signInForm = document.getElementById("signInForm");
    const signUpForm = document.getElementById("signUpForm");

    const togglePwd = document.getElementById("togglePwd");
    const pwdInput = formIn?.querySelector('input[name="password"]');

    const logoutBtn =
      document.getElementById("logoutBtn") ||
      document.querySelector("[data-logout]") ||
      null;

    if (!openBtn || !closeBtn || !backdrop || !tabIn || !tabUp || !formIn || !formUp || !signInForm || !signUpForm) {
      return false;
    }

    if (document.body.dataset.loginInited === "1") return true;
    document.body.dataset.loginInited = "1";

    function openModal() {
      backdrop.hidden = false;
      setTab("in");
    }

    function closeModal() {
      backdrop.hidden = true;
    }

    function setTab(mode) {
      const isIn = mode === "in";

      tabIn.classList.toggle("is-active", isIn);
      tabUp.classList.toggle("is-active", !isIn);

      tabIn.setAttribute("aria-selected", String(isIn));
      tabUp.setAttribute("aria-selected", String(!isIn));

      formIn.hidden = !isIn;
      formUp.hidden = isIn;
    }

    openBtn.addEventListener("click", openModal);

    closeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeModal();
    });

    document.addEventListener("keydown", (e) => {
      if (!backdrop.hidden && e.key === "Escape") closeModal();
    });

    tabIn.addEventListener("click", () => setTab("in"));
    tabUp.addEventListener("click", () => setTab("up"));

    if (togglePwd && pwdInput) {
      const eyeOpen = togglePwd.querySelector(".eye-open");
      const eyeClosed = togglePwd.querySelector(".eye-closed");

      togglePwd.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        const isHidden = pwdInput.type === "password";
        pwdInput.type = isHidden ? "text" : "password";

        if (eyeOpen) eyeOpen.hidden = !isHidden;
        if (eyeClosed) eyeClosed.hidden = isHidden;
      });
    }

    lockLoginBtn?.addEventListener("click", () => openBtn.click());

    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setAuth(false);
        applyUserUI("");
        localStorage.removeItem(LS_USER_KEY);
        return;
      }

      try {
        const profile = await loadProfile(user.uid, user.email || "");
        const nickname = profile?.nickname || user.email?.split("@")[0] || "User";

        setAuth(true);
        applyUserUI(nickname);

        backdrop.hidden = true;

        localStorage.setItem(
          LS_USER_KEY,
          JSON.stringify({ nickname, email: user.email, role: profile?.role || "user" })
        );
      } catch (e) {
        setAuth(true);
        applyUserUI(user.email?.split("@")[0] || "User");
        backdrop.hidden = true;
      }
    });

    signInForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const fd = new FormData(signInForm);
      const email = String(fd.get("email") || "").trim();
      const password = String(fd.get("password") || "");

      if (!email || !password) {
        alert("Enter email and password.");
        return;
      }

      try {
        await signInWithEmailAndPassword(auth, email, password);
        backdrop.hidden = true;
        signInForm.reset();
      } catch (err) {
        console.error(err);
        alert(prettyAuthError(err));
      }
    });

    signUpForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const fd = new FormData(signUpForm);
      const nickname = String(fd.get("nickname") || "").trim();
      const email = String(fd.get("email") || "").trim();
      const password = String(fd.get("password") || "");

      if (!nickname || !email || !password) {
        alert("Fill nickname, email and password.");
        return;
      }

      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);

        await setDoc(doc(db, "users", cred.user.uid), {
          nickname,
          email,
          role: "user",
          createdAt: serverTimestamp(),
        });

        backdrop.hidden = true;
        signUpForm.reset();
        signInForm.reset();
      } catch (err) {
        console.error(err);
        alert(prettyAuthError(err));
      }
    });

    if (logoutBtn) {
      logoutBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        try {
          await signOut(auth);
        } catch (err) {
          console.error(err);
          alert("Logout failed: " + prettyAuthError(err));
        }
      });
    } else {
      window.__logout = async () => signOut(auth);
    }

    return true;
  }

  function initWhenReady() {
    let tries = 0;
    const maxTries = 300;

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