export const AdminPanelstyles = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.82)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    zIndex: 10000,
    padding: 20,
    overflowY: "auto",
  },

  panel: {
    position: "relative",
    width: "100%",
    maxWidth: 1320,
    margin: "0 auto",
    padding: 24,
    borderRadius: 30,
    background:
      "linear-gradient(180deg, rgba(20,22,30,0.96), rgba(11,13,18,0.98))",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#fff",
    boxShadow:
      "0 30px 100px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.05)",
    overflow: "hidden",
  },

  panelGlowOne: {
    position: "absolute",
    top: -100,
    right: -80,
    width: 320,
    height: 320,
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(97,137,255,0.16), rgba(97,137,255,0) 70%)",
    filter: "blur(30px)",
    pointerEvents: "none",
  },

  panelGlowTwo: {
    position: "absolute",
    bottom: -120,
    left: -80,
    width: 300,
    height: 300,
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(255,214,120,0.08), rgba(255,214,120,0) 70%)",
    filter: "blur(30px)",
    pointerEvents: "none",
  },

  closeIconBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 42,
    height: 42,
    borderRadius: "50%",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.05)",
    color: "#fff",
    cursor: "pointer",
    fontSize: 16,
    zIndex: 2,
  },

  header: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 20,
    marginBottom: 22,
    flexWrap: "wrap",
  },

  headerLeft: {
    maxWidth: 720,
  },

  eyebrow: {
    display: "inline-flex",
    alignItems: "center",
    padding: "8px 12px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginBottom: 14,
  },

  title: {
    fontSize: 34,
    fontWeight: 900,
    lineHeight: 1,
    letterSpacing: "-0.03em",
  },

  subtitle: {
    marginTop: 10,
    color: "rgba(255,255,255,0.58)",
    fontSize: 15,
    lineHeight: 1.5,
  },

  cloudinaryLink: {
    display: "inline-block",
    marginTop: 14,
    color: "#9bc4ff",
    textDecoration: "none",
    fontWeight: 700,
    fontSize: 14,
  },

  statsWrap: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(120px, 1fr))",
    gap: 12,
    flex: "1 1 420px",
    maxWidth: 560,
  },

  statCard: {
    padding: 16,
    borderRadius: 20,
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
    border: "1px solid rgba(255,255,255,0.08)",
  },

  statLabel: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    fontWeight: 600,
    marginBottom: 8,
  },

  statValue: {
    fontSize: 26,
    fontWeight: 900,
    letterSpacing: "-0.03em",
  },

  toolbar: {
    position: "relative",
    zIndex: 1,
    display: "grid",
    gridTemplateColumns: "1.4fr 0.8fr auto auto",
    gap: 12,
    marginBottom: 22,
  },

  input: {
    height: 48,
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.08)",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.03))",
    color: "#fff",
    padding: "0 14px",
    outline: "none",
    fontSize: 14,
  },

  select: {
    height: 48,
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.08)",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.03))",
    color: "#fff",
    padding: "0 14px",
    outline: "none",
    fontSize: 14,
  },

  secondaryBtn: {
    height: 48,
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 16,
    padding: "0 18px",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 800,
  },

  primaryBtn: {
    height: 48,
    border: "1px solid rgba(113,152,255,0.2)",
    borderRadius: 16,
    padding: "0 18px",
    background: "linear-gradient(135deg, #6ca1ff, #4f7cff)",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 800,
    boxShadow: "0 16px 30px rgba(79,124,255,0.28)",
  },

  info: {
    padding: 18,
    borderRadius: 18,
    background: "rgba(255,255,255,0.04)",
    color: "rgba(255,255,255,0.75)",
    marginBottom: 16,
  },

  error: {
    padding: 18,
    borderRadius: 18,
    background: "rgba(180,40,40,0.18)",
    color: "#ff8f8f",
    marginBottom: 16,
  },

  empty: {
    minHeight: 280,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    borderRadius: 24,
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.025))",
    border: "1px solid rgba(255,255,255,0.08)",
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: 800,
    marginBottom: 8,
  },

  emptyText: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 14,
  },

  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 800,
  },

  sectionMeta: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 13,
    fontWeight: 600,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
    gap: 18,
  },

  card: {
    position: "relative",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.03))",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 24,
    overflow: "hidden",
    boxShadow: "0 18px 36px rgba(0,0,0,0.22)",
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    padding: 16,
    paddingBottom: 12,
  },

  userBox: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    minWidth: 0,
  },

  avatar: {
    width: 46,
    height: 46,
    borderRadius: "50%",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.98), rgba(228,228,228,0.92))",
    color: "#111",
    fontWeight: 900,
    boxShadow:
      "0 10px 22px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.85)",
  },

  userInfo: {
    minWidth: 0,
  },

  userEmail: {
    fontSize: 14,
    fontWeight: 800,
    color: "rgba(255,255,255,0.96)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: 220,
  },

  userId: {
    marginTop: 4,
    fontSize: 12,
    color: "rgba(255,255,255,0.45)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: 220,
  },

  badge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 110,
    padding: "9px 12px",
    borderRadius: 999,
    fontWeight: 800,
    fontSize: 13,
    border: "1px solid transparent",
    flexShrink: 0,
  },

  badgeAi: {
    background: "rgba(231,76,60,0.14)",
    color: "#ffb4b4",
    borderColor: "rgba(231,76,60,0.34)",
  },

  badgeReal: {
    background: "rgba(46,204,113,0.14)",
    color: "#b8ffd0",
    borderColor: "rgba(46,204,113,0.34)",
  },

  imageWrap: {
    position: "relative",
    width: "100%",
    height: 240,
    background: "#0b0c0f",
    overflow: "hidden",
  },

  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },

  imagePlaceholder: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "rgba(255,255,255,0.4)",
  },

  imageOverlay: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "10px 12px",
    borderRadius: 16,
    background: "rgba(10,12,18,0.62)",
    border: "1px solid rgba(255,255,255,0.08)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
  },

  percentBig: {
    fontSize: 20,
    fontWeight: 900,
    letterSpacing: "-0.02em",
  },

  dateSmall: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    textAlign: "right",
  },

  metaGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    padding: 16,
  },

  metaCard: {
    padding: 12,
    borderRadius: 16,
    background: "rgba(255,255,255,0.035)",
    border: "1px solid rgba(255,255,255,0.06)",
  },

  metaLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: "rgba(255,255,255,0.42)",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: 8,
  },

  metaValue: {
    fontSize: 14,
    fontWeight: 700,
    color: "rgba(255,255,255,0.94)",
    wordBreak: "break-word",
  },

  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    padding: 16,
    paddingTop: 0,
    flexWrap: "wrap",
  },

  idText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 12,
    wordBreak: "break-all",
    flex: "1 1 220px",
  },

  cardActions: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },

  actionLink: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 38,
    padding: "0 14px",
    borderRadius: 12,
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#fff",
    textDecoration: "none",
    fontWeight: 700,
    fontSize: 13,
  },

  actionLinkDisabled: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 38,
    padding: "0 14px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.4)",
    fontWeight: 700,
    fontSize: 13,
  },

  cloudTag: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 38,
    padding: "0 12px",
    borderRadius: 12,
    background: "rgba(97,137,255,0.12)",
    border: "1px solid rgba(97,137,255,0.2)",
    color: "#a9c7ff",
    fontWeight: 700,
    fontSize: 12,
  },

	
};