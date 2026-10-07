import axios, { isAxiosError } from "axios";
import { API_REQUEST_TIMEOUT_MS } from "@/constants/invitation";
import type { InvitationField, InvitationFieldErrors } from "@/types/invitation";
import { API_BASE_URL } from "@/utils/api-integration";

// One axios instance for the whole app
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_REQUEST_TIMEOUT_MS,
  headers: { "Content-Type": "application/json" },
});

// The API's error body (RFC 7807 ProblemDetail, see the backend ApiExceptionHandler)
interface ProblemBody {
  status: number;
  code: string;
  detail: string;
  errors?: { field: string; message: string }[];
}

// Plain-language messages for when there is no usable answer from the API
export const NETWORK_ERROR_MESSAGE = "We can't reach the server. Check your connection and try again.";
export const UNKNOWN_ERROR_MESSAGE = "Something went wrong on our side. Please try again in a moment.";

/**
 * Every failed request becomes an ApiError. message is always safe to show:
 * either the API's own plain-language "detail", or one of the messages above. Never raw error text.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number | null, // null = no answer (offline, server down, timeout)
    readonly code: string | null,
    readonly fieldErrors: InvitationFieldErrors = {},
  ) {
    super(message);
    this.name = "ApiError";
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }
}

const FORM_FIELDS: InvitationField[] = ["doctorName", "email", "mobile"];

function isProblemBody(data: unknown): data is ProblemBody {
  return typeof data === "object" && data !== null && "code" in data && "detail" in data;
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (!isAxiosError(error) || !error.response) {
    return new ApiError(NETWORK_ERROR_MESSAGE, null, null);
  }

  const { status, data } = error.response;
  if (!isProblemBody(data)) return new ApiError(UNKNOWN_ERROR_MESSAGE, status, null);

  // Keep only messages for fields the form has (ignores e.g. "page" from the list)
  const fieldErrors: InvitationFieldErrors = {};
  for (const { field, message } of data.errors ?? []) {
    if (FORM_FIELDS.includes(field as InvitationField)) fieldErrors[field as InvitationField] = message;
  }
  return new ApiError(data.detail, status, data.code, fieldErrors);
}

// Runs a request and turns any failure into an ApiError
export async function request<T>(call: Promise<{ data: T }>): Promise<T> {
  try {
    const response = await call;
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
}
