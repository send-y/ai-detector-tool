import { useState } from "react";
import { publicAsset } from "../utils/publicAsset";

export default function LoginForm({ onSubmit, t }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form className="auth-form" onSubmit={onSubmit}>
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
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder={t.enterPassword}
            autoComplete="current-password"
            required
          />

          <button
            type="button"
            className="field__trail"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            <img
              src={publicAsset(
                showPassword ? "assets/eye-open.svg" : "assets/eye-closed.svg"
              )}
              alt=""
            />
          </button>
        </div>
      </label>

      <button className="btn btn--primary btn--full" type="submit">
        {t.signIn}
      </button>
    </form>
  );
}
