import { useEffect, useState } from "react";
import { fetchBriefing } from "../services/api";

function DailyBriefing() {
  const [briefing, setBriefing] = useState(null);

  useEffect(() => {
    fetchBriefing().then(setBriefing).catch(() => setBriefing(null));
  }, []);

  if (!briefing?.articles?.length) {
    return null;
  }

  return (
    <section className="briefing-panel stacked-sections">
      <div className="section-header">
        <div className="section-header__title">
          <span className="section-dot" />
          <h2>Daily Briefing</h2>
        </div>
        <span className="briefing-panel__estimate">{briefing.estimated_reading_minutes} min read</span>
      </div>
      <div className="briefing-panel__grid">
        {briefing.articles.map((article, index) => (
          <a className="briefing-story" href={article.url} target="_blank" rel="noreferrer" key={article.url || index}>
            <span className="briefing-story__number">0{index + 1}</span>
            <span>
              <small>{article.category || article.topic || article.source} · {article.briefing_reason || "Selected for you"}</small>
              <strong>{article.title}</strong>
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

export default DailyBriefing;