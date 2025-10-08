"use client";
import React from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { FaGithub, FaGoogle } from "react-icons/fa";
import { Heart, CheckCircle, Zap, TextSearch, Network } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { PinIcon, ExternalLink } from "lucide-react";
import { api } from "../convex/_generated/api";
import { Doc } from "../convex/_generated/dataModel";

/**
 * Home page component for Opentern - the open-source internship application tracker.
 *
 * This component renders the landing page with:
 * - Hero section with authentication
 * - Feature showcase highlighting key benefits
 * - Call-to-action for open source contributions
 * - Footer with navigation links
 *
 * @returns {JSX.Element} The complete home page layout
 */
export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-cycling timer
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % 3); // Cycle through 3 slides
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  // Resume auto-play after a delay
  useEffect(() => {
    if (!isAutoPlaying) {
      const resumeTimer = setTimeout(() => {
        setIsAutoPlaying(true);
      }, 10000); // Resume auto-play after 10 seconds of inactivity

      return () => clearTimeout(resumeTimer);
    }
  }, [isAutoPlaying]);

  // Pause auto-play when user manually selects a slide
  const handleSlideClick = (slideIndex: number) => {
    setCurrentSlide(slideIndex);
    setIsAutoPlaying(false); // Pause auto-play when user interacts
  };

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Opentern",
    description:
      "Track your internship applications with Opentern, the open-source application tracker. Organize applications by status, discover opportunities, and streamline your job search workflow.",
    url: "https://opentern.io",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    author: {
      "@type": "Organization",
      name: "Opentern Team",
      url: "https://github.com/gpossst/opentern",
    },
    publisher: {
      "@type": "Organization",
      name: "Opentern",
      url: "https://opentern.io",
    },
    keywords:
      "internship tracker, job application tracker, open source, internship applications, job search, application management, developer tools, career tracking",
    featureList: [
      "Smart Organization",
      "Open Source",
      "Lightning Fast",
      "Scraped lists of opportunities",
      "Streamlined workflow",
    ],
    screenshot: "https://opentern.io/logo.png",
    softwareVersion: "1.0.0",
    datePublished: "2025-10-06",
    dateModified: "2025-10-06",
  };

  return (
    <>
      {/* Inject structured data for search engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-300">
        {/* Hero section with main value proposition and authentication */}
        <header className="min-h-screen flex p-4">
          <div className="w-1/4 p-4 flex flex-col justify-between">
            <div className="flex flex-col items-center">
              <img
                src="/logo.png"
                alt="Opentern"
                width={2099}
                height={400}
                className="m-4 w-4/5"
              />
              <p className="text-secondary-content font-bold text-lg">
                The open-source Software Engineering internship application
                tracker for developers and students.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <button
                className={`btn btn-lg btn-secondary text-white btn-soft w-full ${currentSlide === 0 ? "btn-active" : ""}`}
                onClick={() => handleSlideClick(0)}
              >
                Discover opportunities
              </button>
              <button
                className={`btn btn-lg btn-secondary text-white btn-soft w-full ${currentSlide === 1 ? "btn-active" : ""}`}
                onClick={() => handleSlideClick(1)}
              >
                Track your applications
              </button>
              <button
                className={`btn btn-lg btn-secondary text-white btn-soft w-full ${currentSlide === 2 ? "btn-active" : ""}`}
                onClick={() => handleSlideClick(2)}
              >
                Grow your skills
              </button>
              <GoogleSignIn />
            </div>
          </div>
          <HeroCarousel currentSlide={currentSlide} />
        </header>

        {/* Features section showcasing key benefits and capabilities */}
        <section id="features" className="py-20 card bg-base-100 m-8">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">
                Why Choose Opentern for Your Internship Tracking?
              </h2>
              <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
                Built for developers, by developers. Track your internship
                applications with powerful features designed to streamline your
                job search and career development.
              </p>
            </div>

            {/* Primary feature cards - organization, open source, performance */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              <article className="card bg-base-200 shadow-xl">
                <div className="card-body text-center">
                  <div className="mx-auto mb-2">
                    <CheckCircle className="w-12 h-12 text-primary" />
                  </div>
                  <h3 className="card-title justify-center mb-2">
                    Smart Application Organization
                  </h3>
                  <p className="text-base-content/70">
                    Organize your internship applications by status, company, or
                    priority. Never lose track of where you&apos;ve applied with
                    our intuitive tracking system.
                  </p>
                </div>
              </article>

              <article className="card bg-base-200 shadow-xl">
                <div className="card-body text-center">
                  <div className="mx-auto mb-2">
                    <Heart className="w-12 h-12 text-success" />
                  </div>
                  <h3 className="card-title justify-center mb-2">
                    Open Source Internship Tracker
                  </h3>
                  <p className="text-base-content/70">
                    Built with love by the developer community. Contribute,
                    customize, and make it your own internship application
                    management tool.
                  </p>
                </div>
              </article>

              <article className="card bg-base-200 shadow-xl">
                <div className="card-body text-center">
                  <div className="mx-auto mb-2">
                    <Zap className="w-12 h-12 text-warning" />
                  </div>
                  <h3 className="card-title justify-center mb-2">
                    Lightning Fast Performance
                  </h3>
                  <p className="text-base-content/70">
                    Built with modern technologies for speed and reliability.
                    Track your internship applications quickly and efficiently.
                  </p>
                </div>
              </article>
            </div>

            {/* Secondary feature cards - discovery and workflow */}
            <div className="flex justify-center gap-8">
              <article className="card bg-base-200 shadow-xl">
                <div className="card-body text-center">
                  <div className="mx-auto mb-2">
                    <TextSearch className="w-12 h-12 text-info" />
                  </div>
                  <h3 className="card-title justify-center mb-2">
                    Automated Internship Discovery
                  </h3>
                  <p className="text-base-content/70">
                    Opentern automatically scrapes internship opportunities from
                    GitHub repositories to give you a comprehensive list of
                    opportunities to apply to, saving you hours of manual
                    searching.
                  </p>
                </div>
              </article>
              <article className="card bg-base-200 shadow-xl">
                <div className="card-body text-center">
                  <div className="mx-auto mb-2">
                    <Network className="w-12 h-12 text-error" />
                  </div>
                  <h3 className="card-title justify-center mb-2">
                    Streamlined Job Search Workflow
                  </h3>
                  <p className="text-base-content/70">
                    Opentern is designed to streamline your internship
                    application process. Find opportunities, apply, and track
                    your progress, all in one powerful application tracker.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* Call-to-action section encouraging open source contributions */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-4">Looking to contribute?</h2>
            <p className="text-xl text-base-content/80 mb-8 max-w-2xl mx-auto">
              Open source contributions are great to put on your resume. Make
              connections, gain experience, and improve Opentern by working with
              us!
            </p>
            <a
              href="https://github.com/gpossst/opentern"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-bordered btn-primary"
            >
              <FaGithub />
              Learn how to contribute
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer id="about" className="footer footer-center p-10">
          <div className="grid grid-flow-col gap-4">
            <a href="#features" className="link link-hover">
              Features
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="link link-hover"
            >
              GitHub
            </a>
          </div>
          <div>
            <p className="font-bold text-lg">Opentern</p>
            <p className="text-sm">
              The open-source internship application tracker
            </p>
            <p className="text-xs text-base-content/60">
              © 2025 Opentern. Made with ❤️ by developers, for developers and
              students.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}

/**
 * Google Sign-In button component for user authentication
 * Kept in this file since it's only used on this page
 * @returns {JSX.Element} Styled button that triggers Google OAuth flow
 */
function GoogleSignIn() {
  const { signIn } = useAuthActions();
  return (
    <button
      className="btn btn-primary btn-lg gap-2"
      onClick={() => signIn("google", { redirectTo: "/dashboard" })}
    >
      <FaGoogle />
      Get started with Google
    </button>
  );
}

function HeroCarousel({ currentSlide }: { currentSlide: number }) {
  const opportunitiesPreview = useQuery(api.opportunities.getOpportunities, {
    paginationOpts: {
      numItems: 7,
      cursor: null,
    },
  });
  const slides = [
    <div className="flex flex-col h-full" key="discover">
      <div className="p-6 border-b border-base-300">
        <h3 className="text-xl font-semibold text-base-content mb-2">
          Discover Opportunities
        </h3>
        <p className="text-sm text-base-content/70">
          Explore internship opportunities automatically scraped from GitHub
          repositories
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {opportunitiesPreview?.page.map((opportunity) => (
          <OpportunityPreviewItem
            key={opportunity._id}
            opportunity={opportunity}
          />
        ))}
      </div>
    </div>,
    <div className="flex flex-col h-full" key="track">
      <div className="p-6 border-b border-base-300">
        <h3 className="text-xl font-semibold text-base-content mb-2">
          Track Your Applications
        </h3>
        <p className="text-sm text-base-content/70">
          Manage your internship applications and track their progress
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {fakeApplications.map((application) => (
          <ApplicationListItem
            key={application._id}
            application={application}
          />
        ))}
      </div>
    </div>,
    <div className="flex flex-col h-full" key="grow">
      <div className="p-6 border-b border-base-300">
        <h3 className="text-xl font-semibold text-base-content mb-2">
          Grow Your Skills
        </h3>
        <p className="text-sm text-base-content/70">
          Access our curated list of resources to help you grow your skills,
          prepared for interviews, and improve your resume
        </p>
      </div>
      <div className="flex-1 items-center justify-center flex font-sans text-6xl font-black">
        <TypewriterText
          text="Coming soon..."
          speed={400}
          className="text-center"
        />
      </div>
    </div>,
  ];
  return (
    <div className="w-3/4 bg-base-200 rounded-xl shadow-xl border border-base-300 overflow-hidden carousel-container">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`carousel-slide-wrapper carousel-slide ${
            index === currentSlide ? "active" : ""
          }`}
        >
          {slide}
        </div>
      ))}
    </div>
  );
}

