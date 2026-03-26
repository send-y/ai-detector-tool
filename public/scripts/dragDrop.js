import { useState } from "react";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
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

function clampPercent(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result || "");
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function DragDropZone({ onAnalysisSaved }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewSrc, setPreviewSrc] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const handleFile = async (file) => {
    if (!file || !file.type?.startsWith("image/")) return;

    setSelectedFile(file);
    setResult(null);

    const dataUrl = await fileToDataUrl(file);
    setPreviewSrc(dataUrl);
  };

  const onInputChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFile(file);
    }
  };

  const onDrop = async (e) => {
    e.preventDefault();
    setDragOver(false);

    const file = e.dataTransfer?.files?.[0];
    if (file) {
      await handleFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewSrc("");
    setResult(null);
  };

  const saveAnalysisToFirestore = async (serverResult) => {
    const user = auth.currentUser;
    if (!user || !selectedFile) return;

    const thumbUrl = previewSrc || (await fileToDataUrl(selectedFile));
    const percent = clampPercent((Number(serverResult?.p_ai) || 0) * 100);
    const label = serverResult?.label === "ai" ? "ai" : "real";

    const payload = {
      thumbUrl,
      label,
      percent,
      createdAt: serverTimestamp(),
    };

    const ref = await addDoc(
      collection(db, "users", user.uid, "analyses"),
      payload
    );

    onAnalysisSaved?.({
      id: ref.id,
      thumbUrl,
      label,
      percent,
      createdAt: new Date().toISOString(),
    });
  };

  const submitAnalysis = async () => {
    if (!selectedFile) {
      alert("Сначала выбери фото");
      return;
    }

    if (!auth.currentUser) {
      alert("Сначала войди в аккаунт");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("photo", selectedFile);

      const res = await fetch("http://127.0.0.1:5000/analyze", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Ошибка сервера: ${res.status}`);
      }

      const data = await res.json();

      const percent = clampPercent((Number(data?.p_ai) || 0) * 100);
      const label = data?.label === "ai" ? "ai" : "real";

      const normalizedResult = {
        ...data,
        label,
        p_ai: Number(data?.p_ai) || 0,
        percent,
      };

      setResult(normalizedResult);

      await saveAnalysisToFirestore(normalizedResult);
    } catch (err) {
      console.error("Ошибка анализа:", err);
      alert("Не удалось выполнить анализ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const labelText =
    result?.label === "ai" ? "AI" : result?.label === "real" ? "Real" : "";

  const percentText =
    typeof result?.percent === "number" ? `${result.percent}%` : "";

  return (
    <form
      className="upload-form"
      onSubmit={(e) => {
        e.preventDefault();
        submitAnalysis();
      }}
    >
      <div
        id="dropZone"
        className={`upload-box ${previewSrc ? "has-image" : ""} ${dragOver ? "dragover" : ""}`}
        onClick={() => document.getElementById("photo")?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        <input
          id="photo"
          type="file"
          accept="image/*"
          hidden
          onChange={onInputChange}
        />

        {previewSrc ? (
          <img
            id="previewImage"
            className="upload-preview"
            src={previewSrc}
            alt="preview"
          />
        ) : null}

        <div
          id="placeholder"
          className="upload-placeholder"
          style={{ display: previewSrc ? "none" : "block" }}
        >
          <div className="upload-icon">+</div>
          <p className="upload-title">Перетащите фото сюда</p>
          <p className="upload-sub">или нажмите для выбора</p>
        </div>

        <button
          id="removeBtn"
          className="remove-btn"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            removeFile();
          }}
          style={{ display: previewSrc ? "flex" : "none" }}
        >
          ✕
        </button>
      </div>

      <button
        id="uploadBtn"
        className="upload-btn"
        type="submit"
        disabled={!selectedFile || isSubmitting}
      >
        {isSubmitting ? "Анализ..." : "Проверить фото"}
      </button>

      {result ? (
        <div className="analysis-result-card">
          <div className="analysis-result-card__title">Результат анализа</div>
          <div className="analysis-result-card__row">
            <span className="analysis-result-card__badge">
              {labelText}
            </span>
            <span className="analysis-result-card__value">
              {percentText}
            </span>
          </div>
        </div>
      ) : null}
    </form>
  );
}