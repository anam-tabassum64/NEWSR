import { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";

const TOPIC_OPTIONS = ["AI", "Technology", "Business", "Sports", "Science", "Health"];
const LANGUAGE_OPTIONS = ["English", "Hindi", "Telugu", "Tamil", "Malayalam", "Kannada", "Marathi"];

function formatJoinDate(timestamp) {
  if (!timestamp) {
    return "Recently";
  }

  try {
    return new Date(timestamp * 1000).toLocaleDateString();
  } catch (error) {
    return "Recently";
  }
}

function ProfilePage({ onBackHome }) {
  const { user, updatePreferences } = useAuth();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [draft, setDraft] = useState({
    topics: user?.preferences?.topics || [],
    languages: user?.preferences?.languages || [],
  });

  const bookmarkCount = useMemo(() => user?.preferences?.bookmarks?.length || 0, [user]);
  const historyCount = useMemo(() => user?.preferences?.click_history?.length || 0, [user]);

  function toggleSelection(key, value) {
    setDraft((current) => {
      const exists = current[key].includes(value);
      return {
        ...current,
        [key]: exists ? current[key].filter((item) => item !== value) : [...current[key], value],
      };
    });
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");

    try {
      await updatePreferences({
        ...user?.preferences,
        topics: draft.topics,
        languages: draft.languages,
      });
      setMessage("Profile preferences saved.");
    } catch (error) {
      setMessage(error.message || "Unable to save profile preferences.");
    } finally {
      setSaving(false);
    }
  }

  if (!user) {
    return (
      <div className="auth-page">
        <div className="auth-page__card">
          <h1>Profile unavailable</h1>
          <p className="auth-copy">Please sign in to view your profile.</p>
          <button type="button" className="auth-btn-primary" onClick={onBackHome}>
            Back to home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-page__hero card">
        <div className="profile-page__identity">
          <span className="user-avatar user-avatar--hero">
            {(user.name || "U")
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((part) => part[0]?.toUpperCase() || "")
              .join("")}
          </span>
          <div>
            <h1>{user.name}</h1>
            <p>{user.email}</p>
            {user.verified ? <span className="verified-badge">✓ Verified</span> : null}
          </div>
        </div>

        <div className="profile-page__meta">
          <div className="epaper-stat">
            <div className="epaper-stat-num">{bookmarkCount}</div>
            <div className="epaper-stat-label">Saved articles</div>
          </div>
          <div className="epaper-stat">
            <div className="epaper-stat-num">{historyCount}</div>
            <div className="epaper-stat-label">Reading signals</div>
          </div>
          <div className="epaper-stat">
            <div className="epaper-stat-num">{draft.topics.length}</div>
            <div className="epaper-stat-label">Favorite topics</div>
          </div>
          <div className="epaper-stat">
            <div className="epaper-stat-num">{formatJoinDate(user.created_at)}</div>
            <div className="epaper-stat-label">Member since</div>
          </div>
        </div>
      </div>

      <div className="profile-page__grid">
        <section className="card profile-card">
          <div className="section-header">
            <div className="section-header__title">
              <span className="section-dot" />
              <h2>Feed Preferences</h2>
            </div>
          </div>

          <div className="profile-chip-group">
            <p className="profile-card__label">Topics you want more of</p>
            <div className="profile-chip-row">
              {TOPIC_OPTIONS.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  className={`profile-chip ${draft.topics.includes(topic.toLowerCase()) ? "active" : ""}`}
                  onClick={() => toggleSelection("topics", topic.toLowerCase())}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          <div className="profile-chip-group">
            <p className="profile-card__label">Regional language interests</p>
            <div className="profile-chip-row">
              {LANGUAGE_OPTIONS.map((language) => (
                <button
                  key={language}
                  type="button"
                  className={`profile-chip ${draft.languages.includes(language) ? "active" : ""}`}
                  onClick={() => toggleSelection("languages", language)}
                >
                  {language}
                </button>
              ))}
            </div>
          </div>

          {message ? <p className="auth-hint">{message}</p> : null}

          <div className="profile-card__actions">
            <button type="button" className="auth-btn-secondary" onClick={onBackHome}>
              Back to home
            </button>
            <button type="button" className="auth-btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <span className="spinner" /> : null}
              Save preferences
            </button>
          </div>
        </section>

        <section className="card profile-card">
          <div className="section-header">
            <div className="section-header__title">
              <span className="section-dot" />
              <h2>Profile Snapshot</h2>
            </div>
          </div>

          <div className="profile-summary-row">
            <span className="profile-summary-row__label">Email status</span>
            <span>{user.verified ? "Verified" : "Pending"}</span>
          </div>
          <div className="profile-summary-row">
            <span className="profile-summary-row__label">Saved articles</span>
            <span>{bookmarkCount}</span>
          </div>
          <div className="profile-summary-row">
            <span className="profile-summary-row__label">Recent click signals</span>
            <span>{historyCount}</span>
          </div>
          <div className="profile-summary-row">
            <span className="profile-summary-row__label">Preferred topics</span>
            <span>{draft.topics.length || 0}</span>
          </div>
          <div className="profile-summary-row">
            <span className="profile-summary-row__label">Preferred languages</span>
            <span>{draft.languages.length || 0}</span>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ProfilePage;
