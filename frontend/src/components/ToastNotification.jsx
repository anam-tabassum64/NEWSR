import { useEffect } from "react";

function ToastNotification({ message, type = "info", visible, onHide }) {
  useEffect(() => {
    if (!visible) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      onHide();
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [visible, onHide]);

  return (
    <div
      className={`toast ${visible ? "toast--visible" : ""} toast--${type}`}
      aria-live="polite"
    >
      <span>{message}</span>
    </div>
  );
}

export default ToastNotification;
