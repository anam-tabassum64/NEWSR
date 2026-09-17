import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import GoogleSignInButton from "./GoogleSignInButton";

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

function AuthModal({ isOpen, onClose, initialMode = "login", initialEmail = "" }) {
  const { login, signup, googleLogin, forgotPassword } = useAuth();
  const [mode, setMode] = useState(initialMode);
  const [loading, setLoading] = useState(false);
  const [inlineError, setInlineError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: initialEmail, password: "" });
  const [signupForm, setSignupForm] = useState({
    name: "",
    email: initialEmail,
    password: "",
    confirmPassword: "",
    acceptedTerms: false,
  });
  const [forgotEmail, setForgotEmail] = useState(initialEmail);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setForgotEmail(initialEmail);
      setLoginForm({ email: initialEmail, password: "" });
      setSignupForm({
        name: "",
        email: initialEmail,
        password: "",
        confirmPassword: "",
        acceptedTerms: false,
      });
      setInlineError("");
      setInfoMessage("");
      setLoading(false);
      setShowPassword(false);
    }
  }, [isOpen, initialMode, initialEmail]);

  useEffect(() => {
    function handleEsc(event) {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  const passwordStrength = useMemo(() => getPasswordStrength(signupForm.password), [signupForm.password]);

  function resetViewState(nextMode) {
    setMode(nextMode);
    setInlineError("");
    setInfoMessage("");
    setLoading(false);
  }

  async function handleLoginSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setInlineError("");

    try {
      await login(loginForm.email, loginForm.password);
      onClose();
    } catch (error) {
      setInlineError(error.message || "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleCredential(credential) {
    setLoading(true);
    setInlineError("");
    try {
      await googleLogin(credential);
      onClose();
    } catch (error) {
      setInlineError(error.message || "Unable to sign in with Google.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignupSubmit(event) {
    event.preventDefault();
    setInlineError("");

    if (signupForm.password !== signupForm.confirmPassword) {
      setInlineError("Passwords do not match.");
      return;
    }

    if (!signupForm.acceptedTerms) {
      setInlineError("You must agree to the Terms of Service and Privacy Policy.");
      return;
    }

    setLoading(true);

    try {
      await signup(signupForm.name, signupForm.email, signupForm.password);
      onClose();
    } catch (error) {
      setInlineError(error.message || "Unable to create your account.");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setInlineError("");

    try {
      await forgotPassword(forgotEmail);
      setMode("reset_sent");
    } catch (error) {
      setInlineError(error.message || "Unable to send reset link.");
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(event) => event.stopPropagation()}>
        {mode === "login" ? (
          <form onSubmit={handleLoginSubmit}>
            <h2>Welcome back</h2>

            <div className="auth-field">
              <label className="auth-label">Email</label>
              <input
                className="auth-input"
                type="email"
                placeholder="Email"
                autoComplete="email"
                value={loginForm.email}
                onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))}
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">Password</label>
              <div className="auth-password-row">
                <input
                  className="auth-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  autoComplete="current-password"
                  value={loginForm.password}
                  onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword((current) => !current)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <button type="button" className="auth-inline-link" onClick={() => resetViewState("forgot")}>
                Forgot password?
              </button>
            </div>

            {inlineError ? <div className="auth-error">{inlineError}</div> : null}

            <button type="submit" className="auth-btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : null}
              Sign in
            </button>

            <div className="auth-divider">or</div>
            <GoogleSignInButton onCredential={handleGoogleCredential} onError={setInlineError} disabled={loading} />

            {infoMessage ? <div className="auth-hint">{infoMessage}</div> : null}

            <div className="auth-footer-copy">
              No account?{" "}
              <button type="button" className="auth-inline-link" onClick={() => resetViewState("signup")}>
                Sign up
              </button>
            </div>
          </form>
        ) : null}

        {mode === "signup" ? (
          <form onSubmit={handleSignupSubmit}>
            <h2>Create account</h2>

            <div className="auth-field">
              <label className="auth-label">Full name</label>
              <input
                className="auth-input"
                type="text"
                placeholder="Full name"
                value={signupForm.name}
                onChange={(event) => setSignupForm((current) => ({ ...current, name: event.target.value }))}
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">Email</label>
              <input
                className="auth-input"
                type="email"
                placeholder="Email"
                autoComplete="email"
                value={signupForm.email}
                onChange={(event) => setSignupForm((current) => ({ ...current, email: event.target.value }))}
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">Password</label>
              <div className="auth-password-row">
                <input
                  className="auth-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  autoComplete="new-password"
                  value={signupForm.password}
                  onChange={(event) => setSignupForm((current) => ({ ...current, password: event.target.value }))}
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword((current) => !current)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <div className="strength-bars">
                {[1, 2, 3, 4].map((index) => (
                  <span
                    key={index}
                    className={`strength-bar-seg ${
                      passwordStrength >= index
                        ? passwordStrength === 1
                          ? "weak"
                          : passwordStrength === 2
                            ? "medium"
                            : passwordStrength === 3
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
                className={`auth-input ${
                  signupForm.confirmPassword
                    ? signupForm.password === signupForm.confirmPassword
                      ? "success"
                      : "error"
                    : ""
                }`}
                type="password"
                placeholder="Confirm password"
                autoComplete="new-password"
                value={signupForm.confirmPassword}
                onChange={(event) =>
                  setSignupForm((current) => ({ ...current, confirmPassword: event.target.value }))
                }
              />
            </div>

            <label className="auth-checkbox-row">
              <input
                type="checkbox"
                checked={signupForm.acceptedTerms}
                onChange={(event) =>
                  setSignupForm((current) => ({ ...current, acceptedTerms: event.target.checked }))
                }
              />
              <span>I agree to the Terms of Service and Privacy Policy</span>
            </label>

            {inlineError ? <div className="auth-error">{inlineError}</div> : null}

            <button type="submit" className="auth-btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : null}
              Create account
            </button>

            <div className="auth-footer-copy">
              Already have an account?{" "}
              <button type="button" className="auth-inline-link" onClick={() => resetViewState("login")}>
                Sign in
              </button>
            </div>
          </form>
        ) : null}

        {mode === "forgot" ? (
          <form onSubmit={handleForgotSubmit}>
            <h2>Reset password</h2>

            <div className="auth-field">
              <label className="auth-label">Email</label>
              <input
                className="auth-input"
                type="email"
                placeholder="Email"
                autoComplete="email"
                value={forgotEmail}
                onChange={(event) => setForgotEmail(event.target.value)}
              />
            </div>

            {inlineError ? <div className="auth-error">{inlineError}</div> : null}

            <button type="submit" className="auth-btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : null}
              Send reset link
            </button>

            <div className="auth-footer-copy">
              <button type="button" className="auth-inline-link" onClick={() => resetViewState("login")}>
                Back to sign in
              </button>
            </div>
          </form>
        ) : null}

        {mode === "reset_sent" ? (
          <div>
            <div className="auth-status-icon auth-status-icon--success">OK</div>
            <h2>Reset link sent!</h2>
            <p className="auth-copy">Check your email for a password reset link.</p>
            <button type="button" className="auth-btn-primary" onClick={() => resetViewState("login")}>
              Back to sign in
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default AuthModal;
