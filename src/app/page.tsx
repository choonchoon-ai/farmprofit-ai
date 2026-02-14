"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Cherry,
  CircleDot,
  Flame,
  Leaf,
  LogIn,
  Search,
  Sprout,
} from "lucide-react";

const ACCENT = "#22c55e";

const CROPS = [
  { name: "파프리카", slug: "paprica", icon: Sprout },
  { name: "딸기", slug: "strawberry", icon: Cherry },
  { name: "토마토", slug: "tomato", icon: CircleDot },
  { name: "오이", slug: "cucumber", icon: Leaf },
  { name: "고추", slug: "pepper", icon: Flame },
] as const;

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      const slug = CROPS.find(
        (c) => c.name === trimmed || c.slug === trimmed.toLowerCase()
      )?.slug ?? encodeURIComponent(trimmed);
      router.push(`/market/${slug}`);
    }
  };

  const handleCropClick = (slug: string) => {
    router.push(`/market/${slug}`);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-4 py-4 shadow-sm backdrop-blur sm:px-6 md:px-8">
        <div className="flex items-center gap-2">
          <span
            className="text-xl font-bold tracking-tight sm:text-2xl"
            style={{ color: ACCENT }}
          >
            FarmProfit AI
          </span>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-[#22c55e]/40 hover:bg-slate-50 hover:text-[#22c55e] focus:outline-none focus:ring-2 focus:ring-[#22c55e]/30"
          onClick={() => router.push("/login")}
        >
          <LogIn className="h-4 w-4" />
          로그인
        </button>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 md:px-8">
        {/* Hero */}
        <section className="mb-14 text-center">
          <h1 className="mb-6 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
            어떤 작물을 출하하시나요?
          </h1>
          <form onSubmit={handleSearch} className="mx-auto max-w-xl">
            <div className="relative flex items-center rounded-2xl border border-slate-200 bg-slate-50/80 shadow-sm transition focus-within:border-[#22c55e] focus-within:ring-2 focus-within:ring-[#22c55e]/20">
              <Search
                className="ml-4 h-5 w-5 shrink-0 text-slate-400"
                aria-hidden
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="작물명 검색 (예: 파프리카, 딸기)"
                className="w-full border-0 bg-transparent py-4 pl-3 pr-4 text-slate-900 placeholder-slate-400 outline-none"
                aria-label="작물 검색"
              />
              <button
                type="submit"
                className="mr-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/30"
                style={{ backgroundColor: ACCENT }}
              >
                검색
              </button>
            </div>
          </form>
        </section>

        {/* 인기 작물 그리드 */}
        <section>
          <h2 className="mb-6 text-xl font-semibold text-slate-900 sm:text-2xl">
            인기 작물
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 md:grid-cols-5">
            {CROPS.map(({ name, slug, icon: Icon }) => (
              <button
                key={slug}
                type="button"
                onClick={() => handleCropClick(slug)}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-slate-100 bg-white p-5 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-[#22c55e]/30 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#22c55e]/30"
              >
                <span
                  className="flex h-14 w-14 items-center justify-center rounded-2xl transition group-hover:scale-105"
                  style={{ backgroundColor: `${ACCENT}14` }}
                >
                  <Icon
                    className="h-7 w-7"
                    style={{ color: ACCENT }}
                    aria-hidden
                  />
                </span>
                <span className="font-medium text-slate-800 group-hover:text-[#22c55e]">
                  {name}
                </span>
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
