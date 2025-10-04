import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { Doc } from "@/convex/_generated/dataModel";
import { useState, useMemo, useCallback, useEffect } from "react";
import StatusDropdown from "./StatusDropdown";
import SortableList from "./SortableList";
import debounce from "@/utils/debounce";
import Link from "next/link";
import { Link as LinkIcon, Trash, X } from "lucide-react";

/**
 * ApplicationPopover component - displays detailed application information in a modal.
 *
 * Features:
 * - Editable notes with auto-save functionality
 * - Status management with dropdown
 * - Application history tracking
 * - External link access
 * - Delete functionality
 *
 * @param application - The application data to display
 * @param handleDeleteApplication - Function to handle application deletion
 * @returns {JSX.Element} Modal dialog with application details
 */
export default function ApplicationPopover({
  application,
  handleDeleteApplication,
}: {
  application: Doc<"applications">;
  handleDeleteApplication: () => void;
}) {
  // Convex mutation for updating application data
  const updateApplication = useMutation(api.applications.updateApplication);
  // Local state for notes to enable real-time editing
  const [localNotes, setLocalNotes] = useState(application.notes || "");

  // Sync local notes state when application data changes externally
  useEffect(() => {
    setLocalNotes(application.notes || "");
  }, [application.notes]);

  // Debounced update function to prevent excessive API calls while typing
  const debouncedUpdate = useMemo(
    () =>
      // Debounce function from utils/debounce.ts
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

  // Handle notes input changes with debounced updates
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
        {/* Modal header with company info and action buttons */}
        <div className="flex flex-row justify-between items-center">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg">{application.company}</h3>
            <p className=" text-sm opacity-70">{application.title}</p>
            {/* External link button if application has a URL */}
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
          {/* Action buttons for delete and close */}
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

        {/* Main content area with notes and status sections */}
        <div className="flex gap-4 pt-4 flex-1 min-h-0">
          {/* Notes section - editable textarea with auto-save */}
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

          {/* Status section with dropdown and history */}
          <div className="flex-[1] flex flex-col">
            <div className="flex justify-between items-start">
              <h4 className="font-semibold text-base mb-4">Status</h4>
              <StatusDropdown application={application} size="sm" />
            </div>
            {/* Sortable list showing current status and history */}
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
