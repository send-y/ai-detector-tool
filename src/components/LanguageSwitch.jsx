export default function LanguageSwitch({ language, setLanguage }) {
  return (
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
  );
}
