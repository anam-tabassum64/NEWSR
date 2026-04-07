// FILE: frontend/src/components/ENewspaper.jsx
import { useState } from "react";
import {
  LANGUAGE_COLORS,
  NATIONAL_PAPERS,
  REGIONAL_PAPERS,
  STATE_PAPER_MAP,
} from "../data/epapers";

function groupPapersByLanguage(papers) {
  return papers.reduce((groups, paper) => {
    if (!groups[paper.language]) {
      groups[paper.language] = [];
    }

    groups[paper.language].push(paper);
    return groups;
  }, {});
}

function ENewspaper() {
  const [activeTab, setActiveTab] = useState("all");
  const [activeState, setActiveState] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const allLanguages = [...new Set(REGIONAL_PAPERS.map((paper) => paper.language))];
  const papersById = REGIONAL_PAPERS.reduce((lookup, paper) => {
    lookup[paper.id] = paper;
    return lookup;
  }, {});

  const languageFilteredPapers =
    activeTab !== "all" && activeTab !== "national"
      ? REGIONAL_PAPERS.filter((paper) => paper.language === activeTab)
      : REGIONAL_PAPERS;

  const visibleStates = Object.keys(STATE_PAPER_MAP).filter((state) =>
    STATE_PAPER_MAP[state].some((paperId) => {
      const paper = papersById[paperId];
      return paper && languageFilteredPapers.some((item) => item.id === paper.id);
    })
  );

  const filteredPapers = REGIONAL_PAPERS.filter((paper) => {
    if (activeTab === "national") {
      return false;
    }

    if (activeTab !== "all" && paper.language !== activeTab) {
      return false;
    }

    if (activeState !== "all") {
      const statePaperIds = STATE_PAPER_MAP[activeState] || [];
      if (!statePaperIds.includes(paper.id)) {
        return false;
      }
    }

    if (!normalizedQuery) {
      return true;
    }

    const haystack = `${paper.name} ${paper.language} ${paper.state} ${paper.region}`.toLowerCase();
    return haystack.includes(normalizedQuery);
  });

  const filteredNationalPapers = NATIONAL_PAPERS.filter((paper) => {
    if (!(activeTab === "all" || activeTab === "national")) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const haystack = `${paper.name} ${paper.language} ${paper.region}`.toLowerCase();
    return haystack.includes(normalizedQuery);
  });

  const groupedByLanguage = groupPapersByLanguage(filteredPapers);
  const stateCounts = Object.fromEntries(
    Object.entries(STATE_PAPER_MAP).map(([state, paperIds]) => [state, paperIds.length])
  );
  const totalCount = filteredPapers.length;
  const visibleCount = totalCount + filteredNationalPapers.length;
  const visibleLanguageCount = Object.keys(groupedByLanguage).length;

  function openPaper(url) {
    window.open(url, "_blank");
  }

  function clearFilters() {
    setActiveTab("all");
    setActiveState("all");
    setSearchQuery("");
    setViewMode("grid");
  }

  function renderGridCard(paper) {
    return (
      <article
        key={paper.id}
        className="epaper-card"
        onClick={() => openPaper(paper.url)}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openPaper(paper.url);
          }
        }}
      >
        <div
          className="epaper-logo"
          style={{ backgroundColor: paper.bgColor, color: paper.color }}
        >
          {paper.shortName}
        </div>
        <div className="epaper-paper-name">{paper.name}</div>
        <div className="epaper-paper-state">{paper.region}</div>
        <div className="epaper-paper-link">Read online -&gt;</div>
      </article>
    );
  }

  function renderListCard(paper) {
    return (
      <article
        key={paper.id}
        className="epaper-list-item"
        onClick={() => openPaper(paper.url)}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openPaper(paper.url);
          }
        }}
      >
        <div
          className="epaper-list-logo"
          style={{ backgroundColor: paper.bgColor, color: paper.color }}
        >
          {paper.shortName}
        </div>
        <div>
          <div className="epaper-list-name">{paper.name}</div>
          <div className="epaper-list-sub">
            {paper.state} · {paper.language}
          </div>
        </div>
        <div className="epaper-list-desc">
          {paper.description.length > 60 ? `${paper.description.slice(0, 60)}...` : paper.description}
        </div>
        <button
          type="button"
          className="epaper-list-btn"
          onClick={(event) => {
            event.stopPropagation();
            openPaper(paper.url);
          }}
        >
          Open →
        </button>
      </article>
    );
  }

  return (
    <section className="full-width-card">
      <div className="section-header">
        <div className="section-header__title">
          <span className="section-dot" />
          <h2>eNewspaper</h2>
        </div>
        <span className="section-badge">
          {visibleCount} papers · {visibleLanguageCount} languages
        </span>
      </div>

      <div className="epaper-stats-row">
        <div className="epaper-stat">
          <div className="epaper-stat-num">{NATIONAL_PAPERS.length + REGIONAL_PAPERS.length}</div>
          <div className="epaper-stat-label">Total papers</div>
        </div>
        <div className="epaper-stat">
          <div className="epaper-stat-num">15</div>
          <div className="epaper-stat-label">Languages</div>
        </div>
        <div className="epaper-stat">
          <div className="epaper-stat-num">28</div>
          <div className="epaper-stat-label">States covered</div>
        </div>
        <div className="epaper-stat">
          <div className="epaper-stat-num">{NATIONAL_PAPERS.length}</div>
          <div className="epaper-stat-label">National papers</div>
        </div>
      </div>

      <div className="epaper-search-row">
        <div className="epaper-search-box">
          <input
            className="epaper-search-input"
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by name, language or state…"
          />
          {searchQuery ? (
            <button
              type="button"
              className="epaper-search-clear"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
            >
              ×
            </button>
          ) : null}
        </div>

        <div className="epaper-view-toggle">
          <button
            type="button"
            className={`epaper-view-btn ${viewMode === "grid" ? "active" : ""}`}
            onClick={() => setViewMode("grid")}
            aria-label="Grid view"
          >
            ⊞
          </button>
          <button
            type="button"
            className={`epaper-view-btn ${viewMode === "list" ? "active" : ""}`}
            onClick={() => setViewMode("list")}
            aria-label="List view"
          >
            ☰
          </button>
        </div>
      </div>

      <div className="epaper-tab-row">
        <button
          type="button"
          className={`epaper-tab ${activeTab === "all" ? "active" : ""}`}
          onClick={() => setActiveTab("all")}
        >
          All papers <span className="epaper-tab__count">{REGIONAL_PAPERS.length + NATIONAL_PAPERS.length}</span>
        </button>
        <button
          type="button"
          className={`epaper-tab ${activeTab === "national" ? "active" : ""}`}
          onClick={() => setActiveTab("national")}
        >
          National <span className="epaper-tab__count">{NATIONAL_PAPERS.length}</span>
        </button>
        {allLanguages.map((language) => {
          const languageCount = REGIONAL_PAPERS.filter((paper) => paper.language === language).length;

          return (
            <button
              key={language}
              type="button"
              className={`epaper-tab ${activeTab === language ? "active" : ""}`}
              onClick={() => setActiveTab(language)}
            >
              {language} <span className="epaper-tab__count">{languageCount}</span>
            </button>
          );
        })}
      </div>

      <div className="epaper-state-map-row">
        <div className="epaper-state-list">
          <button
            type="button"
            className={`epaper-state-item ${activeState === "all" ? "active" : ""}`}
            onClick={() => setActiveState("all")}
          >
            <span className="epaper-state-name">All India</span>
            <span className="epaper-state-count">{REGIONAL_PAPERS.length}</span>
          </button>

          {visibleStates.map((state) => (
            <button
              key={state}
              type="button"
              className={`epaper-state-item ${activeState === state ? "active" : ""}`}
              onClick={() => {
                setActiveState(state);
                setActiveTab("all");
              }}
            >
              <span className="epaper-state-name">{state}</span>
              <span className="epaper-state-count">{stateCounts[state]}</span>
            </button>
          ))}
        </div>

        <div className="epaper-map-placeholder">
          <div style={{ fontSize: 24 }}>🗺️</div>
          <div className="epaper-map-copy">Click a state on the map to filter papers</div>
          <div className="epaper-map-note">(Interactive SVG map — future enhancement)</div>
        </div>
      </div>

      {!visibleCount ? (
        <div className="epaper-empty">
          <div className="epaper-empty-icon">🗞️</div>
          <div className="epaper-empty-title">No papers found</div>
          <div className="epaper-empty-sub">Try a different language or clear the search</div>
          <button type="button" className="primary-button" onClick={clearFilters}>
            Clear filters
          </button>
        </div>
      ) : (
        <>
          {(activeTab === "all" || activeTab === "national") && filteredNationalPapers.length ? (
            <section className="epaper-section">
              <div className="epaper-lang-header">
                <span className="epaper-lang-bar" style={{ backgroundColor: "#185FA5" }} />
                <span className="epaper-lang-name">National papers</span>
                <span className="epaper-lang-count">{filteredNationalPapers.length}</span>
                <span className="epaper-lang-line" />
              </div>

              {viewMode === "grid" ? (
                <div className="epaper-grid">
                  {filteredNationalPapers.map((paper) => renderGridCard(paper))}
                </div>
              ) : (
                <div className="epaper-list">
                  {filteredNationalPapers.map((paper) => renderListCard(paper))}
                </div>
              )}
            </section>
          ) : null}

          {Object.entries(groupedByLanguage).map(([language, papers]) => {
            const languageTheme = LANGUAGE_COLORS[language] || {
              accent: "#185FA5",
            };

            return (
              <section key={language} className="epaper-section">
                <div className="epaper-lang-header">
                  <span
                    className="epaper-lang-bar"
                    style={{ backgroundColor: languageTheme.accent }}
                  />
                  <span className="epaper-lang-name">{language}</span>
                  <span className="epaper-lang-count">{papers.length}</span>
                  <span className="epaper-lang-line" />
                </div>

                {viewMode === "grid" ? (
                  <div className="epaper-grid">
                    {papers.map((paper) => renderGridCard(paper))}
                  </div>
                ) : (
                  <div className="epaper-list">
                    {papers.map((paper) => renderListCard(paper))}
                  </div>
                )}
              </section>
            );
          })}
        </>
      )}
    </section>
  );
}

export default ENewspaper;
