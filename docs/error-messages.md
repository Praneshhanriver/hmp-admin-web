# Error messages — Doctor Invitations (ADM-003)

Layout follows **WM | Error Message List** (columns Page · Scenario · EN · KO). The WM list itself is still a stub
(one empty Login row), so these messages are our own, written to the same rules as the rest of the screen:
plain words, say what to do next, never raw server text.

**One source each.** Field messages live in the backend `InvitationRequest` and, word for word, in the frontend
`src/utils/invitationValidation.ts`. API messages live in the backend `ErrorCode` enum and reach the screen as the
`detail` of the RFC 7807 response. Network messages live in `src/api-services/apiClient.ts`.

KO: to be supplied by the PM / translator (the admin web is English-only in this homework).

## Form fields (Issue invitation, Edit) — checked in the browser and again by the API

| Page | Scenario | EN | KO |
|---|---|---|---|
| Issue / Edit | Doctor's name empty | Enter the doctor's name. | TBC |
| Issue / Edit | Doctor's name shorter than 2 or longer than 50 characters | The doctor's name must be 2 to 50 characters. | TBC |
| Issue / Edit | Email empty | Enter an email address. | TBC |
| Issue / Edit | Email longer than 100 characters | The email address must be 100 characters or fewer. | TBC |
| Issue / Edit | Email not in `name@domain.tld` form | Enter an email address in the format name@example.com. | TBC |
| Issue / Edit | Mobile empty | Enter a mobile number. | TBC |
| Issue / Edit | Mobile not a Korean mobile number (010/011/016–019, with or without hyphens) | Enter a mobile number like 010-1234-5678. | TBC |

Order per field (same in browser and API): required → length → format. Only the first broken rule is shown.

## API business rules (HTTP 409 / 404)

| Page | Scenario | Code | EN | KO |
|---|---|---|---|---|
| Issue / Edit / Re-issue | The email already has a Pending invitation (shown under Email) | `INVITATION_ALREADY_PENDING` | An invitation for this email is already waiting to be used. Re-issue it from the list instead. | TBC |
| Issue / Edit / Re-issue | A doctor with this email has already signed up (Used) | `DOCTOR_ALREADY_REGISTERED` | A doctor with this email has already signed up. No new invitation is needed. | TBC |
| Edit | The invitation is no longer Pending | `INVITATION_NOT_EDITABLE` | Only a pending invitation can be edited. | TBC |
| List (Re-issue dialog) | The invitation is Used | `INVITATION_NOT_REISSUABLE` | A used invitation cannot be re-issued. | TBC |
| List (Revoke dialog) | The invitation is no longer Pending | `INVITATION_NOT_REVOCABLE` | Only a pending invitation can be revoked. | TBC |
| Detail / Edit | The id does not exist (or is not a number) | `INVITATION_NOT_FOUND` | This invitation does not exist. It may have been entered incorrectly. | TBC |

## Request and system errors

| Page | Scenario | Code | EN | KO |
|---|---|---|---|---|
| Any | Body fields invalid (summary; field messages above) | `VALIDATION_FAILED` | Some details need fixing. Check the message under each field. | TBC |
| Any | Malformed request (bad JSON, unknown status, id not a number) | `INVALID_REQUEST` | The request could not be understood. Refresh the page and try again. | TBC |
| Any | Unexpected server error (HTTP 500) | `INTERNAL_ERROR` | Something went wrong on our side. Please try again in a moment. | TBC |
| Any | No answer: offline, API down, timeout (frontend only) | — | We can't reach the server. Check your connection and try again. | TBC |

## How each screen adds context
- **List error:** title "Unable to load invitations" + the message + "Your search is kept." + Retry.
- **Form error without a field** (500, offline, status changed): red box above the buttons, message + "What you typed is kept."
- **Dialog error** (Re-issue / Revoke): message inside the dialog; the dialog stays open so the admin can try again.
