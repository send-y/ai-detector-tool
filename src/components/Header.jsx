import LanguageSwitch from "./LanguageSwitch";
import UserMenu from "./UserMenu";

export default function Header({
  language,
  setLanguage,
  isLoggedIn,
  userName,
  isAdmin,
  dropdownOpen,
  setDropdownOpen,
  analysisHistory,
  onBrandClick,
  onOpenAuth,
  onOpenHistory,
  onOpenAdminPanel,
  onLogout,
  t,
}) {
  return (
    <header className="topbar">
      <div className="topbar__left">
        <div className="brand">
          <button type="button" className="brand__word" onClick={onBrandClick}>
            LANDER
          </button>
        </div>
      </div>

      <div className="topbar__right">
        <LanguageSwitch language={language} setLanguage={setLanguage} />

        {isLoggedIn ? (
          <UserMenu
            userName={userName}
            isAdmin={isAdmin}
            dropdownOpen={dropdownOpen}
            setDropdownOpen={setDropdownOpen}
            analysisHistory={analysisHistory}
            onOpenHistory={onOpenHistory}
            onOpenAdminPanel={onOpenAdminPanel}
            onLogout={onLogout}
            t={t}
          />
        ) : (
          <button className="btn btn--ghost" type="button" onClick={onOpenAuth}>
            {t.signIn}
          </button>
        )}
      </div>
    </header>
  );
}
