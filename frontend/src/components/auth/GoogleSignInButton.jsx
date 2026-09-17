import { useEffect, useRef } from "react";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function GoogleSignInButton({ onCredential, onError, disabled }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!CLIENT_ID || !containerRef.current) return undefined;
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => {
      window.google?.accounts.id.initialize({ client_id: CLIENT_ID, callback: (response) => onCredential(response.credential) });
      window.google?.accounts.id.renderButton(containerRef.current, { theme: "outline", size: "large", text: "continue_with", shape: "pill", width: 350 });
    };
    script.onerror = () => onError("Google sign-in could not be loaded.");
    document.head.appendChild(script);
    return () => script.remove();
  }, [onCredential, onError]);

  if (!CLIENT_ID) return <p className="auth-hint">Google sign-in is not configured for this environment.</p>;
  return <div className={disabled ? "google-signin google-signin--disabled" : "google-signin"} ref={containerRef} />;
}

export default GoogleSignInButton;
