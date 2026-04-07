import { useEffect, useState } from "react";
import { formatDate } from "../utils/formatDate";

function RecommendationSkeleton() {
  return (
    <div className="recommendation-card recommendation-card--skeleton">
      <div className="skeleton recommendation-card__thumb" />
      <div className="recommendation-card__content">
        <div className="skeleton skeleton-text skeleton-text--sm" />
        <div className="skeleton skeleton-text skeleton-text--lg" />
        <div className="skeleton skeleton-text skeleton-text--md" />
        <div className="skeleton skeleton-text skeleton-text--sm" />
      </div>
    </div>
  );
}

function Recommendations({ recommendations, loading, clickHistory, onArticleOpen }) {
  const recentHistory = clickHistory.slice(0, 3);
  const [activeBecauseOf, setActiveBecauseOf] = useState("");

  useEffect(() => {
    setActiveBecauseOf(recentHistory[0]?.title || "");
  }, [clickHistory]);

  const filteredRecommendations = activeBecauseOf
    ? recommendations.filter((article) => article.because_of === activeBecauseOf)
    : recommendations;

  return (
    <section className="sidebar-card recommendations-panel">
      <div className="sidebar-card__header">
        <div>
          <h2>Recommended for you</h2>
          <p>based on your reading</p>
        </div>
      </div>

      {recentHistory.length ? (
        <div className="because-row">
          <span className="because-row__label">Because you read:</span>
          <div className="because-row__chips">
            {recentHistory.map((item, index) => (
              <button
                key={`${item.url}-${index}`}
                type="button"
                className={`because-chip ${activeBecauseOf === item.title ? "because-chip--active" : ""}`}
                onClick={() => setActiveBecauseOf(item.title)}
              >
                {item.title}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {loading ? (
        <div className="recommendations-grid">
          {Array.from({ length: 3 }).map((_, index) => (
            <RecommendationSkeleton key={index} />
          ))}
        </div>
      ) : filteredRecommendations.length ? (
        <div className="recommendations-grid">
          {filteredRecommendations.map((article) => (
            <button
              key={`${article.url}-${article.because_of}`}
              type="button"
              className="recommendation-card"
              onClick={() => onArticleOpen(article)}
            >
              {article.image ? (
                <img
                  src={article.image}
                  alt={article.title}
                  className="recommendation-card__thumb"
                />
              ) : (
                <div className="recommendation-card__thumb recommendation-card__placeholder">
                  🗞
                </div>
              )}

              <div className="recommendation-card__content">
                <div className="recommendation-card__meta">
                  <span className="source-pill">{article.source}</span>
                  <span className="match-badge">{article.matchScore}% match</span>
                </div>
                <h3>{article.title}</h3>
                <p className="recommendation-card__time">{formatDate(article.publishedAt)}</p>
                <div className="because-box">Because you read: {article.because_of}</div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="recommendations-empty">
          <div className="recommendations-empty__icon">✨</div>
          <p>Click any article to get personalized recommendations</p>
        </div>
      )}
    </section>
  );
}

export default Recommendations;
