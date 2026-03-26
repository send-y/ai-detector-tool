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
  collection,
  query,
  orderBy,
  limit,
  getDocs,
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
  if (code === "auth/weak-password") {
    return "Пароль должен быть минимум 6 символов";
  }
  if (code === "auth/too-many-requests") {
    return "Слишком много попыток. Попробуй позже";
  }
  if (code === "auth/operation-not-allowed") {
    return "Email/Password не включен в Firebase";
  }
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
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  const isAdmin = String(userRole).trim().toLowerCase() === "admin";

  const loadUserAnalyses = async (uid) => {
    try {
      const q = query(
        collection(db, "users", uid, "analyses"),
        orderBy("createdAt", "desc"),
        limit(20)
      );

      const snap = await getDocs(q);

      const items = snap.docs.map((itemDoc) => {
        const data = itemDoc.data();
        return {
          id: itemDoc.id,
          ...data,
          createdAt: data?.createdAt?.toDate
            ? data.createdAt.toDate().toISOString()
            : null,
        };
      });

      setAnalysisHistory(items);
    } catch (err) {
      console.error("Ошибка загрузки истории анализов:", err);
      setAnalysisHistory([]);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setIsLoggedIn(false);
        setUserName("User");
        setUserRole("user");
        setAnalysisHistory([]);
        setHistoryModalOpen(false);

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

        setUserName(nickname);
        setUserRole(role);
        setIsLoggedIn(true);
        setShowAuth(false);
        setLoading(false);

        await loadUserAnalyses(user.uid);

        localStorage.setItem("lander_auth", "1");
        localStorage.setItem("lander_nickname", nickname);
        localStorage.setItem(
          "lander_user",
          JSON.stringify({
            nickname,
            email: user.email || "",
            role,
          })
        );
      } catch (err) {
        console.error("Ошибка чтения профиля:", err);

        const nickname = user.email?.split("@")[0] || "User";
        setUserName(nickname);
        setUserRole("user");
        setIsLoggedIn(true);
        setShowAuth(false);
        setLoading(false);

        await loadUserAnalyses(user.uid);

        localStorage.setItem("lander_auth", "1");
        localStorage.setItem("lander_nickname", nickname);
        localStorage.setItem(
          "lander_user",
          JSON.stringify({
            nickname,
            email: user.email || "",
            role: "user",
          })
        );
      }
    });

    return () => unsub();
  }, []);

  const handleBrandClick = () => {
    setShowAuth(false);
    setDropdownOpen(false);
    setHistoryModalOpen(false);
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
      setAnalysisHistory([]);
      setHistoryModalOpen(false);
      setResetKey((prev) => prev + 1);
    } catch (err) {
      console.error(err);
      alert(prettyAuthError(err));
    }
  };

  const handleAdminPanel = () => {
    window.location.href = "/admin";
  };

  const handleAnalysisSaved = (item) => {
    setAnalysisHistory((prev) => [item, ...prev].slice(0, 20));
  };

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <div
      onClick={() => {
        setDropdownOpen(false);
      }}
    >
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

                    <div className="profile-history">
                      <div className="profile-history__title">
                        История анализов
                      </div>

                      {analysisHistory.length === 0 ? (
                        <div className="profile-history__empty">
                          Пока нет анализов
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="last-analysis-btn"
                          onClick={() => {
                            setDropdownOpen(false);
                            setHistoryModalOpen(true);
                          }}
                        >
                          <img
                            className="analysis-item__thumb"
                            src={analysisHistory[0].thumbUrl}
                            alt="preview"
                          />
                          <div className="analysis-item__text">
                            <div
                              className={`analysis-item__label ${analysisHistory[0].label === "ai" ? "is-ai" : "is-real"}`}
                            >
                              Последний анализ
                            </div>
                            <div className="analysis-item__percent">
                              {analysisHistory.length} шт.
                            </div>
                          </div>
                        </button>
                      )}
                    </div>

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
              <DragDropZone
                key={resetKey}
                onAnalysisSaved={handleAnalysisSaved}
              />
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

      {historyModalOpen && (
        <div
          className="analysis-modal-backdrop"
          onClick={() => setHistoryModalOpen(false)}
        >
          <div
            className="analysis-modal analysis-modal--history"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="analysis-modal__close"
              type="button"
              onClick={() => setHistoryModalOpen(false)}
            >
              ✕
            </button>

            <div className="analysis-modal__header">
              <h3 className="analysis-modal__title">История анализов</h3>
              <div className="analysis-modal__count">
                {analysisHistory.length} фото
              </div>
            </div>

            <div className="analysis-history-list">
              {analysisHistory.map((item) => (
                <div className="analysis-history-card" key={item.id}>
                  <img
                    src={item.imageUrl || item.thumbUrl}
                    alt="analysis preview"
                    className="analysis-history-card__image"
                  />

                  <div className="analysis-history-card__body">
                    <div
                      className={`analysis-history-card__label ${item.label === "ai" ? "is-ai" : "is-real"}`}
                    >
                      {item.label === "ai" ? "AI" : "Real"}
                    </div>

                    <div className="analysis-history-card__percent">
                      {item.percent}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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