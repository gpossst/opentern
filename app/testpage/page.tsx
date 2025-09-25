"use client";

export default function page() {
  return (
    <div>
      <button
        onClick={() => {
          fetch("/api/cron/scrape");
        }}
      >
        Scrape
      </button>
    </div>
  );
}
