import "./index.css";
import { useEffect, useState } from "react";
import DragDropZone from "./components/DragDropZone";

import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDPNat2fnQsRmLQNSiajNDBQCqiqWaJXew",
  authDomain: "db-register-e2b63.firebaseapp.com",
  projectId: "db-register-e2b63",
  storageBucket: "db-register-e2b63.firebasestorage.app",
  messagingSenderId: "221112421572",
  appId: "1:221112421572:web:093e87ef2c46e0bc7dcd91",
  measurementId: "G-7HL2JGNJRX",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

function prettyAuthError(err) {
  const code = err?.code || "";
  if (code === "auth/user-not-found") return "Пользователь не найден";
  if (code === "auth/wrong-password") return "Неверный пароль";
  if (code === "auth/invalid-credential") return "Неверный email или пароль";
  if (code === "auth/invalid-email") return "Неверный формат email";
  if (code === "auth/email-already-in-use") return "Этот email уже занят";
  if (code === "auth/weak-password")
    return "Пароль должен быть минимум 6 символов";
  if (code === "auth/too-many-requests")
    return "Слишком много попыток. Попробуй позже";
  if (code === "auth/operation-not-allowed")
    return "Email/Password не включен в Firebase";
  return err?.message || "Ошибка авторизации";
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("signin");
  const [resetKey, setResetKey] = useState(0);
  const [userName, setUserName] = useState("User");
  const [userRole, setUserRole] = useState("user");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const isAdmin = String(userRole).trim().toLowerCase() === "admin";

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setIsLoggedIn(false);
        setUserName("User");
        setUserRole("user");
        setTimeout(() => {
          setLoading(false);
        }, 1200);

        localStorage.removeItem("lander_user");
        localStorage.removeItem("lander_nickname");
        localStorage.setItem("lander_auth", "0");
        return;
      }

      try {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);

        const profile = snap.exists() ? snap.data() : null;
        const nickname =
          profile?.nickname || user.email?.split("@")[0] || "User";
        const role = String(profile?.role || "user")
          .trim()
          .toLowerCase();
        const isAdmin = String(userRole).trim().toLowerCase() === "admin";
        console.log("RAW ROLE:", profile?.role);
        console.log("NORMALIZED ROLE:", role);
        console.log("ROLE JSON:", JSON.stringify(profile?.role));
        console.log("ROLE LENGTH:", String(profile?.role || "").length);

        setUserName(nickname);
        setUserRole(role);
        setIsLoggedIn(true);
        setShowAuth(false);
        setLoading(false);

        localStorage.setItem("lander_auth", "1");
        localStorage.setItem("lander_nickname", nickname);
        localStorage.setItem(
          "lander_user",
          JSON.stringify({
            nickname,
            email: user.email || "",
            role,
          }),
        );
      } catch (err) {
        console.error("Ошибка чтения профиля:", err);

        const nickname = user.email?.split("@")[0] || "User";
        setUserName(nickname);
        setUserRole("user");
        setIsLoggedIn(true);
        setShowAuth(false);
        setLoading(false);

        localStorage.setItem("lander_auth", "1");
        localStorage.setItem("lander_nickname", nickname);
        localStorage.setItem(
          "lander_user",
          JSON.stringify({
            nickname,
            email: user.email || "",
            role: "user",
          }),
        );
      }
    });

    return () => unsub();
  }, []);

  const handleBrandClick = () => {
    setShowAuth(false);
    setDropdownOpen(false);
    setResetKey((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSignIn = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    if (!email || !password) {
      alert("Введи email и пароль");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      e.currentTarget.reset();
      setShowAuth(false);
    } catch (err) {
      console.error(err);
      alert(prettyAuthError(err));
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const nickname = String(formData.get("nickname") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    if (!nickname || !email || !password) {
      alert("Заполни nickname, email и пароль");
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

      e.currentTarget.reset();
      setShowAuth(false);
    } catch (err) {
      console.error(err);
      alert(prettyAuthError(err));
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setDropdownOpen(false);
      setUserRole("user");
      setResetKey((prev) => prev + 1);
    } catch (err) {
      console.error(err);
      alert(prettyAuthError(err));
    }
  };

  const handleAdminPanel = () => {
    window.location.href = "/admin";
  };

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <div onClick={() => setDropdownOpen(false)}>
      <div className="page-bg"></div>

      <main className="wrap">
        <section className="hero">
          <header className="topbar">
            <div className="topbar__left">
              <div className="brand">
                <button
                  type="button"
                  className="brand__word"
                  onClick={handleBrandClick}
                >
                  LANDER
                </button>
              </div>
            </div>

            <div className="topbar__right">
              {isLoggedIn ? (
                <div
                  className={`user-menu ${dropdownOpen ? "is-open" : ""}`}
                  id="userMenu"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    className="user-avatar"
                    id="userAvatar"
                    onClick={() => setDropdownOpen((prev) => !prev)}
                  >
                    {userName?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div
                    className={`user-dropdown ${dropdownOpen ? "is-open" : ""}`}
                    id="userDropdown"
                  >
                    <div className="user-card">
                      <div className="user-card__avatar" id="userAvatarBig">
                        {userName?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      <div className="user-card__name" id="userName">
                        {userName}
                      </div>
                    </div>

                    <button
                      className="dropdown-item"
                      id="profileBtn"
                      type="button"
                    >
                      Profile
                    </button>

                    {isAdmin ? (
                      <button
                        className="dropdown-item admin-only"
                        id="adminBtn"
                        type="button"
                        onClick={handleAdminPanel}
                      >
                        Admin Panel(test)
                      </button>
                    ) : null}

                    <button
                      className="dropdown-item danger"
                      id="logoutBtn"
                      type="button"
                      onClick={handleLogout}
                    >
                      Выйти
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  className="btn btn--ghost"
                  type="button"
                  onClick={() => setShowAuth(true)}
                >
                  Sign In
                </button>
              )}
            </div>
          </header>

          <div className="upload-wrap">
            {isLoggedIn ? (
              <DragDropZone key={resetKey} />
            ) : (
              <div
                className="upload-box"
                style={{ cursor: "pointer" }}
                onClick={() => setShowAuth(true)}
              >
                <div className="upload-placeholder">
                  <div className="upload-icon">+</div>
                  <p className="upload-title">Перетащите фото сюда</p>
                  <p className="upload-sub">или нажмите для выбора</p>
                </div>
              </div>
            )}
          </div>

          <div className="grain" aria-hidden="true"></div>

          {showAuth && (
            <div
              className="modal-backdrop"
              id="authBackdrop"
              onClick={(e) => {
                if (e.target.id === "authBackdrop") setShowAuth(false);
              }}
            >
              <div
                className="modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="authTitle"
              >
                <button
                  className="modal__close"
                  type="button"
                  onClick={() => setShowAuth(false)}
                  aria-label="Close"
                >
                  ✕
                </button>

                <h2 className="modal__title" id="authTitle">
                  Welcome to LANDER
                </h2>
                <p className="modal__sub">
                  Sign in to save your uploads and access them from anywhere
                </p>

                <div
                  className="segmented"
                  role="tablist"
                  aria-label="Auth mode"
                >
                  <button
                    className={`segmented__btn ${authMode === "signin" ? "is-active" : ""}`}
                    type="button"
                    onClick={() => setAuthMode("signin")}
                  >
                    Sign In
                  </button>

                  <button
                    className={`segmented__btn ${authMode === "signup" ? "is-active" : ""}`}
                    type="button"
                    onClick={() => setAuthMode("signup")}
                  >
                    Sign Up
                  </button>
                </div>

                {authMode === "signin" && (
                  <form className="auth-form" onSubmit={handleSignIn}>
                    <label className="field">
                      <span className="field__label">Email</span>
                      <div className="field__control">
                        <input
                          className="field__input"
                          type="email"
                          name="email"
                          placeholder="Enter your email"
                          autoComplete="email"
                          required
                        />
                      </div>
                    </label>

                    <label className="field">
                      <span className="field__label">Password</span>
                      <div className="field__control">
                        <input
                          className="field__input"
                          type="password"
                          name="password"
                          placeholder="Enter your password"
                          autoComplete="current-password"
                          required
                        />
                      </div>
                    </label>

                    <button
                      className="btn btn--primary btn--full"
                      type="submit"
                    >
                      Sign In
                    </button>
                  </form>
                )}

                {authMode === "signup" && (
                  <form className="auth-form" onSubmit={handleSignUp}>
                    <label className="field">
                      <span className="field__label">Nickname</span>
                      <div className="field__control">
                        <input
                          className="field__input"
                          type="text"
                          name="nickname"
                          placeholder="Enter your nickname"
                          autoComplete="username"
                          required
                          minLength={3}
                          maxLength={20}
                        />
                      </div>
                    </label>

                    <label className="field">
                      <span className="field__label">Email</span>
                      <div className="field__control">
                        <input
                          className="field__input"
                          type="email"
                          name="email"
                          placeholder="Enter your email"
                          autoComplete="email"
                          required
                        />
                      </div>
                    </label>

                    <label className="field">
                      <span className="field__label">Password</span>
                      <div className="field__control">
                        <input
                          className="field__input"
                          type="password"
                          name="password"
                          placeholder="Create a password"
                          autoComplete="new-password"
                          required
                        />
                      </div>
                    </label>

                    <button
                      className="btn btn--primary btn--full"
                      type="submit"
                    >
                      Sign Up
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </section>
      </main>

      {!isLoggedIn && !showAuth && (
        <div className="lock-overlay" id="lockOverlay">
          <div className="lock-message">
            <div className="lock-icon">
              <img src="/assets/Lock.svg" alt="lock" />
            </div>
            <h2 className="lock-title">Требуется вход</h2>
            <p className="lock-text">
              Войдите в аккаунт, чтобы начать анализ изображений
            </p>
            <button className="lock-btn" onClick={() => setShowAuth(true)}>
              Войти
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
