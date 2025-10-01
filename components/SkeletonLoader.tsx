import React from "react";

interface SkeletonLoaderProps {
  count?: number;
  height?: number;
}

export function SkeletonLoader({
  count = 10,
  height = 60,
}: SkeletonLoaderProps) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="p-4 flex flex-row justify-between items-center min-h-[60px]"
          style={{ height: `${height}px` }}
        >
          <div className="flex items-center gap-2 flex-1 my-1">
            <div className="h-5 bg-base-300 rounded animate-pulse w-24"></div>
            <div className="h-4 bg-base-300 rounded animate-pulse w-32"></div>
            <div className="h-4 bg-base-300 rounded animate-pulse w-16"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-base-300 rounded animate-pulse"></div>
            <div className="h-8 w-8 bg-base-300 rounded animate-pulse"></div>
          </div>
        </div>
      ))}
    </>
  );
}

export function ApplicationSkeletonLoader({
  count = 10,
  height = 60,
}: SkeletonLoaderProps) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="p-4 flex flex-row justify-between items-center min-h-[60px]"
          style={{ height: `${height}px` }}
        >
          <div className="flex items-center gap-2 flex-1 my-1">
            <div className="h-5 bg-base-300 rounded animate-pulse w-24"></div>
            <div className="h-4 bg-base-300 rounded animate-pulse w-32"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-20 bg-base-300 rounded animate-pulse"></div>
          </div>
        </div>
      ))}
    </>
  );
}

