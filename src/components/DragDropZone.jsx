import { getDragDropTranslations } from "../i18n/translations";
import { useImageAnalysis } from "../hooks/useImageAnalysis";
import AnalysisResult from "./AnalysisResult";
import FeedbackModal from "./FeedbackModal";
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
    feedbackOpen,
    isSavingFeedback,
    setFeedbackOpen,
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
          styles={styles}
          t={t}
          onFeedbackRequest={() => setFeedbackOpen(true)}
        />
      </div>

      <FeedbackModal
        isOpen={feedbackOpen}
        isSavingFeedback={isSavingFeedback}
        onClose={() => setFeedbackOpen(false)}
        onSave={saveFeedback}
        styles={styles}
        t={t}
      />
    </>
  );
}
