import React from "react";

/**
 * Props interface for skeleton loader components
 */
interface SkeletonLoaderProps {
  /** Number of skeleton items to render (default: 10) */
  count?: number;
  /** Height of each skeleton item in pixels (default: 60) */
  height?: number;
}

/**
 * Generic skeleton loader component that displays animated placeholder content
 * while data is being loaded. Creates multiple skeleton items with a consistent
 * layout that mimics typical list item structure.
 *
 * @param count - Number of skeleton items to render
 * @param height - Height of each skeleton item in pixels
 * @returns JSX element containing skeleton loader items
 */
export function SkeletonLoader({
  count = 10,
  height = 60,
}: SkeletonLoaderProps) {
  return (
    <>
      {/* Generate array of skeleton items based on count prop */}
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="p-4 flex flex-row justify-between items-center min-h-[60px]"
          style={{ height: `${height}px` }}
        >
          {/* Left side content area - simulates main content */}
          <div className="flex items-center gap-2 flex-1 my-1">
            {/* Primary content skeleton (larger) */}
            <div className="h-5 bg-base-300 rounded animate-pulse w-24"></div>
            {/* Secondary content skeleton (medium) */}
            <div className="h-4 bg-base-300 rounded animate-pulse w-32"></div>
            {/* Tertiary content skeleton (smaller) */}
            <div className="h-4 bg-base-300 rounded animate-pulse w-16"></div>
          </div>
          {/* Right side action area - simulates action buttons */}
          <div className="flex items-center gap-2">
            {/* Action button skeleton 1 */}
            <div className="h-8 w-8 bg-base-300 rounded animate-pulse"></div>
            {/* Action button skeleton 2 */}
            <div className="h-8 w-8 bg-base-300 rounded animate-pulse"></div>
          </div>
        </div>
      ))}
    </>
  );
}

/**
 * Specialized skeleton loader component designed specifically for application list items.
 * This variant has a simpler layout compared to the generic SkeletonLoader, with fewer
 * content elements and a single action area, making it more suitable for application
 * card layouts.
 *
 * @param count - Number of skeleton items to render
 * @param height - Height of each skeleton item in pixels
 * @returns JSX element containing application-specific skeleton loader items
 */
export function ApplicationSkeletonLoader({
  count = 10,
  height = 60,
}: SkeletonLoaderProps) {
  return (
    <>
      {/* Generate array of application skeleton items based on count prop */}
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="p-4 flex flex-row justify-between items-center min-h-[60px]"
          style={{ height: `${height}px` }}
        >
          {/* Left side content area - simulates application info */}
          <div className="flex items-center gap-2 flex-1 my-1">
            {/* Application title skeleton */}
            <div className="h-5 bg-base-300 rounded animate-pulse w-24"></div>
            {/* Application subtitle/metadata skeleton */}
            <div className="h-4 bg-base-300 rounded animate-pulse w-32"></div>
          </div>
          {/* Right side action area - simulates status or action button */}
          <div className="flex items-center gap-2">
            {/* Status badge or action button skeleton */}
            <div className="h-8 w-20 bg-base-300 rounded animate-pulse"></div>
          </div>
        </div>
      ))}
    </>
  );
}
