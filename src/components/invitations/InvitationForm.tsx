"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent } from "react";
import { CircleNotch, Info, PaperPlaneTilt, WarningCircle } from "@phosphor-icons/react";
import type { ApiError } from "@/api-services/apiClient";
import { INVITATION_VALIDITY_LABEL } from "@/constants/invitation";
import type { InvitationField, InvitationFormValues } from "@/types/invitation";
import { trimValues, validateInvitation } from "@/utils/invitationValidation";

interface InvitationFormProps {
  mode: "create" | "edit";
  initialValues: InvitationFormValues;
  isSubmitting: boolean;
  submitError: ApiError | null; // the last failed save, from the mutation hook
  onSubmit: (values: InvitationFormValues) => void;
  cancelHref: string;
}

// No maxLength on the inputs: a too-long value shows the length message instead of being cut off silently
interface FieldConfig {
  name: InvitationField;
  label: string;
  type: "text" | "email" | "tel";
  placeholder: string; // an example only; the label always stays visible
  hint?: string;
  inputMode?: "text" | "email" | "tel";
}

const FIELDS: FieldConfig[] = [
  { name: "doctorName", label: "Doctor's name", type: "text", placeholder: "e.g. Dr. Kim Han-mi" },
  { name: "email", label: "Email", type: "email", placeholder: "e.g. kim.hanmi@clinic.co.kr", inputMode: "email" },
  {
    name: "mobile",
    label: "Mobile number",
    type: "tel",
    placeholder: "e.g. 010-1234-5678",
    hint: "With or without hyphens. Only the first 3 and last 4 digits are shown in lists.",
    inputMode: "tel",
  },
];

const COPY = {
  create: { submit: "Issue invitation", busy: "Issuing…" },
  edit: { submit: "Save and re-issue", busy: "Saving…" },
} as const;

// W-02 Issue invitation / W-04 Edit: three fields, labels above, errors in words under each field
export default function InvitationForm({
  mode,
  initialValues,
  isSubmitting,
  submitError,
  onSubmit,
  cancelHref,
}: InvitationFormProps) {
  const [values, setValues] = useState<InvitationFormValues>(initialValues);
  const [hasTriedSubmit, setHasTriedSubmit] = useState(false); // after the first try, errors update while typing
  const [submittedValues, setSubmittedValues] = useState<InvitationFormValues | null>(null);
  const inputRefs = useRef<Partial<Record<InvitationField, HTMLInputElement | null>>>({});
  const formId = useId();

  // Derived, never stored
  const clientErrors = validateInvitation(values);
  const isDirty = JSON.stringify(trimValues(values)) !== JSON.stringify(trimValues(initialValues));
  const canSubmit = !isSubmitting && (mode === "create" || isDirty);
  const serverFieldErrors = submitError?.fieldErrors ?? {};
  const hasServerFieldErrors = Object.keys(serverFieldErrors).length > 0;

  // A field shows the browser-side message first; the server's message stays until that field is changed
  function errorFor(field: InvitationField): string | undefined {
    if (hasTriedSubmit && clientErrors[field]) return clientErrors[field];
    if (submittedValues && values[field] === submittedValues[field]) return serverFieldErrors[field];
    return undefined;
  }

  // The API refused the save: move focus to the first field it complained about
  useEffect(() => {
    const field = FIELDS.find(({ name }) => submitError?.fieldErrors[name]);
    if (field) inputRefs.current[field.name]?.focus();
  }, [submitError]);

  // Unsaved changes: the browser asks before the tab is closed or reloaded
  useEffect(() => {
    if (!isDirty || isSubmitting) return;
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty, isSubmitting]);

  function handleChange(field: InvitationField, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); // stop the browser from reloading the page
    if (!canSubmit) return;

    setHasTriedSubmit(true);
    const firstInvalid = FIELDS.find(({ name }) => clientErrors[name]);
    if (firstInvalid) {
      inputRefs.current[firstInvalid.name]?.focus();
      return;
    }
    setSubmittedValues(values);
    onSubmit(trimValues(values));
  }

  return (
    <form id={formId} className="invitation-form" noValidate onSubmit={handleSubmit} aria-busy={isSubmitting}>
      {mode === "edit" && (
        <p className="invitation-form-notice">
          <Info className="icon-md" aria-hidden />
          <span>
            Saving sends a corrected link to the doctor. The previous link stops working and the re-issue count goes
            up by one.
          </span>
        </p>
      )}

      {FIELDS.map((field) => (
        <FormField
          key={field.name}
          config={field}
          value={values[field.name]}
          error={errorFor(field.name)}
          inputRef={(element) => {
            inputRefs.current[field.name] = element;
          }}
          onChange={(value) => handleChange(field.name, value)}
        />
      ))}

      <p className="invitation-form-validity">
        <PaperPlaneTilt className="icon-md" aria-hidden />
        The link is valid for {INVITATION_VALIDITY_LABEL} (period TBC — S12 ▸ INVITATION).
      </p>

      {/* Errors that belong to no single field: server down, server error, status changed meanwhile */}
      {submitError && !hasServerFieldErrors && (
        <p className="invitation-form-error" role="alert">
          <WarningCircle className="icon-md" aria-hidden />
          <span>{submitError.message} What you typed is kept.</span>
        </p>
      )}

      <div className="invitation-form-actions">
        <Link href={cancelHref} className="btn btn-secondary btn-lg">
          Cancel
        </Link>
        <button type="submit" className="btn btn-primary btn-lg" disabled={!canSubmit}>
          {isSubmitting && <CircleNotch aria-hidden />}
          {isSubmitting ? COPY[mode].busy : COPY[mode].submit}
        </button>
      </div>
    </form>
  );
}

interface FormFieldProps {
  config: FieldConfig;
  value: string;
  error: string | undefined;
  inputRef: (element: HTMLInputElement | null) => void;
  onChange: (value: string) => void;
}

// Label above, input, hint, then the error in words (announced, linked with aria-describedby)
function FormField({ config, value, error, inputRef, onChange }: FormFieldProps) {
  const inputId = useId();
  const hintId = useId();
  const errorId = useId();
  const describedBy = [config.hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined;

  return (
    <div className={error ? "invitation-form-field is-invalid" : "invitation-form-field"}>
      <label htmlFor={inputId} className="invitation-form-label">
        {config.label} <span className="invitation-form-required">(required)</span>
      </label>
      <input
        ref={inputRef}
        id={inputId}
        name={config.name}
        type={config.type}
        inputMode={config.inputMode}
        className="invitation-form-input"
        value={value}
        placeholder={config.placeholder}
        autoComplete="off"
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        onChange={(event) => onChange(event.target.value)}
      />
      {config.hint && (
        <span id={hintId} className="invitation-form-hint">
          {config.hint}
        </span>
      )}
      {error && (
        <span id={errorId} className="invitation-form-field-error">
          <WarningCircle className="icon-sm" aria-hidden /> {error}
        </span>
      )}
    </div>
  );
}
