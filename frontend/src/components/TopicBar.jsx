function TopicBar({
  topics,
  activeTopic,
  onTopicChange,
  sortBy,
  onSortChange,
}) {
  return (
    <section className="topic-bar">
      <div className="topic-bar__tabs" role="tablist" aria-label="News topics">
        {topics.map((topic) => {
          const value = topic.toLowerCase();
          const isActive = value === activeTopic;

          return (
            <button
              key={topic}
              type="button"
              className={`topic-tab ${isActive ? "topic-tab--active" : ""}`}
              onClick={() => onTopicChange(value)}
            >
              {topic}
            </button>
          );
        })}
      </div>

      <label className="topic-bar__sort">
        <span>Sort</span>
        <select value={sortBy} onChange={(event) => onSortChange(event.target.value)}>
          <option value="latest">Latest</option>
          <option value="relevance">Relevance</option>
        </select>
      </label>
    </section>
  );
}

export default TopicBar;
