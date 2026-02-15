'use client';

import React, { useMemo, useState } from 'react';
import { Search, MapPin, Layers, BarChart3, Sparkles, X, CheckCircle2, AlertCircle } from 'lucide-react';

const TYPE_STYLES: Record<string, { label: string; color: string; icon: string; btnActive: string }> = {
  '빨강파프리카': { label: '빨강', color: 'rose', icon: '🌶️', btnActive: 'bg-rose-500 text-white ring-rose-200' },
  '노랑파프리카': { label: '노랑', color: 'amber', icon: '🍋', btnActive: 'bg-amber-500 text-white ring-amber-200' },
  '오렌지파프리카': { label: '오렌지', color: 'orange', icon: '🍊', btnActive: 'bg-orange-500 text-white ring-orange-200' },
  '파프리카(일반)': { label: '일반', color: 'indigo', icon: '📦', btnActive: 'bg-indigo-500 text-white ring-indigo-200' },
  '파프리카': { label: '기타', color: 'slate', icon: '🌿', btnActive: 'bg-slate-500 text-white ring-slate-200' },
};

const COLOR_CLASSES: Record<string, { bg: string; border: string; text: string; borderL: string; textAccent: string; badge: string; minMax: string }> = {
  rose: { bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-700', borderL: 'border-l-4 border-rose-400', textAccent: 'text-rose-600', badge: 'bg-white text-rose-600 border-rose-200', minMax: 'text-rose-400' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-700', borderL: 'border-l-4 border-amber-400', textAccent: 'text-amber-600', badge: 'bg-white text-amber-600 border-amber-200', minMax: 'text-amber-400' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-100', text: 'text-orange-700', borderL: 'border-l-4 border-orange-400', textAccent: 'text-orange-600', badge: 'bg-white text-orange-600 border-orange-200', minMax: 'text-orange-400' },
  indigo: { bg: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-700', borderL: 'border-l-4 border-indigo-400', textAccent: 'text-indigo-600', badge: 'bg-white text-indigo-600 border-indigo-200', minMax: 'text-indigo-400' },
  slate: { bg: 'bg-slate-50', border: 'border-slate-100', text: 'text-slate-700', borderL: 'border-l-4 border-slate-400', textAccent: 'text-slate-600', badge: 'bg-white text-slate-600 border-slate-200', minMax: 'text-slate-400' },
};

type RawDataItem = {
  market?: string;
  company?: string;
  variety?: string;
  origin?: string;
  volume?: string | number;
  price?: number | string;
};

type StatItem = {
  name: string;
  market: string;
  totalAmount: number;
  totalVolume: number;
  minPrice: number;
  maxPrice: number;
};

export default function PaprikaDashboard({ rawData }: { rawData: RawDataItem[] }) {
  const [viewMode, setViewMode] = useState<'CORP' | 'ORIGIN'>('CORP');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedRegions, setSelectedRegions] = useState<string[]>(['ALL']);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCorp, setSelectedCorp] = useState<{ market: string; name: string } | null>(null);

  const aiRecommendation = {
    bestMarket: '진주원협(공)',
    expectedProfit: '+154,000원',
    reason:
      '현재 타 공판장 대비 반입량이 적어 경락가가 상향 유지 중입니다. 사장님 농장에서의 거리 대비 운송 효율이 가장 높습니다.',
    tip: '오전 10시 이전 입고 시 낙찰 확률이 15% 상승합니다.',
  };

  const availableRegions = useMemo(() => {
    const regions = new Set<string>();
    rawData.forEach((item) => {
      if (item.market) regions.add(item.market.substring(0, 2));
    });
    return Array.from(regions).sort();
  }, [rawData]);

  const filteredStats = useMemo(() => {
    const stats: Record<string, Record<string, StatItem>> = {};

    rawData.forEach((item) => {
      const region = item.market?.substring(0, 2);
      const type = item.variety || '파프리카';

      if (selectedType !== 'ALL' && selectedType !== type) return;
      if (!selectedRegions.includes('ALL') && region && !selectedRegions.includes(region)) return;
      if (searchTerm && !(item.company?.includes(searchTerm) || item.origin?.includes(searchTerm))) return;

      if (!stats[type]) stats[type] = {};

      const key = viewMode === 'CORP' ? `${item.market} ${item.company}` : (item.origin?.split(' ')[0] || '기타');

      if (!stats[type][key]) {
        stats[type][key] = {
          name: viewMode === 'CORP' ? (item.company ?? '') : key,
          market: item.market ?? '',
          totalAmount: 0,
          totalVolume: 0,
          minPrice: Infinity,
          maxPrice: -Infinity,
        };
      }

      const price = typeof item.price === 'string' ? parseInt(item.price.replace(/,/g, ''), 10) : Number(item.price) || 0;
      const volume = parseInt(String(item.volume ?? 0), 10) || 0;

      stats[type][key].totalAmount += price * volume;
      stats[type][key].totalVolume += volume;
      stats[type][key].minPrice = Math.min(stats[type][key].minPrice, price);
      stats[type][key].maxPrice = Math.max(stats[type][key].maxPrice, price);
    });

    return stats;
  }, [rawData, viewMode, selectedType, selectedRegions, searchTerm]);

  /** 선택한 법인의 가격 분포 계산 (물량 kg 기준) */
  const corpPriceDistribution = useMemo(() => {
    if (!selectedCorp) return null;
    const items = rawData.filter(
      (item) => item.market === selectedCorp.market && item.company === selectedCorp.name
    );
    const withVol = items.map((item) => ({
      price: typeof item.price === 'string' ? parseInt(item.price.replace(/,/g, ''), 10) : Number(item.price),
      vol: parseInt(String(item.volume ?? 0), 10) || 0,
    })).filter((x) => Number.isFinite(x.price) && x.price > 0 && x.vol > 0);
    if (withVol.length === 0) return { min: 0, max: 0, avg: 0, totalKg: 0, buckets: [] as { label: string; kg: number; pct: number }[] };

    const prices = withVol.map((x) => x.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const totalKg = withVol.reduce((a, x) => a + x.vol, 0);
    const avg = totalKg > 0 ? Math.round(withVol.reduce((a, x) => a + x.price * x.vol, 0) / totalKg) : Math.round((min + max) / 2);
    const step = Math.max(500, Math.ceil((max - min) / 8));
    const bucketKg: number[] = [];
    const bucketLabels: string[] = [];
    for (let low = min; low <= max; low += step) {
      bucketLabels.push(`${(low / 10000).toFixed(1)}만~${((low + step) / 10000).toFixed(1)}만`);
      bucketKg.push(0);
    }
    withVol.forEach(({ price, vol }) => {
      const idx = Math.min(Math.floor((price - min) / step), bucketKg.length - 1);
      if (idx >= 0) bucketKg[idx] += vol;
    });
    const buckets = bucketLabels
      .map((label, i) => ({ label, kg: bucketKg[i], pct: totalKg > 0 ? (bucketKg[i] / totalKg) * 100 : 0 }))
      .filter((b) => b.kg > 0);

    return { min, max, avg, totalKg, buckets };
  }, [rawData, selectedCorp]);

  /** 법인별 가격 분포 미리보기 (리스트용, kg 비율 5구간) */
  const corpPreviewBars = useMemo(() => {
    const map = new Map<string, number[]>();
    const corpKeys = new Set<string>();
    Object.values(filteredStats).forEach((items) => {
      Object.values(items).forEach((data: StatItem) => {
        corpKeys.add(`${data.market}|${data.name}`);
      });
    });
    corpKeys.forEach((key) => {
      const [market, name] = key.split('|');
      const items = rawData.filter((i) => i.market === market && i.company === name);
      const withVol = items.map((item) => ({
        price: typeof item.price === 'string' ? parseInt(item.price.replace(/,/g, ''), 10) : Number(item.price),
        vol: parseInt(String(item.volume ?? 0), 10) || 0,
      })).filter((x) => Number.isFinite(x.price) && x.price > 0 && x.vol > 0);
      if (withVol.length === 0) {
        map.set(key, []);
        return;
      }
      const min = Math.min(...withVol.map((x) => x.price));
      const max = Math.max(...withVol.map((x) => x.price));
      const totalKg = withVol.reduce((a, x) => a + x.vol, 0);
      const step = (max - min) / 5 || 1;
      const bucketKg = [0, 0, 0, 0, 0];
      withVol.forEach(({ price, vol }) => {
        const idx = Math.min(Math.floor((price - min) / step), 4);
        if (idx >= 0) bucketKg[idx] += vol;
      });
      const pcts = totalKg > 0 ? bucketKg.map((kg) => (kg / totalKg) * 100) : [0, 0, 0, 0, 0];
      map.set(key, pcts);
    });
    return map;
  }, [rawData, filteredStats]);

  const toggleRegion = (region: string) => {
    if (region === 'ALL') {
      setSelectedRegions(['ALL']);
    } else {
      const newRegions = selectedRegions.filter((r) => r !== 'ALL');
      if (newRegions.includes(region)) {
        const filtered = newRegions.filter((r) => r !== region);
        setSelectedRegions(filtered.length === 0 ? ['ALL'] : filtered);
      } else {
        setSelectedRegions([...newRegions, region]);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6 relative">
      {/* 상단 컨트롤 섹션 */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            <span className="bg-green-100 text-green-600 p-2.5 rounded-2xl">
              <BarChart3 className="w-6 h-6" />
            </span>
            FarmProfit 시세분석
          </h1>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white px-5 py-2 rounded-xl font-bold shadow-lg shadow-green-100 hover:scale-105 transition-all active:scale-95 whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4" />
              AI 수익 최적화 제안
            </button>
            <div className="bg-slate-100 p-1.5 rounded-xl flex w-full md:w-auto">
              <button
                type="button"
                onClick={() => setViewMode('CORP')}
                className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'CORP' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                법인별
              </button>
              <button
                type="button"
                onClick={() => setViewMode('ORIGIN')}
                className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'ORIGIN' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                출하지별
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-50">
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Layers className="w-3 h-3" /> 품목 필터
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedType('ALL')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${selectedType === 'ALL' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
              >
                전체
              </button>
              {Object.keys(TYPE_STYLES).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedType(type)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${selectedType === type ? TYPE_STYLES[type].btnActive + ' border-transparent' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
                >
                  {TYPE_STYLES[type].icon} {TYPE_STYLES[type].label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <MapPin className="w-3 h-3" /> 지역 필터
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => toggleRegion('ALL')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${selectedRegions.includes('ALL') ? 'bg-green-600 text-white border-green-600' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
              >
                전국
              </button>
              {availableRegions.map((region) => (
                <button
                  key={region}
                  type="button"
                  onClick={() => toggleRegion(region)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${selectedRegions.includes(region) ? 'bg-green-500 text-white border-green-500' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="relative pt-2">
          <Search className="absolute left-3 bottom-3 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="법인명 또는 산지 키워드 검색..."
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* 대시보드 리스트 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(filteredStats).map(([type, items]) => {
          const style = TYPE_STYLES[type] ?? TYPE_STYLES['파프리카'];
          const colorClasses = COLOR_CLASSES[style.color] ?? COLOR_CLASSES.slate;
          const companies = Object.values(items);

          companies.sort((a, b) => {
            const avgA = a.totalVolume > 0 ? a.totalAmount / a.totalVolume : 0;
            const avgB = b.totalVolume > 0 ? b.totalAmount / b.totalVolume : 0;
            return avgB - avgA;
          });

          if (companies.length === 0) return null;

          return (
            <div
              key={type}
              className="bg-white rounded-3xl shadow-md border border-slate-100 overflow-hidden flex flex-col"
            >
              <div className={`px-5 py-3 flex justify-between items-center border-b ${colorClasses.bg} ${colorClasses.border}`}>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{style.icon}</span>
                  <h3 className={`text-lg font-extrabold ${colorClasses.text}`}>{type}</h3>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border shadow-sm ${colorClasses.badge}`}>
                  {companies.length}개 {viewMode === 'CORP' ? '법인' : '출하지'}
                </span>
              </div>

              <div className="p-3 space-y-3">
                {companies.map((data, i) => {
                  const avgPrice = data.totalVolume > 0 ? Math.round(data.totalAmount / data.totalVolume) : 0;
                  const isFirst = i === 0;
                  const minDisplay = data.minPrice === Infinity ? '-' : data.minPrice.toLocaleString();
                  const maxDisplay = data.maxPrice === -Infinity ? '-' : data.maxPrice.toLocaleString();

                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedCorp({ market: data.market, name: data.name })}
                      className={`group relative flex w-full justify-between items-center p-4 rounded-2xl transition-all hover:bg-slate-50 text-left cursor-pointer ${colorClasses.borderL} ${isFirst ? 'bg-slate-50/50' : 'bg-white'}`}
                    >
                      {isFirst && (
                        <div className="absolute -top-2 -left-2 bg-yellow-400 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm">
                          BEST
                        </div>
                      )}
                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] text-slate-400 font-bold px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200 shrink-0">
                            {data.market}
                          </span>
                          <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 truncate">
                            {data.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 mb-1.5">
                          <span className="flex items-center gap-1 shrink-0">
                            <Layers className="w-3 h-3" /> {Math.round(data.totalVolume).toLocaleString()}kg
                          </span>
                        </div>
                        {/* 가격 분포 미리보기 */}
                        {(() => {
                          const pcts = corpPreviewBars.get(`${data.market}|${data.name}`) ?? [];
                          if (pcts.length === 0) return null;
                          return (
                            <div className="flex h-1.5 w-full max-w-[140px] rounded-full overflow-hidden bg-slate-100" title="가격대별 물량 분포">
                              {pcts.map((pct, j) => (
                                <div
                                  key={j}
                                  className="h-full bg-green-500/80 transition-opacity hover:opacity-100"
                                  style={{ width: `${Math.max(pct, 2)}%` }}
                                />
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                      <div className="text-right">
                        <div className={`text-xl font-black text-slate-800 ${isFirst ? colorClasses.textAccent : ''}`}>
                          {avgPrice.toLocaleString()}
                          <span className="text-xs font-medium text-slate-400 ml-1">원</span>
                        </div>
                        <div className="flex items-center justify-end gap-2 mt-1">
                          <span className="text-[10px] text-blue-400 font-medium">min {minDisplay}</span>
                          <span className={`text-[10px] ${colorClasses.minMax} font-medium`}>max {maxDisplay}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* 법인 가격 분포 모달 */}
      {selectedCorp && corpPriceDistribution && (
        <div className="fixed inset-0 w-full h-full flex items-center justify-center p-4 z-[90]">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setSelectedCorp(null)}
            aria-hidden
          />
          <div
            className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-1.5 bg-gradient-to-r from-slate-400 to-slate-500" />
            <div className="p-6 overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg font-black text-slate-800">가격 분포</h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {selectedCorp.market} · {selectedCorp.name}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCorp(null)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                  aria-label="닫기"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">최저가</div>
                  <div className="text-base font-black text-slate-800">{corpPriceDistribution.min.toLocaleString()}원</div>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">최고가</div>
                  <div className="text-base font-black text-slate-800">{corpPriceDistribution.max.toLocaleString()}원</div>
                </div>
                <div className="bg-green-50 rounded-xl p-3 text-center">
                  <div className="text-[10px] font-bold text-green-600 uppercase">평균가</div>
                  <div className="text-base font-black text-green-700">{corpPriceDistribution.avg.toLocaleString()}원</div>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">총 물량</div>
                  <div className="text-base font-black text-slate-800">{corpPriceDistribution.totalKg.toLocaleString()}kg</div>
                </div>
              </div>

              {corpPriceDistribution.buckets.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">가격대별 물량(kg)</h3>
                  <div className="space-y-2">
                    {corpPriceDistribution.buckets.map((b) => (
                      <div key={b.label} className="flex items-center gap-3">
                        <span className="text-xs font-medium text-slate-600 w-24 shrink-0">{b.label}</span>
                        <div className="flex-1 h-6 bg-slate-100 rounded-lg overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-lg transition-all min-w-[4px]"
                            style={{ width: `${Math.max(b.pct, 2)}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-500 w-14 text-right">{b.kg.toLocaleString()}kg</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => setSelectedCorp(null)}
                className="mt-6 w-full py-3 rounded-xl bg-slate-800 text-white text-sm font-bold hover:bg-slate-700 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI 수익 제안 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 w-full h-full flex items-center justify-center p-4 z-[100]">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsModalOpen(false)}
            aria-hidden
          />
          <div
            className="relative bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-2 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500" />
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="bg-green-100 p-3 rounded-2xl">
                  <Sparkles className="w-6 h-6 text-green-600" />
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                  aria-label="닫기"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-800 mb-2">AI 수익 최적화 리포트</h2>
                  <p className="text-slate-500 text-sm">실시간 시황과 물류비를 분석한 결과입니다.</p>
                </div>

                <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">추천 출하처</span>
                    <span className="bg-green-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">BEST</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="text-3xl font-black text-slate-800">{aiRecommendation.bestMarket}</div>
                    <div className="text-green-600 font-black text-lg">
                      {aiRecommendation.expectedProfit}{' '}
                      <span className="text-xs text-slate-400">추가수익</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-slate-600 leading-relaxed">{aiRecommendation.reason}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-slate-600 leading-relaxed font-semibold italic">
                      💡 {aiRecommendation.tip}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                >
                  분석 결과 확인 완료
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
