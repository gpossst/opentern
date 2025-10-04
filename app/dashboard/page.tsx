"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { TextAlignJustify, Book, Sprout } from "lucide-react";
import ApplicationList from "@/components/ApplicationList";
import OpportunitiesList from "@/components/OpportunitiesList";
import Sidebar from "@/components/Sidebar";

export default function Dashboard() {
  const [view, setView] = useState("list");
  return (
    <div className="flex flex-1 h-screen p-8">
      <div className="flex-1 items-center justify-center">
        {view === "list" ? <ListView /> : <OpportunitiesList />}
      </div>
      <Sidebar />
      <div className="ml-auto">
        <ViewToggle showingList={view === "list"} setShowingList={setView} />
      </div>
    </div>
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
  setShowingList: (view: string) => void;
}) {
  const user = useQuery(api.users.getUser);
  return (
    <div className="flex flex-col gap-2 max-w-xs">
      <h2 className="text-lg font-semibold">View</h2>

      <button
        className={`btn btn-primary w-full ${showingList ? "" : "btn-soft"}`}
        onClick={() => setShowingList("list")}
      >
        <TextAlignJustify className="w-4 h-4" />
        Applications
      </button>
      <button
        className={`btn btn-primary ${showingList ? "btn-soft" : ""}`}
        onClick={() => setShowingList("opportunities")}
      >
        <Sprout className="w-4 h-4" />
        Opportunities
      </button>
      <button
        className={`btn btn-primary ${showingList ? "btn-soft" : ""}`}
        onClick={() => setShowingList("opportunities")}
        disabled
      >
        <Book className="w-4 h-4" />
        Resources
      </button>
    </div>
  );
}
