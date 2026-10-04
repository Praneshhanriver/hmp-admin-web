import type { InvitationStatus } from "@/types/invitation";

// Which actions each status allows (p.113c ⑥ + Hi-Fi rules table)
export const canReissue = (status: InvitationStatus) => status !== "used";
export const canRevoke = (status: InvitationStatus) => status === "pending";
export const canEdit = (status: InvitationStatus) => status === "pending"; // training extension
export const canOpenDetail = (status: InvitationStatus) => status === "used";