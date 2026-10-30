import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Gradion — From Resume Matching to Career Readiness." },
      { name: "description", content: "Gradion is an AI-powered resume–job matching and career pathway intelligence platform." },
      { name: "author", content: "Gradion" },
      { property: "og:title", content: "Gradion — From Resume Matching to Career Readiness" },
      { property: "og:description", content: "Discover how your skills match industry expectations and get a personalized 90-day roadmap to job-readiness." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700&family=Sora:wght@500;600;700;800&display=swap" },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <SiteShell />
    </QueryClientProvider>
  );
}

function SiteShell() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}

const NAV_ITEMS = [
  { to: "/", label: "Home" },
  { to: "/matcher", label: "Resume Matcher" },
  { to: "/roadmap", label: "Career Roadmap" },
  { to: "/opportunities", label: "Opportunities" },
  { to: "/dashboard", label: "My Dashboard" },
] as const;

function Logo() {
  return (
    <>
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-hero text-primary-foreground shadow-elegant">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 18 L10 12 L14 16 L20 6" /><circle cx="20" cy="6" r="1.6" fill="currentColor" /></svg>
      </span>
      <span className="font-display text-lg font-semibold tracking-tight">Gradion</span>
    </>
  );
}

function SiteHeader() {
  const [open, setOpen] = useState(false);
  const linkBase = "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground";
  const active = { className: linkBase + " text-foreground" };
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <Logo />
        </Link>
        <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary">
          {NAV_ITEMS.map((item) => (
            <Link key={item.to} to={item.to} className={linkBase} activeProps={active} activeOptions={{ exact: item.to === "/" }}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/matcher"
            className="hidden h-9 items-center justify-center rounded-full bg-gradient-hero px-4 text-sm font-semibold text-primary-foreground shadow-elegant transition-transform hover:scale-[1.02] sm:inline-flex"
          >
            Analyse My Resume
          </Link>
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open ? (
        <nav className="border-t border-border/60 bg-background px-4 py-4 lg:hidden" aria-label="Mobile">
          <div className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                activeOptions={{ exact: item.to === "/" }}
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/matcher"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex h-11 items-center justify-center rounded-full bg-gradient-hero px-4 text-sm font-semibold text-primary-foreground shadow-elegant"
            >
              Analyse My Resume
            </Link>
          </div>
        </nav>
      ) : null}
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-background/60">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <Logo />
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Most tools tell students whether their resume matches a job. Gradion tells them what is missing, why it matters, and exactly how to become the candidate employers are looking for.
          </p>
        </div>
        <div>
          <div className="text-sm font-semibold">Product</div>
          <div className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
            <Link to="/matcher" className="hover:text-foreground">Resume Matcher</Link>
            <Link to="/roadmap" className="hover:text-foreground">Career Roadmap</Link>
            <Link to="/opportunities" className="hover:text-foreground">Opportunities</Link>
            <Link to="/dashboard" className="hover:text-foreground">My Dashboard</Link>
          </div>
        </div>
        <div>
          <div className="text-sm font-semibold">Company</div>
          <div className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
            <Link to="/about" className="hover:text-foreground">About Gradion</Link>
            <a href="mailto:hello@gradion.app" className="hover:text-foreground">Contact</a>
            <Link to="/about" className="hover:text-foreground">Privacy</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
        Gradion — From resume matching to career readiness.
      </div>
    </footer>
  );
}
