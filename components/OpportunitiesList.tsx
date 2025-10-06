import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useMutation, usePaginatedQuery, useQuery } from "convex/react";
import React, { useCallback, useRef, useEffect, memo, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { PinIcon, Plus, Search, Github, Check } from "lucide-react";
import Link from "next/link";
import { SkeletonLoader } from "./SkeletonLoader";

// GitHub repositories that contain internship opportunity data
const repos: { owner: string; repo: string; path: string }[] = [
  {
    owner: "vanshb03",
    repo: "Summer2026-Internships",
    path: "README.md",
  },
  {
    owner: "SimplifyJobs",
    repo: "Summer2026-Internships",
    path: "README.md",
  },
];

/**
 * OpportunitiesList component - displays and manages internship opportunities from GitHub repositories.
 *
 * Features:
 * - Paginated data loading for performance
 * - Virtualized list rendering for large datasets
 * - Real-time filtering by company and search terms
 * - Auto-scroll loading when reaching bottom
 * - One-click application creation from opportunities
 * - GitHub source links for each opportunity
 *
 * @returns {JSX.Element} Complete opportunities management interface
 */
export default function OpportunitiesList() {
  // Get applications that have been suggested from opportunities
  const suggestedApplications = useQuery(
    api.applications.getSuggestedApplications,
  );
  // Filter state for search and company filtering
  const [filterOptions, setFilterOptions] = useState({
    search: "",
    company: [] as string[],
    source: "",
  });
  // Ref for the scrollable container
  const parentRef = useRef<HTMLDivElement>(null);

  // Paginated query for opportunities with filtering
  const { results, status, loadMore } = usePaginatedQuery(
    api.opportunities.getOpportunities,
    filterOptions,
    { initialNumItems: 40 },
  );

  // Virtualizer for efficient rendering of large lists
  const virtualizer = useVirtualizer({
    count: results.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60, // Match the actual item height
    overscan: 5, // Number of items to render outside the visible area
  });

  // Handle loading more opportunities when pagination is available
  const handleLoadMore = useCallback(() => {
    if (status === "CanLoadMore") {
      loadMore(20);
    }
  }, [status, loadMore]);

  // Auto-load more opportunities when user scrolls near the bottom
  useEffect(() => {
    const scrollElement = parentRef.current;
    if (!scrollElement || status !== "CanLoadMore") return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollElement;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100; // 100px threshold

      if (isNearBottom) {
        handleLoadMore();
      }
    };

    scrollElement.addEventListener("scroll", handleScroll);
    return () => scrollElement.removeEventListener("scroll", handleScroll);
  }, [status, handleLoadMore]);

  return (
    <div className="flex gap-4 pr-4">
      {/* Filter component for search and company filtering */}
      <OpportunitiesFilter
        filterOptions={filterOptions}
        setFilterOptions={setFilterOptions}
      />
      <div className="flex flex-col gap-2 w-full">
        <h2 className="text-lg font-semibold">Opportunities</h2>
        {/* Virtualized list container */}
        <div
          ref={parentRef}
          className="h-[44.5rem] overflow-auto bg-base-100 rounded-box shadow-md"
          style={{
            contain: "strict",
          }}
        >
          {status === "LoadingFirstPage" ? (
            // Show skeleton loader while initial data loads
            <SkeletonLoader count={20} height={60} />
          ) : results.length === 0 ? (
            // Show message when no results found
            <div className="p-4 text-center">No results found</div>
          ) : (
            // Virtualized list rendering
            <div
              style={{
                height: `${virtualizer.getTotalSize()}px`,
                width: "100%",
                position: "relative",
              }}
            >
              {virtualizer.getVirtualItems().map((virtualItem) => {
                const opportunity = results[virtualItem.index];
                return (
                  <div
                    key={opportunity._id}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: `${virtualItem.size}px`,
                      transform: `translateY(${virtualItem.start}px)`,
                      zIndex: 1000 - virtualItem.index, // Higher items get higher z-index
                    }}
                  >
                    <div
                      ref={virtualizer.measureElement}
                      data-index={virtualItem.index}
                    >
                      <SuggestionListItem
                        opportunity={opportunity}
                        suggestedApplications={
                          (suggestedApplications || []) as string[]
                        }
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * SuggestionListItem component - renders individual opportunity cards in the list.
 *
 * Features:
 * - Click to open job description in new tab
 * - One-click application creation from opportunity
 * - GitHub source link for each opportunity
 * - Location display with tooltip for long names
 * - Visual feedback for already added applications
 *
 * @param opportunity - The opportunity data to display
 * @param suggestedApplications - Array of opportunity IDs that have been added as applications
 * @returns {JSX.Element} Individual opportunity list item
 */
function SuggestionListItem({
  opportunity,
  suggestedApplications,
}: {
  opportunity: Doc<"opportunities">;
  suggestedApplications: string[];
}) {
  // Mutation for adding opportunity as application
  const addApplication = useMutation(
    api.opportunities.addSuggestionToApplications,
  );

  // Handle adding opportunity as application
  const handleAddApplication = () => {
    if (suggestedApplications.includes(opportunity._id)) {
      return;
    }
    console.log("Adding application", opportunity._id, suggestedApplications);
    addApplication({ opportunityId: opportunity._id });
  };

  // Handle opening job description in new tab
  const handleOpenJobDescription = () => {
    window.open(opportunity.link, "_blank");
  };

  return (
    <div className="relative">
      {/* Clickable opportunity card */}
      <div
        onClick={handleOpenJobDescription}
        className="p-4 cursor-pointer rounded-md hover:bg-base-200 transition-colors flex flex-row justify-between items-center min-h-[60px]"
      >
        {/* Company, title, and location information */}
        <div className="flex items-center gap-2 flex-1 my-1 cursor-pointer">
          <div className="font-semibold">{opportunity.company}</div>
          <div className="text-sm opacity-70">{opportunity.title}</div>
          {/* Location display with tooltip for long names */}
          {opportunity.location && (
            <div className="text-sm opacity-70">
              {opportunity.location.length < 20 ? (
                `(${opportunity.location})`
              ) : (
                <div
                  className="tooltip tooltip-top"
                  data-tip={opportunity.location}
                >
                  <PinIcon className="w-4 h-4 text-primary" />
                </div>
              )}
            </div>
          )}
        </div>
        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* GitHub source link if available */}
          {opportunity.source &&
            repos.find((repo) => repo.owner === opportunity.source) && (
              <Link
                href={`https://github.com/${opportunity.source}/${repos.find((repo) => repo.owner === opportunity.source)?.repo}/`}
                target="_blank"
                className="text-primary btn btn-square btn-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <Github className="w-4 h-4" />
              </Link>
            )}
          {/* Add to applications button */}
          <button
            className={`btn btn-square btn-sm ${suggestedApplications.includes(opportunity._id) ? "btn-disabled" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              handleAddApplication();
            }}
          >
            {suggestedApplications.includes(opportunity._id) ? (
              <Check className="w-4 h-4" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * OpportunitiesFilter component - provides filtering functionality for opportunities.
 *
 * Features:
 * - Company multi-select dropdown with search
 * - Title search functionality
 * - Click outside to close dropdown
 * - Real-time filtering
 *
 * @param filterOptions - Current filter state
 * @param setFilterOptions - Function to update filter state
 * @returns {JSX.Element} Filter controls component
 */
const OpportunitiesFilter = memo(function OpportunitiesFilter({
  filterOptions,
  setFilterOptions,
}: {
  filterOptions: {
    search: string;
    company: string[];
    source: string;
  };
  setFilterOptions: (filterOptions: {
    search: string;
    company: string[];
    source: string;
  }) => void;
}) {
  // Get list of companies for filtering
  const companies = useQuery(api.opportunities.getCompanies);
  // Ref for dropdown container
  const dropdownRef = useRef<HTMLDivElement>(null);
  // Dropdown open/closed state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  // Company search query for filtering dropdown options
  const [companySearch, setCompanySearch] = useState("");

  // Handle search input changes
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFilterOptions({ ...filterOptions, search: e.target.value });
    },
    [setFilterOptions, filterOptions],
  );

  // Handle company selection/deselection
  const handleCompanySelect = useCallback(
    (company: string) => {
      if (filterOptions.company.includes(company)) {
        setFilterOptions({
          ...filterOptions,
          company: filterOptions.company.filter((c) => c !== company),
        });
      } else {
        setFilterOptions({
          ...filterOptions,
          company: [...filterOptions.company, company],
        });
      }
    },
    [setFilterOptions, filterOptions],
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Filter companies based on search query
  const filteredCompanies = companies?.filter((company: string) =>
    company.toLowerCase().includes(companySearch.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold">Filter</h2>
      <div className="flex-col gap-2">
        <div className="relative flex-1" ref={dropdownRef}>
          <button
            className="btn btn-secondary border w-full"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            Company
          </button>
          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 bg-base-100 rounded-box shadow-lg border border-base-300 z-50 w-[20em] p-2">
              <label
                htmlFor="companySearch"
                className="input input-bordered w-full input-sm"
              >
                <input
                  type="text"
                  placeholder="Search by company"
                  id="companySearch"
                  value={companySearch}
                  onChange={(e) => setCompanySearch(e.target.value)}
                />
              </label>
              <div className="max-h-128 overflow-y-auto p-2 gap-1 flex flex-col">
                {filteredCompanies?.map((company: string) => (
                  <button
                    key={company}
                    className={`w-full flex items-center gap-2 text-wrap btn btn-soft btn-sm justify-start ${filterOptions.company.includes(company) ? "btn-primary" : ""}`}
                    onClick={() => handleCompanySelect(company)}
                  >
                    {company}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <label htmlFor="search" className="input input-bordered flex-1 mt-2">
          <Search className="w-4 h-4" />
          <input
            type="text"
            placeholder="Search by title"
            id="search"
            value={filterOptions.search}
            onChange={handleSearchChange}
          />
        </label>
      </div>
    </div>
  );
});
