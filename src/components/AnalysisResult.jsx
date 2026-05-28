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

function loadCanvasImage(src) {
  return new Promise((resolve) => {
    if (!src) {
      resolve(null);
      return;
    }

    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

function roundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function fillRoundedRect(ctx, x, y, width, height, radius, fillStyle) {
  roundedRect(ctx, x, y, width, height, radius);
  ctx.fillStyle = fillStyle;
  ctx.fill();
}

function strokeRoundedRect(ctx, x, y, width, height, radius, strokeStyle, lineWidth = 1) {
  roundedRect(ctx, x, y, width, height, radius);
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}

function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 4) {
  const words = String(text || "").split(/\s+/);
  const lines = [];
  let line = "";

  words.forEach((word) => {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  });

  if (line) lines.push(line);

  lines.slice(0, maxLines).forEach((item, index) => {
    const suffix = index === maxLines - 1 && lines.length > maxLines ? "..." : "";
    ctx.fillText(`${item}${suffix}`, x, y + index * lineHeight);
  });
}

function drawCoverImage(ctx, image, x, y, width, height, radius) {
  ctx.save();
  roundedRect(ctx, x, y, width, height, radius);
  ctx.clip();

  if (!image) {
    const fallback = ctx.createLinearGradient(x, y, x + width, y + height);
    fallback.addColorStop(0, "#1a2454");
    fallback.addColorStop(1, "#0b1027");
    ctx.fillStyle = fallback;
    ctx.fillRect(x, y, width, height);
    ctx.fillStyle = "rgba(255,255,255,0.62)";
    ctx.font = "900 42px Inter, Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("LANDER", x + width / 2, y + height / 2);
    ctx.textAlign = "left";
    ctx.restore();
    return;
  }

  const sourceRatio = image.width / image.height;
  const targetRatio = width / height;
  let sx = 0;
  let sy = 0;
  let sw = image.width;
  let sh = image.height;

  if (sourceRatio > targetRatio) {
    sw = image.height * targetRatio;
    sx = (image.width - sw) / 2;
  } else {
    sh = image.width / targetRatio;
    sy = (image.height - sh) / 2;
  }

  ctx.drawImage(image, sx, sy, sw, sh, x, y, width, height);
  ctx.restore();
}

function drawPill(ctx, text, x, y, fill, stroke, color) {
  ctx.font = "900 24px Inter, Arial, sans-serif";
  const width = Math.max(120, ctx.measureText(text).width + 42);
  fillRoundedRect(ctx, x, y, width, 48, 24, fill);
  strokeRoundedRect(ctx, x, y, width, 48, 24, stroke, 2);
  ctx.fillStyle = color;
  ctx.fillText(text, x + 21, y + 31);
  return width;
}

function drawProgress(ctx, x, y, width, value, tone) {
  fillRoundedRect(ctx, x, y, width, 14, 7, "rgba(255,255,255,0.10)");
  const gradient = ctx.createLinearGradient(x, y, x + width, y);
  if (tone === "real") {
    gradient.addColorStop(0, "#45db8e");
    gradient.addColorStop(1, "#83f5b6");
  } else if (tone === "ai") {
    gradient.addColorStop(0, "#ff8a50");
    gradient.addColorStop(1, "#ff4e7c");
  } else {
    gradient.addColorStop(0, "#75a7ff");
    gradient.addColorStop(1, "#ffd777");
  }
  fillRoundedRect(ctx, x, y, Math.max(8, width * clamp(value, 0, 100) / 100), 14, 7, gradient);
}

async function downloadReportPng({
  result,
  preview,
  percent,
  realPercent,
  statusLabel,
  confidenceCopy,
  fingerprints,
  stats,
  t,
  isAI,
}) {
  const image = await loadCanvasImage(preview);
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 1500;
  const ctx = canvas.getContext("2d");
  const ringColor = isAI ? "#ff6d83" : "#62e69a";

  const bg = ctx.createLinearGradient(0, 0, 1200, 1500);
  bg.addColorStop(0, "#08090d");
  bg.addColorStop(0.55, "#10131c");
  bg.addColorStop(1, "#05060a");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1200, 1500);

  const glow = ctx.createRadialGradient(850, 120, 10, 850, 120, 520);
  glow.addColorStop(0, "rgba(85,118,255,0.20)");
  glow.addColorStop(1, "rgba(85,118,255,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 1200, 760);

  ctx.fillStyle = "rgba(255,255,255,0.86)";
  ctx.font = "900 38px Inter, Arial, sans-serif";
  ctx.fillText("LANDER", 76, 86);
  ctx.fillStyle = "rgba(255,255,255,0.44)";
  ctx.font = "800 20px Inter, Arial, sans-serif";
  ctx.fillText(t.aiFingerprint, 76, 120);
  ctx.textAlign = "right";
  ctx.fillText(new Date().toLocaleDateString(), 1124, 96);
  ctx.textAlign = "left";

  fillRoundedRect(ctx, 56, 154, 1088, 560, 34, "rgba(13,16,24,0.88)");
  strokeRoundedRect(ctx, 56, 154, 1088, 560, 34, "rgba(255,255,255,0.10)", 2);

  drawCoverImage(ctx, image, 92, 198, 390, 470, 28);
  ctx.fillStyle = "rgba(255,255,255,0.44)";
  ctx.font = "900 18px Inter, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(t.uploadedImage, 287, 694);
  ctx.textAlign = "left";

  const pillFill = isAI ? "rgba(255,91,118,0.18)" : "rgba(72,220,142,0.16)";
  const pillStroke = isAI ? "rgba(255,112,128,0.32)" : "rgba(112,238,166,0.28)";
  const pillColor = isAI ? "#ff9e7d" : "#82f3b3";
  drawPill(ctx, statusLabel, 526, 202, pillFill, pillStroke, pillColor);

  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.font = "950 54px Inter, Arial, sans-serif";
  ctx.fillText(t.aiFingerprint, 526, 320);
  ctx.fillStyle = "rgba(255,255,255,0.62)";
  ctx.font = "700 25px Inter, Arial, sans-serif";
  drawWrappedText(ctx, confidenceCopy, 526, 362, 390, 34, 4);

  ctx.beginPath();
  ctx.arc(1006, 322, 88, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255,255,255,0.10)";
  ctx.lineWidth = 20;
  ctx.lineCap = "round";
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(1006, 322, 88, -Math.PI / 2, Math.PI * 2 * (percent / 100) - Math.PI / 2);
  ctx.strokeStyle = ringColor;
  ctx.lineWidth = 20;
  ctx.stroke();
  ctx.fillStyle = ringColor;
  ctx.font = "950 42px Inter, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`${percent.toFixed(1)}%`, 1006, 332);
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.font = "900 18px Inter, Arial, sans-serif";
  ctx.fillText(t.ai, 1006, 364);
  ctx.textAlign = "left";

  stats.forEach((stat, index) => {
    const x = 526 + (index % 2) * 290;
    const y = 500 + Math.floor(index / 2) * 92;
    fillRoundedRect(ctx, x, y, 258, 68, 18, "rgba(255,255,255,0.055)");
    strokeRoundedRect(ctx, x, y, 258, 68, 18, "rgba(255,255,255,0.08)", 1);
    ctx.fillStyle = "rgba(255,255,255,0.48)";
    ctx.font = "850 17px Inter, Arial, sans-serif";
    ctx.fillText(stat.label, x + 18, y + 25);
    ctx.fillStyle = stat.tone === "ai" ? "#ff9d74" : stat.tone === "real" ? "#83f5b6" : "#ffffff";
    ctx.font = "950 26px Inter, Arial, sans-serif";
    ctx.fillText(stat.value, x + 18, y + 54);
  });

  fillRoundedRect(ctx, 56, 754, 1088, 392, 30, "rgba(255,255,255,0.035)");
  strokeRoundedRect(ctx, 56, 754, 1088, 392, 30, "rgba(255,255,255,0.09)", 2);
  ctx.fillStyle = "rgba(255,255,255,0.94)";
  ctx.font = "950 34px Inter, Arial, sans-serif";
  ctx.fillText(t.strongestIndicators, 92, 818);
  ctx.fillStyle = "rgba(255,255,255,0.52)";
  ctx.font = "750 20px Inter, Arial, sans-serif";
  drawWrappedText(ctx, isAI ? t.fingerprintSubAI : t.fingerprintSubReal, 92, 850, 760, 28, 2);

  fingerprints.slice(0, 4).forEach((item, index) => {
    const x = 92 + (index % 2) * 520;
    const y = 922 + Math.floor(index / 2) * 104;
    fillRoundedRect(ctx, x, y, 480, 82, 20, "rgba(7,9,14,0.78)");
    strokeRoundedRect(ctx, x, y, 480, 82, 20, "rgba(255,255,255,0.08)", 1);
    ctx.fillStyle = "rgba(255,255,255,0.90)";
    ctx.font = "900 22px Inter, Arial, sans-serif";
    drawWrappedText(ctx, item.label, x + 18, y + 29, 260, 24, 1);
    ctx.fillStyle = item.tone === "real" ? "#83f5b6" : item.tone === "ai" ? "#ff9e7d" : "#ffffff";
    ctx.font = "900 17px Inter, Arial, sans-serif";
    ctx.fillText(item.hint, x + 312, y + 30);
    drawProgress(ctx, x + 18, y + 50, 340, item.value, item.tone);
    ctx.fillStyle = "rgba(255,255,255,0.86)";
    ctx.font = "950 19px Inter, Arial, sans-serif";
    ctx.fillText(`${item.value}%`, x + 390, y + 64);
  });

  fillRoundedRect(ctx, 56, 1184, 1088, 172, 30, "rgba(10,12,18,0.84)");
  strokeRoundedRect(ctx, 56, 1184, 1088, 172, 30, "rgba(255,255,255,0.09)", 2);
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = "950 30px Inter, Arial, sans-serif";
  ctx.fillText(t.detailedAnalysis, 92, 1242);
  const details = Object.entries(result?.metrics || {}).slice(0, 6);
  details.forEach(([key, value], index) => {
    const x = 92 + (index % 3) * 340;
    const y = 1288 + Math.floor(index / 3) * 38;
    ctx.fillStyle = "rgba(255,255,255,0.46)";
    ctx.font = "800 17px Inter, Arial, sans-serif";
    ctx.fillText(humanizeMetric(key, t), x, y);
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.font = "950 18px Inter, Arial, sans-serif";
    ctx.fillText(formatMetricValue(value), x, y + 24);
  });

  ctx.fillStyle = "rgba(255,255,255,0.34)";
  ctx.font = "800 17px Inter, Arial, sans-serif";
  ctx.fillText(`${t.reportReady} • LANDER`, 76, 1430);

  const url = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = url;
  link.download = `lander-report-${Date.now()}.png`;
  document.body.appendChild(link);
  link.click();
  link.remove();
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

export default function AnalysisResult({
  result,
  preview,
  feedbackStatus,
  isSavingFeedback,
  styles,
  t,
  onFeedbackSave,
  onReset,
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

      <div style={styles.inlineFeedback}>
        <div style={styles.inlineFeedbackText}>
          <div style={styles.inlineFeedbackTitle}>
            {feedbackStatus ? t.feedbackSavedTitle : t.feedbackTitle}
          </div>
          <div style={styles.inlineFeedbackSub}>
            {feedbackStatus ? t.feedbackSavedText : t.feedbackText}
          </div>
        </div>

        <div style={styles.inlineFeedbackActions}>
          <button
            style={{
              ...styles.inlineFeedbackBtn,
              ...styles.inlineFeedbackYes,
              ...(feedbackStatus === "correct" ? styles.inlineFeedbackBtnActive : {}),
            }}
            type="button"
            onClick={() => onFeedbackSave(true)}
            disabled={isSavingFeedback || Boolean(feedbackStatus)}
          >
            {isSavingFeedback && !feedbackStatus ? t.savingFeedback : t.yesCorrect}
          </button>
          <button
            style={{
              ...styles.inlineFeedbackBtn,
              ...styles.inlineFeedbackNo,
              ...(feedbackStatus === "mistake" ? styles.inlineFeedbackBtnActive : {}),
            }}
            type="button"
            onClick={() => onFeedbackSave(false)}
            disabled={isSavingFeedback || Boolean(feedbackStatus)}
          >
            {isSavingFeedback && !feedbackStatus ? t.savingFeedback : t.noMistake}
          </button>
        </div>
      </div>

      <div style={styles.resultActions}>
        <button
          style={styles.downloadBtn}
          type="button"
          onClick={() =>
            downloadReportPng({
              result,
              preview,
              percent,
              realPercent,
              statusLabel,
              confidenceCopy,
              fingerprints,
              stats,
              t,
              isAI,
            })
          }
        >
          {t.downloadAnalysis}
        </button>
        <button style={styles.secondaryBtn} type="button" onClick={onReset}>
          {t.checkAnotherPhoto}
        </button>
      </div>
    </section>
  );
}
