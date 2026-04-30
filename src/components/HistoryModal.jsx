export default function HistoryModal({ analysisHistory, onClose, t }) {
  return (
    <div className="analysis-modal-backdrop" onClick={onClose}>
      <div
        className="analysis-modal analysis-modal--history"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="analysis-modal__close" type="button" onClick={onClose}>
          ✕
        </button>

        <div className="analysis-modal__header">
          <div>
            <h3 className="analysis-modal__title">{t.historyModalTitle}</h3>
            <div className="analysis-modal__subtext">{t.historyModalSub}</div>
          </div>

          <div className="analysis-modal__count">
            {t.photosCount(analysisHistory.length)}
          </div>
        </div>

        <div className="analysis-history-list">
          {analysisHistory.map((item) => (
            <article className="analysis-history-card" key={item.id}>
              <div className="analysis-history-card__media">
                <img
                  src={item.imageUrl || item.thumbUrl}
                  alt="analysis preview"
                  className="analysis-history-card__image"
                />

                <div className="analysis-history-card__overlay">
                  <div
                    className={`analysis-history-card__badge ${
                      item.label === "ai" ? "is-ai" : "is-real"
                    }`}
                  >
                    {item.label === "ai" ? t.ai : t.real}
                  </div>

                  <div className="analysis-history-card__percent">{item.percent}%</div>
                </div>
              </div>

              <div className="analysis-history-card__body">
                <div className="analysis-history-card__top">
                  <div className="analysis-history-card__title">
                    {item.label === "ai" ? t.aiGeneratedImage : t.realPhoto}
                  </div>

                  <div className="analysis-history-card__meta">
                    {item.createdAt ? new Date(item.createdAt).toLocaleString() : "—"}
                  </div>
                </div>

                <div className="analysis-history-card__stats">
                  <div className="analysis-history-stat">
                    <span className="analysis-history-stat__label">{t.result}</span>
                    <span
                      className={`analysis-history-stat__value ${
                        item.label === "ai" ? "is-ai" : "is-real"
                      }`}
                    >
                      {item.label === "ai" ? t.ai : t.real}
                    </span>
                  </div>

                  <div className="analysis-history-stat">
                    <span className="analysis-history-stat__label">{t.probability}</span>
                    <span className="analysis-history-stat__value">{item.percent}%</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
