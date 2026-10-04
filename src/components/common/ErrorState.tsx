import { ArrowClockwise, WarningCircle } from "@phosphor-icons/react/dist/ssr";

interface ErrorStateProps {
  title: string;
  description: string;
  onRetry: () => void;
}

// Load failure (Hi-Fi ErrorState). Not an empty state; raw server text never shown
export default function ErrorState({ title, description, onRetry }: ErrorStateProps) {
  return (
    <div className="state-message" role="alert">
      <span className="state-message-icon is-danger">
        <WarningCircle aria-hidden />
      </span>
      <span className="state-message-title">{title}</span>
      <span className="state-message-description">{description}</span>
      <button type="button" className="btn btn-primary btn-md" onClick={onRetry}>
        <ArrowClockwise aria-hidden /> Retry
      </button>
    </div>
  );
}