/**
 * SuggestionListItem component - renders individual opportunity cards in the list.
 *
 * Features:
 * - Click to open job description in new tab
 * - One-click application creation from opportunity
 * - GitHub source link for each opportunity
 * - Location display with tooltip for long names
 * - Visual feedback for already added applications
 *
 * @param opportunity - The opportunity data to display
 * @param suggestedApplications - Array of opportunity IDs that have been added as applications
 * @returns {JSX.Element} Individual opportunity list item
 */
function OpportunityPreviewItem({
  opportunity,
}: {
  opportunity: Doc<"opportunities">;
}) {
  // Handle opening job description in new tab
  const handleOpenJobDescription = () => {
    window.open(opportunity.link, "_blank");
  };

  return (
    <div className="card bg-base-100 shadow-sm border border-base-300 hover:shadow-md transition-all duration-200 hover:border-primary/20">
      <div
        onClick={handleOpenJobDescription}
        className="card-body p-4 cursor-pointer"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-base-content text-sm">
                {opportunity.company}
              </h4>
              {opportunity.location && (
                <div className="flex items-center gap-1 text-xs text-base-content/60">
                  <PinIcon className="w-3 h-3" />
                  <span
                    className="truncate max-w-[240px]"
                    title={opportunity.location}
                  >
                    {opportunity.location}
                  </span>
                </div>
              )}
            </div>
            <p className="text-sm text-base-content/80 font-medium">
              {opportunity.title}
            </p>
            {/* Location display with tooltip for long names */}
          </div>
        </div>
      </div>
    </div>
  );
}

