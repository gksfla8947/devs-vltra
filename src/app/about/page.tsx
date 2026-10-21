import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "소개", robots: { index: false, follow: true } };

export default function AboutPage() {
  return <section className="max-w-6xl mx-auto px-6 py-28">
    <p className="text-sm text-[var(--accent)] font-semibold mb-4">ABOUT</p>
    <h1 className="text-3xl font-bold tracking-tight">소개 페이지를 준비하고 있습니다.</h1>
    <p className="mt-5 text-[var(--muted)]">이곳에 포트폴리오를 담을 예정입니다.</p>
    <Link href="/" className="inline-block mt-10 text-sm text-[var(--accent)]">포스트 둘러보기 →</Link>
  </section>;
}
