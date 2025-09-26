import {
  File,
  ClipboardPaste,
  CloudUpload,
  X,
  Crown,
  ArrowRight,
} from "lucide-react";
import { useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import Link from "next/link";

export default function ImportModal() {
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

  if (user?.sub !== "pro") {
    return (
      <>
        <div
          tabIndex={0}
          role="button"
          className="btn btn-lg btn-square btn-warning btn-soft fixed bottom-4 right-4"
          onClick={() =>
            (
              document.getElementById("pro_feature_modal") as HTMLDialogElement
            )?.showModal()
          }
        >
          <CloudUpload />
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
                  <button className="btn btn-outline w-full">
                    Maybe Later
                  </button>
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
      </>
    );
  }

  return (
    <div className="fixed bottom-0 right-0">
      <div className="fab gap-4">
        {/* a focusable div with tabIndex is necessary to work on all browsers. role="button" is necessary for accessibility */}
        <div
          tabIndex={0}
          role="button"
          className="btn btn-lg btn-square btn-success"
        >
          <CloudUpload />
        </div>

        {/* buttons that show up when FAB is open */}
        <div className="">
          Import from file
          <button
            className="btn btn-lg btn-square"
            disabled
            onClick={() =>
              (
                document.getElementById("my_modal_1") as HTMLDialogElement
              )?.showModal()
            }
          >
            <File />
          </button>
        </div>
        <div>
          Import from clipboard{" "}
          <button
            className="btn btn-lg btn-square"
            onClick={() =>
              (
                document.getElementById("my_modal_2") as HTMLDialogElement
              )?.showModal()
            }
          >
            <ClipboardPaste />
          </button>
        </div>
      </div>

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
