import { CheckCircle } from "@phosphor-icons/react/dist/ssr";

interface ToastProps {
  title: string;
  message: string;
  onDismiss: () => void;
  onPause: () => void; // mouse or focus entered: stop the auto-hide timer
  onResume: () => void;
}

// Short success message in the corner; hides itself after a few seconds
export default function Toast({ title, message, onDismiss, onPause, onResume }: ToastProps) {
  return (
    <div
      className="toast"
      role="status"
      aria-live="polite"
      onMouseEnter={onPause}
      onMouseLeave={onResume}
      onFocus={onPause}
      onBlur={onResume}
    >
      <CheckCircle className="toast-icon" weight="fill" aria-hidden />
      <span className="toast-text">
        <span className="toast-title">{title}</span>
        <span className="toast-message">{message}</span>
      </span>
      <button type="button" className="toast-dismiss" onClick={onDismiss}>
        Dismiss
      </button>
    </div>
  );
}
