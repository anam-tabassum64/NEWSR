function BookmarkDrawer({ bookmarks, isOpen, onClose, onRemove, onOpenArticle }) {
  return (
    <>
      <button
        type="button"
        className={`drawer-overlay ${isOpen ? "drawer-overlay--visible" : ""}`}
        onClick={onClose}
        aria-label="Close saved articles"
      />
      <aside className={`bookmark-drawer ${isOpen ? "bookmark-drawer--open" : ""}`}>
        <div className="bookmark-drawer__header">
          <div>
            <h2>Saved articles ({bookmarks.length})</h2>
            <p>Quick access to stories you wanted to keep.</p>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close">
            x
          </button>
        </div>

        <div className="bookmark-drawer__body">
          {bookmarks.length ? (
            bookmarks.map((article) => (
              <div key={article.url} className="bookmark-item">
                <button
                  type="button"
                  className="bookmark-item__title"
                  onClick={() => onOpenArticle(article)}
                >
                  {article.title}
                </button>
                <div className="bookmark-item__meta">
                  <span>{article.source}</span>
                  <button type="button" onClick={() => onRemove(article)}>
                    Remove
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="bookmark-drawer__empty">No saved articles yet.</p>
          )}
        </div>
      </aside>
    </>
  );
}

export default BookmarkDrawer;
