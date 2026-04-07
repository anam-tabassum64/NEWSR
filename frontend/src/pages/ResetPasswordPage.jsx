import { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";

function getPasswordStrength(password) {
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  if (password.length >= 12 && hasUpper && hasLower && hasDigit && hasSpecial) {
    return 4;
  }
  if (password.length >= 8 && hasUpper && hasLower && hasDigit) {
    return 3;
  }
  if (password.length >= 8 && ((hasUpper && hasLower) || (hasLower && hasDigit) || (hasUpper && hasDigit))) {
    return 2;
  }
  if (password.length > 0) {
    return 1;
  }
  return 0;
}

function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const token = new URLSearchParams(window.location.search).get("token");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(token ? "" : "Invalid reset link");
  const strength = useMemo(() => getPasswordStrength(newPassword), [newPassword]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!token) {
      setError("Invalid reset link");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await resetPassword(token, newPassword);
      setDone(true);
    } catch (requestError) {
      setError(requestError.message || "Unable to update your password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-page__card">
        <div className="auth-page__brand">
          <img src="/newsr-logo-tight.png?v=2" alt="NEWSR logo" className="site-header__logo" />
          <strong>NEWSR</strong>
        </div>

        {done ? (
          <div className="auth-page__success">
            <div className="auth-status-icon auth-status-icon--success">✓</div>
            <h1>Password updated</h1>
            <p>Your password has been reset successfully. You can return to the app and sign in now.</p>
            <button type="button" className="auth-btn-primary" onClick={() => (window.location.href = "/")}>
              Go to sign in
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h1>Set new password</h1>
            <p className="auth-copy">Create a strong password for your NEWSR account.</p>

            <div className="auth-field">
              <label className="auth-label">New password</label>
              <input
                className="auth-input"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
              <div className="strength-bars">
                {[1, 2, 3, 4].map((index) => (
                  <span
                    key={index}
                    className={`strength-bar-seg ${
                      strength >= index
                        ? strength === 1
                          ? "weak"
                          : strength === 2
                            ? "medium"
                            : strength === 3
                              ? "strong"
                              : "very-strong"
                        : ""
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">Confirm password</label>
              <input
                className={`auth-input ${confirmPassword && confirmPassword !== newPassword ? "error" : ""}`}
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </div>

            {error ? <div className="auth-error">{error}</div> : null}

            <button type="submit" className="auth-btn-primary" disabled={loading || !token}>
              {loading ? <span className="spinner" /> : null}
              Update password
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ResetPasswordPage;
