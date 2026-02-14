import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const CROP_SLUG_TO_NAME: Record<string, string> = {
  paprica: "파프리카",
  strawberry: "딸기",
  tomato: "토마토",
  cucumber: "오이",
  pepper: "고추",
};

export default async function MarketCropPage({
  params,
}: {
  params: Promise<{ crop: string }>;
}) {
  const { crop } = await params;
  const decoded = decodeURIComponent(crop);
  const cropName = CROP_SLUG_TO_NAME[decoded] ?? decoded;

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* 상단: 뒤로가기 + 제목 + AI 버튼 */}
      <header className="sticky top-0 z-10 border-b border-slate-100 bg-white/95 px-4 py-4 shadow-sm backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
            aria-label="뒤로 가기"
          >
            <ArrowLeft className="h-4 w-4" />
            뒤로가기
          </Link>

          <h1 className="truncate text-center text-lg font-semibold sm:text-xl">
            현재 {cropName} 시세 현황
          </h1>

          <div className="w-[120px] shrink-0 sm:w-[180px]">
            <Link
              href={`/market/${crop}/ai-suggestion`}
              className="block rounded-xl bg-[#22c55e] px-3 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-[#1ea34e]"
            >
              AI 수익 최적화 제안받기
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        {/* 테이블 틀 */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
          <table className="w-full table-fixed border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 font-semibold text-slate-700">
                  공판장명
                </th>
                <th className="px-4 py-3 font-semibold text-slate-700">
                  법인명
                </th>
                <th className="px-4 py-3 font-semibold text-slate-700">
                  현재가(특)
                </th>
                <th className="px-4 py-3 font-semibold text-slate-700">
                  현재가(상)
                </th>
                <th className="px-4 py-3 font-semibold text-slate-700">
                  반입량
                </th>
              </tr>
            </thead>
            <tbody>
              {/* 데이터 행은 추후 추가 */}
              <tr className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-4 text-slate-500">-</td>
                <td className="px-4 py-4 text-slate-500">-</td>
                <td className="px-4 py-4 text-slate-500">-</td>
                <td className="px-4 py-4 text-slate-500">-</td>
                <td className="px-4 py-4 text-slate-500">-</td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
