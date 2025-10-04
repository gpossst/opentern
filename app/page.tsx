"use client";
import React from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { FaGithub, FaGoogle } from "react-icons/fa";
import { Heart, CheckCircle, Zap, TextSearch, Network } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-base-100">
      {/* Hero Section */}
      <div className="hero min-h-screen bg-gradient-to-br from-base-100 to-base-300">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold ">Tracklication</h1>
            <p className="py-6 text-lg">
              The open-source internship application tracker.
            </p>
            <GoogleSignIn />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-20 bg-base-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Why Choose Tracklication?
            </h2>
            <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
              Built for developers, by developers. Track your internship
              applications with powerful features designed to streamline your
              job search.
            </p>
          </div>

          {/* First row - 3 cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body text-center">
                <div className="mx-auto mb-2">
                  <CheckCircle className="w-12 h-12 text-primary" />
                </div>
                <h3 className="card-title justify-center mb-2">
                  Smart Organization
                </h3>
                <p className="text-base-content/70">
                  Organize your applications by status, company, or priority.
                  Never lose track of where you've applied.
                </p>
              </div>
            </div>

            <div className="card bg-base-200 shadow-xl">
              <div className="card-body text-center">
                <div className="mx-auto mb-2">
                  <Heart className="w-12 h-12 text-success" />
                </div>
                <h3 className="card-title justify-center mb-2">Open Source</h3>
                <p className="text-base-content/70">
                  Built with love by the community. Contribute, customize, and
                  make it your own.
                </p>
              </div>
            </div>

            <div className="card bg-base-200 shadow-xl">
              <div className="card-body text-center">
                <div className="mx-auto mb-2">
                  <Zap className="w-12 h-12 text-warning" />
                </div>
                <h3 className="card-title justify-center mb-2">
                  Lightning Fast
                </h3>
                <p className="text-base-content/70">
                  Built with modern technologies for speed and reliability. Get
                  things done quickly and efficiently.
                </p>
              </div>
            </div>
          </div>

          {/* Second row - 2 centered cards */}
          <div className="flex justify-center gap-8">
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body text-center">
                <div className="mx-auto mb-2">
                  <TextSearch className="w-12 h-12 text-info" />
                </div>
                <h3 className="card-title justify-center mb-2">
                  Scraped lists of internships
                </h3>
                <p className="text-base-content/70">
                  Tracklication scrapes lists of internships from GitHub
                  repositories to give you a comprehensive list of opportunities
                  to apply to.
                </p>
              </div>
            </div>
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body text-center">
                <div className="mx-auto mb-2">
                  <Network className="w-12 h-12 text-error" />
                </div>
                <h3 className="card-title justify-center mb-2">
                  Streamlined workflow
                </h3>
                <p className="text-base-content/70">
                  Tracklication is designed to be a streamlined workflow for you
                  to track your internships. Find, apply, and track, all in one
                  place.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-primary to-secondary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-primary-content mb-4">
            Looking to contribute?
          </h2>
          <p className="text-xl text-primary-content/80 mb-8 max-w-2xl mx-auto">
            Open source contributions are great to put on your resume. Make
            connections, gain experience, and improve Tracklication by working
            with us!
          </p>
          <a
            href="https://github.com/gpossst/tracklication"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-primary-content"
          >
            <FaGithub />
            Learn how to contribute
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer
        id="about"
        className="footer footer-center p-10 bg-base-200 text-base-content"
      >
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
          <a href="#" className="link link-hover">
            Documentation
          </a>
        </div>
        <div>
          <p className="font-bold text-lg">Tracklication</p>
          <p className="text-sm">The open-source application tracker</p>
          <p className="text-xs text-base-content/60">
            © 2025 Tracklication. Made with ❤️ by developers, for developers.
          </p>
        </div>
      </footer>
    </div>
  );
}

function GoogleSignIn() {
  const { signIn } = useAuthActions();
  return (
    <button
      className="btn btn-primary btn-lg gap-2"
      onClick={() => signIn("google")}
    >
      <FaGoogle />
      Get started with Google
    </button>
  );
}
