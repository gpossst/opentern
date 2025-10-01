"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState } from "react";
import {
  Lightbulb,
  Crown,
  TextAlignJustify,
  Link,
  ArrowRight,
} from "lucide-react";
import ApplicationList from "@/components/ApplicationList";
import SuggestionsList from "@/components/SuggestionsList";
import Sidebar from "@/components/Sidebar";

export default function Home() {
  const [showingList, setShowingList] = useState(true);
  return (
    <>
      <main className="p-8 flex">
        <div className="flex-1 items-center justify-center">
          {showingList ? <ListView /> : <SuggestionsList />}
        </div>
        <Sidebar />
        <div className="ml-auto">
          <ViewToggle
            showingList={showingList}
            setShowingList={setShowingList}
          />
        </div>
      </main>
    </>
  );
}

function ListView() {
  const { isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center">
        <span className="loading loading-dots loading-sm"></span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 ">
      <ApplicationList />
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
    <div className="flex flex-col gap-2 max-w-xs">
      <h2 className="text-lg font-semibold">View</h2>

      <button
        className={`btn btn-primary w-full ${showingList ? "" : "btn-soft"}`}
        onClick={() => setShowingList(true)}
      >
        <TextAlignJustify className="w-4 h-4" />
        Applications
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
          className={`btn btn-primary ${showingList ? "btn-soft" : ""}`}
          onClick={() => setShowingList(false)}
        >
          <Lightbulb className="w-4 h-4" />
          Suggestions
        </button>
      )}
    </div>
  );
}
