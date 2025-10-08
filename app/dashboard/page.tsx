"use client";

import { useConvexAuth } from "convex/react";
import { useState } from "react";
import { TextAlignJustify, Book, Sprout } from "lucide-react";
import ApplicationList from "@/components/ApplicationList";
import OpportunitiesList from "@/components/OpportunitiesList";
import Sidebar from "@/components/Sidebar";

/**
 * Dashboard page component - the main interface for managing internship applications.
 *
 * Features:
 * - View toggle between applications and opportunities
 * - Sidebar for additional functionality
 * - Loading state handling
 * - Responsive layout with proper spacing
 *
 * @returns {JSX.Element} The complete dashboard layout
 */
export default function Dashboard() {
  // State to track which view is currently active (list, opportunities, resources)
  const [view, setView] = useState("list");
  // Authentication state from Convex
  const { isLoading } = useConvexAuth();

  // Show loader while authentication is being verified
  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center">
        <span className="loading loading-dots loading-sm"></span>
      </div>
    );
  }

  return (
    <div className="flex flex-1 h-screen p-8">
      {/* Main content area - displays either applications or opportunities */}
      <div className="flex-1 items-center justify-center">
        {view === "list" ? <ApplicationList /> : <OpportunitiesList />}
      </div>
      {/* Sidebar for nav/import/account functionality */}
      <Sidebar />
      {/* View toggle controls positioned on the right */}
      <div className="ml-auto">
        <ViewToggle showingList={view === "list"} setShowingList={setView} />
      </div>
    </div>
  );
}

/**
 * View toggle component for switching between different dashboard views.
 *
 * Provides buttons to switch between:
 * - Applications list (current user's applications)
 * - Opportunities list (available internship opportunities)
 * - Resources (disabled - future feature)
 *
 * @param showingList - Whether the applications list is currently shown
 * @param setShowingList - Function to change the active view
 * @returns {JSX.Element} Toggle buttons for view switching
 */
function ViewToggle({
  showingList,
  setShowingList,
}: {
  showingList: boolean;
  setShowingList: (view: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2 max-w-xs">
      <h2 className="text-lg font-semibold">View</h2>

      {/* Applications view button */}
      <button
        className={`btn btn-primary w-full ${showingList ? "" : "btn-soft"}`}
        onClick={() => setShowingList("list")}
      >
        <TextAlignJustify className="w-4 h-4" />
        Applications
      </button>

      {/* Opportunities view button */}
      <button
        className={`btn btn-primary ${showingList ? "btn-soft" : ""}`}
        onClick={() => setShowingList("opportunities")}
      >
        <Sprout className="w-4 h-4" />
        Opportunities
      </button>

      {/* Resources view button (disabled - future feature) */}
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
