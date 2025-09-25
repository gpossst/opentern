export default function PricingPage() {
  return (
    <div className="min-h-screen bg-base-100">
      {/* Hero Section */}
      <div className="hero bg-gradient-to-br from-primary/20 to-secondary/20 py-20">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold text-primary mb-4">
              Simple Pricing
            </h1>
            <p className="text-lg text-base-content/70 mb-8">
              For a few more features, we offer a pro tier.
            </p>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col md:flex-row justify-center items-stretch gap-8 max-w-4xl mx-auto">
          {/* Free Tier */}
          <div className="card bg-base-200 shadow-xl flex-1 max-w-sm">
            <div className="card-body text-center">
              <h2 className="card-title justify-center text-2xl font-bold text-primary">
                Free
              </h2>
              <div className="text-4xl font-bold my-4">
                $0
                <span className="text-lg font-normal text-base-content/70">
                  /month
                </span>
              </div>
              <p className="text-base-content/70 mb-6">
                Perfect for getting started with application tracking
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3">
                  <div className="badge badge-success badge-sm">✓</div>
                  <span>Unlimited applications</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="badge badge-success badge-sm">✓</div>
                  <span>Tracking features</span>
                </div>
              </div>

              <div className="card-actions justify-center">
                <button className="btn btn-outline btn-primary w-full">
                  Get Started Free
                </button>
              </div>
            </div>
          </div>

          {/* Pro Tier */}
          <div className="card bg-primary text-primary-content shadow-xl ring-2 ring-primary flex-1 max-w-sm">
            <div className="card-body text-center">
              <div className="badge badge-secondary mb-2">Most Popular</div>
              <h2 className="card-title justify-center text-2xl font-bold">
                Pro
              </h2>
              <div className="text-4xl font-bold my-4">
                $1
                <span className="text-lg font-normal opacity-70">/month</span>
              </div>
              <p className="opacity-70 mb-6">
                Advanced features for serious job seekers
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3">
                  <div className="badge badge-success badge-sm">✓</div>
                  <span>Unlimited applications</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="badge badge-success badge-sm">✓</div>
                  <span>Tracking features</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="badge badge-success badge-sm">✓</div>
                  <span>Suggestions</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="badge badge-success badge-sm">✓</div>
                  <span>Import from clipboard</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="badge badge-success badge-sm">✓</div>
                  <span>Import from file (coming soon)</span>
                </div>
              </div>

              <div className="card-actions justify-center">
                <button className="btn btn-secondary w-full">
                  Start Pro Trial
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="max-w-3xl mx-auto space-y-4">
            <div className="collapse collapse-arrow bg-base-200">
              <input type="radio" name="faq-accordion" />
              <div className="collapse-title text-xl font-medium">
                Can I change plans anytime?
              </div>
              <div className="collapse-content">
                <p>
                  Yes! You can upgrade or downgrade your plan at any time.
                  Changes take effect immediately.
                </p>
              </div>
            </div>

            <div className="collapse collapse-arrow bg-base-200">
              <input type="radio" name="faq-accordion" />
              <div className="collapse-title text-xl font-medium">
                Can I cancel anytime?
              </div>
              <div className="collapse-content">
                <p>
                  Absolutely! You can cancel your subscription at any time with
                  no cancellation fees.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
