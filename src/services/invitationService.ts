import { MOCK_INVITATIONS } from "@/mocks/invitations";
import type { Invitation, InvitationFilters } from "@/types/invitation";
import { filterInvitations } from "@/utils/filterInvitations";

// Lets a reviewer see every state: ?mock=error or ?mock=empty in the URL
export type MockScenario = "normal" | "empty" | "error";

const MOCK_DELAY_MS = 800; // long enough to see the loading skeleton

export function toMockScenario(value: string | undefined): MockScenario {
  return value === "error" || value === "empty" ? value : "normal";
}

// Pretends to be the backend. Homework 2 replaces the body with a real API call
export async function fetchInvitations(
  filters: InvitationFilters,
  scenario: MockScenario = "normal",
): Promise<Invitation[]> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

  if (scenario === "error") throw new Error("Mock server error");
  if (scenario === "empty") return [];
  return filterInvitations(MOCK_INVITATIONS, filters);
}