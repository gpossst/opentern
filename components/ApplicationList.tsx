import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { X, Link as LinkIcon, Search } from "lucide-react";
import Link from "next/link";
import { statusUnion } from "@/convex/unions";
import { Infer } from "convex/values";
import { useEffect, useState, useMemo, memo, useCallback, useRef } from "react";
import Fuse from "fuse.js";
import { useVirtualizer } from "@tanstack/react-virtual";

// Utility function for status colors - defined outside component to avoid recreation
const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    offered: "bg-success",
    rejected: "bg-error",
    interviewed: "bg-info",
    assessment: "bg-warning",
    applied: "bg-primary",
    interested: "bg-accent",
  };
  return colorMap[status] || "bg-none";
};

const getStatusButtonClass = (status: string) => {
  const buttonMap: Record<string, string> = {
    offered: "btn-success",
    rejected: "btn-error",
    interviewed: "btn-info",
    assessment: "btn-warning",
    applied: "btn-primary",
    interested: "btn-accent",
  };
  return buttonMap[status] || "bg-none";
};

export default function ApplicationList() {
  const applications = useQuery(api.applications.getApplications);
  const [searchQuery, setSearchQuery] = useState("");
  const parentRef = useRef<HTMLDivElement>(null);

  // Memoize filtered applications to avoid recalculating on every render
  const filteredApplications = useMemo(() => {
    if (!applications || !searchQuery.trim()) return applications || [];

    const fuse = new Fuse(applications ?? [], {
      keys: ["company", "title"],
      threshold: 0.3,
    });

    const results = fuse.search(searchQuery);
    return results.map((result) => result.item);
  }, [applications, searchQuery]);

  const virtualizer = useVirtualizer({
    count: filteredApplications.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100, // Estimated height of each application item
    overscan: 5, // Number of items to render outside the visible area
  });

  return (
    <div>
      <ApplicationFilter
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <div
        ref={parentRef}
        className="h-[600px] overflow-auto bg-base-100 rounded-box shadow-md"
        style={{
          contain: "strict",
        }}
      >
        {filteredApplications.length === 0 ? (
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
                  }}
                >
                  <ApplicationListItem application={application} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const ApplicationListItem = memo(function ApplicationListItem({
  application,
}: {
  application: Doc<"applications">;
}) {
  return (
    <div>
      <div className="p-4 hover:bg-base-200 transition-colors flex flex-row justify-between items-center border-b border-base-300">
        <div
          className="flex items-center gap-2 flex-1 my-1 cursor-pointer"
          onClick={() => {
            const modal = document?.getElementById(
              application._id.toString(),
            ) as HTMLDialogElement | null;
            console.log(modal);
            modal?.showModal?.();
          }}
        >
          <div className="font-semibold">{application.company}</div>
          <div className="text-sm opacity-70">{application.title}</div>
        </div>
        <StatusDropdown application={application} />
      </div>
      <dialog id={application._id.toString()} className="modal">
        <div className="modal-box min-w-5xl bg-base-300">
          <div className="flex flex-row justify-between items-center">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg">{application.company}</h3>
              <p className=" text-sm opacity-70">{application.title}</p>
              {application.link && (
                <Link
                  href={application.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-square btn-xs btn-info"
                >
                  <LinkIcon className="w-4 h-4" />
                </Link>
              )}
            </div>
            <form method="dialog" className="">
              <button className="btn btn-square btn-sm btn-error">
                <X className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div className="flex gap-4 pt-4">
            <div className="flex flex-col gap-2 flex-[6]">
              <h4 className="font-semibold text-base mb-4">Notes</h4>
              <p className="text-sm opacity-70">
                {application.notes || "No notes"}
              </p>
            </div>
            <div className="flex-[1]">
              <h4 className="font-semibold text-base mb-4">Status</h4>
              <div className="join join-vertical w-full">
                {application.history && application.history.length > 0 ? (
                  <>
                    <div className="join-item">
                      <div className="flex items-center gap-3 p-3 bg-primary text-primary-content rounded-lg">
                        <div
                          className={`w-3 h-3 rounded-full flex-shrink-0 ${getStatusColor(application.status)}`}
                        ></div>
                        <div className="flex-1">
                          <div className="font-medium">
                            {application.status.charAt(0).toUpperCase() +
                              application.status.slice(1)}
                          </div>
                          <div className="text-xs opacity-70">
                            {new Date(
                              application.lastUpdated ?? Date.now(),
                            ).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    {application.history
                      .sort((a, b) => b.date - a.date) // Sort by most recent first
                      .map((entry, index) => (
                        <div key={index} className="join-item">
                          <div className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
                            <div
                              className={`w-3 h-3 rounded-full flex-shrink-0 ${getStatusColor(entry.status)}`}
                            ></div>
                            <div className="flex-1">
                              <div className="font-medium">
                                {entry.status.charAt(0).toUpperCase() +
                                  entry.status.slice(1)}
                              </div>
                              <div className="text-xs opacity-70">
                                {new Date(entry.date).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </>
                ) : (
                  <div className="join-item">
                    <div className="flex items-center gap-3 p-3 bg-primary text-primary-content rounded-lg">
                      <div
                        className={`w-3 h-3 rounded-full flex-shrink-0 ${getStatusColor(application.status)}`}
                      ></div>
                      <div className="flex-1">
                        <div className="font-medium">
                          {application.status.charAt(0).toUpperCase() +
                            application.status.slice(1)}
                        </div>
                        <div className="text-xs opacity-70">
                          {new Date(
                            application.lastUpdated ?? Date.now(),
                          ).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
});

const StatusDropdown = memo(function StatusDropdown({
  application,
}: {
  application: Doc<"applications">;
}) {
  const updateStatus = useMutation(api.applications.updateStatus);

  const handleUpdateStatus = useCallback(
    (status: Infer<typeof statusUnion>) => {
      if (status === application.status) {
        return;
      }
      updateStatus({ id: application._id, status });
    },
    [updateStatus, application._id, application.status],
  );

  return (
    <div className="dropdown dropdown-bottom dropdown-center">
      <div
        tabIndex={0}
        role="button"
        className={`btn m-1 ${getStatusButtonClass(application.status)}`}
      >
        {application.status.charAt(0).toUpperCase() +
          application.status.slice(1)}
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm"
      >
        <li>
          <a onClick={() => handleUpdateStatus("interested")}>Interested</a>
        </li>
        <li>
          <a onClick={() => handleUpdateStatus("applied")}>Applied</a>
        </li>
        <li>
          <a onClick={() => handleUpdateStatus("assessment")}>Assessment</a>
        </li>
        <li>
          <a onClick={() => handleUpdateStatus("interviewed")}>Interviewed</a>
        </li>
        <li>
          <a onClick={() => handleUpdateStatus("offered")}>Offered</a>
        </li>
        <li>
          <a onClick={() => handleUpdateStatus("rejected")}>Rejected</a>
        </li>
        <li>
          <a onClick={() => handleUpdateStatus("archived")}>Archived</a>
        </li>
      </ul>
    </div>
  );
});

const ApplicationFilter = memo(function ApplicationFilter({
  searchQuery,
  setSearchQuery,
}: {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}) {
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    [setSearchQuery],
  );

  return (
    <div>
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
