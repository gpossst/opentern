import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import {
  X,
  Link as LinkIcon,
  Search,
  Check,
  ClipboardPaste,
  ChevronDown,
  Trash,
  ExternalLink,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { statusUnion } from "@/convex/unions";
import { Infer } from "convex/values";
import { useState, useMemo, memo, useCallback, useRef, useEffect } from "react";
import Fuse from "fuse.js";
import { useVirtualizer } from "@tanstack/react-virtual";
import { z } from "zod";
import { ApplicationSkeletonLoader } from "./SkeletonLoader";
import SortableList from "./SortableList";

function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

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
    estimateSize: () => 60, // Match the actual item height
    overscan: 5, // Number of items to render outside the visible area
  });

  return (
    <div className="flex gap-4 pr-4">
      <ApplicationFilter
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <div className="flex flex-col gap-2 w-full">
        <h2 className="text-lg font-semibold">Applications</h2>
        <ApplicationInput />
        <div
          ref={parentRef}
          className="h-[40.5rem] overflow-auto bg-base-100 rounded-box shadow-md"
          style={{
            contain: "strict",
          }}
        >
          {applications === undefined ? (
            <ApplicationSkeletonLoader count={20} height={60} />
          ) : filteredApplications.length === 0 ? (
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

const ApplicationListItem = memo(function ApplicationListItem({
  application,
}: {
  application: Doc<"applications">;
}) {
  const deleteApplication = useMutation(api.applications.deleteApplication);

  const handleDeleteApplication = () => {
    deleteApplication({ id: application._id });
  };

  return (
    <div className="relative">
      <div
        onClick={(e) => {
          // Check if the click target is within a dropdown
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
        <div className="flex items-center gap-2 flex-1 my-1 cursor-pointer">
          <div className="font-semibold">{application.company}</div>
          <div className="text-sm opacity-70">{application.title}</div>
        </div>
        <div className="flex items-center gap-2">
          {application.link && (
            <button
              className="btn btn-square btn-sm btn-info btn-soft"
              onClick={() => window.open(application.link, "_blank")}
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          )}
          <StatusDropdown application={application} />
        </div>
      </div>
      <ApplicationPopover
        application={application}
        handleDeleteApplication={handleDeleteApplication}
      />
    </div>
  );
});

const StatusDropdown = memo(function StatusDropdown({
  application,
  size,
}: {
  application: Doc<"applications">;
  size?: "sm";
}) {
  const updateStatus = useMutation(api.applications.updateStatus);
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    width: number;
  }>({ top: 0, left: 0, width: 0 });
  const [portalRoot, setPortalRoot] = useState<Element | null>(null);

  const updateCoords = useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) {
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, []);
  const statuses = [
    "interested",
    "applied",
    "assessment",
    "interviewed",
    "offered",
    "rejected",
    "archived",
  ];

  const handleUpdateStatus = useCallback(
    (status: Infer<typeof statusUnion>) => {
      if (status === application.status) {
        return;
      }
      updateStatus({ id: application._id, status });
      setOpen(false);
    },
    [updateStatus, application._id, application.status],
  );

  const toggleOpen = useCallback(() => {
    setOpen((prev) => {
      if (!prev) {
        // Only update coords and portal root when opening
        updateCoords();
        const root =
          (triggerRef.current?.closest("dialog") as Element | null) ||
          document.body;
        setPortalRoot(root);
      }
      return !prev;
    });
  }, [updateCoords]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current && triggerRef.current.contains(target)) {
        return;
      }
      if (menuRef.current && menuRef.current.contains(target)) {
        return;
      }
      setOpen(false);
    };
    const handleScrollResize = () => setOpen(false);
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScrollResize, true);
    window.addEventListener("resize", handleScrollResize);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScrollResize, true);
      window.removeEventListener("resize", handleScrollResize);
    };
  }, [open]);

  return (
    <div className="relative">
      {size !== "sm" ? (
        <div
          ref={triggerRef}
          tabIndex={0}
          role="button"
          className={`btn btn-sm ${getStatusButtonClass(application.status)}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleOpen();
          }}
        >
          {application.status.charAt(0).toUpperCase() +
            application.status.slice(1)}
          <ChevronDown className="w-4 h-4" />
        </div>
      ) : (
        <div
          ref={triggerRef}
          tabIndex={0}
          role="button"
          className={`btn btn-square btn-xs btn-primary`}
          onClick={(e) => {
            e.stopPropagation();
            toggleOpen();
          }}
        >
          <Plus className="w-4 h-4" />
        </div>
      )}
      {open &&
        portalRoot &&
        createPortal(
          <ul
            ref={menuRef}
            className="menu bg-base-100 rounded-box w-52 p-2 shadow-sm"
            style={{
              position: "fixed",
              top: coords.top,
              left: coords.left,
              zIndex: 2147483000,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {statuses
              .filter((status) => status !== application.status)
              .map((status) => (
                <li key={status}>
                  <a
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdateStatus(status as Infer<typeof statusUnion>);
                    }}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </a>
                </li>
              ))}
          </ul>,
          portalRoot,
        )}
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

function ApplicationInput() {
  const [hovered, setHovered] = useState("");
  const [error, setError] = useState<string | null>(null);
  const createApplication = useMutation(api.applications.createApplication);

  const [formInfo, setFormInfo] = useState<z.infer<typeof formInfoSchema>>({
    company: "",
    title: "",
    link: "",
  });

  const handleSubmit = async () => {
    let parsed;
    setError(null);

    try {
      parsed = formInfoSchema.parse(formInfo);
    } catch (error) {
      setError("Invalid form info");
      return;
    }

    await createApplication({
      ...parsed,
    });
    setError(null);
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

function ApplicationPopover({
  application,
  handleDeleteApplication,
}: {
  application: Doc<"applications">;
  handleDeleteApplication: () => void;
}) {
  const updateApplication = useMutation(api.applications.updateApplication);
  const [localNotes, setLocalNotes] = useState(application.notes || "");

  // Update local state when application data changes
  useEffect(() => {
    setLocalNotes(application.notes || "");
  }, [application.notes]);

  // Debounced update function
  const debouncedUpdate = useMemo(
    () =>
      debounce(
        async (
          notes?: string | undefined,
          link?: string | undefined,
          company?: string | undefined,
          title?: string | undefined,
        ) => {
          const updateData: any = {};
          if (notes !== undefined) updateData.notes = notes;
          if (link !== undefined) updateData.link = link;
          if (company !== undefined) updateData.company = company;
          if (title !== undefined) updateData.title = title;
          await updateApplication({
            id: application._id,
            ...updateData,
          });
        },
        500,
      ),
    [updateApplication, application._id],
  );

  const handleNotesChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setLocalNotes(value);
      debouncedUpdate(value, undefined, undefined, undefined);
    },
    [debouncedUpdate],
  );

  return (
    <dialog id={application._id.toString()} className="modal">
      <div className="modal-box min-w-5xl bg-base-300 max-h-[90vh] overflow-y-auto scrollbar-hide min-h-2/3 flex flex-col">
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
          <form method="dialog" className="flex gap-2">
            <button
              className="btn btn-square btn-sm btn-error btn-soft"
              onClick={handleDeleteApplication}
            >
              <Trash className="w-4 h-4" />
            </button>
            <button className="btn btn-square btn-sm btn-accent">
              <X className="w-4 h-4" />
            </button>
          </form>
        </div>

        <div className="flex gap-4 pt-4 flex-1 min-h-0">
          <div className="flex flex-col gap-4 flex-[6] min-h-0">
            <h4 className="font-semibold text-base">Notes</h4>
            <textarea
              className="textarea w-full flex-1 resize-none"
              value={localNotes}
              onChange={handleNotesChange}
              placeholder="No notes yet"
            >
              {localNotes}
            </textarea>
          </div>

          <div className="flex-[1] flex flex-col">
            <div className="flex justify-between items-start">
              <h4 className="font-semibold text-base mb-4">Status</h4>
              <StatusDropdown application={application} size="sm" />
            </div>
            <div className="join join-vertical w-full">
              <SortableList
                list={[application.status, ...(application.history || [])]}
                id={application._id}
              />
            </div>
          </div>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}
