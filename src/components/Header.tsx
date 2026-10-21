import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className="border-b border-[var(--card-border)] sticky top-0 z-50 bg-[var(--background)]/80 backdrop-blur-md">
      <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          {/* eslint-disable-next-line @next/next/no-img-element -- Small local SVG needs no raster optimization. */}
          <img src="/icon.svg" alt="" className="w-8 h-8" />
          <span className="text-sm sm:text-lg font-bold tracking-tight">
            <span>DEVS VLTRA</span>
          </span>
        </Link>
        <nav className="flex items-center gap-4 sm:gap-6 shrink-0" aria-label="주 메뉴">
          <Link href="/about" className="text-sm font-medium text-[var(--muted)] hover:text-[var(--accent)] transition-colors">
            소개
          </Link>
          <Link href="/" className="text-sm font-medium text-[var(--muted)] hover:text-[var(--accent)] transition-colors">
            포스트
          </Link>
          <div className="w-px h-4 bg-[var(--card-border)]" />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
