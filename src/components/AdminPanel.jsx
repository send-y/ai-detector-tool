import { useCallback, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { AdminPanelstyles as styles } from "./AdminPanel.style";
import {
  getDocs,
  collection,
  limit,
  orderBy,
  query,
} from "firebase/firestore";
import { auth, db } from "../config/firebase";

function formatDate(value) {
  if (!value) return "—";
  if (typeof value?.toDate === "function") {
    return value.toDate().toLocaleString();
  }
  return String(value);
}

function getInitial(value) {
  return String(value || "U").trim().charAt(0).toUpperCase() || "U";
}

export default function AdminPanel({ onClose, language = "en" }) {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authReady, setAuthReady] = useState(false);

  const [searchValue, setSearchValue] = useState("");
  const [filterValue, setFilterValue] = useState("all");

  const t = useMemo(() => {
    const isEn = language === "en";

    return {
      panelTitle: isEn ? "Admin Panel" : "Адмін-панель",
      panelSubtitle: isEn
        ? "All user verification results"
        : "Усі результати перевірок користувачів",

      openCloudinary: isEn
        ? "Open Cloudinary Media Library"
        : "Відкрити Cloudinary Media Library",

      refresh: isEn ? "Refresh" : "Оновити",
      close: isEn ? "Close" : "Закрити",

      loading: isEn ? "Loading..." : "Завантаження...",
      noResults: isEn ? "No results yet" : "Результатів поки немає",
      noAuth: isEn ? "No authorization" : "Немає авторизації",
      userNotAuthorized: isEn
        ? "User is not authorized yet"
        : "Користувач ще не авторизований",
      failedToLoad: isEn
        ? "Failed to load results"
        : "Не вдалося завантажити результати",

      noPhoto: isEn ? "No photo" : "Немає фото",

      user: isEn ? "User" : "Користувач",
      result: isEn ? "Result" : "Результат",
      aiPercent: isEn ? "AI %" : "ШІ %",
      feedback: isEn ? "Feedback" : "Оцінка",
      date: isEn ? "Date" : "Дата",
      format: isEn ? "Format" : "Формат",
      size: isEn ? "Size" : "Розмір",

      correct: isEn ? "Correct" : "Правильно",
      wrong: isEn ? "Wrong" : "Помилка",
      noAnswer: isEn ? "No answer" : "Немає відповіді",

      aiGenerated: isEn ? "AI-generated" : "Згенеровано ШІ",
      real: isEn ? "Real" : "Справжнє",

      total: isEn ? "Total" : "Всього",
      aiOnly: isEn ? "AI" : "ШІ",
      realOnly: isEn ? "Real" : "Справжні",
      withFeedback: isEn ? "Feedback" : "З оцінкою",

      searchPlaceholder: isEn
        ? "Search by email or user ID..."
        : "Пошук по email або user ID...",

      allResults: isEn ? "All results" : "Усі результати",
      onlyAi: isEn ? "Only AI" : "Тільки ШІ",
      onlyReal: isEn ? "Only Real" : "Тільки справжні",
      onlyWithFeedback: isEn ? "Only with feedback" : "Тільки з оцінкою",

      recentAnalyses: isEn ? "Recent analyses" : "Останні аналізи",
      itemsCount: (count) =>
        isEn ? `${count} items` : `${count} елементів`,

      openImage: isEn ? "Open image" : "Відкрити фото",
      image: isEn ? "Image" : "Фото",
      cloudinary: isEn ? "Cloudinary" : "Cloudinary",
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

  const loadResults = useCallback(async () => {
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
  }, [t.failedToLoad, t.userNotAuthorized]);

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
  }, [loadResults, t.noAuth]);

  useEffect(() => {
    let next = [...items];

    const q = searchValue.trim().toLowerCase();
    if (q) {
      next = next.filter((item) => {
        const email = String(item.userEmail || "").toLowerCase();
        const uid = String(item.userId || "").toLowerCase();
        const id = String(item.id || "").toLowerCase();
        return email.includes(q) || uid.includes(q) || id.includes(q);
      });
    }

    if (filterValue === "ai") {
      next = next.filter((item) => item.label === "ai");
    }

    if (filterValue === "real") {
      next = next.filter((item) => item.label !== "ai");
    }

    if (filterValue === "feedback") {
      next = next.filter(
        (item) => item.isCorrect === true || item.isCorrect === false
      );
    }

    setFilteredItems(next);
  }, [items, searchValue, filterValue]);

  const totalCount = items.length;
  const aiCount = items.filter((item) => item.label === "ai").length;
  const realCount = items.filter((item) => item.label !== "ai").length;
  const feedbackCount = items.filter(
    (item) => item.isCorrect === true || item.isCorrect === false
  ).length;

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div style={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div style={styles.panelGlowOne}></div>
        <div style={styles.panelGlowTwo}></div>
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.eyebrow}>{t.panelTitle}</div>
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

          <div style={styles.statsWrap}>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>{t.total}</div>
              <div style={styles.statValue}>{totalCount}</div>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statLabel}>{t.aiOnly}</div>
              <div style={styles.statValue}>{aiCount}</div>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statLabel}>{t.realOnly}</div>
              <div style={styles.statValue}>{realCount}</div>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statLabel}>{t.withFeedback}</div>
              <div style={styles.statValue}>{feedbackCount}</div>
            </div>
          </div>
        </div>

        <div style={styles.toolbar}>
          <input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={t.searchPlaceholder}
            style={styles.input}
          />

          <select
  value={filterValue}
  onChange={(e) => setFilterValue(e.target.value)}
  style={styles.select}
	
