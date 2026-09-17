import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./auth/AuthModal";
import UserMenu from "./auth/UserMenu";
import SearchBar from "./SearchBar";

function Header({
  onSearch,
  bookmarkCount,
  onOpenBookmarks,
  initialQuery,
  onOpenProfile,
  onShowToast,
}) {
  const { user, logout } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState("login");
  const [authModalEmail, setAuthModalEmail] = useState("");

  function openAuthModal(mode, email = "") {
    setAuthModalMode(mode);
    setAuthModalEmail(email);
    setAuthModalOpen(true);
  }

  return (
    <>
      <aside className="nav-rail" aria-label="Primary navigation">
        <button type="button" className="nav-rail__brand" onClick={() => window.location.assign("/app")} aria-label="NewsPulse home">
          <span>NP</span>
        </button>
        <button type="button" className="nav-rail__item nav-rail__item--active" onClick={() => window.location.assign("/app")} aria-label="Home" title="Home">
          <span aria-hidden="true">⌂</span>
        </button>
        <button type="button" className="nav-rail__item" onClick={() => document.querySelector(".search-bar__input")?.focus()} aria-label="Discover" title="Discover">
          <span aria-hidden="true">◉</span>
        </button>
        <button type="button" className="nav-rail__item" onClick={onOpenBookmarks} aria-label="Saved articles" title="Saved articles">
          <span aria-hidden="true">▱</span>
        </button>
        <button type="button" className="nav-rail__item" onClick={onOpenProfile} aria-label="Profile" title="Profile">
          <span aria-hidden="true">◌</span>
        </button>
        <span className="nav-rail__spacer" />
        <button type="button" className="nav-rail__item" onClick={() => onShowToast?.("Notifications are coming soon.", "info")} aria-label="Notifications" title="Notifications">
          <span aria-hidden="true">♧</span>
        </button>
        <button type="button" className="nav-rail__item" onClick={() => onShowToast?.("Settings are available from your profile.", "info")} aria-label="Settings" title="Settings">
          <span aria-hidden="true">⚙</span>
        </button>
      </aside>
      <header className="site-header">
        <div className="site-header__brand">
          <img src="/newsr-logo-tight.png?v=2" alt="NEWSR logo" className="site-header__logo" />
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

          {user ? (
            <UserMenu
              user={user}
              onSignOut={logout}
              onOpenProfile={onOpenProfile}
              onOpenBookmarks={onOpenBookmarks}
              onOpenForgotPassword={() => openAuthModal("forgot", user.email)}
              onOpenNotifications={() => onShowToast?.("Notification settings are coming soon.", "info")}
              onOpenPreferences={onOpenProfile}
              onDeleteAccount={() =>
                onShowToast?.("Delete account is not available in this in-memory demo yet.", "info")
              }
            />
          ) : (
            <div className="site-header__auth">
              <button
                type="button"
                className="site-header__auth-btn site-header__auth-btn--ghost"
                onClick={() => openAuthModal("login")}
              >
                Sign in
              </button>
              <button
                type="button"
                className="site-header__auth-btn site-header__auth-btn--primary"
                onClick={() => openAuthModal("signup")}
              >
                Sign up
              </button>
            </div>
          )}
        </div>
      </header>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
        initialEmail={authModalEmail}
      />
    </>
  );
}

export default Header;
