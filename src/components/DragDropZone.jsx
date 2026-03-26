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

      cloudinaryUploadError: isUk
        ? "Помилка завантаження в Cloudinary"
        : "Cloudinary upload error",

      dropText: isUk
        ? "Перетягни фото сюди або натисни для вибору"
        : "Drop a photo here or click to choose",

      fileTypes: isUk
        ? "JPG, PNG, WEBP — до 10MB"
        : "JPG, PNG, WEBP — up to 10MB",

      analyzing: isUk
        ? "⏳ Аналізуємо зображення..."
        : "⏳ Analyzing image...",

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

      await updateDoc(
        doc(db, "users", user.uid, "analyses", lastAnalysisId),
        {
          isCorrect,
        }
      );

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
            ...styles.dropzone,
            borderColor: isDragging ? "#4f8ef7" : "#555",
            background: isDragging ? "#1a2a3a" : "#1a1a2e",
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
            <img src={preview} alt="preview" style={styles.preview} />
          ) : (
            <div style={styles.placeholder}>
              <p style={{ fontSize: 48 }}>🖼️</p>
              <p>{t.dropText}</p>
              <p style={{ color: "#888", fontSize: 13 }}>{t.fileTypes}</p>
            </div>
          )}
        </div>

        {isLoading && <div style={styles.loading}>{t.analyzing}</div>}

        {error && <div style={styles.error}>❌ {error}</div>}

        {result && (
          <div style={styles.result}>
            <div
              style={{
                ...styles.verdict,
                background: isAI ? "#3a1a1a" : "#1a3a1a",
                borderColor: isAI ? "#e74c3c" : "#2ecc71",
              }}
            >
              <span style={{ fontSize: 36 }}>{isAI ? "🤖" : "📷"}</span>
              <div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: "bold",
                    color: isAI ? "#e74c3c" : "#2ecc71",
                  }}
                >
                  {isAI ? t.aiGenerated : t.realPhoto}
                </div>
                <div style={{ color: "#aaa", fontSize: 14 }}>
                  {t.aiProbability}: {(prob * 100).toFixed(1)}%
                </div>
              </div>
            </div>

            <div style={styles.barWrapper}>
              <span style={{ color: "#2ecc71" }}>{t.real}</span>
              <div style={styles.barTrack}>
                <div
                  style={{
                    ...styles.barFill,
                    width: `${prob * 100}%`,
                    background: isAI ? "#e74c3c" : "#2ecc71",
                  }}
                />
              </div>
              <span style={{ color: "#e74c3c" }}>{t.ai}</span>
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
    maxWidth: 600,
    margin: "0 auto",
    padding: 20,
    fontFamily: "sans-serif",
    color: "#fff",
  },
  dropzone: {
    border: "2px dashed #555",
    borderRadius: 12,
    padding: 32,
    textAlign: "center",
    cursor: "pointer",
    minHeight: 200,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  preview: {
    maxWidth: "100%",
    maxHeight: 360,
    objectFit: "contain",
    borderRadius: 12,
  },
  placeholder: {
    color: "#bbb",
  },
  loading: {
    marginTop: 18,
    textAlign: "center",
    color: "#4f8ef7",
  },
  error: {
    marginTop: 18,
    textAlign: "center",
    color: "#ff6b6b",
  },
  result: {
    marginTop: 22,
  },
  verdict: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    border: "1px solid",
    borderRadius: 16,
    padding: 18,
  },
  barWrapper: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginTop: 18,
  },
  barTrack: {
    flex: 1,
    height: 12,
    borderRadius: 999,
    background: "rgba(255,255,255,0.12)",
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 999,
    transition: "width 0.25s ease",
  },
  details: {
    marginTop: 18,
    background: "rgba(255,255,255,0.04)",
    borderRadius: 14,
    padding: 12,
  },
  summary: {
    cursor: "pointer",
    color: "#ddd",
  },
  table: {
    width: "100%",
    marginTop: 12,
    borderCollapse: "collapse",
  },
  tdKey: {
    padding: "8px 10px 8px 0",
    color: "#aaa",
    verticalAlign: "top",
  },
  tdVal: {
    padding: "8px 0",
    color: "#fff",
    textAlign: "right",
  },
  resetBtn: {
    width: "100%",
    marginTop: 20,
    padding: "14px 18px",
    border: "none",
    borderRadius: 12,
    background: "#5b9bff",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
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
  },
  modal: {
    width: "100%",
    maxWidth: 420,
    background: "#151518",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 20,
    padding: "26px 20px 20px",
    position: "relative",
    boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
  },
  modalClose: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 34,
    height: 34,
    border: "none",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.08)",
    color: "#fff",
    cursor: "pointer",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 800,
    marginBottom: 10,
  },
  modalText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    marginBottom: 18,
    lineHeight: 1.45,
  },
  feedbackActions: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },
  feedbackBtn: {
    border: "none",
    borderRadius: 12,
    padding: "14px 12px",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },
  feedbackYes: {
    background: "#1f9d55",
  },
  feedbackNo: {
    background: "#c0392b",
  },
};