function TrendingBar({ trending }) {
  return (
    <section className="sidebar-card">
      <div className="sidebar-card__header">
        <h2>Trending now</h2>
      </div>

      <div className="trending-list">
        {trending.length ? (
          trending.slice(0, 5).map((item, index) => (
            <article key={item.topic} className="trending-item">
              <span className="trending-item__rank">{index + 1}</span>
              <div className="trending-item__content">
                <span className="topic-pill">{item.topic}</span>
                <h3>{`${item.topic.charAt(0).toUpperCase() + item.topic.slice(1)} is trending`}</h3>
                <p>{`${(item.count / 1000).toFixed(item.count >= 1000 ? 1 : 0)}k reading`}</p>
              </div>
            </article>
          ))
        ) : (
          <p className="sidebar-card__empty">Trending topics will appear after article clicks.</p>
        )}
      </div>
    </section>
  );
}

export default TrendingBar;