>
  <option value="all" style={{ color: "#111" }}>
    {t.allResults}
  </option>
  <option value="ai" style={{ color: "#111" }}>
    {t.onlyAi}
  </option>
  <option value="real" style={{ color: "#111" }}>
    {t.onlyReal}
  </option>
  <option value="feedback" style={{ color: "#111" }}>
    {t.onlyWithFeedback}
  </option>
</select>

          <button
            style={styles.secondaryBtn}
            onClick={loadResults}
            disabled={!authReady}
          >
            {t.refresh}
          </button>

          <button style={styles.primaryBtn} onClick={onClose}>
            {t.close}
          </button>
        </div>

        {loading && <div style={styles.info}>{t.loading}</div>}
        {error && <div style={styles.error}>{error}</div>}

        {!loading && !error && filteredItems.length === 0 && (
          <div style={styles.empty}>
            <div style={styles.emptyTitle}>{t.noResults}</div>
            <div style={styles.emptyText}>{t.panelSubtitle}</div>
          </div>
        )}

        {!loading && !error && filteredItems.length > 0 && (
          <>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionTitle}>{t.recentAnalyses}</div>
              <div style={styles.sectionMeta}>
                {t.itemsCount(filteredItems.length)}
              </div>
            </div>

            <div style={styles.grid}>
              {filteredItems.map((item) => {
                const imageSrc = item.imageUrl || item.thumbUrl || "";
                const bytesText =
                  typeof item.bytes === "number"
                    ? `${(item.bytes / 1024 / 1024).toFixed(2)} MB`
                    : "—";

                return (
                  <div key={item.id} style={styles.card}>
                    <div style={styles.cardTop}>
                      <div style={styles.userBox}>
                        <div style={styles.avatar}>
                          {getInitial(item.userEmail || item.userId)}
                        </div>

                        <div style={styles.userInfo}>
                          <div style={styles.userEmail}>
                            {item.userEmail || "—"}
                          </div>
                          <div style={styles.userId}>{item.userId || "—"}</div>
                        </div>
                      </div>

                      <div
                        style={{
                          ...styles.badge,
                          ...(item.label === "ai"
                            ? styles.badgeAi
                            : styles.badgeReal),
                        }}
                      >
                        {resultText(item.label)}
                      </div>
                    </div>

                    <div style={styles.imageWrap}>
                      {imageSrc ? (
                        <img
                          src={imageSrc}
                          alt="analysis"
                          style={styles.image}
                        />
                      ) : (
                        <div style={styles.imagePlaceholder}>{t.noPhoto}</div>
                      )}

                      <div style={styles.imageOverlay}>
                        <div style={styles.percentBig}>
                          {item.percent ?? 0}%
                        </div>
                        <div style={styles.dateSmall}>
                          {formatDate(item.createdAt)}
                        </div>
                      </div>
                    </div>

                    <div style={styles.metaGrid}>
                      <div style={styles.metaCard}>
                        <div style={styles.metaLabel}>{t.feedback}</div>
                        <div style={styles.metaValue}>
                          {feedbackText(item.isCorrect)}
                        </div>
                      </div>

                      <div style={styles.metaCard}>
                        <div style={styles.metaLabel}>{t.format}</div>
                        <div style={styles.metaValue}>
                          {item.format || "—"}
                        </div>
                      </div>

                      <div style={styles.metaCard}>
                        <div style={styles.metaLabel}>{t.size}</div>
                        <div style={styles.metaValue}>{bytesText}</div>
                      </div>

                      <div style={styles.metaCard}>
                        <div style={styles.metaLabel}>{t.aiPercent}</div>
                        <div style={styles.metaValue}>
                          {item.percent ?? 0}%
                        </div>
                      </div>
                    </div>

                    <div style={styles.cardFooter}>
                      <div style={styles.idText}>ID: {item.id}</div>

                      <div style={styles.cardActions}>
                        {imageSrc ? (
                          <a
                            href={imageSrc}
                            target="_blank"
                            rel="noreferrer"
                            style={styles.actionLink}
                          >
                            {t.openImage}
                          </a>
                        ) : (
                          <span style={styles.actionLinkDisabled}>
                            {t.image}
                          </span>
                        )}

                        {item.cloudinaryPublicId ? (
                          <span style={styles.cloudTag}>{t.cloudinary}</span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

