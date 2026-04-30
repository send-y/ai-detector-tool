export default function UserMenu({
  userName,
  isAdmin,
  dropdownOpen,
  setDropdownOpen,
  analysisHistory,
  onOpenHistory,
  onOpenAdminPanel,
  onLogout,
  t,
}) {
  const initial = userName?.charAt(0)?.toUpperCase() || "U";

  return (
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
          <span className="user-avatar__letter">{initial}</span>
        </div>

        <div className="user-trigger__meta">
          <div className="user-trigger__name">{userName}</div>
          <div className="user-trigger__role">
            {isAdmin ? t.administrator : t.member}
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
              <span className="user-card__avatar-letter">{initial}</span>
            </div>
          </div>

          <div className="user-card__info">
            <div className="user-card__name" id="userName">
              {userName}
            </div>
            <div className="user-card__sub">
              {isAdmin ? t.administratorAccess : t.yourProfile}
            </div>
          </div>
        </div>

        <div className="profile-history">
          <div className="profile-history__title">{t.historyTitle}</div>

          {analysisHistory.length === 0 ? (
            <div className="profile-history__empty">{t.historyEmpty}</div>
          ) : (
            <button
              type="button"
              className="last-analysis-btn"
              onClick={onOpenHistory}
            >
              <img
                className="analysis-item__thumb"
                src={analysisHistory[0].thumbUrl}
                alt="preview"
              />
              <div className="analysis-item__text">
                <div
                  className={`analysis-item__label ${
                    analysisHistory[0].label === "ai" ? "is-ai" : "is-real"
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
            onClick={onOpenAdminPanel}
          >
            {t.adminPanel}
          </button>
        ) : null}

        <button
          className="dropdown-item danger"
          id="logoutBtn"
          type="button"
          onClick={onLogout}
        >
          {t.logout}
        </button>
      </div>
    </div>
  );
}
