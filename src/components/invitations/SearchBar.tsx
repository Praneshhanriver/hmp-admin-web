"use client";

import { useId, useState } from "react";
import type { FormEvent } from "react";
import { CaretDown, MagnifyingGlass } from "@phosphor-icons/react";
import { SEARCH_MAX_LENGTH, STATUS_FILTER_OPTIONS } from "@/constants/invitation";
import type { InvitationFilters, StatusFilter } from "@/types/invitation";

interface SearchBarProps {
  initialFilters: InvitationFilters;
  onSearch: (filters: InvitationFilters) => void;
}

// Search text + Status filter. Results change only when Search is pressed
export default function SearchBar({ initialFilters, onSearch }: SearchBarProps) {
  const [query, setQuery] = useState(initialFilters.query);
  const [status, setStatus] = useState<StatusFilter>(initialFilters.status);
  const queryId = useId();
  const statusId = useId();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); // stop the browser from reloading the page
    onSearch({ query, status });
  }

  return (
    <form className="search-bar" role="search" aria-label="Search invitations" onSubmit={handleSubmit}>
      <div className="search-bar-field search-bar-field-query">
        <label htmlFor={queryId}>Search by doctor name or contact</label>
        <div className="search-bar-control">
          <MagnifyingGlass className="search-bar-icon icon-md" aria-hidden />
          <input
            id={queryId}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            maxLength={SEARCH_MAX_LENGTH}
            placeholder="e.g. Kim Han-mi or 5678"
          />
        </div>
      </div>

      <div className="search-bar-field search-bar-field-status">
        <label htmlFor={statusId}>Status</label>
        <div className="search-bar-control">
          <select
            id={statusId}
            value={status}
            onChange={(event) => setStatus(event.target.value as StatusFilter)}
          >
            {STATUS_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <CaretDown className="search-bar-caret icon-sm" aria-hidden />
        </div>
      </div>

      <button type="submit" className="btn btn-primary search-bar-submit">
        Search
      </button>
    </form>
  );
}