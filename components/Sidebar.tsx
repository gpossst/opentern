import React, { useState } from "react";
import {
  PanelLeftOpen,
  File,
  ClipboardPaste,
  X,
  Crown,
  ArrowRight,
  CreditCard,
  DollarSign,
  House,
  Github,
} from "lucide-react";
import Link from "next/link";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useAction, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "../convex/_generated/api";

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
  const [loadingProButton, setLoadingProButton] = useState(false);
  // Get current user data
  const user = useQuery(api.users.getUser);
  // Action for importing text data
  const importFromText = useAction(api.import.importFromText);

  // Handle file import (currently not implemented)
  const handleFileImport = async (modalId: string) => {
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

  // Handle payment button press for subscriptions
  const handleButtonPress = () => {
    setLoadingProButton(true);
    fetch("/api/polar/payment", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.text())
      .then((data) => {
        window.location.href = data;
      })
      .finally(() => {
        setLoadingProButton(false);
      });
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
            <img
              src="/wordface.png"
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
              <button
                className=""
                onClick={() =>
                  (
                    document.getElementById(
                      "ad_free_modal",
                    ) as HTMLDialogElement
                  )?.showModal()
                }
              >
                <DollarSign className="w-4 h-4" />
                Go ad-free
              </button>
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

          {/* Account section */}
          <div className="divider my-4 mt-auto"></div>
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-base-content/70 uppercase tracking-wide">
              Account
            </h3>
            <li>
              <Link href="/api/polar/billing">
                <CreditCard className="w-4 h-4" />
                Billing
              </Link>
            </li>
            <li className="mt-auto">
              <SignOutButton />
            </li>
          </div>
        </ul>
      </div>

      {/* Ad-free subscription modal */}
      <dialog id="ad_free_modal" className="modal">
        <div className="modal-box max-w-md">
          <div className="flex flex-col items-center text-center gap-6">
            {/* Crown icon */}
            <div className="flex items-center justify-center w-16 h-16 bg-warning rounded-full">
              <Crown className="w-8 h-8 text-base-100" />
            </div>

            {/* Modal title and description */}
            <div>
              <h3 className="font-bold text-2xl mb-2">Go Ad-Free</h3>
              <p className="text-base-content/70">
                Remove ads and support Tracklication development
              </p>
            </div>

            {/* Features list */}
            <div className="w-full">
              <div className="bg-base-200 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-sm text-base-content/80 mb-3">
                  Ad-free includes:
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="badge badge-success badge-sm">✓</div>
                    <span>No advertisements</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="badge badge-success badge-sm">✓</div>
                    <span>Priority support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="badge badge-success badge-sm">✓</div>
                    <span>Support the development team</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing information */}
            <div className="bg-primary/10 rounded-lg p-4 w-full">
              <div className="text-2xl font-bold text-primary mb-1">
                $2/month
              </div>
              <div className="text-sm text-base-content/70">Cancel anytime</div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 w-full">
              <form method="dialog" className="flex-1">
                <button className="btn btn-outline w-full">Maybe Later</button>
              </form>
              <button
                className="btn btn-primary w-full flex-1"
                onClick={handleButtonPress}
                disabled={loadingProButton}
              >
                {loadingProButton ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <>
                    Subscribe Now
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      {/* Pro feature promotion modal */}
      <dialog id="pro_feature_modal" className="modal">
        <div className="modal-box max-w-md">
          <div className="flex flex-col items-center text-center gap-6">
            {/* Crown icon */}
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full">
              <Crown className="w-8 h-8 text-primary" />
            </div>

            {/* Modal title and description */}
            <div>
              <h3 className="font-bold text-2xl mb-2">Pro Feature</h3>
              <p className="text-base-content/70">
                Import functionality is available with our Pro plan
              </p>
            </div>

            {/* Features list */}
            <div className="w-full">
              <div className="bg-base-200 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-sm text-base-content/80 mb-3">
                  Pro includes:
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="badge badge-success badge-sm">✓</div>
                    <span>Import from clipboard</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="badge badge-success badge-sm">✓</div>
                    <span>Import from file (coming soon)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="badge badge-success badge-sm">✓</div>
                    <span>Opportunities</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="badge badge-success badge-sm">✓</div>
                    <span>Support for the team</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing information */}
            <div className="bg-primary/10 rounded-lg p-4 w-full">
              <div className="text-2xl font-bold text-primary mb-1">
                $1/month
              </div>
              <div className="text-sm text-base-content/70">
                Start your free trial today
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 w-full">
              <form method="dialog" className="flex-1">
                <button className="btn btn-outline w-full">Maybe Later</button>
              </form>
              <button
                className="btn btn-primary w-full flex-1"
                onClick={handleButtonPress}
                disabled={loadingProButton}
              >
                {loadingProButton ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <>
                    Subscribe Now
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

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
              onClick={() => handleFileImport("my_modal_1")}
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
