import { useEffect, useMemo, useState } from "react";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  getFirestore,
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

function formatDate(value) {
  if (!value) return "—";
  if (typeof value?.toDate === "function") {
    return value.toDate().toLocaleString();
  }
  return String(value);
}

export default function AdminPanel({ onClose, language = "en" }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authReady, setAuthReady] = useState(false);

  const t = useMemo(() => {
    return {
      panelTitle: language === "en" ? "Admin Panel" : "Адмін-панель",

      panelSubtitle:
        language === "en"
          ? "All user verification results"
          : "Усі результати перевірок користувачів",

      openCloudinary:
        language === "en"
          ? "Open Cloudinary Media Library"
          : "Відкрити Cloudinary Media Library",

      refresh: language === "en" ? "Refresh" : "Оновити",
      close: language === "en" ? "Close" : "Закрити",

      loading: language === "en" ? "Loading..." : "Завантаження...",
      noResults:
        language === "en"
          ? "No results yet"
          : "Результатів поки немає",

      noAuth:
        language === "en"
          ? "No authorization"
          : "Немає авторизації",

      userNotAuthorized:
        language === "en"
          ? "User is not authorized yet"
          : "Користувач ще не авторизований",

      failedToLoad:
        language === "en"
          ? "Failed to load results"
          : "Не вдалося завантажити результати",

      noPhoto: language === "en" ? "No photo" : "Немає фото",

      user: language === "en" ? "User" : "Користувач",
      result: language === "en" ? "Result" : "Результат",
      aiPercent: language === "en" ? "AI %" : "ШІ %",
      feedback: language === "en" ? "Feedback" : "Оцінка",
      date: language === "en" ? "Date" : "Дата",

      correct: language === "en" ? "Correct" : "Правильно",
      wrong: language === "en" ? "Wrong" : "Помилка",
      noAnswer: language === "en" ? "No answer" : "Немає відповіді",

      aiGenerated:
        language === "en" ? "AI-generated" : "Згенеровано ШІ",
      real:
        language === "en" ? "Real" : "Справжнє",
    };
  }, [language]);

  const feedbackText = (value) => {
    if (value === true) return t.correct;
    if (value === false) return t.wrong;
    return t.noAnswer;
  };

  const resultText = (label) => {
    return label === "ai" ? t.aiGenerated : t.real;
  };

  const loadResults = async () => {
    try {
      setLoading(true);
      setError("");

      const user = auth.currentUser;
      if (!user) {
        throw new Error(t.userNotAuthorized);
      }

      await user.getIdToken(true);

      const q = query(
        collection(db, "analysis_results"),
        orderBy("createdAt", "desc"),
        limit(100)
      );

      const snap = await getDocs(q);

      const rows = snap.docs.map((itemDoc) => {
        const data = itemDoc.data();
        return {
          id: itemDoc.id,
          ...data,
        };
      });

      setItems(rows);
    } catch (err) {
      console.error("Ошибка загрузки analysis_results:", err);
      setError(err?.message || t.failedToLoad);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setAuthReady(true);

      if (!user) {
        setItems([]);
        setLoading(false);
        setError(t.noAuth);
        return;
      }

      await loadResults();
    });

    return () => unsub();
  }, [t.noAuth, t.failedToLoad, t.userNotAuthorized]);

  return (
    <div style={styles.backdrop}>
      <div style={styles.panel}>
        <div style={styles.header}>
          <div>
            <div style={styles.title}>{t.panelTitle}</div>
            <div style={styles.subtitle}>{t.panelSubtitle}</div>

            <a
              href="https://console.cloudinary.com/app/c-d523f0eca84b5ea2fdbb30cfd76189/assets/media_library/search?q=&view_mode=mosaic"
              target="_blank"
              rel="noreferrer"
              style={styles.cloudinaryLink}
            >
              {t.openCloudinary}
            </a>
          </div>

          <div style={styles.headerActions}>
            <button
              style={styles.secondaryBtn}
              onClick={loadResults}
              disabled={!authReady}
            >
              {t.refresh}
            </button>

            <button style={styles.closeBtn} onClick={onClose}>
              {t.close}
            </button>
          </div>
        </div>

        {loading && <div style={styles.info}>{t.loading}</div>}
        {error && <div style={styles.error}>{error}</div>}

        {!loading && !error && items.length === 0 && (
          <div style={styles.info}>{t.noResults}</div>
        )}

        {!loading && !error && items.length > 0 && (
          <div style={styles.grid}>
            {items.map((item) => (
              <div key={item.id} style={styles.card}>
                <div style={styles.imageWrap}>
                  {item.imageUrl || item.thumbUrl ? (
                    <img
                      src={item.imageUrl || item.thumbUrl}
                      alt="analysis"
                      style={styles.image}
                    />
                  ) : (
                    <div style={styles.imagePlaceholder}>{t.noPhoto}</div>
                  )}
                </div>

                <div style={styles.content}>
                  <div style={styles.row}>
                    <span style={styles.label}>{t.user}:</span>
                    <span style={styles.value}>
                      {item.userEmail || item.userId || "—"}
                    </span>
                  </div>

                  <div style={styles.row}>
                    <span style={styles.label}>{t.result}:</span>
                    <span
                      style={{
                        ...styles.badge,
                        ...(item.label === "ai"
                          ? styles.badgeAi
                          : styles.badgeReal),
                      }}
                    >
                      {resultText(item.label)}
                    </span>
                  </div>

                  <div style={styles.row}>
                    <span style={styles.label}>{t.aiPercent}:</span>
                    <span style={styles.value}>{item.percent ?? 0}%</span>
                  </div>

                  <div style={styles.row}>
                    <span style={styles.label}>{t.feedback}:</span>
                    <span style={styles.value}>
                      {feedbackText(item.isCorrect)}
                    </span>
                  </div>

                  <div style={styles.row}>
                    <span style={styles.label}>{t.date}:</span>
                    <span style={styles.value}>
                      {formatDate(item.createdAt)}
                    </span>
                  </div>

                  <div style={styles.rowId}>
                    <span style={styles.idText}>ID: {item.id}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.78)",
    zIndex: 10000,
    padding: 24,
    overflowY: "auto",
  },
  panel: {
    width: "100%",
    maxWidth: 1280,
    margin: "0 auto",
    background: "#101114",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 24,
    padding: 24,
    color: "#fff",
    boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    marginBottom: 24,
    flexWrap: "wrap",
  },
  headerActions: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },
  title: {
    fontSize: 28,
    fontWeight: 800,
  },
  subtitle: {
    marginTop: 6,
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
  },
  cloudinaryLink: {
    display: "inline-block",
    marginTop: 12,
    color: "#8ec5ff",
    textDecoration: "none",
    fontWeight: 600,
  },
  closeBtn: {
    border: "none",
    borderRadius: 12,
    padding: "12px 18px",
    background: "#3b82f6",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 700,
  },
  secondaryBtn: {
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 12,
    padding: "12px 18px",
    background: "rgba(255,255,255,0.04)",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 700,
  },
  info: {
    padding: 18,
    borderRadius: 16,
    background: "rgba(255,255,255,0.04)",
    color: "rgba(255,255,255,0.75)",
  },
  error: {
    padding: 18,
    borderRadius: 16,
    background: "rgba(180,40,40,0.18)",
    color: "#ff8f8f",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: 18,
  },
  card: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 20,
    overflow: "hidden",
  },
  imageWrap: {
    width: "100%",
    height: 240,
    background: "#0b0c0f",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "rgba(255,255,255,0.4)",
  },
  content: {
    padding: 16,
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
    alignItems: "center",
  },
  label: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 14,
  },
  value: {
    color: "#fff",
    fontWeight: 600,
    textAlign: "right",
    wordBreak: "break-word",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 110,
    padding: "8px 12px",
    borderRadius: 999,
    fontWeight: 800,
    fontSize: 13,
    border: "1px solid transparent",
  },
  badgeAi: {
    background: "rgba(231,76,60,0.14)",
    color: "#ffb4b4",
    borderColor: "rgba(231,76,60,0.4)",
  },
  badgeReal: {
    background: "rgba(46,204,113,0.14)",
    color: "#b8ffd0",
    borderColor: "rgba(46,204,113,0.4)",
  },
  rowId: {
    marginTop: 8,
    paddingTop: 12,
    borderTop: "1px solid rgba(255,255,255,0.08)",
  },
  idText: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 12,
    wordBreak: "break-all",
  },
};