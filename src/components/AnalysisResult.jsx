export default function AnalysisResult({ result, styles, t, onFeedbackRequest }) {
  if (!result) return null;

  const prob = result?.probability ?? 0;
  const isAI = result?.label === "AI-generated";

  return (
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

      <button style={styles.resetBtn} onClick={onFeedbackRequest}>
        {t.checkAnotherPhoto}
      </button>
    </div>
  );
}
