"use client";

import { useState, useCallback } from "react";
import { X } from "lucide-react";
import type { MarketRow } from "./market-data";
import { getNetProfit } from "./market-data";

type AiSuggestionModalProps = {
  marketRows: MarketRow[];
  cropName: string;
};

type Recommendation = {
  best: MarketRow;
  bestProfit: number;
  compareTo: MarketRow | null;
  profitDiff: number;
};

function computeRecommendation(rows: MarketRow[]): Recommendation | null {
  if (rows.length === 0) return null;
  const withProfit = rows.map((row) => ({
    row,
    profit: getNetProfit(row),
  }));
  withProfit.sort((a, b) => b.profit - a.profit);
  const best = withProfit[0];
  const second = withProfit[1] ?? null;
  return {
    best: best.row,
    bestProfit: best.profit,
    compareTo: second?.row ?? null,
    profitDiff: second ? best.profit - second.profit : 0,
  };
}

function formatWon(n: number): string {
  return new Intl.NumberFormat("ko-KR").format(n) + "원";
}

export function AiSuggestionModal({ marketRows, cropName }: AiSuggestionModalProps) {
  const [open, setOpen] = useState(false);
  const recommendation = open ? computeRecommendation(marketRows) : null;

  const handleOpen = useCallback(() => {
    if (marketRows.length > 0) setOpen(true);
  }, [marketRows.length]);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="block w-full rounded-xl bg-[#22c55e] px-3 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-[#1ea34e]"
      >
        AI 수익 최적화 제안받기
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ai-suggestion-title"
          onClick={handleClose}
        >
          <div className="flex min-h-full items-center justify-center py-8">
            <div
              className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl sm:p-8"
              onClick={(e) => e.stopPropagation()}
            >
            <button
              type="button"
              onClick={handleClose}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              aria-label="닫기"
            >
              <X className="h-5 w-5" />
            </button>

            <h2
              id="ai-suggestion-title"
              className="mb-2 text-lg font-semibold text-slate-800"
            >
              AI 수익 최적화 제안
            </h2>

            {recommendation ? (
              <>
                {/* 최고 순이익 법인 — 상단 크게 */}
                <div className="mb-6 rounded-xl bg-[#22c55e]/10 p-5">
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[#22c55e]">
                    최적 출하지
                  </p>
                  <p className="text-2xl font-bold text-slate-900 sm:text-3xl">
                    {recommendation.best.marketName} {recommendation.best.corporationName}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    예상 순이익{" "}
                    <span className="font-semibold text-[#22c55e]">
                      {formatWon(recommendation.bestProfit)}
                    </span>
                  </p>
                </div>

                {/* 구체적 문구 */}
                <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 text-slate-700">
                  {recommendation.compareTo && recommendation.profitDiff > 0 ? (
                    <p className="leading-relaxed">
                      오늘{" "}
                      <strong className="text-slate-900">
                        {recommendation.best.marketName} {recommendation.best.corporationName}
                      </strong>
                      에 출하하면{" "}
                      <strong className="text-slate-900">
                        {recommendation.compareTo.marketName} {recommendation.compareTo.corporationName}
                      </strong>
                      보다 약{" "}
                      <strong className="text-[#22c55e]">
                        {formatWon(recommendation.profitDiff)}
                      </strong>
                      의 수익이 더 발생합니다.
                    </p>
                  ) : (
                    <p className="leading-relaxed">
                      현재 데이터 기준,{" "}
                      <strong className="text-slate-900">
                        {recommendation.best.marketName} {recommendation.best.corporationName}
                      </strong>
                      이 {cropName} 출하 시 최적의 선택입니다.
                    </p>
                  )}
                </div>
              </>
            ) : (
              <p className="py-4 text-slate-500">출하 데이터가 없습니다.</p>
            )}

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
              >
                확인
              </button>
            </div>
          </div>
          </div>
        </div>
      )}

    </>
  );
}
