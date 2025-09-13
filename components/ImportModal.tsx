import { File, ClipboardPaste, CloudUpload, X } from "lucide-react";
import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../convex/_generated/api";

export default function ImportModal() {
  const [importText, setImportText] = useState("");
  const [importFile, setImportFile] = useState<File | null>(null);

  const importFromFile = useAction(api.import.importFromFile);

  const handleFileImport = async () => {
    if (!importFile) return;

    try {
      // Convert file to ArrayBuffer
      const arrayBuffer = await importFile.arrayBuffer();

      // Call Convex action
      const result = await importFromFile({
        file: new Uint8Array(arrayBuffer),
      });

      console.log("Import result:", result);
    } catch (error) {
      console.error("Import failed:", error);
    }
  };

  return (
    <div className="fixed bottom-0 right-0">
      <div className="fab">
        {/* a focusable div with tabIndex is necessary to work on all browsers. role="button" is necessary for accessibility */}
        <div
          tabIndex={0}
          role="button"
          className="btn btn-lg btn-square btn-success"
        >
          <CloudUpload />
        </div>

        {/* buttons that show up when FAB is open */}
        <div>
          Import from file
          <button
            className="btn btn-lg btn-square"
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
              onClick={handleFileImport}
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
            <button className="btn btn-success w-full btn-soft">Import</button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
