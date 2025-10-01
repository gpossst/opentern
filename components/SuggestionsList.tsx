import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useMutation, usePaginatedQuery, useQuery } from "convex/react";
import React, { useCallback, useRef, useEffect, memo, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { PinIcon, LinkIcon, Plus, Search, Github, Check } from "lucide-react";
import Link from "next/link";
import { SkeletonLoader } from "./SkeletonLoader";

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

export default function SuggestionsList() {
  const suggestedApplications = useQuery(
    api.applications.getSuggestedApplications,
  );
  const [filterOptions, setFilterOptions] = useState({
    search: "",
    company: [] as string[],
    source: "",
  });
  const parentRef = useRef<HTMLDivElement>(null);

  const { results, status, loadMore } = usePaginatedQuery(
    api.suggestions.getSuggestions,
    filterOptions,
    { initialNumItems: 40 },
  );

  const virtualizer = useVirtualizer({
    count: results.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60, // Match the actual item height
    overscan: 5, // Number of items to render outside the visible area
  });

  const handleLoadMore = useCallback(() => {
    if (status === "CanLoadMore") {
      loadMore(20);
    }
  }, [status, loadMore]);

  // Load more when user scrolls near the bottom
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
      <SuggestionsFilter
        filterOptions={filterOptions}
        setFilterOptions={setFilterOptions}
      />
      <div className="flex flex-col gap-4 w-full">
        <h2 className="text-lg font-semibold">Suggestions</h2>
        <div
          ref={parentRef}
          className="h-[42rem] overflow-auto bg-base-100 rounded-box shadow-md"
          style={{
            contain: "strict",
          }}
        >
          {status === "LoadingFirstPage" ? (
            <SkeletonLoader count={20} height={60} />
          ) : results.length === 0 ? (
            <div className="p-4 text-center">No results found</div>
          ) : (
            <div
              style={{
                height: `${virtualizer.getTotalSize()}px`,
                width: "100%",
                position: "relative",
              }}
            >
              {virtualizer.getVirtualItems().map((virtualItem) => {
                const suggestion = results[virtualItem.index];
                return (
                  <div
                    key={suggestion._id}
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
                        suggestion={suggestion}
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

function SuggestionListItem({
  suggestion,
  suggestedApplications,
}: {
  suggestion: Doc<"suggestions">;
  suggestedApplications: string[];
}) {
  const addApplication = useMutation(
    api.suggestions.addSuggestionToApplications,
  );

  const handleAddApplication = () => {
    if (suggestedApplications.includes(suggestion._id)) {
      return;
    }
    console.log("Adding application", suggestion._id, suggestedApplications);
    addApplication({ suggestionId: suggestion._id });
  };

  const handleOpenJobDescription = () => {
    window.open(suggestion.link, "_blank");
  };

  return (
    <div className="relative">
      <div
        onClick={handleOpenJobDescription}
        className="p-4 cursor-pointer rounded-md hover:bg-base-200 transition-colors flex flex-row justify-between items-center min-h-[60px]"
      >
        <div className="flex items-center gap-2 flex-1 my-1 cursor-pointer">
          <div className="font-semibold">{suggestion.company}</div>
          <div className="text-sm opacity-70">{suggestion.title}</div>
          {suggestion.location && (
            <div className="text-sm opacity-70">
              {suggestion.location.length < 20 ? (
                `(${suggestion.location})`
              ) : (
                <div
                  className="tooltip tooltip-top"
                  data-tip={suggestion.location}
                >
                  <PinIcon className="w-4 h-4 text-primary" />
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {suggestion.source &&
            repos.find((repo) => repo.owner === suggestion.source) && (
              <Link
                href={`https://github.com/${suggestion.source}/${repos.find((repo) => repo.owner === suggestion.source)?.repo}/`}
                target="_blank"
                className="text-primary btn btn-square btn-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <Github className="w-4 h-4" />
              </Link>
            )}
          <button
            className={`btn btn-square btn-sm ${suggestedApplications.includes(suggestion._id) ? "btn-disabled" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              handleAddApplication();
            }}
          >
            {suggestedApplications.includes(suggestion._id) ? (
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

const SuggestionsFilter = memo(function SuggestionsFilter({
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
  const companies = useQuery(api.suggestions.getCompanies);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [companySearch, setCompanySearch] = useState("");

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFilterOptions({ ...filterOptions, search: e.target.value });
    },
    [setFilterOptions, filterOptions],
  );

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

  const filteredCompanies = companies?.filter((company) =>
    company.toLowerCase().includes(companySearch.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold">Filter</h2>
      <div className="flex-col gap-2">
        <div className="relative flex-1" ref={dropdownRef}>
          <button
            className="btn btn-soft btn-accent border w-full"
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
                {filteredCompanies?.map((company) => (
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
