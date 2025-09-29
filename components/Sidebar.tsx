import React, { useState } from "react";
import {
  PanelLeftOpen,
  File,
  ClipboardPaste,
  CloudUpload,
  X,
  Crown,
  ArrowRight,
  CreditCard,
  DollarSign,
  House,
} from "lucide-react";
import Link from "next/link";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useAction, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "../convex/_generated/api";

export default function Sidebar() {
  const [importText, setImportText] = useState("");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const user = useQuery(api.users.getUser);
  const importFromText = useAction(api.import.importFromText);

  const handleFileImport = async (modalId: string) => {
    if (!importFile) return;
  };

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
    <div className="drawer absolute bottom-4 left-4">
      <input id="my-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        {/* Page content here */}
        <label
          htmlFor="my-drawer"
          className="btn btn-primary drawer-button btn-square btn-sm"
        >
          <PanelLeftOpen />
        </label>
      </div>
      <div className="drawer-side">
        <label
          htmlFor="my-drawer"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <ul className="menu bg-base-200 text-base-content min-h-full w-80 p-4 flex flex-col">
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-base-content/70 uppercase tracking-wide">
              Navigation
            </h3>
            <li>
              <Link href="/">
                <House className="w-4 h-4" />
                Home
              </Link>
            </li>
            {user?.sub === "pro" ? (
              <li className="">
                <Link href="/pricing" className="">
                  <DollarSign className="w-4 h-4" />
                  Pricing
                </Link>
              </li>
            ) : (
              <li className="">
                <Link
                  href="/pricing"
                  className="btn btn-primary btn-sm w-full justify-start"
                >
                  <Crown className="w-4 h-4" />
                  Upgrade to Pro
                </Link>
              </li>
            )}
          </div>

          {/* Import Section */}
          <div className="divider my-4"></div>
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-base-content/70 uppercase tracking-wide">
              Import
            </h3>

            {user?.sub !== "pro" ? (
              <li>
                <button
                  className="btn btn-warning btn-sm w-full justify-start"
                  onClick={() =>
                    (
                      document.getElementById(
                        "pro_feature_modal",
                      ) as HTMLDialogElement
                    )?.showModal()
                  }
                >
                  <CloudUpload className="w-4 h-4" />
                  Import (Pro Feature)
                </button>
              </li>
            ) : (
              <>
                <li>
                  <button
                    className=""
                    onClick={() =>
                      (
                        document.getElementById(
                          "my_modal_1",
                        ) as HTMLDialogElement
                      )?.showModal()
                    }
                  >
                    <File className="w-4 h-4" />
                    Import from File
                  </button>
                </li>
                <li>
                  <button
                    className=""
                    onClick={() =>
                      (
                        document.getElementById(
                          "my_modal_2",
                        ) as HTMLDialogElement
                      )?.showModal()
                    }
                  >
                    <ClipboardPaste className="w-4 h-4" />
                    Import from Clipboard
                  </button>
                </li>
              </>
            )}
          </div>

          <div className="divider my-4 mt-auto"></div>
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-base-content/70 uppercase tracking-wide">
              Account
            </h3>
            <li>
              <Link href="/">
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

      {/* Pro Feature Dialog */}
      <dialog id="pro_feature_modal" className="modal">
        <div className="modal-box max-w-md">
          <div className="flex flex-col items-center text-center gap-6">
            {/* Crown Icon */}
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full">
              <Crown className="w-8 h-8 text-primary" />
            </div>

            {/* Title */}
            <div>
              <h3 className="font-bold text-2xl mb-2">Pro Feature</h3>
              <p className="text-base-content/70">
                Import functionality is available with our Pro plan
              </p>
            </div>

            {/* Features List */}
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
                    <span>Suggestions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="badge badge-success badge-sm">✓</div>
                    <span>Support for the team</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Info */}
            <div className="bg-primary/10 rounded-lg p-4 w-full">
              <div className="text-2xl font-bold text-primary mb-1">
                $1/month
              </div>
              <div className="text-sm text-base-content/70">
                Start your free trial today
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 w-full">
              <form method="dialog" className="flex-1">
                <button className="btn btn-outline w-full">Maybe Later</button>
              </form>
              <Link href="/pricing" className="flex-1">
                <button
                  className="btn btn-primary w-full"
                  onClick={() =>
                    (
                      document.getElementById(
                        "pro_feature_modal",
                      ) as HTMLDialogElement
                    )?.close()
                  }
                >
                  View Pricing
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      {/* File Import Dialog */}
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

      {/* Clipboard Import Dialog */}
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
              router.push("/signin");
            })
          }
        >
          Sign out
        </button>
      )}
    </>
  );
}
