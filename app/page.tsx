"use client";

import { useConvexAuth, useMutation, useAction, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import {
  Check,
  ClipboardPaste,
  Lightbulb,
  Crown,
  TextAlignJustify,
  Link,
  ArrowRight,
} from "lucide-react";
import { z } from "zod";
import ImportModal from "@/components/ImportModal";
import ApplicationList from "@/components/ApplicationList";
import SuggestionsList from "@/components/SuggestionsList";

export default function Home() {
  const [showingList, setShowingList] = useState(true);
  return (
    <>
      <main className="p-8 flex flex-col gap-8">
        <ImportModal />
        {showingList ? <ListView /> : <SuggestionsList />}
        <div className="absolute top-4 right-4 flex flex-col items-center gap-2">
          <SignOutButton />
          <ViewToggle
            showingList={showingList}
            setShowingList={setShowingList}
          />
        </div>
      </main>
    </>
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

const formInfoSchema = z.object({
  company: z.string(),
  title: z.string(),
  link: z.string().refine(
    (val) => {
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

function ListView() {
  const { isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="mx-auto">
        <p>loading... (consider a loading skeleton)</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 mx-auto">
      <ApplicationInput />
      <ApplicationList />
    </div>
  );
}

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
    <div className="flex flex-col max-w-4xl bg-neutral rounded-md p-2">
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
          <Check className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function ViewToggle({
  showingList,
  setShowingList,
}: {
  showingList: boolean;
  setShowingList: (showingList: boolean) => void;
}) {
  const user = useQuery(api.users.getUser);
  return (
    <div className="flex flex-row items-center gap-2">
      <button
        className={`btn btn-primary btn-square ${showingList ? "" : "btn-soft"}`}
        onClick={() => setShowingList(true)}
      >
        <TextAlignJustify className="w-4 h-4" />
      </button>
      {user?.sub !== "pro" ? (
        <>
          <button
            className={`btn btn-square btn-warning ${showingList ? "btn-soft" : ""}`}
            onClick={() =>
              (
                document.getElementById(
                  "pro_feature_modal",
                ) as HTMLDialogElement
              )?.showModal()
            }
          >
            <Lightbulb className="w-4 h-4" />
          </button>

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
                    Suggestions are available with our Pro plan
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
      ) : (
        <button
          className={`btn btn-primary btn-square ${showingList ? "btn-soft" : ""}`}
          onClick={() => setShowingList(false)}
        >
          <Lightbulb className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
