// src/App.js
import "./index.css";
import { useState } from "react";
import DragDropZone from "./components/DragDropZone";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuth,   setShowAuth]   = useState(false);
  const [authMode,   setAuthMode]   = useState("signin"); // signin | signup

  return (
    <div>
      <div className="page-bg"></div>

      <main className="wrap">
        <section className="hero">

          {/* Шапка */}
          <header className="topbar">
            <div className="topbar__left">
              <div className="brand">
                <span className="brand__word">LANDER</span>
              </div>
            </div>

            <div className="topbar__right">
              {isLoggedIn ? (
                <div className="user-menu" id="userMenu">
                  <div
                    className="user-avatar"
                    onClick={() => {
                      document
                        .getElementById("userDropdown")
                        .classList.toggle("is-open");
                    }}
                  >
                    👤
                  </div>
                  <div className="user-dropdown" id="userDropdown">
                    <div className="user-card">
                      <div className="user-card__name" id="userName">
                        User
                      </div>
                    </div>
                    <button
                      className="dropdown-item danger"
                      onClick={() => setIsLoggedIn(false)}
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

          {/* Зона загрузки */}
          <div className="upload-wrap">
            {isLoggedIn ? (
              // Если залогинен — показываем анализатор
              <DragDropZone />
            ) : (
              // Если не залогинен — показываем заглушку
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

          {/* Модальное окно авторизации */}
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

                {/* Переключатель Sign In / Sign Up */}
                <div
                  className="segmented"
                  role="tablist"
                  aria-label="Auth mode"
                >
                  <button
                    className={`segmented__btn ${
                      authMode === "signin" ? "is-active" : ""
                    }`}
                    type="button"
                    onClick={() => setAuthMode("signin")}
                    role="tab"
                    aria-selected={authMode === "signin"}
                  >
                    Sign In
                  </button>
                  <button
                    className={`segmented__btn ${
                      authMode === "signup" ? "is-active" : ""
                    }`}
                    type="button"
                    onClick={() => setAuthMode("signup")}
                    role="tab"
                    aria-selected={authMode === "signup"}
                  >
                    Sign Up
                  </button>
                </div>

                {/* Sign In форма */}
                {authMode === "signin" && (
                  <form
                    className="auth-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      // TODO: подключить Firebase
                      setIsLoggedIn(true);
                      setShowAuth(false);
                    }}
                  >
                    <label className="field">
                      <span className="field__label">Email</span>
                      <div className="field__control">
                        <span className="field__icon">
                          <img
                            src="/assets/email.svg"
                            alt="email"
                            width="20"
                            height="20"
                          />
                        </span>
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
                        <span className="field__icon">
                          <img
                            src="/assets/Lock.svg"
                            alt="password"
                            width="20"
                            height="20"
                          />
                        </span>
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

                {/* Sign Up форма */}
                {authMode === "signup" && (
                  <form
                    className="auth-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      // TODO: подключить Firebase
                      setIsLoggedIn(true);
                      setShowAuth(false);
                    }}
                  >
                    <label className="field">
                      <span className="field__label">Nickname</span>
                      <div className="field__control">
                        <span className="field__icon">
                          <img
                            src="/assets/user-profile-03.svg"
                            alt="user"
                            width="20"
                            height="20"
                          />
                        </span>
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
                        <span className="field__icon">
                          <img
                            src="/assets/email.svg"
                            alt="email"
                            width="20"
                            height="20"
                          />
                        </span>
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
                        <span className="field__icon">
                          <img
                            src="/assets/Lock.svg"
                            alt="password"
                            width="20"
                            height="20"
                          />
                        </span>
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

      {/* Оверлей для незалогиненных */}
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
            <button
              className="lock-btn"
              onClick={() => setShowAuth(true)}
            >
              Войти
            </button>
          </div>
        </div>
      )}
    </div>
  );
}