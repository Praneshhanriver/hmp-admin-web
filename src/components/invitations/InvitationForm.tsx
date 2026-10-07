"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent } from "react";
import { CircleNotch, FloppyDisk, Info, PaperPlaneTilt, WarningCircle } from "@phosphor-icons/react";
import type { ApiError } from "@/api-services/apiClient";
import type { InvitationField, InvitationFormValues } from "@/types/invitation";
import { trimValues, validateInvitation } from "@/utils/invitationValidation";

interface InvitationFormProps {
  mode: "create" | "edit";
  initialValues: InvitationFormValues;
  isSubmitting: boolean;
  submitError: ApiError | null; // the last failed save, from the mutation hook
  onSubmit: (values: InvitationFormValues) => void;
  cancelHref?: string; // edit only: the Hi-Fi create form has no Cancel button
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

// Labels, placeholders and the hint are the Hi-Fi text (1b / 1d)
const FIELDS: FieldConfig[] = [
  { name: "doctorName", label: "Doctor's name", type: "text", placeholder: "e.g. Kim Han-mi" },
  { name: "email", label: "Email", type: "email", placeholder: "e.g. name@clinic.co.kr", inputMode: "email" },
  {
    name: "mobile",
    label: "Mobile number",
    type: "tel",
    placeholder: "e.g. 010-1234-5678",
    hint: "Korean mobile number, digits with or without hyphens.",
    inputMode: "tel",
  },
];

// Hi-Fi 1b / 1d / 2g–2k
const COPY = {
  create: {
    submit: "Issue invitation",
    busy: "Issuing invitation…",
    fixHint: "Fix the fields marked below, then issue the invitation again.",
    failedTitle: "The invitation could not be issued",
    failedPrefix: "Nothing was sent to the doctor. ",
  },
  edit: {
    submit: "Save changes",
    busy: "Saving…",
    fixHint: "Fix the fields marked below, then save again.",
    failedTitle: "The changes could not be saved",
    failedPrefix: "Nothing was changed. ",
  },
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
  const copy = COPY[mode];

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

  const invalidCount = FIELDS.filter(({ name }) => errorFor(name)).length;

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
    <form className="invitation-form" noValidate onSubmit={handleSubmit} aria-busy={isSubmitting}>
      {/* Hi-Fi 2g / 2j: how many fields still need fixing */}
      {invalidCount > 0 && (
        <FormBanner
          title={`${invalidCount} ${invalidCount === 1 ? "field needs" : "fields need"} attention`}
          message={copy.fixHint}
        />
      )}

      {/* Hi-Fi 2i: errors that belong to no single field (server down, server error, status changed) */}
      {submitError && !hasServerFieldErrors && (
        <FormBanner title={copy.failedTitle} message={`${copy.failedPrefix}${submitError.message}`} />
      )}

      <div className="invitation-form-card">
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

        {mode === "create" ? (
          <>
            <div className="invitation-form-info">
              <Info className="icon-md" aria-hidden />
              <div>
                <p className="invitation-form-info-title">Validity period to be confirmed</p>
                <p className="invitation-form-info-text">
                  The invitation is a single link for this doctor only. It works once and expires when the validity
                  period ends. The link carries no personal information.
                </p>
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-lg invitation-form-submit" disabled={!canSubmit}>
              {isSubmitting ? <CircleNotch aria-hidden /> : <PaperPlaneTilt aria-hidden />}
              {isSubmitting ? copy.busy : copy.submit}
            </button>
          </>
        ) : (
          <div className="invitation-form-actions">
            {cancelHref && (
              <Link href={cancelHref} className="btn btn-secondary btn-lg">
                Cancel
              </Link>
            )}
            <button type="submit" className="btn btn-primary btn-lg" disabled={!canSubmit}>
              {isSubmitting ? <CircleNotch aria-hidden /> : <FloppyDisk aria-hidden />}
              {isSubmitting ? copy.busy : copy.submit}
            </button>
          </div>
        )}
      </div>
    </form>
  );
}

interface FormBannerProps {
  title: string;
  message: string;
}

// Red box above the form card; announced when it appears
function FormBanner({ title, message }: FormBannerProps) {
  return (
    <div className="invitation-form-banner" role="alert">
      <WarningCircle className="icon-md" aria-hidden />
      <div>
        <p className="invitation-form-banner-title">{title}</p>
        <p className="invitation-form-banner-text">{message}</p>
      </div>
    </div>
  );
}

interface FormFieldProps {
  config: FieldConfig;
  value: string;
  error: string | undefined;
  inputRef: (element: HTMLInputElement | null) => void;
  onChange: (value: string) => void;
}

// Label above, input, hint, then the error in words (linked with aria-describedby)
function FormField({ config, value, error, inputRef, onChange }: FormFieldProps) {
  const inputId = useId();
  const hintId = useId();
  const errorId = useId();
  const showHint = Boolean(config.hint) && !error; // Hi-Fi 2g: the error replaces the hint
  const describedBy = error ? errorId : showHint ? hintId : undefined;

  return (
    <div className={error ? "invitation-form-field is-invalid" : "invitation-form-field"}>
      <label htmlFor={inputId} className="invitation-form-label">
        {config.label} <span className="invitation-form-required">Required</span>
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
        aria-required="true"
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        onChange={(event) => onChange(event.target.value)}
      />
      {error && (
        <span id={errorId} className="invitation-form-field-error">
          <WarningCircle className="icon-sm" aria-hidden />
          <span className="visually-hidden">Error: </span>
          {error}
        </span>
      )}
      {showHint && (
        <span id={hintId} className="invitation-form-hint">
          {config.hint}
        </span>
      )}
    </div>
  );
}
