function clamp(value, min = 0, max = 100) {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function toPercent(probability) {
  return Math.round(clamp(probability, 0, 1) * 1000) / 10;
}

function humanizeMetric(key = "", t = {}) {
  if (t.metricLabels?.[key]) {
    return t.metricLabels[key];
  }

  return String(key)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function metricStrength(item, fallbackIndex) {
  const zScore = Math.abs(Number(item?.z));
  const contribution = Math.abs(Number(item?.contribution));
  const rawStrength = Number.isFinite(zScore)
    ? zScore / 5
    : Number.isFinite(contribution)
      ? contribution / 2.5
      : 0.7 - fallbackIndex * 0.1;

  return Math.round(clamp(rawStrength * 100, 8, 99));
}

function buildSignals(result, percent, realPercent, t) {
  const baseSignals = [
    {
      label: t.aiConfidence,
      value: percent,
      tone: "ai",
    },
    {
      label: t.realPhotoScore,
      value: realPercent,
      tone: "real",
    },
  ];

  const topSignals = Array.isArray(result?.top_contributions)
    ? result.top_contributions.slice(0, 3).map((item, index) => ({
        label: humanizeMetric(item.metric, t),
        value: metricStrength(item, index),
        tone: Number(item.contribution) >= 0 ? "ai" : "real",
        hint: Number(item.contribution) >= 0 ? t.pushesAI : t.pushesReal,
      }))
    : [];

  if (topSignals.length > 0) {
    return [...baseSignals, ...topSignals].slice(0, 5);
  }

  const metrics = result?.metrics || {};
  const fallbackMetrics = [
    [t.artifactSignal, metrics.jpeg_artifact_score],
    [t.textureNoise, metrics.noise_naturalness ?? metrics.noise_entropy],
    [t.frequencyPattern, metrics.hf_energy_ratio ?? metrics.spectral_flatness],
  ]
    .filter(([, value]) => Number.isFinite(Number(value)))
    .map(([label, value]) => ({
      label,
      value: Math.round(clamp(Number(value) * 100, 8, 99)),
      tone: "neutral",
    }));

  return [...baseSignals, ...fallbackMetrics].slice(0, 5);
}

function formatMetricValue(value) {
  if (typeof value === "number") {
    return Number.isInteger(value) ? String(value) : value.toFixed(4);
  }

  return String(value);
}

function downloadReport(result, percent, statusLabel) {
  const report = {
    status: statusLabel,
    aiProbabilityPercent: percent,
    label: result?.label,
    probability: result?.probability,
    threshold: result?.threshold,
    modelVersion: result?.modelVersion,
    topContributions: result?.top_contributions || [],
    metrics: result?.metrics || {},
    extras: result?.extras || {},
    generatedAt: new Date().toISOString(),
  };

  const blob = new Blob([JSON.stringify(report, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `lander-analysis-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function AnalysisResult({ result, styles, t, onFeedbackRequest }) {
  if (!result) return null;

  const percent = toPercent(result?.probability ?? 0);
  const realPercent = Math.round((100 - percent) * 10) / 10;
  const isAI = result?.label === "AI-generated" || result?.label === "ai";
  const statusLabel = isAI
    ? percent >= 75
      ? t.statusSuspicious
      : t.statusNeedsReview
    : percent <= 35
      ? t.statusLikelyReal
      : t.statusNeedsReview;
  const confidenceCopy = isAI
    ? t.aiSignalDetected
    : t.realSignalDetected;
  const signals = buildSignals(result, percent, realPercent, t);
  const metricEntries = Object.entries(result.metrics || {}).slice(0, 8);

  return (
    <section style={styles.resultPanel} aria-label={t.analysisResultLabel}>
      <div style={styles.resultHeader}>
        <div style={styles.resultIdentity}>
          <div
            style={{
              ...styles.resultIcon,
              ...(isAI ? styles.resultIconAI : styles.resultIconReal),
            }}
          >
            {isAI ? "AI" : "OK"}
          </div>
          <div>
            <div
              style={{
                ...styles.resultStatus,
                color: isAI ? "#ff9a68" : "#75f0ad",
              }}
            >
              {statusLabel}
            </div>
            <div style={styles.resultDescription}>{confidenceCopy}</div>
          </div>
        </div>

        <div
          style={{
            ...styles.resultScore,
            color: isAI ? "#ffb36e" : "#83f5b6",
          }}
        >
          {percent.toFixed(1)}%
        </div>
      </div>

      <div style={styles.confidenceCard}>
        <div style={styles.confidenceTopline}>
          <span style={styles.realText}>{t.real}</span>
          <span style={styles.confidenceTitle}>{t.aiProbability}</span>
          <span style={styles.aiText}>{t.ai}</span>
        </div>
        <div style={styles.confidenceRail}>
          <div style={styles.confidenceGradient}></div>
          <div
            style={{
              ...styles.confidenceMarker,
              left: `${clamp(percent, 0, 100)}%`,
            }}
          ></div>
        </div>
        <div style={styles.confidenceTicks}>
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      <div style={styles.signalGrid}>
        {signals.map((signal) => (
          <div style={styles.signalRow} key={signal.label}>
            <div style={styles.signalText}>
              <span style={styles.signalLabel}>{signal.label}</span>
              {signal.hint ? <span style={styles.signalHint}>{signal.hint}</span> : null}
            </div>
            <div style={styles.signalMeter}>
              <div
                style={{
                  ...styles.signalFill,
                  width: `${signal.value}%`,
                  ...(signal.tone === "real"
                    ? styles.signalFillReal
                    : signal.tone === "ai"
                      ? styles.signalFillAI
                      : styles.signalFillNeutral),
                }}
              ></div>
            </div>
            <span style={styles.signalValue}>{signal.value}%</span>
          </div>
        ))}
      </div>

      <div style={styles.detailCard}>
        <div style={styles.detailTitle}>{t.detailedAnalysis}</div>
        <div style={styles.detailBody}>
          {metricEntries.length > 0 ? (
            metricEntries.map(([key, value]) => (
              <div style={styles.detailMetric} key={key}>
                <span style={styles.detailMetricText}>{humanizeMetric(key, t)}</span>
                <strong style={styles.detailMetricValue}>{formatMetricValue(value)}</strong>
              </div>
            ))
          ) : (
            <div style={styles.detailNote}>{t.noRawMetrics}</div>
          )}
        </div>
      </div>

      <div style={styles.resultActions}>
        <button
          style={styles.downloadBtn}
          type="button"
          onClick={() => downloadReport(result, percent, statusLabel)}
        >
          {t.downloadAnalysis}
        </button>
        <button style={styles.secondaryBtn} type="button" onClick={onFeedbackRequest}>
          {t.checkAnotherPhoto}
        </button>
      </div>
    </section>
  );
}
