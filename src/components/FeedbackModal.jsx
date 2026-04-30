export default function FeedbackModal({
  isOpen,
  isSavingFeedback,
  onClose,
  onSave,
  styles,
  t,
}) {
  if (!isOpen) return null;

  return (
    <div style={styles.modalBackdrop} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalGlow}></div>

        <button style={styles.modalClose} onClick={onClose} aria-label={t.close}>
          ✕
        </button>

        <div style={styles.modalTitle}>{t.feedbackTitle}</div>
        <div style={styles.modalText}>{t.feedbackText}</div>

        <div style={styles.feedbackActions}>
          <button
            style={{ ...styles.feedbackBtn, ...styles.feedbackYes }}
            onClick={() => onSave(true)}
            disabled={isSavingFeedback}
          >
            {t.yesCorrect}
          </button>

          <button
            style={{ ...styles.feedbackBtn, ...styles.feedbackNo }}
            onClick={() => onSave(false)}
            disabled={isSavingFeedback}
          >
            {t.noMistake}
          </button>
        </div>
      </div>
    </div>
  );
}