// Fake application data for demonstration
const fakeApplications = [
  {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _id: "fake1" as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    userId: "fake-user" as any,
    company: "Google",
    title: "Software Engineering Intern",
    link: "https://careers.google.com/jobs/results/",
    status: "applied" as const,
    _creationTime: Date.now(),
  },
  {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _id: "fake2" as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    userId: "fake-user" as any,
    company: "Microsoft",
    title: "Frontend Developer Intern",
    link: "https://careers.microsoft.com/",
    status: "interviewed" as const,
    _creationTime: Date.now(),
  },
  {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _id: "fake3" as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    userId: "fake-user" as any,
    company: "Meta",
    title: "Full Stack Intern",
    link: "https://www.metacareers.com/",
    status: "rejected" as const,
    _creationTime: Date.now(),
  },
  {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _id: "fake4" as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    userId: "fake-user" as any,
    company: "Apple",
    title: "iOS Developer Intern",
    link: "https://jobs.apple.com/",
    status: "offered" as const,
    _creationTime: Date.now(),
  },
  {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _id: "fake5" as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    userId: "fake-user" as any,
    company: "Netflix",
    title: "Backend Engineer Intern",
    link: "https://jobs.netflix.com/",
    status: "applied" as const,
    _creationTime: Date.now(),
  },
];

