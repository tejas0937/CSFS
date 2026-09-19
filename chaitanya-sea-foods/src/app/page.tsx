import LoginForm from "@/components/auth/LoginForm";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-white text-slate-900">
      {/* Header */}
      <header className="relative z-20 border-b border-orange-100 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-sm font-extrabold tracking-wide text-amber-800 sm:text-base">
                CHAITANYA SEA FOODS SYNDICATE
              </h1>
            </div>
          </div>

          <a
            href="#login"
            className="rounded-full border border-orange-200 px-4 py-2 text-sm font-semibold text-orange-700 transition hover:border-orange-400 hover:bg-orange-50"
          >
            Employee Login
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative isolate">
        {/* Subtle Background */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_25%,rgba(251,146,60,0.16),transparent_35%),radial-gradient(circle_at_85%_70%,rgba(148,163,184,0.13),transparent_35%)]" />

        <div className="absolute left-[-120px] top-20 -z-10 h-72 w-72 rounded-full bg-orange-200/20 blur-3xl" />

        <div className="absolute bottom-10 right-[-100px] -z-10 h-80 w-80 rounded-full bg-slate-300/20 blur-3xl" />

        <div className="mx-auto grid min-h-[calc(100vh-145px)] max-w-7xl items-center gap-12 px-5 py-10 sm:px-8 sm:py-12 lg:grid-cols-[1.15fr_0.85fr] lg:px-10 lg:py-16">
          
          {/* Left Hero Content */}
          <div className="hidden max-w-2xl lg:block">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-orange-700">
              <span className="h-2 w-2 rounded-full bg-orange-500" />
              Seafood Business Management
            </div>

            <h2 className="text-5xl font-black leading-[1.05] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
              Freshness.
              <br />

              <span className="text-orange-500">
                Quality.
              </span>

              <br />

              Trust.
            </h2>

            <p className="mt-7 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              Welcome to the Chaitanya Sea Foods Syndicate management
              system.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {[
                "Purchase",
                "Processing",
                "Transport",
                "Sales",
              ].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Login */}
          <div
            id="login"
            className="w-full lg:flex lg:justify-end"
          >
            <LoginForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
          <div className="grid gap-7 md:grid-cols-2 md:items-center">
            <div>
              <h3 className="font-bold">
                CHAITANYA SEA FOODS SYNDICATE
              </h3>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                Office No. V 990, APMC Market, Sector 19 Krushi
                Wholesale Mart, Turbhe, Navi Mumbai 400 703
              </p>
            </div>

            <div className="md:text-right">
              <p className="text-sm font-semibold text-orange-400">
                Contact
              </p>

              <p className="mt-2 text-sm text-slate-300">
                8108990550
              </p>

              <p className="text-sm text-slate-300">
                9595505404
              </p>
            </div>
          </div>

          <div className="mt-7 border-t border-slate-800 pt-5 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} Chaitanya Sea Foods Syndicate.
          </div>
        </div>
      </footer>
    </main>
  );
}