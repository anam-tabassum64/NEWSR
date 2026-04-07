import SearchBar from "./SearchBar";

function Header({ onSearch, bookmarkCount, onOpenBookmarks, initialQuery }) {
  return (
    <header className="site-header">
      <div className="site-header__brand">
        <span className="site-header__logo" aria-hidden="true" />
        <div>
          <strong>NEWSR</strong>
          <p>Personalized news aggregator</p>
        </div>
      </div>

      <div className="site-header__search">
        <SearchBar onSearch={onSearch} initialQuery={initialQuery} />
      </div>

      <div className="site-header__actions">
        <button
          type="button"
          className="icon-button icon-button--count"
          onClick={onOpenBookmarks}
          aria-label="Open saved articles"
        >
          Save
          <span className="count-badge">{bookmarkCount}</span>
        </button>
        <button type="button" className="icon-button" aria-label="Notifications">
          Bell
        </button>
      </div>
    </header>
  );
}

export default Header;
