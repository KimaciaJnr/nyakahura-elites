import { Component } from "react";

function dumpStoredData() {
  const out = {};
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (key && key.startsWith("neh_")) out[key] = localStorage.getItem(key);
  }
  return out;
}

export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null, info: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
    this.setState({ info });
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-sand px-6 text-center">
        <p className="font-serif text-2xl font-bold text-navy">
          Something went wrong on this page.
        </p>
        <p className="mt-2 max-w-md text-sm text-navy/70">
          A stored record may be out of date. You can reload, or reset the demo
          data from the sign-in screen if it keeps happening.
        </p>
        <pre className="mt-4 max-w-xl overflow-auto whitespace-pre-wrap rounded-xl bg-navy/5 px-4 py-3 text-left text-xs text-navy/80">
          {String(this.state.error && (this.state.error.message || this.state.error)) || "Unknown error"}
          {this.state.error && this.state.error.stack ? `\n\n${this.state.error.stack}` : ""}
        </pre>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-light"
          >
            Reload page
          </button>
          <button
            onClick={() => {
              try {
                Object.keys(localStorage)
                  .filter((k) => k.startsWith("neh_"))
                  .forEach((k) => localStorage.removeItem(k));
              } catch {
                /* ignore storage errors */
              }
              window.location.href = "/";
            }}
            className="inline-flex items-center gap-2 rounded-full bg-navy/5 px-6 py-3 text-sm font-semibold text-navy transition-colors hover:bg-navy/10"
          >
            Reset demo data
          </button>
          <button
            onClick={() => {
              try {
                navigator.clipboard.writeText(JSON.stringify(dumpStoredData(), null, 2));
              } catch {
                /* ignore */
              }
            }}
            className="inline-flex items-center gap-2 rounded-full bg-navy/5 px-6 py-3 text-sm font-semibold text-navy transition-colors hover:bg-navy/10"
          >
            Copy app data
          </button>
        </div>
      </div>
    );
  }
}