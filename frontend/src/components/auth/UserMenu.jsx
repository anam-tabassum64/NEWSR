import { useEffect, useMemo, useRef, useState } from "react";

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function UserMenu({
  user,
  onSignOut,
  onOpenProfile,
  onOpenBookmarks,
  onOpenForgotPassword,
  onOpenNotifications,
  onOpenPreferences,
  onDeleteAccount,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapRef = useRef(null);
  const initials = useMemo(() => getInitials(user?.name), [user?.name]);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function handleAction(action) {
    setIsOpen(false);
    action?.();
  }

  return (
    <div className="user-menu-wrap" ref={wrapRef}>
      <button
        type="button"
        className="user-trigger"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-label="Open user menu"
      >
        <span className="user-avatar">{initials || "U"}</span>
        <span className="user-trigger__name">{user?.name || "Account"}</span>
      </button>

      {isOpen ? (
        <div className="user-dropdown">
          <button type="button" className="user-dropdown__profile" onClick={() => handleAction(onOpenProfile)}>
            <span className="user-avatar user-avatar--large">{initials || "U"}</span>
            <span className="user-dropdown__meta">
              <strong>{user?.name}</strong>
              <span>{user?.email}</span>
              {user?.verified ? <span className="verified-badge">Verified</span> : null}
            </span>
          </button>

          <div className="user-dropdown__divider" />

          <button type="button" className="user-menu-item" onClick={() => handleAction(onOpenPreferences)}>
            <span className="user-menu-icon">PF</span>
            <span>My feed preferences</span>
          </button>
          <button type="button" className="user-menu-item" onClick={() => handleAction(onOpenBookmarks)}>
            <span className="user-menu-icon">SV</span>
            <span>Saved articles</span>
          </button>
          <button type="button" className="user-menu-item" onClick={() => handleAction(onOpenForgotPassword)}>
            <span className="user-menu-icon">PW</span>
            <span>Change password</span>
          </button>
          <button type="button" className="user-menu-item" onClick={() => handleAction(onOpenNotifications)}>
            <span className="user-menu-icon">NT</span>
            <span>Notification settings</span>
          </button>

          <div className="user-dropdown__divider" />

          <button
            type="button"
            className="user-menu-item user-menu-logout"
            onClick={() => handleAction(onSignOut)}
          >
            <span className="user-menu-icon">SO</span>
            <span>Sign out</span>
          </button>

          <button type="button" className="user-dropdown__danger" onClick={() => handleAction(onDeleteAccount)}>
            Delete account
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default UserMenu;
