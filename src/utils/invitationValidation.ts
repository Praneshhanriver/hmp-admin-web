import { DOCTOR_NAME_MAX_LENGTH, DOCTOR_NAME_MIN_LENGTH, EMAIL_MAX_LENGTH } from "@/constants/invitation";
import type { InvitationField, InvitationFieldErrors, InvitationFormValues } from "@/types/invitation";

// Same rules, same order and same words as the backend InvitationRequest (wording from Hi-Fi frames 2g / 2j).
// Order per field: required → length → format (the backend picks the same first message)
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_PATTERN = /^01[016789]-?\d{3,4}-?\d{4}$/; // 010-1234-5678 or 01012345678

export const VALIDATION_MESSAGES = {
  doctorNameRequired: "Enter the doctor's name.",
  doctorNameLength: `The doctor's name must be ${DOCTOR_NAME_MIN_LENGTH} to ${DOCTOR_NAME_MAX_LENGTH} characters.`,
  emailRequired: "Enter a valid email address, e.g. name@clinic.co.kr.",
  emailLength: `The email address must be ${EMAIL_MAX_LENGTH} characters or fewer.`,
  emailFormat: "Enter a valid email address, e.g. name@clinic.co.kr.",
  mobileRequired: "Enter a Korean mobile number, e.g. 010-1234-5678.",
  mobileFormat: "Enter a Korean mobile number, e.g. 010-1234-5678.",
} as const;

const RULES: Record<InvitationField, (value: string) => string | undefined> = {
  doctorName: (value) => {
    if (!value) return VALIDATION_MESSAGES.doctorNameRequired;
    if (value.length < DOCTOR_NAME_MIN_LENGTH || value.length > DOCTOR_NAME_MAX_LENGTH) {
      return VALIDATION_MESSAGES.doctorNameLength;
    }
  },
  email: (value) => {
    if (!value) return VALIDATION_MESSAGES.emailRequired;
    if (value.length > EMAIL_MAX_LENGTH) return VALIDATION_MESSAGES.emailLength;
    if (!EMAIL_PATTERN.test(value)) return VALIDATION_MESSAGES.emailFormat;
  },
  mobile: (value) => {
    if (!value) return VALIDATION_MESSAGES.mobileRequired;
    if (!MOBILE_PATTERN.test(value)) return VALIDATION_MESSAGES.mobileFormat;
  },
};

// Spaces at the start and end are dropped before checking and sending (the backend trims too)
export function trimValues(values: InvitationFormValues): InvitationFormValues {
  return { doctorName: values.doctorName.trim(), email: values.email.trim(), mobile: values.mobile.trim() };
}

// One message for every field that breaks a rule; {} when everything is fine
export function validateInvitation(values: InvitationFormValues): InvitationFieldErrors {
  const trimmed = trimValues(values);
  const errors: InvitationFieldErrors = {};
  for (const field of Object.keys(RULES) as InvitationField[]) {
    const message = RULES[field](trimmed[field]);
    if (message) errors[field] = message;
  }
  return errors;
}
