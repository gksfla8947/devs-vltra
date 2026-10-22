import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className="site-header sticky top-0 z-50 bg-transparent">
      <div className="site-header-blur" aria-hidden="true">
        <span /><span /><span /><span /><span />
      </div>
      <div className="relative z-10 w-full px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex shrink-0 items-center gap-2 hover:opacity-80 transition-opacity rounded-sm focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-4">
          {/* eslint-disable-next-line @next/next/no-img-element -- Small local SVG needs no raster optimization. */}
          <img src="/icon.svg" alt="" className="w-6 h-6" />
          <span className="text-xs sm:text-base font-bold tracking-[0.1em]">DEVS VLTRA</span>
        </Link>
        <nav className="flex items-center gap-3 sm:gap-6 shrink-0 text-[var(--muted)]" aria-label="주 메뉴">
          <Link href="/about" className="text-xs sm:text-sm hover:text-[var(--foreground)] transition-colors rounded-sm focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-4">
            소개
          </Link>
          <Link href="/" className="text-xs sm:text-sm hover:text-[var(--foreground)] transition-colors rounded-sm focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-4">
            포스트
          </Link>
          <div className="w-px h-4 bg-[var(--card-border)]" aria-hidden="true" />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
