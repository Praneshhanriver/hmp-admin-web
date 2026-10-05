import type { ReactNode } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";

interface EmptyStateProps {
  title: string;
  description: ReactNode; // text or JSX, e.g. with <strong> parts
  action?: ReactNode; // optional button
}

// "Nothing to show" message (Hi-Fi EmptyState). Never a blank page
export default function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="state-message" role="status">
      <span className="state-message-icon">
        <MagnifyingGlass aria-hidden />
      </span>
      <span className="state-message-title">{title}</span>
      <span className="state-message-description">{description}</span>
      {action}
    </div>
  );
}