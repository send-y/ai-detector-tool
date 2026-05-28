export const dragDropStyles = {
  wrapper: {
    width: "100%",
    maxWidth: 670,
    margin: "0 auto",
    padding: "20px 20px 28px",
    fontFamily: "Inter, system-ui, sans-serif",
    color: "#fff",
  },

  dropzoneShell: {
    position: "relative",
    borderRadius: 34,
    padding: 1,
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.22), rgba(89,120,255,0.24), rgba(255,255,255,0.08), rgba(255,215,140,0.14))",
    boxShadow:
      "0 30px 80px rgba(0,0,0,0.48), 0 0 50px rgba(70,110,255,0.12)",
    transition: "transform 0.25s ease, box-shadow 0.25s ease",
  },

  dropzoneShellDragging: {
    transform: "scale(1.015)",
    boxShadow:
      "0 32px 90px rgba(0,0,0,0.55), 0 0 80px rgba(90,140,255,0.24)",
  },

  dropzoneGlow: {
    position: "absolute",
    inset: "8% 18%",
    borderRadius: 999,
    background:
      "radial-gradient(circle, rgba(96,140,255,0.18), rgba(96,140,255,0) 68%)",
    filter: "blur(22px)",
    pointerEvents: "none",
  },

  dropzoneGlowDragging: {
    background:
      "radial-gradient(circle, rgba(96,140,255,0.28), rgba(96,140,255,0) 68%)",
  },

  dropzone: {
    position: "relative",
    minHeight: 350,
    borderRadius: 33,
    padding: "34px 28px",
    textAlign: "center",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    border: "1px dashed rgba(255,255,255,0.16)",
    background:
      "linear-gradient(180deg, rgba(19,24,54,0.78), rgba(12,15,35,0.88))",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    transition:
      "border-color 0.25s ease, background 0.25s ease, transform 0.25s ease",
  },

  dropzoneDragging: {
    border: "1px dashed rgba(116,160,255,0.85)",
    background:
      "linear-gradient(180deg, rgba(23,31,72,0.9), rgba(14,18,46,0.94))",
  },

  previewWrap: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  preview: {
    maxWidth: "100%",
    maxHeight: 420,
    objectFit: "contain",
    borderRadius: 22,
    boxShadow:
      "0 22px 50px rgba(0,0,0,0.38), 0 0 0 1px rgba(255,255,255,0.08)",
  },

  placeholder: {
    position: "relative",
    zIndex: 2,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#e8ecff",
  },

  iconOrb: {
    width: 88,
    height: 88,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    background:
      "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.28), rgba(88,108,255,0.18) 45%, rgba(255,255,255,0.06) 100%)",
    border: "1px solid rgba(255,255,255,0.16)",
    boxShadow:
      "0 12px 30px rgba(0,0,0,0.28), 0 0 28px rgba(90,120,255,0.18)",
  },

  iconEmoji: {
    fontSize: 34,
    lineHeight: 1,
  },

  dropTitle: {
    margin: 0,
    fontSize: 24,
    fontWeight: 700,
    letterSpacing: "-0.02em",
    color: "rgba(255,255,255,0.96)",
  },

  dropSub: {
    marginTop: 10,
    marginBottom: 18,
    color: "rgba(255,255,255,0.58)",
    fontSize: 14,
    fontWeight: 500,
  },

  badgesRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
    justifyContent: "center",
  },

  fileBadge: {
    padding: "8px 12px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "rgba(255,255,255,0.82)",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.08em",
  },

  loadingCard: {
    marginTop: 18,
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 16px",
    borderRadius: 14,
    background: "rgba(20,25,52,0.7)",
    border: "1px solid rgba(97,141,255,0.18)",
    color: "#9fc0ff",
    boxShadow: "0 12px 30px rgba(0,0,0,0.22)",
  },

  loadingDot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: "#79aaff",
    boxShadow: "0 0 18px rgba(121,170,255,0.7)",
  },

  error: {
    marginTop: 18,
    textAlign: "center",
    padding: "14px 16px",
    borderRadius: 14,
    background: "rgba(80,18,24,0.72)",
    border: "1px solid rgba(255,107,107,0.2)",
    color: "#ff9a9a",
  },

  result: {
    marginTop: 24,
    display: "grid",
    gap: 18,
  },

  verdict: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    borderRadius: 24,
    padding: 20,
    border: "1px solid",
    boxShadow: "0 18px 40px rgba(0,0,0,0.28)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
  },

  verdictAI: {
    background:
      "linear-gradient(180deg, rgba(58,20,28,0.82), rgba(31,13,19,0.86))",
    borderColor: "rgba(255,100,100,0.22)",
  },

  verdictReal: {
    background:
      "linear-gradient(180deg, rgba(17,54,36,0.82), rgba(10,32,23,0.86))",
    borderColor: "rgba(80,220,140,0.22)",
  },

  verdictIconWrap: {
    width: 72,
    height: 72,
    flexShrink: 0,
    borderRadius: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.1)",
  },

  verdictIcon: {
    fontSize: 34,
    lineHeight: 1,
  },

  verdictTextBlock: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },

  verdictTitle: {
    fontSize: 24,
    fontWeight: 800,
    letterSpacing: "-0.02em",
  },

  verdictSub: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 14,
  },

  barCard: {
    padding: 16,
    borderRadius: 20,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 14px 34px rgba(0,0,0,0.2)",
  },

  barLabels: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    fontWeight: 700,
    fontSize: 14,
  },

  realText: {
    color: "#7dffb3",
  },

  aiText: {
    color: "#ff7a7a",
  },

  barTrack: {
    width: "100%",
    height: 14,
    borderRadius: 999,
    background: "rgba(255,255,255,0.08)",
    overflow: "hidden",
    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.28)",
  },

  barFill: {
    height: "100%",
    borderRadius: 999,
    transition: "width 0.35s ease",
    boxShadow: "0 0 20px rgba(255,255,255,0.18)",
  },

  details: {
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.03))",
    borderRadius: 20,
    padding: 14,
    border: "1px solid rgba(255,255,255,0.08)",
  },

  summary: {
    cursor: "pointer",
    color: "#f0f3ff",
    fontWeight: 700,
    fontSize: 15,
    listStyle: "none",
  },

  table: {
    width: "100%",
    marginTop: 14,
    borderCollapse: "collapse",
  },

  tdKey: {
    padding: "10px 10px 10px 0",
    color: "rgba(255,255,255,0.58)",
    verticalAlign: "top",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },

  tdVal: {
    padding: "10px 0",
    color: "#fff",
    textAlign: "right",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    fontWeight: 600,
  },

  resetBtn: {
    width: "100%",
    marginTop: 2,
    padding: "15px 18px",
    border: "1px solid rgba(120,160,255,0.16)",
    borderRadius: 16,
    background: "linear-gradient(135deg, #6ca1ff, #517cff)",
    color: "#fff",
    fontWeight: 800,
    fontSize: 15,
    cursor: "pointer",
    boxShadow: "0 18px 34px rgba(81,124,255,0.28)",
  },

  resultPanel: {
    marginTop: 22,
    display: "grid",
    gap: 12,
  },

  reportHero: {
    display: "flex",
    flexWrap: "wrap",
    gap: 14,
    padding: 14,
    borderRadius: 22,
    background:
      "linear-gradient(180deg, rgba(14, 17, 24, 0.88), rgba(8, 10, 14, 0.94))",
    border: "1px solid rgba(255,255,255,0.09)",
    boxShadow:
      "0 22px 54px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.05)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
  },

  reportMedia: {
    flex: "1 1 190px",
    minWidth: 170,
    display: "grid",
    gap: 10,
  },

  reportMediaFrame: {
    position: "relative",
    aspectRatio: "4 / 5",
    minHeight: 210,
    maxHeight: 310,
    borderRadius: 18,
    overflow: "hidden",
    background:
      "linear-gradient(180deg, rgba(24, 31, 68, 0.92), rgba(12, 15, 32, 0.96))",
    border: "1px solid rgba(120, 152, 255, 0.18)",
    boxShadow:
      "0 18px 40px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.06)",
  },

  reportImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },

  reportImageFallback: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "rgba(255,255,255,0.68)",
    fontSize: 13,
    fontWeight: 900,
    letterSpacing: "0.14em",
  },

  reportScanLine: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "58%",
    height: 2,
    background:
      "linear-gradient(90deg, transparent, rgba(105, 151, 255, 0.92), transparent)",
    boxShadow: "0 0 18px rgba(105,151,255,0.62)",
    opacity: 0.86,
  },

  reportMediaCaption: {
    color: "rgba(255,255,255,0.54)",
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    textAlign: "center",
  },

  reportContent: {
    flex: "2 1 300px",
    minWidth: 0,
    display: "grid",
    alignContent: "space-between",
    gap: 16,
  },

  reportTopline: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    flexWrap: "wrap",
  },

  reportPill: {
    display: "inline-flex",
    alignItems: "center",
    minHeight: 28,
    padding: "7px 11px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: 0,
    color: "#fff",
  },

  reportPillAI: {
    background: "rgba(255, 91, 118, 0.18)",
    border: "1px solid rgba(255, 112, 128, 0.3)",
    color: "#ff9e7d",
  },

  reportPillReal: {
    background: "rgba(72, 220, 142, 0.16)",
    border: "1px solid rgba(112, 238, 166, 0.26)",
    color: "#82f3b3",
  },

  reportReady: {
    color: "rgba(255,255,255,0.48)",
    fontSize: 11,
    fontWeight: 800,
  },

  reportTitleRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },

  reportTitle: {
    margin: 0,
    color: "rgba(255,255,255,0.96)",
    fontSize: 27,
    lineHeight: 1.05,
    fontWeight: 950,
    letterSpacing: 0,
  },

  reportText: {
    margin: "8px 0 0",
    maxWidth: 410,
    color: "rgba(255,255,255,0.63)",
    fontSize: 13,
    lineHeight: 1.45,
    fontWeight: 650,
  },

  scoreRing: {
    width: 106,
    height: 106,
    flex: "0 0 106px",
    borderRadius: "50%",
    padding: 8,
    boxShadow: "0 16px 34px rgba(0,0,0,0.28)",
  },

  scoreRingInner: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(180deg, rgba(15,17,24,0.98), rgba(7,8,12,0.98))",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
  },

  scoreRingValue: {
    fontSize: 20,
    lineHeight: 1,
    fontWeight: 950,
    letterSpacing: 0,
  },

  scoreRingLabel: {
    marginTop: 5,
    color: "rgba(255,255,255,0.52)",
    fontSize: 10,
    fontWeight: 900,
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(116px, 1fr))",
    gap: 8,
  },

  summaryStat: {
    minWidth: 0,
    padding: "11px 12px",
    borderRadius: 14,
    background: "rgba(255,255,255,0.045)",
    border: "1px solid rgba(255,255,255,0.07)",
  },

  summaryLabel: {
    display: "block",
    color: "rgba(255,255,255,0.48)",
    fontSize: 10,
    fontWeight: 850,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  summaryValue: {
    display: "block",
    marginTop: 5,
    color: "rgba(255,255,255,0.88)",
    fontSize: 15,
    lineHeight: 1,
    fontWeight: 950,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  summaryValueAI: {
    color: "#ff9d74",
  },

  summaryValueReal: {
    color: "#83f5b6",
  },

  resultHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    padding: "16px 18px",
    borderRadius: 18,
    background:
      "linear-gradient(180deg, rgba(52, 28, 34, 0.86), rgba(31, 17, 23, 0.9))",
    border: "1px solid rgba(255, 116, 92, 0.26)",
    boxShadow:
      "0 18px 40px rgba(0,0,0,0.26), inset 0 1px 0 rgba(255,255,255,0.06)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
  },

  resultIdentity: {
    minWidth: 0,
    display: "flex",
    alignItems: "center",
    gap: 14,
  },

  resultIcon: {
    width: 54,
    height: 54,
    flexShrink: 0,
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    fontWeight: 900,
    letterSpacing: 0,
    color: "#fff",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
  },

  resultIconAI: {
    background: "linear-gradient(135deg, rgba(255, 86, 118, 0.28), rgba(90, 104, 255, 0.22))",
    border: "1px solid rgba(255, 139, 114, 0.22)",
  },

  resultIconReal: {
    background: "linear-gradient(135deg, rgba(55, 217, 139, 0.26), rgba(82, 140, 255, 0.18))",
    border: "1px solid rgba(111, 238, 167, 0.22)",
  },

  resultStatus: {
    fontSize: 22,
    lineHeight: 1.05,
    fontWeight: 900,
    letterSpacing: 0,
  },

  resultDescription: {
    marginTop: 5,
    maxWidth: 390,
    color: "rgba(255,255,255,0.68)",
    fontSize: 12,
    lineHeight: 1.4,
    fontWeight: 600,
  },

  resultScore: {
    flexShrink: 0,
    minWidth: 74,
    textAlign: "right",
    fontSize: 18,
    lineHeight: 1,
    fontWeight: 900,
    letterSpacing: 0,
  },

  confidenceCard: {
    padding: "14px 16px 12px",
    borderRadius: 17,
    background: "rgba(10, 12, 16, 0.72)",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 14px 32px rgba(0,0,0,0.24)",
  },

  confidenceTopline: {
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
    fontSize: 12,
    fontWeight: 800,
  },

  confidenceTitle: {
    minWidth: 0,
    color: "rgba(255,255,255,0.72)",
    textAlign: "center",
    fontSize: 11,
    fontWeight: 800,
  },

  confidenceRail: {
    position: "relative",
    height: 12,
    borderRadius: 999,
    background: "rgba(255,255,255,0.08)",
    overflow: "visible",
    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.36)",
  },

  confidenceGradient: {
    position: "absolute",
    inset: 0,
    borderRadius: 999,
    background:
      "linear-gradient(90deg, #51e08c 0%, #e7dc63 48%, #ff9c48 68%, #ff4f76 100%)",
    boxShadow: "0 0 18px rgba(255, 111, 118, 0.18)",
  },

  confidenceMarker: {
    position: "absolute",
    top: "50%",
    width: 16,
    height: 16,
    borderRadius: "50%",
    transform: "translate(-50%, -50%)",
    background: "#fff",
    border: "3px solid #ff6a7a",
    boxShadow: "0 0 0 4px rgba(255, 90, 118, 0.18), 0 8px 18px rgba(0,0,0,0.34)",
  },

  confidenceTicks: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 8,
    color: "rgba(255,255,255,0.38)",
    fontSize: 10,
    fontWeight: 700,
  },

  signalGrid: {
    display: "grid",
    gap: 8,
    padding: 12,
    borderRadius: 17,
    background: "rgba(255,255,255,0.035)",
    border: "1px solid rgba(255,255,255,0.08)",
  },

  signalRow: {
    display: "grid",
    gridTemplateColumns: "minmax(96px, 1fr) minmax(76px, 1fr) 46px",
    alignItems: "center",
    gap: 8,
    minHeight: 28,
  },

  signalText: {
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },

  signalLabel: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 12,
    fontWeight: 800,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  signalHint: {
    color: "rgba(255,255,255,0.38)",
    fontSize: 10,
    fontWeight: 700,
  },

  signalMeter: {
    height: 7,
    borderRadius: 999,
    background: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },

  signalFill: {
    height: "100%",
    minWidth: 4,
    borderRadius: 999,
    transition: "width 0.35s ease",
  },

  signalFillAI: {
    background: "linear-gradient(90deg, #ff8a50, #ff4e7c)",
    boxShadow: "0 0 14px rgba(255, 78, 124, 0.25)",
  },

  signalFillReal: {
    background: "linear-gradient(90deg, #42d988, #83f5b6)",
    boxShadow: "0 0 14px rgba(84, 226, 148, 0.2)",
  },

  signalFillNeutral: {
    background: "linear-gradient(90deg, #75a7ff, #ffd777)",
  },

  signalValue: {
    textAlign: "right",
    color: "rgba(255,255,255,0.84)",
    fontSize: 12,
    fontWeight: 900,
  },

  fingerprintSection: {
    display: "grid",
    gap: 10,
    padding: 14,
    borderRadius: 20,
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.026))",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 16px 36px rgba(0,0,0,0.22)",
  },

  fingerprintHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },

  fingerprintTitle: {
    color: "rgba(255,255,255,0.94)",
    fontSize: 15,
    lineHeight: 1.15,
    fontWeight: 950,
  },

  fingerprintSub: {
    marginTop: 4,
    color: "rgba(255,255,255,0.48)",
    fontSize: 11,
    lineHeight: 1.4,
    fontWeight: 700,
  },

  fingerprintGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 10,
  },

  fingerprintCard: {
    minWidth: 0,
    display: "grid",
    gap: 10,
    padding: 13,
    borderRadius: 16,
    background: "rgba(8, 10, 13, 0.76)",
    border: "1px solid rgba(255,255,255,0.075)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.035)",
  },

  fingerprintCardTop: {
    minWidth: 0,
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },

  fingerprintName: {
    minWidth: 0,
    color: "rgba(255,255,255,0.88)",
    fontSize: 12,
    lineHeight: 1.2,
    fontWeight: 950,
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  fingerprintBadge: {
    flexShrink: 0,
    maxWidth: 94,
    padding: "5px 7px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.055)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "rgba(255,255,255,0.58)",
    fontSize: 9,
    lineHeight: 1.1,
    fontWeight: 900,
    textAlign: "center",
  },

  fingerprintBadgeAI: {
    background: "rgba(255, 91, 118, 0.12)",
    borderColor: "rgba(255, 91, 118, 0.24)",
    color: "#ff9e7d",
  },

  fingerprintBadgeReal: {
    background: "rgba(72, 220, 142, 0.12)",
    borderColor: "rgba(72, 220, 142, 0.22)",
    color: "#83f5b6",
  },

  fingerprintMeter: {
    height: 8,
    borderRadius: 999,
    background: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },

  fingerprintFill: {
    height: "100%",
    minWidth: 5,
    borderRadius: 999,
    transition: "width 0.35s ease",
  },

  fingerprintMeta: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    color: "rgba(255,255,255,0.45)",
    fontSize: 10,
    fontWeight: 850,
  },

  fingerprintRaw: {
    color: "rgba(255,255,255,0.42)",
    fontSize: 10,
    fontWeight: 750,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  detailCard: {
    borderRadius: 17,
    overflow: "hidden",
    background: "rgba(8, 10, 13, 0.72)",
    border: "1px solid rgba(255,255,255,0.08)",
  },

  detailTitle: {
    padding: "13px 15px",
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
    fontWeight: 900,
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },

  detailBody: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 1,
    background: "rgba(255,255,255,0.04)",
  },

  detailMetric: {
    minWidth: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    padding: "10px 12px",
    background: "rgba(8, 10, 13, 0.88)",
    color: "rgba(255,255,255,0.54)",
    fontSize: 11,
    fontWeight: 700,
  },

  detailMetricText: {
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  detailMetricValue: {
    flexShrink: 0,
    color: "rgba(255,255,255,0.86)",
    fontWeight: 900,
  },

  detailNote: {
    gridColumn: "1 / -1",
    padding: 12,
    background: "rgba(8, 10, 13, 0.88)",
    color: "rgba(255,255,255,0.58)",
    fontSize: 12,
    fontWeight: 700,
  },

  inlineFeedback: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
    padding: 14,
    borderRadius: 18,
    background:
      "linear-gradient(180deg, rgba(18, 21, 30, 0.84), rgba(9, 11, 16, 0.9))",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 14px 32px rgba(0,0,0,0.22)",
  },

  inlineFeedbackText: {
    minWidth: 210,
    flex: "1 1 230px",
  },

  inlineFeedbackTitle: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 14,
    lineHeight: 1.2,
    fontWeight: 950,
  },

  inlineFeedbackSub: {
    marginTop: 4,
    color: "rgba(255,255,255,0.52)",
    fontSize: 11,
    lineHeight: 1.4,
    fontWeight: 700,
  },

  inlineFeedbackActions: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8,
    flex: "1 1 230px",
  },

  inlineFeedbackBtn: {
    minHeight: 42,
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 14,
    padding: "11px 12px",
    color: "#fff",
    fontSize: 12,
    fontWeight: 950,
    cursor: "pointer",
    boxShadow: "0 12px 24px rgba(0,0,0,0.18)",
  },

  inlineFeedbackYes: {
    background: "linear-gradient(135deg, rgba(38, 184, 108, 0.92), rgba(24, 145, 79, 0.92))",
  },

  inlineFeedbackNo: {
    background: "linear-gradient(135deg, rgba(207, 71, 83, 0.94), rgba(157, 48, 61, 0.94))",
  },

  inlineFeedbackBtnActive: {
    outline: "2px solid rgba(255,255,255,0.46)",
    outlineOffset: 2,
    filter: "saturate(1.12)",
  },

  resultActions: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
  },

  downloadBtn: {
    width: "100%",
    padding: "14px 16px",
    border: "1px solid rgba(120,160,255,0.16)",
    borderRadius: 15,
    background: "linear-gradient(135deg, #6ca1ff, #517cff)",
    color: "#fff",
    fontWeight: 900,
    fontSize: 13,
    cursor: "pointer",
    boxShadow: "0 16px 30px rgba(81,124,255,0.24)",
  },

  secondaryBtn: {
    width: "100%",
    padding: "14px 16px",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 15,
    background: "rgba(255,255,255,0.045)",
    color: "rgba(255,255,255,0.86)",
    fontWeight: 900,
    fontSize: 13,
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
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
  },

  modal: {
    width: "100%",
    maxWidth: 400,
    background:
      "linear-gradient(180deg, rgba(18,20,30,0.94), rgba(15,16,24,0.96))",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 26,
    padding: "28px 20px 20px",
    position: "relative",
    boxShadow: "0 30px 80px rgba(0,0,0,0.48)",
    overflow: "hidden",
  },

  modalGlow: {
    position: "absolute",
    inset: "auto -10% 55% -10%",
    height: 180,
    background:
      "radial-gradient(circle, rgba(92,126,255,0.16), rgba(92,126,255,0) 68%)",
    pointerEvents: "none",
  },

  modalClose: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    cursor: "pointer",
  },

  modalTitle: {
    position: "relative",
    zIndex: 1,
    fontSize: 24,
    fontWeight: 800,
    marginBottom: 10,
    letterSpacing: "-0.02em",
  },

  modalText: {
    position: "relative",
    zIndex: 1,
    color: "rgba(255,255,255,0.68)",
    fontSize: 14,
    marginBottom: 18,
    lineHeight: 1.5,
  },

  feedbackActions: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },

  feedbackBtn: {
    border: "none",
    borderRadius: 14,
    padding: "14px 12px",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 14px 26px rgba(0,0,0,0.2)",
  },

  feedbackYes: {
    background: "linear-gradient(135deg, #22b86b, #179954)",
  },

  feedbackNo: {
    background: "linear-gradient(135deg, #d44a4a, #b93131)",
  },
};
