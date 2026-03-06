// src/components/DragDropZone.jsx

import { useState, useCallback } from "react";

const API_URL = "http://localhost:5000/api/analyze";

export default function DragDropZone() {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading,  setIsLoading]  = useState(false);
  const [result,     setResult]     = useState(null);
  const [error,      setError]      = useState(null);
  const [preview,    setPreview]    = useState(null);

  // ---------------------------------------------------------------------------
  // Drag & Drop handlers
  // ---------------------------------------------------------------------------

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const onFileInput = useCallback((e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  }, []);

  // ---------------------------------------------------------------------------
  // Отправка на сервер
  // ---------------------------------------------------------------------------

  const handleFile = async (file) => {
    // Превью
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setError(null);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(API_URL, {
        method: "POST",
        body:   formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ошибка сервера");
      }

      setResult(data);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const prob    = result?.probability ?? 0;
  const filled  = Math.round(prob * 20);
  const isAI    = result?.label === "AI-generated";

  return (
    <div style={styles.wrapper}>

      {/* Зона загрузки */}
      <div
        style={{
          ...styles.dropzone,
          borderColor: isDragging ? "#4f8ef7" : "#555",
          background:  isDragging ? "#1a2a3a" : "#1a1a2e",
        }}
        onDragOver  = {onDragOver}
        onDragLeave = {onDragLeave}
        onDrop      = {onDrop}
        onClick     = {() => document.getElementById("fileInput").click()}
      >
        <input
          id       = "fileInput"
          type     = "file"
          accept   = "image/*"
          style    = {{ display: "none" }}
          onChange = {onFileInput}
        />

        {preview ? (
          <img src={preview} alt="preview" style={styles.preview} />
        ) : (
          <div style={styles.placeholder}>
            <p style={{ fontSize: 48 }}>🖼️</p>
            <p>Перетащи фото сюда или кликни для выбора</p>
            <p style={{ color: "#888", fontSize: 13 }}>
              JPG, PNG, WEBP — до 10MB
            </p>
          </div>
        )}
      </div>

      {/* Загрузка */}
      {isLoading && (
        <div style={styles.loading}>
          ⏳ Анализируем изображение...
        </div>
      )}

      {/* Ошибка */}
      {error && (
        <div style={styles.error}>
          ❌ {error}
        </div>
      )}

      {/* Результат */}
      {result && (
        <div style={styles.result}>

          {/* Вердикт */}
          <div style={{
            ...styles.verdict,
            background: isAI ? "#3a1a1a" : "#1a3a1a",
            borderColor: isAI ? "#e74c3c" : "#2ecc71",
          }}>
            <span style={{ fontSize: 36 }}>
              {isAI ? "🤖" : "📷"}
            </span>
            <div>
              <div style={{
                fontSize: 22,
                fontWeight: "bold",
                color: isAI ? "#e74c3c" : "#2ecc71",
              }}>
                {result.label}
              </div>
              <div style={{ color: "#aaa", fontSize: 14 }}>
                Вероятность AI: {(prob * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Шкала */}
          <div style={styles.barWrapper}>
            <span style={{ color: "#2ecc71" }}>Real</span>
            <div style={styles.barTrack}>
              <div style={{
                ...styles.barFill,
                width:      `${prob * 100}%`,
                background: isAI ? "#e74c3c" : "#2ecc71",
              }} />
            </div>
            <span style={{ color: "#e74c3c" }}>AI</span>
          </div>

          {/* Метрики */}
          <details style={styles.details}>
            <summary style={styles.summary}>
              Подробные метрики
            </summary>
            <table style={styles.table}>
              <tbody>
                {Object.entries(result.metrics).map(([key, val]) => (
                  <tr key={key}>
                    <td style={styles.tdKey}>{key}</td>
                    <td style={styles.tdVal}>
                      {typeof val === "number" ? val.toFixed(4) : val}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>

          {/* Кнопка сброса */}
          <button
            style   = {styles.resetBtn}
            onClick = {() => {
              setResult(null);
              setPreview(null);
              setError(null);
            }}
          >
            Проверить другое фото
          </button>

        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Стили
// ---------------------------------------------------------------------------

const styles = {
  wrapper: {
    maxWidth:  600,
    margin:    "0 auto",
    padding:   20,
    fontFamily: "sans-serif",
    color:     "#fff",
  },
  dropzone: {
    border:       "2px dashed #555",
    borderRadius: 12,
    padding:      32,
    textAlign:    "center",
    cursor:       "pointer",
    minHeight:    200,
    display:      "flex",
    alignItems:   "center",
    justifyContent: "center",
    transition:   "all 0.2s",
  },
  placeholder: {
    color: "#888",
  },
  preview: {
    maxWidth:     "100%",
    maxHeight:    300,
    borderRadius: 8,
  },
  loading: {
    textAlign:  "center",
    padding:    16,
    color:      "#aaa",
    fontSize:   16,
  },
  error: {
    background:   "#3a1a1a",
    border:       "1px solid #e74c3c",
    borderRadius: 8,
    padding:      12,
    marginTop:    12,
    color:        "#e74c3c",
  },
  result: {
    marginTop: 20,
  },
  verdict: {
    display:      "flex",
    alignItems:   "center",
    gap:          16,
    padding:      20,
    borderRadius: 12,
    border:       "1px solid",
    marginBottom: 16,
  },
  barWrapper: {
    display:    "flex",
    alignItems: "center",
    gap:        10,
    marginBottom: 16,
  },
  barTrack: {
    flex:         1,
    height:       12,
    background:   "#333",
    borderRadius: 6,
    overflow:     "hidden",
  },
  barFill: {
    height:     "100%",
    borderRadius: 6,
    transition: "width 0.5s ease",
  },
  details: {
    background:   "#111",
    borderRadius: 8,
    padding:      12,
    marginBottom: 12,
  },
  summary: {
    cursor:     "pointer",
    color:      "#aaa",
    fontSize:   14,
    marginBottom: 8,
  },
  table: {
    width:       "100%",
    borderCollapse: "collapse",
    fontSize:    13,
  },
  tdKey: {
    padding:    "4px 8px",
    color:      "#888",
    width:      "50%",
  },
  tdVal: {
    padding:    "4px 8px",
    color:      "#fff",
    fontFamily: "monospace",
  },
  resetBtn: {
    width:        "100%",
    padding:      12,
    background:   "#4f8ef7",
    color:        "#fff",
    border:       "none",
    borderRadius: 8,
    cursor:       "pointer",
    fontSize:     15,
  },
};