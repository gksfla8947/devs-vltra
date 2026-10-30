import { notFound } from "next/navigation";
import ManageDashboard from "@/components/manage/ManageDashboard";
import { koreaDate, shiftDate, type StatsData } from "@/lib/stats-date";

export default function StatsPreview() {
  if (process.env.NODE_ENV === "production") notFound();
  const today = koreaDate();
  const preview: StatsData = { today, asOf: new Date().toISOString(), started: shiftDate(today, -90), totalViews: 2834, totalVisitors: 1293, views: {}, visitors: {} };
  for (let index = 0; index <= 90; index++) {
    const day = shiftDate(today, -index);
    preview.views[day] = 10 + (index * 17) % 60;
    preview.visitors[day] = 3 + (index * 7) % 25;
  }
  preview.totalViews = Object.values(preview.views).reduce((sum, value) => sum + value, 0);
  preview.totalVisitors = Object.values(preview.visitors).reduce((sum, value) => sum + value, 0);
  const posts = Array.from({ length: 23 }, (_, index) => ({ id: `preview-${index + 1}`, title: `예시 글 ${index + 1} — ${["백엔드 설계", "빌드 자동화", "네트워크 기초"][index % 3]}`, category: ["Backend", "DevOps", "Network"][index % 3], published: index % 4 !== 0, date: shiftDate(today, -index) }));
  return <ManageDashboard preview={{ posts, stats: preview }} />;
}
