function TopicSelector({ topic, onTopicChange }) {
  return (
    <div className="topic-selector">
      <label htmlFor="topic-select" className="topic-selector__label">
        Choose a topic
      </label>
      <select
        id="topic-select"
        className="topic-selector__select"
        value={topic}
        onChange={(event) => onTopicChange(event.target.value)}
      >
        <option value="ai">AI</option>
        <option value="sports">Sports</option>
        <option value="business">Business</option>
        <option value="technology">Technology</option>
      </select>
    </div>
  );
}

export default TopicSelector;
