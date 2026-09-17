import { useEffect, useState } from "react";
import { fetchAnalytics } from "../services/api";

function AnalyticsPanel() {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetchAnalytics().then(setAnalytics).catch(() => setAnalytics(null));
  }, []);

  if (!analytics) {
    return null;
  }

  const minutes = Math.round((analytics.total_reading_seconds || 0) / 60);
  return (
    <section className="card analytics-panel">
      <div className="section-header">
        <div className="section-header__title">
          <span className="section-dot" />
          <h2>Your News Analytics</h2>
        </div>
      </div>
      <div className="analytics-panel__stats">
        <div><strong>{analytics.articles_read}</strong><span>Articles read</span></div>
        <div><strong>{analytics.bookmarks}</strong><span>Bookmarks</span></div>
        <div><strong>{minutes}m</strong><span>Reading time</span></div>
        <div><strong>{analytics.topics_explored}</strong><span>Topics explored</span></div>
      </div>
      {analytics.most_read_topics?.length ? (
        <div className="analytics-panel__body">
          <div>
            <h3 className="analytics-panel__subheading">Most-read topics</h3>
            <div className="analytics-panel__topics">
              {analytics.most_read_topics.map((item) => <span key={item.topic}>{item.topic} <b>{item.count}</b></span>)}
            </div>
          </div>
          {analytics.interest_breakdown?.length ? (
            <div className="analytics-panel__interests">
              <h3 className="analytics-panel__subheading">Interest profile</h3>
              {analytics.interest_breakdown.slice(0, 5).map((item) => (
                <div className="interest-bar" key={item.topic}>
                  <div><span>{item.topic}</span><b>{Math.round(item.score * 100)}%</b></div>
                  <span className="interest-bar__track"><span style={{ width: `${item.score * 100}%` }} /></span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
      {analytics.recent_activity?.length ? (
        <div className="analytics-panel__activity">
          <h3 className="analytics-panel__subheading">Recent activity</h3>
          {analytics.recent_activity.slice(0, 4).map((item, index) => (
            <div className="analytics-activity-row" key={`${item.article_id || item.action}-${index}`}>
              <span>{item.action.replaceAll("_", " ")}</span>
              <strong>{item.title || item.topic || "News activity"}</strong>
              {item.duration_seconds ? <small>{item.duration_seconds}s</small> : null}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export default AnalyticsPanel;