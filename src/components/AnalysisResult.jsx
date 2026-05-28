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
      : 0.74 - fallbackIndex * 0.1;

  return Math.round(clamp(rawStrength * 100, 9, 99));
}

function formatMetricValue(value) {
  if (typeof value === "number") {
    return Number.isInteger(value) ? String(value) : value.toFixed(4);
  }

  return String(value);
}

function buildFingerprints(result, t) {
  const top = Array.isArray(result?.top_contributions)
    ? result.top_contributions.slice(0, 4).map((item, index) => ({
        label: humanizeMetric(item.metric, t),
        value: metricStrength(item, index),
        tone: Number(item.contribution) >= 0 ? "ai" : "real",
        hint: Number(item.contribution) >= 0 ? t.pushesAI : t.pushesReal,
        metricValue: item.value,
      }))
    : [];

  if (top.length > 0) {
    return top;
  }

  const metrics = result?.metrics || {};
  return [
    {
      label: t.artifactSignal,
      value: Math.round(clamp(Number(metrics.jpeg_artifact_score) * 100, 12, 91)),
      tone: "ai",
      hint: t.visualEvidence,
      metricValue: metrics.jpeg_artifact_score,
    },
    {
      label: t.textureNoise,
      value: Math.round(
        clamp(Number(metrics.noise_naturalness ?? metrics.noise_entropy) * 100, 12, 91)
      ),
      tone: "real",
      hint: t.visualEvidence,
      metricValue: metrics.noise_naturalness ?? metrics.noise_entropy,
    },
    {
      label: t.frequencyPattern,
      value: Math.round(
        clamp(Number(metrics.hf_energy_ratio ?? metrics.spectral_flatness) * 100, 12, 91)
      ),
      tone: "neutral",
      hint: t.modelSignal,
      metricValue: metrics.hf_energy_ratio ?? metrics.spectral_flatness,
    },
  ].filter((item) => Number.isFinite(item.value));
}

function buildSummaryStats(percent, realPercent, result, t) {
  const threshold = Number(result?.threshold);
  const stats = [
    {
      label: t.aiProbability,
      value: `${percent.toFixed(1)}%`,
      tone: "ai",
    },
    {
      label: t.realPhotoScore,
      value: `${realPercent.toFixed(1)}%`,
      tone: "real",
    },
  ];

  if (Number.isFinite(threshold)) {
    stats.push({
      label: t.threshold,
      value: `${toPercent(threshold).toFixed(1)}%`,
      tone: "neutral",
    });
  }

  if (result?.modelVersion) {
    stats.push({
      label: t.modelVersion,
      value: String(result.modelVersion),
      tone: "neutral",
    });
  }

  return stats.slice(0, 4);
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

export default function AnalysisResult({
  result,
  preview,
  styles,
  t,
  onFeedbackRequest,
}) {
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
  const confidenceCopy = isAI ? t.aiSignalDetected : t.realSignalDetected;
  const fingerprints = buildFingerprints(result, t);
  const stats = buildSummaryStats(percent, realPercent, result, t);
  const metricEntries = Object.entries(result.metrics || {}).slice(0, 8);
  const ringColor = isAI ? "#ff6d83" : "#62e69a";

  return (
    <section style={styles.resultPanel} aria-label={t.analysisResultLabel}>
      <div style={styles.reportHero}>
        <div style={styles.reportMedia}>
          <div style={styles.reportMediaFrame}>
            {preview ? (
              <img src={preview} alt={t.uploadedImage} style={styles.reportImage} />
            ) : (
              <div style={styles.reportImageFallback}>LANDER</div>
            )}
            <div style={styles.reportScanLine}></div>
          </div>
          <div style={styles.reportMediaCaption}>{t.aiFingerprint}</div>
        </div>

        <div style={styles.reportContent}>
          <div style={styles.reportTopline}>
            <span
              style={{
                ...styles.reportPill,
                ...(isAI ? styles.reportPillAI : styles.reportPillReal),
              }}
            >
              {statusLabel}
            </span>
            <span style={styles.reportReady}>{t.reportReady}</span>
          </div>

          <div style={styles.reportTitleRow}>
            <div>
              <h2 style={styles.reportTitle}>{t.aiFingerprint}</h2>
              <p style={styles.reportText}>{confidenceCopy}</p>
            </div>

            <div
              style={{
                ...styles.scoreRing,
                background: `conic-gradient(${ringColor} ${percent * 3.6}deg, rgba(255,255,255,0.09) 0deg)`,
              }}
            >
              <div style={styles.scoreRingInner}>
                <strong style={{ ...styles.scoreRingValue, color: ringColor }}>
                  {percent.toFixed(1)}%
                </strong>
                <span style={styles.scoreRingLabel}>{t.ai}</span>
              </div>
            </div>
          </div>

          <div style={styles.summaryGrid}>
            {stats.map((stat) => (
              <div style={styles.summaryStat} key={stat.label}>
                <span style={styles.summaryLabel}>{stat.label}</span>
                <strong
                  style={{
                    ...styles.summaryValue,
                    ...(stat.tone === "ai"
                      ? styles.summaryValueAI
                      : stat.tone === "real"
                        ? styles.summaryValueReal
                        : {}),
                  }}
                >
                  {stat.value}
                </strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={styles.confidenceCard}>
        <div style={styles.confidenceTopline}>
          <span style={styles.realText}>{t.real}</span>
          <span style={styles.confidenceTitle}>{t.probabilitySplit}</span>
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

      <div style={styles.fingerprintSection}>
        <div style={styles.fingerprintHeader}>
          <div>
            <div style={styles.fingerprintTitle}>{t.strongestIndicators}</div>
            <div style={styles.fingerprintSub}>
              {isAI ? t.fingerprintSubAI : t.fingerprintSubReal}
            </div>
          </div>
        </div>

        <div style={styles.fingerprintGrid}>
          {fingerprints.map((item) => (
            <article style={styles.fingerprintCard} key={`${item.label}-${item.hint}`}>
              <div style={styles.fingerprintCardTop}>
                <span style={styles.fingerprintName}>{item.label}</span>
                <span
                  style={{
                    ...styles.fingerprintBadge,
                    ...(item.tone === "ai"
                      ? styles.fingerprintBadgeAI
                      : item.tone === "real"
                        ? styles.fingerprintBadgeReal
                        : {}),
                  }}
                >
                  {item.hint}
                </span>
              </div>
              <div style={styles.fingerprintMeter}>
                <div
                  style={{
                    ...styles.fingerprintFill,
                    width: `${item.value}%`,
                    ...(item.tone === "ai"
                      ? styles.signalFillAI
                      : item.tone === "real"
                        ? styles.signalFillReal
                        : styles.signalFillNeutral),
                  }}
                ></div>
              </div>
              <div style={styles.fingerprintMeta}>
                <span>{t.modelSignal}</span>
                <strong>{item.value}%</strong>
              </div>
              {item.metricValue !== undefined ? (
                <div style={styles.fingerprintRaw}>
                  {t.rawMetric}: {formatMetricValue(item.metricValue)}
                </div>
              ) : null}
            </article>
          ))}
        </div>
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
