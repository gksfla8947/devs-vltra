"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { koreaDate } from "@/lib/stats-date";

let pending: Promise<void> | null = null;
let recorded = "";

export default function VisitTracker() {
  const pathname = usePathname();
  useEffect(() => {
    if (!(pathname === "/" || pathname === "/about" || pathname.startsWith("/posts/"))) return;
    const day = koreaDate();
    if (recorded === day || pending) return;
    try { if (localStorage.getItem("lastVisitDate") === day) return; } catch { /* Use in-memory deduplication. */ }
    pending = fetch("/api/visitors", { method: "POST" }).then((response) => {
      if (!response.ok) throw new Error("Visit tracking failed");
      recorded = day;
      try { localStorage.setItem("lastVisitDate", day); } catch { /* Storage may be disabled. */ }
    }).catch(() => {}).finally(() => { pending = null; });
  }, [pathname]);
  return null;
}
