import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { Doc } from "@/convex/_generated/dataModel";
import { Infer } from "convex/values";
import { useState, useCallback, useRef, useEffect } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { statusUnion } from "@/convex/unions";
import { getStatusButtonClass } from "@/utils/status";
import { createPortal } from "react-dom";

/**
 * StatusDropdown component - allows users to change application status.
 *
 * Features:
 * - Portal-based dropdown to avoid z-index issues
 * - Dynamic positioning based on trigger element
 * - Click outside to close functionality
 * - Different sizes (normal and small)
 * - Prevents duplicate status selection
 *
 * @param application - The application to update status for
 * @param size - Optional size variant ("sm" for small)
 * @returns {JSX.Element} Status dropdown component
 */
export default function StatusDropdown({
  application,
  size,
}: {
  application: Doc<"applications">;
  size?: "sm";
}) {
  // Mutation for updating application status
  const updateStatus = useMutation(api.applications.updateStatus);
  // Dropdown open/closed state
  const [open, setOpen] = useState(false);
  // Refs for trigger element and dropdown menu
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  // Coordinates for positioning the dropdown
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    width: number;
  }>({ top: 0, left: 0, width: 0 });
  // Portal root element for rendering dropdown
  const [portalRoot, setPortalRoot] = useState<Element | null>(null);

  // Update dropdown position based on trigger element
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

  // Available status options
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
}
