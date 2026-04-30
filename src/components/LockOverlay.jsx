export default function LockOverlay({ onOpenAuth, t }) {
  return (
    <div className="lock-overlay" id="lockOverlay">
      <div className="lock-message">
        <div className="lock-icon">
          <img src="/assets/Lock.svg" alt="lock" />
        </div>
        <h2 className="lock-title">{t.loginRequired}</h2>
        <p className="lock-text">{t.loginRequiredSub}</p>
        <button className="lock-btn" onClick={onOpenAuth}>
          {t.loginAction}
        </button>
      </div>
    </div>
  );
}
