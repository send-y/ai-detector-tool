import { useState } from "react";
import { prettyAuthError } from "../utils/authErrors";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

export default function AuthModal({ language, onClose, signIn, signUp, t }) {
  const [authMode, setAuthMode] = useState("signin");
  const [authError, setAuthError] = useState("");

  const handleSignIn = async (e) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    setAuthError("");

    if (!email || !password) {
      setAuthError(t.enterEmailAndPassword);
      return;
    }

    try {
      await signIn(email, password);
      form.reset();
      setAuthError("");
      onClose();
    } catch (err) {
      console.error(err);
      setAuthError(prettyAuthError(err, language));
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);
    const nickname = String(formData.get("nickname") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    setAuthError("");

    if (!nickname || !email || !password) {
      setAuthError(t.fillAllFields);
      return;
    }

    try {
      await signUp(nickname, email, password);
      form.reset();
      setAuthError("");
      onClose();
    } catch (err) {
      console.error(err);
      setAuthError(prettyAuthError(err, language));
    }
  };

  return (
    <div
      className="modal-backdrop"
      id="authBackdrop"
      onClick={(e) => {
        if (e.target.id === "authBackdrop") onClose();
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
          onClick={onClose}
          aria-label={t.close}
        >
          ✕
        </button>

        <h2 className="modal__title" id="authTitle">
          {t.welcomeTitle}
        </h2>

        <p className="modal__sub">{t.welcomeSub}</p>

        <div className="segmented" role="tablist" aria-label={t.authMode}>
          <button
            className={`segmented__btn ${authMode === "signin" ? "is-active" : ""}`}
            type="button"
            onClick={() => {
              setAuthMode("signin");
              setAuthError("");
            }}
          >
            {t.signIn}
          </button>

          <button
            className={`segmented__btn ${authMode === "signup" ? "is-active" : ""}`}
            type="button"
            onClick={() => {
              setAuthMode("signup");
              setAuthError("");
            }}
          >
            {t.signUp}
          </button>
        </div>

        {authError && <div className="auth-error">{authError}</div>}

        {authMode === "signin" && <LoginForm onSubmit={handleSignIn} t={t} />}
        {authMode === "signup" && <RegisterForm onSubmit={handleSignUp} t={t} />}
      </div>
    </div>
  );
}
