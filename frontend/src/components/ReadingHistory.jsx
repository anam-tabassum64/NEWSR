function ReadingHistory({ history, onOpenArticle }) {
  if (!history.length) {
    return null;
  }

  return (
    <section className="history-bar">
      <span className="history-bar__label">Recently read:</span>
      <div className="history-bar__chips">
        {history.map((item) => (
          <button
            key={`${item.url}-${item.topic}`}
            type="button"
            className="history-chip"
            onClick={() => onOpenArticle(item)}
            title={item.title}
          >
            {item.title.length > 20 ? `${item.title.slice(0, 20)}...` : item.title}
          </button>
        ))}
      </div>
    </section>
  );
}

export default ReadingHistory;
