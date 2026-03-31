import { useState, useCallback, useMemo } from "react";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

const API_URL = "http://localhost:5000/api/analyze";

const CLOUDINARY_CLOUD_NAME = "dy84hmzuj";
const CLOUDINARY_UPLOAD_PRESET = "lander_unsigned";

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

function normalizeLabel(label) {
  return label === "AI-generated" ? "ai" : "real";
}

async function uploadImageToCloudinary(file, userId, analysisId) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("folder", `lander_uploads/${userId}`);
  formData.append("public_id", analysisId);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || "Cloudinary upload error");
  }

  return {
    secureUrl: data.secure_url,
    publicId: data.public_id,
    assetId: data.asset_id,
    width: data.width,
    height: data.height,
    format: data.format,
    bytes: data.bytes,
  };
}

export default function DragDropZone({ onAnalysisSaved, language = "en" }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);

  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [lastAnalysisId, setLastAnalysisId] = useState(null);
  const [isSavingFeedback, setIsSavingFeedback] = useState(false);

  const t = useMemo(() => {
    const isUk = language === "uk";

    return {
      unauthorized: isUk
        ? "Користувач не авторизований"
        : "User is not authorized",

      analysisServerError: isUk
        ? "Помилка сервера аналізу"
        : "Analysis server error",

      analyzeFailed: isUk
        ? "Не вдалося виконати аналіз"
        : "Failed to analyze image",

      feedbackSaveFailed: isUk
        ? "Не вдалося зберегти відповідь"
        : "Failed to save response",

      lastAnalysisNotFound: isUk
        ? "Не знайдено ID останнього аналізу"
        : "Latest analysis ID not found",

      dropText: isUk
        ? "Перетягни фото сюди або натисни для вибору"
        : "Drop a photo here or click to choose",

      fileTypes: isUk
        ? "JPG, PNG, WEBP — до 10MB"
        : "JPG, PNG, WEBP — up to 10MB",

      analyzing: isUk
        ? "Analyzing image..."
        : "Analyzing image...",

      aiProbability: isUk ? "Ймовірність ШІ" : "AI probability",

      real: "Real",
      ai: "AI",

      metricsTitle: isUk ? "Детальні метрики" : "Detailed metrics",

      checkAnotherPhoto: isUk
        ? "Перевірити інше фото"
        : "Check another photo",

      close: isUk ? "Закрити" : "Close",

      feedbackTitle: isUk
        ? "Сайт показав правильний результат?"
        : "Did the site return the correct result?",

      feedbackText: isUk
        ? "Це допоможе покращити точність аналізів."
        : "This will help improve analysis accuracy.",

      yesCorrect: isUk ? "Так, правильно" : "Yes, correct",
      noMistake: isUk ? "Ні, помилка" : "No, mistake",

      aiGenerated: isUk ? "Згенеровано ШІ" : "AI-generated",
      realPhoto: isUk ? "Справжнє фото" : "Real photo",
    };
  }, [language]);

  const resetAnalysis = () => {
    setResult(null);
    setPreview(null);
    setError(null);
    setFeedbackOpen(false);
    setLastAnalysisId(null);

    const input = document.getElementById("fileInput");
    if (input) input.value = "";
  };

  const handleFile = async (file) => {
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setResult(null);
    setError(null);
    setIsLoading(true);
    setLastAnalysisId(null);

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error(t.unauthorized);
      }

      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || t.analysisServerError);
      }

      setResult(data);

      const probability = Number(data?.probability) || 0;
      const percent = Math.round(probability * 100);
      const label = normalizeLabel(data?.label);

      const analysisRef = doc(collection(db, "analysis_results"));

      const uploaded = await uploadImageToCloudinary(
        file,
        user.uid,
        analysisRef.id
      );

      const analysisData = {
        userId: user.uid,
        userEmail: user.email || "",
        imageUrl: uploaded.secureUrl,
        thumbUrl: uploaded.secureUrl,
        cloudinaryPublicId: uploaded.publicId,
        cloudinaryAssetId: uploaded.assetId,
        width: uploaded.width,
        height: uploaded.height,
        format: uploaded.format,
        bytes: uploaded.bytes,
        label,
        percent,
        isCorrect: null,
        createdAt: serverTimestamp(),
      };

      await setDoc(analysisRef, analysisData);

      await setDoc(
        doc(db, "users", user.uid, "analyses", analysisRef.id),
        analysisData
      );

      setLastAnalysisId(analysisRef.id);

      if (typeof onAnalysisSaved === "function") {
        onAnalysisSaved({
          id: analysisRef.id,
          imageUrl: uploaded.secureUrl,
          thumbUrl: uploaded.secureUrl,
          cloudinaryPublicId: uploaded.publicId,
          cloudinaryAssetId: uploaded.assetId,
          width: uploaded.width,
          height: uploaded.height,
          format: uploaded.format,
          bytes: uploaded.bytes,
          label,
          percent,
          isCorrect: null,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error("Ошибка в handleFile:", err);
      setError(err?.message || t.analyzeFailed);
    } finally {
      setIsLoading(false);
      URL.revokeObjectURL(objectUrl);
    }
  };

  const saveFeedback = async (isCorrect) => {
    const user = auth.currentUser;

    try {
      setIsSavingFeedback(true);

      if (!user) {
        throw new Error(t.unauthorized);
      }

      if (!lastAnalysisId) {
        throw new Error(t.lastAnalysisNotFound);
      }

      await updateDoc(doc(db, "analysis_results", lastAnalysisId), {
        isCorrect,
      });

      await updateDoc(doc(db, "users", user.uid, "analyses", lastAnalysisId), {
        isCorrect,
      });

      resetAnalysis();
    } catch (err) {
      console.error("Ошибка сохранения feedback:", err);
      setError(err?.message || t.feedbackSaveFailed);
      resetAnalysis();
    } finally {
      setIsSavingFeedback(false);
    }
  };

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, []);

  const onFileInput = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, []);

  const prob = result?.probability ?? 0;
  const isAI = result?.label === "AI-generated";

  return (
    <>
      <div style={styles.wrapper}>
        <div
          style={{
            ...styles.dropzoneShell,
            ...(isDragging ? styles.dropzoneShellDragging : {}),
          }}
        >
          <div
            style={{
              ...styles.dropzoneGlow,
              ...(isDragging ? styles.dropzoneGlowDragging : {}),
            }}
          />

          <div
            style={{
              ...styles.dropzone,
              ...(isDragging ? styles.dropzoneDragging : {}),
            }}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => document.getElementById("fileInput")?.click()}
          >
            <input
              id="fileInput"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={onFileInput}
            />

            {preview ? (
              <div style={styles.previewWrap}>
                <img src={preview} alt="preview" style={styles.preview} />
              </div>
            ) : (
              <div style={styles.placeholder}>
                <div style={styles.iconOrb}>
                  <span style={styles.iconEmoji}>🖼️</span>
                </div>

                <p style={styles.dropTitle}>{t.dropText}</p>
                <p style={styles.dropSub}>{t.fileTypes}</p>

                <div style={styles.badgesRow}>
                  <span style={styles.fileBadge}>JPG</span>
                  <span style={styles.fileBadge}>PNG</span>
                  <span style={styles.fileBadge}>WEBP</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {isLoading && (
          <div style={styles.loadingCard}>
            <div style={styles.loadingDot}></div>
            <span>{t.analyzing}</span>
          </div>
        )}

        {error && <div style={styles.error}>❌ {error}</div>}

        {result && (
          <div style={styles.result}>
            <div
              style={{
                ...styles.verdict,
                ...(isAI ? styles.verdictAI : styles.verdictReal),
              }}
            >
              <div style={styles.verdictIconWrap}>
                <span style={styles.verdictIcon}>{isAI ? "🤖" : "📷"}</span>
              </div>

              <div style={styles.verdictTextBlock}>
                <div
                  style={{
                    ...styles.verdictTitle,
                    color: isAI ? "#ff7a7a" : "#7dffb3",
                  }}
                >
                  {isAI ? t.aiGenerated : t.realPhoto}
                </div>

                <div style={styles.verdictSub}>
                  {t.aiProbability}: {(prob * 100).toFixed(1)}%
                </div>
              </div>
            </div>

            <div style={styles.barCard}>
              <div style={styles.barLabels}>
                <span style={styles.realText}>{t.real}</span>
                <span style={styles.aiText}>{t.ai}</span>
              </div>

              <div style={styles.barTrack}>
                <div
                  style={{
                    ...styles.barFill,
                    width: `${prob * 100}%`,
                    background: isAI
                      ? "linear-gradient(90deg, #ff6868, #ff3d7f)"
                      : "linear-gradient(90deg, #41d98c, #7dffb3)",
                  }}
                />
              </div>
            </div>

            <details style={styles.details}>
              <summary style={styles.summary}>{t.metricsTitle}</summary>
              <table style={styles.table}>
                <tbody>
                  {Object.entries(result.metrics || {}).map(([key, val]) => (
                    <tr key={key}>
                      <td style={styles.tdKey}>{key}</td>
                      <td style={styles.tdVal}>
                        {typeof val === "number" ? val.toFixed(4) : String(val)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>

            <button
              style={styles.resetBtn}
              onClick={() => setFeedbackOpen(true)}
            >
              {t.checkAnotherPhoto}
            </button>
          </div>
        )}
      </div>

      {feedbackOpen && (
        <div style={styles.modalBackdrop} onClick={() => setFeedbackOpen(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalGlow}></div>

            <button
              style={styles.modalClose}
              onClick={() => setFeedbackOpen(false)}
              aria-label={t.close}
            >
              ✕
            </button>

            <div style={styles.modalTitle}>{t.feedbackTitle}</div>
            <div style={styles.modalText}>{t.feedbackText}</div>

            <div style={styles.feedbackActions}>
              <button
                style={{ ...styles.feedbackBtn, ...styles.feedbackYes }}
                onClick={() => saveFeedback(true)}
                disabled={isSavingFeedback}
              >
                {t.yesCorrect}
              </button>

              <button
                style={{ ...styles.feedbackBtn, ...styles.feedbackNo }}
                onClick={() => saveFeedback(false)}
                disabled={isSavingFeedback}
              >
                {t.noMistake}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  wrapper: {
    width: "100%",
    maxWidth: 670,
    margin: "0 auto",
    padding: "20px 20px 28px",
    fontFamily: "Inter, system-ui, sans-serif",
    color: "#fff",
  },

  dropzoneShell: {
    position: "relative",
    borderRadius: 34,
    padding: 1,
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.22), rgba(89,120,255,0.24), rgba(255,255,255,0.08), rgba(255,215,140,0.14))",
    boxShadow:
      "0 30px 80px rgba(0,0,0,0.48), 0 0 50px rgba(70,110,255,0.12)",
    transition: "transform 0.25s ease, box-shadow 0.25s ease",
  },

  dropzoneShellDragging: {
    transform: "scale(1.015)",
    boxShadow:
      "0 32px 90px rgba(0,0,0,0.55), 0 0 80px rgba(90,140,255,0.24)",
  },

  dropzoneGlow: {
    position: "absolute",
    inset: "8% 18%",
    borderRadius: 999,
    background:
      "radial-gradient(circle, rgba(96,140,255,0.18), rgba(96,140,255,0) 68%)",
    filter: "blur(22px)",
    pointerEvents: "none",
  },

  dropzoneGlowDragging: {
    background:
      "radial-gradient(circle, rgba(96,140,255,0.28), rgba(96,140,255,0) 68%)",
  },

  dropzone: {
    position: "relative",
    minHeight: 350,
    borderRadius: 33,
    padding: "34px 28px",
    textAlign: "center",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    border: "1px dashed rgba(255,255,255,0.16)",
    background:
      "linear-gradient(180deg, rgba(19,24,54,0.78), rgba(12,15,35,0.88))",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    transition:
      "border-color 0.25s ease, background 0.25s ease, transform 0.25s ease",
  },

  dropzoneDragging: {
    border: "1px dashed rgba(116,160,255,0.85)",
    background:
      "linear-gradient(180deg, rgba(23,31,72,0.9), rgba(14,18,46,0.94))",
  },

  previewWrap: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  preview: {
    maxWidth: "100%",
    maxHeight: 420,
    objectFit: "contain",
    borderRadius: 22,
    boxShadow:
      "0 22px 50px rgba(0,0,0,0.38), 0 0 0 1px rgba(255,255,255,0.08)",
  },

  placeholder: {
    position: "relative",
    zIndex: 2,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#e8ecff",
  },

  iconOrb: {
    width: 88,
    height: 88,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    background:
      "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.28), rgba(88,108,255,0.18) 45%, rgba(255,255,255,0.06) 100%)",
    border: "1px solid rgba(255,255,255,0.16)",
    boxShadow:
      "0 12px 30px rgba(0,0,0,0.28), 0 0 28px rgba(90,120,255,0.18)",
  },

  iconEmoji: {
    fontSize: 34,
    lineHeight: 1,
  },

  dropTitle: {
    margin: 0,
    fontSize: 24,
    fontWeight: 700,
    letterSpacing: "-0.02em",
    color: "rgba(255,255,255,0.96)",
  },

  dropSub: {
    marginTop: 10,
    marginBottom: 18,
    color: "rgba(255,255,255,0.58)",
    fontSize: 14,
    fontWeight: 500,
  },

  badgesRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
    justifyContent: "center",
  },

  fileBadge: {
    padding: "8px 12px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "rgba(255,255,255,0.82)",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.08em",
  },

  loadingCard: {
    marginTop: 18,
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 16px",
    borderRadius: 14,
    background: "rgba(20,25,52,0.7)",
    border: "1px solid rgba(97,141,255,0.18)",
    color: "#9fc0ff",
    boxShadow: "0 12px 30px rgba(0,0,0,0.22)",
  },

  loadingDot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: "#79aaff",
    boxShadow: "0 0 18px rgba(121,170,255,0.7)",
  },

  error: {
    marginTop: 18,
    textAlign: "center",
    padding: "14px 16px",
    borderRadius: 14,
    background: "rgba(80,18,24,0.72)",
    border: "1px solid rgba(255,107,107,0.2)",
    color: "#ff9a9a",
  },

  result: {
    marginTop: 24,
    display: "grid",
    gap: 18,
  },

  verdict: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    borderRadius: 24,
    padding: 20,
    border: "1px solid",
    boxShadow: "0 18px 40px rgba(0,0,0,0.28)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
  },

  verdictAI: {
    background:
      "linear-gradient(180deg, rgba(58,20,28,0.82), rgba(31,13,19,0.86))",
    borderColor: "rgba(255,100,100,0.22)",
  },

  verdictReal: {
    background:
      "linear-gradient(180deg, rgba(17,54,36,0.82), rgba(10,32,23,0.86))",
    borderColor: "rgba(80,220,140,0.22)",
  },

  verdictIconWrap: {
    width: 72,
    height: 72,
    flexShrink: 0,
    borderRadius: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.1)",
  },

  verdictIcon: {
    fontSize: 34,
    lineHeight: 1,
  },

  verdictTextBlock: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },

  verdictTitle: {
    fontSize: 24,
    fontWeight: 800,
    letterSpacing: "-0.02em",
  },

  verdictSub: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 14,
  },

  barCard: {
    padding: 16,
    borderRadius: 20,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 14px 34px rgba(0,0,0,0.2)",
  },

  barLabels: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    fontWeight: 700,
    fontSize: 14,
  },

  realText: {
    color: "#7dffb3",
  },

  aiText: {
    color: "#ff7a7a",
  },

  barTrack: {
    width: "100%",
    height: 14,
    borderRadius: 999,
    background: "rgba(255,255,255,0.08)",
    overflow: "hidden",
    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.28)",
  },

  barFill: {
    height: "100%",
    borderRadius: 999,
    transition: "width 0.35s ease",
    boxShadow: "0 0 20px rgba(255,255,255,0.18)",
  },

  details: {
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.03))",
    borderRadius: 20,
    padding: 14,
    border: "1px solid rgba(255,255,255,0.08)",
  },

  summary: {
    cursor: "pointer",
    color: "#f0f3ff",
    fontWeight: 700,
    fontSize: 15,
    listStyle: "none",
  },

  table: {
    width: "100%",
    marginTop: 14,
    borderCollapse: "collapse",
  },

  tdKey: {
    padding: "10px 10px 10px 0",
    color: "rgba(255,255,255,0.58)",
    verticalAlign: "top",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },

  tdVal: {
    padding: "10px 0",
    color: "#fff",
    textAlign: "right",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    fontWeight: 600,
  },

  resetBtn: {
    width: "100%",
    marginTop: 2,
    padding: "15px 18px",
    border: "1px solid rgba(120,160,255,0.16)",
    borderRadius: 16,
    background: "linear-gradient(135deg, #6ca1ff, #517cff)",
    color: "#fff",
    fontWeight: 800,
    fontSize: 15,
    cursor: "pointer",
    boxShadow: "0 18px 34px rgba(81,124,255,0.28)",
  },

  modalBackdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.72)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: 20,
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
  },

  modal: {
    width: "100%",
    maxWidth: 400,
    background:
      "linear-gradient(180deg, rgba(18,20,30,0.94), rgba(15,16,24,0.96))",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 26,
    padding: "28px 20px 20px",
    position: "relative",
    boxShadow: "0 30px 80px rgba(0,0,0,0.48)",
    overflow: "hidden",
  },

  modalGlow: {
    position: "absolute",
    inset: "auto -10% 55% -10%",
    height: 180,
    background:
      "radial-gradient(circle, rgba(92,126,255,0.16), rgba(92,126,255,0) 68%)",
    pointerEvents: "none",
  },

  modalClose: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    cursor: "pointer",
  },

  modalTitle: {
    position: "relative",
    zIndex: 1,
    fontSize: 24,
    fontWeight: 800,
    marginBottom: 10,
    letterSpacing: "-0.02em",
  },

  modalText: {
    position: "relative",
    zIndex: 1,
    color: "rgba(255,255,255,0.68)",
    fontSize: 14,
    marginBottom: 18,
    lineHeight: 1.5,
  },

  feedbackActions: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },

  feedbackBtn: {
    border: "none",
    borderRadius: 14,
    padding: "14px 12px",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 14px 26px rgba(0,0,0,0.2)",
  },

  feedbackYes: {
    background: "linear-gradient(135deg, #22b86b, #179954)",
  },

  feedbackNo: {
    background: "linear-gradient(135deg, #d44a4a, #b93131)",
  },
};