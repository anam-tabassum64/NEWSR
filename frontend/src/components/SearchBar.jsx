import { useEffect, useState } from "react";

function SearchBar({ onSearch, initialQuery = "" }) {
  const [value, setValue] = useState(initialQuery);

  useEffect(() => {
    setValue(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      onSearch(value.trim());
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [value, onSearch]);

  function handleImmediateSubmit(nextValue = value) {
    onSearch(nextValue.trim());
  }

  function handleClear() {
    setValue("");
    onSearch("");
  }

  return (
    <div className="search-bar">
      <span className="search-bar__icon" aria-hidden="true">
        /
      </span>
      <input
        className="search-bar__input"
        type="text"
        placeholder="Search headlines, topics, and sources"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            handleClear();
          }

          if (event.key === "Enter") {
            handleImmediateSubmit(event.currentTarget.value);
          }
        }}
      />
      {value ? (
        <button
          type="button"
          className="search-bar__clear"
          onClick={handleClear}
          aria-label="Clear search"
        >
          x
        </button>
      ) : null}
    </div>
  );
}

export default SearchBar;
