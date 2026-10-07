// "/doctors/invitations/details/5" → 5. Anything that is not a whole positive number → null
// (the screen then shows "Invitation not found" without calling the API)
export function parseInvitationId(raw: string): number | null {
  if (!/^\d+$/.test(raw)) return null;
  const id = Number(raw);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}
