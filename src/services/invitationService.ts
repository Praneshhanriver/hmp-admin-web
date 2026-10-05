import { MOCK_INVITATIONS } from "@/mocks/invitations";
import type { Invitation, InvitationFilters } from "@/types/invitation";
import { filterInvitations } from "@/utils/filterInvitations";
import { canReissue, canRevoke } from "@/utils/invitationRules";

// Lets a reviewer see every state: ?mock=error or ?mock=empty in the URL
export type MockScenario = "normal" | "empty" | "error";

const MOCK_DELAY_MS = 800; // long enough to see the loading skeleton
const MOCK_VALIDITY_DAYS = 14; // TBC, S12 ▸ INVITATION
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

// In-memory "database". Lives as long as the browser tab; a page reload starts over
let store: Invitation[] = MOCK_INVITATIONS.map((invitation) => ({ ...invitation }));

function wait(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
}

// Now (+ addDays) in Korean time: "2026-10-05T14:30:00+09:00"
function kstIso(addDays = 0): string {
  const kst = new Date(Date.now() + KST_OFFSET_MS + addDays * DAY_MS);
  return `${kst.toISOString().slice(0, 19)}+09:00`;
}

// Replaces one item without mutating the old array or object
function updateInvitation(id: string, change: (current: Invitation) => Invitation): Invitation {
  const current = store.find((invitation) => invitation.id === id);
  if (!current) throw new Error(`Invitation ${id} not found`);

  const updated = change(current);
  store = store.map((invitation) => (invitation.id === id ? updated : invitation));
  return updated;
}

export function toMockScenario(value: string | undefined): MockScenario {
  return value === "error" || value === "empty" ? value : "normal";
}

// Pretends to be the backend. Homework 2 replaces the body with a real API call
export async function fetchInvitations(
  filters: InvitationFilters,
  scenario: MockScenario = "normal",
): Promise<Invitation[]> {
  await wait();

  if (scenario === "error") throw new Error("Mock server error");
  if (scenario === "empty") return [];
  return filterInvitations(store, filters);
}

// New link: back to Pending, count +1, fresh issue and expiry dates
export async function reissueInvitation(id: string): Promise<Invitation> {
  await wait();

  return updateInvitation(id, (current) => {
    if (!canReissue(current.status)) throw new Error("Invitation cannot be re-issued");
    return {
      ...current,
      status: "pending",
      reissueCount: current.reissueCount + 1,
      issuedAt: kstIso(),
      expiresAt: kstIso(MOCK_VALIDITY_DAYS),
    };
  });
}

// The current link stops working; no new link is sent
export async function revokeInvitation(id: string): Promise<Invitation> {
  await wait();

  return updateInvitation(id, (current) => {
    if (!canRevoke(current.status)) throw new Error("Invitation cannot be revoked");
    return { ...current, status: "revoked" };
  });
}
