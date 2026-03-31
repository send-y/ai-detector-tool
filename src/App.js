import "./index.css";
import { useEffect, useState } from "react";
import DragDropZone from "./components/DragDropZone";
import AdminPanel from "./components/AdminPanel";

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
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);
  const [language, setLanguage] = useState("en");
	const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);

  const t = {
    signIn: language === "en" ? "Sign In" : "Увійти",
    signUp: language === "en" ? "Sign Up" : "Реєстрація",
    welcomeTitle:
      language === "en" ? "Welcome to LANDER" : "Ласкаво просимо до LANDER",
    welcomeSub:
      language === "en"
        ? "Sign in to save your uploads and access them from anywhere"
        : "Увійдіть, щоб зберігати завантаження та мати доступ до них звідусіль",
    authMode: language === "en" ? "Auth mode" : "Режим авторизації",
    nickname: language === "en" ? "Nickname" : "Нікнейм",
    email: language === "en" ? "Email" : "Електронна пошта",
    password: language === "en" ? "Password" : "Пароль",
    enterEmail:
      language === "en" ? "Enter your email" : "Введіть вашу пошту",
    enterPassword:
      language === "en" ? "Enter your password" : "Введіть ваш пароль",
    createPassword:
      language === "en" ? "Create a password" : "Створіть пароль",
    enterNickname:
      language === "en" ? "Enter your nickname" : "Введіть ваш нікнейм",
    historyTitle: language === "en" ? "Analysis History" : "Історія аналізів",
    historyEmpty: language === "en" ? "No analyses yet" : "Поки немає аналізів",
    lastAnalysis:
      language === "en" ? "Latest analysis" : "Останній аналіз",
    itemsCount: (count) =>
      language === "en" ? `${count} items` : `${count} шт.`,
    adminPanel:
      language === "en" ? "Admin Panel(test)" : "Адмін-панель(test)",
    logout: language === "en" ? "Log Out" : "Вийти",
    uploadDropTitle:
      language === "en" ? "Drop your photo here" : "Перетягніть фото сюди",
    uploadDropSub:
      language === "en" ? "or click to choose" : "або натисніть для вибору",
    historyModalTitle:
      language === "en" ? "Analysis History" : "Історія аналізів",
    photosCount: (count) =>
      language === "en" ? `${count} photos` : `${count} фото`,
    loginRequired:
      language === "en" ? "Sign in required" : "Потрібен вхід",
    loginRequiredSub:
      language === "en"
        ? "Sign in to your account to start image analysis"
        : "Увійдіть в акаунт, щоб почати аналіз зображень",
    loginAction: language === "en" ? "Sign In" : "Увійти",
    loading: language === "en" ? "Loading..." : "Завантаження...",
    close: language === "en" ? "Close" : "Закрити",
  };

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
        const nickname = profile?.nickname || user.email?.split("@")[0] || "User";
        const role = String(profile?.role || "user").trim().toLowerCase();

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

  const form = e.currentTarget;
  const formData = new FormData(form);
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    form.reset();
    setShowAuth(false);
  } catch (err) {
    console.error(err);
  }
};

  const handleSignUp = async (e) => {
  e.preventDefault();

  const form = e.currentTarget;
  const formData = new FormData(form);
  const nickname = String(formData.get("nickname") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!nickname || !email || !password) {
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

    form.reset();
    setShowAuth(false);
  } catch (err) {
    console.error(err);
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
    setDropdownOpen(false);
    setAdminPanelOpen(true);
  };

  const handleAnalysisSaved = (item) => {
    setAnalysisHistory((prev) => [item, ...prev].slice(0, 20));
  };

  if (loading) {
    return <div className="loading-screen">{t.loading}</div>;
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
					<div className="hero-ambient" aria-hidden="true">
  <div className="hero-ambient__aurora hero-ambient__aurora--1"></div>
  <div className="hero-ambient__aurora hero-ambient__aurora--2"></div>
  <div className="hero-ambient__aurora hero-ambient__aurora--3"></div>

  <div className="hero-ambient__grid"></div>
  <div className="hero-ambient__vignette"></div>
  <div className="hero-ambient__glow"></div>
</div>
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
              <div
                className={`lang-switch ${language === "uk" ? "is-uk" : "is-en"}`}
                role="group"
                aria-label="Language switch"
              >
                <button
                  type="button"
                  className={`lang-switch__option ${language === "en" ? "is-active" : ""}`}
                  onClick={() => setLanguage("en")}
                >
                  EN
                </button>

                <button
                  type="button"
                  className={`lang-switch__option ${language === "uk" ? "is-active" : ""}`}
                  onClick={() => setLanguage("uk")}
                >
                  UA
                </button>

                <span className="lang-switch__thumb" aria-hidden="true" />
              </div>

              {isLoggedIn ? (
                <div
                  className={`user-menu ${dropdownOpen ? "is-open" : ""}`}
                  id="userMenu"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
  className="user-trigger"
  onClick={() => setDropdownOpen((prev) => !prev)}
>
  <div className="user-avatar user-avatar--top" id="userAvatar">
    <span className="user-avatar__glow"></span>
    <span className="user-avatar__letter">
      {userName?.charAt(0)?.toUpperCase() || "U"}
    </span>
  </div>

  <div className="user-trigger__meta">
    <div className="user-trigger__name">{userName}</div>
    <div className="user-trigger__role">
      {isAdmin ? "Administrator" : "Member"}
    </div>
  </div>

  <div className={`user-trigger__chevron ${dropdownOpen ? "is-open" : ""}`}>
    ▼
  </div>
</div>

                  <div
                    className={`user-dropdown ${dropdownOpen ? "is-open" : ""}`}
                    id="userDropdown"
                  >
                    <div className="user-card">
  <div className="user-card__avatar-wrap">
    <div className="user-card__avatar" id="userAvatarBig">
      <span className="user-card__avatar-glow"></span>
      <span className="user-card__avatar-letter">
        {userName?.charAt(0)?.toUpperCase() || "U"}
      </span>
    </div>
  </div>

  <div className="user-card__info">
    <div className="user-card__name" id="userName">
      {userName}
    </div>
    <div className="user-card__sub">
      {isAdmin ? "Administrator access" : "Your LANDER profile"}
    </div>
  </div>
</div>

                    <div className="profile-history">
                      <div className="profile-history__title">
                        {t.historyTitle}
                      </div>

                      {analysisHistory.length === 0 ? (
                        <div className="profile-history__empty">
                          {t.historyEmpty}
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
                              className={`analysis-item__label ${
                                analysisHistory[0].label === "ai"
                                  ? "is-ai"
                                  : "is-real"
                              }`}
                            >
                              {t.lastAnalysis}
                            </div>
                            <div className="analysis-item__percent">
                              {t.itemsCount(analysisHistory.length)}
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
                        {t.adminPanel}
                      </button>
                    ) : null}

                    <button
                      className="dropdown-item danger"
                      id="logoutBtn"
                      type="button"
                      onClick={handleLogout}
                    >
                      {t.logout}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  className="btn btn--ghost"
                  type="button"
                  onClick={() => setShowAuth(true)}
                >
                  {t.signIn}
                </button>
              )}
            </div>
          </header>

          <div className="upload-wrap">
  {isLoggedIn ? (
    <DragDropZone
      key={resetKey}
      onAnalysisSaved={handleAnalysisSaved}
      language={language}
    />
  ) : null}
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
                  aria-label={t.close}
                >
                  ✕
                </button>

                <h2 className="modal__title" id="authTitle">
                  {t.welcomeTitle}
                </h2>

                <p className="modal__sub">{t.welcomeSub}</p>

                <div
                  className="segmented"
                  role="tablist"
                  aria-label={t.authMode}
                >
                  <button
                    className={`segmented__btn ${
                      authMode === "signin" ? "is-active" : ""
                    }`}
                    type="button"
                    onClick={() => setAuthMode("signin")}
                  >
                    {t.signIn}
                  </button>

                  <button
                    className={`segmented__btn ${
                      authMode === "signup" ? "is-active" : ""
                    }`}
                    type="button"
                    onClick={() => setAuthMode("signup")}
                  >
                    {t.signUp}
                  </button>
                </div>

                {authMode === "signin" && (
                  <form className="auth-form" onSubmit={handleSignIn}>
                    <label className="field">
                      <span className="field__label">{t.email}</span>
                      <div className="field__control">
                        <input
                          className="field__input"
                          type="email"
                          name="email"
                          placeholder={t.enterEmail}
                          autoComplete="email"
                          required
                        />
                      </div>
                    </label>

                    <label className="field">
  <span className="field__label">{t.password}</span>
  <div className="field__control">
    <input
      className="field__input"
      type={showSignInPassword ? "text" : "password"}
      name="password"
      placeholder={t.enterPassword}
      autoComplete="current-password"
      required
    />

    <button
      type="button"
      className="field__trail"
      onClick={() => setShowSignInPassword((prev) => !prev)}
      aria-label={showSignInPassword ? "Hide password" : "Show password"}
    >
      <img
        src={
          showSignInPassword
            ? "/assets/eye-open.svg"
            : "/assets/eye-closed.svg"
        }
        alt=""
      />
    </button>
  </div>
</label>

                    <button
                      className="btn btn--primary btn--full"
                      type="submit"
                    >
                      {t.signIn}
                    </button>
                  </form>
                )}

                {authMode === "signup" && (
                  <form className="auth-form" onSubmit={handleSignUp}>
                    <label className="field">
                      <span className="field__label">{t.nickname}</span>
                      <div className="field__control">
                        <input
                          className="field__input"
                          type="text"
                          name="nickname"
                          placeholder={t.enterNickname}
                          autoComplete="username"
                          required
                          minLength={3}
                          maxLength={20}
                        />
                      </div>
                    </label>

                    <label className="field">
                      <span className="field__label">{t.email}</span>
                      <div className="field__control">
                        <input
                          className="field__input"
                          type="email"
                          name="email"
                          placeholder={t.enterEmail}
                          autoComplete="email"
                          required
                        />
                      </div>
                    </label>

                    <label className="field">
  <span className="field__label">{t.password}</span>
  <div className="field__control">
    <input
      className="field__input"
      type={showSignUpPassword ? "text" : "password"}
      name="password"
      placeholder={t.createPassword}
      autoComplete="new-password"
      required
    />

    <button
      type="button"
      className="field__trail"
      onClick={() => setShowSignUpPassword((prev) => !prev)}
      aria-label={showSignUpPassword ? "Hide password" : "Show password"}
    >
      <img
        src={
          showSignUpPassword
            ? "/assets/eye-open.svg"
            : "/assets/eye-closed.svg"
        }
        alt=""
      />
    </button>
  </div>
</label>

                    <button
                      className="btn btn--primary btn--full"
                      type="submit"
                    >
                      {t.signUp}
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
              <div>
                <h3 className="analysis-modal__title">{t.historyModalTitle}</h3>
                <div className="analysis-modal__subtext">
                  {language === "en"
                    ? "Your recent image verification results"
                    : "Ваші останні результати перевірки зображень"}
                </div>
              </div>

              <div className="analysis-modal__count">
                {t.photosCount(analysisHistory.length)}
              </div>
            </div>

            <div className="analysis-history-list">
              {analysisHistory.map((item) => (
                <article className="analysis-history-card" key={item.id}>
                  <div className="analysis-history-card__media">
                    <img
                      src={item.imageUrl || item.thumbUrl}
                      alt="analysis preview"
                      className="analysis-history-card__image"
                    />

                    <div className="analysis-history-card__overlay">
                      <div
                        className={`analysis-history-card__badge ${
                          item.label === "ai" ? "is-ai" : "is-real"
                        }`}
                      >
                        {item.label === "ai"
                          ? language === "en"
                            ? "AI"
                            : "ШІ"
                          : language === "en"
                          ? "Real"
                          : "Справжнє"}
                      </div>

                      <div className="analysis-history-card__percent">
                        {item.percent}%
                      </div>
                    </div>
                  </div>

                  <div className="analysis-history-card__body">
                    <div className="analysis-history-card__top">
                      <div className="analysis-history-card__title">
                        {item.label === "ai"
                          ? language === "en"
                            ? "AI-generated image"
                            : "Зображення, згенероване ШІ"
                          : language === "en"
                          ? "Real photo"
                          : "Справжнє фото"}
                      </div>

                      <div className="analysis-history-card__meta">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleString()
                          : "—"}
                      </div>
                    </div>

                    <div className="analysis-history-card__stats">
                      <div className="analysis-history-stat">
                        <span className="analysis-history-stat__label">
                          {language === "en" ? "Result" : "Результат"}
                        </span>
                        <span
                          className={`analysis-history-stat__value ${
                            item.label === "ai" ? "is-ai" : "is-real"
                          }`}
                        >
                          {item.label === "ai"
                            ? language === "en"
                              ? "AI"
                              : "ШІ"
                            : language === "en"
                            ? "Real"
                            : "Справжнє"}
                        </span>
                      </div>

                      <div className="analysis-history-stat">
                        <span className="analysis-history-stat__label">
                          {language === "en" ? "Probability" : "Ймовірність"}
                        </span>
                        <span className="analysis-history-stat__value">
                          {item.percent}%
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
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
            <h2 className="lock-title">{t.loginRequired}</h2>
            <p className="lock-text">{t.loginRequiredSub}</p>
            <button className="lock-btn" onClick={() => setShowAuth(true)}>
              {t.loginAction}
            </button>
          </div>
        </div>
      )}

      {adminPanelOpen && isAdmin && (
  <AdminPanel
    onClose={() => setAdminPanelOpen(false)}
    language={language}
  />
)}
    </div>
  );
}