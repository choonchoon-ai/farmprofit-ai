/** API 응답의 가격/물량 등이 문자열일 수 있으므로 숫자로 통일 */
export function toNumber(value: unknown): number {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  if (value == null) return 0;
  const s = String(value).replace(/,/g, "").trim();
  const n = parseFloat(s);
  return Number.isNaN(n) ? 0 : n;
}

/** 법인(공판장) 한 행 데이터 */
export interface MarketRow {
  /** 공판장명 */
  marketName: string;
  /** 법인명 */
  corporationName: string;
  /** 현재가(특) 원/kg */
  priceSpecial: number;
  /** 현재가(상) 원/kg */
  priceRegular: number;
  /** 반입량 kg */
  quantity: number;
  /** 운송비 원 */
  transportCost: number;
  /** 수수료 원 */
  fee: number;
}

/**
 * 순이익 = (가격 × 수량) - (운송비 + 수수료)
 * 가격은 현재가(특) 사용
 */
export function getNetProfit(row: MarketRow): number {
  const revenue = row.priceSpecial * row.quantity;
  const costs = row.transportCost + row.fee;
  return revenue - costs;
}

/** 작물별 샘플 시세 데이터 (실제 연동 시 API로 교체) */
export const SAMPLE_MARKET_DATA: Record<string, MarketRow[]> = {
  paprica: [
    {
      marketName: "가락시장",
      corporationName: "중앙청과",
      priceSpecial: 12500,
      priceRegular: 9800,
      quantity: 200,
      transportCost: 45000,
      fee: 12000,
    },
    {
      marketName: "부산",
      corporationName: "엄궁",
      priceSpecial: 11800,
      priceRegular: 9200,
      quantity: 200,
      transportCost: 82000,
      fee: 11500,
    },
    {
      marketName: "대구",
      corporationName: "서부시장",
      priceSpecial: 12200,
      priceRegular: 9500,
      quantity: 200,
      transportCost: 68000,
      fee: 11800,
    },
    {
      marketName: "청과물시장",
      corporationName: "강남청과",
      priceSpecial: 12000,
      priceRegular: 9400,
      quantity: 200,
      transportCost: 38000,
      fee: 11000,
    },
  ],
  strawberry: [
    {
      marketName: "가락시장",
      corporationName: "중앙청과",
      priceSpecial: 18500,
      priceRegular: 15200,
      quantity: 150,
      transportCost: 42000,
      fee: 14000,
    },
    {
      marketName: "부산",
      corporationName: "엄궁",
      priceSpecial: 17800,
      priceRegular: 14800,
      quantity: 150,
      transportCost: 75000,
      fee: 13200,
    },
  ],
  tomato: [
    {
      marketName: "가락시장",
      corporationName: "중앙청과",
      priceSpecial: 4200,
      priceRegular: 3500,
      quantity: 500,
      transportCost: 55000,
      fee: 18000,
    },
    {
      marketName: "부산",
      corporationName: "엄궁",
      priceSpecial: 4000,
      priceRegular: 3300,
      quantity: 500,
      transportCost: 92000,
      fee: 17000,
    },
  ],
  cucumber: [
    {
      marketName: "가락시장",
      corporationName: "중앙청과",
      priceSpecial: 3200,
      priceRegular: 2800,
      quantity: 400,
      transportCost: 48000,
      fee: 15000,
    },
    {
      marketName: "부산",
      corporationName: "엄궁",
      priceSpecial: 3100,
      priceRegular: 2700,
      quantity: 400,
      transportCost: 85000,
      fee: 14500,
    },
  ],
  pepper: [
    {
      marketName: "가락시장",
      corporationName: "중앙청과",
      priceSpecial: 9800,
      priceRegular: 8200,
      quantity: 180,
      transportCost: 44000,
      fee: 12500,
    },
    {
      marketName: "부산",
      corporationName: "엄궁",
      priceSpecial: 9500,
      priceRegular: 8000,
      quantity: 180,
      transportCost: 78000,
      fee: 12000,
    },
  ],
};

export function getMarketDataForCrop(cropSlug: string): MarketRow[] {
  return (
    SAMPLE_MARKET_DATA[cropSlug] ??
    SAMPLE_MARKET_DATA.paprica.map((row) => ({ ...row }))
  );
}

/** /api/market-price 응답에서 리스트 추출 (구조에 따라 배열 반환) */
function getListFromApiResponse(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    const o = data as Record<string, unknown>;
    if (Array.isArray(o.list)) return o.list;
    if (Array.isArray(o.data)) return o.data;
    if (Array.isArray(o.sanList)) return o.sanList;
    if (Array.isArray(o.result)) return o.result;
  }
  return [];
}

/** API 한 건: cmpName, whsalName, cost, qty 등 (필드명은 응답에 맞게 조정 가능) */
type ApiRow = Record<string, unknown>;

/** API 응답 배열을 MarketRow[]로 변환. cost, qty는 문자열이면 숫자로 변환. 운송비/수수료는 미제공 시 0 */
export function parseMarketPriceApiResponse(data: unknown): MarketRow[] {
  const list = getListFromApiResponse(data);
  return list.map((item) => {
    const row = (item ?? {}) as ApiRow;
    const cost = toNumber(row.cost ?? row.price ?? row.currPrice ?? 0);
    const qty = toNumber(row.qty ?? row.quantity ?? row.volume ?? row.vol ?? 0);
    return {
      marketName: String(row.market ?? row.whsalName ?? row.whsal ?? row.marketName ?? "").trim() || "-",
      corporationName: String(row.company ?? row.cmpName ?? row.cmp ?? row.corporationName ?? "").trim() || "-",
      priceSpecial: cost,
      priceRegular: cost,
      quantity: qty,
      transportCost: toNumber(row.transportCost ?? row.transport ?? 0),
      fee: toNumber(row.fee ?? 0),
    };
  }).filter((r) => r.marketName !== "-" || r.corporationName !== "-");
}
