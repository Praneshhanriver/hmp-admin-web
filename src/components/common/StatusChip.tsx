import type { Icon } from "@phosphor-icons/react";
import { CheckCircle, Clock, HourglassLow, Prohibit } from "@phosphor-icons/react/dist/ssr";
import type { InvitationStatus } from "@/types/invitation";

// One lookup table instead of four if-statements
const STATUS_CONFIG: Record<InvitationStatus, { label: string; icon: Icon }> = {
  pending: { label: "Pending", icon: Clock },
  used: { label: "Used", icon: CheckCircle },
  expired: { label: "Expired", icon: HourglassLow },
  revoked: { label: "Revoked", icon: Prohibit },
};

interface StatusChipProps {
  status: InvitationStatus;
}

// Icon + word + fill/border: status is never shown by colour alone
export default function StatusChip({ status }: StatusChipProps) {
  const { label, icon: ChipIcon } = STATUS_CONFIG[status];

  return (
    <span className={`status-chip status-chip-${status}`}>
      <ChipIcon className="icon-sm" weight={status === "used" ? "fill" : "regular"} aria-hidden />
      {label}
    </span>
  );
}