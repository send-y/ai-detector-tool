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