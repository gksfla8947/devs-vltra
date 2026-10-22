export default function Footer() {
  return (
    <footer className="border-t border-[var(--card-border)] mt-auto bg-[var(--card)]">
      <div className="max-w-[960px] mx-auto px-6 py-9">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon.svg" alt="" className="w-6 h-6" />
              <span className="font-bold text-sm">DEVS VLTRA</span>
            </div>
            <p className="text-xs leading-relaxed text-[var(--muted)]">
              &copy; {new Date().getFullYear()} gksfla8947. All rights reserved.
            </p>
          </div>
          <nav aria-label="연락 및 소셜 프로필" className="flex items-center gap-2">
            <span className="mr-2 text-xs text-[var(--muted)]">Contact</span>
            <a href="https://github.com/gksfla8947" target="_blank" rel="noopener noreferrer"
              aria-label="GitHub 프로필 (새 탭)" title="GitHub"
              className="inline-flex size-10 items-center justify-center rounded-full text-[var(--muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-glow)] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 .75a11.25 11.25 0 0 0-3.558 21.923c.563.104.768-.244.768-.542v-2.095c-3.13.68-3.79-1.327-3.79-1.327-.512-1.3-1.25-1.646-1.25-1.646-1.022-.7.078-.685.078-.685 1.13.08 1.725 1.16 1.725 1.16 1.005 1.722 2.637 1.224 3.28.936.102-.728.394-1.224.716-1.506-2.498-.284-5.124-1.25-5.124-5.563 0-1.229.44-2.233 1.16-3.02-.116-.285-.502-1.43.11-2.98 0 0 .945-.303 3.095 1.154A10.8 10.8 0 0 1 12 6.18c.956.004 1.918.129 2.817.379 2.148-1.457 3.09-1.154 3.09-1.154.615 1.55.229 2.695.113 2.98.722.787 1.158 1.791 1.158 3.02 0 4.324-2.63 5.276-5.136 5.555.404.35.764 1.04.764 2.098v3.073c0 .3.203.65.774.54A11.25 11.25 0 0 0 12 .75Z" />
              </svg>
            </a>
            <a href="https://www.linkedin.com/in/khrim123/" target="_blank" rel="noopener noreferrer"
              aria-label="LinkedIn 프로필 (새 탭)" title="LinkedIn"
              className="inline-flex size-10 items-center justify-center rounded-full text-[var(--muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-glow)] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M20.45 2H3.55A1.55 1.55 0 0 0 2 3.55v16.9A1.55 1.55 0 0 0 3.55 22h16.9A1.55 1.55 0 0 0 22 20.45V3.55A1.55 1.55 0 0 0 20.45 2ZM7.93 18.75H4.98V9.2h2.95ZM6.46 7.9a1.71 1.71 0 1 1 0-3.42 1.71 1.71 0 0 1 0 3.42Zm12.29 10.85H15.8v-4.65c0-1.11-.02-2.54-1.55-2.54-1.55 0-1.79 1.21-1.79 2.46v4.73H9.51V9.2h2.83v1.3h.04c.39-.74 1.36-1.52 2.8-1.52 2.99 0 3.57 1.97 3.57 4.53Z" />
              </svg>
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