/**
 * ApplicationListItem component - renders individual application cards in the list.
 *
 * Features:
 * - Click to open detailed modal
 * - Status dropdown for quick updates
 * - External link access
 * - Delete functionality
 *
 * @param application - The application data to display
 * @returns {JSX.Element} Individual application list item
 */
const ApplicationListItem = ({
  application,
}: {
  application: Doc<"applications">;
}) => {
  return (
    <div className="relative">
      {/* Clickable application card */}
      <div
        onClick={(e) => {
          // Prevent modal opening when clicking dropdown buttons
          const isDropdownClick =
            e.target instanceof Element &&
            (e.target.closest(".dropdown") ||
              e.target.closest('[role="button"]'));

          if (!isDropdownClick) {
            const modal = document?.getElementById(
              application._id.toString(),
            ) as HTMLDialogElement | null;
            modal?.showModal?.();
          }
        }}
        className="p-4 cursor-pointer rounded-md hover:bg-base-200 transition-colors flex flex-row justify-between items-center min-h-[60px]"
      >
        {/* Company and title information */}
        <div className="flex items-center gap-2 flex-1 my-1 cursor-pointer">
          <div className="font-semibold">{application.company}</div>
          <div className="text-sm opacity-70">{application.title}</div>
        </div>
        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* External link button if available */}
          {application.link && (
            <button
              className="btn btn-square btn-sm btn-info btn-soft"
              onClick={() => window.open(application.link, "_blank")}
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          )}
          {/* Status badge */}
          <div
            className={`btn btn-sm ${
              application.status === "applied"
                ? "btn-info"
                : application.status === "interviewed"
                  ? "btn-warning"
                  : application.status === "offered"
                    ? "btn-success"
                    : application.status === "rejected"
                      ? "btn-error"
                      : application.status === "assessment"
                        ? "btn-secondary"
                        : application.status === "interested"
                          ? "btn-neutral"
                          : "btn-neutral"
            }`}
          >
            {application.status}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * TypewriterText component that displays text with a typewriter effect
 * @param text - The text to display
 * @param speed - Typing speed in milliseconds per character (default: 100)
 * @param className - Additional CSS classes
 * @returns JSX element with typewriter effect
 */
function TypewriterText({
  text,
  speed = 200,
  className = "",
}: {
  text: string;
  speed?: number;
  className?: string;
}) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayedText(text.substring(0, currentIndex + 1));
      setCurrentIndex((prev) => (prev + 1) % text.length);
    }, speed);

    return () => clearTimeout(timer);
  }, [currentIndex, text, speed]);

  return (
    <span className={className}>
      {displayedText}
      <span className="animate-pulse text-7xl">|</span>
    </span>
  );
}
