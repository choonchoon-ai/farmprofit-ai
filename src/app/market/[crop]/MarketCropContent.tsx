"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar } from "lucide-react";
import type { MarketRow } from "./market-data";
import { parseMarketPriceApiResponse } from "./market-data";
import PaprikaDashboard from "./Dashboard";

type RawMarketPriceItem = {
  date?: string;
  time?: string;
  market?: string;
  company?: string;
  variety?: string;
  unit?: string;
  volume?: string | number;
  price?: number;
};

/** 오늘 날짜를 input[type=date]용 YYYY-MM-DD로 */
function getTodayInputValue(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** YYYY-MM-DD → API용 YYYYMMDD */
function toSDate(inputValue: string): string {
  return inputValue.replace(/-/g, "");
}

type MarketCropContentProps = {
  crop: string;
  cropName: string;
  initialMarketRows: MarketRow[];
};


export function MarketCropContent({
  crop,
  cropName,
  initialMarketRows,
}: MarketCropContentProps) {
  const [marketRows, setMarketRows] = useState<MarketRow[]>(initialMarketRows);
  const [rawTableData, setRawTableData] = useState<RawMarketPriceItem[]>([]);
  const [loading, setLoading] = useState(crop === "paprica");
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(getTodayInputValue);

  useEffect(() => {
    if (crop !== "paprica") return;

    const sDate = toSDate(selectedDate);
    setLoading(true);
    setError(null);

    fetch("/api/market-price", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ saleDate: sDate, smallCd: "" }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.error) {
          setError(data.error);
          return;
        }
        const raw: RawMarketPriceItem[] = Array.isArray(data) ? data : [];
        setRawTableData(raw);
        const rows = parseMarketPriceApiResponse(data);
        setMarketRows(rows.length > 0 ? rows : initialMarketRows);
      })
      .catch(() => setError("데이터를 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, [crop, selectedDate, initialMarketRows]);

  return (
    <>
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
          <div className="w-[120px] shrink-0 sm:w-[180px]" aria-hidden />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 space-y-8">
        {/* 날짜 선택 (파프리카 시 세일 날짜 조회) */}
        {crop === "paprica" && (
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Calendar className="h-4 w-4 text-slate-500" />
              조회일
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={getTodayInputValue()}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none"
              aria-label="시세 조회 날짜 선택"
            />
          </div>
        )}

        {crop === "paprica" && rawTableData.length > 0 && !loading && (
          <PaprikaDashboard rawData={rawTableData} />
        )}
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
              {loading ? (
                <tr className="border-b border-slate-100">
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    시세 데이터를 불러오는 중…
                  </td>
                </tr>
              ) : error ? (
                <tr className="border-b border-slate-100">
                  <td colSpan={5} className="px-4 py-8 text-center text-amber-600">
                    {error}
                  </td>
                </tr>
              ) : marketRows.length > 0 ? (
                marketRows.map((row, i) => (
                  <tr
                    key={`${row.marketName}-${row.corporationName}-${i}`}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="px-4 py-4 text-slate-800">{row.marketName}</td>
                    <td className="px-4 py-4 text-slate-800">
                      {row.corporationName}
                    </td>
                    <td className="px-4 py-4 text-slate-800">
                      {row.priceSpecial.toLocaleString()}원
                    </td>
                    <td className="px-4 py-4 text-slate-800">
                      {row.priceRegular.toLocaleString()}원
                    </td>
                    <td className="px-4 py-4 text-slate-800">
                      {row.quantity.toLocaleString()}kg
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-4 text-slate-500">-</td>
                  <td className="px-4 py-4 text-slate-500">-</td>
                  <td className="px-4 py-4 text-slate-500">-</td>
                  <td className="px-4 py-4 text-slate-500">-</td>
                  <td className="px-4 py-4 text-slate-500">-</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
