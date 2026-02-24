"use client";

/**
 * Animated gradient orbs that drift slowly on the landing page.
 * Uses theme-aware colors so it works in light (default) and dark mode.
 */
export function LandingBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-emerald-50/30 dark:to-emerald-950/20" />
      {/* Moving orbs */}
      <div
        className="absolute -left-[20%] top-[10%] h-[60vmax] w-[60vmax] rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-500/15"
        style={{
          animation: "landing-float-1 25s ease-in-out infinite",
        }}
      />
      <div
        className="absolute -right-[15%] bottom-[15%] h-[50vmax] w-[50vmax] rounded-full bg-teal-200/35 blur-3xl dark:bg-teal-500/15"
        style={{
          animation: "landing-float-2 30s ease-in-out infinite",
        }}
      />
      <div
        className="absolute left-[30%] bottom-[5%] h-[40vmax] w-[40vmax] rounded-full bg-cyan-100/40 blur-3xl dark:bg-cyan-600/10"
        style={{
          animation: "landing-float-3 22s ease-in-out infinite",
        }}
      />
    </div>
  );
}
