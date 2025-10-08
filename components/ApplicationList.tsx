import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import StatusDropdown from "./StatusDropdown";
import { Search, ClipboardPaste, ExternalLink, Plus } from "lucide-react";
import { useState, useMemo, memo, useCallback, useRef } from "react";
import Fuse from "fuse.js";
import { useVirtualizer } from "@tanstack/react-virtual";
import { z } from "zod";
import { ApplicationSkeletonLoader } from "./SkeletonLoader";
import ApplicationPopover from "./ApplicationPopover";

// Zod schema for validating application form input
const formInfoSchema = z.object({
  company: z.string(),
  title: z.string(),
  link: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        // If it already has a protocol, validate as-is
        if (val.startsWith("http://") || val.startsWith("https://")) {
          try {
            new URL(val);
            return true;
          } catch {
            return false;
          }
        }
        // If no protocol, add https:// and validate
        try {
          new URL(`https://${val}`);
          return true;
        } catch {
          return false;
        }
      },
      {
        message: "Must be a valid URL (protocol optional)",
      },
    ),
});

/**
 * ApplicationList component - displays and manages user's internship applications.
 *
 * Features:
 * - Virtualized list for performance with large datasets
 * - Real-time search with fuzzy matching
 * - Application creation form with validation
 * - Status management and editing
 * - Modal popover for detailed view
 *
 * @returns {JSX.Element} Complete application management interface
 */
