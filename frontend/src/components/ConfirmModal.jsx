// src/components/ConfirmModal.jsx
import Spinner from "./LoadingSpinner";

/**
 * Re‑usable confirmation dialog.
 *
 * @param {Object} props
 * @param {string} props.title          – Text shown in the header.
 * @param {string} props.message        – Message/body of the dialog.
 * @param {() => void | Promise<any>} props.onConfirm – Called when the user clicks “Confirm”.
 * @param {() => void} props.onClose    – Called when the dialog is dismissed (Cancel / backdrop click).
 * @param {boolean} [props.loading]    – If true, the Confirm button shows a spinner and is disabled.
 */
export default function ConfirmModal({
  title,
  message,
  onConfirm,
  onClose,
  loading = false,
}) {
  // Close when the user clicks the semi‑transparent backdrop
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdrop}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
      >
        <header className="modal-header">
          <h2 className="modal-title" id="confirm-title">{title}</h2>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </header>

        <p className="confirm-msg">{message}</p>

        <footer className="confirm-actions">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner /> Sending…
              </>
            ) : (
              "Confirm"
            )}
          </button>
        </footer>
      </div>
    </div>
  );
}
