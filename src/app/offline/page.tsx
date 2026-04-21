"use client";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-gold-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">You&apos;re Offline</h1>
        <p className="text-neutral-400 text-sm leading-relaxed mb-8">
          No internet connection detected. Some features may be unavailable. Please check your connection and try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="btn-gold px-6 py-3 rounded-xl text-sm font-semibold"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