export default function ApplicationList() {
  // Fetch applications from Convex database
  const applications = useQuery(api.applications.getApplications);
  // Search query state for filtering applications
  const [searchQuery, setSearchQuery] = useState("");
  // Ref for the scrollable container
  const parentRef = useRef<HTMLDivElement>(null);

  // Memoized filtered applications using Fuse.js for fuzzy search
  const filteredApplications = useMemo(() => {
    if (!applications || !searchQuery.trim()) return applications || [];

    const fuse = new Fuse(applications ?? [], {
      keys: ["company", "title"],
      threshold: 0.3,
    });

    const results = fuse.search(searchQuery);
    return results.map((result) => result.item);
  }, [applications, searchQuery]);

  // Virtualizer for efficient rendering of large lists
  const virtualizer = useVirtualizer({
    count: filteredApplications.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60, // Match the actual item height
    overscan: 5, // Number of items to render outside the visible area
  });

  return (
    <div className="flex gap-4 pr-4">
      {/* Search filter component */}
      <ApplicationFilter
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <div className="flex flex-col gap-2 w-full">
        <h2 className="text-lg font-semibold">Applications</h2>
        {/* Form for creating new applications */}
        <ApplicationInput />
        {/* Virtualized list container */}
        <div
          ref={parentRef}
          className="h-[40.5rem] overflow-auto bg-base-100 rounded-box shadow-md"
          style={{
            contain: "strict",
          }}
        >
          {applications === undefined ? (
            // Show skeleton loader while data is loading
            <ApplicationSkeletonLoader count={20} height={60} />
          ) : filteredApplications.length === 0 ? (
            // Show message when no results found
            <div className="p-4 text-center max-w-sm mx-auto text-secondary-content h-full flex justify-center items-center">
              You haven't listed any applications yet! Switch to the
              opportunities view to find some, or import existing ones from the
              sidebar.
            </div>
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
                const application = filteredApplications[virtualItem.index];
                return (
                  <div
                    key={application._id.toString()}
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
                      <ApplicationListItem application={application} />
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
 * ApplicationListItem component - renders individual application cards in the list.
 *
 * Features:
 * - Click to open detailed modal
 * - Status dropdown for quick updates
 * - External link access
 * - Delete functionality
 *
 * @param application - The application data to display
 * @returns {JSX.Element} Individual application list item
 */
const ApplicationListItem = memo(function ApplicationListItem({
  application,
}: {
  application: Doc<"applications">;
}) {
  // Mutation for deleting applications
  const deleteApplication = useMutation(api.applications.deleteApplication);

  // Handle application deletion
  const handleDeleteApplication = () => {
    deleteApplication({ id: application._id });
  };

  return (
    <div className="relative">
      {/* Clickable application card */}
      <div
        onClick={(e) => {
          // Prevent modal opening when clicking dropdown buttons
          const isDropdownClick =
            e.target instanceof Element &&
            (e.target.closest(".dropdown") ||
              e.target.closest('[role="button"]'));

          if (!isDropdownClick) {
            const modal = document?.getElementById(
              application._id.toString(),
            ) as HTMLDialogElement | null;
            modal?.showModal?.();
          }
        }}
        className="p-4 cursor-pointer rounded-md hover:bg-base-200 transition-colors flex flex-row justify-between items-center min-h-[60px]"
      >
        {/* Company and title information */}
        <div className="flex items-center gap-2 flex-1 my-1 cursor-pointer">
          <div className="font-semibold">{application.company}</div>
          <div className="text-sm opacity-70">{application.title}</div>
        </div>
        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* External link button if available */}
          {application.link && (
            <button
              className="btn btn-square btn-sm btn-info btn-soft"
              onClick={() => window.open(application.link, "_blank")}
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          )}
          {/* Status dropdown for quick updates */}
          <StatusDropdown application={application} />
        </div>
      </div>
      {/* Modal popover for detailed view */}
      <ApplicationPopover
        application={application}
        handleDeleteApplication={handleDeleteApplication}
      />
    </div>
  );
});

/**
 * ApplicationFilter component - provides search functionality for applications.
 *
 * @param searchQuery - Current search query string
 * @param setSearchQuery - Function to update search query
 * @returns {JSX.Element} Search input component
 */
const ApplicationFilter = memo(function ApplicationFilter({
  searchQuery,
  setSearchQuery,
}: {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}) {
  // Handle search input changes
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    [setSearchQuery],
  );

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold">Filter</h2>
      <label htmlFor="search" className="input input-bordered w-full">
        <Search className="w-4 h-4" />
        <input
          type="text"
          placeholder="Search"
          id="search"
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </label>
    </div>
  );
});

/**
 * ApplicationInput component - form for creating new applications.
 *
 * Features:
 * - Dynamic input sizing on focus
 * - URL validation with optional protocol
 * - Clipboard paste functionality
 * - Form validation with error handling
 *
 * @returns {JSX.Element} Application creation form
 */
function ApplicationInput() {
  // State for dynamic input sizing
  const [hovered, setHovered] = useState("");
  // Error state for form validation
  // Mutation for creating new applications
  const createApplication = useMutation(api.applications.createApplication);

  // Form data state
  const [formInfo, setFormInfo] = useState<z.infer<typeof formInfoSchema>>({
    company: "",
    title: "",
    link: "",
  });

  const handleSubmit = async () => {
    let parsed;

    try {
      parsed = formInfoSchema.parse(formInfo);
    } catch {
      return;
    }

    await createApplication({
      ...parsed,
    });
    setFormInfo({
      company: "",
      title: "",
      link: "",
    });
  };

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormInfo((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handlePaste = () => {
    navigator.clipboard.readText().then((text) => {
      setFormInfo({ ...formInfo, link: text });
    });
  };

  return (
    <div className="flex flex-col bg-base-200 rounded-md p-2 w-full">
      <div className="flex gap-2 w-full">
        <label
          className={`input  transition-all duration-300 ${hovered === "company" ? "flex-[5]" : "flex-1"}`}
          onFocus={() => setHovered("company")}
          onBlur={() => setHovered("")}
        >
          <span className="label">Company</span>
          <input
            type="text"
            name="company"
            placeholder=""
            value={formInfo.company}
            onChange={handleChange}
          />
        </label>
        <label
          className={`input transition-all duration-300 ${hovered === "title" ? "flex-[5]" : "flex-1"}`}
          onFocus={() => setHovered("title")}
          onBlur={() => setHovered("")}
        >
          <span className="label">Title</span>
          <input
            type="text"
            name="title"
            placeholder=""
            value={formInfo.title}
            onChange={handleChange}
          />
        </label>
        <label
          className={`input transition-all duration-300 ${hovered === "link" ? "flex-[5]" : "flex-1"}`}
          onFocus={() => setHovered("link")}
          onBlur={() => setHovered("")}
        >
          <span className="label">Link</span>
          <input
            type="text"
            name="link"
            placeholder=""
            value={formInfo.link}
            onChange={handleChange}
          />
          <button className="btn btn-square h-6 w-6" onClick={handlePaste}>
            <ClipboardPaste className="w-4 h-4" />
          </button>
        </label>
        <button
          className="btn btn-primary btn-square btn-soft"
          onClick={handleSubmit}
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
