import React, { useState } from "react";
import {
  PanelLeftOpen,
  File,
  ClipboardPaste,
  X,
  House,
  Github,
} from "lucide-react";
import Link from "next/link";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useAction } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import Image from "next/image";

/**
 * Sidebar component - provides navigation, import functionality, and account management.
 *
 * Features:
 * - Drawer-style sidebar with toggle button
 * - Navigation links (Home, GitHub)
 * - Import functionality (clipboard and file)
 * - Ad-free subscription modal
 * - Pro feature promotion
 * - Account management and sign out
 * - Payment integration for subscriptions
 *
 * @returns {JSX.Element} Complete sidebar with modals and functionality
 */
export default function Sidebar() {
  // State for import functionality
  const [importText, setImportText] = useState("");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  // State for payment button loading
  // Get current user data
  // Action for importing text data
  const importFromText = useAction(api.import.importFromText);

  // Handle file import (currently not implemented)
  const handleFileImport = async () => {
    if (!importFile) return;
  };

  // Handle text import from clipboard
  const handleTextImport = async (modalId: string) => {
    if (!importText) return;
    setIsImporting(true);
    const result = await importFromText({ data: importText });
    if (result.success) {
      setIsImporting(false);
      setImportText("");
      (document.getElementById(modalId) as HTMLDialogElement)?.close();
    }
  };

  return (
    <div className="drawer fixed bottom-4 left-4 z-50">
      <input id="my-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        {/* Toggle button for sidebar */}
        <label
          htmlFor="my-drawer"
          className="btn btn-primary drawer-button btn-square btn-sm"
        >
          <PanelLeftOpen />
        </label>
      </div>
      <div className="drawer-side">
        {/* Overlay to close sidebar when clicking outside */}
        <label
          htmlFor="my-drawer"
          aria-label="close sidebar"
          className="drawer-overlay h-screen"
        ></label>
        <ul className="menu bg-base-200 text-base-content min-h-full w-80 max-w-[calc(100vw-2rem)] p-4 flex flex-col">
          {/* Navigation section */}
          <div className="flex flex-col gap-2">
            <Image
              src="/logo.png"
              alt="logo"
              className="h-8 w-auto object-contain mb-4"
            />
            <h3 className="text-sm font-semibold text-base-content/70 uppercase tracking-wide">
              Navigation
            </h3>
            <li>
              <Link href="/">
                <House className="w-4 h-4" />
                Home
              </Link>
            </li>
            <li>
              <a href="https://github.com/gpossst/opentern">
                <Github className="w-4 h-4" />
                GitHub
              </a>
            </li>
          </div>

          {/* Import section */}
          <div className="divider my-4"></div>
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-base-content/70 uppercase tracking-wide">
              Import
            </h3>

            <li>
              <button
                className=""
                onClick={() =>
                  (
                    document.getElementById("my_modal_2") as HTMLDialogElement
                  )?.showModal()
                }
              >
                <ClipboardPaste className="w-4 h-4" />
                Import from Clipboard{" "}
              </button>
            </li>
            <li>
              <button
                className=""
                onClick={() =>
                  (
                    document.getElementById("my_modal_1") as HTMLDialogElement
                  )?.showModal()
                }
                disabled
              >
                <File className="w-4 h-4" />
                Import from File
                <span className="text-xs text-base-content/70">
                  (Coming Soon)
                </span>
              </button>
            </li>
          </div>

          <li className="mt-auto">
            <SignOutButton />
          </li>
        </ul>
      </div>

      {/* File import modal */}
      <dialog id="my_modal_1" className="modal">
        <div className="modal-box gap-4">
          <div className="flex flex-row justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Import from file</h3>
            <form method="dialog">
              <button
                className="btn btn-square btn-sm btn-error"
                onClick={() => setImportFile(null)}
              >
                <X className="w-4 h-4" />
              </button>
            </form>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-col items-end gap-1">
              <input
                className="file-input w-full"
                type="file"
                name="file"
                id="file"
                accept=".csv, .xlsx, .xls, .json, .txt, .xml, .pdf, .doc, .docx"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              />
              <label className="label text-xs">
                .csv .xls .xlsx .json .txt .xml .pdf .doc .docx
              </label>
            </div>
            <button
              className="btn btn-success w-full btn-soft"
              disabled={!importFile}
              onClick={() => handleFileImport()}
            >
              Import
            </button>
          </div>
        </div>
      </dialog>

      {/* Clipboard import modal */}
      <dialog id="my_modal_2" className="modal">
        <div className="modal-box gap-4">
          <div className="flex flex-row justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Import from clipboard</h3>
            <form method="dialog">
              <button
                className="btn btn-square btn-sm btn-error"
                onClick={() => setImportText("")}
              >
                <X className="w-4 h-4" />
              </button>
            </form>
          </div>
          <div className="flex flex-col gap-2 relative">
            <textarea
              className="textarea w-full resize-none pr-12"
              placeholder="Paste your clipboard here"
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
            ></textarea>
            <button
              className="btn btn-square btn-xs btn-primary absolute top-2 right-2"
              onClick={() =>
                navigator.clipboard
                  .readText()
                  .then((text) => setImportText(text))
              }
            >
              <ClipboardPaste className="w-4 h-4" />
            </button>
            <button
              className="btn btn-success w-full btn-soft"
              onClick={() => handleTextImport("my_modal_2")}
              disabled={isImporting}
            >
              {isImporting ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <span>Import</span>
              )}
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}

/**
 * SignOutButton component - handles user sign out functionality.
 *
 * Features:
 * - Only shows when user is authenticated
 * - Signs out user and redirects to home page
 *
 * @returns {JSX.Element} Sign out button or null
 */
function SignOutButton() {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();
  const router = useRouter();
  return (
    <>
      {isAuthenticated && (
        <button
          className="btn btn-sm btn-primary"
          onClick={() =>
            void signOut().then(() => {
              router.push("/");
            })
          }
        >
          Sign out
        </button>
      )}
    </>
  );
}
