export default function Footer() {
  return (
    <footer className="border-t border-[var(--card-border)] mt-auto bg-[var(--card)]">
      <div className="max-w-[1200px] mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon.svg" alt="" className="w-6 h-6" />
              <span className="font-bold text-sm">DEVS VLTRA</span>
            </div>
          </div>
          <p className="text-xs text-[var(--muted)]">
            &copy; {new Date().getFullYear()} 강건너물구경. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
