import { getDragDropTranslations } from "../i18n/translations";
import { useImageAnalysis } from "../hooks/useImageAnalysis";
import AnalysisResult from "./AnalysisResult";
import UploadDropArea from "./UploadDropArea";
import { dragDropStyles as styles } from "./DragDropZone.styles";

export default function DragDropZone({ onAnalysisSaved, language = "en" }) {
  const t = getDragDropTranslations(language);

  const {
    isDragging,
    isLoading,
    result,
    error,
    preview,
    isSavingFeedback,
    feedbackStatus,
    resetAnalysis,
    saveFeedback,
    onDragOver,
    onDragLeave,
    onDrop,
    onFileInput,
  } = useImageAnalysis({ onAnalysisSaved, t });

  return (
    <>
      <div style={styles.wrapper}>
        <UploadDropArea
          isDragging={isDragging}
          preview={preview}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onFileInput={onFileInput}
          styles={styles}
          t={t}
        />

        {isLoading && (
          <div style={styles.loadingCard}>
            <div style={styles.loadingDot}></div>
            <span>{t.analyzing}</span>
          </div>
        )}

        {error && <div style={styles.error}>❌ {error}</div>}

        <AnalysisResult
          result={result}
          preview={preview}
          feedbackStatus={feedbackStatus}
          isSavingFeedback={isSavingFeedback}
          styles={styles}
          t={t}
          onFeedbackSave={saveFeedback}
          onReset={resetAnalysis}
        />
      </div>
    </>
  );
}
