import { useEffect } from "react";

export default function Snackbar({ msg, type, onClose }) {
  useEffect(() => {
    if (!msg) return;                // nothing to do when there is no message
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [msg, onClose]);              

  if (!msg) return null;

  return (
    <div className={`snackbar ${type}`} role="alert">
      <span>
        {type === "success"
          ? "✓"
          : type === "error"
          ? "✕"
          : "ℹ"}
      </span>
      {msg}
    </div>
  );
}
