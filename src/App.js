import "./index.css";
import { useState } from "react";
import AdminPanel from "./components/AdminPanel";
import AuthModal from "./components/AuthModal";
import DragDropZone from "./components/DragDropZone";
import Header from "./components/Header";
import HeroAmbient from "./components/HeroAmbient";
import HistoryModal from "./components/HistoryModal";
import LockOverlay from "./components/LockOverlay";
import { useAuth } from "./hooks/useAuth";
import { useUserAnalyses } from "./hooks/useUserAnalyses";
import { getAppTranslations } from "./i18n/translations";
import { prettyAuthError } from "./utils/authErrors";

export default function App() {
  const [showAuth, setShowAuth] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);
  const [language, setLanguage] = useState("en");

  const {
    currentUser,
    loading,
    isLoggedIn,
    userName,
    userRole,
    signIn,
    signUp,
    logout,
  } = useAuth();

  const { analysisHistory, addAnalysis, clearAnalyses } = useUserAnalyses(
    currentUser?.uid
  );

  const t = getAppTranslations(language);
  const isAdmin = String(userRole).trim().toLowerCase() === "admin";

  const handleBrandClick = () => {
    setShowAuth(false);
    setDropdownOpen(false);
    setHistoryModalOpen(false);
    setResetKey((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogout = async () => {
    try {
      await logout();
      setDropdownOpen(false);
      setHistoryModalOpen(false);
      clearAnalyses();
      setResetKey((prev) => prev + 1);
    } catch (err) {
      console.error(err);
      alert(prettyAuthError(err, language));
    }
  };

  const handleOpenHistory = () => {
    setDropdownOpen(false);
    setHistoryModalOpen(true);
  };

  const handleOpenAdminPanel = () => {
    setDropdownOpen(false);
    setAdminPanelOpen(true);
  };

  if (loading) {
    return <div className="loading-screen">{t.loading}</div>;
  }

  return (
    <div onClick={() => setDropdownOpen(false)}>
      <div className="page-bg"></div>

      <main className="wrap">
        <section className="hero">
          <HeroAmbient />

          <Header
            language={language}
            setLanguage={setLanguage}
            isLoggedIn={isLoggedIn}
            userName={userName}
            isAdmin={isAdmin}
            dropdownOpen={dropdownOpen}
            setDropdownOpen={setDropdownOpen}
            analysisHistory={analysisHistory}
            onBrandClick={handleBrandClick}
            onOpenAuth={() => setShowAuth(true)}
            onOpenHistory={handleOpenHistory}
            onOpenAdminPanel={handleOpenAdminPanel}
            onLogout={handleLogout}
            t={t}
          />

          <div className="upload-wrap">
            {isLoggedIn ? (
              <DragDropZone
                key={resetKey}
                onAnalysisSaved={addAnalysis}
                language={language}
              />
            ) : null}
          </div>

          <div className="grain" aria-hidden="true"></div>

          {showAuth && (
            <AuthModal
              language={language}
              onClose={() => setShowAuth(false)}
              signIn={signIn}
              signUp={signUp}
              t={t}
            />
          )}
        </section>
      </main>

      {historyModalOpen && (
        <HistoryModal
          analysisHistory={analysisHistory}
          onClose={() => setHistoryModalOpen(false)}
          t={t}
        />
      )}

      {!isLoggedIn && !showAuth && (
        <LockOverlay onOpenAuth={() => setShowAuth(true)} t={t} />
      )}

      {adminPanelOpen && isAdmin && (
        <AdminPanel onClose={() => setAdminPanelOpen(false)} language={language} />
      )}
    </div>
  );
}
